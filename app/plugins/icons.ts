import { getIcon } from '~/utils/icons'
import type { Flag } from '~/types/card'

/** Anything carrying an icon name, i.e. either kind of action row. */
export interface IconBearing {
  icon: string
  gradientIcon?: Flag
  /** Set on custom social rows, whose icon the user uploaded. */
  customIcon?: string | null
}

// Vue 2 exposed these through a mixin (mixins/utils.js). Vue 3's equivalent for
// "available in every template" is globalProperties, which keeps all ~40
// existing v-html call sites working without registering a mixin per component.
//
// Returning them via `provide` rather than assigning globalProperties directly
// lets Nuxt generate the `$icon`/`$getSVG` declarations itself. Hand-augmenting
// `ComponentCustomProperties` instead makes it structurally incompatible with
// @vite-pwa/nuxt's `NuxtAppInjections`, whose `$pwaIcons` is optional there and
// required in the constraint.
export default defineNuxtPlugin(() => ({
  provide: {
    icon: (name: string, gradient: boolean = false): string =>
      getIcon(name, gradient),
    // gradientIcon is 0 | 1 in the action tables, so coerce rather than widen
    // getIcon()'s parameter to accept numbers.
    // An uploaded icon wins over the named one, which is the placeholder a
    // custom row shows until the user picks a file. Already sanitised by
    // sanitiseSVG() at upload time — see app/utils/svg.ts.
    getSVG: (item: IconBearing): string =>
      item.customIcon || getIcon(item.icon, Boolean(item.gradientIcon)),
  },
}))
