<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <TheHeader />
    <router-view />
    <FooterSection />
  </div>
</template>

<script setup>
  import { onMounted, watch } from 'vue'
  import { useOverlayScrollbars } from 'overlayscrollbars-vue'
  import { useSettingStore } from '@store/setting'
  import { storeToRefs } from 'pinia'
  import TheHeader from '@components/layout/TheHeader.vue'
  import FooterSection from '@components/layout/FooterSection.vue'
  import { useI18n } from '@composables/useI18n'

  const { t, isLoaded, currentLocale: locale } = useI18n()
  const settingStore = useSettingStore()
  const { isDarkMode } = storeToRefs(settingStore)

  const [initBodyOverlayScrollbars, getBodyOverlayScrollbarsInstance] = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        theme: isDarkMode.value ? 'os-theme-light' : 'os-theme-dark',
        clickScroll: true,
      },
    },
  })

  onMounted(() => {
    settingStore.initThemeListener()
    initBodyOverlayScrollbars({ target: document.body })
  })

  watch(
    [isLoaded, locale],
    ([loaded, newLocale]) => {
      if (loaded && newLocale) {
        document.title = t('common.title')
      }
    },
    { immediate: true }
  )

  watch(
    isDarkMode,
    (isDark) => {
      if (isDark) {
        document.body.classList.add('dark-mode')
      } else {
        document.body.classList.remove('dark-mode')
      }

      const instance = getBodyOverlayScrollbarsInstance()
      if (instance) {
        instance.options({
          scrollbars: {
            theme: isDark ? 'os-theme-light' : 'os-theme-dark',
          },
        })
      }
    },
    { immediate: true }
  )
</script>

<style scoped>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 80px - 40px); /* Subtract header(80px) & padding(40px) height */
  }
</style>
