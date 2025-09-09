<template>
  <div class="gift-row">
    <div class="gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
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
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import { getInteractionUrl } from '@utils/getInteractionUrl'
  import { getPreferenceValue } from '@utils/getPreferenceValue'
  import { getInteractionLevel } from '@utils/getInteractionLevel'
  import { useI18n } from '@composables/useI18n.js'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import FavoriteGiftsModal from '@components/modal/FavoriteGiftsModal.vue'

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
</script>

<style scoped>
  .gift-row {
    display: flex;
    align-items: stretch; /* Align items to stretch to equal height */
    margin-bottom: 20px;
    gap: 20px;
  }

  .gift-island {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 1;
    transition: transform 0.3s ease;
    flex-shrink: 0;
    position: relative;
    align-self: center;
  }

  .gift-island > *,
  .gift-island::before,
  .gift-island::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
  }

  .gift-island:hover {
    transform: scale(1.05);
    z-index: 10;
  }

  .gift-island::before {
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

  .dark-mode .gift-island::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.15);
    z-index: 3;
  }

  .gift-icon {
    width: 90%;
    height: 90%;
    z-index: 4;
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

  .dark-mode .gift-name {
    background: rgba(223, 227, 231, 0.95);
    color: #201e2e;
  }

  .recommendation-island {
    flex: 1;
    background: #efefef;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #dee2e6;
  }

  .dark-mode .recommendation-island {
    background: #1f3048;
    color: #e0e6ed;
    border-color: #2a4a6e;
  }

  .recommendation-title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 15px;
    color: #314665;
  }

  .dark-mode .recommendation-title {
    color: #e0f4ff;
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
    border: 3px solid #466398;
    background-color: #fff;
  }

  .sub-optimal :deep(.character-avatar-img img) {
    opacity: 0.75;
    border: 3px dashed #bdc3c7 !important;
    filter: none;
  }

  .dark-mode .character-avatar :deep(.character-avatar-img img) {
    border-color: #00a4e4;
    background-color: #1a2b40;
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

  .dark-mode .tooltip {
    background: rgba(223, 227, 231, 0.95);
    color: #201e2e;
  }

  .rec-type {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
    border: 2px solid;
  }

  .rec-extra {
    border-color: #c2185b;
    background-color: #fce4ec;
    color: #c2185b;
  }

  .rec-best {
    border-color: #155724;
    background-color: #d4edda;
    color: #155724;
  }

  .rec-good {
    border-color: #856404;
    background-color: #fff3cd;
    color: #856404;
  }

  .rec-any {
    border-color: #0c5460;
    background-color: #d1ecf1;
    color: #0c5460;
  }

  .dark-mode .rec-extra {
    background-color: #5c1f3a;
    border-color: #c2185b;
    color: #fce4ec;
  }

  .dark-mode .rec-best {
    background-color: #1c4a2e;
    border-color: #155724;
    color: #d4edda;
  }

  .dark-mode .rec-good {
    background-color: #5e4a18;
    border-color: #856404;
    color: #fff3cd;
  }

  .dark-mode .rec-any {
    background-color: #1c4a57;
    border-color: #0c5460;
    color: #d1ecf1;
  }

  @media (max-width: 768px) {
    .gift-row {
      flex-direction: column;
      align-items: center;
    }

    .recommendation-island {
      width: 100%;
      transform: skew(0);
    }

    .recommendation-island > * {
      transform: skew(0);
    }
  }
</style>
