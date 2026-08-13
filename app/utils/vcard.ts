/**
 * vCard 4.0 (RFC 6350) serialiser.
 *
 * This lives in a .ts file rather than a Vue template on purpose. The previous
 * version interpolated fields into a `<pre>` and read them back with
 * `innerText`, which cannot produce a conforming vCard: the spec wants CRLF
 * delimiters, lines folded at 75 octets, and reserved characters escaped, and
 * a DOM round-trip silently normalises all three. Putting it here also means
 * `tsc --noEmit` actually checks it — annotations inside an SFC never are.
 */
import type { VCardAddress, VCardData, VCardTyped } from '~/types/card'

/** RFC 6350 3.2: content lines are delimited by CRLF, not LF. */
const CRLF = '\r\n'

/** RFC 6350 3.2: fold at 75 octets, excluding the line break. */
const FOLD_LIMIT = 75

const encoder = new TextEncoder()

/**
 * RFC 6350 3.4. Backslash goes first, otherwise it would escape the backslashes
 * the later passes introduce. Semicolon and comma are the structured-value and
 * multi-value separators, so an unescaped one in a name or address silently
 * splits the field into parts.
 */
function escapeText(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll(/\r\n|[\r\n]/g, '\\n')
}

/**
 * Fold a content line to 75 octets, continuing with a single leading space.
 *
 * Measured in UTF-8 octets rather than characters, per the spec, but split on
 * code-point boundaries so a multi-byte character is never cut in half — an
 * embedded photo is ASCII base64, but ORG and NOTE are not necessarily. The
 * leading space on a continuation counts toward its own 75, hence the 74.
 */
function fold(line: string): string {
  if (encoder.encode(line).length <= FOLD_LIMIT) return line

  const out: string[] = []
  let current = ''
  let octets = 0
  let limit = FOLD_LIMIT
  for (const char of line) {
    const size = encoder.encode(char).length
    if (octets + size > limit) {
      out.push(current)
      current = ''
      octets = 0
      limit = FOLD_LIMIT - 1
    }
    current += char
    octets += size
  }
  if (current) out.push(current)
  return out.join(CRLF + ' ')
}

/**
 * A parameter value needs double quotes once it contains a space, comma or
 * colon. `URL;TYPE=Digital Business Card:` — the unquoted form this used to
 * emit — is malformed, and a strict parser is entitled to reject the whole
 * vCard over it rather than just dropping the parameter.
 */
