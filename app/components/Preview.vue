<template>
  <div
    class="overflow-y-scroll max-hd border-t-0 border-4 border-black bg-gray-900"
  >
    <div :id="`Theme${theme}`">
      <html
        ref="html"
        lang="en"
        :style="{ backgroundColor: `${colors.logoBg.color}` }"
      >
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta v-if="!PreviewMode" name="robots" content="noindex, nofollow" />
          <meta
            name="author"
            content="EnBizCard - An Open-Source Digital Business Card Generator"
          />
          <meta name="url" content="https://enbizcard.vishnuraghav.com/" />
          <meta name="designer" content="Vishnu Raghav" />
          <meta
            property="og:title"
            :content="`${getFullname}'s Digital Business Card`"
          />
          <meta
            property="twitter:title"
            :content="`${getFullname}'s Digital Business Card`"
          />
          <!--
            The trailing-slash redirect script is no longer part of this
            template: Vue 3's compiler rejects <script> tags in templates, and
            creating one dynamically would execute it inside the generator.
            It is injected into the exported card's <head> by downloadPackage(),
            alongside the qrcode/modal/media scripts.
          -->
          <link
            v-for="href in getCssHrefs"
            :key="href"
            :href="href"
            rel="stylesheet"
          />
          <title>{{ getFullname }}'s Digital Business Card</title>
          <!-- `<component :is="'style'">` renders a real <style> element while
               sidestepping Vue 3's ban on <style> tags in templates. -->
          <component :is="'style'">
            #body{ font-family: sans-serif; }
            input[type='range']::-moz-range-track { background: none; }
            input[type='range']::-moz-range-thumb { -moz-appearance: none;
            width: 1.5rem; height: 1.5rem; border-radius:
            {{ theme === 1 ? '100%' : '0.25rem' }}; border: none; background:
            {{ colors.buttonBg.color }}; z-index: 3; cursor: pointer; }
            input[type='range']::-webkit-slider-thumb { -webkit-appearance:
            none; width: 1.5rem; height: 1.5rem; border-radius:
            {{ theme === 1 ? '100%' : '0.25rem' }}; border: none; background:
            {{ colors.buttonBg.color }}; z-index: 3; cursor: pointer; }
            .closeColor{ {{ hasLightBG('mainBg') ? 'filter:invert(1) ' : '' }} }
            .topAction { {{ hasLightBG('logoBg') ? 'filter:invert(1) ' : '' }}}
            .iconColor{ color:#eee;
            {{ hasLightBG('buttonBg') ? 'filter:invert(1)' : null }} }
            {{ getTextColourRules }} .seekbarColor{
            {{ `background:${colors.buttonBg.color}80 !important` }} }
          </component>
          <component :is="'style'" v-if="theme == 3">
            #info{ border-left: 0.25rem dashed {{ colors.buttonBg.color }} }
            .section{border-left: 0.25rem solid {{ colors.buttonBg.color }}}
          </component>
          <component :is="'style'" v-if="getFontRules">{{
            getFontRules
          }}</component>
        </head>
        <body id="body">
          <div
            id="modal"
            ref="modal"
            :style="{
              backgroundColor: colors.mainBg.color,
              visibility: 'hidden',
              top: '2rem',
              opacity: 0,
            }"
          >
            <a id="close" @click="closePublicKey()" class="closeColor">
              <div class="icon" v-html="$icon('close')"></div>
            </a>
            <div id="keyView">
              <p class="textColor">
                Use my public key to send me encrypted messages
              </p>
              <a
                :href="!PreviewMode && `./${getFullname}'s public key.asc`"
                download
                target="_blank"
                id="dlKey"
                rel="noreferrer"
                @click.prevent.capture="downloadKey()"
                :style="{
                  backgroundColor: `${colors.buttonBg.color}`,
                }"
                tabindex="-1"
              >
                <div class="icon iconColor" v-html="$icon('download')"></div>
                <span class="iconColor">Download Key</span>
              </a>
            </div>
            <div id="copyView" ref="copyView">
              <p class="textColor">
                Copy and send the URL to share my Business Card
              </p>
              <button
                id="copyURL"
                :style="{
                  backgroundColor: `${colors.buttonBg.color}`,
                }"
              >
                <div class="icon iconColor" v-html="$icon('copy')"></div>
                <span class="iconColor">Copy URL</span>
              </button>
            </div>
            <div id="qrView" ref="qrView" class="textColor">
              <div id="qr"></div>
              <h3>Scan the QR Code</h3>
              <p>to view my Business Card on another device</p>
            </div>
          </div>
          <header>
            <div
              id="topActions"
              :style="{ display: PreviewMode ? 'flex' : 'none' }"
            >
              <div>
                <a id="share" @click.prevent.capture="sharingAlert()">
                  <div class="icon topAction" v-html="$icon('share')"></div>
                </a>
                <a id="showQR" @click.prevent.capture="sharingAlert()"
                  ><div class="icon topAction" v-html="$icon('qrcode')"></div>
                </a>
              </div>
              <a
                v-if="pubKeyIsValid"
                id="showKey"
                @click.prevent.capture="showKey()"
                ><div class="icon topAction" v-html="$icon('key')"></div>
              </a>
            </div>
            <div class="headerImgC">
              <img
                id="cover"
                v-if="images.cover.url"
                :src="
                  PreviewMode ? images.cover.url : `./cover.${images.cover.ext}`
                "
                alt="Background Pattern"
              />
              <img
                id="logo"
                v-if="images.logo.url"
                :src="
                  PreviewMode ? images.logo.url : `./logo.${images.logo.ext}`
                "
                :style="{
                  margin: images.photo.url
                    ? images.cover.url
                      ? '3rem 0 6rem'
                      : '3rem 0 8rem'
                    : '3rem 0',
                }"
                alt="Logo"
              />
            </div>
          </header>
          <main
            :style="{
              backgroundColor: `${colors.mainBg.color}`,
              marginTop: `${hasOnlyProfilePic ? '5rem' : '0'}`,
            }"
          >
            <img
              id="profilePhoto"
              v-if="images.photo.url"
              :src="
                PreviewMode ? images.photo.url : `./photo.${images.photo.ext}`
              "
              alt="Photo"
            />
            <div id="info" class="textColor">
              <p class="name">
                {{ getFullname }}
              </p>
              <p v-if="genInfo.pronouns" class="pronouns">
                ({{ genInfo.pronouns }})
              </p>
              <p class="jobtitle">
                {{ workValues.title }}
              </p>
              <!-- Reuses .jobtitle rather than adding a class, which would
                   mean editing three SCSS sources, three prebuilt .min.css
                   files and the three inline theme blocks in this file. -->
              <p v-if="workValues.dept" class="jobtitle">
                {{ workValues.dept }}
              </p>
              <p class="bizname">
                {{ workValues.org }}
              </p>
              <!-- Links, not text: the class is what main.ts looks up in the
                   exported card to swap these OpenStreetMap URLs for `geo:`
                   or Apple Maps ones, so an address opens the phone's own map
                   app. Without JS the href still resolves. A card can carry
                   several addresses, so each is labelled once there is more
                   than one to tell apart. -->
              <a
                v-for="(addr, i) in addressRows"
                :key="'ad' + i"
                class="bizaddr textColor"
                :data-address="addr.text"
                :href="addr.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <template v-if="addressRows.length > 1"
                  >{{ addr.label }}: </template
                >{{ addr.text }}
              </a>
            </div>
            <p class="sub textColor" v-if="genInfo.desc">
              {{ genInfo.desc }}
            </p>
            <a
              id="cta"
              rel="noreferrer"
              :href="!PreviewMode && `${username}.vcf`"
              download
              target="_blank"
              :style="{ backgroundColor: `${colors.buttonBg.color}` }"
              @click.prevent="downloadVcard"
              aria-label="Save Contact"
            >
              <div class="icon iconColor" v-html="$icon('add-user')"></div>
              <p class="iconColor">Save Contact</p>
            </a>
            <div class="actions">
              <div
                class="actionsC"
                v-for="(item, index) in buttonActions"
                :key="'pa' + index"
              >
                <div class="actionBtn">
                  <a
                    :href="getHref(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :style="{
                      backgroundColor: `${colors.buttonBg.color}`,
                    }"
                    :aria-label="item.name"
                  >
                    <div class="icon iconColor" v-html="$icon(item.icon)"></div>
                  </a>
                  <!-- Printed verbatim. The names in the action table are
                       already cased the way each service spells itself, so the
                       capitalise-first-letter this used to do was a no-op for
                       all of them but one — and wrong for that one (imo).
                       Repeatable rows show their type instead, so a card with
                       two numbers reads "Mobile" and "Office" rather than
                       "Phone" twice. -->
                  <p class="textColor">
                    {{ item.customLabel || item.contactType || item.name }}
                  </p>
                </div>
              </div>
            </div>
            <div class="actions secondary">
              <div
                class="actionsC"
                v-for="(item, index) in secondaryActions"
                :key="'sa' + index"
              >
                <div class="actionBtn secBtn">
                  <a
                    :href="getHref(item)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :style="{ background: item.color }"
                    :aria-label="item.customLabel || item.name"
                  >
                    <div class="icon" v-html="$getSVG(item)"></div>
                  </a>
                </div>
              </div>
            </div>
            <div
              class="featured"
              v-for="(item, index) in featured"
              :key="'fc' + index"
            >
              <h2 class="section textColor" v-if="item.title">
                {{ item.title }}
              </h2>
              <div v-for="(item, i) in item.content" :key="i">
                <div
                  v-if="item.contentType == 'media'"
                  class="media"
                  :class="item.type"
                  :style="{ backgroundColor: `${colors.cardBg.color}` }"
                >
                  <div v-if="item.type == 'image'">
                    <img
                      v-if="item.dataURI"
                      :src="
                        PreviewMode
                          ? item.dataURI
                          : `./media/${mediaFileName(item.title, item.ext)}`
                      "
                      alt="Product image"
                    />
                    <div class="controls cardColor">
                      <p class="title">
                        {{ item.title }}
                      </p>
                    </div>
                  </div>
                  <MediaPlayer
                    v-if="item.type == 'music' || item.type == 'video'"
                    ref="mediaPlayer"
                    :media="item"
                    :type="item.type"
                    :colors="colors"
                    :togglePlay="togglePlay"
                    :PreviewMode="PreviewMode"
                  />
                  <DocumentDownloader
                    v-if="item.type == 'document'"
                    :media="item"
                    :type="item.type"
                    :colors="colors"
                    :PreviewMode="PreviewMode"
                  />
                </div>
                <ProductShowcase
                  v-else-if="
                    item.contentType == 'product' && hasProductContent(item)
                  "
                  :product="item"
                  :colors="colors"
                  :PreviewMode="PreviewMode"
                />
                <!--
                  A scrolling strip, not a JS slideshow. Scroll-snap gives
                  swipe and trackpad panning with no script at all, so a card
                  whose inline JS never runs still shows every slide. The dots
                  below are rendered here; carousel.ts adds the arrows and
                  marks the active dot.
                -->
                <div
                  v-else-if="
                    item.contentType == 'carousel' && hasCarouselContent(item)
                  "
                  class="carousel"
                  :style="{ backgroundColor: `${colors.cardBg.color}` }"
                >
                  <div class="track">
                    <!--
                      `v-if` rather than a filtered list on purpose: `s` stays
                      the slide's index in item.slides, which is what
                      downloadPackage() names its file after. Filtering here
                      would shift the indices and point every <img> at the
                      wrong file.
                    -->
                    <template v-for="(slide, s) in item.slides" :key="'s' + s">
                      <div class="slide" v-if="hasSlideContent(slide)">
                        <template v-if="slide.contentType == 'media'">
                          <img
                            v-if="slide.type == 'image'"
                            :src="
                              PreviewMode
                                ? slide.dataURI
                                : `./media/${slideFileName(index, i, s, slide.ext)}`
                            "
                            :alt="slide.title ?? ''"
                          />
                          <MediaPlayer
                            v-else
                            ref="mediaPlayer"
                            :media="slide"
                            type="video"
                            :colors="colors"
                            :togglePlay="togglePlay"
                            :PreviewMode="PreviewMode"
                            :exportName="slideFileName(index, i, s, slide.ext)"
                          />
                          <p
                            v-if="slide.type == 'image' && slide.title"
                            class="caption cardColor"
                          >
                            {{ slide.title }}
                          </p>
                        </template>
                        <ProductShowcase
                          v-else-if="slide.contentType == 'product'"
                          :product="slide"
                          :colors="colors"
                          :PreviewMode="PreviewMode"
                          :exportName="
                            slide.image
                              ? slideFileName(index, i, s, slide.image.ext)
                              : null
                          "
                        />
                        <div
                          v-else-if="slide.contentType == 'review'"
                          class="review"
                        >
                          <p
                            v-if="starCount(slide.rating)"
                            class="stars"
                            :aria-label="`${starCount(slide.rating)} out of 5`"
                          >
                            <span aria-hidden="true">{{
                              stars(slide.rating)
                            }}</span>
                          </p>
                          <p class="textC cardColor">{{ slide.body }}</p>
                          <p class="attribution cardColor">
                            <span v-if="slide.author">{{ slide.author }}</span>
                            <span v-if="slide.source">
                              {{ slide.author ? ' · ' : '' }}
                              <a
                                v-if="slide.link"
                                class="cardColor"
                                :href="slide.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ slide.source }}</a
                              >
                              <template v-else>{{ slide.source }}</template>
                            </span>
                            <span v-if="slide.date"> · {{ slide.date }}</span>
                          </p>
                        </div>
                        <p v-else class="textC cardColor">{{ slide.value }}</p>
                      </div>
                    </template>
                  </div>
                  <div class="cDots" :aria-hidden="true">
                    <template v-for="(slide, s) in item.slides" :key="'d' + s">
                      <span v-if="hasSlideContent(slide)" class="cDot"></span>
                    </template>
                  </div>
                </div>
                <div
                  v-else-if="
                    item.contentType == 'review' && hasReviewContent(item)
                  "
                  class="media review"
                  :style="{ backgroundColor: `${colors.cardBg.color}` }"
                >
                  <!--
                    Text stars rather than SVG: they inherit colour and size
                    from the theme with no CSS, and add nothing to the export.
                  -->
                  <p
                    v-if="starCount(item.rating)"
                    class="stars"
                    :aria-label="`${starCount(item.rating)} out of 5`"
                  >
                    <span aria-hidden="true">{{ stars(item.rating) }}</span>
                  </p>
                  <p class="textC cardColor">{{ item.body }}</p>
                  <p class="attribution cardColor">
                    <span v-if="item.author">{{ item.author }}</span>
                    <span v-if="item.source">
                      {{ item.author ? ' · ' : '' }}
                      <a
                        v-if="item.link"
                        class="cardColor"
                        :href="item.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ item.source }}</a
                      >
                      <template v-else>{{ item.source }}</template>
                    </span>
                    <span v-if="item.date"> · {{ item.date }}</span>
                  </p>
                </div>
                <div
                  v-else-if="item.contentType == 'text' && item.value"
                  class="media"
                  :style="{ backgroundColor: `${colors.cardBg.color}` }"
                >
                  <p class="textC cardColor">{{ item.value }}</p>
                </div>
                <div
                  v-else-if="stripAttr(item)"
                  class="media embedded"
                  :style="{ backgroundColor: `${colors.cardBg.color}` }"
                >
                  <iframe
                    :src="stripAttr(item)"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </main>
          <footer
            v-if="footerCredit"
            :style="{ backgroundColor: `${colors.mainBg.color}` }"
            class="textColor"
          >
            Created with
            <a
              class="textColor"
              href="https://enbizcard.vishnuraghav.com/"
              target="_blank"
              rel="noopener noreferrer"
              >EnBizCard</a
            >
          </footer>
        </body>
      </html>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import MediaPlayer from './MediaPlayer.vue'
