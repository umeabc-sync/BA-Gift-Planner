import { ref, onMounted } from 'vue'
import { useStudentStore } from '@/store/student'
import { useGiftStore } from '@/store/gift'
import { useGiftPlannerStore } from '@/store/giftPlanner'
import { useSettingStore } from '@/store/setting'
import pako from 'pako'

export function useCloudSync() {
  const stores = {
    student: useStudentStore(),
    gift: useGiftStore(),
    giftPlanner: useGiftPlannerStore(),
    setting: useSettingStore(),
  }

  const isSyncing = ref(false)
  const lastSyncTime = ref(null)
  const user = ref(null)
  let syncTimeout = null

  // Get the current complete state
  const getCurrentStatePayload = () => {
    return {
      student: localStorage.getItem('student') || '{}',
      gift: localStorage.getItem('gift') || '{}',
      giftPlanner: localStorage.getItem('giftPlanner') || '{}',
      setting: localStorage.getItem('setting') || '{}',
    }
  }

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

  const downloadSave = async () => {
    try {
      isSyncing.value = true // Lock to prevent auto sync from being triggered
      const res = await fetch('/api/sync/download')
      if (!res.ok) return

      const data = await res.json()
      if (!data.payload) return

      const binaryString = atob(data.payload)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const decompressed = pako.inflate(bytes, { to: 'string' })
      const currentPayloadStr = JSON.stringify(getCurrentStatePayload())

      if (decompressed === currentPayloadStr) return

      const parsed = JSON.parse(decompressed)

      // Updates are done in batches using $patch, and because isSyncing is true, uploads are not triggered
      if (parsed.student) stores.student.$patch(JSON.parse(parsed.student))
      if (parsed.gift) stores.gift.$patch(JSON.parse(parsed.gift))
      if (parsed.giftPlanner) stores.giftPlanner.$patch(JSON.parse(parsed.giftPlanner))
      if (parsed.setting) stores.setting.$patch(JSON.parse(parsed.setting))
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      // Shorten the delay, or wait for the next tick.
      setTimeout(() => {
        isSyncing.value = false
      }, 100)
    }
  }

  const uploadSave = async () => {
    if (!user.value) return

    try {
      isSyncing.value = true
      const payloadObj = getCurrentStatePayload()

      const jsonString = JSON.stringify(payloadObj)
      const compressedBytes = pako.deflate(jsonString)

      const base64Payload = btoa(
        Array.from(compressedBytes)
          .map((byte) => String.fromCharCode(byte))
          .join('')
      )

      await fetch('/api/sync/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: base64Payload }),
      })

      lastSyncTime.value = new Date()
    } catch (e) {
      console.error('Failed to upload save:', e)
    } finally {
      isSyncing.value = false
    }
  }

  const triggerAutoSync = () => {
    if (!user.value || isSyncing.value) return
    if (syncTimeout) clearTimeout(syncTimeout)

    syncTimeout = setTimeout(() => {
      uploadSave()
    }, 3000)
  }

  // Use Pinia $subscribe instead of the expensive deep watch
  Object.values(stores).forEach((store) => {
    store.$subscribe(() => {
      if (!isSyncing.value) triggerAutoSync()
    })
  })

  onMounted(() => {
    initSync()
  })

  return { user, isSyncing, lastSyncTime, uploadSave, downloadSave }
}
