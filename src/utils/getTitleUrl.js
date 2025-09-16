import { getAssetsFile } from './getAssetsFile'

export function getTitleUrl(locale, theme, isMobile) {
  if (locale === null || locale === undefined) return ''

  const fileName = isMobile ? 'mobile' : locale
  const themeSuffix = theme === 'light' ? '' : '_d'

  return getAssetsFile(`img/title/${fileName}${themeSuffix}.webp`)
}
