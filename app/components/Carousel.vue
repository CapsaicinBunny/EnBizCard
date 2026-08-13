<template>
  <div class="mt-2 rounded bg-gray-900 p-2">
    <div class="flex items-center">
      <button
        class="p-1 shrink-0 focus:outline-none drag cursor-move"
        tabindex="-1"
      >
        <div class="w-6 h-6" v-html="$icon('drag')"></div>
      </button>
      <p class="px-2 w-full leading-none text-gray-400">
        Carousel — {{ item.slides.length }}
        {{ item.slides.length === 1 ? 'slide' : 'slides' }}
      </p>
      <button
        class="p-1 m-1 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="$emit('remove')"
        aria-label="Remove carousel"
        title="Remove carousel"
      >
        <div class="w-6 h-6" v-html="$icon('x')"></div>
      </button>
    </div>

    <VueDraggable
      v-model="item.slides"
      handle=".slide-drag"
      :animation="1"
      ghost-class="ghost"
      target=".sortable-slides"
    >
      <transition-group tag="div" name="list" class="sortable-slides">
        <div
          v-for="(slide, s) in item.slides"
          :key="'slide' + s"
          class="flex items-center mt-2"
        >
          <button
            class="p-1 shrink-0 focus:outline-none slide-drag cursor-move"
            tabindex="-1"
          >
            <div class="w-6 h-6" v-html="$icon('drag')"></div>
          </button>
          <img
            class="w-12 h-12 rounded-l object-cover shrink-0 bg-gray-700"
            :src="slide.type === 'image' ? slide.dataURI : slide.coverDataURI"
            :alt="slide.title ?? ''"
          />
          <div class="w-full">
            <input
              class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded-r border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
              type="text"
              aria-label="Slide caption"
              title="Slide caption"
              autocapitalize="words"
              v-model="item.slides[s].title"
              placeholder="Slide caption"
            />
          </div>
          <button
            class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
            @click="item.slides.splice(s, 1)"
            aria-label="Remove slide"
            title="Remove slide"
          >
            <div class="w-6 h-6" v-html="$icon('x')"></div>
          </button>
        </div>
      </transition-group>
    </VueDraggable>

    <button
      class="flex items-center mt-2 p-3 w-full rounded cursor-pointer transition-colors duration-200 focus:outline-none"
      :class="
        dragOver
          ? 'bg-gray-700 outline-white'
          : 'bg-gray-800 hover:bg-gray-700 focus:bg-gray-700'
      "
      @click="pick()"
      aria-label="Add slides"
      @drop.prevent="filesLoaded($event, true)"
      @dragleave.prevent.self="dragOver = false"
      @dragover.prevent.self="dragOver = true"
    >
      <!-- `multiple`: a carousel is the one place bulk attaching is the point. -->
      <input
        ref="import"
        type="file"
        multiple
        accept="image/jpeg, image/png, video/mp4, video/webm"
        v-show="false"
        @change="filesLoaded($event, false)"
        @click="($event.target as HTMLInputElement).value = ''"
      />
      <div class="w-6 h-6 mr-3" v-html="$icon('add-img')"></div>
      <p class="leading-none">Add slides</p>
    </button>
    <p v-if="!item.slides.length" class="mt-2 px-1 text-sm text-gray-400">
      Photos and clips, shown as a swipeable strip. jpeg, png, mp4 and webm.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { CarouselContent, ResizeImage } from '~/types/card'
import { captureVideoEntry, readImageEntry } from '~/utils/media'
import { errorText } from '~/utils/errors'

export default defineComponent({
  components: { VueDraggable },
  props: {
    item: { type: Object as PropType<CarouselContent>, required: true },
    /** Section index, needed so resizeImage() can find the slide again. */
    index: { type: Number, required: true },
    /** This carousel's index within the section's content. */
    i: { type: Number, required: true },
    resizeImage: { type: Function as PropType<ResizeImage>, required: true },
    showAlert: {
      type: Function as PropType<(msg: string) => void>,
      required: true,
    },
  },
  emits: ['remove'],
  data() {
    return { dragOver: false }
  },
  methods: {
    pick(): void {
      ;(this.$refs.import as HTMLInputElement).click()
    },
    filesLoaded(e: Event, dropped: boolean): void {
      this.dragOver = false
      const dt = (e as DragEvent).dataTransfer
      const input = e.target as HTMLInputElement
      const list = dropped ? dt?.files : input.files
      if (!list || list.length === 0) return
      // Snapshot before the first await: an input's FileList is cleared by the
      // @click handler the moment the picker is reopened, and awaiting inside
      // the loop leaves plenty of room for that to happen mid-iteration.
      for (const file of Array.from(list)) void this.addSlide(file)
    },
    async addSlide(file: File): Promise<void> {
      const mime = file.type
      const isImage = mime === 'image/jpeg' || mime === 'image/png'
      const isVideo = mime === 'video/mp4' || mime === 'video/webm'
      if (!isImage && !isVideo) {
        this.showAlert(
          `${file.name} cannot go in a carousel.\n\nSlides can be jpeg, png, mp4 or webm.`,
        )
        return
      }
      try {
        const entry = isImage
          ? await readImageEntry(file, mime)
          : await captureVideoEntry(file)
        this.item.slides.push(entry)
        // Videos carry their own poster frame already; only stills resize.
        if (isImage) {
          this.resizeImage(
            'carousel',
            mime,
            this.index,
            this.i,
            this.item.slides.length - 1,
          )
        }
      } catch (err) {
        this.showAlert(errorText(err))
      }
    },
  },
})
</script>
