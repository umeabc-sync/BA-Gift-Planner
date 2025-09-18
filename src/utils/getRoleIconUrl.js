import { getAssetsFile } from './getAssetsFile'

export function getRoleIconUrl(role) {
  if (!role) return ''
  return getAssetsFile(`icon/role/${role}.webp`)
}
