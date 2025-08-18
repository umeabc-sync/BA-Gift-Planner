import { getAssetsFile } from './getAssetsFile'

export async function fetchStudentData(language = 'zh-tw') {
  const response = await fetch(getAssetsFile(`data/student/${language}.json`))
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}