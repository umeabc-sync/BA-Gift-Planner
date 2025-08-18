import { getAssetsFile } from './getAssetsFile'

export function getSchoolIconUrl(school) {
  if (!school) return ''
  return getAssetsFile(`icon/school/${school}.webp`)
}