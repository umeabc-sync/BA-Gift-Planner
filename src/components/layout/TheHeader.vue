<template>
  <header class="header">
    <div class="header-title">
      <img :src="logoUrl" :alt="t('header.title')" />
    </div>
    <div class="controls">
      <router-link
        :to="isBondCalculatorRoute ? '/gift-recommendation' : '/bond-calculator'"
        class="btn-skew btn-icon btn-blue"
      >
        <component
          :is="isBondCalculatorRoute ? GiftIcon : BondCalculatorIcon"
          :alt="t('header.selectStudentsAlt')"
          draggable="false"
        />
      </router-link>
      <button class="btn-skew btn-icon btn-blue" @click="modalStore.openStudentSelectionModal">
        <component :is="AddStudentsIcon" :alt="t('header.selectStudentsAlt')" draggable="false" />
      </button>
      <div v-if="isGiftRecommendationRoute" class="share-dropdown-container">
        <button class="btn-skew btn-icon btn-blue" @click="toggleShareDropdown">
          <component :is="ShareIcon" :alt="t('header.shareAlt')" draggable="false" />
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
      <button class="btn-skew btn-icon btn-blue settings-btn" @click="handleSettingsClick">
        <component
          :is="GearIcon"
          :alt="t('header.settingsAlt')"
          :class="{ 'is-rotating': isSettingsIconRotating }"
          @animationend="isSettingsIconRotating = false"
          draggable="false"
        />
      </button>
    </div>
  </header>
</template>

<script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useSettingStore } from '@store/setting'
  import { useModalStore } from '@store/modal'
  import { storeToRefs } from 'pinia'
  import { getAssetsFile } from '@utils/getAssetsFile'
  import { getTitleUrl } from '@utils/getTitleUrl'
  import { useI18n } from '@composables/useI18n'
  import { useToast } from '@composables/useToast'
  import { useWindowSize } from '@vueuse/core'
  import AddStudentsIcon from '@assets/icon/add_students.svg'
  import ShareIcon from '@assets/icon/share.svg'
  import GearIcon from '@assets/icon/gear.svg'
  // TEMP ICONS
  import BondCalculatorIcon from '@assets/icon/bond_calculator.svg'
  import GiftIcon from '@assets/icon/gift_icon.svg'

  const { t, currentLocale: locale } = useI18n()
  const { addToast } = useToast()
  const route = useRoute()
  const modalStore = useModalStore()

  const isGiftRecommendationRoute = computed(() => route.name === 'GiftRecommendation')
  const isBondCalculatorRoute = computed(() => route.name === 'BondCalculator')

  const showShareDropdown = ref(false)

  const toggleShareDropdown = () => {
    showShareDropdown.value = !showShareDropdown.value
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    addToast(t('toast.link_copied_to_clipboard'), 'success')
    showShareDropdown.value = false
  }

  const handleDownloadScreenshot = () => {
    modalStore.openShareModal()
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

  const { width } = useWindowSize()
  const isMobile = computed(() => width.value <= 768)

  const logoUrl = computed(() => getTitleUrl(locale.value, theme.value, isMobile.value))

  const isSettingsIconRotating = ref(false)

  const handleSettingsClick = () => {
    isSettingsIconRotating.value = true
    modalStore.openSettingsModal()
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

  .settings-btn svg {
    transition: transform 0.3s ease-in-out;
  }

  .btn-skew svg.is-rotating {
    animation: rotate-gear 0.5s ease-in-out;
  }

  .settings-btn:hover svg {
    transform: skew(8deg) rotate(90deg);
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
