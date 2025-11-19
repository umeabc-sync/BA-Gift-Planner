<template>
  <PinkBaseModal :is-visible="isVisible" :max-width="'600px'" @close="closeModal">
    <template #header>
      <h3 v-if="character">{{ t('student.name.' + character.id) }}{{ t('favoriteGiftsModal.titleSuffix') }}</h3>
    </template>
    <template #body>
      <div v-if="likedGifts.length > 0" class="gift-grid">
        <div
          v-for="gift in likedGifts"
          :key="gift.id"
          v-tooltip:fav-gift-tooltip="gift.name"
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
          <div class="bond-xp-capsule">
            <div class="tooltip-wrapper">
              <ImageWithLoader
                :src="getInteractionUrl(getInteractionLevel(gift))"
                class="interaction-icon"
                object-fit="contain"
                loader-type="pulse"
              />
              <span class="tooltip-text">{{ getPreferenceValue(character, gift) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PinkBaseModal>
</template>

<script setup>
  import { computed, toRefs } from 'vue'
  import { useModal } from '@composables/useModal.js'
  import { useI18n } from '@composables/useI18n.js'
  import { useSrGiftData } from '@utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@utils/fetchSsrGiftData.js'
  import { getGiftUrl } from '@utils/getGiftUrl'
  import { getPreferenceValue } from '@utils/getPreferenceValue'
  import { getInteractionUrl } from '@utils/getInteractionUrl'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import PinkBaseModal from '@components/ui/PinkBaseModal.vue'

  const { t, currentLocale: locale } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    character: { type: Object, default: null },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const { data: srGifts } = useSrGiftData(locale)
  const { data: ssrGifts } = useSsrGiftData(locale)

  const likedGifts = computed(() => {
    if (!props.character || !srGifts.value || !ssrGifts.value) {
      return []
    }

    const favorSrIds = new Set([
      ...props.character.favor.sr.m,
      ...props.character.favor.sr.l,
      ...props.character.favor.sr.xl,
    ])
    const favorSsrIds = new Set([...props.character.favor.ssr.l, ...props.character.favor.ssr.xl])

    const sortFn = (a, b) => {
      // Bond XP: higher first
      const prefA = getPreferenceValue(props.character, a)
      const prefB = getPreferenceValue(props.character, b)
      if (prefA !== prefB) {
        return prefB - prefA
      }
      // ID: smaller first
      return a.id - b.id
    }

    const likedSr = srGifts.value
      .filter((gift) => favorSrIds.has(gift.id))
      .map((g) => ({ ...g, isSsr: false }))
      .sort(sortFn)
    const likedSsr = ssrGifts.value
      .filter((gift) => favorSsrIds.has(gift.id))
      .map((g) => ({ ...g, isSsr: true }))
      .sort(sortFn)

    return [...likedSsr, ...likedSr]
  })

  function getInteractionLevel(gift) {
    const value = getPreferenceValue(props.character, gift)
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
  .gift-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 35px 20px;
    justify-content: center;
    padding-bottom: 20px;
  }
  .gift-grid-item {
    width: 90px;
    height: 90px;
    border-radius: 50%;
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

  .dark-mode .gift-grid-item::after {
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

  .bond-xp-capsule {
    position: absolute;
    bottom: -8px;
    right: -8px;
    background: #212529;
    color: white;
    border-radius: 20px;
    font-size: 14px;
    align-items: center;
    z-index: 5;
  }

  .tooltip-wrapper {
    display: inline-flex;
    align-items: center;
    padding: 3px 4px;
    gap: 4px;
  }

  .interaction-icon {
    width: 24px;
    height: 24px;
    background-color: rgba(0, 0, 0, 0);
  }

  .tooltip-text {
    font-style: italic;
    padding-right: 4px;
  }

  /* Dark Mode */

  .dark-mode .bond-xp-capsule {
    background: #dee2e6;
    color: #201e2e;
  }

  /* Transition */
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .tooltip-fade-enter-from,
  .tooltip-fade-leave-to {
    opacity: 0;
  }
</style>
