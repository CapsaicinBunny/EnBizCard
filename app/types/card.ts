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
  /** Honorific before the name — Dr, Prof, Ms. Maps to N's 4th component. */
  prefix: string | null
  fname: string | null
  mname: string | null
  lname: string | null
  /** Credentials after the name — Jr, PhD, MBA. N's 5th component. */
  suffix: string | null
  /**
   * How the name sounds, for address books that sort or announce phonetically.
   * RFC 6350 registers nothing for this; every implementation that supports it
   * (Apple, Google, Android) uses the same X-PHONETIC-* names.
   */
  phoneticFirst: string | null
  phoneticLast: string | null
  nickname: string | null
  pronouns: string | null
  desc: string | null
  /** ASCII-armoured PGP public key. */
  key: string | null
  /** The user's own analytics snippet, copied verbatim into their export. */
  tracker: string | null
  /**
   * The body font: the embed markup and the `font-family` rule for it.
   *
   * Named without a role prefix because it predates headings having their own
   * font, and renaming it would break nothing in this repo but would be a
   * gratuitous churn of every reference. Read it as the body pair.
   */
  fontLink: string | null
  fontCss: string | null
  /**
   * The heading font, applied to the name, section titles and card titles.
   * Null means headings simply inherit the body font, which is what every
   * card carried before this pair existed.
   */
  headingLink: string | null
  headingCss: string | null
}

/**
 * Which text a font applies to. The two roles are independent: either can be
 * a preset, a custom embed, or left at the reader's own default.
 */
export type FontRole = 'body' | 'heading'

/**
 * Selectors the heading font claims.
 *
 * `.name` is the person's name, `.section` a featured section's heading, and
 * `.title` the heading inside a media, product or carousel tile. The bare
 * element selectors catch the modal's own headings. Everything else inherits
 * the body font from `#body`, so this list is the whole definition of what
 * "heading" means on a card.
 */
export const HEADING_SELECTORS = '.name, .section, .title, h1, h2, h3'

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
  /** Appended after `value` — only Tumblr uses this (`.tumblr.com/`). */
  hrefEnd?: string
  placeholder: string
  value: string | null
  label: string
  /**
   * The user's own wording for this row, and what the card and the vCard show
   * in place of `name`. Two rows use it: a contact row whose `contactType` is
   * the group's 'Custom' entry, and a custom social profile, where it is the
   * service's name.
   */
  customLabel?: string | null
  /**
   * Set on actions that may be added more than once. `addAction()` clones the
   * template instead of moving it, and `removeAction()` drops the clone rather
   * than returning it to the pool — otherwise the picker would grow a
   * duplicate entry every time a row was deleted.
   */
  repeatable?: Flag
  /**
   * Identifies a row for `v-for` keys. Assigned by `addAction()` rather than
   * authored in the tables: a repeatable row keyed by `name` gives two Phones
   * the same key, and Vue then reuses the wrong DOM when the list reorders.
   */
  rowId?: number
}

/**
 * Repeatable contact rows carry a type the user picks per row — a phone is
 * Mobile/Office/Home, an email is Work/Personal. `label` is what the editor
 * and the card show; `vcard` is the RFC 6350 TYPE parameter value.
 *
 * vCard 4.0 splits what 3.0 called CELL across two axes: what the number *is*
 * (voice, text, cell, fax…) and whose it is (work, home). So a mobile carries
 * `voice,cell` rather than 3.0's single CELL token, and the serialiser quotes
 * any value containing a comma.
 *
 * Two labels may share a value ('Office' and 'Work' both carry work); that is
 * why this is a per-group list rather than one flat label->value map.
 */
export type ContactTypeGroup = 'phone' | 'fax' | 'email' | 'address'

