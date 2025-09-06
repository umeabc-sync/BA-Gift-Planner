<template>
  <div v-if="gifts && gifts.length > 0" class="gift-grid-section">
    <div class="gift-grid-title">{{ title }}</div>
    <div class="gift-grid-items">
      <div v-for="gift in gifts" :key="gift.id" class="gift-grid-item-wrapper">
        <div class="gift-grid-item" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
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
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px 40px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
    transform: skew(-8deg);
    border: 1px solid #dee2e6;
  }

  .dark-mode .gift-grid-section {
    background: #1f3048;
    border-color: #2a4a6e;
  }

  .gift-grid-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 20px;
    color: #314665;
    text-align: center;
    transform: skew(8deg);
  }

  .dark-mode .gift-grid-title {
    color: #e0f4ff;
  }

  .gift-grid-items {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .gift-grid-item-wrapper {
    transform: skew(8deg);
    position: relative;
    z-index: 1;
  }

  .gift-grid-item-wrapper:hover {
    z-index: 10;
  }

  .gift-grid-item {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .gift-grid-item-wrapper:hover .gift-grid-item {
    transform: scale(1.1);
  }

  .gift-yellow {
    background: linear-gradient(45deg, #a97d51, #c7a579);
  }

  .gift-purple {
    background: linear-gradient(45deg, #7a5bbe, #9e82d6);
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

  .gift-grid-item-wrapper:hover .gift-name {
    opacity: 1;
    visibility: visible;
  }

  @media (max-width: 768px) {
    .gift-grid-section {
      transform: skew(0);
    }

    .gift-grid-title,
    .gift-grid-item-wrapper {
      transform: skew(0);
    }
  }
</style>
