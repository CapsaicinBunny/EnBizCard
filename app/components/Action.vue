<template>
  <div class="stepC flex mt-6">
    <button class="py-1 pr-1 shrink-0 focus:outline-none drag cursor-move" tabindex="-1">
      <div class="w-6 h-6" v-html="$icon('drag')"></div>
    </button>
    <div
      class="p-3 shrink-0 rounded-l"
      :style="{
        background: `${name == 'secondaryActions' ? item.color : buttonBg
          }`,
      }"
      :title="item.name"
    >
      <div
        class="w-6 h-6"
        :class="name == 'secondaryActions' ? null : 'action'"
        v-html="$getSVG(item)"
      ></div>
    </div>
    <!-- // TODO show title content when input is focused. -->
    <div class="w-full">
      <input
        ref="input"
        class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded-r border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-600 hover:border-gray-600"
        type="text"
        :aria-label="'Enter ' + item.label"
        :title="'Enter ' + item.label"
        v-model="type[index].value"
        :placeholder="item.placeholder"
      />
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
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { CardAction } from '~/types/card'

export default defineComponent({
  props: {
    name: { type: String, required: true },
    item: { type: Object as PropType<CardAction>, required: true },
    index: { type: Number, required: true },
    /** Which list this row belongs to, so removeAction() targets the right one. */
    type: {
      type: String as PropType<'primaryActions' | 'secondaryActions'>,
      required: true,
    },
    buttonBg: { type: String, required: true },
    removeAction: {
      type: Function as PropType<
        (type: 'primaryActions' | 'secondaryActions', index: number) => void
      >,
      required: true,
    },
  },
  mounted() {
    // $refs is typed as unknown records, so the element needs narrowing.
    ;(this.$refs.input as HTMLInputElement).focus()
  },
})
</script>
