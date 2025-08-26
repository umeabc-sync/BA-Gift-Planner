<template>
  <div class="gift-row">
    <div class="gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
      <ImageWithLoader
        :src="getGiftUrl(gift.id, gift.isSsr)"
        class="gift-icon"
        object-fit="contain"
        loader-type="pulse"
      />
      <div class="gift-name">{{ gift.name }}</div>
    </div>
    <div class="recommendation-island">
      <div class="rec-type" :class="gift.analysis.class">{{ t(gift.analysis.typeTextKey) }}</div>
      <div class="recommendation-title">{{ t(gift.analysis.titleKey, { maxValue: gift.analysis.titleValue }) }}</div>
      <div class="character-avatars">
        <div
          v-for="char in gift.analysis.characters"
          :key="char.id"
          class="character-avatar"
          :class="{ 'sub-optimal': !char.isOptimal }"
          @click="openFavoriteGiftsModal(char)"
        >
          <ImageWithLoader :src="getAvatarUrl(char.id)" class="character-avatar-img" />
          <div class="tooltip">
            <div class="tooltip-name">{{ t(`student.name.${char.id}`) }}</div>
            <div class="tooltip-xp">
              <ImageWithLoader
                :src="getInteractionUrl(getInteractionLevel(gift, char))"
                class="tooltip-icon"
                object-fit="contain"
                loader-type="pulse"
              />
              <span>{{ t('giftRecommendation.bondXp', { value: getPreferenceValue(char, gift) }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <FavoriteGiftsModal
    :is-visible="isFavoriteGiftsModalVisible"
    :character="selectedCharacter"
    @close="closeFavoriteGiftsModal"
  />
</template>

<script setup>
  import { ref } from 'vue'
  import { getAvatarUrl } from '@/utils/getAvatarUrl'
  import { getGiftUrl } from '@/utils/getGiftUrl'
  import { getPreferenceValue } from '@/utils/getPreferenceValue'
  import { getInteractionUrl } from '@/utils/getInteractionUrl'
  import { useI18n } from '@/composables/useI18n.js'
  import ImageWithLoader from '../ui/ImageWithLoader.vue'
  import FavoriteGiftsModal from '../modal/FavoriteGiftsModal.vue'

  const { t } = useI18n()

  defineProps({
    gift: Object,
  })

  const isFavoriteGiftsModalVisible = ref(false)
  const selectedCharacter = ref(null)

  const openFavoriteGiftsModal = (character) => {
    selectedCharacter.value = character
    isFavoriteGiftsModalVisible.value = true
  }

  const closeFavoriteGiftsModal = () => {
    isFavoriteGiftsModalVisible.value = false
  }

  function getInteractionLevel(gift, student) {
    const value = getPreferenceValue(student, gift)
    if (gift.isSsr) {
      if (value > 180) return 'xl'
      if (value > 120) return 'l'
      return 'm'
    } else {
      if (value > 60) return 'xl'
      if (value > 40) return 'l'
      return 'm'
    }
  }
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
    z-index: 1;
    transition: transform 0.3s ease;
    flex-shrink: 0;
    position: relative;
  }
  .gift-island:hover {
    transform: scale(1.05);
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
  .gift-name {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s ease,
      visibility 0.3s ease;
  }
  .gift-island:hover .gift-name {
    opacity: 1;
    visibility: visible;
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
    z-index: 0;
    transition:
      transform 0.3s ease,
      z-index 0.3s ease;
    position: relative;
  }
  .character-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .character-avatar :deep(.character-avatar-img img) {
    border-radius: 50%;
    border: 2px solid #6495ed;
  }

  .sub-optimal :deep(.character-avatar-img img) {
    opacity: 0.75;
    border: 2px dashed #ccc !important;
    filter: none;
  }

  .dark-mode .character-avatar :deep(.character-avatar-img img) {
    border: 2px solid #00aeef;
  }

  .character-avatar:hover {
    z-index: 10;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  .character-avatar:hover .tooltip {
    opacity: 1;
  }
  .tooltip-name {
    font-weight: bold;
    font-size: 14px;
  }
  .tooltip-xp {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .tooltip-icon {
    width: 24px;
    height: 24px;
  }
  .rec-type {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .rec-extra {
    background: #fce4ec;
    color: #c2185b;
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

  @media (max-width: 768px) {
    .gift-row {
      flex-direction: column;
      align-items: center;
    }

    .recommendation-island {
      width: 100%;
    }
  }
</style>
