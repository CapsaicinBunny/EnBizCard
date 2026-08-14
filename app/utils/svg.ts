/**
 * Sanitiser for user-supplied SVG icons.
 *
 * A custom social icon is inlined with `v-html` into the live preview *and*
 * serialised into the exported card, which the user then publishes. An SVG is
 * a document, not an image: it can carry `<script>`, `onload=` handlers and
 * external references, so an uploaded file that went in verbatim would run in
 * the generator and in every visitor's browser. Everything here exists to
 * make that impossible.
 *
 * Allow-list, not deny-list: an unknown element is dropped rather than kept,
 * so a tag nobody thought of does not become the way in.
 */

/** Refuse anything larger — it is inlined into the export, not linked. */
export const MAX_SVG_BYTES = 100_000

const ALLOWED_ELEMENTS = new Set([
  'svg',
  'g',
  'defs',
  'symbol',
  'use',
  'title',
  'desc',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
  'mask',
  'pattern',
])

/**
 * Attributes that may reference a URI. Kept only when they point inside the
 * document — `#gradient1` is how gradients and clip paths are referenced, and
 * anything else is a way to phone home from the reader's browser.
 */
const URI_ATTRIBUTES = new Set(['href', 'xlink:href', 'src'])

export class SVGError extends Error {}

function fail(message: string): never {
  throw new SVGError(message)
}

/**
 * An SVG `width`/`height` in user units, or NaN.
 *
 * Matched explicitly rather than coerced: `Number('512px')` is NaN, and a
 * bare `parseFloat` would accept nonsense like `512em` as 512 and produce a
 * viewBox in the wrong units.
 */
function dimension(value: string | null): number {
  const match = /^\s*([\d.]+)(?:px)?\s*$/.exec(value ?? '')
  return match ? Number(match[1]) : Number.NaN
}

/** `url(#foo)` inside a presentation attribute or inline style. */
const URL_REF = /url\(\s*['"]?#([^)'"]+)['"]?\s*\)/g

/**
 * Snapshot a live DOM collection.
 *
 * `children` and `attributes` update as you remove from them, so iterating one
 * directly while deleting skips every other entry — which for a sanitiser
 * means half the `<script>` tags survive.
 */
function snapshot<T>(live: Iterable<T>): T[] {
  return Array.from(live)
}

function scrubElement(el: Element, rename: (id: string) => string): void {
  for (const child of snapshot(el.children)) {
    if (!ALLOWED_ELEMENTS.has(child.localName)) {
      child.remove()
      continue
    }
    scrubElement(child, rename)
  }

  for (const attr of snapshot(el.attributes)) {
    const name = attr.name.toLowerCase()
    const value = attr.value

    // Every event handler, without needing to know which ones exist.
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name)
      continue
    }
    if (URI_ATTRIBUTES.has(name)) {
      if (!value.trimStart().startsWith('#')) el.removeAttribute(attr.name)
      else el.setAttribute(attr.name, '#' + rename(value.trim().slice(1)))
      continue
    }
    // `style="fill:url(http://…)"` and `fill="url(javascript:…)"` both reach
    // out of the document without being in URI_ATTRIBUTES.
    if (/javascript:|data:text\/html/i.test(value)) {
      el.removeAttribute(attr.name)
      continue
    }
    if (value.includes('url(')) {
      if (/url\(\s*['"]?(?!#)/.test(value)) el.removeAttribute(attr.name)
      else
        el.setAttribute(
          attr.name,
          value.replace(URL_REF, (_, id) => `url(#${rename(id)})`),
        )
      continue
    }
    if (name === 'id') el.setAttribute('id', rename(value))
  }
}

/**
 * Parse, sanitise and normalise an uploaded SVG, ready for `v-html`.
 *
 * `idPrefix` namespaces every id in the file. Two custom icons drawn in the
 * same editor routinely share ids like `a` or `gradient1`, and in one exported
 * document the second one's `<defs>` would silently win — the same collision
 * `getIcon()` randomises away for the bundled icons.
 *
 * Throws `SVGError` with a message meant for the user.
 */
export function sanitiseSVG(source: string, idPrefix: string): string {
  if (new TextEncoder().encode(source).length > MAX_SVG_BYTES)
    fail(
      `That SVG is larger than ${MAX_SVG_BYTES / 1000} kB. It gets embedded in the card, so please use a simpler icon.`,
    )

  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  if (doc.querySelector('parsererror'))
    fail('That file could not be parsed as SVG.')

  const svg = doc.documentElement
  if (svg.localName !== 'svg') fail('That file is not an SVG image.')

  const seen = new Map<string, string>()
  const rename = (id: string) => {
    if (!seen.has(id)) seen.set(id, `${idPrefix}-${id}`)
    return seen.get(id)!
  }

  scrubElement(svg, rename)
  for (const attr of snapshot(svg.attributes)) {
    if (attr.name.toLowerCase().startsWith('on')) svg.removeAttribute(attr.name)
  }

  // The chip sizes the icon in CSS, so a file that hard-codes width="512"
  // would blow out of it. A viewBox is what makes it scale, so synthesise one
  // from the dimensions before dropping them.
  if (!svg.getAttribute('viewBox')) {
    const w = dimension(svg.getAttribute('width'))
    const h = dimension(svg.getAttribute('height'))
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0)
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    else fail('That SVG has no viewBox, so it cannot be scaled to fit.')
  }
  svg.removeAttribute('width')
  svg.removeAttribute('height')

  // Matches what getIcon() does to the bundled icons: the chip already has an
  // aria-label, so the icon must not be announced a second time.
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')

  if (!svg.querySelector('*')) fail('That SVG has nothing left to draw.')
  return new XMLSerializer().serializeToString(svg)
}
