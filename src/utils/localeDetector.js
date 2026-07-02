import { useSettingStore } from '@store/setting'

export function initLocale() {
  const settingStore = useSettingStore()

  // If locale is already set (e.g. from user settings / local storage), do not overwrite it
  if (settingStore.locale !== null) {
    console.log('skipping browser locale detection, locale is already set:', settingStore.locale)
    return
  }

  const browserLang = (navigator.language || 'en').toLowerCase()

  // Match traditional Chinese variants to zh-tw
  if (browserLang === 'zh-tw' || browserLang === 'zh-hk' || browserLang === 'zh-mo') {
    settingStore.locale = 'zh-tw'
    return
  }

  // Match simplified Chinese variants to zh-cn
  if (browserLang === 'zh-cn' || browserLang === 'zh-sg' || browserLang === 'zh-my') {
    settingStore.locale = 'zh-cn'
    return
  }

  // Fallback prefix checking for Chinese
  if (browserLang.startsWith('zh')) {
    if (
      browserLang.includes('tw') ||
      browserLang.includes('hk') ||
      browserLang.includes('mo') ||
      browserLang.includes('cht')
    ) {
      settingStore.locale = 'zh-tw'
    } else {
      settingStore.locale = 'zh-cn'
    }
    return
  }

  // Other languages
  if (browserLang.startsWith('ja')) {
    settingStore.locale = 'ja'
    return
  }

  if (browserLang.startsWith('ko')) {
    settingStore.locale = 'ko'
    return
  }

  if (browserLang.startsWith('en')) {
    settingStore.locale = 'en'
    return
  }

  // Default fallback is English
  settingStore.locale = 'en'
}
