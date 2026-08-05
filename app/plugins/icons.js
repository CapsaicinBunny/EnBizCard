import { getIcon } from '~/utils/icons'

// Vue 2 exposed these through a mixin (mixins/utils.js). Vue 3's equivalent for
// "available in every template" is globalProperties, which keeps all ~40
// existing v-html call sites working without registering a mixin per component.
export default defineNuxtPlugin((nuxtApp) => {
  const globals = nuxtApp.vueApp.config.globalProperties
  globals.$icon = (name, gradient = false) => getIcon(name, gradient)
  globals.$getSVG = (item) => getIcon(item.icon, item.gradientIcon)
})