export interface ContactType {
  label: string
  /**
   * The RFC 6350 TYPE parameter value. Empty means emit no TYPE at all —
   * 'Other' and 'Custom' have no registered token, and inventing one risks a
   * strict parser rejecting the property.
   */
  vcard: string
  /**
   * An X-ABLabel to emit alongside, for meanings TYPE cannot carry.
   *
   * Plain words, deliberately. Apple also recognises `_$!<Main>!$_`-style
   * tokens and localises them, but every reader that does not know the
   * convention prints the token verbatim — an Android contact showing
   * `_$!<Main>!$_` as a field name is worse than an unlocalised "Main".
   *
   * 'Other' carries no label at all: it has no TYPE either, and a property
   * with neither is exactly what readers already display as "other".
   */
  abLabel?: string
  /** The label comes from the row's own `customLabel`, not from `abLabel`. */
  custom?: true
}

/**
 * 'Main' is deliberately plain `voice` plus a label: RFC 6350 4.5.2 lists
 * text, voice, fax, cell, video, pager and textphone, and has no 'main'. Same
 * reasoning for 'Other' on email — a made-up TYPE token is worse than none.
 */
export const CONTACT_TYPES: Record<ContactTypeGroup, readonly ContactType[]> = {
  phone: [
    { label: 'Mobile', vcard: 'voice,cell' },
    { label: 'Home', vcard: 'voice,home' },
    { label: 'Work', vcard: 'voice,work' },
    { label: 'Main', vcard: 'voice', abLabel: 'Main' },
    { label: 'Custom', vcard: 'voice', custom: true },
  ],
  fax: [
    { label: 'Work fax', vcard: 'fax,work' },
    { label: 'Home fax', vcard: 'fax,home' },
    { label: 'Custom', vcard: 'fax', custom: true },
  ],
  email: [
    { label: 'Work', vcard: 'work' },
    { label: 'Home', vcard: 'home' },
    { label: 'Other', vcard: '' },
    { label: 'Custom', vcard: '', custom: true },
  ],
  address: [
    { label: 'Work', vcard: 'work' },
    { label: 'Home', vcard: 'home' },
    { label: 'Other', vcard: '' },
    { label: 'Custom', vcard: '', custom: true },
  ],
}

/** The chosen type, or the group's first entry as a fallback. */
export function contactTypeFor(
  group: ContactTypeGroup,
  label: string | null | undefined,
): ContactType {
  const types = CONTACT_TYPES[group]
  return types.find((t) => t.label === label) ?? types[0]!
}

/**
 * The X-ABLabel to emit for a row, or null when TYPE already says everything.
 * A 'Custom' row with nothing typed in falls back to no label rather than an
 * empty one, which some readers render as a blank field name.
 */
export function abLabelFor(
  type: ContactType,
  customLabel: string | null | undefined,
): string | null {
  if (type.custom) return customLabel?.trim() || null
  return type.abLabel ?? null
}

/** Contact rows: phone, email, website. Sorted by `order`. */
export interface PrimaryAction extends ActionBase {
  order: number
  isURL?: Flag
  /**
   * Set on rows that offer a type dropdown, and the reason they are
   * repeatable: one entry per number or address, each choosing its own type.
   * Phone replaced three fixed Mobile/Office/Home actions whose *names* used
   * to carry the type; Email followed for the same reason.
   */
  typeGroup?: ContactTypeGroup
  /** The currently selected `ContactType.label` within `typeGroup`. */
  contactType?: string
  /**
   * Set on rows that collect several values instead of one, which is what let
   * Address and Work move in here from the fixed Contact-information block —
   * an address only becomes repeatable once it is an action like any other.
   * `value` stays null on these; the data lives in `values`.
   */
  fields?: readonly ActionField[]
  /**
   * The vCard property this action's link belongs in, when RFC 6350 defines
   * one for it. Unset means URL.
   *
   * `CALURI` (6.9.3) is the calendar, `IMPP` (6.4.3) an instant-messaging
   * URI. XMPP qualifies and the other messengers do not: `xmpp:` is a real IM
   * URI scheme, whereas t.me and wa.me links are ordinary web pages, and a
   * reader that skips IMPP values it cannot parse would drop them entirely —
   * a URL at least always shows.
   */
  vcardProperty?: string
  /**
   * Values for `fields`, keyed by `ActionField.key`. Always cloned when a
   * repeatable row is added: sharing the template's object would make every
   * address on the card the same address.
   */
  values?: Record<string, string | null>
}

