/**
 * Address formatting, shared by the editor and the preview.
 *
 * In a .ts file rather than duplicated in the two SFCs so it is actually
 * type-checked, and so the string the card displays is provably the same one
 * the map link searches for — they used to be able to drift.
 */
import type { CardAddress } from '~/types/card'

/** True once any component is filled. ADR and the map link both key off it. */
export function hasAddress(addr: CardAddress): boolean {
  return Boolean(
    addr.street || addr.city || addr.region || addr.postcode || addr.country,
  )
}

/**
 * The address on one line.
 *
 * Region and postcode are joined by a space rather than a comma, because that
 * is how a postal address writes them — a geocoder reads "London NW1 6XE" as
 * one locality and "London, NW1 6XE" as two competing fragments.
 */
export function formatAddress(addr: CardAddress): string {
  const locality = [
    addr.city,
    [addr.region, addr.postcode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  return [addr.street, locality, addr.country].filter(Boolean).join(', ')
}

/**
 * Where the address links to when JavaScript never runs.
 *
 * OpenStreetMap because it works in every browser, needs no app installed,
 * and adds no third-party tracking to a card whose whole premise is that
 * nothing leaves the device. main.ts upgrades this at load time to a `geo:`
 * URI on Android and an Apple Maps URL on iOS, both of which hand off to the
 * phone's own map application; neither survives as a static fallback, which
 * is why the plain link has to be a web one.
 */
export function mapSearchURL(addr: CardAddress): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    formatAddress(addr),
  )}`
}
