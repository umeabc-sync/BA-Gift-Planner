import { getAssetsFile } from './getAssetsFile'

export async function fetchSrGiftData(language = 'zh-tw') {
  const response = await fetch(getAssetsFile(`data/gift/sr/${language}.json`))
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}