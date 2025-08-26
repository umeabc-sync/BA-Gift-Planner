import { ref, watch, computed } from 'vue'
import { useSettingStore } from '@store/setting'

const loadedMessages = ref({})
const isLoaded = ref(false)

export function useI18n() {
  const settingStore = useSettingStore()

  const loadMessages = async (locale) => {
    isLoaded.value = false
    try {
      if (locale === null) locale = 'zh-tw' // Make sure components don't try to access null.json during their initial setup.
      const module = await import(`@/locales/${locale}.json`)
      loadedMessages.value = module.default
    } catch (error) {
      console.error(`Failed to load locale messages for ${locale}:`, error)
      // Fallback to default if loading fails
      const defaultModule = await import(`@/locales/zh-tw.json`)
      loadedMessages.value = defaultModule.default
    } finally {
      isLoaded.value = true
    }
  }

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = loadedMessages.value
    for (const k of keys) {
      if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k]
      } else {
        return key // Return the key if the translation is not found
      }
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      let result = value
      for (const [paramKey, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`\\{${paramKey}\\}`, 'g')
        result = result.replace(regex, paramValue)
      }
      return result
    }

    return value
  }

  // Watch for changes in the setting store's locale
  watch(
    () => settingStore.locale,
    (newLocale) => {
      if (newLocale) {
        loadMessages(newLocale)
      }
    },
    { immediate: true }
  )

  return { t, isLoaded, currentLocale: computed(() => settingStore.locale) }
}
