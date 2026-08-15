/**
 * Reading a downloaded card back into the editor.
 *
 * The counterpart to manifest.ts: that module writes `card.json` into the
 * export, this one turns a downloaded zip — or the unzipped folder — back into
 * editor state. Nothing is scraped out of `index.html`; the manifest is the
 * only thing read, which is what lets Preview.vue keep changing shape.
 *
 * **A manifest is untrusted input.** It is JSON from a file the user picked,
 * and a card can be passed around — the whole point of team cards is that
 * someone else made it. Everything that reaches the DOM, the CSS or the
 * exported page is re-validated here rather than trusted because it came from
 * a file this app wrote: colours must be hex, a custom icon goes back through
 * `sanitiseSVG()` before it can reach `v-html`, and a hosted URL must be
 * http(s). The rest is shape-checked so a malformed file fails with a message
 * instead of half-loading and leaving the editor in a state the user cannot
 * explain.
 *
 * Reading happens entirely in the browser. No part of an imported card is sent
 * anywhere.
 */

import type {
  CardColours,
  CardImage,
  CardImages,
  ColourSlot,
  FeaturedContent,
  FeaturedSection,
  ImageSlot,
  PrimaryAction,
  SecondaryAction,
  ThemeId,
} from '~/types/card'
import { MANIFEST_FILE, MANIFEST_VERSION } from '~/utils/manifest'
import type {
  CardManifest,
  ManifestContent,
  ManifestMedia,
  ManifestProduct,
} from '~/utils/manifest'
import { sanitiseSVG } from '~/utils/svg'
import JSZip from 'jszip'

/** A failure with a message meant to be shown to the user as-is. */
export class ImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportError'
  }
}

function fail(message: string): never {
  throw new ImportError(message)
}

/** The files of one exported card, keyed by path relative to the card folder. */
export type CardFiles = Map<string, Blob>

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const THEMES = new Set<ThemeId>([1, 2, 3])

/**
 * Find the card folder in a set of paths and re-key everything relative to it.
 *
 * An export nests the card inside a folder named after the user, and the zip
 * also carries Hosting-Guide.html beside it — so neither the zip root nor the
 * folder the user picked is necessarily the card root. The manifest's own
 * location defines it: whatever directory holds `card.json` is the root, and
 * everything outside that directory is dropped.
 *
 * This is also the guard against a zip entry escaping the folder: paths are
 * rebuilt from the manifest's directory prefix, so an entry like
 * `../../etc/passwd` simply fails to match the prefix and is discarded rather
 * than being resolved.
 */
function rootedFiles(entries: Iterable<[string, Blob]>): CardFiles {
  const all = [...entries].map(
    ([path, blob]) => [path.replaceAll('\\', '/'), blob] as const,
  )
  const manifest = all.find(
    ([path]) => path === MANIFEST_FILE || path.endsWith(`/${MANIFEST_FILE}`),
  )
  if (!manifest)
    fail(
      `No ${MANIFEST_FILE} in there. Only cards exported by this version of EnBizCard can be opened again — older downloads do not carry one.`,
    )

  const prefix = manifest[0].slice(0, manifest[0].length - MANIFEST_FILE.length)
  const files: CardFiles = new Map()
  for (const [path, blob] of all) {
    if (!path.startsWith(prefix)) continue
    files.set(path.slice(prefix.length), blob)
  }
  return files
}

/** Read an exported .zip into its card files. */
export async function filesFromZip(file: Blob): Promise<CardFiles> {
  let zip: Awaited<ReturnType<typeof JSZip.loadAsync>>
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    fail('That file could not be read as a zip.')
  }
  // Decompressed together rather than one after another: a card with a dozen
  // photos is a dozen sequential awaits otherwise.
  const entries = await Promise.all(
    Object.values(zip.files)
      .filter((entry) => !entry.dir)
      .map(
        async (entry) =>
          [entry.name, await entry.async('blob')] as [string, Blob],
      ),
  )
  return rootedFiles(entries)
}

/**
 * Read a picked folder into its card files.
 *
 * `webkitRelativePath` is what a directory input reports; a plain multi-file
 * selection has none, in which case the bare name is the path and the card
 * must be the whole selection.
 */
