// Icon loading for Vite.
//
// Under Nuxt 2 these were pulled in with webpack's `require()` plus the
// `?include` query from nuxt-optimized-images. Vite supports neither, so every
// icon is instead inlined as a raw string at build time via import.meta.glob.
// The glob path must stay relative — Vite does not resolve `~/` aliases here.
const modules = import.meta.glob('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const icons: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, source]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.svg'.length),
    source,
  ]),
)

function randomStr(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let out = ''
  for (let i = 0; i < len; i++)
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

/**
 * Raw SVG source for an icon, ready for v-html.
 *
 * When `gradient` is set, gradient ids are rewritten to random names so the
 * same icon can be inlined more than once on a page without the <defs> ids
 * colliding (only instagram.svg currently relies on this).
 */
export function getIcon(name: string, gradient: boolean = false): string {
  const svg = icons[name]
  if (!svg) {
    if (import.meta.dev) console.warn(`[icons] unknown icon: "${name}"`)
    return ''
  }
  // Icons sit inside controls that already carry a visible label or aria-label.
  // Hide their internal titles so assistive tech does not announce names twice.
  const hiddenSvg = svg
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
    .replace(/<title>.*?<\/title>/, '')
  if (!gradient) return hiddenSvg

  let out = hiddenSvg
  for (let i = 1; i < 10; i++) {
    const token = `gradient${i}`
    if (!out.includes(token)) break
    out = out.split(token).join(randomStr(7))
  }
  return out
}

export const iconNames: string[] = Object.keys(icons)
