/**
 * The machine-readable description of a card, written into the export as
 * `card.json`.
 *
 * The exported card is HTML meant for a browser: the generator can render it,
 * but it cannot read it back. Recovering a card from `index.html` would mean
 * scraping markup that Preview.vue is free to restructure at any time, so the
 * export carries its own source of truth instead. Re-importing a downloaded
 * card and building team cards both read this file.
 *
 * Two properties matter more than the shape:
 *
 * 1. **It is written by every export from now on.** A card exported without a
 *    manifest can never be re-imported, no matter what the importer learns to
 *    do later — the information is simply not in the zip. That is why this
 *    ships ahead of the importer that consumes it.
 * 2. **It points at binaries, it does not embed them.** Every asset is already
 *    in the zip; recording paths keeps `card.json` small and readable, and
 *    keeps one copy of each image rather than a second base64 one. The paths
 *    come from the same `mediaFileName()`/`slideFileName()` helpers the zip
 *    writer uses, so a rename cannot desynchronise them.
 *
 * Nothing here touches the network. The manifest is written into the user's
 * own download and goes nowhere else.
 */

import type {
  CardColours,
  CardImages,
  ColourSlot,
  FeaturedSection,
  GenInfo,
  ImageSlot,
  MediaContent,
  MediaKind,
  PrimaryAction,
  ReviewContent,
  SecondaryAction,
  TextContent,
  ThemeId,
} from '~/types/card'
import { hasCoverFile, mediaFileName, slideFileName } from '~/types/card'

/**
 * Bumped only when an existing field changes meaning or disappears — adding a
 * new optional field does not need it. An importer refusing an unknown major
 * version is better than one guessing at a shape it predates.
 */
export const MANIFEST_VERSION = 1

/** Where the manifest sits inside the card folder. */
export const MANIFEST_FILE = 'card.json'

/** A binary the manifest points at rather than embeds. */
export interface ManifestAsset {
  /** Path relative to the card folder, using the zip's forward slashes. */
  path: string
  mime?: string | null
}

export interface ManifestMedia {
  contentType: 'media'
  type: MediaKind
  name: string
  title: string | null
  artist: string | null
  album: string | null
  ext: string
  filesize: string | null
  info: 'No Thumb' | 'No ID3 Tag' | null
  file: ManifestAsset
  /** Null when the entry ships no separate cover — see `hasCoverFile()`. */
  cover: ManifestAsset | null
}

export interface ManifestProduct {
  contentType: 'product'
  title: string | null
  description: string | null
  price: string | null
  label: string | null
  link: string | null
  image: (ManifestAsset & { title: string; ext: string }) | null
}

/**
 * Text and review slides are already plain data with no binary handles, so
 * they cross into the manifest unchanged rather than being copied field by
 * field into a near-identical type that would then have to be kept in step.
 */
export type ManifestSlide =
  | ManifestMedia
  | ManifestProduct
  | TextContent
  | ReviewContent

export interface ManifestCarousel {
  contentType: 'carousel'
  slides: ManifestSlide[]
}

/** A bare string is a plain link, exactly as `FeaturedContent` stores it. */
export type ManifestContent = ManifestSlide | ManifestCarousel | string

export interface ManifestSection {
  title: string
  content: ManifestContent[]
}

export interface CardManifest {
  manifestVersion: number
  generator: string
  exportedAt: string
  theme: ThemeId
  cardUid: string
  colors: Record<ColourSlot, string>
  genInfo: GenInfo
  fontPreset: string
  headingFontPreset: string
  images: Partial<Record<ImageSlot, ManifestAsset>>
  primaryActions: PrimaryAction[]
  secondaryActions: SecondaryAction[]
  featured: ManifestSection[]
  hostedURL: string | null
  footerCredit: boolean
}

/** Everything `buildManifest()` needs, named as the editor names it. */
export interface ManifestInput {
  theme: ThemeId
  cardUid: string
  colors: CardColours
  genInfo: GenInfo
  fontPreset: string
  headingFontPreset: string
  images: CardImages
  primaryActions: PrimaryAction[]
  secondaryActions: SecondaryAction[]
  featured: FeaturedSection[]
  hostedURL: string | null
  footerCredit: boolean
}

const MEDIA_DIR = 'media'

function mediaAsset(title: string | null | undefined, ext: string) {
  return { path: `${MEDIA_DIR}/${mediaFileName(title, ext)}` }
}

