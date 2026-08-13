/**
 * Address formatting, shared by the editor, the preview and the export.
 *
 * In a .ts file rather than duplicated in the SFCs so it is actually
 * type-checked, and so the string the card displays is provably the same one
 * the map link searches for — they used to be able to drift.
 *
 * The input is an action row's `values` record rather than a dedicated type,
 * because an Address is a multi-field primary action now: its components are
 * keyed by `ActionField.key` exactly like any other such row.
 */
export type AddressValues = Record<string, string | null>

/** The five components, in the order ADR and a postal envelope put them. */
export const ADDRESS_KEYS = [
  'street',
  'city',
  'region',
  'postcode',
  'country',
] as const

/** True once any component is filled. ADR and the map link both key off it. */
export function hasAddress(values: AddressValues | undefined): boolean {
  if (!values) return false
  return ADDRESS_KEYS.some((key) => values[key])
}

/**
 * The address on one line.
 *
 * Region and postcode are joined by a space rather than a comma, because that
 * is how a postal address writes them — a geocoder reads "London NW1 6XE" as
 * one locality and "London, NW1 6XE" as two competing fragments.
 */
export function formatAddress(values: AddressValues | undefined): string {
  if (!values) return ''
  const locality = [
    values.city,
    [values.region, values.postcode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  return [values.street, locality, values.country].filter(Boolean).join(', ')
}

/**
 * Where an address links to when JavaScript never runs.
 *
 * OpenStreetMap because it works in every browser, needs no app installed,
 * and adds no third-party tracking to a card whose whole premise is that
 * nothing leaves the device. main.ts upgrades this at load time to a `geo:`
 * URI on Android and an Apple Maps URL on iOS, both of which hand off to the
 * phone's own map application; neither survives as a static fallback, which
 * is why the plain link has to be a web one.
 */
export function mapSearchURL(values: AddressValues | undefined): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    formatAddress(values),
  )}`
}
