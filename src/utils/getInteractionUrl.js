import { getAssetsFile } from './getAssetsFile'

export function getInteractionUrl(interact) {
  if (interact === null || interact === undefined) return ''
  return getAssetsFile(`icon/interaction/interaction_${interact}.webp`)
}
