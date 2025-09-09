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
        />
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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    z-index: 1;
    transition:
      transform 0.3s ease,
      z-index 0.3s ease;
  }
  .gift-grid-item:hover {
    z-index: 10;
    transform: scale(1.1);
  }
  .gift-yellow {
    background-color: #c7a579;
    background-image: linear-gradient(to bottom right, #a97d51 0%, transparent 50%),
      linear-gradient(to top left, #a97d51 0%, transparent 50%);
  }
  .gift-purple {
    background-color: #9e82d6;
    background-image: linear-gradient(to bottom right, #7a5bbe 0%, transparent 50%),
      linear-gradient(to top left, #7a5bbe 0%, transparent 50%);
  }
  .dark-mode .gift-yellow {
  }
  .dark-mode .gift-purple {
  }
  .gift-icon {
    width: 90%;
    height: 90%;
    border-radius: 50%;
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