export function filesFromFolder(files: readonly File[]): CardFiles {
  return rootedFiles(files.map((f) => [f.webkitRelativePath || f.name, f]))
}

/** Parse and version-check a manifest. */
export function parseManifest(text: string): CardManifest {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    fail(`${MANIFEST_FILE} is not valid JSON, so this card cannot be opened.`)
  }
  if (!data || typeof data !== 'object')
    fail(`${MANIFEST_FILE} does not describe a card.`)

  const manifest = data as Partial<CardManifest>
  const version = manifest.manifestVersion
  if (typeof version !== 'number' || !Number.isFinite(version))
    fail(`${MANIFEST_FILE} has no version, so this card cannot be opened.`)
  if (version > MANIFEST_VERSION)
    fail(
      `This card was saved by a newer version of EnBizCard (format ${version}, this one reads ${MANIFEST_VERSION}). Update the app, or export it again from the version that made it.`,
    )
  if (!Array.isArray(manifest.featured))
    fail(
      `${MANIFEST_FILE} is missing its content, so this card cannot be opened.`,
    )

  return manifest as CardManifest
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

/** Colours are interpolated straight into the card's CSS, so they must be hex. */
function restoreColours(
  source: CardManifest['colors'],
  defaults: CardColours,
): CardColours {
  const colors = {} as CardColours
  for (const slot of Object.keys(defaults) as ColourSlot[]) {
    const value = asString(source?.[slot])
    colors[slot] = {
      color: value && HEX.test(value) ? value : defaults[slot].color,
      openPalette: false,
    }
  }
  return colors
}

/**
 * A hosted URL ends up in the card's QR code and its canonical link, so an
 * unexpected scheme is dropped rather than carried into the next export.
 */
