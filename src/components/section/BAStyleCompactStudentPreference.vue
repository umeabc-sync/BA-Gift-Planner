<template>
  <div class="ba-style-compact-student-row">
    <div class="ba-style-compact-student-island">
      <ImageWithLoader :src="getAvatarUrl(student.id)" class="ba-style-compact-student-avatar-img" />
    </div>
    <div class="ba-style-compact-recommendation-island">
      <div class="ba-style-compact-gift-grid">
        <div
          v-for="gift in student.gifts"
          :key="gift.id"
          class="ba-style-compact-gift-grid-item"
          :class="[gift.isSsr ? 'gift-purple' : 'gift-yellow', { 'non-recommended': !gift.isRecommended }]">

          <ImageWithLoader
            :src="getGiftUrl(gift.id, gift.isSsr)"
            class="ba-style-compact-gift-icon"
            object-fit="contain"
            loader-type="pulse"
            :inherit-background="false"
          />
          <div class="gift-icon-bg"></div>

          <div class="bond-xp-capsule">
            <div class="tooltip-wrapper">
              <ImageWithLoader
                :src="getInteractionUrl(getInteractionLevel(gift, student))"
                class="interaction-icon"
                object-fit="contain"
                loader-type="pulse"
              />
              <span class="tooltip-text">{{ getPreferenceValue(student, gift) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import { getInteractionUrl } from '@utils/getInteractionUrl'
  import { getPreferenceValue } from '@utils/getPreferenceValue'
  import { getInteractionLevel } from '@utils/getInteractionLevel'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'

  defineProps({
    student: Object,
  })
</script>

<style scoped>
  .ba-style-compact-student-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }
  .ba-style-compact-student-island {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ba-style-compact-student-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .ba-style-compact-student-island :deep(.ba-style-compact-student-avatar-img img) {
    border-radius: 50%;
    border: 3px solid #466398;
    background-color: #fff;
  }
  .dark-mode .ba-style-compact-student-island :deep(.ba-style-compact-student-avatar-img img) {
    border-color: #00a4e4;
    background-color: #1a2b40;
  }
  .ba-style-compact-recommendation-island {
    flex: 1;
    background: #efefef;
    border-radius: 12px;
    padding: 15px;
    border: 2px solid #dee2e6;
  }
  .dark-mode .ba-style-compact-recommendation-island {
    background: #1f3048;
    border-color: #2a4a6e;
  }
  .ba-style-compact-gift-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
  }
  .ba-style-compact-gift-grid-item {
    width: 50px;
    height: 50px;
    border-radius: 50%;
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

  .non-recommended {
    opacity: 0.4;
    filter: grayscale(50%);
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

  .bond-xp-capsule {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #212529;
    color: white;
    border-radius: 20px;
    font-size: 12px;
    display: flex;
    align-items: center;
    z-index: 5;
  }
  .dark-mode .bond-xp-capsule {
    background: #dee2e6;
    color: #201e2e;
  }
  .tooltip-wrapper {
    display: inline-flex;
    align-items: center;
    padding: 2px 3px;
    gap: 3px;
  }
  .interaction-icon {
    width: 18px;
    height: 18px;
  }
  .tooltip-text {
    font-style: italic;
    padding-right: 3px;
  }
</style>
