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
export type PrimaryActionCategory = 'contact' | 'messaging' | 'web'

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
 * re-parses both (`getCssHref`, `getFontFamily`) rather than trusting them, so
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
  index2?: number,
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
