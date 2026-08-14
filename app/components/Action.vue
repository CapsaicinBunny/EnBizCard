<template>
  <div class="stepC mt-6">
    <!-- Two shapes in one component: single-value rows are one flex line, and
         multi-field rows (Address, Work) keep that line for the icon, type and
         remove button, then stack their inputs underneath. Anything else would
         need five inputs to share the width of one.

         This comment lives inside the root element on purpose — a node before
         it makes the component a fragment, and `$el` then points at the
         comment rather than the div. -->
    <div class="flex">
      <button
        class="py-1 pr-1 shrink-0 focus:outline-none drag cursor-move"
        tabindex="-1"
      >
        <div class="w-6 h-6" v-html="$icon('drag')"></div>
      </button>
      <div
        class="p-3 shrink-0 rounded-l"
        :style="{
          background: `${name == 'secondaryActions' ? item.color : buttonBg}`,
        }"
        :title="item.name"
      >
        <div
          class="w-6 h-6"
          :class="name == 'secondaryActions' ? null : 'action'"
          v-html="$getSVG(item)"
        ></div>
      </div>
      <!-- Repeatable contact rows only. The type used to be baked into the
           action's name (Mobile/Office/Home were three separate actions), and
           now rides on the row so one entry can be added once per number or
           address. -->
      <select
        v-if="item.typeGroup"
        class="px-2 h-12 shrink-0 bg-black border-y border-transparent text-sm focus:outline-none focus:border-gray-600 hover:border-gray-600 transition-colors duration-200"
        :aria-label="'Type for ' + item.label"
        title="Contact type"
        v-model="type[index].contactType"
      >
        <option
          v-for="option in contactTypes"
          :key="option.label"
          :value="option.label"
        >
          {{ option.label }}
        </option>
      </select>
      <!-- A custom social row is named by the user: 'Custom' is the template's
           name, not the service's, and the card and vCard both show this. -->
      <input
        v-if="item.custom"
        class="px-3 w-28 h-12 shrink-0 bg-black placeholder-gray-600 border-y border-transparent text-sm focus:outline-none focus:border-gray-600 hover:border-gray-600 transition-colors duration-200"
        type="text"
        :aria-label="'Profile name'"
        title="Profile name"
        v-model="type[index].customLabel"
        placeholder="Name"
      />
      <!-- Only for the 'Custom' type, which is the one case where the label is
           the user's own words rather than a fixed vCard TYPE. -->
      <input
        v-if="isCustom"
        class="px-3 w-32 h-12 shrink-0 bg-black placeholder-gray-600 border-y border-transparent text-sm focus:outline-none focus:border-gray-600 hover:border-gray-600 transition-colors duration-200"
        type="text"
        :aria-label="'Custom label for ' + item.label"
        title="Label"
        v-model="type[index].customLabel"
        placeholder="Label"
      />
      <!-- // TODO show title content when input is focused. -->
      <div class="w-full">
        <input
          v-if="!item.fields"
          ref="input"
          class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded-r border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
          type="text"
          :aria-label="'Enter ' + item.label"
          :title="'Enter ' + item.label"
          v-model="type[index].value"
          :placeholder="item.placeholder"
        />
        <!-- A multi-field row has no single value to put on this line, so the
             name goes here instead and keeps the bar looking like the rest. -->
        <p
          v-else
          class="flex items-center px-4 w-full h-12 bg-black rounded-r border border-transparent text-gray-400"
        >
          {{ item.name }}
        </p>
      </div>
      <button
        class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="removeAction(name, index)"
        :aria-label="'Remove ' + item.label"
        title="Remove field"
      >
        <div class="w-6 h-6" v-html="$icon('x')"></div>
      </button>
    </div>
    <!-- The icon and colour for a custom profile. Its own line because the
         chip on the line above is the live preview of both. -->
    <div v-if="item.custom" class="flex items-center gap-3 mt-3 ml-7">
      <label
        class="px-3 h-10 flex items-center rounded border border-gray-700 text-sm cursor-pointer hover:border-gray-500 transition-colors duration-200"
      >
        <div class="w-4 h-4 mr-2" v-html="$icon('add-img')"></div>
        {{ item.customIcon ? 'Replace icon' : 'Upload SVG icon' }}
        <input
          type="file"
          accept="image/svg+xml,.svg"
          class="hidden"
          @change="uploadIcon"
        />
      </label>
      <button
        v-if="item.customIcon"
        class="px-3 h-10 rounded border border-gray-700 text-sm hover:border-gray-500 transition-colors duration-200"
        @click="type[index].customIcon = null"
      >
        Remove icon
      </button>
      <label class="flex items-center gap-2 text-sm text-gray-400">
        Colour
        <input
          type="color"
          class="w-10 h-10 bg-black rounded border border-gray-700 cursor-pointer"
          aria-label="Chip colour"
          :value="item.color"
          @input="type[index].color = $event.target.value"
        />
      </label>
    </div>
    <div v-if="item.fields" class="grid grid-cols-2 gap-4 mt-3 ml-7 mr-10">
      <label
        v-for="field in item.fields"
        :key="field.key"
        :class="field.wide ? 'col-span-2' : null"
      >
        <span class="ml-4 text-sm text-gray-400">{{ field.label }}</span>
        <input
          class="mt-1 px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
          type="text"
          :aria-label="field.label"
          :autocomplete="field.autocomplete"
          :placeholder="field.placeholder"
          v-model="type[index].values[field.key]"
        />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  CardAction,
  ContactType,
  ContactTypeGroup,
  SecondaryAction,
} from '~/types/card'
import { CONTACT_TYPES, contactTypeFor } from '~/types/card'
import { sanitiseSVG, SVGError } from '~/utils/svg'
import { errorText } from '~/utils/errors'

