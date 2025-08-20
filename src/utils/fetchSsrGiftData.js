import { useFetch } from '@vueuse/core'
import { getAssetsFile } from './getAssetsFile'
import { computed } from 'vue'

export function useSsrGiftData(language) {
  const url = computed(() => getAssetsFile(`data/gift/ssr/${language.value}.json`))
  const { isFetching, error, data } = useFetch(url, { refetch: true }).json()

  return { isFetching, error, data }
}
