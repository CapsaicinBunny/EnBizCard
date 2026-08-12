<template>
  <div class="mediaC">
    <video
      v-show="type == 'video'"
      controlsList="nodownload nofullscreen noremoteplayback"
      @timeupdate="updateSeek()"
      disablePictureInPicture
      ref="mediaSource"
      class="source"
      :style="{ pointerEvents: PreviewMode ? 'none' : 'auto' }"
      :controls="!PreviewMode"
      preload="metadata"
    >
      <source
        :src="
          PreviewMode
            ? media.dataURI + '#t=0.2'
            : `./media/${getTitle(media.title)}.${media.ext}`
        "
      />
    </video>
    <img
      v-if="type == 'music' && media.coverDataURI"
      :src="
        PreviewMode
          ? media.coverDataURI
          : `./media/${getTitle(media.title)}.${media.coverExt}`
      "
      alt="cover"
    />
    <div class="controls cardColor">
      <p class="title">
        {{ media.title }}
      </p>
      <p class="sub" v-if="media.artist">
        <span>{{ media.artist }}</span>
        <span v-if="media.album"> - {{ media.album }}</span>
      </p>
      <div
        class="pCtrl"
        ref="pCtrl"
        :style="{ display: PreviewMode ? 'flex' : 'none' }"
      >
        <output class="currentTime sub" ref="bubble">00:00</output>
        <a
          class="playPause"
          :style="{
            backgroundColor: `${colors.buttonBg.color}`,
          }"
          @click="togglePlay($refs.mediaSource)"
        >
          <div
            class="icon play iconColor"
            ref="play"
            v-html="$icon('play')"
          ></div>
          <div
            class="icon pause iconColor"
            ref="pause"
            v-html="$icon('pause')"
          ></div>
        </a>
        <input
          class="seekBar seekbarColor"
          @change="setProgress($event)"
          ref="seekbar"
          type="range"
          value="0"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { CardColours, MediaContent, MediaKind } from '~/types/card'

export default defineComponent({
  props: {
    media: { type: Object as PropType<MediaContent>, required: true },
    type: { type: String as PropType<MediaKind>, required: true },
    colors: { type: Object as PropType<CardColours>, required: true },
    PreviewMode: { type: Boolean, default: true },
    togglePlay: {
      type: Function as PropType<(el: HTMLMediaElement) => void>,
      required: true,
    },
  },
  methods: {
    getTitle(e: string): string {
      return e.toLowerCase().split(' ').join('_')
    },
    setProgress(e: Event): void {
      const mediaSource = this.$refs.mediaSource as HTMLMediaElement
      const input = e.target as HTMLInputElement
      mediaSource.currentTime =
        mediaSource.duration * (Number(input.value) / 100)
    },
    updateSeek(): void {
      const mediaSource = this.$refs.mediaSource as HTMLMediaElement
      const seekbar = this.$refs.seekbar as HTMLInputElement
      const bubble = this.$refs.bubble as HTMLOutputElement
      const timenow = mediaSource.currentTime
      const value = (100 / mediaSource.duration) * timenow
      seekbar.value = String(value)

      // These were previously assigned back onto the numbers from Math.floor(),
      // which TypeScript rejects; separate strings keep the zero padding.
      const m = String(Math.floor(timenow / 60)).padStart(2, '0')
      const s = String(Math.floor(timenow % 60)).padStart(2, '0')
      bubble.value = `${m}:${s}`

      if (value == 100) {
        seekbar.value = '0'
        ;(this.$refs.play as HTMLElement).style.display = 'block'
        ;(this.$refs.pause as HTMLElement).style.display = 'none'
      }
    },
  },
  mounted() {
    ;(this.$refs.pCtrl as HTMLElement).style.display = 'flex'
  },
})
</script>
