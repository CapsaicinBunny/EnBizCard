# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository.

## What this is

EnBizCard is an open-source, client-side digital business card generator. It's a **Nuxt 2 (Vue 2) SPA** — there is no backend and no database. The app is a single-page editor: the user fills in their info, sees a live preview, and downloads a self-contained static HTML/CSS/JS package (or a zip) that they host themselves. "Your data belongs to you" is a stated design goal — nothing is sent to a server.

Read [README.md](README.md) for the project's goals/features from a user perspective.

## Tech stack

- **Nuxt 2** (`ssr: false`, `target: 'static'`) — see [nuxt.config.js](nuxt.config.js)
- **Vue 2** single-file components (Options API, no TypeScript)
- **Vuex** for the tiny bit of global state (just the selected theme) — [store/index.js](store/index.js)
- **Tailwind CSS** (`@nuxtjs/tailwindcss`) for utility-first styling, plus hand-written SCSS themes
- **JSZip** + **file-saver** to package the generated card for download
- Card themes are pre-built, minified CSS files (`T1.min.css`, `T2.min.css`, `T3.min.css` in `assets/styles/`) imported via `raw-loader` and injected into the exported HTML

## Node version constraint

`package.json` pins `"engines": { "node": ">=16 <18" }` with `engineStrict: true`. **Node 16 is required** — this is not just a suggestion, npm will refuse to install on other majors. The Dockerfile builds on `node:16.17.0-alpine`.

## Project structure

- [pages/index.vue](pages/index.vue) — the entire editor UI and its logic (large single file, ~2200 lines). This is where card data (`genInfo`, `images`, `featured`, actions, colors, etc.) is built up in component state and where the "download package" / vCard generation logic lives.
- [pages/hosting-guide/index.vue](pages/hosting-guide/index.vue) — static help page.
- [components/Preview.vue](components/Preview.vue) — renders the live card preview (also ~1600 lines); its rendered DOM is what gets serialized and exported when the user downloads their card.
- [components/](components/) — smaller, focused pieces used by the editor: `Action.vue`, `Attachment.vue`, `Colour.vue`, `Cropper.vue` (image cropping), `Featured.vue` (showcase items), `ProductCard.vue` / `ProductShowcase.vue`, `Vcard.vue` (vCard/.vcf generation), `Download.vue`, `Modal.vue`, `Help.vue`, `Footer.vue`, `Check.vue`, `MediaPlayer.vue`, `DocumentDownloader.vue`.
- [mixins/utils.js](mixins/utils.js) — shared helpers (random string generator, inline SVG icon loader with gradient-ID de-duplication for `assets/icons/*.svg`).
- [assets/styles/](assets/styles/) — theme SCSS source + minified CSS (`T1`/`T2`/`T3`) that ship with generated cards.
- [assets/icons/](assets/icons/) — SVG icon set (social platforms, actions, UI icons), loaded via `?include` (inlined) or `svg?include`.
- [assets/scripts/pdfjs-dist/](assets/scripts/pdfjs-dist/) — vendored pdf.js build, used for a PDF-related feature (e.g. attachment/brochure previews).
- [static/](static/) — PWA icons, manifest assets, `qrcode.min.js` (loaded globally for QR-code generation, not npm-installed).
- Because this is a static-generate target, `nuxt generate` outputs to `public/` (not the Nuxt default `dist/`) per `generate.dir` in `nuxt.config.js`.

## Commands

```bash
npm run dev        # dev server, HOST=0.0.0.0 PORT=2221 (see package.json)
npm run build       # production build (SSR-style bundle, rarely what you want since ssr:false)
npm run generate     # static-site generate -> outputs to public/
npm run start        # serve a built app
```

There is no test suite and no CI-run lint script — `npm run lint` is not defined even though `.eslintrc` exists. If you want to lint, run `npx eslint .` directly.

## Conventions

- **Formatting**: Prettier with `"semi": false, "singleQuote": true` ([.prettierrc](.prettierrc)) — no semicolons, single quotes. 2-space indent, LF line endings, final newline ([.editorconfig](.editorconfig)).
- **Linting**: ESLint extends `plugin:nuxt/recommended` only ([.eslintrc](.eslintrc)); `.eslintignore` excludes generated/vendor dirs.
- **Imports**: use the `~/` or `@/` alias for repo-root-relative imports (configured in `jsconfig.json` and Nuxt's default aliasing) rather than long relative paths.
- **Components** are auto-imported (`components: true` in `nuxt.config.js`), so new files placed in `components/` don't need explicit registration in most cases — but the editor page (`pages/index.vue`) still explicitly imports the ones it uses, so follow the existing pattern in a given file rather than mixing styles.
- Vue 2 Options API throughout — no Composition API / `<script setup>`. Match existing style when editing `pages/index.vue` or `components/*.vue`.

## Working in `pages/index.vue` and `components/Preview.vue`

These two files are the core of the app and are unusually large. Before editing:
- Grep for the specific `data()` field, method, or template section you need rather than reading the whole file.
- Card state built in `pages/index.vue` (`genInfo`, `images`, `featured`, `primaryActions`/`secondaryActions`, `colors`, etc.) is passed down to `Preview.vue` as props — if you change a field's shape in one, update the other and check `Vcard.vue`/download logic for consumers too.
- The "download" flow parses `Preview.vue`'s rendered `outerHTML`, injects theme CSS/QR script, and zips it with JSZip — changes to Preview's root markup can break that export path, so test an actual download after edits, not just the on-page preview.

## Deployment

- Self-hosting is via Docker: [Dockerfile](Dockerfile) builds with `npm run generate` and serves the static `public/` output from nginx; [docker-compose.yml](docker-compose.yml) reads the `ENBIZCARD_PORT` env var (see `env.example`).
- The hosted demo deploys straight from `nuxt generate` output (see the Vercel link in README).

## Things to be careful about

- This app is intentionally **backend-free and privacy-first** — don't introduce a server component, analytics calls, or any network call that sends user card data off-device without a very deliberate, opt-in reason (the existing analytics/tracker fields let users paste their *own* third-party snippet — that's user choice, not app-initiated telemetry).
- `ssr: false` — don't assume `window`/`document` are unavailable like in a typical SSR Nuxt app; client-only APIs are used freely (e.g. `DOMParser`, `document.createElement` in the download logic), but also don't assume server-side lifecycle hooks behave as they would with SSR on.
- License is AGPLv3 ([LICENSE](LICENSE)) — keep that in mind if pulling in new dependencies or reusing third-party code.
