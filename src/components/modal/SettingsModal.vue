<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">{{ t('common.settings') }}</div>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <!-- Language Settings -->
            <div class="setting-group">
              <h4 class="setting-group-title">{{ t('settingsModal.language') }}</h4>
              <div class="language-selector">
                <button ref="dropdownToggleRef" class="dropdown-toggle" @click="toggleMenu">
                  {{ currentLanguageName }} <span class="caret" :class="{ open: isOpen }"></span>
                </button>
                <transition name="dropdown">
                  <ul v-if="isOpen" ref="languageMenuRef" class="language-menu">
                    <li
                      v-for="lang in availableLanguages"
                      :key="lang.code"
                      @click="
                        () => {
                          handleLocaleChange(lang.code)
                          isOpen = false
                        }
                      "
                    >
                      {{ lang.name }}
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
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
  import { ref, computed, toRefs, watch } from 'vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'

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
  } = storeToRefs(settingStore)

  const { toggleCharacterSelectorLazyLoad, toggleShowOnlyOptimalSolution } = settingStore

  const availableLanguages = [
    { code: 'zh-tw', name: '繁體中文' },
    { code: 'zh-cn', name: '简体中文' },
  ]

  const isOpen = ref(false)
  const dropdownToggleRef = ref(null)
  const languageMenuRef = ref(null)

  const toggleMenu = () => {
    isOpen.value = !isOpen.value
  }

  const closeMenu = () => {
    isOpen.value = false
  }

  const handleClickOutside = (event) => {
    const isClickInsideButton = dropdownToggleRef.value && dropdownToggleRef.value.contains(event.target)
    const isClickInsideMenu = languageMenuRef.value && languageMenuRef.value.contains(event.target)

    if (!isClickInsideButton && !isClickInsideMenu) {
      closeMenu()
    }
  }

  watch(isOpen, (isMenuOpen) => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside, true)
    } else {
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  const currentLanguageName = computed(() => {
    return availableLanguages.find((lang) => lang.code === locale.value)?.name || ''
  })

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
    background: #f8f9fa;
    /* Abandoned */
    /* background: linear-gradient(135deg, #f8f9fa 75%, #d4e4ed); */
    border-radius: 15px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4);
    animation: slide-down 0.3s ease-out;
  }

  .dark-mode .modal-content {
    background: #1a2b40;
    color: #e0e6ed;
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #cde6f8, #f7fafb);
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
    line-height: 1;
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

  .modal-body {
    padding: 20px;
    overflow-y: auto;
  }

  .setting-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #e9ecef;
  }

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

  .setting-group-title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .language-selector {
    position: relative;
    max-width: 200px;
  }

  .dropdown-toggle {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #bdc3c7;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }

  .dark-mode .dropdown-toggle {
    background-color: #1f3048;
    border-color: #2a4a6e;
    color: #e0e6ed;
  }

  .dropdown-toggle:hover {
    border-color: #6495ed;
    background-color: #e9ecef;
  }

  .dark-mode .dropdown-toggle:hover {
    border-color: #00aeef;
    background-color: #2a4a6e;
  }

  .caret {
    margin-left: 10px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #000;
    transition: transform 0.3s ease;
  }

  .dark-mode .caret {
    border-top-color: #e0e6ed;
  }

  .caret.open {
    transform: rotate(180deg);
  }

  .language-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #bdc3c7;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    list-style: none;
    padding: 0;
    margin: 5px 0 0 0;
    z-index: 1000;
    overflow: hidden;
  }

  .dark-mode .language-menu {
    background-color: #1f3048;
    border-color: #2a4a6e;
  }

  .language-menu li {
    padding: 10px 15px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .language-menu li:hover {
    background-color: #e9ecef;
  }

  .dark-mode .language-menu li:hover {
    background-color: #2a4a6e;
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .toggle-button-group {
    display: flex;
  }

  .toggle-button {
    padding: 10px 24px;
    /* border: none; */
    border: 1px solid #dee2e6;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-family: inherit;
    font-weight: bold;
    white-space: nowrap;
    background-color: #e6f2f6;
    transform: skew(-8deg);
    /* box-shadow: 0 3px 2px rgba(0, 0, 0, 0.1); */
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
