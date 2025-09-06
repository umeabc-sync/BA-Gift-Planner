<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title">{{ t('shareModal.title') }}</div>
            <button class="close-button" @click="closeModal">×</button>
          </div>

          <!-- Body -->
          <div class="modal-body">
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
                <div class="style-options">
                  <div class="style-option" :class="{ active: screenshotStyle === 'gift-recommendation' }">
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
                      <div class="option-text">
                        <span class="option-title">{{ t('shareModal.giftRecommendation') }}</span>
                        <span class="option-desc">{{ t('shareModal.giftRecommendationDesc') }}</span>
                      </div>
                    </label>
                  </div>
                  <div class="style-option" :class="{ active: screenshotStyle === 'student-preference' }">
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
                      <div class="option-text">
                        <span class="option-title">{{ t('shareModal.studentPreference') }}</span>
                        <span class="option-desc">{{ t('shareModal.studentPreferenceDesc') }}</span>
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
                <div class="size-grid">
                  <div class="size-option" :class="{ active: screenshotSize == 1 }">
                    <input
                      id="size-1x"
                      type="radio"
                      name="screenshotSize"
                      value="1"
                      :checked="screenshotSize == 1"
                      @change="updateScreenshotSize"
                    />
                    <label for="size-1x" class="size-label">
                      <div class="size-preview size-1x"></div>
                      <span class="size-text">1x</span>
                      <span class="size-desc">{{ t('shareModal.screenshotSizeNormal') }}</span>
                    </label>
                  </div>
                  <div class="size-option" :class="{ active: screenshotSize == 2 }">
                    <input
                      id="size-2x"
                      type="radio"
                      name="screenshotSize"
                      value="2"
                      :checked="screenshotSize == 2"
                      @change="updateScreenshotSize"
                    />
                    <label for="size-2x" class="size-label">
                      <div class="size-preview size-2x"></div>
                      <span class="size-text">2x</span>
                      <span class="size-desc">{{ t('shareModal.screenshotSizeClear') }}</span>
                    </label>
                  </div>
                  <div class="size-option" :class="{ active: screenshotSize == 4 }">
                    <input
                      id="size-4x"
                      type="radio"
                      name="screenshotSize"
                      value="4"
                      :checked="screenshotSize == 4"
                      @change="updateScreenshotSize"
                    />
                    <label for="size-4x" class="size-label">
                      <div class="size-preview size-4x"></div>
                      <span class="size-text">4x</span>
                      <span class="size-desc">{{ t('shareModal.screenshotSizeSuperClear') }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="footer-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{{ t('shareModal.readyForDownload') }}</span>
            </div>
            <button class="download-button" @click="handleDownload">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{{ t('shareModal.download') }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { toRefs } from 'vue'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import { getAssetsFile } from '@/utils/getAssetsFile'

  const { t } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
    screenshotStyle: { type: String, default: 'gift-recommendation' },
    screenshotSize: { type: [Number, String], default: 1 },
  })
  const emit = defineEmits(['close', 'downloadScreenshot', 'update:screenshotStyle', 'update:screenshotSize'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const updateScreenshotStyle = (event) => {
    emit('update:screenshotStyle', event.target.value)
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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
  }

  .modal-content {
    background: #ffffff;
    border-radius: 15px;
    width: 90%;
    max-width: 520px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    animation: slide-down 0.3s ease-out;
    overflow: hidden;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    color: #e0e6ed;
  }

  /* Header Styles */
  .modal-header {
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 15px 15px 0 0;
    position: relative;
  }

  .modal-header .modal-title {
    padding: 10px 0px 5px 0px;
    text-align: center;
    color: #2d4663;
    flex-grow: 0;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 5px solid #fdef66;
    user-select: none;
  }

  .dark-mode .modal-header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  .dark-mode .modal-header .modal-title {
    color: #e0f4ff;
    border-bottom-color: #fdef66;
  }

  .dark-mode .close-button {
    color: #e0f4ff;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #2d4663;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .close-button:hover {
    opacity: 1;
  }

  /* Body Styles */
  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    background: #f8f9fa;
  }

  .dark-mode .modal-body {
    background: #1a2b40;
  }

  .setting-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
    user-select: none;
    transition: all 0.3s ease;
  }

  .setting-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
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
    background: linear-gradient(135deg, #87ceeb, #6495ed);
    color: white;
  }

  .size-icon {
    /* background: linear-gradient(135deg, #98fb98, #32cd32); */
    background: linear-gradient(135deg, #6994e4, #466398);
    color: white;
  }

  .dark-mode .style-icon {
    background: linear-gradient(135deg, #2a7fff, #00aeef);
  }

  .dark-mode .size-icon {
    /* background: linear-gradient(135deg, #4ade80, #22c55e); */
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

  /* Style Options */
  .style-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .style-option {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .style-option input[type='radio'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f7fafc;
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dark-mode .option-label {
    background: #1a365d;
  }

  .style-option.active .option-label {
    background: rgba(100, 149, 237, 0.1);
    border-color: #6495ed;
  }

  .dark-mode .style-option.active .option-label {
    background: rgba(42, 127, 255, 0.2);
    border-color: #2a7fff;
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

  .option-text {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .option-title {
    font-weight: 600;
    color: #2d3748;
    line-height: 1.3;
  }

  .dark-mode .option-title {
    color: #e0e6ed;
  }

  .option-desc {
    font-size: 0.85rem;
    color: #718096;
    margin-top: 2px;
  }

  .dark-mode .option-desc {
    color: #a0aec0;
  }

  /* Size Options */
  .size-grid {
    display: flex;
  }

  .size-option {
    position: relative;
    flex: 1 1 0%;
    transition: all 0.2s ease-in-out;
  }

  .size-option:not(:first-child) {
    margin-left: -15px;
  }

  .size-option input[type='radio'] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .size-label {
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

  .size-option:first-child .size-label {
    clip-path: polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
    border-radius: 12px 0 0 12px;
  }

  .size-option:last-child .size-label {
    clip-path: polygon(15px 0, 100% 0, 100% 100%, 0 100%);
    border-radius: 0 12px 12px 0;
  }

  .dark-mode .size-label {
    background: #1a365d;
  }

  .size-option.active .size-label {
    background: #263473;
  }

  .size-option.active .size-text {
    color: white;
  }

  .size-option.active .size-desc {
    color: rgba(255, 255, 255, 0.8);
  }

  .dark-mode .size-option.active .size-label {
    background: #c9e1edcc;
  }

  .dark-mode .size-option.active .size-text {
    color: #314665;
  }

  .dark-mode .size-option.active .size-desc {
    color: #314665bf;
  }

  .size-label:active {
    transform: scale(0.95);
  }

  .size-preview {
    border-radius: 4px;
    /* background: linear-gradient(135deg, #98fb98, #32cd32); */
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
    /* background: linear-gradient(135deg, #4ade80, #22c55e); */
    background: linear-gradient(135deg, #6994e4, #466398);
  }

  .size-text {
    font-weight: 600;
    font-size: 1.1rem;
    color: #314665;
  }

  .dark-mode .size-text {
    color: #e0e6ed;
  }

  .size-desc {
    font-size: 0.8rem;
    color: #718096;
  }

  .dark-mode .size-desc {
    color: rgba(223, 229, 236, 0.8);
  }

  /* Footer Styles */
  .modal-footer {
    padding: 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .dark-mode .modal-footer {
    border-top-color: #2a4a6e;
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

  .download-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    color: #314665;
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    position: relative;
    transform: skew(-8deg);
    text-transform: uppercase;
  }

  .download-button span {
    transform: skew(8deg);
    display: inline-block;
  }

  .download-button svg {
    transform: skew(8deg);
  }

  .download-button::before {
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

  .dark-mode .download-button {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .download-button:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .download-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  /* Transitions */
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    /* Abandoned */
    /* .modal-content {
      width: 95%;
      max-height: 90vh;
      border-radius: 16px;
    }

    .modal-header {
      padding: 20px;
    }

    .header-content {
      gap: 12px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
    }

    .modal-title {
      font-size: 1.3rem;
    }

    .modal-body {
      padding: 20px;
    } */

    .setting-card {
      padding: 20px;
    }

    .size-grid {
      flex-direction: column;
      gap: 10px;
    }

    .size-option:not(:first-child) {
      margin-left: 0;
    }

    .size-label {
      padding: 16px;
      flex-direction: row;
      justify-content: flex-start;
      text-align: left;
      /* border: 2px solid transparent; */
    }

    .size-option.active .size-label {
      border-color: #32cd32;
    }

    .dark-mode .size-option.active .size-label {
      border-color: #4ade80;
    }

    .size-label,
    .size-option:first-child .size-label,
    .size-option:last-child .size-label {
      clip-path: none;
      border-radius: 12px;
    }

    .modal-footer {
      padding: 20px;
      flex-direction: column;
      gap: 16px;
    }

    .download-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
