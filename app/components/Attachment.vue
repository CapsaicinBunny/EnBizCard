<template>
  <div class="flex mt-6">
    <transition name="list">
      <Cropper
        v-if="showCropper"
        :src="tempURL"
        @closeCropper="closeCropper"
        :content="content"
        :mime="mime"
        :type="filetype"
        :resizeImage="resizeImage"
        :showAlert="showAlert"
      />
    </transition>
    <div class="flex flex-wrap items-center">
      <img
        class="w-12 h-12 rounded object-contain"
        v-if="imageAttached"
        :src="content[type].url"
        :title="`${
          type == 'logo'
            ? 'Brand logo'
            : type == 'photo'
            ? 'Card holder\'s photo'
            : 'Cover image'
        }`"
      />
      <button
        v-if="!imageAttached"
        class="p-3 rounded bg-gray-700 cursor-pointer hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="attachFile(null, type, false)"
        :class="
          dragOver ? 'bg-gray-900 outline-white' : 'bg-gray-700 border-none'
        "
        :aria-label="label"
        @drop.prevent="attachFile($event, type, true)"
        @dragleave.prevent.self="dragOver = false"
        @dragover.prevent.self="dragOver = true"
      >
        <input
          :ref="`import${type}`"
          type="file"
          :accept="`.png,.jpg,.jpeg,.gif,.webp${
            type == 'logo' || type == 'cover' ? ',.svg' : ''
          }`"
          v-show="false"
          @change="fileLoaded($event, type, false)"
          @click="$event.target.files = null"
        />
        <div
          class="w-6 h-6 pointer-events-none"
          v-html="$icon('add')"
        ></div>
      </button>
      <p v-if="!imageAttached" class="ml-3 leading-none">
        {{ label
        }}<span class="text-sm text-gray-400"><br />{{ description }}</span>
      </p>
      <button
        v-else
        class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="content[type].url = null"
        :aria-label="`Remove ${type}`"
        :title="`Remove ${type}`"
      >
        <div
          class="w-6 h-6"
          v-html="$icon('x')"
        ></div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { CardImages, ImageSlot, ResizeImage } from '~/types/card'

export default defineComponent({
  props: {
    content: { type: Object as PropType<CardImages>, required: true },
    type: { type: String as PropType<ImageSlot>, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    resizeImage: {
      type: Function as PropType<ResizeImage>,
      required: true,
    },
    showAlert: {
      type: Function as PropType<(message: string) => void>,
      required: true,
    },
  },
  data() {
    return {
      dragOver: false,
      showCropper: false,
      tempURL: null as string | null,
      mime: null as string | null,
      filetype: null as ImageSlot | null,
    }
  },
  computed: {
    imageAttached(): boolean {
      return this.content[this.type].url ? true : false
    },
  },
  methods: {
    closeCropper(): void {
      this.showCropper = false
    },
    attachFile(e: Event, type: ImageSlot, dropped: boolean): void {
      dropped
        ? (this.fileLoaded(e as DragEvent, type, true), (this.dragOver = false))
        : (this.$refs[`import${type}`] as HTMLInputElement).click()
    },
    fileLoaded(e: Event, type: ImageSlot, dropped: boolean): void {
      const dt = (e as DragEvent).dataTransfer
      const input = e.target as HTMLInputElement
      if (
        (dropped && dt && dt.files.length) ||
        (!dropped && input.files && input.files.length)
      ) {
        const file = (dropped ? dt!.files[0] : input.files![0]) as File
        const mime = file.type
        if (
          (type == 'logo' || type == 'cover') &&
          file.type.match(/image\/(svg\+xml|png|jpeg|gif|webp)/)
        ) {
          this.imageLoaded(file, type, mime)
        } else if (file.type.match(/image\/(png|jpeg|gif|webp)/)) {
          this.imageLoaded(file, type, mime)
        } else {
          if (type == 'logo' || type == 'cover') {
            this.showAlert(
              'Unsupported file format.\nOnly jpeg, png, webp, gif and svg file can be attached.'
            )
          } else {
            this.showAlert(
              'Unsupported file format.\nOnly jpeg, png, webp and gif file can be attached.'
            )
          }
        }
      }
    },
    imageLoaded(file: File, type: ImageSlot, mime: string): void {
      const reader = new FileReader()
      reader.onload = (f) => {
        // readAsDataURL always yields a string, but the FileReader result type
        // covers ArrayBuffer too.
        const dataURI = f.target!.result as string
        const ext = dataURI
          .split(',')[0]
          .split(':')[1]
          .split('/')[1]
          .match(/^\w+/g)![0]
        if (type == 'logo' || mime.match(/svg|gif|webp/)) {
          this.content[type] = {
            url: dataURI,
            blob: file,
            ext,
            mime,
            resized: file,
          }
          if (!mime.match(/svg|gif|webp/)) this.resizeImage(type, mime)
        } else {
          this.content[type].ext = ext
          this.filetype = type
          this.mime = mime
          this.tempURL = dataURI
          this.showCropper = true
        }
      }
      reader.readAsDataURL(file)
    },
  },
})
</script>
