<template>
  <div class="mediaC">
    <div>
      <img
        :src="
          PreviewMode
            ? media.coverDataURI
            : `./media/${getTitle(media.title)}.${media.coverExt}`
        "
        :alt="media.title"
      />
    </div>
    <div class="controls cardColor">
      <p class="title">
        {{ media.title }}
      </p>
      <div class="docDl">
        <p class="fileSize sub">PDF - {{ media.filesize }}</p>
        <a
          class="dlBtn"
          @click.prevent="downloadDocument()"
          :style="{
            backgroundColor: `${colors.buttonBg.color}`,
          }"
          :href="
            PreviewMode ? '' : `./media/${getTitle(media.title)}.${media.ext}`
          "
          download
          target="_blank"
        >
          <div class="icon iconColor" v-html="$icon('download')"></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { saveAs } from 'file-saver'
import type { CardColours, MediaContent, MediaKind } from '~/types/card'

export default defineComponent({
  props: {
    media: { type: Object as PropType<MediaContent>, required: true },
    type: { type: String as PropType<MediaKind>, required: true },
    colors: { type: Object as PropType<CardColours>, required: true },
    PreviewMode: { type: Boolean, default: true },
  },
  methods: {
    getTitle(e: string): string {
      return e.toLowerCase().split(' ').join('_')
    },
    downloadDocument(): void {
      saveAs(
        window.URL.createObjectURL(this.media.file),
        `${this.media.title}.pdf`,
      )
    },
  },
})
</script>
