<template>
  <div class="gift-row">
    <div class="gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
      <img :src="getGiftUrl(gift.id, gift.isSsr)" class="gift-icon" />
      <div class="gift-name">{{ gift.name }}</div>
    </div>
    <div class="recommendation-island">
      <div class="rec-type" :class="gift.analysis.class">{{ gift.analysis.typeText }}</div>
      <div class="recommendation-title">{{ gift.analysis.title }}</div>
      <div class="character-avatars">
        <div v-for="char in gift.analysis.characters" :key="char.id" class="character-avatar">
          <img :src="getAvatarUrl(char.id)" />
          <div class="tooltip">
            {{ char.name }}<br />
            {{ char.school }}<br />
            好感度: +{{ getPreferenceValue(char, gift) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getAvatarUrl } from '../utils/getAvatarUrl'
  import { getGiftUrl } from '../utils/getGiftUrl'
  import { getPreferenceValue } from '../utils/getPreferenceValue'

  const props = defineProps({
    gift: Object,
  })
</script>

<style scoped>
  .gift-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 20px;
  }
  .gift-island {
    width: 100px;
    height: 100px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s ease;
    flex-shrink: 0;
    position: relative;
  }
  .gift-island:hover {
    transform: scale(1.05);
  }
  .gift-yellow {
    background: linear-gradient(45deg, #A97D51, #C7A579);
  }
  .gift-purple {
    background: linear-gradient(45deg, #7A5BBE, #9E82D6);
  }
  .gift-icon {
    width: 90%;
    object-fit: contain;
  }
  .gift-name {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    white-space: nowrap;
  }
  .recommendation-island {
    flex: 1;
    background: #fff;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    min-height: 100px;
  }

  .dark-mode .recommendation-island {
    background: #2c3e50;
    color: #e0e6ed;
  }

  .recommendation-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }

  .dark-mode .recommendation-title {
    color: #e0e6ed;
  }

  .character-avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .character-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.3s ease;
    position: relative;
  }
  .character-avatar img {
    width: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #6495ed;
  }

  .dark-mode .character-avatar img {
    border: 2px solid #00aeef;
  }

  .character-avatar:hover {
    transform: scale(1.1);
  }
  .tooltip {
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 100;
  }
  .character-avatar:hover .tooltip {
    opacity: 1;
  }
  .rec-type {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .rec-best {
    background: #d4edda;
    color: #155724;
  }
  .rec-good {
    background: #fff3cd;
    color: #856404;
  }
  .rec-any {
    background: #d1ecf1;
    color: #0c5460;
  }
</style>
