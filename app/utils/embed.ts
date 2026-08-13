/**
 * Resolves the "Embed media" field to something usable as an `<iframe src>`.
 *
 * The field accepts three things:
 *
 *   1. A plain link to a provider below — what is actually in someone's
 *      clipboard after they hit Share.
 *   2. A provider's own `<iframe>` embed code, pasted whole. This is the
 *      escape hatch: anything embeddable that is not recognised here still
 *      works if the user goes and fetches the real embed code.
 *   3. Instagram's `<blockquote>` embed, which is not an iframe at all.
 *
 * This lives in a .ts file rather than in Preview.vue because TypeScript
 * cannot check .vue files in this repo (see CLAUDE.md), and this is exactly
 * the string-shovelling that wants checking: the version it replaces asserted
 * its regex matches with `!` and threw on an `<iframe>` with no src.
 *
 * Returns null for anything unrecognised. Callers must surface that to the
 * user when the input was non-empty — rendering nothing at all is the bug this
 * was rewritten to fix, and it is invisible until someone loads the card.
 */

/** What the editor shows when a non-empty field resolves to nothing. */
export const EMBED_HINT =
  'Not a recognised embed. Paste a YouTube, Vimeo or Instagram link — or the embed code from any site that offers one.'

/**
 * Schemes allowed to reach an `<iframe src>`.
 *
 * Load-bearing, not defensive: this value is serialised into a static file the
 * user then publishes, so a pasted `src="javascript:..."` would ship to their
 * visitors. Only these two can be framed usefully anyway.
 */
const SAFE_PROTOCOLS = new Set(['http:', 'https:'])

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])

const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
  'instagr.am',
])

/** YouTube ids are exactly 11 URL-safe characters. */
const YOUTUBE_ID = /^[\w-]{11}$/
/** Vimeo ids are numeric. */
const VIMEO_ID = /^\d+$/
/** Instagram shortcodes are URL-safe, and vary in length. */
const INSTAGRAM_ID = /^[\w-]+$/

/**
 * Parses a URL, tolerating the scheme-less form people paste from the address
 * bar. Returns null rather than throwing, which is what `new URL` does.
 */
function parseURL(value: string): URL | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  // A bare `youtube.com/watch?v=x` is not a valid URL, but it is what a
  // browser's address bar shows and therefore what gets copied.
  const withScheme = /^[a-z][\w+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    return SAFE_PROTOCOLS.has(url.protocol) ? url : null
  } catch {
    return null
  }
}

/** Path segments with the empty strings from leading/trailing slashes dropped. */
function segments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean)
}

function youtubeEmbed(url: URL): string | null {
  const path = segments(url)
  let id: string | undefined
  if (url.hostname === 'youtu.be') {
    id = path[0]
  } else if (path[0] === 'watch') {
    id = url.searchParams.get('v') ?? undefined
  } else if (
    path[0] === 'embed' ||
    path[0] === 'shorts' ||
    path[0] === 'live'
  ) {
    id = path[1]
  }
  if (!id || !YOUTUBE_ID.test(id)) return null
  // youtube-nocookie is the same player without the tracking cookies, which
  // suits a card whose whole premise is not phoning home about its visitors.
  return `https://www.youtube-nocookie.com/embed/${id}`
}

function vimeoEmbed(url: URL): string | null {
  const path = segments(url)
  // player.vimeo.com/video/ID is already the embed form.
  const id = path[0] === 'video' ? path[1] : path[0]
  if (!id || !VIMEO_ID.test(id)) return null
  return `https://player.vimeo.com/video/${id}`
}

function instagramEmbed(url: URL): string | null {
  const path = segments(url)
  const kind = path[0]
  const id = path[1]
  if (kind !== 'p' && kind !== 'reel' && kind !== 'tv') return null
  if (!id || !INSTAGRAM_ID.test(id)) return null
  return `https://www.instagram.com/${kind}/${id}/embed/captioned`
}

/** Maps a supported provider link to its embed URL. */
function providerEmbed(value: string): string | null {
  const url = parseURL(value)
  if (!url) return null
  const host = url.hostname.toLowerCase()
  if (host === 'youtu.be' || YOUTUBE_HOSTS.has(host)) return youtubeEmbed(url)
  if (VIMEO_HOSTS.has(host)) return vimeoEmbed(url)
  if (INSTAGRAM_HOSTS.has(host)) return instagramEmbed(url)
  return null
}

/**
 * Pulls the src out of a pasted `<iframe>`.
 *
 * `[\s\S]` rather than `.` because embed codes are frequently pasted across
 * several lines, and `.` stops at a newline. Both quoted and bare src values
 * appear in the wild.
 */
function iframeEmbed(value: string): string | null {
  if (!/<iframe[\s\S]*?<\/iframe>/i.test(value)) return null
  const tag = value.match(/<iframe[\s\S]*?<\/iframe>/i)![0]
  // No src is malformed rather than unsupported, but it reaches us the same
  // way and must not throw: this is where the previous version died.
  const src = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  const raw = src?.[1] ?? src?.[2] ?? src?.[3]
  if (!raw) return null
  // A protocol-relative //host/path src is common in embed codes and resolves
  // fine against the hosted card, but parseURL needs a scheme to judge it.
  const url = parseURL(raw.startsWith('//') ? `https:${raw}` : raw)
  return url ? url.href : null
}

/**
 * Instagram's blockquote embed, which carries the permalink in an attribute
 * and relies on their embed.js to swap itself for an iframe. We take the
 * permalink and build the iframe ourselves, so no third-party script runs.
 */
function instagramBlockquote(value: string): string | null {
  if (!/\/\/www\.instagram\.com\/embed\.js/.test(value)) return null
  const permalink = value.match(/data-instgrm-permalink="([^"]*)"/)?.[1]
  if (!permalink) return null
  return providerEmbed(permalink)
}

/**
 * Resolves a pasted embed to an iframe src, or null if nothing is recognised.
 *
 * Provider links are tried first because they are the common case and cheap to
 * judge; the iframe and blockquote paths only matter for pasted markup.
 */
export function resolveEmbed(value: string): string | null {
  if (!value.trim()) return null
  return (
    providerEmbed(value) ?? iframeEmbed(value) ?? instagramBlockquote(value)
  )
}
