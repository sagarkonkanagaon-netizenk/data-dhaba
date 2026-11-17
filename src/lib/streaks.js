import { dayKey, dayNumber, keyForNumber } from '../data/daily.js'

// Consecutive days with the daily SQL challenge solved, counting back from today (or yesterday).
export function dailyStreakOf(checks, today = dayKey()) {
  const solved = new Set(Object.entries(checks).filter(([k, v]) => k.startsWith('daily:') && v && v.solved && (!v.on || v.on === k.slice(6))).map(([k]) => k.slice(6)))
  let n = dayNumber(today)
  if (!solved.has(keyForNumber(n))) n--
  let s = 0
  while (n >= 1 && solved.has(keyForNumber(n))) { s++; n-- }
  return s
}

// Longest run of consecutive days with the daily SQL challenge solved, ever.
export function bestDailyStreak(checks) {
  const nums = Object.entries(checks)
    .filter(([k, v]) => k.startsWith('daily:') && v && v.solved && (!v.on || v.on === k.slice(6)))
    .map(([k]) => dayNumber(k.slice(6))).sort((a, b) => a - b)
  let best = 0, run = 0, last = null
  for (const n of nums) { run = last !== null && n === last + 1 ? run + 1 : n === last ? run : 1; last = n; best = Math.max(best, run) }
  return best
}
