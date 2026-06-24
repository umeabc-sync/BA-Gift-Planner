import { getAssetsFile } from './getAssetsFile'

export function getAvatarUrl(id, form = 0) {
  if (id === null || id === undefined) return ''
  const suffix = form === 1 ? '_1' : ''
  return getAssetsFile(`img/avatar/${id}${suffix}.webp`)
}
