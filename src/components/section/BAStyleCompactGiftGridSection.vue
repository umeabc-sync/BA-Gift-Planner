<template>
  <div v-if="gifts && gifts.length > 0" class="ba-style-compact-gift-grid-section">
    <div class="ba-style-compact-gift-grid-title">{{ title }}</div>
    <div class="ba-style-compact-gift-grid-items">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="ba-style-compact-gift-grid-item"
        :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'"
      >
        <ImageWithLoader
          :src="getGiftUrl(gift.id, gift.isSsr)"
          class="ba-style-compact-gift-icon"
          object-fit="contain"
          loader-type="pulse"
          :inherit-background="false"
        />
        <div class="gift-icon-bg"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getGiftUrl } from '@utils/getGiftUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  defineProps({
    title: String,
    gifts: Array,
  })
</script>

<style scoped>
.ba-style-compact-gift-grid-section {
    margin-top: 20px;
    background: #efefef;
    border: 2px solid #dee2e6;
    border-radius: 20px;
    padding: 15px;
  }

  .dark-mode .ba-style-compact-gift-grid-section {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .ba-style-compact-gift-grid-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #314665;
    text-align: center;
  }

  .dark-mode .ba-style-compact-gift-grid-title {
    color: #e0f4ff;
  }

  .ba-style-compact-gift-grid-items {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
  }
  .ba-style-compact-gift-grid-item {
    width: 50px;
    height: 50px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    position: relative;
  }

  .ba-style-compact-gift-grid-item > *,
  .ba-style-compact-gift-grid-item::before,
  .ba-style-compact-gift-grid-item::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
  }

  .ba-style-compact-gift-grid-item::before {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    z-index: 1;
  }

  .gift-yellow::before {
    background-color: #c7a579;
    background-image: linear-gradient(to bottom right, #a97d51 0%, transparent 50%),
      linear-gradient(to top left, #a97d51 0%, transparent 50%);
  }

  .gift-purple::before {
    background-color: #9e82d6;
    background-image: linear-gradient(to bottom right, #7a5bbe 0%, transparent 50%),
      linear-gradient(to top left, #7a5bbe 0%, transparent 50%);
  }

  .gift-icon-bg {
    width: 90%;
    height: 90%;
    border-radius: 50%;
    z-index: 2;
  }

  .gift-yellow .gift-icon-bg {
    background-color: #c7a579;
  }

  .gift-purple .gift-icon-bg {
    background-color: #9e82d6;
  }

  .dark-mode .ba-style-compact-gift-grid-item::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.1);
    z-index: 3;
  }

  .ba-style-compact-gift-icon {
    width: 90%;
    height: 90%;
    z-index: 4;
  }
</style>