function param(name: string, value: string): string {
  const needsQuotes = /[",:;\s]/.test(value)
  // RFC 6350 3.3 gives no escape for a DQUOTE or a newline inside a parameter
  // value; RFC 6868, which 4.0 normatively references, supplies one. Caret
  // first, or it would escape the carets the later passes introduce.
  const safe = value
    .replaceAll('^', '^^')
    .replaceAll(/\r\n|[\r\n]/g, '^n')
    .replaceAll('"', "^'")
  return `;${name}=${needsQuotes ? `"${safe}"` : safe}`
}

/** A property whose value is TEXT, and therefore escaped. */
function text(
  name: string,
  value: string | null | undefined,
  params = '',
): string[] {
  if (!value) return []
  return [fold(`${name}${params}:${escapeText(value)}`)]
}

/**
 * Hands out `item1`, `item2`, … — the group names that tie a property to its
 * X-ABLabel. One counter is shared by every labelled property in the card,
 * because a group name reused across two properties merges them: a TEL and a
 * URL both in `item1` would take whichever label came last.
 */
function groups() {
  let next = 1
  return () => `item${next++}.`
}

/**
 * Emit a property, plus an X-ABLabel line when it needs a name TYPE cannot
 * express. `render` gets the group prefix because the label and the property
 * it names must both carry it.
 */
function labelled(
  label: string | null,
  group: () => string,
  render: (prefix: string) => string[],
): string[] {
  if (!label) return render('')
  const prefix = group()
  return [...render(prefix), fold(`${prefix}X-ABLabel:${escapeText(label)}`)]
}

/**
 * A property whose value is a URI, and therefore *not* escaped — a data URI is
 * full of the very commas and semicolons escapeText() would mangle.
 */
function uri(
  name: string,
  value: string | null | undefined,
  params = '',
): string[] {
  if (!value) return []
  return [fold(`${name}${params}:${value}`)]
}

/**
 * A labelled URL, using the group + X-ABLabel convention.
 *
 * RFC 6350 defines no free-text label for URL, and TYPE only takes registered
 * values, so `URL;TYPE=WhatsApp` is not valid. The grouping syntax is part of
 * the grammar, and Apple's X-ABLabel is what makes the label actually appear
 * on iOS and macOS; everything else ignores the second line and keeps the URL.
 */
function labelledUrl(
  group: () => string,
  url: string,
  label: string,
): string[] {
  return labelled(label, group, (prefix) => [fold(`${prefix}URL:${url}`)])
}

/** RFC 6350 4.3.5 timestamp: basic ISO 8601, UTC, no separators. */
function timestamp(date: Date): string {
  return date.toISOString().replaceAll(/[-:]/g, '').replace(/\.\d+/, '')
}

function typedLines(
  name: string,
  entries: VCardTyped[],
  group: () => string,
  toValue: (value: string) => string,
): string[] {
  return entries.flatMap((entry) =>
    labelled(entry.label, group, (prefix) =>
      uri(
        `${prefix}${name}`,
        toValue(entry.value),
        entry.type ? param('TYPE', entry.type) : '',
      ),
    ),
  )
}

/**
 * ADR's seven components, in order: po box, extended address, street,
 * locality, region, postal code, country. The first two are deprecated by
 * RFC 6350 6.3.1 and left empty.
 *
 * The LABEL parameter carries the same address formatted for a mailing label;
 * it is what a reader prints when it does not want to reassemble the parts
 * itself. param() applies the RFC 6868 escaping its newlines need.
 */
function address(addr: VCardAddress, group: () => string): string[] {
  const parts = [
    addr.street,
    addr.city,
    addr.region,
    addr.postcode,
    addr.country,
  ]
  const params =
    (addr.type ? param('TYPE', addr.type) : '') +
    param('LABEL', parts.filter(Boolean).join('\n'))
  return labelled(addr.label, group, (prefix) => [
    fold(
      `${prefix}ADR${params}:;;${parts.map((p) => escapeText(p ?? '')).join(';')}`,
    ),
  ])
}

/**
 * Serialise to a vCard 4.0 document.
 *
 * Empty fields emit nothing at all. The 3.0 version wrote `ORG:`, `TITLE:`,
 * `TEL;TYPE=CELL:` and friends with nothing after the colon whenever the user
 * had not filled them in, which some address books import as empty entries.
 */
export function buildVCard(data: VCardData): string {
  const full = [data.prefix, data.fn, data.mn, data.ln, data.suffix]
    .filter(Boolean)
    .join(' ')
    .trim()
  const group = groups()
  const lines: string[] = [
    'BEGIN:VCARD',
    // RFC 6350 6.7.9: VERSION is mandatory and MUST come directly after BEGIN.
    'VERSION:4.0',
    'KIND:individual',
  ]

  // N is a structured value — family, given, additional, prefixes, suffixes —
  // so each component is escaped separately and the semicolons between them
  // stay literal.
  lines.push(
    fold(
      `N:${[data.ln, data.fn, data.mn, data.prefix, data.suffix]
        .map((part) => escapeText(part ?? ''))
        .join(';')}`,
    ),
  )
  // RFC 6350 6.2.1: FN MUST be present, so it is emitted even when empty —
  // falling back to the organisation gives business-only cards a display name.
  lines.push(fold(`FN:${escapeText(full || data.org || '')}`))
  // NICKNAME is comma-separated, and escapeText() escapes commas, so a value
  // with one in it stays a single nickname rather than splitting in two.
  lines.push(...text('NICKNAME', data.nickname))
  lines.push(...text('X-PHONETIC-FIRST-NAME', data.phoneticFirst))
  lines.push(...text('X-PHONETIC-LAST-NAME', data.phoneticLast))

  lines.push(...text('TITLE', data.title))
  // ORG is structured: company, then units from broadest to narrowest. A
  // department with no company still needs the separator to sit in slot two.
  if (data.org || data.dept)
    lines.push(
      fold(
        `ORG:${[data.org, data.dept]
          .filter((part, i) => i === 0 || part)
          .map((part) => escapeText(part ?? ''))
          .join(';')}`,
      ),
    )

  for (const addr of data.addresses) lines.push(...address(addr, group))

  lines.push(...typedLines('TEL', data.phones, group, (v) => `tel:${v}`))
  if (data.sms)
    lines.push(...uri('TEL', `tel:${data.sms}`, param('TYPE', 'text,cell')))
  lines.push(...typedLines('EMAIL', data.emails, group, (v) => v))

  // Photos are data URIs so the contact card carries its own picture rather
  // than a link that breaks when the site moves.
  lines.push(...uri('PHOTO', data.photo))
  lines.push(...uri('LOGO', data.logo))

  if (data.hostedURL)
    lines.push(...labelledUrl(group, data.hostedURL, 'Digital Business Card'))
  if (data.website) lines.push(...uri('URL', data.website))
  for (const entry of data.urls)
    lines.push(...labelledUrl(group, entry.url, entry.title))

  // RFC 6350 6.8.1: a key is a URI. The 3.0 `KEY;TYPE=PGP;ENCODING=b` form is
  // not valid 4.0.
  if (data.key)
    lines.push(...uri('KEY', `data:application/pgp-keys;base64,${data.key}`))

  // Non-standard: RFC 6350 registers no pronouns property. An X- name is the
  // sanctioned way to carry data the spec has no home for — readers that do
  // not recognise it ignore the line rather than failing.
  lines.push(...text('X-PRONOUNS', data.pronouns))

  lines.push(...text('NOTE', data.note))
  lines.push(`REV:${timestamp(new Date())}`)
  lines.push(...uri('UID', data.uid))
  lines.push('END:VCARD')

  // Trailing CRLF: RFC 6350 4 ends the last content line like any other.
  return lines.join(CRLF) + CRLF
}
