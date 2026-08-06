<template>
  <div class="flex items-center mt-2">
    <button
      class="p-1 shrink-0 focus:outline-none drag cursor-move"
      tabindex="-1"
    >
      <div
        class="w-6 h-6"
        v-html="$icon('drag')"
      ></div>
    </button>
    <div class="flex flex-col items-center bg-gray-700 rounded p-2">
      <div class="flex items-center w-full">
        <div id="imageContainer" class="mr-2 shrink-0">
          <img
            class="w-12 h-12 object-contain shrink-0 border-2 rounded p-1 border-gray-700 transition-colors duration-200 hover:border-red-600 cursor-pointer"
            v-if="item.image && item.image.dataURI"
            :src="item.image.dataURI"
            :alt="item.image.title"
            title="Click to remove product image"
            @click="removeImage(i)"
            @keypress.space.enter.prevent="removeImage(i)"
            tabindex="0"
          />
          <button
            v-else
            class="p-3 h-12 w-12 box-border rounded cursor-pointer border border-dashed border-black hover:border-gray-400 focus:border-gray-400 transition-colors duration-200 focus:outline-none"
            @click="loadFile(i)"
            aria-label="Add product image"
            title="Add product image"
            :class="dragOver ? 'outline-white' : ''"
            @drop.prevent="fileLoaded($event, i, true)"
            @dragleave.prevent.self="dragOver = false"
            @dragover.prevent.self="dragOver = true"
          >
            <input
              ref="import"
              type="file"
              accept="image/jpeg, image/png"
              v-show="false"
              @change="fileLoaded($event, i, false)"
              @click="$event.target.files = null"
            />
            <div
              class="w-6 h-6 pointer-events-none"
              v-html="$icon('add-img')"
            ></div>
          </button>
        </div>
        <div class="w-full">
          <input
            class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
            ref="input"
            type="text"
            v-model="item.title"
            autocapitalize="words"
            aria-label="Enter product title"
            title="Enter product title"
            placeholder="Product title"
          />
        </div>
      </div>
      <textarea
        name="description"
        placeholder="Product description"
        class="pDescription block mt-2 px-4 py-3 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 resize-none hover:border-gray-500"
        rows="2"
        v-model="item.description"
        aria-label="Enter product description"
        title="Enter product description"
      ></textarea>
      <input
        type="text"
        name="price"
        class="pPrice px-4 h-12 mt-2 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
        autocapitalize="words"
        placeholder="Price"
        v-model="item.price"
        aria-label="Enter product price"
        title="Enter product price"
      />
      <div class="grid grid-cols-2 gap-x-2">
        <input
          type="text"
          name="link"
          class="pLink px-4 h-12 mt-2 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
          placeholder="Button link"
          v-model="item.link"
          aria-label="Enter button link"
          title="Enter button link"
        />
        <input
          type="text"
          name="label"
          class="pLabel px-4 h-12 mt-2 w-full bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
          placeholder="Button label"
          autocapitalize="words"
          v-model="item.label"
          aria-label="Enter button label"
          title="Enter button label"
        />
      </div>
    </div>
    <button
      class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200"
      @click="removeItem(i)"
      aria-label="Remove product"
      title="Remove product"
    >
      <div
        class="w-6 h-6"
        v-html="$icon('x')"
      ></div>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  FeaturedSection,
  ProductContent,
  ProductImage,
} from '~/types/card'

export default defineComponent({
  props: {
    /** Position of this product within its section's content list. */
    i: { type: Number, required: true },
    /** Position of the owning section within `featured`. */
    index: { type: Number, required: true },
    item: { type: Object as PropType<ProductContent>, required: true },
    featured: {
      type: Array as PropType<FeaturedSection[]>,
      required: true,
    },
    showAlert: {
      type: Function as PropType<(message: string) => void>,
      required: true,
    },
    resizeImage: {
      type: Function as PropType<
        (type: 'product', mime: string, index1: number, index2: number) => void
      >,
      required: true,
    },
  },
  data() {
    return {
      dragOver: false,
    }
  },
  methods: {
    /** Narrow a content entry to a product; the list is a union. */
    productAt(i: number): ProductContent {
      return this.featured[this.index].content[i] as ProductContent
    },
    removeImage(i: number): void {
      this.productAt(i).image = null
    },
    removeItem(i: number): void {
      this.featured[this.index].content.splice(i, 1)
    },
    loadFile(): void {
      ;(this.$refs.import as HTMLInputElement).click()
    },
    getFileName(file: File): string {
      return file.name.replace(/(?:\.([^.]+))?$/, '')
    },
    fileLoaded(e: Event, i: number, dropped: boolean): void {
      const dt = (e as DragEvent).dataTransfer
      const input = e.target as HTMLInputElement
      if (
        (dropped && dt && dt.files.length) ||
        (!dropped && input.files && input.files.length)
      ) {
        const file = (dropped ? dt!.files[0] : input.files![0]) as File
        const mimetype = file.type
        this.dragOver = false
        if (file && mimetype.match(/image\/jpeg|image\/png/gi)) {
          this.imageLoaded(file, i, mimetype)
        } else
          this.showAlert(
            'Unsupported file format.\nOnly jpeg and png files can be attached.'
          )
      } else this.dragOver = false
    },
    imageLoaded(file: File, i: number, mime: string): void {
      const title = this.getFileName(file)
      const reader = new FileReader()
      reader.onload = (f) => {
        const dataURI = f.target!.result as string
        const ext = dataURI
          .split(',')[0]
          .split(':')[1]
          .split('/')[1]
          .match(/^\w+/g)![0]
        const image: ProductImage = {
          dataURI,
          file,
          type: 'image',
          ext,
          mime,
          title,
        }
        this.productAt(i).image = image
        // Resize the product we just wrote to. This passed
        // `content.length - 1` before, which only happened to be right when the
        // product was the last item in its section — otherwise it resized a
        // different entry, or threw on one with no `.image`.
        this.resizeImage('product', mime, this.index, i)
      }
      reader.readAsDataURL(file)
    },
  },
  mounted() {
    const input = this.$refs.input as HTMLInputElement
    !input.value && input.focus()
  },
})
</script>
