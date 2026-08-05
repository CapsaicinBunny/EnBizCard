<template>
  <div
    id="notificationContainer"
    class="flex justify-center fixed top-0 left-0 right-0 bottom-0 items-center z-30 bg-black/80"
  >
    <div
      class="flex flex-col items-center notification content bg-gray-800 text-gray-100 rounded relative z-50 max-w-sm mx-4 p-2"
    >
      <div ref="container" class="cropper-container mb-2">
        <img ref="image" :src="src" alt="Image to crop" />
      </div>
      <div class="flex">
        <button
          class="p-3 font-extrabold rounded tracking-wide focus:outline-none select-none bg-gray-700 mr-2 hover:bg-gray-600 focus:bg-gray-600 transition-colors duration-200"
          @click="$emit('closeCropper')"
        >
          Cancel
        </button>
        <button
          class="font-extrabold leading-none tracking-wide select-none shrink-0 p-3 text-white bg-emerald-600 rounded hover:bg-emerald-500 focus:bg-emerald-500 transition-colors duration-200 focus:outline-none"
          @click="cropPhoto"
        >
          Crop photo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Cropper from 'cropperjs'

// cropperjs 2 is a set of custom elements rather than the single widget v1 was,
// so the v1 option object has no equivalent — the configuration lives in the
// template markup instead. This mirrors the library's own default template with
// the v1 settings applied:
//   zoomable/scalable: false -> `scalable` dropped from <cropper-image>
//   autoCropArea: 1          -> initial-coverage="1"
//   aspectRatio              -> aspect-ratio="..."
// v1's `viewMode: 2` has no v2 counterpart; the selection is no longer clamped
// to the image, but it starts covering the whole image as it did before.
const buildTemplate = (aspectRatio) =>
  '<cropper-canvas background>' +
  '<cropper-image rotatable translatable></cropper-image>' +
  '<cropper-shade></cropper-shade>' +
  '<cropper-handle action="select" plain></cropper-handle>' +
  `<cropper-selection initial-coverage="1" aspect-ratio="${aspectRatio}" movable resizable>` +
  '<cropper-grid role="grid" bordered covered></cropper-grid>' +
  '<cropper-crosshair centered></cropper-crosshair>' +
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
  '<cropper-handle action="n-resize"></cropper-handle>' +
  '<cropper-handle action="e-resize"></cropper-handle>' +
  '<cropper-handle action="s-resize"></cropper-handle>' +
  '<cropper-handle action="w-resize"></cropper-handle>' +
  '<cropper-handle action="ne-resize"></cropper-handle>' +
  '<cropper-handle action="nw-resize"></cropper-handle>' +
  '<cropper-handle action="se-resize"></cropper-handle>' +
  '<cropper-handle action="sw-resize"></cropper-handle>' +
  '</cropper-selection>' +
  '</cropper-canvas>'

export default {
  props: ['src', 'mime', 'content', 'resizeImage', 'type'],
  data() {
    return {
      cropper: null,
    }
  },
  methods: {
    async cropPhoto() {
      const selection = this.cropper.getCropperSelection()
      const image = this.cropper.getCropperImage()
      if (!selection || !image) return

      // $toCanvas() defaults to the selection's on-screen size, where v1's
      // getCroppedCanvas() returned source resolution. Undo the image's display
      // scale so the crop keeps the original pixels for resizeImage() to work
      // from — the modal is only ~350px wide, but covers go up to 960px.
      const [a, b] = image.$getTransform()
      const scale = Math.hypot(a, b) || 1
      const canvas = await selection.$toCanvas({
        width: Math.round(selection.width / scale),
      })

      this.content[this.type].url = canvas.toDataURL(this.mime)
      this.content[this.type].mime = this.mime
      canvas.toBlob(
        (blob) => {
          this.content[this.type].blob = new File([blob], 'photo', {
            type: this.mime,
          })
          this.resizeImage(this.type, this.mime)
          this.$emit('closeCropper')
        },
        this.mime,
        0.8
      )
    },
  },
  mounted() {
    this.cropper = new Cropper(this.$refs.image, {
      container: this.$refs.container,
      template: buildTemplate(this.type == 'photo' ? 1 : 3 / 2),
    })
  },
  beforeUnmount() {
    // Removes the elements cropperjs inserted next to our <img>; Vue never saw
    // them, so it will not clean them up itself.
    if (this.cropper) this.cropper.destroy()
  },
}
</script>

<style lang="scss">
.cropper-container {
  // cropperjs hides our <img> and inserts <cropper-canvas> beside it, so nothing
  // in here has an intrinsic size any more — the modal's shrink-to-fit flex
  // layout would collapse it to <cropper-canvas>'s 200x100 minimum.
  width: 20rem;
  max-width: 100%;

  cropper-canvas {
    width: 100%;
    height: 20rem;
  }
  img {
    display: none;
  }
}
</style>
