import { useFetch } from '@vueuse/core'
import { getAssetsFile } from './getAssetsFile'
import { computed } from 'vue'

export function useStudentData(language) {
  const url = computed(() => getAssetsFile(`data/student/${language.value}.json`))
  const { isFetching, error, data } = useFetch(url, { refetch: true }).json()

  return { isFetching, error, data }
}