import DocumentDownloader from './DocumentDownloader.vue'
import ProductShowcase from './ProductShowcase.vue'
import type {
  CardColours,
  CardImages,
  ColourSlot,
  FeaturedContent,
  FeaturedSection,
  GenInfo,
  PrimaryAction,
  SecondaryAction,
} from '~/types/card'
import {
  hasCarouselContent,
  hasProductContent,
  hasReviewContent,
  hasSlideContent,
  HEADING_SELECTORS,
  MAX_RATING,
  mediaFileName,
  slideFileName,
  starCount,
} from '~/types/card'
import { formatAddress, hasAddress, mapSearchURL } from '~/utils/address'
import { resolveEmbed } from '~/utils/embed'
import { fontFamilyRule, stylesheetHrefs } from '~/utils/fonts'

export default defineComponent({
  props: {
    username: { type: String, default: 'username' },
    genInfo: { type: Object as PropType<GenInfo>, required: true },
    images: { type: Object as PropType<CardImages>, required: true },
    featured: { type: Array as PropType<FeaturedSection[]>, required: true },
    colors: { type: Object as PropType<CardColours>, required: true },
    primaryActions: {
      type: Array as PropType<PrimaryAction[]>,
      required: true,
    },
    secondaryActions: {
      type: Array as PropType<SecondaryAction[]>,
      required: true,
    },
    /** False only while downloadPackage() serialises this DOM for export. */
    PreviewMode: { type: Boolean, default: true },
    downloadVcard: { type: Function as PropType<() => void>, required: true },
    downloadKey: { type: Function as PropType<() => void>, required: true },
    footerCredit: { type: Boolean, default: true },
    showAlert: {
      type: Function as PropType<(message: string) => void>,
      required: true,
    },
    hasLightBG: {
      type: Function as PropType<(slot: ColourSlot) => boolean>,
      required: true,
    },
    pubKeyIsValid: { type: Boolean, default: false },
  },
  components: {
    MediaPlayer,
    DocumentDownloader,
    ProductShowcase,
  },
  data() {
    return {
      hasInstagramEmbed: false,
    }
  },
  setup() {
    // Replaces the Vuex store that previously held the selected theme.
    return { theme: useTheme() }
  },
  computed: {
    getFullname(): string | null {
      const parts = [
        this.genInfo.prefix,
        this.genInfo.fname,
        this.genInfo.mname,
        this.genInfo.lname,
        this.genInfo.suffix,
      ].filter(Boolean)
      return parts.length > 0 ? parts.join(' ') : null
    },
    /**
     * The Work row's three values, or empty ones until a Work row is added.
     * These were fixed genInfo fields before Work became a primary action.
     */
    workValues(): Record<string, string | null> {
      return (
        this.primaryActions.find((a) => a.name === 'Work')?.values ?? {
          title: null,
          dept: null,
          org: null,
        }
      )
    },
    /** One entry per Address row with anything filled in. */
    addressRows(): { label: string; text: string; url: string }[] {
      return this.primaryActions
        .filter((a) => a.name === 'Address' && hasAddress(a.values))
        .map((a) => ({
          label: a.customLabel || a.contactType || 'Address',
          text: formatAddress(a.values),
          url: mapSearchURL(a.values),
        }))
    },
    /**
     * Only the rows that render as a tappable circle. Address and Work carry
     * several values and are drawn in the header instead, so leaving them in
     * would put an icon with no single link under the Save Contact button.
     */
    buttonActions(): PrimaryAction[] {
      return this.primaryActions.filter((a) => !a.fields)
    },
    hasOnlyProfilePic(): boolean {
      return !(this.images.cover.url || this.images.logo.url)
    },
    // A `getFeaturedMusic` computed and a `paused` array used to live here,
    // along with a watcher between them. `featured` is a list of sections, so
    // `featured.music` was always undefined: the watcher never fired and
    // nothing read `paused`. Removed rather than typed.
    /** Every font stylesheet the card needs, body and heading together. */
    getCssHrefs(): string[] {
      const hrefs = stylesheetHrefs(this.genInfo.fontLink)
      for (const href of stylesheetHrefs(this.genInfo.headingLink)) {
        // The two roles frequently share one request — the same preset picked
        // for both, or one Google URL carrying two families.
        if (!hrefs.includes(href)) hrefs.push(href)
      }
      return hrefs
    },
    /**
     * The font rules for the card, or '' when neither role has one.
     *
     * Built here rather than interpolated in the template so the selectors and
     * the braces are in one place; a `<style>` assembled across template lines
     * is where an unbalanced brace hides.
     */
    getFontRules(): string {
      const rules: string[] = []
      const body = fontFamilyRule(this.genInfo.fontCss)
      const heading = fontFamilyRule(this.genInfo.headingCss)
      if (body) rules.push(`#body{${body};}`)
      // Emitted second so it wins over #body on equal specificity, and only
      // when set — otherwise headings inherit the body font, which is the
      // behaviour every card had before headings could differ.
      if (heading) rules.push(`${HEADING_SELECTORS}{${heading};}`)
      return rules.join('\n')
    },
    /**
     * Text colour, split into headings and body over the same selectors the
     * heading font claims — so the two settings can never disagree about what
     * counts as a heading.
     *
     * The heading rule is emitted second because it has to win on equal
     * specificity: `.section` and `.title` carry `.textColor`/`.cardColor` as
     * well, and both rules are `!important`.
     */
    getTextColourRules(): string {
      return [
        `#body :is(.textColor, .cardColor){color:${this.colors.bodyFg.color} !important;}`,
        `${HEADING_SELECTORS}{color:${this.colors.headingFg.color} !important;}`,
      ].join('\n')
    },
  },
  methods: {
    getHref(e: PrimaryAction | SecondaryAction): string | null {
      let value = null
      if (e.name === 'Viber' && e.value)
        value = e.value.replaceAll(/[\s\-()]/g, '').replace(/\+/, '%2B')
      return e.href
        ? e.href + (value || e.value) + (e.hrefEnd ? e.hrefEnd : '')
        : value || e.value
    },
    /** Options API templates cannot see imports; re-expose them as methods. */
    hasCarouselContent,
    hasProductContent,
    hasReviewContent,
    hasSlideContent,
    mediaFileName,
    slideFileName,
    starCount,
    /** The filled/empty star row for a rating, as text. */
    stars(rating: number | null): string {
      const filled = starCount(rating)
      return '★'.repeat(filled) + '☆'.repeat(MAX_RATING - filled)
    },
    /**
     * The embeddable src for a link entry, or null if it resolves to nothing.
     *
     * Bare strings are the link entries; everything else carries a
     * contentType. See app/utils/embed.ts for what is accepted.
     */
    stripAttr(val: FeaturedContent): string | null {
      return typeof val === 'string' ? resolveEmbed(val) : null
    },
    toggleContainer(e: HTMLElement): void {
      if (e.style.top === '2rem') {
        e.style.visibility = 'visible'
        e.style.top = '0px'
        e.style.opacity = '1'
      } else {
        e.style.top = '2rem'
        e.style.opacity = '0'
        setTimeout(() => {
          e.style.visibility = 'hidden'
        }, 200)
      }
    },
    showKey(): void {
      const modal = this.$refs.modal as HTMLElement
      const copyView = this.$refs.copyView as HTMLElement
      const qrView = this.$refs.qrView as HTMLElement
      this.toggleContainer(modal)
      copyView.style.display = qrView.style.display = 'none'
    },
    closePublicKey(): void {
      this.toggleContainer(this.$refs.modal as HTMLElement)
    },
    sharingAlert(): void {
      this.showAlert(
        'You are able to share your business card after completing the hosting process.\n\nCheck out the <a class="underline font-extrabold text-emerald-600 hover:text-emerald-500 transition-colors duration-200" href="/demo" target="_blank">demo</a> to test the functionality.',
      )
    },
    /** Plays `ref` and pauses every other player, keeping the icons in sync. */
    togglePlay(ref: HTMLMediaElement): void {
      // Child MediaPlayer instances; only their $refs are touched here.
      const mediaPlayers = (this.$refs.mediaPlayer ?? []) as {
        $refs: Record<string, HTMLElement>
      }[]
      mediaPlayers.forEach((e) => {
        const mediaSource = e.$refs.mediaSource as HTMLMediaElement
        const play = e.$refs.play
        const pause = e.$refs.pause
        if (ref !== mediaSource) {
          mediaSource.pause()
          play.style.display = 'block'
          pause.style.display = 'none'
        } else if (mediaSource.paused) {
          // Mirrors media.ts: only show the playing state once play()
          // resolves, so an undecodable file doesn't leave a pause icon
          // over a seek bar that never moves.
          mediaSource
            .play()
            .then(() => {
              play.style.display = 'none'
              pause.style.display = 'block'
            })
            .catch(() => {
              play.style.display = 'block'
              pause.style.display = 'none'
            })
        } else {
          mediaSource.pause()
          play.style.display = 'block'
          pause.style.display = 'none'
        }
      })
    },
  },
  mounted() {
    setTimeout(() => {
      this.hasInstagramEmbed = true
    }, 5000)
  },
})
</script>

