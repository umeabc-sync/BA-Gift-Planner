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
          <div class="setting-control-wrapper">
            <CustomDropdown>
              <template #toggle>
                <span>{{ currentLanguageName }}</span>
              </template>
              <li
                v-for="lang in availableLanguages"
                :key="lang.code"
                :class="{ active: locale === lang.code }"
                @click="() => handleLocaleChange(lang.code)"
              >
                <span>{{ lang.name }}</span>
              </li>
            </CustomDropdown>
          </div>
        </div>

        <!-- Theme Settings -->
        <div class="setting-group">
          <h4 class="setting-group-title">{{ t('settingsModal.theme') }}</h4>
          <div class="setting-control-wrapper">
            <CustomDropdown>
              <template #toggle>
                <span>{{ currentThemeName }}</span>
              </template>
              <li
                v-for="themeOption in availableThemes"
                :key="themeOption.value"
                :class="{ active: theme === themeOption.value }"
                @click="handleThemeChange(themeOption.value)"
              >
                <span>{{ themeOption.name }}</span>
              </li>
            </CustomDropdown>
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
  import { computed, toRefs } from 'vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import BaseModal from '@components/ui/BaseModal.vue'
  import CustomDropdown from '@components/ui/CustomDropdown.vue'

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

  const currentLanguageName = computed(() => {
    return availableLanguages.find((lang) => lang.code === locale.value)?.name || ''
  })

  const currentThemeName = computed(() => {
    return availableThemes.value.find((t) => t.value === theme.value)?.name || ''
  })

  const handleThemeChange = (newTheme) => {
    if (theme.value === newTheme) {
      return
    }
    settingStore.setTheme(newTheme)
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

  .setting-control-wrapper {
    min-width: 180px;
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

    .setting-control-wrapper {
      max-width: none;
      width: 100%;
    }
  }
</style>