/** One input inside a multi-field action row. */
export interface ActionField {
  key: string
  label: string
  placeholder?: string
  /** Browser autofill hint, so an address can be filled in one gesture. */
  autocomplete?: string
  /** Give the field a whole row of the two-column grid. */
  wide?: true
}

/** Browsing groups used by the primary action picker in the editor. */
export type PrimaryActionCategory = 'contact' | 'messaging' | 'meetings' | 'web'

/** Social rows. Sorted by name, and rendered as coloured chips. */
export interface SecondaryAction extends ActionBase {
  /**
   * The chip's background. A flat hex for every action — it is assigned to
   * `background`, so a gradient still parses, but App Store was the only one
   * that used that and it now matches the rest.
   */
  color: string
  /** Set when `color` is pale enough to need dark foreground text. */
  light?: Flag
  /** Icon carries its own gradient `<defs>` and needs id randomisation. */
  gradientIcon?: Flag
  /**
   * A profile the app has no entry for: the user supplies the name, the link,
   * the chip colour and the icon themselves.
   */
  custom?: Flag
  /**
   * Sanitised SVG source for a custom row, inlined in place of a bundled icon.
   * Always the output of `sanitiseSVG()` — it goes straight into `v-html` and
   * into the exported card, so raw upload text must never reach it.
   */
  customIcon?: string | null
}

/** Browsing groups used by the profile picker in the editor. */
export type SecondaryActionCategory =
  | 'social'
  | 'creative'
  | 'media'
  | 'developer'
  | 'publishing'
  | 'support'
  | 'community'
  | 'apps'
  | 'shops'

/**
 * A one-click font choice in the editor.
 *
 * `link` and `css` are copied verbatim into `genInfo.fontLink` / `fontCss`, so
 * each must be exactly what a user would otherwise paste by hand: a
 * `<link rel="stylesheet">` tag, and a `font-family` declaration. Preview.vue
 * re-parses both (see app/utils/fonts.ts) rather than trusting them, so
 * a preset goes down the same path as typed input.
 *
 * The `default` preset carries empty strings, which clear both fields and let
 * the card fall back to its own `sans-serif`.
 */