<style lang="scss">
#Theme1 {
  // General
  body {
    margin: 0 auto;
    width: 100%;
    padding: 0;
    max-width: 30rem;
    color: #eee;
    position: relative;
  }
  p {
    line-height: 1.5;
    margin: 0;
  }
  h2,
  h3 {
    margin: 0;
  }
  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  a {
    text-decoration: none;
    user-select: none;
  }

  // Modal
  #modal {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
    width: 100%;
    bottom: 0;
    transition:
      top 0.2s ease-out,
      opacity 0.1s ease-out;
    transform: translateZ(0);
  }
  #close {
    align-self: end;
    padding: 1rem;
    cursor: pointer;
    line-height: 0;
  }
  #keyView,
  #copyView,
  #qrView {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
    text-align: center;
    p {
      margin: 2rem;
      text-align: center;
    }
  }
  #copyURL,
  #dlKey {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 5rem;
    padding: 1rem 1.5rem;
    border: none;
    outline: none;
    cursor: pointer;
    box-sizing: border-box;
    span {
      margin-left: 0.5rem;
    }
  }
  #qrView {
    h3 {
      margin: 2rem 2rem 0;
    }
    p {
      margin: 0.5rem 2rem 0;
    }
  }
  #qr {
    margin: 2rem;
    padding: 2rem;
    background: #fff;
    border-radius: 0.5rem;
  }

  // Heder
  header {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }
  .headerImgC {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    // height: 100%;
    overflow: hidden;
  }
  #cover {
    grid-column: 1;
    grid-row: 1;
    width: 100%;
    height: 20rem;
    object-position: top center;
    object-fit: cover;
  }
  #logo {
    max-height: 6rem;
    max-width: 100%;
    pointer-events: none;
    user-select: none;
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    justify-self: center;
  }
  #topActions {
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: flex-start;
    & > div {
      display: flex;
    }
    a {
      padding: 1rem;
      cursor: pointer;
      line-height: 0;
    }
  }

  // Body
  main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  #profilePhoto {
    width: 10rem;
    height: 10rem;
    border-radius: 100%;
    box-sizing: content-box;
    pointer-events: none;
    user-select: none;
    margin-top: -6rem;
  }
  #info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
    line-height: 1.25;
    word-break: break-word;
  }
  .name {
    font-weight: bold;
    font-size: 1.5rem;
    margin: 0;
  }
  .pronouns {
    display: block;
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: normal;
    margin: 0 0 0.5rem;
  }
  .bizname {
    font-size: 0.9rem;
    margin: 0.5rem 0 0;
    opacity: 0.8;
  }
  .bizaddr {
    display: block;
    color: inherit;
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    font-size: 0.8rem;
    opacity: 0.6;
  }
  .sub,
  .textC {
    font-size: 1rem;
    white-space: pre-line;
    line-height: 1.5;
  }
  .sub {
    font-size: 0.9rem;
    margin: 0.5rem 0 0;
    opacity: 0.8;
  }
  .textC {
    margin: 1rem;
  }
  #cta {
    display: flex;
    align-items: center;
    border-radius: 5rem;
    margin-top: 2rem;
    padding: 1rem 1.5rem;
    cursor: pointer;
    line-height: 0;
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
    .icon {
      margin-right: 0.5rem;
    }
    p {
      margin: 0;
    }
  }
  .actions {
    width: 100%;
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .actionsC {
    width: 33.33%;
  }
  .actionBtn {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    a {
      border-radius: 100%;
      padding: 1rem;
      line-height: 0;
    }
    p {
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
    }
  }
  .secBtn {
    padding: 1rem;
  }

  // Featured Content
  .featured {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 2rem 0 0;
    width: 100%;
  }
  .section {
    font-weight: bold;
    text-align: center;
    font-size: 1.3rem;
    padding: 1rem 0;
  }
  .media {
    overflow: hidden;
    border-radius: 1rem;
    margin-top: 1rem;
    img {
      display: block;
      pointer-events: none;
      user-select: none;
      width: 100%;
    }
  }
  .carousel {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    margin-top: 1rem;
    // The strip itself. Scroll-snap does the paging, so the card still works
    // with no JavaScript; carousel.ts only adds the arrows.
    .track {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .slide {
      flex: 0 0 100%;
      // Without this a wide image forces the flex item past 100% and two
      // slides end up visible at once, which breaks the snap points.
      min-width: 0;
      scroll-snap-align: center;
      img {
        display: block;
        width: 100%;
        user-select: none;
      }
    }
    .caption {
      margin: 0;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .cNav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: 0;
      border-radius: 50%;
      padding: 0.25rem 0.6rem 0.4rem;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      &.prev {
        left: 0.5rem;
      }
      &.next {
        right: 0.5rem;
      }
    }
    .cDots {
      display: flex;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.5rem 0;
    }
    .cDot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      &.on {
        opacity: 0.9;
      }
    }
  }
  .review {
    padding: 1rem;
    .stars {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.1em;
    }
    // Beats the global `.textC { margin: 1rem }` on specificity.
    .textC {
      margin: 0.5rem 0 0;
    }
    .attribution {
      margin: 0.75rem 0 0;
      font-size: 0.85rem;
      opacity: 0.75;
    }
  }
  .embedded {
    position: relative;
    padding-top: 100%;
    // padding-top: 56.25%;
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .music,
  .video {
    width: 100%;
  }
  .mediaC {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
  video {
    width: 100%;
  }
  .controls {
    padding: 1rem;
    font-size: 0.9rem;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .pCtrl,
  .docDl {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .docDl {
    display: flex;
  }
  .seekBar {
    width: 100%;
    height: 0.5rem;
    margin: 1.5rem 0 0.5rem;
    border-radius: 5rem;
    appearance: none;
    cursor: pointer;
  }
  .playPause,
  .dlBtn {
    margin: 1rem 0 0.5rem;
    padding: 1rem;
    border-radius: 5rem;
    line-height: 0;
    cursor: pointer;
  }
  .pause {
    display: none;
  }

  // Product Card
  .title {
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
  }
  .price {
    margin: 1rem 0 0;
    font-size: 1rem;
    font-weight: bold;
  }
  .label {
    display: inline-block;
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
    border-radius: 5rem;
    letter-spacing: 1px;
    padding: 1rem 1.5rem;
    p {
      margin: 0;
    }
  }

  footer {
    padding: 4rem 1rem 2rem;
    font-size: 0.9rem;
    text-align: center;
    a {
      text-decoration: underline;
      color: inherit;
    }
  }
}
#Theme2 {
  // General
  body {
    margin: 0 auto;
    width: 100%;
    padding: 0;
    max-width: 30rem;
    color: #eee;
    position: relative;
  }
  p {
    line-height: 1.5;
    margin: 0;
  }
  h2,
  h3 {
    margin: 0;
  }
  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  a {
    text-decoration: none;
    user-select: none;
  }

  // Modal
  #modal {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
    width: 100%;
    bottom: 0;
    transition:
      top 0.2s ease-out,
      opacity 0.1s ease-out;
    transform: translateZ(0);
  }
  #close {
    align-self: end;
    padding: 1rem;
    cursor: pointer;
    line-height: 0;
  }
  #keyView,
  #copyView,
  #qrView {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
    text-align: center;
    p {
      margin: 2rem;
    }
  }
  #copyURL,
  #dlKey {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    padding: 1rem 1.5rem;
    border: none;
    outline: none;
    cursor: pointer;
    box-sizing: border-box;
    span {
      margin-left: 0.5rem;
    }
  }
  #qrView {
    h3 {
      margin: 2rem 2rem 0;
    }
    p {
      margin: 0.5rem 2rem 0;
    }
  }
  #qr {
    margin: 2rem;
    padding: 2rem;
    background: #fff;
    border-radius: 0.5rem;
  }

  // Heder
  header {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }
  .headerImgC {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    height: 100%;
    overflow: hidden;
  }
  #cover {
    grid-column: 1;
    grid-row: 1;
    width: 100%;
    height: 20rem;
    object-position: top center;
    object-fit: cover;
  }
  #logo {
    max-height: 6rem;
    max-width: 100%;
    pointer-events: none;
    user-select: none;
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    justify-self: center;
  }
  #topActions {
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: flex-start;
    & > div {
      display: flex;
    }
    a {
      padding: 1rem;
      cursor: pointer;
      line-height: 0;
    }
  }

  // Body
  main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  #profilePhoto {
    width: 10rem;
    height: 10rem;
    border-radius: 0.5rem;
    box-sizing: content-box;
    pointer-events: none;
    user-select: none;
    margin-top: -6rem;
  }
  #info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
    line-height: 1.25;
    word-break: break-word;
  }
  .name {
    font-weight: bold;
    font-size: 1.5rem;
    margin: 0;
  }
  .pronouns {
    display: block;
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: normal;
    margin: 0 0 0.5rem;
  }
  .bizname {
    font-size: 0.9rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.8;
  }
  .bizaddr {
    display: block;
    color: inherit;
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    font-size: 0.8rem;
    opacity: 0.6;
  }
  .sub,
  .textC {
    font-size: 1rem;
    white-space: pre-line;
    line-height: 1.5;
  }
  .sub {
    font-size: 0.9rem;
    margin: 0.5rem 0 0;
    opacity: 0.8;
  }
  .textC {
    margin: 1rem;
  }
  #cta {
    display: flex;
    align-items: center;
    border-radius: 0.5rem;
    margin-top: 2rem;
    padding: 1rem 1.5rem;
    cursor: pointer;
    line-height: 0;
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
    .icon {
      margin-right: 0.5rem;
    }
    p {
      margin: 0;
    }
  }
  .actions {
    width: 100%;
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .actionsC {
    width: 33.33%;
  }
  .actionBtn {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    a {
      border-radius: 0.5rem;
      padding: 1rem;
      line-height: 0;
    }
    p {
      margin: 0.5rem 0 0;
      font-size: 0.9rem;
    }
  }
  .secBtn {
    padding: 1rem;
  }

  // Featured Content
  .featured {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 2rem 0 0;
    width: 100%;
  }
  .section {
    font-weight: bold;
    text-align: center;
    font-size: 1.3rem;
    padding: 1rem 0;
  }
  .media {
    overflow: hidden;
    border-radius: 0.5rem;
    margin-top: 1rem;
    img {
      display: block;
      pointer-events: none;
      user-select: none;
      width: 100%;
    }
  }
  .carousel {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    margin-top: 1rem;
    // The strip itself. Scroll-snap does the paging, so the card still works
    // with no JavaScript; carousel.ts only adds the arrows.
    .track {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .slide {
      flex: 0 0 100%;
      // Without this a wide image forces the flex item past 100% and two
      // slides end up visible at once, which breaks the snap points.
      min-width: 0;
      scroll-snap-align: center;
      img {
        display: block;
        width: 100%;
        user-select: none;
      }
    }
    .caption {
      margin: 0;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .cNav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: 0;
      border-radius: 50%;
      padding: 0.25rem 0.6rem 0.4rem;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      &.prev {
        left: 0.5rem;
      }
      &.next {
        right: 0.5rem;
      }
    }
    .cDots {
      display: flex;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.5rem 0;
    }
    .cDot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      &.on {
        opacity: 0.9;
      }
    }
  }
  .review {
    padding: 1rem;
    .stars {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.1em;
    }
    // Beats the global `.textC { margin: 1rem }` on specificity.
    .textC {
      margin: 0.5rem 0 0;
    }
    .attribution {
      margin: 0.75rem 0 0;
      font-size: 0.85rem;
      opacity: 0.75;
    }
  }
  .embedded {
    position: relative;
    padding-top: 100%;
    // padding-top: 56.25%;
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .music,
  .video {
    width: 100%;
  }
  .mediaC {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
  video {
    width: 100%;
  }
  .controls {
    padding: 1rem;
    font-size: 0.9rem;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .pCtrl,
  .docDl {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  .docDl {
    display: flex;
  }
  .seekBar {
    width: 100%;
    height: 0.5rem;
    margin: 1.5rem 0 0.5rem;
    border-radius: 0.5rem;
    appearance: none;
    cursor: pointer;
  }
  .playPause,
  .dlBtn {
    margin: 1rem 0 0.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    line-height: 0;
    cursor: pointer;
  }
  .pause {
    display: none;
  }

  // Product Card
  .title {
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
  }
  .price {
    margin: 1rem 0 0;
    font-size: 1rem;
    font-weight: bold;
  }
  .label {
    display: inline-block;
    font-size: 1rem;
    margin: 1rem 0 0.5rem;
    border-radius: 0.5rem;
    letter-spacing: 1px;
    padding: 1rem 1.5rem;
    p {
      margin: 0;
    }
  }

  footer {
    padding: 4rem 1rem 2rem;
    font-size: 0.9rem;
    text-align: center;
    a {
      text-decoration: underline;
      color: inherit;
    }
  }
}
#Theme3 {
  // General
  body {
    margin: 0 auto;
    width: 100%;
    padding: 0;
    max-width: 30rem;
    color: #eee;
    position: relative;
  }
  p {
    line-height: 1.5;
    margin: 0;
  }
  h2,
  h3 {
    margin: 0;
  }
  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  a {
    text-decoration: none;
    user-select: none;
  }

  // Modal
  #modal {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
    width: 100%;
    bottom: 0;
    transition:
      top 0.2s ease-out,
      opacity 0.1s ease-out;
    transform: translateZ(0);
  }
  #close {
    align-self: end;
    padding: 1rem;
    cursor: pointer;
    line-height: 0;
  }
  #keyView,
  #copyView,
  #qrView {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
    text-align: center;
    p {
      margin: 2rem;
    }
  }
  #copyURL,
  #dlKey {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    padding: 1rem 1.5rem;
    border: none;
    outline: none;
    cursor: pointer;
    box-sizing: border-box;
    span {
      margin-left: 0.5rem;
    }
  }
  #qrView {
    h3 {
      margin: 2rem 2rem 0;
    }
    p {
      margin: 0.5rem 2rem 0;
    }
  }
  #qr {
    margin: 2rem;
    padding: 2rem;
    background: #fff;
    border-radius: 0.5rem;
  }

  // Heder
  header {
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }
  .headerImgC {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto;
    height: 100%;
    overflow: hidden;
  }
  #cover {
    grid-column: 1;
    grid-row: 1;
    width: 100%;
    height: 20rem;
    object-position: top center;
    object-fit: cover;
  }
  #logo {
    max-height: 6rem;
    max-width: 100%;
    pointer-events: none;
    user-select: none;
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    justify-self: center;
  }
  #topActions {
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: flex-start;
    & > div {
      display: flex;
    }
    a {
      padding: 1rem;
      cursor: pointer;
      line-height: 0;
    }
  }

  // Body
  main {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  #profilePhoto {
    width: 10rem;
    height: 10rem;
    border-radius: 0.5rem;
    box-sizing: content-box;
    pointer-events: none;
    user-select: none;
    margin-top: -6rem;
  }
  #info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-top: 1rem;
    line-height: 1.25;
    word-break: break-word;
    padding: 0.25rem 1rem;
  }
  .name {
    font-weight: bold;
    font-size: 1.5rem;
    margin: 0;
  }
  .pronouns {
    display: block;
    font-size: 0.9rem;
    opacity: 0.8;
    font-weight: normal;
    margin: 0 0 0.5rem;
  }
  .bizname {
    font-size: 0.9rem;
    margin: 0.5rem 0 0 0;
    opacity: 0.8;
  }
  .bizaddr {
    display: block;
    color: inherit;
    text-decoration: underline dotted;
    text-underline-offset: 2px;
    font-size: 0.8rem;
    opacity: 0.6;
  }
  .sub,
  .textC {
    font-size: 1rem;
    white-space: pre-line;
    line-height: 1.5;
  }
  .sub {
    font-size: 0.9rem;
    margin: 0.5rem 0 0;
    opacity: 0.8;
  }
  .textC {
    margin: 1rem;
  }
  #cta {
    display: flex;
    align-items: center;
    border-radius: 0.5rem;
    margin-top: 2rem;
    padding: 1rem 1.5rem;
    cursor: pointer;
    line-height: 0;
    justify-content: center;
    box-sizing: border-box;
    .icon {
      margin-right: 0.5rem;
    }
    p {
      margin: 0;
    }
  }
  .actions {
    width: 100%;
    margin-top: 2rem;
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }
  .actionBtn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    a {
      border-radius: 0.5rem;
      padding: 1rem;
      line-height: 0;
    }
    p {
      margin: 0 0 0 0.75rem;
      font-size: 0.9rem;
      white-space: nowrap;
    }
  }
  .secondary {
    grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
  }

  // Featured Content
  .featured {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 3rem 0 0;
    width: 100%;
  }
  .section {
    font-weight: bold;
    font-size: 1.3rem;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
  }
  .media {
    overflow: hidden;
    border-radius: 0.5rem;
    margin-top: 1rem;
    img {
      display: block;
      pointer-events: none;
      user-select: none;
      width: 100%;
    }
  }
  .carousel {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    margin-top: 1rem;
    // The strip itself. Scroll-snap does the paging, so the card still works
    // with no JavaScript; carousel.ts only adds the arrows.
    .track {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .slide {
      flex: 0 0 100%;
      // Without this a wide image forces the flex item past 100% and two
      // slides end up visible at once, which breaks the snap points.
      min-width: 0;
      scroll-snap-align: center;
      img {
        display: block;
        width: 100%;
        user-select: none;
      }
    }
    .caption {
      margin: 0;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .cNav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: 0;
      border-radius: 50%;
      padding: 0.25rem 0.6rem 0.4rem;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      &.prev {
        left: 0.5rem;
      }
      &.next {
        right: 0.5rem;
      }
    }
    .cDots {
      display: flex;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.5rem 0;
    }
    .cDot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.3;
      &.on {
        opacity: 0.9;
      }
    }
  }
  .review {
    padding: 1rem;
    .stars {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.1em;
    }
    // Beats the global `.textC { margin: 1rem }` on specificity.
    .textC {
      margin: 0.5rem 0 0;
    }
    .attribution {
      margin: 0.75rem 0 0;
      font-size: 0.85rem;
      opacity: 0.75;
    }
  }
  .embedded {
    position: relative;
    padding-top: 100%;
    // padding-top: 56.25%;
    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .music,
  .video {
    width: 100%;
  }
  .mediaC {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
  video {
    width: 100%;
  }
  .controls {
    padding: 1rem;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  .pCtrl,
  .docDl {
    display: none;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin: 1rem 0 0;
  }
  .docDl {
    display: flex;
  }
  .fileSize {
    margin: 0 0 0 1rem;
  }
  .currentTime {
    margin: 0 0.5rem 0 1rem;
  }
  .seekBar {
    width: 100%;
    height: 0.5rem;
    border-radius: 0.5rem;
    appearance: none;
    cursor: pointer;
  }
  .playPause,
  .dlBtn {
    padding: 1rem;
    border-radius: 0.5rem;
    line-height: 0;
    cursor: pointer;
    order: -1;
  }
  .pause {
    display: none;
  }

  // Product Card
  .title {
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
  }
  .price {
    margin: 1rem 0 0;
    font-size: 1rem;
    font-weight: bold;
  }
  .label {
    display: inline-block;
    font-size: 1rem;
    margin: 1rem 0 0;
    border-radius: 0.5rem;
    letter-spacing: 1px;
    padding: 1rem 1.5rem;
    p {
      margin: 0;
    }
  }

  footer {
    padding: 4rem 1rem 2rem;
    font-size: 0.9rem;
    text-align: center;
    a {
      text-decoration: underline;
      color: inherit;
    }
  }
}
</style>
