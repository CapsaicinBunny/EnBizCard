# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

EnBizCard is an open-source, client-side digital business card generator. It's a **Nuxt 4 (Vue 3) SPA** — there is no backend and no database. The app is a single-page editor: the user fills in their info, sees a live preview, and downloads a self-contained static HTML/CSS/JS package (a zip) that they host themselves. "Your data belongs to you" is a stated design goal — nothing is sent to a server.

Read [README.md](README.md) for the project's goals/features from a user perspective.

## Tech stack

- **Nuxt 4**, statically generated to `.output/public` — see [nuxt.config.ts](nuxt.config.ts). SSR is enabled so pages prerender to real HTML, but `/` is forced client-only (see *Rendering* below).
- **Vue 3** single-file components, **Options API** throughout (no `<script setup>`). Every SFC is `<script lang="ts">` + `defineComponent`, with the card model typed in [app/types/card.ts](app/types/card.ts).
- **TypeScript 7** — the native (Go) compiler. It has no JS API, so **vue-tsc and Volar cannot read `.vue` files**: `npm run typecheck` (`tsc --noEmit`) checks only `.ts` files, and annotations inside SFCs are stripped by Vite without ever being verified. Put load-bearing types in `app/types/`, where they are actually checked. Revisit vue-tsc once it supports the native port.
- `app/assets/scripts/main.js` and `media.js` stay **JavaScript on purpose** — they are copies of the scripts injected into exported cards, which run standalone with no build step.
- **Vite** as the bundler (Nuxt 4 default) — *not* webpack
- **`useState`** for the only piece of global state, the selected theme — [app/composables/useTheme.js](app/composables/useTheme.js). There is no Vuex/Pinia store.
- **Tailwind CSS v4** via `@tailwindcss/vite`. There is no `tailwind.config.js` — v4 is configured CSS-first in [app/assets/css/tailwind.css](app/assets/css/tailwind.css) (`@theme`, `@source`). Tailwind styles **only the generator UI**; the exported card themes are hand-written SCSS with no Tailwind, so Tailwind changes cannot affect generated cards.
- **JSZip** + **file-saver** to package the generated card for download
- **`@vite-pwa/nuxt`** for the manifest and service worker
- Card themes are pre-built minified CSS (`T1/T2/T3.min.css` in `app/assets/styles/`), imported as text with Vite's `?raw` and injected into the exported card

## Node version

`package.json` pins `engines.node` to Nuxt 4's supported range (`^22.19 || ^24.11 || >=26`) with `engineStrict: true`, so npm will refuse to install on older majors. The Dockerfile builds on `node:24-alpine`.

## Project structure

Nuxt 4 puts application code under `app/`, and static files served at the site root under `public/`.

- [app/pages/index.vue](app/pages/index.vue) — the entire editor UI and its logic (~2200 lines). Card state (`genInfo`, `images`, `featured`, actions, colors) lives here, as does the "download package" / vCard generation logic.
- [app/pages/hosting-guide/index.vue](app/pages/hosting-guide/index.vue) — static help page.
- [app/components/Preview.vue](app/components/Preview.vue) — renders the live card preview (~1600 lines). **Its rendered DOM is serialized to produce the exported card**, so it deliberately renders a full `<html><head><body>` document.
- [app/components/](app/components/) — the editor's smaller pieces: `Action.vue`, `Attachment.vue`, `Colour.vue`, `Cropper.vue`, `Featured.vue`, `ProductCard.vue`/`ProductShowcase.vue`, `Vcard.vue`, `Download.vue`, `Modal.vue`, `Help.vue`, `Footer.vue`, `Check.vue`, `MediaPlayer.vue`, `DocumentDownloader.vue`.
- [app/utils/icons.js](app/utils/icons.js) — loads every `app/assets/icons/*.svg` as raw text via `import.meta.glob`, with gradient-id randomisation so an icon can appear twice without its `<defs>` ids colliding.
- [app/plugins/icons.js](app/plugins/icons.js) — exposes `$icon(name)` and `$getSVG(item)` as Vue `globalProperties` so all ~40 `v-html` icon call sites work without per-component wiring.
- [app/assets/styles/](app/assets/styles/) — theme SCSS sources plus the minified CSS shipped with generated cards.
- [app/assets/scripts/](app/assets/scripts/) — `main.js` / `media.js` are *readable copies* of the scripts that `downloadPackage()` injects into exports as minified strings. Nothing imports them; keep them in sync by hand if you change the inlined versions.
- [public/](public/) — PWA icons, fonts, and `qrcode.min.js` (loaded both as a global `<script>` by the generator and imported as `?raw` text to bundle into exports).

`nuxt generate` outputs to `.output/public`.

## Rendering

