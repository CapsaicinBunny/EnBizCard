<template>
  <div class="flex flex-col w-full mt-6 bg-gray-800 rounded">
    <div class="flex justify-between">
      <div class="flex items-center w-full">
        <div
          class="p-1 shrink-0 focus:outline-none drag cursor-move"
          tabindex="-1"
        >
          <div class="w-6 h-6" v-html="$icon('drag')"></div>
        </div>
        <div class="w-full">
          <input
            class="px-4 w-full h-12 bg-transparent placeholder-gray-600 transition-colors duration-200 border-b border-black focus:outline-none focus:border-gray-500 hover:border-gray-500"
            type="text"
            name="section title"
            placeholder="Section title"
            v-model="featured[index].title"
            autocapitalize="words"
            title="Type your own section title"
          />
        </div>
      </div>
      <button
        class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
        @click="featured.splice(index, 1)"
        aria-label="Remove section"
        title="Remove section"
      >
        <div class="w-6 h-6" v-html="$icon('x')"></div>
      </button>
    </div>
    <VueDraggable
      v-model="featured[index].content"
      group="featured"
      class="mt-4"
      handle=".drag"
      :animation="1"
      ghost-class="ghost"
      target=".sortable-content"
    >
      <transition-group tag="div" name="list" class="sortable-content">
        <div v-for="(item, i) in featured[index].content" :key="'item' + i">
          <div
            class="flex items-center mt-2"
            v-if="item.contentType == 'media'"
          >
            <button
              class="p-1 shrink-0 focus:outline-none drag cursor-move"
              tabindex="-1"
            >
              <div class="w-6 h-6" v-html="$icon('drag')"></div>
            </button>
            <img
              class="w-12 h-12 rounded-l object-contain shrink-0 bg-gray-700"
              v-if="
                item.type == 'image'
                  ? item.dataURI
                  : item.coverDataURI
                    ? item.coverDataURI
                    : false
              "
              :src="item.type == 'image' ? item.dataURI : item.coverDataURI"
              :alt="item.title"
            />
            <a
              v-else
              class="w-12 h-12 bg-gray-900 flex items-center justify-center text-center text-xs rounded-l shrink-0 leading-none select-none cursor-pointer"
              target="_blank"
              href="https://duckduckgo.com/?q=Add+ID3+tags+to+mp3+file"
            >
              {{ item.info }}
            </a>
            <div class="w-full">
              <input
                class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded-r border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
                type="text"
                aria-label="Media title"
                autocapitalize="words"
                title="Media title"
                v-model="featured[index].content[i].title"
                placeholder="Media title"
              />
            </div>
            <button
              class="p-1 m-2 self-end shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove media"
              title="Remove media"
            >
              <div class="w-6 h-6" v-html="$icon('x')"></div>
            </button>
          </div>
          <ProductCard
            v-else-if="item.contentType == 'product'"
            :featured="featured"
            :item="item"
            :index="index"
            :i="i"
            :resizeImage="resizeImage"
            :showAlert="showAlert"
          />
          <div
            class="flex items-center mt-2"
            v-else-if="item.contentType == 'text'"
          >
            <button
              class="p-1 shrink-0 focus:outline-none drag cursor-move"
              tabindex="-1"
            >
              <div class="w-6 h-6" v-html="$icon('drag')"></div>
            </button>
            <div class="w-full">
              <textarea
                class="block px-4 py-3 w-full bg-black rounded border border-transparent placeholder-gray-600 transition-colors duration-200 focus:outline-none focus:border-gray-500 resize-none hover:border-gray-500"
                ref="text"
                aria-label="Enter text here"
                title="Enter text here"
                v-model="featured[index].content[i].value"
                placeholder="Enter text here"
                rows="5"
              ></textarea>
            </div>
            <button
              class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove text"
              title="Remove text"
            >
              <div class="w-6 h-6" v-html="$icon('x')"></div>
            </button>
          </div>
          <div class="flex items-center mt-2" v-else>
            <button
              class="p-1 shrink-0 focus:outline-none drag cursor-move"
              tabindex="-1"
            >
              <div class="w-6 h-6" v-html="$icon('drag')"></div>
            </button>
            <div class="w-full">
              <input
                class="px-4 w-full h-12 bg-black placeholder-gray-600 rounded border border-transparent transition-colors duration-200 focus:outline-none focus:border-gray-500 hover:border-gray-500"
                ref="link"
                type="text"
                aria-label="Paste embed code here"
                title="Paste embed code here"
                v-model="featured[index].content[i]"
                placeholder="Paste embed code here"
              />
            </div>
            <button
              class="p-1 m-2 shrink-0 focus:outline-none rounded hover:bg-gray-700 focus:bg-gray-700 transition-colors duration-200"
              @click="removeItem(i)"
              aria-label="Remove field"
              title="Remove field"
            >
              <div class="w-6 h-6" v-html="$icon('x')"></div>
            </button>
          </div>
        </div>
      </transition-group>
    </VueDraggable>
    <div
      class="grid grid-flow-row grid-cols-1 xs:grid-cols-2 gap-2 w-full p-2"
      :class="{ 'mt-4': hasContent }"
    >
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="attachMedia()"
        aria-label="Add media"
        :class="
          dragOver ? 'bg-gray-900 outline-white' : 'bg-gray-700 border-none'
        "
        @drop.prevent="fileLoaded($event, true)"
        @dragleave.prevent.self="dragOver = false"
        @dragover.prevent.self="dragOver = true"
      >
        <input
          ref="import"
          type="file"
          :accept="mimetypes"
          v-show="false"
          @change="fileLoaded($event, false)"
          @click="$event.target.files = null"
        />
        <div class="w-6 h-6 mr-3" v-html="$icon('file')"></div>
        <p class="leading-none">Add media</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addLink()"
        aria-label="Embed media"
      >
        <div class="w-6 h-6 mr-3" v-html="$icon('code')"></div>
        <p class="leading-none">Embed media</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addProduct()"
        aria-label="Add product"
      >
        <div class="w-6 h-6 mr-3" v-html="$icon('product')"></div>
        <p class="leading-none">Add product</p>
      </button>
      <button
        class="flex items-center p-3 rounded cursor-pointer bg-gray-700 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200 focus:outline-none"
        @click="addText()"
        aria-label="Add text"
      >
        <div class="w-6 h-6 mr-3" v-html="$icon('text')"></div>
        <p class="leading-none text-left">Add text</p>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type {
  FeaturedSection,
  MediaContent,
  MediaKind,
  ResizeImage,
  TextContent,
} from '~/types/card'

