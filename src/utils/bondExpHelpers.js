export function getTotalExpForLevel(level, bondExpTable) {
  if (!bondExpTable || !bondExpTable.length || level <= 1) return 0
  const numericLevel = Number(level)
  const levelData = bondExpTable.find((item) => item.rank === numericLevel)
  return levelData ? levelData.total : 0
}
