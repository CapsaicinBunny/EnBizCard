<template>
  <div class="media" :style="{ backgroundColor: `${colors.cardBg.color}` }">
    <img
      v-if="product.image"
      :src="
        PreviewMode
          ? product.image.dataURI
          : `./media/${getTitle(product.image.title)}.${product.image.ext}`
      "
      alt="Product image"
    />
    <div class="controls cardColor prodInfo">
      <p class="title">
        {{ product.title }}
      </p>
      <p v-if="product.description" class="sub">
        {{ product.description }}
      </p>
      <p v-if="product.price" class="price">
        {{ product.price }}
      </p>
      <a
        v-if="product.label"
        class="label"
        :style="{
          backgroundColor: `${colors.buttonBg.color}`,
          lineHeight: PreviewMode ? 'inherit' : '1.5rem',
        }"
        target="_blank"
        :href="product.link"
        ><p class="iconColor">{{ product.label }}</p></a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { CardColours, ProductContent } from '~/types/card'

export default defineComponent({
  props: {
    product: { type: Object as PropType<ProductContent>, required: true },
    colors: { type: Object as PropType<CardColours>, required: true },
    /** False while downloadPackage() serialises the DOM for export. */
    PreviewMode: { type: Boolean, default: true },
  },
  methods: {
    getTitle(e: string): string {
      return e.toLowerCase().split(' ').join('_')
    },
  },
})
</script>
