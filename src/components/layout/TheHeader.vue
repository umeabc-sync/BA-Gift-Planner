<template>
  <header class="header">
    <div class="header-title">
      <img :src="logoUrl" :alt="t('header.title')" />
    </div>
    <div class="controls">
      <button class="icon-btn" @click="$emit('openModal')">
         <component 
            :is="AddStudentsIcon"
            :alt="t('header.selectStudentsAlt')"
            draggable="false"
          />
      </button>
      <div class="share-dropdown-container">
        <button class="icon-btn" @click="toggleShareDropdown">
          <component 
            :is="ShareIcon"
            :alt="t('header.shareAlt')"
            draggable="false"
          />
        </button>
        <div v-if="showShareDropdown" class="share-dropdown-menu">
          <button @click="handleCopyLink" class="dropdown-item">
            <span class="dropdown-icon">
              <img :src="getAssetsFile('icon/link.svg')" :alt="t('header.copyLink')" draggable="false" />
            </span>
            <span>{{ t('header.copyLink') }}</span>
          </button>
          <button @click="handleDownloadScreenshot" class="dropdown-item">
            <span class="dropdown-icon">
              <img :src="getAssetsFile('icon/download.svg')" :alt="t('header.downloadScreenshot')" draggable="false" />
            </span>
            <span>{{ t('header.downloadScreenshot') }}</span>
          </button>
        </div>
      </div>
      <button class="icon-btn settings-btn" @click="handleSettingsClick">
        <component 
          :is="GearIcon"
          :alt="t('header.settingsAlt')"
          :class="{ 'is-rotating': isSettingsIconRotating }"
          @animationend="isSettingsIconRotating = false"
          draggable="false"
        />        
      </button>
      <button class="icon-btn theme-toggle-btn" @click="toggleTheme">
        <Transition name="icon-fade-slide" mode="out-in">
          <svg
            v-if="theme === 'light'"
            key="sun-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg
            v-else-if="theme === 'dark'"
            key="moon-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg
            v-else
            key="system-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 7 A5 5 0 0 0 12 17 Z" fill="currentColor" stroke="none"></path>
          </svg>
        </Transition>
      </button>
    </div>
  </header>
</template>

<script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { getTitleUrl } from '@utils/getTitleUrl'
  import { useI18n } from '@composables/useI18n'
  import { useWindowSize } from '@vueuse/core'
  import AddStudentsIcon from '@assets/icon/add_students.svg'
  import ShareIcon from '@assets/icon/share.svg'
  import GearIcon from '@assets/icon/gear.svg'

  const { t, currentLocale: locale } = useI18n()

  const emit = defineEmits(['openModal', 'openSettingsModal', 'copyShareLink', 'openShareModal'])

  const showShareDropdown = ref(false)

  const toggleShareDropdown = () => {
    showShareDropdown.value = !showShareDropdown.value
  }

  const handleCopyLink = () => {
    emit('copyShareLink')
    showShareDropdown.value = false
  }

  const handleDownloadScreenshot = () => {
    emit('openShareModal')
    showShareDropdown.value = false
  }

  const handleClickOutside = (event) => {
    if (showShareDropdown.value && !event.target.closest('.share-dropdown-container')) {
      showShareDropdown.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  const settingStore = useSettingStore()
  const { theme } = storeToRefs(settingStore)
  const { toggleTheme } = settingStore

  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= 768)

  const logoUrl = computed(() => getTitleUrl(locale.value, isMobile.value))

  const isSettingsIconRotating = ref(false)

  const handleSettingsClick = () => {
    isSettingsIconRotating.value = true
    emit('openSettingsModal')
  }
</script>

<style scoped>
  @keyframes rotate-gear {
    from {
      transform: skew(8deg) rotate(0deg);
    }
    to {
      transform: skew(8deg) rotate(360deg);
    }
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
    color: #2d4663;
    padding: 5px 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dee2e6;
  }

  .dark-mode .header {
    background: linear-gradient(45deg, #223d5a, #1a2b40);
    border-bottom-color: #2a4a6e;
    color: #e0f4ff;
  }

  .header-title {
    font-size: 24px;
    font-weight: bold;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header-title img {
    height: 100%;
    width: auto;
    object-fit: contain;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-btn {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    border: none;
    color: #314665;
    fill: #314665;
    cursor: pointer;
    border-radius: 12px;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
  }

  .icon-btn:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .icon-btn:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .icon-btn {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
    fill: #e0f4ff
  }

  .icon-btn svg {
    width: 24px;
    height: 24px;
    transform: skew(8deg);
    transition: transform 0.3s ease-in-out;
  }

  .icon-btn svg.is-rotating {
    animation: rotate-gear 0.5s ease-in-out;
  }

  .settings-btn:hover svg {
    transform: skew(8deg) rotate(90deg);
  }

  .theme-toggle-btn {
    padding: 0;
  }

  .theme-toggle-btn svg {
    width: 24px;
    height: 24px;
    color: #314665;
  }

  .dark-mode .theme-toggle-btn svg {
    color: #e0f4ff;
  }

  .icon-fade-slide-enter-active,
  .icon-fade-slide-leave-active {
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .icon-fade-slide-enter-from {
    opacity: 0;
    transform: skew(8deg) rotateY(90deg);
  }

  .icon-fade-slide-leave-to {
    opacity: 0;
    transform: skew(8deg) rotateY(-90deg);
  }

  .share-dropdown-container {
    position: relative;
  }

  .share-dropdown-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 1001;
    border: 1px solid #dee2e6;
    transform: skew(-8deg);
    padding: 5px;
  }

  .dark-mode .share-dropdown-menu {
    background-color: #1a2b40;
    border-color: #2a4a6e;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #333;
    transition: background-color 0.2s ease;
    border-radius: 8px;
    width: 100%;
  }

  .dropdown-item > * {
    transform: skew(8deg);
  }

  .dark-mode .dropdown-item {
    color: #eee;
  }

  .dropdown-item:hover {
    background-color: #e9ecef;
  }

  .dark-mode .dropdown-item:hover {
    background-color: #2a4a6e;
  }

  .dropdown-item span:last-child {
    white-space: nowrap;
  }

  .dropdown-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }

  .dropdown-icon img {
    width: 100%;
    height: 100%;
    filter: brightness(0) invert(0.2);
    transition: none;
  }

  .dark-mode .dropdown-icon img {
    filter: brightness(0) invert(0.8);
  }
</style>