`ssr: true` globally, with `routeRules: { '/': { ssr: false } }`:

- **`/` (the generator) cannot be server-rendered.** `Preview.vue` renders a complete nested `<html>/<head>/<body>` document, and the browser's HTML parser discards tags like those when they appear inside a `<div>` — so server markup could never match the client render. It is emitted as an SPA shell.
- **Everything else prerenders to real HTML.** Because `/` has no markup, the link crawler cannot discover other routes, so they're listed explicitly in `nitro.prerender.routes`. **Add new pages there** or they'll ship as empty shells.
- pdf.js (~1.2 MB with its worker) is imported lazily in `Featured.vue` on first PDF attach. Keep it that way: importing it at module scope both bloats the initial bundle and breaks the server build, since it calls `new Worker(...)` at evaluation time.

## Commands

```bash
npm run dev
```

```bash
npm run generate
```

`dev` serves on port 2221; `generate` produces the static site in `.output/public`. `npm run build` + `npm run start` (preview) also exist. There is no test suite. `.eslintrc` is a leftover from the Nuxt 2 setup and is inert — ESLint is not installed and there is no lint script.

## Conventions

- **Formatting**: Prettier with `"semi": false, "singleQuote": true` ([.prettierrc](.prettierrc)); 2-space indent, LF, final newline ([.editorconfig](.editorconfig)).
- **Line endings**: working-tree files are CRLF on Windows. Beware of JS regexes like `/^\s*.../m` when scripting edits — in multiline mode `^` also matches between `\r` and `\n`, so `\s*` can eat the preceding newline and leave a lone `\r`.
- **Imports**: `~/` and `@/` resolve to `app/`; `~~/` and `@@/` resolve to the repo root (e.g. `~~/public/qrcode.min.js?raw`).
- Components in `app/components/` are auto-imported, but the existing files still import explicitly — follow whatever the file you're editing already does.
- Options API only. Match the surrounding style rather than introducing Composition API piecemeal.

## Things to be careful about

- **This app is intentionally backend-free and privacy-first.** Don't add a server component, analytics, or any network call that sends card data off-device. (The analytics field lets users paste their *own* snippet into their exported card — that's user choice, not app telemetry.)
- **`Preview.vue`'s markup is load-bearing for the export.** `downloadPackage()` reads `$refs.html.$refs.html.outerHTML`, re-parses it with `DOMParser`, injects the stylesheet/QR/redirect/modal/media scripts, and zips it. Changing Preview's root structure can silently break the exported card — test an actual download, not just the on-screen preview.
- **Vue 3 forbids `<script>` and `<style>` tags in templates** (`ignoreSideEffectTags`). Preview.vue needs them for the exported document, so:
  - the `<style>` blocks are rendered via `<component :is="'style'">`, which bypasses the compile-time check;
  - the trailing-slash redirect `<script>` is *not* in the template at all — it's injected in `downloadPackage()`, which also stops it from executing inside the generator.
- **A successful build proves very little about the generator page.** `/` is `ssr: false`, so none of its component code runs during `nuxt generate` — template and runtime errors surface only in a browser. Always load the app and check the console after changing anything under `/`.
- **Drag-and-drop uses `vue-draggable-plus`, not `vuedraggable`.** vuedraggable@4 is unmaintained and throws on Vue 3.3+ (its slot vnodes have a null `el`). The `target=".sortable-*"` prop is what lets each list keep its `<transition-group>` wrapper.
- **cropperjs 2 is a set of custom elements, not a widget class.** There is no options object: `new Cropper(img, { template })` hides the `<img>` and inserts `<cropper-canvas>` beside it, and everything (aspect ratio, initial coverage, whether zoom is allowed) is configured by the attributes in that template string. Two consequences in [Cropper.vue](app/components/Cropper.vue): `<cropper-canvas>` has no intrinsic size, so its box must be given one in CSS; and `selection.$toCanvas()` defaults to the selection's *on-screen* size, so the image's display scale has to be divided back out to get source-resolution output the way v1's `getCroppedCanvas()` did.
- **`id3-parser` is CommonJS and its `parse` is `exports.default`.** Vite's interop hands a default import the whole `module.exports`, so `import parse from 'id3-parser'` yields an object, not a function — [Featured.vue](app/components/Featured.vue) reaches through it. Deep imports need the file extension (`id3-parser/lib/util.js`).
- **Watch for `catch` blocks that swallow everything.** Both the PDF and MP3 attach paths used empty catches, which is why two separate dependency breakages produced no console output and no user feedback — the attachment simply never appeared. Failures in those handlers should reach `showAlert`.
- License is AGPLv3 ([LICENSE](LICENSE)) — keep that in mind when adding dependencies or reusing third-party code.