function manifestMedia(item: MediaContent, path: string): ManifestMedia {
  return {
    contentType: 'media',
    type: item.type,
    name: item.name,
    title: item.title ?? null,
    artist: item.artist ?? null,
    album: item.album ?? null,
    ext: item.ext,
    filesize: item.filesize ?? null,
    info: item.info ?? null,
    file: { path, mime: item.mime ?? null },
    // The cover is only written when the entry actually ships one; recording a
    // path for a file the zip does not contain would send an importer looking
    // for something that was never there.
    cover:
      hasCoverFile(item) && item.coverExt
        ? mediaAsset(item.title, item.coverExt)
        : null,
  }
}

/**
 * The manifest form of one section item.
 *
 * `slidePath` is supplied by the caller rather than computed here because a
 * carousel slide is named positionally and a section item by its title — the
 * two naming rules are the caller's business, not this function's.
 */
function manifestItem(
  item: Exclude<FeaturedSection['content'][number], string>,
  path: (title: string | null | undefined, ext: string) => string,
): ManifestContent | null {
  switch (item.contentType) {
    case 'media':
      return manifestMedia(item, path(item.title, item.ext))
    case 'product':
      return {
        contentType: 'product',
        title: item.title,
        description: item.description,
        price: item.price,
        label: item.label,
        link: item.link,
        image: item.image
          ? {
              path: path(item.image.title, item.image.ext),
              mime: item.image.mime,
              title: item.image.title,
              ext: item.image.ext,
            }
          : null,
      }
    case 'text':
    case 'review':
      return item
    default:
      return null
  }
}

function manifestSections(featured: FeaturedSection[]): ManifestSection[] {
  return featured.map((section, sectionIndex) => ({
    title: section.title,
    content: section.content.flatMap((item, itemIndex): ManifestContent[] => {
      if (typeof item === 'string') return [item]

      if (item.contentType === 'carousel') {
        const slides = item.slides.flatMap((slide, slideIndex) => {
          const entry = manifestItem(
            slide,
            (_title, ext) =>
              `${MEDIA_DIR}/${slideFileName(sectionIndex, itemIndex, slideIndex, ext)}`,
          )
          // A carousel cannot hold another carousel, so anything manifestItem
          // declines here is a slide kind it has not been taught yet.
          return entry &&
            typeof entry !== 'string' &&
            entry.contentType !== 'carousel'
            ? [entry as ManifestSlide]
            : []
        })
        return [{ contentType: 'carousel', slides }]
      }

      const entry = manifestItem(
        item,
        (title, ext) => `${MEDIA_DIR}/${mediaFileName(title, ext)}`,
      )
      return entry ? [entry] : []
    }),
  }))
}

function manifestImages(
  images: CardImages,
): Partial<Record<ImageSlot, ManifestAsset>> {
  const out: Partial<Record<ImageSlot, ManifestAsset>> = {}
  for (const slot of Object.keys(images) as ImageSlot[]) {
    const image = images[slot]
    // `url` is what the editor gates the zip entry on, so the manifest must
    // gate on the same thing or it will name a file the zip never wrote.
    if (!image.url || !image.ext) continue
    out[slot] = { path: `${slot}.${image.ext}`, mime: image.mime }
  }
  return out
}

/**
 * Build the manifest for the card currently in the editor.
 *
 * Pure and synchronous: it reads no blobs and touches no DOM, which is what
 * lets it be checked against the zip's own paths without a browser.
 */
export function buildManifest(input: ManifestInput): CardManifest {
  return {
    manifestVersion: MANIFEST_VERSION,
    generator: 'EnBizCard',
    exportedAt: new Date().toISOString(),
    theme: input.theme,
    cardUid: input.cardUid,
    // Only the colour survives; `openPalette` is editor state — whether a
    // swatch was open when Download was pressed is not part of the card.
    colors: Object.fromEntries(
      (Object.keys(input.colors) as ColourSlot[]).map((slot) => [
        slot,
        input.colors[slot].color,
      ]),
    ) as Record<ColourSlot, string>,
    genInfo: input.genInfo,
    fontPreset: input.fontPreset,
    headingFontPreset: input.headingFontPreset,
    images: manifestImages(input.images),
    primaryActions: input.primaryActions,
    secondaryActions: input.secondaryActions,
    featured: manifestSections(input.featured),
    hostedURL: input.hostedURL,
    footerCredit: input.footerCredit,
  }
}

/** The manifest as the text written into the zip. */
export function serialiseManifest(input: ManifestInput): string {
  // Indented: someone opening card.json in their download should be able to
  // read and hand-edit it, and the file is a few KB either way.
  return JSON.stringify(buildManifest(input), null, 2)
}
