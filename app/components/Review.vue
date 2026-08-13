<template>
  <div class="mt-2 rounded bg-gray-900 p-2">
    <div class="flex items-center">
      <button
        class="p-1 shrink-0 focus:outline-none drag cursor-move"
        tabindex="-1"
      >
        <div class="w-6 h-6" v-html="$icon('drag')"></div>
      </button>
      <div class="w-full">
        <input
          class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
          ref="body"
          type="text"
          aria-label="Reviewer name"
          title="Reviewer name"
          autocapitalize="words"
          v-model="item.author"
          placeholder="Reviewer name"
        />
      </div>
      <button
        class="p-1 m-1 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="$emit('remove')"
        aria-label="Remove review"
        title="Remove review"
      >
        <div class="w-6 h-6" v-html="$icon('x')"></div>
      </button>
    </div>

    <textarea
      class="block mt-2 px-4 py-3 w-full bg-black rounded border border-transparent placeholder-gray-600 transition-colors duration-200 focus:outline-none focus:border-gray-500 resize-none hover:border-gray-500"
      ref="text"
      aria-label="What they said"
      title="What they said"
      v-model="item.body"
      placeholder="What they said"
      rows="4"
    ></textarea>

    <div class="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2">
      <!-- A select, not a free number: a rating is one of five values, and a
           text field invites "4.7/5" that the star row cannot render. -->
      <select
        class="px-4 w-full h-12 bg-black rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
        aria-label="Star rating"
        title="Star rating"
        v-model="rating"
      >
        <option :value="null">No rating</option>
        <option v-for="n in MAX_RATING" :key="n" :value="n">
          {{ n }} {{ n === 1 ? 'star' : 'stars' }}
        </option>
      </select>
      <input
        class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
        type="text"
        aria-label="Where it was left"
        title="Where it was left"
        autocapitalize="words"
        v-model="item.source"
        placeholder="Where — Google, Yelp…"
      />
      <input
        class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
        type="text"
        aria-label="Date"
        title="Date"
        v-model="item.date"
        placeholder="Date — March 2026"
      />
      <input
        class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
        type="url"
        inputmode="url"
        aria-label="Link to the review"
        title="Link to the review"
        v-model="item.link"
        placeholder="Link to the review"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { MAX_RATING, type ReviewContent } from '~/types/card'

export default defineComponent({
  props: {
    item: { type: Object as PropType<ReviewContent>, required: true },
  },
  emits: ['remove'],
  data() {
    return { MAX_RATING }
  },
  computed: {
    /**
     * A <select> hands back its value as a string, so binding item.rating
     * directly would store "4" and every numeric comparison downstream would
     * be against a string. Coerce on the way in, and keep null as null.
     */
    rating: {
      get(): number | null {
        return this.item.rating
      },
      set(value: string | number | null) {
        this.item.rating = value === null || value === '' ? null : Number(value)
      },
    },
  },
  mounted() {
    ;(this.$refs.body as HTMLInputElement | undefined)?.focus()
  },
})
</script>
