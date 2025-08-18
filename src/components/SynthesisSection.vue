<template>
  <div v-if="synthesisGifts.length > 0" class="synthesis-section">
    <div class="synthesis-title">建議拿去合成的禮物</div>
    <div class="synthesis-gifts">
      <div v-for="gift in synthesisGifts" :key="gift.id" class="synthesis-gift"
        :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
        <img :src="getGiftUrl(gift.id, gift.isSsr)" class="gift-icon" />
        <div class="gift-name">{{ gift.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getGiftUrl } from '../utils/getGiftUrl';

defineProps({
  synthesisGifts: Array
});
</script>

<style scoped>
.synthesis-section {
    margin-top: 40px;
    background: #fff;
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.dark-mode .synthesis-section {
    background: #2c3e50;
}

.synthesis-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
}

.dark-mode .synthesis-title {
    color: #e0e6ed;
}

.synthesis-gifts {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
}
.synthesis-gift {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
}
.synthesis-gift:hover {
    transform: scale(1.1);
}
.gift-yellow {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
}
.gift-purple {
    background: linear-gradient(45deg, #9c27b0, #e1bee7);
}
.gift-icon {
    width: 70%;
    height: 70%;
    object-fit: contain;
}
.synthesis-gift .gift-name {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 10px;
    white-space: nowrap;
}
</style>