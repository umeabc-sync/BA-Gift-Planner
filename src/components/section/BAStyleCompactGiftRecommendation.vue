<template>
  <div class="ba-style-compact-gift-row">
    <div class="ba-style-compact-gift-island" :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'">
      <ImageWithLoader
        :src="getGiftUrl(gift.id, gift.isSsr)"
        class="ba-style-compact-gift-icon"
        object-fit="contain"
        loader-type="pulse"
        :inherit-background="false"
      />
      <div class="gift-icon-bg"></div>
    </div>
    <div class="ba-style-compact-recommendation-island">
      <div class="rec-type" :class="gift.analysis.class">
        <ImageWithLoader
          :src="getInteractionUrl(getInteractionLevel(gift, gift.analysis.characters[0]))"
          class="tooltip-icon"
          object-fit="contain"
          loader-type="pulse"
        />
        <span>{{ getPreferenceValue(gift.analysis.characters[0], gift) }}</span>
      </div>
      <div class="ba-style-compact-character-avatars">
        <div
          v-for="char in gift.analysis.characters"
          :key="char.id"
          class="ba-style-compact-character-avatar"
          :class="{ 'sub-optimal': !char.isOptimal }"
        >
          <ImageWithLoader :src="getAvatarUrl(char.id)" class="ba-style-compact-character-avatar-img" />
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
    gift: Object,
  })
</script>

<style scoped>
  .ba-style-compact-gift-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ba-style-compact-gift-island {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    z-index: 1;
    flex-shrink: 0;
    position: relative;
  }

  .ba-style-compact-gift-island > *,
  .ba-style-compact-gift-island::before,
  .ba-style-compact-gift-island::after {
    grid-column: 1 / 1;
    grid-row: 1 / 1;
  }

  .ba-style-compact-gift-island::before {
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

  .dark-mode .ba-style-compact-gift-island::after {
    content: '';
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.15);
    z-index: 3;
  }

  .ba-style-compact-gift-icon {
    width: 100%;
    height: 100%;
    z-index: 4;
  }

  .ba-style-compact-recommendation-island {
    flex: 1;
    background: #efefef;
    border-radius: 12px;
    padding: 10px;
    border: 2px solid #dee2e6;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dark-mode .ba-style-compact-recommendation-island {
    background: #1f3048;
    color: #e0e6ed;
    border-color: #2a4a6e;
  }

  .ba-style-compact-character-avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .ba-style-compact-character-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    position: relative;
  }

  .ba-style-compact-character-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .ba-style-compact-character-avatar :deep(.ba-style-compact-character-avatar-img img) {
    border-radius: 50%;
    border: 3px solid #466398;
    background-color: #f7f7f4;
  }

  .sub-optimal :deep(.ba-style-compact-character-avatar-img img) {
    opacity: 0.75;
    border: 3px dashed #bdc3c7 !important;
    filter: none;
  }

  .dark-mode .ba-style-compact-character-avatar :deep(.ba-style-compact-character-avatar-img img) {
    border-color: #00a4e4;
    background-color: #1a2b40;
  }

  .rec-type {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    /* border: 2px solid; */
  }

  .tooltip-icon {
    width: 24px;
    height: 24px;
  }

  /* .rec-extra {
    border-color: #cb6d7e;
    background-color: #f297a8;
    color: white;
  }

  .rec-best {
    border-color: #496f94;
    background-color: #3a9deb;
    color: white;
  }

  .rec-good {
    border-color: #388581;
    background-color: #5cb3a6;
    color: white;
  } */

  /* 深藍灰色系（備案2） */
  /* .rec-good {
    border-color: #5a7ba8;
    background-color: #6b8bb5;
    color: white;
  } */

  /* EXP Palette */
  .rec-extra {
    background-color: #f9c5d0;
    color: #8b3a4a;
  }

  .rec-best {
    background-color: #a6d0f5;
    color: #1e5a8b;
  }

  .rec-good {
    background-color: #a8b8d1;
    color: #3e4d66;
  }
  /* EXP Palette */

  .dark-mode .rec-extra {
    background-color: #5c1f3a;
    border-color: #f297a8;
    color: #fce4ec;
  }

  .dark-mode .rec-best {
    background-color: #2a4a6e;
    border-color: #3a9deb;
    color: #e0f4ff;
  }

  .dark-mode .rec-good {
    background-color: #2a5c54;
    border-color: #5cb3a6;
    color: #d1f1ec;
  }
</style>
