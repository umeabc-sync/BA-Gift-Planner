import { getAssetsFile } from './getAssetsFile'

export function getAvatarUrl(id) {
  if (id === null || id === undefined) return ''
  return getAssetsFile(`img/avatar/${id}.webp`)
}