// id3-parser 3 dropped the `universal/` entry points and made `parse` the
// default export instead of a named one. The package is still CommonJS, and
// Vite's interop hands us the whole `module.exports` rather than unwrapping
// `exports.default` — so a plain default import is the object, not the
// function. Reach through it, but tolerate a bundler that does unwrap.
import { convertFileToBuffer } from 'id3-parser/lib/util.js'
import id3 from 'id3-parser'
import { errorText } from '~/utils/errors'

const parse = typeof id3 === 'function' ? id3 : id3.default
// pdf.js used to be vendored under assets/scripts and pulled in with CommonJS
// require(), which Vite cannot resolve. It now comes from npm, with the worker
// bundled by Vite's ?worker import.
//
// It is loaded on demand rather than at module scope: the library and its worker
// are ~1.2 MB, but are only needed when someone attaches a PDF. This also keeps
// module evaluation free of `new Worker(...)`, so importing this component is
// safe on the server.
type Pdfjs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<Pdfjs> | undefined
function loadPdfjs(): Promise<Pdfjs> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist')
      const { default: PdfjsWorker } =
        await import('pdfjs-dist/build/pdf.worker.min.mjs?worker')
      pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker()
      return pdfjs
    })()
  }
  return pdfjsPromise
}
import { VueDraggable } from 'vue-draggable-plus'

import ProductCard from './ProductCard.vue'