export default defineComponent({
  props: {
    name: { type: String, required: true },
    item: { type: Object as PropType<CardAction>, required: true },
    index: { type: Number, required: true },
    /**
     * The list this row belongs to — the array itself, not its name, because
     * the input writes back through it (`v-model="type[index].value"`). The
     * name arrives separately as `name`.
     */
    type: { type: Array as PropType<CardAction[]>, required: true },
    /** Only read for primary actions; the secondary list does not pass it. */
    buttonBg: { type: String, default: '' },
    removeAction: {
      type: Function as PropType<
        (type: 'primaryActions' | 'secondaryActions', index: number) => void
      >,
      required: true,
    },
    /** Only the custom-icon upload reports through this. */
    showAlert: {
      type: Function as PropType<(content: string) => void>,
      default: () => {},
    },
  },
  computed: {
    /** Undefined on every secondary action and on untyped primary rows. */
    group(): ContactTypeGroup | undefined {
      return (this.item as { typeGroup?: ContactTypeGroup }).typeGroup
    },
    contactTypes(): readonly ContactType[] {
      return this.group ? CONTACT_TYPES[this.group] : []
    },
    isCustom(): boolean {
      if (!this.group) return false
      const selected = (this.item as { contactType?: string }).contactType
      return Boolean(contactTypeFor(this.group, selected).custom)
    },
  },
  methods: {
    /**
     * Read an uploaded SVG, sanitise it and store the result on the row.
     *
     * Every failure path reports: the two attach handlers in Featured.vue
     * used to swallow theirs, and a dependency breakage there showed up as an
     * attachment that simply never appeared. The input is cleared afterwards
     * so picking the same file twice still fires a change event.
     */
    async uploadIcon(event: Event) {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      input.value = ''
      if (!file) return
      try {
        const svg = sanitiseSVG(
          await file.text(),
          // Namespaces the file's ids. Per row, so two custom icons in one
          // exported document cannot share a gradient or clip-path id.
          `c${this.item.rowId ?? this.index}`,
        )
        ;(this.type[this.index] as SecondaryAction).customIcon = svg
      } catch (error) {
        this.showAlert(
          error instanceof SVGError
            ? error.message
            : `That icon could not be read. ${errorText(error)}`,
        )
      }
    },
  },
  mounted() {
    // $refs is typed as unknown records, so the element needs narrowing.
    // A multi-field row renders no `input` ref, so focus its first field
    // instead — without the fallback, adding an Address threw here.
    const single = this.$refs.input as HTMLInputElement | undefined
    if (single) single.focus()
    else this.$el.querySelector('input')?.focus()
  },
})
</script>
