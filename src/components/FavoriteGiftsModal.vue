<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="favorite-gifts-modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ t('student.name.' + character.id) }}{{ t('favoriteGiftsModal.titleSuffix') }}</h3>
            <button class="close-button" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="likedGifts.length > 0" class="gift-grid">
              <div
                v-for="gift in likedGifts"
                :key="gift.id"
                class="gift-grid-item"
                :class="gift.isSsr ? 'gift-purple' : 'gift-yellow'"
                @mouseenter="showTooltip($event, gift.name)"
                @mouseleave="hideTooltip"
              >
                <ImageWithLoader
                  :src="getGiftUrl(gift.id, gift.isSsr)"
                  class="gift-icon"
                  object-fit="contain"
                  loader-type="pulse"
                />
                <div class="bond-xp-capsule">
                  <div class="tooltip-wrapper">
                    <ImageWithLoader
                      :src="getInteractionUrl(getInteractionLevel(gift))"
                      class="interaction-icon"
                      object-fit="contain"
                    />
                    <span class="tooltip-text">{{ getPreferenceValue(character, gift) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <transition name="tooltip-fade">
            <div v-if="tooltip.visible" class="tooltip" :style="tooltip.style">{{ tooltip.text }}</div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs, watch } from 'vue'
  import { useModal } from '@/composables/useModal.js'
  import { useI18n } from '@/composables/useI18n.js'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useSrGiftData } from '@/utils/fetchSrGiftData.js'
  import { useSsrGiftData } from '@/utils/fetchSsrGiftData.js'
  import { getGiftUrl } from '@/utils/getGiftUrl'
  import { getPreferenceValue } from '@/utils/getPreferenceValue'
  import { getInteractionUrl } from '@/utils/getInteractionUrl'
  import ImageWithLoader from './ImageWithLoader.vue'

  const { t, locale } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    character: { type: Object, required: true },
  })

  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }

  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const settingStore = useSettingStore()
  const { locale: currentLocale } = storeToRefs(settingStore)

  const { data: srGifts } = useSrGiftData(currentLocale)
  const { data: ssrGifts } = useSsrGiftData(currentLocale)

  const tooltip = ref({
    visible: false,
    text: '',
    style: {},
  })

  const showTooltip = (event, text) => {
    const rect = event.currentTarget.getBoundingClientRect()
    tooltip.value = {
      visible: true,
      text: text,
      style: {
        position: 'fixed',
        top: `${rect.top - 10}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
      },
    }
  }

  const hideTooltip = () => {
    tooltip.value.visible = false
  }

  const likedGifts = computed(() => {
    if (!props.character || !srGifts.value || !ssrGifts.value) {
      return []
    }

    const favorSrIds = [...props.character.favor.sr.m, ...props.character.favor.sr.l, ...props.character.favor.sr.xl]
    const favorSsrIds = [...props.character.favor.ssr.l, ...props.character.favor.ssr.xl]

    const likedSr = srGifts.value.filter((gift) => favorSrIds.includes(gift.id)).map((g) => ({ ...g, isSsr: false }))
    const likedSsr = ssrGifts.value.filter((gift) => favorSsrIds.includes(gift.id)).map((g) => ({ ...g, isSsr: true }))

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
  .favorite-gifts-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #fff;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    width: 90%;
    max-width: 600px;
    border-top: 5px solid #fb9eb1;
    animation: slide-down 0.3s ease-out;
    display: flex;
    flex-direction: column;
  }

  @keyframes slide-down {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #aaa;
    line-height: 1;
    transition: color 0.2s;
  }
  .close-button:hover {
    color: #333;
  }

  .modal-body {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    flex-grow: 1;
    max-height: calc(80vh - 120px);
  }

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
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
  .tooltip {
    position: relative;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    pointer-events: none;
    z-index: 3000;
    transform: translateY(-8px);
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
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
  .dark-mode .modal-content {
    background: #1f3048;
    color: #e0e6ed;
    border-top-color: #fd7591;
  }
  .dark-mode .modal-header {
    border-bottom-color: #2a4a6e;
  }
  .dark-mode .modal-header h3 {
    color: #e0e6ed;
  }
  .dark-mode .close-button {
    color: #7f8c8d;
  }
  .dark-mode .close-button:hover {
    color: #e0e6ed;
  }

  /* Transition */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .tooltip-fade-enter-from,
  .tooltip-fade-leave-to {
    opacity: 0;
  }
</style>