function restoreHostedURL(value: unknown): string | null {
  const url = asString(value)
  if (!url?.trim()) return null
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function blobFor(files: CardFiles, path: string | undefined): Blob | null {
  if (!path) return null
  return files.get(path) ?? null
}

function restoreImages(
  manifest: CardManifest,
  files: CardFiles,
  defaults: CardImages,
): CardImages {
  const images = {} as CardImages
  for (const slot of Object.keys(defaults) as ImageSlot[]) {
    const asset = manifest.images?.[slot]
    const blob = blobFor(files, asset?.path)
    if (!asset || !blob) {
      images[slot] = { ...defaults[slot] }
      continue
    }
    const ext = asset.path.split('.').pop() ?? null
    const image: CardImage = {
      url: URL.createObjectURL(blob),
      blob,
      ext,
      mime: asset.mime ?? blob.type ?? null,
      // The exported file is already the resized copy, so it is both. Leaving
      // `resized` null would make the next download refuse to build.
      resized: blob,
    }
    images[slot] = image
  }
  return images
}

function restoreMedia(
  item: ManifestMedia,
  files: CardFiles,
): FeaturedContent | null {
  const blob = blobFor(files, item.file?.path)
  // A media entry with no file cannot be rebuilt — MediaContent has no valid
  // shape without one, and a half-restored tile would break the next export.
  if (!blob) return null
  const cover = blobFor(files, item.cover?.path)
  return {
    contentType: 'media',
    type: item.type,
    name: item.name,
    title: item.title,
    artist: item.artist ?? undefined,
    album: item.album ?? undefined,
    ext: item.ext,
    filesize: item.filesize ?? undefined,
    info: item.info ?? undefined,
    mime: item.file?.mime ?? undefined,
    file: blob,
    dataURI: URL.createObjectURL(blob),
    ...(cover
      ? {
          cover,
          coverDataURI: URL.createObjectURL(cover),
          coverExt: item.cover?.path.split('.').pop(),
        }
      : {}),
  } as FeaturedContent
}

function restoreProduct(
  item: ManifestProduct,
  files: CardFiles,
): FeaturedContent {
  const blob = blobFor(files, item.image?.path)
  return {
    contentType: 'product',
    title: item.title,
    description: item.description,
    price: item.price,
    label: item.label,
    link: item.link,
    // A product survives its image going missing — unlike media, the rest of
    // the card is still meaningful, so the tile loads without the photo.
    image:
      item.image && blob
        ? {
            dataURI: URL.createObjectURL(blob),
            file: blob,
            type: 'image',
            ext: item.image.ext,
            mime: item.image.mime ?? blob.type,
            title: item.image.title,
            resized: blob,
          }
        : null,
  } as FeaturedContent
}

function restoreItem(
  item: ManifestContent,
  files: CardFiles,
): FeaturedContent | null {
  if (typeof item === 'string') return item
  switch (item.contentType) {
    case 'media':
      return restoreMedia(item, files)
    case 'product':
      return restoreProduct(item, files)
    case 'text':
    case 'review':
      return item
    case 'carousel':
      return {
        contentType: 'carousel',
        slides: item.slides
          .map((slide) => restoreItem(slide, files))
          .filter(
            (slide): slide is Exclude<FeaturedContent, string> =>
              slide !== null && typeof slide !== 'string',
          ),
      } as FeaturedContent
    default:
      return null
  }
}

function restoreFeatured(
  manifest: CardManifest,
  files: CardFiles,
): FeaturedSection[] {
  return manifest.featured.map((section) => ({
    title: asString(section?.title) ?? 'Section title',
    content: (Array.isArray(section?.content) ? section.content : [])
      .map((item) => restoreItem(item, files))
      .filter((item): item is FeaturedContent => item !== null),
  }))
}

/**
 * Re-sanitise every custom profile icon.
 *
 * `customIcon` is inlined with `v-html` and copied into the exported card, so
 * it is the one field in a manifest that could turn a shared card into a
 * script. It goes back through the same sanitiser the upload path uses; an
 * icon that fails is dropped and the row keeps its name and link.
 */
function restoreSecondary(actions: SecondaryAction[]): SecondaryAction[] {
  return actions.map((action, i) => {
    if (!action?.customIcon) return action
    try {
      return {
        ...action,
        customIcon: sanitiseSVG(action.customIcon, `import-${i}`),
      }
    } catch {
      return { ...action, customIcon: null }
    }
  })
}

/** Editor state rebuilt from a manifest, ready to be assigned. */
export interface RestoredCard {
  theme: ThemeId
  cardUid: string | null
  colors: CardColours
  genInfo: CardManifest['genInfo']
  fontPreset: string
  headingFontPreset: string
  images: CardImages
  primaryActions: PrimaryAction[]
  secondaryActions: SecondaryAction[]
  featured: FeaturedSection[]
  hostedURL: string | null
  footerCredit: boolean
}

/**
 * Turn a parsed manifest and its files into editor state.
 *
 * `defaults` is the editor's own pristine state, used for anything the
 * manifest omits or gets wrong — importing a card with one bad colour should
 * cost that colour, not the import.
 */
export function restoreCard(
  manifest: CardManifest,
  files: CardFiles,
  defaults: {
    colors: CardColours
    genInfo: CardManifest['genInfo']
    images: CardImages
  },
): RestoredCard {
  const theme = THEMES.has(manifest.theme) ? manifest.theme : 1
  return {
    theme,
    cardUid: asString(manifest.cardUid),
    colors: restoreColours(manifest.colors, defaults.colors),
    // Spread over the defaults so a manifest written by an older version,
    // missing fields this one has, still yields a complete GenInfo.
    genInfo: { ...defaults.genInfo, ...manifest.genInfo },
    fontPreset: asString(manifest.fontPreset) ?? 'default',
    headingFontPreset: asString(manifest.headingFontPreset) ?? 'default',
    images: restoreImages(manifest, files, defaults.images),
    primaryActions: Array.isArray(manifest.primaryActions)
      ? manifest.primaryActions
      : [],
    secondaryActions: restoreSecondary(
      Array.isArray(manifest.secondaryActions) ? manifest.secondaryActions : [],
    ),
    featured: restoreFeatured(manifest, files),
    hostedURL: restoreHostedURL(manifest.hostedURL),
    footerCredit: manifest.footerCredit !== false,
  }
}

/** Read the manifest text out of a set of card files. */
export async function readManifestText(files: CardFiles): Promise<string> {
  const blob = files.get(MANIFEST_FILE)
  if (!blob) fail(`No ${MANIFEST_FILE} in there.`)
  return blob.text()
}
