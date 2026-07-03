<template>
  <div class="student-preview-list-wrapper">
    <div class="student-preview-list" ref="previewListRef" :style="listStyle">
      <div
        v-for="studentId in studentIds.slice(0, maxAvatars)"
        :key="studentId"
        class="student-avatar-skew-wrapper"
        @click="openPreview"
      >
        <div class="student-avatar-skew-frame" :style="frameStyle">
          <ImageWithLoader
            :src="getAvatarUrl(studentId, getStudentForm(studentId))"
            class="student-avatar-large"
            :lazy="false"
          />
        </div>
      </div>
      <div
        v-if="studentIds.length > maxAvatars"
        class="more-students-indicator"
        :style="frameStyle"
        @click="openPreview"
      >
        <span class="more-count">+{{ studentIds.length - maxAvatars }}</span>
      </div>
    </div>

    <!-- Preview Dialog for all students -->
    <BaseDialog
      :is-visible="isPreviewOpen"
      :title="title || t('sharedCombination.previewTitle')"
      :show-cancel="false"
      max-width="520px"
      @ok="closePreview"
      @close="closePreview"
    >
      <div class="preview-modal-body">
        <div v-for="studentId in studentIds" :key="studentId" class="preview-avatar-skew-wrapper">
          <div class="preview-avatar-skew-frame">
            <ImageWithLoader
              :src="getAvatarUrl(studentId, getStudentForm(studentId))"
              class="student-avatar-large"
              :lazy="false"
            />
          </div>
        </div>
      </div>
    </BaseDialog>
  </div>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import { useStudentStore } from '@/store/student'
  import { useI18n } from '@/composables/useI18n.js'
  import BaseDialog from '@components/ui/BaseDialog.vue'
  import ImageWithLoader from '@components/ui/ImageWithLoader.vue'
  import { getAvatarUrl } from '@utils/getAvatarUrl'

  const { t } = useI18n()
  const studentStore = useStudentStore()
  const { getStudentForm } = studentStore

  const props = defineProps({
    studentIds: {
      type: Array,
      required: true,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    avatarSize: {
      type: Number,
      default: 44, // 44 or 48
    },
    // We might need to watch visibility of parent modal to trigger setupObserver
    parentVisible: {
      type: Boolean,
      default: true,
    },
  })

  const isPreviewOpen = ref(false)

  const openPreview = () => {
    if (props.studentIds.length > 0) {
      isPreviewOpen.value = true
    }
  }

  const closePreview = () => {
    isPreviewOpen.value = false
  }

  // Style helper for frames based on avatarSize prop
  const frameStyle = computed(() => ({
    width: `${props.avatarSize}px`,
    height: `${props.avatarSize}px`,
  }))

  const listStyle = computed(() => ({
    gap: props.avatarSize === 48 ? '6px' : '4px',
    justifyContent: props.avatarSize === 48 ? 'center' : 'flex-start',
  }))

  // Slot calculations
  const AVATAR_SLOT_WIDTH = computed(() => (props.avatarSize === 48 ? 58 : 52))
  const MORE_INDICATOR_WIDTH = computed(() => (props.avatarSize === 48 ? 58 : 52))
  const MIN_AVATARS = 2

  const maxAvatars = ref(5)
  const previewListRef = ref(null)
  let resizeObserver = null

  const computeMaxAvatars = (containerWidth) => {
    const total = props.studentIds.length
    const availableForAvatars = containerWidth - MORE_INDICATOR_WIDTH.value
    const fitCount = Math.max(MIN_AVATARS, Math.floor(availableForAvatars / AVATAR_SLOT_WIDTH.value))
    const allFitCount = Math.floor(containerWidth / AVATAR_SLOT_WIDTH.value)
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

  // Watch for visibility changes to trigger observer
  watch(
    () => props.parentVisible,
    async (visible) => {
      if (visible) {
        await nextTick()
        setupObserver()
      } else {
        if (resizeObserver) {
          resizeObserver.disconnect()
          resizeObserver = null
        }
      }
    },
    { immediate: true }
  )

  // Watch for dynamic studentIds changes
  watch(
    () => props.studentIds,
    () => {
      if (previewListRef.value) {
        computeMaxAvatars(previewListRef.value.offsetWidth)
      }
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })
</script>

<style scoped>
  .student-preview-list-wrapper {
    flex-grow: 1;
    min-width: 0;
  }

  .student-preview-list {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;
    overflow: visible;
    padding: 4px 5px 2px;
    margin: -4px -5px -2px;
  }

  /* Skewed avatar frame — matches the btn-skew style of the game */
  .student-avatar-skew-wrapper {
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .student-avatar-skew-wrapper:hover {
    transform: translateY(-3px);
  }

  .student-avatar-skew-frame {
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

  /* "+N more" indicator — also skewed to match */
  .more-students-indicator {
    flex-shrink: 0;
    border-radius: 6px;
    transform: skew(-8deg);
    background: #cdcfd2;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.2s;
  }

  .more-students-indicator:hover {
    transform: skew(-8deg) translateY(-3px);
    background-color: #dee2e6;
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

  .dark-mode .more-students-indicator:hover {
    background-color: #3b638f;
  }

  .dark-mode .more-count {
    color: #e0f4ff;
  }

  /* ====================================================
     Preview Dialog Body
     ==================================================== */
  .preview-modal-body {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    padding: 6px;
    max-height: 55vh;
    overflow-y: auto;
  }

  .preview-avatar-skew-wrapper {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .preview-avatar-skew-wrapper:hover {
    transform: translateY(-3px);
  }

  .preview-avatar-skew-frame {
    width: 64px;
    height: 64px;
    border-radius: 6px;
    overflow: hidden;
    transform: skew(-8deg);
    border: 2px solid #466398;
    background: linear-gradient(135deg, #d5f2fc, #ffffff);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .dark-mode .preview-avatar-skew-frame {
    border-color: #00a4e4;
    background: linear-gradient(135deg, #0d1f2d, #1a2b40);
  }

  .preview-avatar-skew-frame .student-avatar-large {
    transform: skew(8deg) scale(1.15);
    transform-origin: center center;
  }

  @media (max-width: 600px) {
    .student-preview-list-wrapper {
      width: 100%;
    }
  }
</style>
