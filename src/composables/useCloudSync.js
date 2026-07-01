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

  // 取得當前的完整狀態
  const getCurrentStatePayload = () => {
    return {
      student: JSON.stringify(stores.student.$state),
      gift: JSON.stringify(stores.gift.$state),
      giftPlanner: JSON.stringify(stores.giftPlanner.$state),
      setting: JSON.stringify(stores.setting.$state),
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
      isSyncing.value = true // 上鎖，防止觸發 auto sync
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

      // 使用 $patch 批次更新，並且因為 isSyncing 為 true，不會觸發上傳
      if (parsed.student) stores.student.$patch(JSON.parse(parsed.student))
      if (parsed.gift) stores.gift.$patch(JSON.parse(parsed.gift))
      if (parsed.giftPlanner) stores.giftPlanner.$patch(JSON.parse(parsed.giftPlanner))
      if (parsed.setting) stores.setting.$patch(JSON.parse(parsed.setting))
    } catch (e) {
      console.error('Failed to download save:', e)
    } finally {
      // 縮短延遲，或者等待下一個 tick
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

      // 高效的 Base64 轉換
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

  // 使用 Pinia $subscribe 替換昂貴的 deep watch
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
