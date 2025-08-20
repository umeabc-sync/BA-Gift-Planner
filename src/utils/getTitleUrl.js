import { getAssetsFile } from './getAssetsFile'

export function getTitleUrl(locale, isMobile) {
  if (locale === null || locale === undefined) return ''
  if (isMobile) return getAssetsFile(`img/title/mobile.png`)
  return getAssetsFile(`img/title/${locale}.webp`)
}