export default defineComponent({
  props: {
    featured: { type: Array as PropType<FeaturedSection[]>, required: true },
    /** `accept` list for the hidden file input. */
    mimetypes: { type: String, required: true },
    /** Position of this section within `featured`. */
    index: { type: Number, required: true },
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
    }
  },
  components: {
    ProductCard,
    VueDraggable,
  },
  computed: {
    hasContent(): number {
      return this.featured[this.index].content.length
    },
  },
  methods: {
    mediaType(t: string): MediaKind | undefined {
      switch (true) {
        case t == 'image/jpeg' || t == 'image/png':
          return 'image'
        case t == 'audio/mpeg':
          return 'music'
        case t == 'video/mp4' || t == 'video/webm':
          return 'video'
        case t == 'application/pdf':
          return 'document'
      }
    },
    attachMedia(): void {
      ;(this.$refs.import as HTMLInputElement).click()
    },
    addLink(): void {
      this.featured[this.index].content.push('')
      // Bare strings are the link entries; everything else carries contentType.
      const links = this.featured[this.index].content.filter(
        (e) => typeof e === 'string',
      )
      setTimeout(
        () => (this.$refs.link as HTMLInputElement[])[links.length - 1].focus(),
        50,
      )
    },
    addProduct(): void {
      this.featured[this.index].content.push({
        image: null,
        title: null,
        description: null,
        price: null,
        label: null,
        link: null,
        contentType: 'product',
      })
    },
    addText(): void {
      const entry: TextContent = { contentType: 'text', value: null }
      this.featured[this.index].content.push(entry)
      const texts = this.featured[this.index].content.filter(
        (e) => typeof e !== 'string' && e.contentType == 'text',
      )
      setTimeout(
        () =>
          (this.$refs.text as HTMLTextAreaElement[])[texts.length - 1].focus(),
        50,
      )
    },
    fileLoaded(e: Event, dropped: boolean): void {
      const dt = (e as DragEvent).dataTransfer
      const input = e.target as HTMLInputElement
      if (
        (dropped && dt && dt.files.length) ||
        (!dropped && input.files && input.files.length)
      ) {
        const file = (dropped ? dt!.files[0] : input.files![0]) as File
        this.dragOver = false
        const mimetype = file.type
        const type = this.mediaType(mimetype)
        if (file) {
          switch (type) {
            case 'image':
              this.imageLoaded(file, type, mimetype)
              break
            case 'music':
              this.musicLoaded(file, type)
              break
            case 'video':
              this.videoLoaded(file, type)
              break
            case 'document':
              this.documentLoaded(file, type)
              break
            default:
              this.showAlert(
                'Unsupported file format.\n\nOnly jpeg, png, mp3, mp4, webm and pdf files can be attached.',
              )
              break
          }
        }
      } else this.dragOver = false
    },
    getFileName(file: File): string {
      return file.name.replace(/(?:\.([^.]+))?$/, '')
    },
    removeItem(i: number): void {
      this.featured[this.index].content.splice(i, 1)
    },
    // Images
    imageLoaded(file: File, type: MediaKind, mime: string): void {
      const title = this.getFileName(file)
      const reader = new FileReader()
      reader.onload = (f) => {
        const dataURI = f.target!.result as string
        const ext = dataURI
          .split(',')[0]
          .split(':')[1]
          .split('/')[1]
          .match(/^\w+/g)![0]
        const entry: MediaContent = {
          name: file.name,
          title,
          dataURI,
          file,
          type,
          contentType: 'media',
          ext,
          mime,
        }
        this.featured[this.index].content.push(entry)
        this.resizeImage(
          type,
          mime,
          this.index,
          this.featured[this.index].content.length - 1,
        )
      }
      reader.onerror = () => {
        this.showAlert(
          `Could not read ${file.name}. The file may be unreadable.`,
        )
      }
      reader.readAsDataURL(file)
    },

    // Music
    async musicLoaded(file: File, type: MediaKind): Promise<void> {
      // A missing tag or missing cover art used to reject, so the old empty
      // catch here swallowed genuine failures too — which is how the
      // id3-parser 3 import break stayed invisible. extractTags() now returns
      // whether there is a cover to resize, and only throws on real errors.
      try {
        const hasCover = await this.extractTags(file, type)
        if (hasCover) {
          this.resizeImage(
            type,
            'image/jpeg',
            this.index,
            this.featured[this.index].content.length - 1,
          )
        }
      } catch (err) {
        this.showAlert(`Could not read that MP3.\n\n${errorText(err)}`)
      }
    },
    /** Returns whether an embedded cover was found and needs resizing. */
    async extractTags(file: File, type: MediaKind): Promise<boolean> {
      const tag = parse(await convertFileToBuffer(file))
      const base: MediaContent = {
        name: file.name,
        dataURI: URL.createObjectURL(file),
        type,
        contentType: 'media',
        file,
        ext: 'mp3',
      }
      if (!tag) {
        this.featured[this.index].content.push({
          ...base,
          title: this.getFileName(file),
          info: 'No ID3 Tag',
        })
        return false
      }
      // id3-parser declares every frame optional, so a tagged MP3 with no TIT2
      // still yields `undefined` here. getTitle() lowercases it on the export
      // path, so fall back to the filename rather than crashing the download.
      const tags = {
        title: tag.title || this.getFileName(file),
        artist: tag.artist,
        album: tag.album,
      }
      if (!tag.image) {
        this.featured[this.index].content.push({
          ...base,
          ...tags,
          info: 'No Thumb',
        })
        return false
      }
      // IImage.data is optional in id3-parser's types even when `image` is set.
      const cover = new Blob([new Uint8Array(tag.image.data ?? [])])
      this.featured[this.index].content.push({
        ...base,
        ...tags,
        cover,
        coverDataURI: URL.createObjectURL(cover),
        coverExt: 'jpeg',
      })
      return true
    },

    // Videos
    videoLoaded(file: File, type: MediaKind): void {
      const title = this.getFileName(file)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const video = document.createElement('video')
      let videoFile: Blob
      let dataURI: string
      const maxWidth = 80
      const maxHeight = 80
      const reader = new FileReader()
      const uA = navigator.userAgent.match(/firefox|android/gi)
      const videoProcessor = (): void => {
        let width = video.videoWidth
        let height = video.videoHeight

        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const coverDataURI = canvas.toDataURL('image/jpeg', 0.8)
        const entry: MediaContent = {
          name: file.name,
          coverDataURI,
          coverExt: 'jpeg',
          dataURI,
          file,
          title,
          type,
          contentType: 'media',
          ext: 'mp4',
        }
        this.featured[this.index].content.push(entry)
      }
      if (uA && uA.length == 2) {
        video.addEventListener('loadstart', videoProcessor)
      } else {
        video.addEventListener('seeked', videoProcessor)
      }

      // The entry is only pushed from videoProcessor, which runs on 'seeked'.
      // A container the browser accepts by MIME but cannot decode (H.265 in
      // Chrome, say) fires 'error' and never 'seeked', so without this the
      // attachment simply never appears and nothing is reported.
      video.addEventListener('error', () => {
        this.showAlert(
          `Could not read that video.\n\nThe file may use a codec your browser cannot decode.`,
        )
      })

      reader.onload = (f) => {
        videoFile = new Blob([f.target!.result as ArrayBuffer], {
          type: 'video/mp4',
        })
        dataURI = URL.createObjectURL(videoFile)
        video.src = dataURI + '#t=0.2'
      }
      reader.onerror = () => {
        this.showAlert(
          `Could not read ${file.name}. The file may be unreadable.`,
        )
      }
      reader.readAsArrayBuffer(file)
    },

    // PDFs
    dataURIToBinary(dataURI: string): Uint8Array {
      const BASE64_MARKER = ';base64,'
      const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
      const base64 = dataURI.substring(base64Index)
      const raw = window.atob(base64)
      const rawLength = raw.length
      const array = new Uint8Array(new ArrayBuffer(rawLength))

      // `i` was undeclared here. Under Nuxt 2 that made it an implicit global;
      // in an ES module (strict mode) it only avoided a ReferenceError because
      // an unrelated classic script happened to leak a global `i`.
      for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i)
      }
      return array
    },
    formatBytes(a: number, b: number = 2): string {
      if (0 === a) return '0 Bytes'
      const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024))
      return (
        parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
        ' ' +
        ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
      )
    },
    documentLoaded(file: File, type: MediaKind): void {
      const filesize = this.formatBytes(file.size)
      const title = this.getFileName(file)
      const reader = new FileReader()
      let data: Uint8Array
      const maxWidth = 1296
      const maxHeight = 1296
      reader.onload = async (f) => {
        // Flattened to await so a failure anywhere in the chain reaches the
        // catch below. `onload` is async, so an unhandled rejection here would
        // otherwise make the attachment fail silently with no feedback.
        try {
          data = this.dataURIToBinary(f.target!.result as string)
          const pdfjs = await loadPdfjs()
          // pdf.js 2.x coerced a bare TypedArray into `{ data }`; from v4 on
          // the argument must already be an options object.
          const pdf = await pdfjs.getDocument({ data }).promise
          const page = await pdf.getPage(1)

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          const scale = 1
          const viewport = page.getViewport({ scale })
          let width = viewport.width
          let height = viewport.height

          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
          canvas.width = width
          canvas.height = height

          await page.render({ canvasContext: ctx, viewport }).promise

          const coverDataURI = canvas.toDataURL('image/jpeg', 0.8)
          const cover = new Blob([this.dataURIToBinary(coverDataURI)], {
            type: 'image/jpeg',
          })
          const entry: MediaContent = {
            name: file.name,
            cover,
            coverDataURI,
            coverExt: 'jpeg',
            file,
            filesize,
            title,
            type,
            contentType: 'media',
            ext: 'pdf',
          }
          this.featured[this.index].content.push(entry)
        } catch (err) {
          this.showAlert(`Could not read that PDF.\n\n${errorText(err)}`)
        }
      }
      reader.readAsDataURL(file)
    },
  },
})
</script>
