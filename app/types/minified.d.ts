/**
 * `?minified` imports, served by the `enbizcard:minified-scripts` Vite plugin
 * in nuxt.config.ts. Mirrors how `vite/client` declares `?raw`, but the string
 * you get back is the file compiled and minified rather than its source text.
 */
declare module '*?minified' {
  const source: string
  export default source
}
