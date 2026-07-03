<template>
  <BaseDialog :is-visible="isVisible" :title="t('sharedCombination.title')" max-width="500px" @close="closeModal">
    <div class="prompt-body">
      <p class="prompt-message">{{ t('sharedCombination.message') }}</p>

      <div v-if="sharedCombinationData" class="preview-section">
        <div class="student-preview-list" ref="previewListRef">
          <div
            v-for="studentId in sharedCombinationData.slice(0, maxAvatars)"
            :key="studentId"
            class="student-avatar-skew-wrapper"
          >
            <div class="student-avatar-skew-frame">
              <ImageWithLoader
                :src="getAvatarUrl(studentId, getStudentForm(studentId))"
                class="student-avatar-large"
                :lazy="false"
              />
            </div>
          </div>
          <div v-if="sharedCombinationData.length > maxAvatars" class="more-students-indicator">
            <span class="more-count">+{{ sharedCombinationData.length - maxAvatars }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="custom-actions">
        <button class="btn-skew btn-text btn-blue" @click="handleOverwrite">
          <span>{{ t('sharedCombination.overwrite') }}</span>
        </button>
        <button class="btn-skew btn-text btn-yellow" :disabled="isFull" @click="handleSaveAsNew">
          <span>{{ t('sharedCombination.saveAsNew') }}</span>
        </button>
        <button class="btn-skew btn-text btn-gray" @click="closeModal">
          <span>{{ t('sharedCombination.cancel') }}</span>
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup>
  import { computed, toRefs, ref, watch, nextTick, onBeforeUnmount } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { useModalStore } from '@/store/modal'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseDialog from '@components/ui/BaseDialog.vue'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'
  import { useUrlSearchParams } from '@vueuse/core'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const studentStore = useStudentStore()
  const { savedCombinations } = storeToRefs(studentStore)
  const { saveCombination, getStudentForm } = studentStore

  const modalStore = useModalStore()
  const { sharedCombinationData } = storeToRefs(modalStore)

  const isFull = computed(() => savedCombinations.value.length >= 10)

  const handleOverwrite = () => {
    if (sharedCombinationData.value) {
      studentStore.selectedStudentIds = [...sharedCombinationData.value]
    }
    clearUrlParam()
    closeModal()
  }

  const handleSaveAsNew = () => {
    if (isFull.value || !sharedCombinationData.value) return
    const defaultName = `${t('combinationManager.defaultName')} ${savedCombinations.value.length + 1}`
    saveCombination(defaultName, sharedCombinationData.value)
    clearUrlParam()
    closeModal()
    modalStore.openCombinationManagerModal()
  }

  const clearUrlParam = () => {
    const params = useUrlSearchParams('history')
    params.s = null
  }

  // --- Dynamic avatar count based on container width ---
  // BaseDialog renders its body only when isVisible is true (v-if),
  // so we must set up the observer after the element appears in the DOM.
  const AVATAR_SLOT_WIDTH = 58 // px per avatar (frame 48px + gap 6px + skew visual bleed)
  const MORE_INDICATOR_WIDTH = 58
  const MIN_AVATARS = 2

  const maxAvatars = ref(5)
  const previewListRef = ref(null)
  let resizeObserver = null

  const computeMaxAvatars = (containerWidth) => {
    const total = sharedCombinationData.value?.length ?? 0
    const availableForAvatars = containerWidth - MORE_INDICATOR_WIDTH
    const fitCount = Math.max(MIN_AVATARS, Math.floor(availableForAvatars / AVATAR_SLOT_WIDTH))
    const allFitCount = Math.floor(containerWidth / AVATAR_SLOT_WIDTH)
    maxAvatars.value = total <= allFitCount ? allFitCount : fitCount
  }

  const setupObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (previewListRef.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          computeMaxAvatars(entry.contentRect.width)
        }
      })
      resizeObserver.observe(previewListRef.value)
      computeMaxAvatars(previewListRef.value.offsetWidth)
    }
  }

  watch(isVisible, async (visible) => {
    if (visible) {
      await nextTick()
      setupObserver()
    } else {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    }
  })

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })
</script>

<style scoped>
  .prompt-body {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .prompt-message {
    font-size: 1.1rem;
    line-height: 1.5;
    margin: 0;
  }

  .preview-section {
    background: #e9eef3;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #d1d8e0;
  }

  .dark-mode .preview-section {
    background: #0d1f2d;
    border-color: #2a4a6e;
  }

  .student-preview-list {
    display: flex;
    gap: 6px;
    justify-content: center;
    flex-wrap: nowrap;
    /* Use padding + margin trick so skew bleed and hover translateY aren't clipped */
    overflow: visible;
    padding: 4px 6px 2px;
    margin: -4px -6px -2px;
  }

  /* Skewed avatar frame */
  .student-avatar-skew-wrapper {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .student-avatar-skew-wrapper:hover {
    transform: translateY(-3px);
  }

  .student-avatar-skew-frame {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    transform: skew(-8deg);
    border: 2px solid #466398;
    background: linear-gradient(135deg, #d5f2fc, #ffffff);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .dark-mode .student-avatar-skew-frame {
    border-color: #00a4e4;
    background: linear-gradient(135deg, #0d1f2d, #1a2b40);
  }

  .student-avatar-large {
    width: 100%;
    height: 100%;
    transform: skew(8deg) scale(1.15);
    transform-origin: center center;
    display: block;
  }

  /* "+N" indicator — also skewed */
  .more-students-indicator {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 6px;
    transform: skew(-8deg);
    background: #cdcfd2;
    display: flex;
    justify-content: center;
    align-items: center;
    transition:
      background 0.2s,
      border-color 0.2s;
  }

  .more-count {
    display: inline-block;
    transform: skew(8deg);
    font-weight: bold;
    font-size: 0.8rem;
    color: #314665;
  }

  .dark-mode .more-students-indicator {
    background: #2a3f5c;
    color: #e0e6ed;
  }

  .dark-mode .more-count {
    color: #e0f4ff;
  }

  .custom-actions {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .custom-actions .btn-skew {
    flex: 1;
    min-width: 120px;
    padding: 10px;
    justify-content: center;
  }
</style>
