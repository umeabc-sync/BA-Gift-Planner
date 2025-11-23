import { useFetch } from '@vueuse/core'
import { getAssetsFile } from './getAssetsFile'
import { computed } from 'vue'

export function useBondExpData() {
  const url = computed(() => getAssetsFile('data/bondExpTable.json'))
  const { isFetching, error, data } = useFetch(url, { refetch: true }).json()

  return { isFetching, error, data }
}
