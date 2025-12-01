<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="520px">
    <template #header>
      <div class="modal-title">{{ t('shareModal.title') }}</div>
    </template>
    <template #body>
      <div class="share-modal-body">
        <!-- Screenshot Style Card -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon style-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h4 class="card-title">{{ t('shareModal.screenshotStyle') }}</h4>
              <p class="card-description">{{ t('shareModal.screenshotStyleDesc') }}</p>
            </div>
          </div>
          <div class="card-content">
            <div class="option-grid">
              <div class="option-item" :class="{ active: screenshotStyle === 'gift-recommendation' }">
                <input
                  id="gift-style"
                  type="radio"
                  name="screenshotStyle"
                  value="gift-recommendation"
                  :checked="screenshotStyle === 'gift-recommendation'"
                  @change="updateScreenshotStyle"
                />
                <label for="gift-style" class="option-label">
                  <div class="option-icon">
                    <img :src="getAssetsFile('icon/gift.webp')" draggable="false" />
                  </div>
                  <div class="option-text-content">
                    <span class="option-title">{{ t('shareModal.giftRecommendation') }}</span>
                    <span class="option-desc">{{ t('shareModal.giftRecommendationDesc') }}</span>
                  </div>
                </label>
              </div>
              <div class="option-item" :class="{ active: screenshotStyle === 'student-preference' }">
                <input
                  id="student-style"
                  type="radio"
                  name="screenshotStyle"
                  value="student-preference"
                  :checked="screenshotStyle === 'student-preference'"
                  @change="updateScreenshotStyle"
                />
                <label for="student-style" class="option-label">
                  <div class="option-icon">
                    <img :src="getAssetsFile('icon/student_favor.webp')" draggable="false" />
                  </div>
                  <div class="option-text-content">
                    <span class="option-title">{{ t('shareModal.studentPreference') }}</span>
                    <span class="option-desc">{{ t('shareModal.studentPreferenceDesc') }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Screenshot Layout Card -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon style-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div>
              <h4 class="card-title">{{ t('shareModal.screenshotLayout') }}</h4>
              <p class="card-description">{{ t('shareModal.screenshotLayoutDesc') }}</p>
            </div>
          </div>
          <div class="card-content">
            <div class="option-grid">
              <div class="option-item" :class="{ active: screenshotLayout === 'classic' }">
                <input
                  id="layout-classic"
                  type="radio"
                  name="screenshotLayout"
                  value="classic"
                  :checked="screenshotLayout === 'classic'"
                  @change="updateScreenshotLayout"
                />
                <label for="layout-classic" class="option-label">
                  <div class="option-text-content">
                    <span class="option-title">{{ t('shareModal.layoutClassic') }}</span>
                    <span class="option-desc">{{ t('shareModal.layoutClassicDesc') }}</span>
                  </div>
                </label>
              </div>
              <div class="option-item" :class="{ active: screenshotLayout === 'ba-style' }">
                <input
                  id="layout-ba-style"
                  type="radio"
                  name="screenshotLayout"
                  value="ba-style"
                  :checked="screenshotLayout === 'ba-style'"
                  @change="updateScreenshotLayout"
                />
                <label for="layout-ba-style" class="option-label">
                  <div class="option-text-content">
                    <span class="option-title">{{ t('shareModal.layoutBAStyle') }}</span>
                    <span class="option-desc">{{ t('shareModal.layoutBAStyleDesc') }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Screenshot Size Card -->
        <div class="setting-card">
          <div class="card-header">
            <div class="card-icon size-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </div>
            <div>
              <h4 class="card-title">{{ t('shareModal.screenshotSize') }}</h4>
              <p class="card-description">{{ t('shareModal.screenshotSizeDesc') }}</p>
            </div>
          </div>
          <div class="card-content">
            <div class="option-grid">
              <div class="option-item" :class="{ active: screenshotSize == 1 }">
                <input
                  id="size-1x"
                  type="radio"
                  name="screenshotSize"
                  value="1"
                  :checked="screenshotSize == 1"
                  @change="updateScreenshotSize"
                />
                <label for="size-1x" class="option-label">
                  <div class="size-preview size-1x"></div>
                  <span class="option-title">1x</span>
                  <span class="option-desc">{{ t('shareModal.screenshotSizeNormal') }}</span>
                </label>
              </div>
              <div class="option-item" :class="{ active: screenshotSize == 2 }">
                <input
                  id="size-2x"
                  type="radio"
                  name="screenshotSize"
                  value="2"
                  :checked="screenshotSize == 2"
                  @change="updateScreenshotSize"
                />
                <label for="size-2x" class="option-label">
                  <div class="size-preview size-2x"></div>
                  <span class="option-title">2x</span>
                  <span class="option-desc">{{ t('shareModal.screenshotSizeClear') }}</span>
                </label>
              </div>
              <div class="option-item" :class="{ active: screenshotSize == 4 }">
                <input
                  id="size-4x"
                  type="radio"
                  name="screenshotSize"
                  value="4"
                  :checked="screenshotSize == 4"
                  @change="updateScreenshotSize"
                />
                <label for="size-4x" class="option-label">
                  <div class="size-preview size-4x"></div>
                  <span class="option-title">4x</span>
                  <span class="option-desc">{{ t('shareModal.screenshotSizeSuperClear') }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="share-modal-footer">
        <div class="footer-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>{{ t('shareModal.readyForDownload') }}</span>
        </div>
        <button class="btn-skew btn-text btn-blue" @click="handleDownload">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>{{ t('shareModal.download') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { toRefs } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import { getAssetsFile } from '@/utils/getAssetsFile'
  import BaseModal from '@components/ui/BaseModal.vue'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    screenshotStyle: { type: String, default: 'gift-recommendation' },
    screenshotLayout: { type: String, default: 'classic' },
    screenshotSize: { type: [Number, String], default: 1 },
  })
  const emit = defineEmits([
    'close',
    'downloadScreenshot',
    'update:screenshotStyle',
    'update:screenshotLayout',
    'update:screenshotSize',
  ])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const updateScreenshotStyle = (event) => {
    emit('update:screenshotStyle', event.target.value)
  }

  const updateScreenshotLayout = (event) => {
    emit('update:screenshotLayout', event.target.value)
  }

  const updateScreenshotSize = (event) => {
    emit('update:screenshotSize', event.target.value)
  }

  const handleDownload = () => {
    emit('downloadScreenshot')
    closeModal()
  }
</script>

<style scoped>
  .share-modal-body {
    padding: 24px;
    background: #f8f9fa;
  }

  .dark-mode .share-modal-body {
    background: #1a2b40;
  }

  .setting-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    border: 2px solid #dee2e6;
    user-select: none;
    transition: all 0.3s ease;
  }

  .setting-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.05);
  }

  .setting-card:last-child {
    margin-bottom: 0;
  }

  .dark-mode .setting-card {
    background: #2a4a6e;
    border-color: #3a5a7e;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .style-icon {
    background: linear-gradient(135deg, #6994e4, #466398);
    color: white;
  }

  .size-icon {
    background: linear-gradient(135deg, #6994e4, #466398);
    color: white;
  }

  .dark-mode .style-icon {
    background: linear-gradient(135deg, #6994e4, #466398);
  }

  .dark-mode .size-icon {
    background: linear-gradient(135deg, #6994e4, #466398);
  }

  .card-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
    color: #2d3748;
  }

  .dark-mode .card-title {
    color: #e0e6ed;
  }

  .card-description {
    font-size: 0.9rem;
    color: #718096;
    margin: 4px 0 0 0;
    line-height: 1.4;
  }

  .dark-mode .card-description {
    color: #a0aec0;
  }

  .option-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .option-icon img {
    height: 90%;
  }

  .dark-mode .option-icon {
    background: #2a4a6e;
  }

  .option-text-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-grid {
    display: flex;
  }

  .option-item {
    position: relative;
    flex: 1 1 0%;
    transition: all 0.2s ease-in-out;
  }

  .option-item:not(:first-child) {
    margin-left: -15px;
  }

  .option-item input[type='radio'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px 16px;
    background: #f7fafc;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
    height: 100%;
  }

  .option-item:first-child .option-label {
    clip-path: polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
    border-radius: 12px 0 0 12px;
  }

  .option-item:last-child .option-label {
    clip-path: polygon(15px 0, 100% 0, 100% 100%, 0 100%);
    border-radius: 0 12px 12px 0;
  }

  .dark-mode .option-label {
    background: #1a365d;
  }

  .option-item.active .option-label {
    background: #263473;
  }

  .option-item.active .option-title {
    color: white;
  }

  .option-item.active .option-desc {
    color: rgba(255, 255, 255, 0.8);
  }

  .dark-mode .option-item.active .option-label {
    background: #c9e1edcc;
  }

  .dark-mode .option-item.active .option-title {
    color: #314665;
  }

  .dark-mode .option-item.active .option-desc {
    color: #314665bf;
  }

  .option-label:active {
    transform: scale(0.95);
  }

  .size-preview {
    border-radius: 4px;
    background: linear-gradient(135deg, #6994e4, #466398);
    margin-bottom: 4px;
  }

  .size-1x {
    width: 24px;
    height: 18px;
  }

  .size-2x {
    width: 28px;
    height: 21px;
  }

  .size-4x {
    width: 32px;
    height: 24px;
  }

  .dark-mode .size-preview {
    background: linear-gradient(135deg, #6994e4, #466398);
  }

  .option-title {
    font-weight: 600;
    font-size: 1.1rem;
    color: #314665;
  }

  .dark-mode .option-title {
    color: #e0e6ed;
  }

  .option-desc {
    font-size: 0.8rem;
    color: #718096;
  }

  .dark-mode .option-desc {
    color: rgba(223, 229, 236, 0.8);
  }

  .share-modal-footer {
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    width: 100%;
    box-sizing: border-box;
  }

  .dark-mode .share-modal-footer {
    background: #1a2b40;
  }

  .footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #718096;
    font-size: 0.9rem;
    user-select: none;
  }

  .dark-mode .footer-info {
    color: #a0aec0;
  }

  .btn-blue {
    gap: 8px;
    height: auto;
    padding: 14px 24px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .btn-blue::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
    border-radius: 12px;
    pointer-events: none;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .setting-card {
      padding: 20px;
    }

    .option-text-content {
      gap: 4px;
    }

    .share-modal-footer {
      padding: 20px;
      flex-direction: column;
      gap: 16px;
    }

    .btn-skew {
      width: 100%;
      justify-content: center;
    }
  }
</style>
