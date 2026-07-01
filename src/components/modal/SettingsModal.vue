<template>
  <BaseModal :is-visible="isVisible" @close="closeModal" max-width="600px">
    <template #header>
      <div class="modal-title">{{ t('common.settings') }}</div>
    </template>
    <template #body>
      <div class="settings-body">
        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button :class="['tab-button', { active: activeTab === 'appearance' }]" @click="activeTab = 'appearance'">
            <span>{{ t('settingsModal.appearance') }}</span>
          </button>
          <button :class="['tab-button', { active: activeTab === 'performance' }]" @click="activeTab = 'performance'">
            <span>{{ t('settingsModal.performance') }}</span>
          </button>
          <button :class="['tab-button', { active: activeTab === 'account' }]" @click="activeTab = 'account'">
            <span>{{ t('settingsModal.account') }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Appearance Settings -->
          <AppScrollbar hidden v-show="activeTab === 'appearance'" class="settings-panel">
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
          </AppScrollbar>

          <!-- Performance Settings -->
          <AppScrollbar v-show="activeTab === 'performance'" class="settings-panel">
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

            <!-- Disable Background Blur Settings (New) -->
            <div class="setting-group">
              <h4 class="setting-group-title">{{ t('settingsModal.disableBackgroundBlur') }}</h4>
              <div class="toggle-button-group">
                <button
                  :class="['toggle-button', 'off', { active: !isBackgroundBlurDisabled }]"
                  @click="isBackgroundBlurDisabled && toggleBackgroundBlur()"
                >
                  <span>{{ t('common.disabled') }}</span>
                </button>
                <button
                  :class="['toggle-button', 'on', { active: isBackgroundBlurDisabled }]"
                  @click="!isBackgroundBlurDisabled && toggleBackgroundBlur()"
                >
                  <span>{{ t('common.enabled') }}</span>
                </button>
              </div>
            </div>
          </AppScrollbar>

          <!-- Account Settings -->
          <AppScrollbar v-show="activeTab === 'account'" class="settings-panel">
            <div class="setting-group">
              <h4 class="setting-group-title">{{ t('settingsModal.googleLoginStatus') }}</h4>
              <div class="setting-control-wrapper" style="text-align: right; display: flex; justify-content: flex-end">
                <div v-if="!user">
                  <a href="/api/auth/google/login" class="btn-skew btn-text btn-blue" style="text-decoration: none">
                    <span>{{ t('settingsModal.loginWithGoogle') }}</span>
                  </a>
                </div>
                <div v-else class="user-info">
                  <span class="user-name">{{ t('settingsModal.loggedInAs').replace('{name}', user.name) }}</span>
                  <button @click="handleLogout" class="btn-skew btn-text btn-gray">
                    <span>{{ t('settingsModal.logout') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Sync Status -->
            <div class="setting-group" v-if="user">
              <h4 class="setting-group-title">{{ t('settingsModal.cloudSaveSync') }}</h4>
              <div class="setting-control-wrapper" style="text-align: right">
                <div style="color: #4caf50; font-weight: bold; font-size: 0.95rem; margin-bottom: 4px">
                  {{ t('common.enabled') }}
                </div>
                <div v-if="lastSyncTime" style="font-size: 0.8rem; color: #666">
                  {{ t('settingsModal.lastSyncTime') }}{{ lastSyncTime.toLocaleTimeString() }}
                </div>
              </div>
            </div>
          </AppScrollbar>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
  import { computed, ref, toRefs, onMounted } from 'vue'
  import { useSettingStore } from '@/store/setting'
  import { storeToRefs } from 'pinia'
  import { useI18n } from '@/composables/useI18n.js'
  import { useModal } from '@/composables/useModal.js'
  import AppScrollbar from '@/components/ui/AppScrollbar.vue'
  import BaseModal from '@components/ui/BaseModal.vue'
  import CustomDropdown from '@components/ui/CustomDropdown.vue'
  import { useCloudSync } from '@/composables/useCloudSync.js'

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

  // Active tab state
  const activeTab = ref('appearance')

  // Auth and Sync state from shared composable
  const { user, lastSyncTime } = useCloudSync()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      // Clear localStorage or state if necessary
    } catch (e) {
      console.error('Failed to logout:', e)
    }
  }

  const settingStore = useSettingStore()
  const {
    enableCharacterSelectorLazyLoad: isLazyLoadEnabled,
    showOnlyOptimalSolution: isShowOnlyOptimalSolutionEnabled,
    theme,
    useVibrantProgressBar: isVibrantProgressBarEnabled,
    disableBackgroundBlur: isBackgroundBlurDisabled,
  } = storeToRefs(settingStore)

  const {
    toggleCharacterSelectorLazyLoad,
    toggleShowOnlyOptimalSolution,
    toggleVibrantProgressBar,
    toggleBackgroundBlur,
  } = settingStore

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
    margin: 5px;
    border: 1px solid #aeb5bc;
    border-radius: 10px;
    overflow: hidden;
  }

  .dark-mode .settings-body {
    border-color: #3a5a7e;
  }

  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    background: #a9e0f4;
    padding: 6px 6px 0 6px;
    position: relative;
  }

  .dark-mode .tab-navigation {
    background: #1a3a52;
  }

  .tab-button {
    flex: 1;
    padding: 10px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: #416589;
    transition: all 0.2s ease;
    position: relative;
    user-select: none;
    border-radius: 4px 4px 0 0;
    z-index: 1;
  }

  /* Separator line between tabs */
  .tab-button:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    height: 60%;
    width: 1px;
    background-color: #416589;
    opacity: 0.4;
    z-index: 0;
  }

  .dark-mode .tab-button {
    color: #8bb4cc;
  }

  .dark-mode .tab-button:not(:last-child)::after {
    background-color: #8bb4cc;
  }

  .tab-button:hover:not(.active) {
    background: rgba(255, 255, 255, 0.2);
  }

  .dark-mode .tab-button:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-button.active {
    background: white;
    color: #37393c;
    font-weight: 700;
    z-index: 2; /* Ensure active tab is above separator */
  }

  .dark-mode .tab-button.active {
    background: #0d1f2d;
    color: #00a4e4;
  }

  /* Tab Content */
  .tab-content {
    background: white;
    height: 40vh;
    max-height: 340px;
    padding: 6px 4px 4px 4px;
    display: flex;
  }

  .dark-mode .tab-content {
    background: #0d1f2d;
  }

  .settings-panel {
    width: 100%;
    padding: 6px;
    background-color: #d8dadc;
    border-radius: 9px;
    overflow-y: auto;
  }

  .dark-mode .settings-panel {
    background-color: #08141d;
  }

  .setting-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 12px;
    margin-bottom: 6px;
    background: linear-gradient(45deg, #cedae3, #f1f1f1);
    border-radius: 4px;
    border: 2px solid #fefefd;
    box-shadow: 0px 2px 1px #616569;
  }

  .dark-mode .setting-group {
    background: linear-gradient(45deg, #1a2b40, #23374e);
    border-color: #2a4a6e;
    box-shadow: 0px 2px 1px #0a1118;
  }

  .setting-group:last-child {
    margin-bottom: 2px;
  }

  .setting-group-title {
    font-size: 1.05rem;
    font-weight: 500;
    margin: 0;
    user-select: none;
    color: #2c3e50;
  }

  .dark-mode .setting-group-title {
    color: #e0e6ed;
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
    .tab-button {
      padding: 14px 16px;
      font-size: 0.95rem;
    }

    .setting-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 12px;
    }

    .setting-control-wrapper {
      max-width: none;
      width: 100%;
    }

    .toggle-button-group {
      width: 100%;
    }

    .toggle-button {
      flex: 1;
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .user-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #2c3e50;
  }

  .dark-mode .user-name {
    color: #e0e6ed;
  }
</style>
