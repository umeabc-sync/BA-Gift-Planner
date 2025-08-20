import { useFetch } from '@vueuse/core'
import { getAssetsFile } from './getAssetsFile'
import { computed } from 'vue'

export function useStudentData() {
  const url = computed(() => getAssetsFile('data/student.json'))
  const { isFetching, error, data } = useFetch(url, { refetch: true }).json()

  return { isFetching, error, data }
}
