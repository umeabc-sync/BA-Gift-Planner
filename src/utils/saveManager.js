import pako from 'pako'
import { getSyncStores } from '@/config/syncStores'
import { decompressStudentIds } from './studentIdsCompressor'

// Lightweight deep comparison helper for standard JSON-serializable structures
function deepEqual(a, b) {
  if (a === b) return true
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false
      }
      return true
    }
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }
    return true
  }
  return false
}

/**
 * Compares two sync payloads for semantic equality.
 * Uses a fast path (string comparison) first, then falls back to deep comparison.
 * @param {Object} payloadA
 * @param {Object} payloadB
 * @returns {boolean}
 */
export function isSyncPayloadEqual(payloadA, payloadB) {
  if (!payloadA || !payloadB) return false

  // Fast path: string comparison (exact same serialization and key order)
  if (JSON.stringify(payloadA) === JSON.stringify(payloadB)) {
    return true
  }

  // Slow path: parse sub-store JSON values (strings or objects) and compare deeply
  try {
    const resolve = (val) => (typeof val === 'string' ? JSON.parse(val || '{}') : val || {})
    const parse = (p) => ({
      student: resolve(p.student),
      gift: resolve(p.gift),
      giftPlanner: resolve(p.giftPlanner),
      setting: resolve(p.setting),
    })
    return deepEqual(parse(payloadA), parse(payloadB))
  } catch (e) {
    console.error('Failed to parse payloads for deep comparison:', e)
    return false
  }
}

export function getLocalStatePayload() {
  const getParsedOrEmpty = (key) => {
    try {
      const val = localStorage.getItem(key)
      return val ? JSON.parse(val) : {}
    } catch (e) {
      console.error(`Failed to parse localStorage key ${key}:`, e)
      return {}
    }
  }
  return {
    version: 2,
    student: getParsedOrEmpty('student'),
    gift: getParsedOrEmpty('gift'),
    giftPlanner: getParsedOrEmpty('giftPlanner'),
    setting: getParsedOrEmpty('setting'),
  }
}

export function compressSaveData(payloadObj) {
  const jsonString = JSON.stringify(payloadObj)
  const compressedBytes = pako.deflate(jsonString)
  return btoa(
    Array.from(compressedBytes)
      .map((byte) => String.fromCharCode(byte))
      .join('')
  )
}

export function decompressSaveData(base64Payload) {
  const binaryString = atob(base64Payload)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return pako.inflate(bytes, { to: 'string' })
}

export function applySaveDataToStores(jsonString, preserveSharedSelection = false) {
  const parsed = JSON.parse(jsonString)
  const stores = getSyncStores()

  const resolveDataObj = (val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch (e) {
        console.error('Failed to parse legacy sub-store string:', e)
        return {}
      }
    }
    return val || {}
  }

  if (parsed.student) {
    const studentData = resolveDataObj(parsed.student)
    const allStudentIds = stores.student.studentsData?.map((s) => s.id) || []

    if (studentData.selectedStudentIds && typeof studentData.selectedStudentIds === 'string') {
      studentData.selectedStudentIds = decompressStudentIds(studentData.selectedStudentIds, allStudentIds)
    }

    if (studentData.savedCombinations) {
      studentData.savedCombinations.forEach((combo) => {
        if (typeof combo.studentIds === 'string') {
          combo.studentIds = decompressStudentIds(combo.studentIds, allStudentIds)
        }
      })
    }

    if (preserveSharedSelection) {
      studentData.selectedStudentIds = stores.student.selectedStudentIds
    }

    stores.student.$patch(studentData)
  }
  if (parsed.gift) {
    const giftData = resolveDataObj(parsed.gift)
    if (giftData.quantities !== undefined) {
      stores.gift.quantities = giftData.quantities
    }
  }
  if (parsed.giftPlanner) {
    const plannerData = resolveDataObj(parsed.giftPlanner)
    stores.giftPlanner.$patch(plannerData)
  }
  if (parsed.setting) {
    const settingData = resolveDataObj(parsed.setting)
    stores.setting.$patch(settingData)
  }
}

export function generateExportFile() {
  const payloadObj = getLocalStatePayload()
  const base64Payload = compressSaveData(payloadObj)

  const exportData = {
    payload: base64Payload,
    version: 2,
    date: new Date().toISOString(),
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', `ba-gift-planner-backup-${new Date().toISOString().split('T')[0]}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (!importedData.payload) {
          throw new Error('Invalid backup file format. Missing payload.')
        }

        const decompressed = decompressSaveData(importedData.payload)
        applySaveDataToStores(decompressed)

        resolve()
      } catch (error) {
        console.error('Import failed:', error)
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsText(file)
  })
}
