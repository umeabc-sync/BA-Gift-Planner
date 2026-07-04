import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/composables/useI18n'
import {
  getLocalStatePayload,
  compressSaveData,
  decompressSaveData,
  applySaveDataToStores,
  isSyncPayloadEqual,
} from '@/utils/saveManager'
import { getSyncStores } from '@/config/syncStores'

const THROTTLE_THRESHOLD = 1000 * 60 * 5 // 5 minutes

// Shared state (Singleton pattern)
const isSyncing = ref(false)
const lastSyncTime = ref(null)
const user = ref(null)
let syncTimeout = null
let isInitialized = false
let lastSyncedDataStr = null

export function useCloudSync() {
  const stores = getSyncStores()

  const { addToast } = useToast()
  const { t } = useI18n()

  const initSync = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      user.value = data.user

      if (user.value) await downloadSave()
    } catch (e) {
      console.error('Failed to init sync:', e)
    }
  }

  const downloadSave = async (isAuto = false) => {
    try {
      isSyncing.value = true // Lock to prevent auto sync from being triggered
      const res = await fetch('/api/sync/download')

      if (res.status === 401) {
        user.value = null
        addToast(t('cloudSync.sessionExpired'), 'error')
        return
      }
      if (!res.ok) {
        addToast(t('cloudSync.downloadFailed'), 'error')
        return
      }

      const data = await res.json()
      if (!data.payload) return

      const decompressed = decompressSaveData(data.payload)
      const cloudPayload = JSON.parse(decompressed)
      const cloudDataStr = JSON.stringify(cloudPayload)

      const localPayload = getLocalStatePayload()

      let lastSyncedPayload = null
      try {
        lastSyncedPayload = lastSyncedDataStr ? JSON.parse(lastSyncedDataStr) : null
      } catch (e) {
        console.error('Failed to parse last synced data string:', e)
      }

      // Only apply and notify if the cloud data is actually different from the local state
      if (isSyncPayloadEqual(localPayload, cloudPayload)) {
        lastSyncedDataStr = cloudDataStr
        lastSyncTime.value = new Date()
        return
      }

      // If cloud data has not changed since the last time we synced,
      // it means any difference is due to local unsaved changes. Do not overwrite them.
      if (isSyncPayloadEqual(cloudPayload, lastSyncedPayload)) {
        lastSyncedDataStr = cloudDataStr
        lastSyncTime.value = new Date()
        return
      }

      // Cloud always wins — apply cloud data unconditionally
      const preserveShared = new URLSearchParams(window.location.search).has('s')
      applySaveDataToStores(decompressed, preserveShared)

      lastSyncedDataStr = cloudDataStr
      lastSyncTime.value = new Date()

      // Clear any pending upload since we just aligned with the cloud
      if (syncTimeout) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }

      if (isAuto) {
        addToast(t('cloudSync.autoSynced'), 'success')
      }
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      isSyncing.value = false
    }
  }

  const uploadSave = async () => {
    if (!user.value) return

    try {
      isSyncing.value = true
      const payloadObj = getLocalStatePayload()
      const currentDataStr = JSON.stringify(payloadObj)
      let lastSyncedPayload = null
      try {
        lastSyncedPayload = lastSyncedDataStr ? JSON.parse(lastSyncedDataStr) : null
      } catch (e) {
        console.error('Failed to parse last synced data string:', e)
      }

      // Prevent redundant network requests if payload is identical
      if (isSyncPayloadEqual(payloadObj, lastSyncedPayload)) {
        isSyncing.value = false
        return
      }

      const base64Payload = compressSaveData(payloadObj)

      const res = await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: base64Payload }),
        keepalive: true,
      })

      if (res.status === 401) {
        user.value = null
        addToast(t('cloudSync.uploadSessionExpired'), 'error')
        return
      }
      if (!res.ok) {
        addToast(t('cloudSync.uploadFailed'), 'error')
        return
      }

      lastSyncedDataStr = currentDataStr
      lastSyncTime.value = new Date()
    } catch (e) {
      console.error('Failed to upload save:', e)
      addToast(t('cloudSync.networkError'), 'error')
    } finally {
      isSyncing.value = false
    }
  }

  const triggerAutoSync = () => {
    if (!user.value || isSyncing.value) return
    if (syncTimeout) clearTimeout(syncTimeout)

    syncTimeout = setTimeout(() => {
      syncTimeout = null
      uploadSave()
    }, 3000)
  }

  const flushSync = () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
      syncTimeout = null
      uploadSave()
    }
  }

  const triggerAutoDownload = () => {
    if (!user.value || isSyncing.value) return
    const now = new Date()
    if (lastSyncTime.value && now - lastSyncTime.value < THROTTLE_THRESHOLD) {
      return // Throttle: skip check if synced less than 5 minutes ago
    }
    downloadSave(true)
  }

  if (!isInitialized) {
    // Use Pinia $subscribe instead of the expensive deep watch
    Object.values(stores).forEach((store) => {
      store.$subscribe(() => {
        if (!isSyncing.value) {
          triggerAutoSync()
        }
      })
    })

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushSync()
      } else if (document.visibilityState === 'visible') {
        triggerAutoDownload()
      }
    })
    window.addEventListener('focus', () => {
      triggerAutoDownload()
    })

    // Let App.vue call initSync() directly
    isInitialized = true
  }

  return { user, isSyncing, lastSyncTime, uploadSave, downloadSave, initSync }
}
