<template>
  <div v-if="gifts && gifts.length > 0" class="gift-grid-section">
    <div class="gift-grid-title">{{ title }}</div>
    <div class="gift-grid-items">
      <div
        v-for="gift in gifts"
        :key="gift.id"
        class="gift-grid-item"
        :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'"
      >
        <ImageWithLoader
          :src="getGiftUrl(gift.id, gift.isSsr)"
          class="gift-icon"
          object-fit="contain"
          loader-type="pulse"
          :inherit-background="false"
        />
        <div class="gift-icon-bg"></div>
        <div class="gift-name">{{ gift.name }}</div>
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
  .gift-grid-section {
    margin-top: 40px;
    background: #efefef;
    border: 2px solid #dee2e6;
    border-radius: 20px;
    padding: 25px;
  }

  .dark-mode .gift-grid-section {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .gift-grid-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #314665;
    text-align: center;
  }

  .dark-mode .gift-grid-title {
    /* color: #e0e6ed; */
    color: #e0f4ff;
  }

  .gift-grid-items {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
  }
  .gift-grid-item {
    width: 80px;
    height: 80px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .gift-grid-item > *,
  .gift-grid-item::before,
  .gift-grid-item::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
  }

  .gift-grid-item:hover {
    z-index: 10;
    transform: scale(1.1);
  }

  /* Border */
  .gift-grid-item::before {
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

  /* Solid Background */
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

  /* Dark Mode Overlay */
  .dark-mode .gift-grid-item::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.1);
    z-index: 3;
  }

  /* Icon Image */
  .gift-icon {
    width: 90%;
    height: 90%;
    z-index: 4;
  }
  .gift-grid-item .gift-name {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 10px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease,
      visibility 0.3s ease;
  }
  .dark-mode .gift-grid-item .gift-name {
    background: rgba(223, 227, 231, 0.95);
    color: #201e2e;
  }

  .gift-grid-item:hover .gift-name {
    opacity: 1;
    visibility: visible;
  }
</style>
