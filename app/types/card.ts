/**
 * The card model shared by the editor, the live preview and the export.
 *
 * These types are deliberately in a plain .ts module rather than inline in the
 * SFCs: TypeScript 7 is the native compiler and has no JS API, so vue-tsc and
 * Volar cannot read .vue files at all right now. Anything declared here is
 * checked by `npx tsc --noEmit`; anything declared inside a `<script lang="ts">`
 * block is only stripped by Vite, never verified. Keep the load-bearing shapes
 * in this file.
 */

/** Which of the three editor image slots a `CardImage` belongs to. */
export type ImageSlot = 'logo' | 'photo' | 'cover'

/**
 * An attached image. `blob` is the original file, `resized` the downscaled copy
 * produced by `resizeImage()` — svg/gif/webp skip resizing, so the two can be
 * the same object.
 */
export interface CardImage {
  url: string | null
  blob: Blob | null
  ext: string | null
  mime: string | null
  resized: Blob | null
}

export type CardImages = Record<ImageSlot, CardImage>

/** Which of the four themeable colours a `Colour` controls. */
export type ColourSlot = 'logoBg' | 'mainBg' | 'buttonBg' | 'cardBg'

export interface Colour {
  /** Always a `#rgb`/`#rrggbb` string; Colour.vue validates before committing. */
  color: string
  openPalette: boolean
}

export type CardColours = Record<ColourSlot, Colour>

/** Free-text fields. Every one is optional from the user's point of view. */
export interface GenInfo {
  fname: string | null
  lname: string | null
  pronouns: string | null
  title: string | null
  biz: string | null
  addr: string | null
  desc: string | null
  /** ASCII-armoured PGP public key. */
  key: string | null
  /** The user's own analytics snippet, copied verbatim into their export. */
  tracker: string | null
  fontLink: string | null
  fontCss: string | null
}

/**
 * `0 | 1` rather than boolean because these values are authored inline in the
 * action tables and consumed by `v-if`; they are not user-editable.
 */
export type Flag = 0 | 1

interface ActionBase {
  name: string
  /** Key into app/assets/icons/*.svg, resolved via `$icon()`. */
  icon: string
  /** Scheme or URL prefix prepended to `value` when building the link. */
  href?: string
  /** Appended after `value` — only Skype uses this (`?chat`). */
  hrefEnd?: string
  placeholder: string
  value: string | null
  label: string
}

/** Contact rows: phone, email, website. Sorted by `order`. */
export interface PrimaryAction extends ActionBase {
  order: number
  isURL?: Flag
}

/** Social rows. Sorted by name, and rendered as coloured chips. */
export interface SecondaryAction extends ActionBase {
  /** Hex, or a `linear-gradient(...)` for App Store. */
  color: string
  /** Set when `color` is pale enough to need dark foreground text. */
  light?: Flag
  /** Icon carries its own gradient `<defs>` and needs id randomisation. */
  gradientIcon?: Flag
}

export type CardAction = PrimaryAction | SecondaryAction

export interface CardActions {
  primaryActions: PrimaryAction[]
  secondaryActions: SecondaryAction[]
}

export type MediaKind = 'image' | 'music' | 'video' | 'document'

/**
 * What `resizeImage()` in index.vue can be pointed at.
 *
 * Either an editor slot — resized in place from `images[slot].blob`, with no
 * indices — or a featured entry addressed by `index1`/`index2`: `'image'` and
 * `'music'` from Featured.vue, `'product'` from ProductCard.vue.
 *
 * `'video'` and `'document'` are `MediaKind` values but are deliberately NOT
 * here: those paths build their own covers, and resizeImage() has no branch
 * for them — passing one leaves `file` undefined and throws in FileReader.
 */
export type ResizeTarget = ImageSlot | 'image' | 'music' | 'product'

/**
 * resizeImage()'s signature, shared so the four components that receive it as
 * a prop cannot each guess a different one. `index1`/`index2` are the featured
 * section and content indices, omitted for the ImageSlot targets.
 */
export type ResizeImage = (
  target: ResizeTarget,
  mime: string,
  index1?: number,
  index2?: number
) => void

/**
 * An attached file. `cover` is the poster frame: ID3 art for music, a pdf.js
 * render for documents, a captured frame for video. When it could not be
 * produced, `info` explains why and `cover` is absent.
 */
export interface MediaContent {
  contentType: 'media'
  type: MediaKind
  name: string
  title?: string | null
  artist?: string | null
  album?: string | null
  /** Object URL for playback. PDF entries have none — they use `file`. */
  dataURI?: string
  file: Blob
  ext: string
  /** Human-readable size, set for documents only. */
  filesize?: string
  /** Recorded by imageLoaded() but never read back; kept for compatibility. */
  mime?: string
  cover?: Blob
  coverDataURI?: string
  coverExt?: string
  info?: 'No Thumb' | 'No ID3 Tag'
}

/**
 * Product images are *not* `CardImage`s — ProductCard.vue stores the original
 * file plus its data URI, and `resizeImage('product', ...)` adds `resized`.
 */
export interface ProductImage {
  dataURI: string
  file: Blob
  type: 'image'
  ext: string
  mime: string
  title: string
  resized?: Blob
}

export interface ProductContent {
  contentType: 'product'
  image: ProductImage | null
  title: string | null
  description: string | null
  price: string | null
  label: string | null
  link: string | null
}

export interface TextContent {
  contentType: 'text'
  value: string | null
}

/**
 * Plain links are stored as bare strings with no `contentType`, which is what
 * `addLink()` pushes and what the `!e.contentType` filters key off. Narrow with
 * a `typeof x === 'string'` check before touching any property.
 */
export type FeaturedContent =
  | string
  | MediaContent
  | ProductContent
  | TextContent

export interface FeaturedSection {
  title: string
  content: FeaturedContent[]
}

export interface VCardUrl {
  title: string
  url: string
}

/** Flattened contact data, assembled by index.vue's `vCard` computed. */
export interface VCardData {
  fn: string | null
  ln: string | null
  title: string | null
  org: string | null
  addr: string | null
  cell: string | null
  work: string | null
  home: string | null
  sms: string | null
  email: string | null
  hostedURL: string | null
  website: string | null
  urls: VCardUrl[]
  /** base64 of the PGP key, only set when it passes validation. */
  key: string | null
  note: string | null
  uid: string
}

export interface DownloadCheckItem {
  label: string
  checked: boolean
}

/** Themes A, B and C — the numbers index T1/T2/T3.min.css. */
export type ThemeId = 1 | 2 | 3
