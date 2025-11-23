import { getPreferenceValue } from './getPreferenceValue'

export function analyzeGift(gift, showOnlyOptimal, selectedStudents) {
  const preferences = selectedStudents.map((student) => ({
    student,
    value: getPreferenceValue(student, gift),
  }))
  const maxValue = Math.max(0, ...preferences.map((p) => p.value))

  const analysis = {
    isRecommended: false,
    isGeneric: false,
    shouldSynthesize: false,
    maxValue,
  }

  const baseThreshold = gift.isSsr ? 180 : 40

  if (maxValue < baseThreshold) {
    if (gift.isSsr) {
      analysis.isGeneric = true
    } else {
      analysis.shouldSynthesize = true
    }
    return analysis
  }

  const potentialCharacters = preferences
    .filter((p) => p.value >= baseThreshold)
    .map((p) => ({
      ...p.student,
      isOptimal: p.value === maxValue,
      value: p.value,
    }))

  const finalCharacters = showOnlyOptimal
    ? potentialCharacters.filter((c) => c.isOptimal)
    : potentialCharacters.sort((a, b) => b.value - a.value)

  if (finalCharacters.length === 0) {
    if (gift.isSsr) analysis.isGeneric = true
    else analysis.shouldSynthesize = true
    return analysis
  }

  analysis.isRecommended = true
  analysis.characters = finalCharacters

  if (gift.isSsr) {
    if (maxValue >= 240) {
      analysis.class = 'rec-extra'
      analysis.typeTextKey = 'app.analysis.recExtra'
      analysis.titleKey = 'app.analysis.extraChoice'
      analysis.titleValue = maxValue
    } else {
      // >= 180
      analysis.class = 'rec-best'
      analysis.typeTextKey = 'app.analysis.recBest'
      analysis.titleKey = 'app.analysis.bestChoice'
      analysis.titleValue = maxValue
    }
  } else {
    // SR
    if (maxValue >= 80) {
      analysis.class = 'rec-extra'
      analysis.typeTextKey = 'app.analysis.recExtra'
      analysis.titleKey = 'app.analysis.extraChoice'
      analysis.titleValue = maxValue
    } else if (maxValue >= 60) {
      analysis.class = 'rec-best'
      analysis.typeTextKey = 'app.analysis.recBest'
      analysis.titleKey = 'app.analysis.bestChoice'
      analysis.titleValue = maxValue
    } else {
      // >= 40
      analysis.class = 'rec-good'
      analysis.typeTextKey = 'app.analysis.recGood'
      analysis.titleKey = 'app.analysis.goodChoice'
      analysis.titleValue = maxValue
    }
  }

  return analysis
}
