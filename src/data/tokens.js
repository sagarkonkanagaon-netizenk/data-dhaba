// SQL badges: elite, carved collectibles, each with its own shape and name. Each one is worked out from saved progress, review state
// and mock-round history, so a token can never be faked by clicking around.
import { dailyStreakOf, bestDailyStreak } from '../lib/streaks.js'

// metal: [light, mid, dark, rim-dark, glow]
export const METALS = {
  bronze: ['#ffd0a8', '#c97b45', '#7a3f1d', '#4d250f', 'rgba(232,140,80,.55)'],
  silver: ['#ffffff', '#c3ccd8', '#6f7a8a', '#3e4652', 'rgba(200,215,235,.6)'],
  gold: ['#fff4b8', '#f2b52c', '#a8650a', '#5c3404', 'rgba(255,196,40,.7)'],
  platinum: ['#f4fbff', '#9fd8e8', '#3f7f95', '#1d4351', 'rgba(140,225,245,.65)'],
  diamond: ['#ffffff', '#c9b8ff', '#6a4bd6', '#2c1a73', 'rgba(170,140,255,.75)'],
  emerald: ['#c6ffe9', '#2ec98f', '#0b6b47', '#043823', 'rgba(46,201,143,.6)'],
  ruby: ['#ffc2cf', '#e8366f', '#8a0f37', '#4d061d', 'rgba(232,54,111,.65)'],
  sapphire: ['#d2e4ff', '#4f8cff', '#173f9c', '#0a1f52', 'rgba(79,140,255,.65)'],
}

// Each token lists its requirements as [label, have, need]. All must be met.
export const TOKENS = [
  { id: 'sql-bronze', metal: 'bronze', shape: 'scallop', emblem: 'chai', rank: 1, big: '50', small: 'SOLVED', name: 'Bronze badge', title: 'Chai Coder', desc: '50 SQL problems solved',
    req: (s) => [['SQL problems solved', s.sql, 50]] },
  { id: 'sql-silver', metal: 'silver', shape: 'hex', emblem: 'tandoor', rank: 2, big: '100', small: 'SOLVED', name: 'Silver badge', title: 'Query Tandoor', desc: '100 SQL problems solved',
    req: (s) => [['SQL problems solved', s.sql, 100]] },
  { id: 'sql-gold', metal: 'gold', shape: 'thali', emblem: 'join', rank: 3, gem: ['#ff3b5c', '#7a0a26'], big: '250', small: 'SOLVED', name: 'Gold badge', title: 'Golden Thali', desc: '250 SQL problems solved',
    req: (s) => [['SQL problems solved', s.sql, 250]] },
  { id: 'sql-platinum', metal: 'platinum', shape: 'shield', emblem: 'crown', rank: 4, gem: ['#3dffb0', '#0b6b47'], big: '500', small: 'SOLVED', name: 'Platinum badge', title: 'Pipeline Maharaja', desc: '500 SQL problems solved',
    req: (s) => [['SQL problems solved', s.sql, 500]] },
  { id: 'sql-diamond', metal: 'diamond', shape: 'gem', emblem: 'facets', rank: 5, gem: ['#ff6ec7', '#5a1a8a'], big: '1000', small: 'SOLVED', name: 'Diamond badge', title: 'Kohinoor of Queries', desc: '1,000 SQL problems solved',
    req: (s) => [['SQL problems solved', s.sql, 1000]] },
  { id: 'streak-100', metal: 'emerald', shape: 'sun', emblem: 'sunrise', rank: 4, gem: ['#ffd84d', '#a8650a'], big: '100', small: 'DAYS', name: 'Emerald badge', title: 'Hundred Sunrises', desc: 'Daily SQL solved 100 days in a row',
    req: (s) => [['Best daily SQL streak (days)', s.best, 100]] },
  { id: 'mock-10', metal: 'ruby', shape: 'seal', emblem: 'letter', rank: 4, gem: ['#ffd84d', '#a8650a'], big: '10', small: 'HIRES', name: 'Ruby badge', title: 'Offer Letter Seal', desc: '10 timed mock rounds with a Strong hire signal',
    req: (s) => [['Strong hire mock rounds', s.strong, 10]] },
  { id: 'patterns-25', metal: 'sapphire', shape: 'rangoli', emblem: 'weave', rank: 4, gem: ['#ffffff', '#6a4bd6'], big: '25', small: 'PATTERNS', name: 'Sapphire badge', title: 'Pattern Weaver', desc: 'All 25 SQL patterns mastered: a problem of each passed 3 spaced reviews',
    req: (s) => [['Patterns mastered in spaced review', s.mastered, 25]] },
]

export const TOKEN_BY_ID = Object.fromEntries(TOKENS.map((t) => [t.id, t]))

function readJson(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d } catch (e) { return d } }

// Counts every token needs: progress, mock-round history and spaced-review boxes.
export function tokenStats(p, patternOf = {}) {
  const solved = Object.entries(p.sql).filter(([, v]) => v === 'solved').map(([k]) => Number(k))
  const mocks = readJson('dd:mock-history', [])
  const review = readJson('dd:sql-review', {})
  const mastered = new Set(Object.entries(review).filter(([, v]) => v.box >= 3).map(([n]) => patternOf[n] && patternOf[n].id).filter(Boolean))
  return {
    sql: solved.length,
    daily: dailyStreakOf(p.checks),
    best: bestDailyStreak(p.checks),
    hire: mocks.filter((h) => h.score >= 65).length,
    strong: mocks.filter((h) => h.score >= 85).length,
    mastered: mastered.size,
  }
}

export function tokensOf(p, patternOf) {
  const s = tokenStats(p, patternOf)
  return TOKENS.map((t) => {
    const reqs = t.req(s).map(([label, have, need]) => ({ label, have: Math.min(have, need), need, ok: have >= need }))
    const pct = Math.round(100 * Math.min(...reqs.map((r) => r.have / r.need)))
    return { ...t, reqs, pct, earned: reqs.every((r) => r.ok) }
  })
}
