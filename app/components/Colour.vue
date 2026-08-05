<template>
  <div class="mt-6 flex flex-col items-start">
    <div class="flex items-center">
      <div
        :style="{ backgroundColor: colors[name].color }"
        class="w-12 h-12 rounded mr-3 relative cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-3 ring-gray-100"
        tabindex="0"
        @click.self="colors[name].openPalette = !colors[name].openPalette"
        @keydown.space.enter.esc.prevent="
          colors[name].openPalette = !colors[name].openPalette
        "
      >
        <transition name="palette">
          <div
            v-show="colors[name].openPalette"
            class="palette absolute mt-14 ml-14 z-10 p-3 rounded bg-gray-700 shadow-lg cursor-default"
          >
            <!-- Swatches -->
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="swatch in swatches"
                :key="swatch"
                type="button"
                :style="{ backgroundColor: swatch }"
                :title="swatch"
                :aria-label="swatch"
                class="w-8 h-8 rounded border focus:outline-none focus:ring-3 ring-gray-100"
                :class="
                  isCurrent(swatch) ? 'border-gray-100' : 'border-transparent'
                "
                @click="setColour(swatch)"
              ></button>
            </div>

            <!-- Freeform picker + hex entry -->
            <div class="flex items-center mt-3">
              <input
                :value="colors[name].color"
                type="color"
                class="w-8 h-8 bg-transparent border-0 cursor-pointer p-0"
                :aria-label="`${label} colour picker`"
                @input="setColour($event.target.value)"
              />
              <input
                :value="colors[name].color"
                type="text"
                spellcheck="false"
                maxlength="7"
                class="ml-2 w-24 px-2 py-1 rounded bg-black text-gray-100 text-sm focus:outline-none focus:ring-3 ring-gray-100"
                :aria-label="`${label} hex value`"
                @input="onHexInput($event.target.value)"
              />
            </div>
          </div>
        </transition>
      </div>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script>
// Previously built on @caohenghu/vue-colorpicker + vue-clickaway2, both of
// which are Vue 2 only. This is a self-contained equivalent: the original UI
// hid the picker's alpha channel, history and most of its swatches via CSS
// anyway, so a swatch grid plus a native colour input matches what was shown.
const SWATCHES = [
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

export default {
  props: ['name', 'label', 'colors'],
  data() {
    return { swatches: SWATCHES }
  },
  mounted() {
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true)
  },
  beforeUnmount() {
    document.removeEventListener(
      'pointerdown',
      this.onDocumentPointerDown,
      true
    )
  },
  methods: {
    isCurrent(swatch) {
      const current = this.colors[this.name].color || ''
      return swatch.toLowerCase() === current.toLowerCase()
    },
    setColour(hex) {
      this.colors[this.name].color = hex
    },
    onHexInput(value) {
      // Only commit complete, valid hex values so partial typing isn't clobbered.
      const hex = value.startsWith('#') ? value : `#${value}`
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) this.setColour(hex)
    },
    closeColourPalette() {
      this.colors[this.name].openPalette = false
    },
    onDocumentPointerDown(event) {
      if (!this.colors[this.name].openPalette) return
      // The swatch itself toggles the palette; ignore clicks it already handles.
      if (this.$el.contains(event.target)) return
      this.closeColourPalette()
    },
  },
}
</script>

<style lang="scss">
.palette-enter-active,
.palette-leave-active {
  transition: transform 0.2s ease;
  transform-origin: left top;
}
// Vue 3 renamed the starting/ending transition classes.
.palette-enter-from,
.palette-leave-to {
  transform: scale(0);
}
.palette input[type='color'] {
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