export interface FontPreset {
  id: string
  name: string
  /** Short note on the typeface's character, e.g. 'Geometric sans'. */
  note: string
  link: string
  css: string
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
export type ResizeTarget =
  | ImageSlot
  | 'image'
  | 'music'
  | 'product'
  | 'carousel'

/**
 * resizeImage()'s signature, shared so the components that receive it as a
 * prop cannot each guess a different one. `index1`/`index2` are the featured
 * section and content indices, omitted for the ImageSlot targets; `index3` is
 * the slide within a carousel, and only 'carousel' uses it.
 */
export type ResizeImage = (
  target: ResizeTarget,
  mime: string,
  index1?: number,
  index2?: number,
  index3?: number,
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

/**
 * Whether a product has anything worth putting on the card.
 *
 * Preview.vue used to gate the whole showcase on `title`, so a product with a
 * photo and a price but no title vanished from the card with nothing to say
 * why. Any one of these fields is a product worth showing; the button needs
 * both halves, because a label with no link is not something to click.
 */
export function hasProductContent(product: ProductContent): boolean {
  return Boolean(
    product.image ||
    product.title ||
    product.description ||
    product.price ||
    (product.label && product.link),
  )
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
/**
 * What a carousel may hold: everything a section can, except an embed and
 * another carousel.
 *
 * The union is the guard against nesting — there is no `CarouselContent` arm,
 * so a carousel inside a carousel does not typecheck rather than merely being
 * discouraged. Embeds are left out because they are bare strings with no
 * `contentType`, and an iframe inside a snapping scroller swallows the swipe.
 */
export type CarouselSlide =
  | MediaContent
  | ProductContent
  | TextContent
  | ReviewContent

/**
 * A horizontal strip of slides, held as one item in a section.
 *
 * Media slides stay ordinary `MediaContent`, so the attach path, the cover
 * handling and the export packaging all work unchanged.
 */
export interface CarouselContent {
  contentType: 'carousel'
  slides: CarouselSlide[]
}

/** Whether a slide carries anything worth rendering. */
export function hasSlideContent(slide: CarouselSlide): boolean {
  switch (slide.contentType) {
    case 'media':
      return true
    case 'product':
      return hasProductContent(slide)
    case 'review':
      return hasReviewContent(slide)
    case 'text':
      return Boolean(slide.value?.trim())
    default: {
      // Unreachable — every arm of CarouselSlide is handled above. The
      // assignment to `never` is the point: adding a slide kind without
      // teaching this function about it becomes a compile error, rather than
      // a slide that silently renders as nothing.
      const exhaustive: never = slide
      return exhaustive
    }
  }
}

/**
 * Whether a carousel has at least one slide worth rendering.
 *
 * Not the same as `slides.length`. A carousel arrives with its first slide
 * already in place, so gating on the count alone puts an empty bordered box on
 * the card the moment someone adds a carousel and then types nothing into it —
 * the trap `hasProductContent` already closes for products.
 */
export function hasCarouselContent(carousel: CarouselContent): boolean {
  return carousel.slides.some(hasSlideContent)
}

/**
 * The file name a carousel slide gets inside the export's media/ folder.
 *
 * Positional rather than title-derived, unlike the other media entries. Those
 * name the file after the user's title, which collides the moment two of them
 * match — and a carousel invites attaching eight photos at once, where
 * duplicate or empty titles are the norm rather than the exception. JSZip
 * silently keeps only the last entry written to a given path, so a collision
 * costs slides with no error anywhere.
 *
 * Preview.vue builds the <img src> from this and downloadPackage() writes the
 * file with it; they must not drift, which is why it lives in one function.
 */
export function slideFileName(
  section: number,
  item: number,
  slide: number,
  ext: string,
): string {
  return `carousel_${section}_${item}_${slide}.${ext}`
}

/**
 * The file name a non-carousel media entry or product image gets in media/.
 *
 * Title-derived, and kept that way: these names are visible in the exported
 * folder and `song.mp3` is worth more to someone editing their own card by
 * hand than `media_0_3.mp3`. Carousel slides are the exception — see
 * `slideFileName()` for why they are positional instead.
 *
 * The rule itself was copied into four components and downloadPackage(), each
 * as a private `getTitle()`; the manifest would have made six. They must all
 * agree, because Preview.vue writes the `<img src>`, downloadPackage() writes
 * the file and the manifest records the path. A null title is tolerated here
 * rather than thrown on, which is what the inline copies in index.vue did.
 */
export function mediaFileName(
  title: string | null | undefined,
  ext: string,
): string {
  return `${(title ?? '').toLowerCase().split(' ').join('_')}.${ext}`
}

/**
 * The empty items a section or carousel starts from.
 *
 * Factories rather than shared constants: every one of these is pushed into a
 * reactive array and then edited in place, so handing out one frozen object
 * would make every product on the card the same product — the bug the cloning
 * note on `PrimaryAction.values` describes.
 *
 * There is deliberately no `emptyMedia()`. A `MediaContent` cannot exist
 * without its `file`, so media arrives by attachment and never as a blank row.
 */
export function emptyProduct(): ProductContent {
  return {
    contentType: 'product',
    image: null,
    title: null,
    description: null,
    price: null,
    label: null,
    link: null,
  }
}

export function emptyText(): TextContent {
  return { contentType: 'text', value: null }
}

export function emptyReview(): ReviewContent {
  return {
    contentType: 'review',
    author: null,
    rating: null,
    body: null,
    source: null,
    link: null,
    date: null,
  }
}

export function emptyCarousel(): CarouselContent {
  return { contentType: 'carousel', slides: [] }
}

/** What a preset drops into a new section, if anything. */
export type FeaturedSeed = 'product' | 'text' | 'review' | 'carousel' | null

/**
 * A starting point for a new section.
 *
 * The old flow gave every section the title 'Section title' and no content,
 * which left the most common cases — a price list, a gallery, testimonials —
 * as three or four clicks of setup that every user repeated identically. A
 * preset is only that setup: a title and one empty item. Nothing here is
 * locked afterwards, so a section started from `services` is an ordinary
 * section that happens to already contain a product.
 */
export interface FeaturedPreset {
  id: string
  /** Button text in the editor. */
  label: string
  /** The section title the card starts with; the user renames it freely. */
  title: string
  seed: FeaturedSeed
  /** An icon name from `app/assets/icons`. */
  icon: string
}

export const FEATURED_PRESETS: readonly FeaturedPreset[] = [
  {
    id: 'blank',
    label: 'Blank section',
    title: 'Section title',
    seed: null,
    icon: 'add',
  },
  {
    id: 'services',
    label: 'Services & pricing',
    title: 'Services',
    seed: 'product',
    icon: 'product',
  },
  {
    id: 'gallery',
    label: 'Photo gallery',
    title: 'Gallery',
    seed: 'carousel',
    icon: 'carousel',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    title: 'What clients say',
    seed: 'review',
    icon: 'review',
  },
  { id: 'about', label: 'About', title: 'About', seed: 'text', icon: 'text' },
  { id: 'faq', label: 'FAQ', title: 'FAQ', seed: 'text', icon: 'text' },
]

/** A new section built from a preset. */
export function newSection(preset: FeaturedPreset): FeaturedSection {
  const content: FeaturedContent[] = []
  switch (preset.seed) {
    case 'product':
      content.push(emptyProduct())
      break
    case 'text':
      content.push(emptyText())
      break
    case 'review':
      content.push(emptyReview())
      break
    case 'carousel':
      content.push(emptyCarousel())
      break
    case null:
      break
    default: {
      // Same guard as hasSlideContent(): a new seed kind must be handled here
      // or the build fails, rather than silently producing an empty section.
      const exhaustive: never = preset.seed
      return exhaustive
    }
  }
  return { title: preset.title, content }
}

/**
 * Whether a media entry ships a separate cover image in the export.
 *
 * Music and documents get one; video does not, because its poster frame is
 * captured into the entry itself. `info` marks an entry whose cover could not
 * be produced — 'No Thumb' or 'No ID3 Tag' — and those have no file to write.
 *
 * Shared so the manifest cannot claim a cover the zip never wrote: the two
 * used to be one inline regex in downloadPackage() with no second reader.
 */
export function hasCoverFile(media: MediaContent): boolean {
  return /music|document/i.test(media.type) && !media.info
}

/**
 * A customer review or testimonial the card owner has transcribed.
 *
 * `source` and `link` exist so a review can point at where it came from —
 * "Google" with a link to the listing is a checkable claim, an unattributed
 * quote is not, and the difference is most of why a visitor believes it.
 * Neither is required; a testimonial given directly to the owner has no URL.
 */
export interface ReviewContent {
  contentType: 'review'
  author: string | null
  /** Whole stars, 1-5. Null renders no stars at all, for a bare quote. */
  rating: number | null
  body: string | null
  /** Where it was left — Google, Yelp, Angi. Free text, shown as given. */
  source: string | null
  link: string | null
  date: string | null
}

/** The star range a review may carry. Out-of-range values render no stars. */
export const MAX_RATING = 5

/**
 * A review worth rendering. The body is what carries it — a star rating with
 * no words is not a testimonial, and an author alone is nothing at all.
 */
export function hasReviewContent(review: ReviewContent): boolean {
  return Boolean(review.body?.trim())
}

/**
 * Filled stars for a rating, clamped to 0-5 and rounded to a whole star.
 *
 * Returns 0 for null, NaN or anything out of range, which renders no stars
 * rather than a broken row: the rating comes from a number input the user can
 * type anything into.
 */
export function starCount(rating: number | null): number {
  if (rating === null || !Number.isFinite(rating)) return 0
  return Math.min(MAX_RATING, Math.max(0, Math.round(rating)))
}

export type FeaturedContent =
  | string
  | MediaContent
  | ProductContent
  | TextContent
  | CarouselContent
  | ReviewContent

export interface FeaturedSection {
  title: string
  content: FeaturedContent[]
}

export interface VCardUrl {
  title: string
  url: string
  /**
   * The property to emit this under. Defaults to URL, which is right for a
   * link to a page; the two exceptions are properties RFC 6350 defines for
   * exactly this content, and a reader that knows them can act on them
   * (offer to message, subscribe to the calendar) instead of just opening a
   * browser. See `PrimaryAction.vcardProperty`.
   */
  property?: string
}

/**
 * One TEL or EMAIL line. `type` is already the RFC 6350 TYPE parameter value,
 * not the editor's label, so buildVCard() needs no further lookup. An empty
 * `type` emits no TYPE parameter; a non-null `label` adds an X-ABLabel, which
 * means the property has to be emitted inside a group.
 */
export interface VCardTyped {
  type: string
  label: string | null
  value: string
}

/** ADR's components, already resolved from `CardAddress`. */
export interface VCardAddress {
  type: string
  label: string | null
  street: string | null
  city: string | null
  region: string | null
  postcode: string | null
  country: string | null
}

/** Flattened contact data, assembled by index.vue's `vCard` computed. */
export interface VCardData {
  prefix: string | null
  fn: string | null
  mn: string | null
  ln: string | null
  suffix: string | null
  phoneticFirst: string | null
  phoneticLast: string | null
  nickname: string | null
  title: string | null
  org: string | null
  dept: string | null
  /** One per Address row that has any component filled in. */
  addresses: VCardAddress[]
  /** Carried as `X-PRONOUNS`; RFC 6350 registers no property for these. */
  pronouns: string | null
  /**
   * One entry per filled Phone / Email row, in the order the card lists them.
   * Phones were three fixed `cell`/`work`/`home` slots and email a single
   * string, all of which emitted an empty `TEL;TYPE=…:` / `EMAIL;TYPE=WORK:`
   * line whenever the user had not filled them in.
   */
  phones: VCardTyped[]
  emails: VCardTyped[]
  sms: string | null
  /**
   * The Website action. Deliberately not the Hosting step's "Hosted card URL":
   * that one configures where the export will be published, and it is not a
   * fact about the person, so it has no business in their contact record.
   */
  website: string | null
  urls: VCardUrl[]
  /** base64 of the PGP key, only set when it passes validation. */
  key: string | null
  note: string | null
  /**
   * `data:` URIs for the profile photo and business logo, so the saved contact
   * carries its own artwork instead of a link that dies when the site moves.
   *
   * Resolved at download time rather than in the `vCard` computed: turning a
   * Blob into base64 is asynchronous, and holding the encoded copy in reactive
   * state would re-run every dependent computed on each keystroke.
   */
  photo: string | null
  logo: string | null
  /**
   * A `urn:uuid:` URI, generated once per session. RFC 6350 6.7.6 wants a URI,
   * and a stable one means re-importing an updated card revises the existing
   * contact instead of creating a duplicate.
   */
  uid: string
}

export interface DownloadCheckItem {
  label: string
  checked: boolean
}

/** Themes A, B and C — the numbers index T1/T2/T3.min.css. */
export type ThemeId = 1 | 2 | 3
