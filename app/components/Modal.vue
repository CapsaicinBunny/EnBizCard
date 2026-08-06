<template>
  <div
    id="notificationContainer"
    class="flex justify-center fixed top-0 left-0 right-0 bottom-0 items-center z-50 bg-black/80"
  >
    <div
      class="flex items-start notification content bg-gray-800 text-gray-100 rounded relative z-50 mx-8 max-w-md p-2"
    >
      <div class="whitespace-pre-line p-2" v-html="content"></div>
      <div
        @click="clearContent()"
        class="w-8 cursor-pointer shrink-0 p-1 focus:outline-none rounded bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 absolute -top-4 -right-4"
        v-html="$icon('x')"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    /** Alert body, rendered with v-html so it may contain markup. */
    content: { type: String, default: '' },
    clearContent: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
})
</script>
