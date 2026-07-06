import pako from 'pako'

/**
 * Compresses an array of student IDs using a bitmask, optionally inverting it,
 * followed by deflateRaw compression and Base64 encoding.
 *
 * @param {number[]} studentIds - The list of selected student IDs
 * @param {number[]} allStudentIds - The list of all available student IDs
 * @returns {string} The base64-encoded compressed string
 */
export function compressStudentIds(studentIds, allStudentIds) {
  if (!studentIds || studentIds.length === 0) return ''
  if (!allStudentIds || allStudentIds.length === 0) return studentIds

  const maxId = Math.max(...allStudentIds)
  const unselectedIds = allStudentIds.filter((id) => !studentIds.includes(id))

  const useUnselected = studentIds.length > unselectedIds.length
  const idsToEncode = useUnselected ? unselectedIds : studentIds

  const flag = useUnselected ? 2 : 1
  const bitfieldSize = Math.floor(maxId / 8) + 1
  const buffer = new ArrayBuffer(1 + 2 + bitfieldSize)
  const view = new DataView(buffer)

  view.setUint8(0, flag)
  view.setUint16(1, maxId, true) // little-endian

  const bitfield = new Uint8Array(buffer, 3)
  for (const id of idsToEncode) {
    const byteIndex = Math.floor(id / 8)
    const bitIndex = id % 8
    if (byteIndex < bitfieldSize) {
      bitfield[byteIndex] |= 1 << bitIndex
    }
  }

  const compressed = pako.deflateRaw(new Uint8Array(buffer))
  const binaryString = String.fromCharCode.apply(null, Array.from(compressed))
  return btoa(binaryString)
}

/**
 * Decompresses a base64 string back into an array of student IDs.
 *
 * @param {string} compressedStr - The base64-encoded compressed string
 * @param {number[]} allStudentIds - The list of all available student IDs to filter and validate
 * @returns {number[]} The array of decompressed student IDs
 */
export function decompressStudentIds(compressedStr, allStudentIds) {
  if (!compressedStr) return []

  // 1. Backwards Compatibility: Handle raw arrays
  if (Array.isArray(compressedStr)) {
    if (allStudentIds && allStudentIds.length > 0) {
      const allSet = new Set(allStudentIds)
      return compressedStr.filter((id) => allSet.has(id))
    }
    return compressedStr
  }

  // 2. Backwards Compatibility: Handle JSON-stringified arrays
  if (typeof compressedStr === 'string') {
    const trimmed = compressedStr.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          if (allStudentIds && allStudentIds.length > 0) {
            const allSet = new Set(allStudentIds)
            return parsed.filter((id) => allSet.has(id))
          }
          return parsed
        }
      } catch {
        // Fall back to base64 decompression
      }
    }
  }

  // 3. Decompression & Decoding with Graceful Error Handling
  try {
    const binaryString = atob(compressedStr)
    const compressed = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      compressed[i] = binaryString.charCodeAt(i)
    }

    const decompressed = pako.inflateRaw(compressed)
    
    // 4. TypedArray Offset Safety: Specify byteOffset and byteLength explicitly
    const view = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength)
    const flag = view.getUint8(0)
    const maxId = view.getUint16(1, true)
    const bitfield = new Uint8Array(decompressed.buffer, decompressed.byteOffset + 3, decompressed.byteLength - 3)

    const idsFromBitfield = []
    for (let i = 1; i <= maxId; i++) {
      const byteIndex = Math.floor(i / 8)
      const bitIndex = i % 8
      if ((bitfield[byteIndex] >> bitIndex) & 1) {
        idsFromBitfield.push(i)
      }
    }

    let result = []
    if (flag === 1) {
      result = idsFromBitfield
    } else if (flag === 2) {
      const allIdsInUrl = Array.from({ length: maxId }, (_, i) => i + 1)
      result = allIdsInUrl.filter((id) => !idsFromBitfield.includes(id))
    }

    if (allStudentIds && allStudentIds.length > 0) {
      const allSet = new Set(allStudentIds)
      return result.filter((id) => allSet.has(id))
    }
    return result
  } catch (error) {
    console.warn('Failed to decompress student IDs:', error)
    return []
  }
}

