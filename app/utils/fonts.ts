/**
 * Reading the user's web-font embed markup and CSS rule.
 *
 * Both values are pasted by the user (or copied from a preset) and both end
 * up inside the exported card — the markup as `<link>` elements, the rule
 * inside a `<style>` block. Neither is trusted verbatim: this module re-parses
 * them and emits only the pieces it recognises.
 */

/**
 * Every stylesheet href in an embed snippet.
 *
 * Plural, deliberately. The previous version took only the first `<link>`,
 * which forced the presets to pack a whole family into one Google Fonts
 * request and made two different fonts impossible — a heading font and a body
 * font can now come from separate services, or separate requests to the same
 * one.
 *
 * Only http(s) survives. The href is written into a static page the user then
 * publishes, so a `javascript:` stylesheet href is not something to pass on.
 */
export function stylesheetHrefs(markup: string | null | undefined): string[] {
  if (!markup?.trim()) return []
  const html = new DOMParser().parseFromString(markup, 'text/html')
  const hrefs: string[] = []
  for (const link of html.getElementsByTagName('link')) {
    if (link.getAttribute('rel') !== 'stylesheet') continue
    const href = link.getAttribute('href')?.trim()
    if (!href) continue
    try {
      // Resolved against the document so a protocol-relative href parses;
      // only the scheme is being judged here.
      const { protocol } = new URL(href, 'https://example.invalid/')
      if (protocol !== 'http:' && protocol !== 'https:') continue
    } catch {
      continue
    }
    if (!hrefs.includes(href)) hrefs.push(href)
  }
  return hrefs
}

/**
 * The `font-family` declaration out of a pasted CSS rule, or null.
 *
 * Returns just that one declaration, never the whole string. The result is
 * interpolated into a `<style>` block, so a paste containing `}` could
 * otherwise close the rule early and restyle the rest of the card — which is
 * why anything with a brace, a semicolon-separated tail or a tag is dropped
 * rather than cleaned up.
 */
export function fontFamilyRule(css: string | null | undefined): string | null {
  if (!css?.trim()) return null
  const match = css.match(/font-family\s*:[^;{}<>]*/i)
  if (!match) return null
  const rule = match[0].trim()
  // A declaration with no value is not worth emitting.
  return /font-family\s*:\s*\S/i.test(rule) ? rule : null
}
