import { getAssetsFile } from './getAssetsFile'

export function getGiftUrl(id, ssr = false) {
  if (id === null || id === undefined) return ''

  if (ssr) {
    return getAssetsFile(`img/gift/favor_ssr_${id}.webp`)
  } else {
    return getAssetsFile(`img/gift/favor_${id}.webp`)
  }
}
