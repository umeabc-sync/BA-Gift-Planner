export function getPreferenceValue(student, gift) {
  const giftType = gift.isSsr ? 'ssr' : 'sr'
  const favorData = student.favor[giftType]
  if (favorData.xl.includes(gift.id)) return gift.isSsr ? 240 : 80
  if (favorData.l.includes(gift.id)) return gift.isSsr ? 180 : 60
  if (favorData.m && favorData.m.includes(gift.id)) return 40
  return gift.isSsr ? 120 : 20
}
