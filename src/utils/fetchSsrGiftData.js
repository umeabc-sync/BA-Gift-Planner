import { getAssetsFile } from './getAssetsFile'

export async function fetchSsrGiftData(language = 'zh-tw') {
  const response = await fetch(getAssetsFile(`data/gift/ssr/${language}.json`))
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}