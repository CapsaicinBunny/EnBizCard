<template>
  <div class="mt-8">
    <div class="flex items-center">
      <input
        :value="colors[name].color"
        type="color"
        class="swatch w-12 h-12 shrink-0 rounded cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus:ring-3 ring-gray-100"
        :aria-label="`${label} colour picker`"
        @input="setColour($event.target.value)"
      />
      <div class="ml-3 min-w-0">
        <p>{{ label }}</p>
        <input
          :value="colors[name].color"
          type="text"
          spellcheck="false"
          maxlength="7"
          class="mt-1 w-24 px-2 py-1 rounded bg-black text-gray-100 text-sm focus:outline-none focus:ring-3 ring-gray-100"
          :aria-label="`${label} hex value`"
          @input="onHexInput($event.target.value)"
        />
      </div>
    </div>

    <!-- Presets. Inline rather than in a popover: four of these rows sit in a
         column, and an overlay on one of them covers the next one's label. -->
    <div class="mt-3 grid grid-cols-8 gap-2 w-fit">
      <button
        v-for="swatch in swatches"
        :key="swatch"
        type="button"
        :style="{ backgroundColor: swatch }"
        :title="swatch"
        :aria-label="`${label}: ${swatch}`"
        class="w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-3 ring-gray-100"
        :class="isCurrent(swatch) ? 'border-gray-100' : 'border-gray-600'"
        @click="setColour(swatch)"
      ></button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { CardColours, ColourSlot } from '~/types/card'

// Previously built on @caohenghu/vue-colorpicker + vue-clickaway2, both of
// which are Vue 2 only. The replacement is the platform's own picker — a
// native colour input, which brings the full spectrum, the OS palette and an
// eyedropper for free — with these presets beside it for the common choices.
const SWATCHES: string[] = [
  '#000000',
  '#ffffff',
  '#111827',
  '#374151',
  '#6b7280',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#78350f',
]

export default defineComponent({
  props: {
    name: { type: String as PropType<ColourSlot>, required: true },
    label: { type: String, required: true },
    colors: { type: Object as PropType<CardColours>, required: true },
  },
  data() {
    return { swatches: SWATCHES }
  },
  methods: {
    isCurrent(swatch: string): boolean {
      const current = this.colors[this.name].color || ''
      return swatch.toLowerCase() === current.toLowerCase()
    },
    setColour(hex: string): void {
      this.colors[this.name].color = hex
    },
    onHexInput(value: string): void {
      // Only commit complete, valid hex values so partial typing isn't clobbered.
      const hex = value.startsWith('#') ? value : `#${value}`
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) this.setColour(hex)
    },
  },
})
</script>

<style lang="scss">
// Chrome draws its own inset border and padding around the colour well; strip
// both so the input reads as a plain swatch of the colour it holds.
.swatch[type='color'] {
  -webkit-appearance: none;
  appearance: none;
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 0.25rem;
  }
}
</style>
