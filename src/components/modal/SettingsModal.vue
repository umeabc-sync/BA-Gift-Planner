<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="500px">
    <template #header>
      <div class="modal-title">{{ t('common.settings') }}</div>
    </template>
    <template #body>
      <div class="settings-body">
        <!-- Language Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.language') }}</h4>
          <div class="language-selector" :class="{ 'z-active': isLangMenuOpen }">
            <button ref="langDropdownToggleRef" class="custom-dropdown-toggle" @click="toggleLangMenu">
              <span>{{ currentLanguageName }}</span>
              <span class="caret" :class="{ open: isLangMenuOpen }"></span>
            </button>
            <transition name="dropdown">
              <ul v-if="isLangMenuOpen" ref="languageMenuRef" class="custom-dropdown-menu">
                <li
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  :class="{ active: locale === lang.code }"
                  @click="
                    () => {
                      handleLocaleChange(lang.code)
                      isLangMenuOpen = false
                    }
                  "
                >
                  <span>{{ lang.name }}</span>
                </li>
              </ul>
            </transition>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.theme') }}</h4>
          <div class="language-selector" :class="{ 'z-active': isThemeMenuOpen }">
            <button ref="themeDropdownToggleRef" class="custom-dropdown-toggle" @click="toggleThemeMenu">
              <span>{{ currentThemeName }}</span>
              <span class="caret" :class="{ open: isThemeMenuOpen }"></span>
            </button>
            <transition name="dropdown">
              <ul v-if="isThemeMenuOpen" ref="themeMenuRef" class="custom-dropdown-menu">
                <li
                  v-for="themeOption in availableThemes"
                  :key="themeOption.value"
                  :class="{ active: theme === themeOption.value }"
                  @click="handleThemeChange(themeOption.value)"
                >
                  <span>{{ themeOption.name }}</span>
                </li>
              </ul>
            </transition>
          </div>
        </div>

        <!-- Show Only Optimal Solution Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.showOnlyOptimalSolution') }}</h4>
          <div class="toggle-button-group">
            <button
              :class="['toggle-button', 'off', { active: !isShowOnlyOptimalSolutionEnabled }]"
              @click="isShowOnlyOptimalSolutionEnabled && toggleShowOnlyOptimalSolution()"
            >
              <span>{{ t('common.disabled') }}</span>
            </button>
            <button
              :class="['toggle-button', 'on', { active: isShowOnlyOptimalSolutionEnabled }]"
              @click="!isShowOnlyOptimalSolutionEnabled && toggleShowOnlyOptimalSolution()"
            >
              <span>{{ t('common.enabled') }}</span>
            </button>
          </div>
        </div>

        <!-- Lazy Load Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.characterSelectorLazyLoad') }}</h4>
          <div class="toggle-button-group">
            <button
              :class="['toggle-button', 'off', { active: !isLazyLoadEnabled }]"
              @click="isLazyLoadEnabled && toggleLazyLoad()"
            >
              <span>{{ t('common.disabled') }}</span>
            </button>
            <button
              :class="['toggle-button', 'on', { active: isLazyLoadEnabled }]"
              @click="!isLazyLoadEnabled && toggleLazyLoad()"
            >
              <span>{{ t('common.enabled') }}</span>
            </button>
          </div>
        </div>

        <!-- Vibrant Progress Bar Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.vibrantProgressBar') }}</h4>
          <div class="toggle-button-group">
            <button
              :class="['toggle-button', 'off', { active: !isVibrantProgressBarEnabled }]"
              @click="isVibrantProgressBarEnabled && toggleVibrantProgressBar()"
            >
              <span>{{ t('common.disabled') }}</span>
            </button>
            <button
              :class="['toggle-button', 'on', { active: isVibrantProgressBarEnabled }]"
              @click="!isVibrantProgressBarEnabled && toggleVibrantProgressBar()"
            >
              <span>{{ t('common.enabled') }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { ref, computed, toRefs, watch } from 'vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'

  const { t, currentLocale: locale } = useI18n()

  const props = defineProps({
    isVisible: { type: Boolean, default: false },
  })
  const emit = defineEmits(['close'])

  const closeModal = () => {
    emit('close')
  }
  const { isVisible } = toRefs(props)
  useModal(isVisible, closeModal)

  const settingStore = useSettingStore()
  const {
    enableCharacterSelectorLazyLoad: isLazyLoadEnabled,
    showOnlyOptimalSolution: isShowOnlyOptimalSolutionEnabled,
    theme,
    useVibrantProgressBar: isVibrantProgressBarEnabled,
  } = storeToRefs(settingStore)

  const { toggleCharacterSelectorLazyLoad, toggleShowOnlyOptimalSolution, toggleVibrantProgressBar } = settingStore

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh-tw', name: '繁體中文' },
    { code: 'zh-cn', name: '简体中文' },
  ]

  const availableThemes = computed(() => [
    { value: 'light', name: t('settingsModal.light') },
    { value: 'dark', name: t('settingsModal.dark') },
    { value: 'system', name: t('settingsModal.system') },
  ])

  const isLangMenuOpen = ref(false)
  const langDropdownToggleRef = ref(null)
  const languageMenuRef = ref(null)

  const isThemeMenuOpen = ref(false)
  const themeDropdownToggleRef = ref(null)
  const themeMenuRef = ref(null)

  const toggleLangMenu = () => {
    isLangMenuOpen.value = !isLangMenuOpen.value
  }

  const toggleThemeMenu = () => {
    isThemeMenuOpen.value = !isThemeMenuOpen.value
  }

  const closeAllMenus = () => {
    isLangMenuOpen.value = false
    isThemeMenuOpen.value = false
  }

  const handleClickOutside = (event) => {
    const isClickInsideLangButton = langDropdownToggleRef.value && langDropdownToggleRef.value.contains(event.target)
    const isClickInsideLangMenu = languageMenuRef.value && languageMenuRef.value.contains(event.target)
    const isClickInsideThemeButton = themeDropdownToggleRef.value && themeDropdownToggleRef.value.contains(event.target)
    const isClickInsideThemeMenu = themeMenuRef.value && themeMenuRef.value.contains(event.target)

    if (!isClickInsideLangButton && !isClickInsideLangMenu && !isClickInsideThemeButton && !isClickInsideThemeMenu) {
      closeAllMenus()
    } else if (isLangMenuOpen.value && !isClickInsideLangButton && !isClickInsideLangMenu) {
      isLangMenuOpen.value = false
    } else if (isThemeMenuOpen.value && !isClickInsideThemeButton && !isClickInsideThemeMenu) {
      isThemeMenuOpen.value = false
    }
  }

  // Monitor menu status and only handle external close events.
  watch(isLangMenuOpen, (isMenuOpen) => {
    if (isMenuOpen) {
      isThemeMenuOpen.value = false // Close other menu
      document.addEventListener('click', handleClickOutside, true)
    } else {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  watch(isThemeMenuOpen, (isMenuOpen) => {
    if (isMenuOpen) {
      isLangMenuOpen.value = false // Close other menu
      document.addEventListener('click', handleClickOutside, true)
    } else {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  const currentLanguageName = computed(() => {
    return availableLanguages.find((lang) => lang.code === locale.value)?.name || ''
  })

  const currentThemeName = computed(() => {
    return availableThemes.value.find((t) => t.value === theme.value)?.name || ''
  })

  const handleThemeChange = (newTheme) => {
    if (theme.value === newTheme) {
      isThemeMenuOpen.value = false
      return
    }
    settingStore.setTheme(newTheme)
    isThemeMenuOpen.value = false
  }

  const handleLocaleChange = (newLocale) => {
    if (locale.value === newLocale) {
      return
    }
    settingStore.setLocale(newLocale)
    // window.location.reload()
  }

  const toggleLazyLoad = () => {
    toggleCharacterSelectorLazyLoad()
  }
</script>

<style scoped>
  .settings-body {
    padding: 20px;
    overflow-y: auto;
    max-height: 70vh;
  }

  .setting-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e9ecef;
    position: relative;
  }

  .setting-group:nth-child(1) { z-index: 20; }
  .setting-group:nth-child(2) { z-index: 19; }
  .setting-group:nth-child(3) { z-index: 18; }
  .setting-group:nth-child(4) { z-index: 17; }
  .setting-group:nth-child(5) { z-index: 16; }

  .setting-group:last-child {
    border-bottom: none;
  }

  .setting-group-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
    user-select: none;
  }

  .dark-mode .setting-group {
    border-bottom-color: #2a4a6e;
  }

  .language-selector {
    position: relative;
    min-width: 180px;
    z-index: 1;
  }

  .language-selector.z-active {
    z-index: 10;
  }

  .custom-dropdown-toggle {
    background-color: #77ddff;
    background-image: linear-gradient(to bottom right, #63d0fd 0%, transparent 50%),
      linear-gradient(to top left, #63d0fd 0%, transparent 50%);
    border: none;
    color: #314665;
    cursor: pointer;
    border-radius: 12px;
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    transform: skew(-8deg);
    box-shadow: 0 3px 2px rgba(0, 0, 0, 0.15);
    font-family: inherit;
    font-weight: bold;
    font-size: 1rem;
    padding: 0 20px;
  }

  .custom-dropdown-toggle:hover {
    transform: translateY(-2px) skew(-8deg);
  }

  .custom-dropdown-toggle:active {
    transform: scale(0.95) skew(-8deg);
  }

  .dark-mode .custom-dropdown-toggle {
    background-color: #00aeef;
    background-image: linear-gradient(to bottom right, #09a4f2 0%, transparent 50%),
      linear-gradient(to top left, #09a4f2 0%, transparent 50%);
    color: #e0f4ff;
  }

  .custom-dropdown-toggle > * {
    transform: skew(8deg);
    display: inline-block;
  }

  .caret {
    margin-left: 10px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #314665;
    transition: transform 0.3s ease;
  }

  .dark-mode .caret {
    border-top-color: #e0f4ff;
  }

  .caret.open {
    transform: skew(8deg) rotate(180deg);
  }

  .custom-dropdown-menu {
    position: absolute;
    top: 100%;
    left: -2px;
    width: 100%;
    margin-top: 6px;
    background-color: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 100;
    border: 1px solid #dee2e6;
    transform: skew(-8deg);
    transform-origin: top center;
    padding: 5px;
    list-style: none;
    margin-bottom: 0;
  }

  .dark-mode .custom-dropdown-menu {
    background-color: #1a2b40;
    border-color: #2a4a6e;
  }

  .custom-dropdown-menu li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #314665;
    transition: background-color 0.2s ease;
    border-radius: 8px;
    width: 100%;
    font-weight: bold;
  }

  .custom-dropdown-menu li > * {
    transform: skew(8deg);
  }

  .dark-mode .custom-dropdown-menu li {
    color: #e0e6ed;
  }

  .custom-dropdown-menu li:hover {
    background-color: #e9ecef;
  }

  .dark-mode .custom-dropdown-menu li:hover {
    background-color: #2a4a6e;
  }

  .custom-dropdown-menu li.active {
    background-color: #466398;
    color: white;
  }

  .dark-mode .custom-dropdown-menu li.active {
    background-color: #00a4e4;
  }

  /* Animation fix: The skew state must be maintained when entering and exiting. */
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) skew(-8deg);
  }

  .toggle-button-group {
    display: flex;
  }

  .toggle-button {
    padding: 10px 24px;
    border: 1px solid #dee2e6;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-family: inherit;
    font-weight: bold;
    white-space: nowrap;
    background-color: #e6f2f6;
    transform: skew(-8deg);
  }

  .dark-mode .toggle-button {
    background-color: #1a2b40;
    border-color: #2a4a6e;
  }

  .toggle-button span {
    display: inline-block;
    transform: skew(8deg);
  }

  .toggle-button:active {
    transform: scale(0.95) skew(-8deg);
  }

  .toggle-button.off {
    color: #5484fd;
    border-right: none;
    border-radius: 6px 0 0 6px;
  }

  .toggle-button.on {
    color: #cf595b;
    border-left: none;
    border-radius: 0 6px 6px 0;
  }

  .toggle-button.active {
    color: white;
  }

  .toggle-button.off.active,
  .toggle-button.on.active {
    background-color: #466398;
  }

  .dark-mode .toggle-button.off.active,
  .dark-mode .toggle-button.on.active {
    background-color: #00a4e4;
  }

  @media (max-width: 425px) {
    .setting-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .language-selector {
      max-width: none;
      width: 100%;
    }
  }
</style>
