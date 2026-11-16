// Free vs Pro. Free gives the start of everything; Pro gives the finish.
// Locks stay off until payments are live; a preview build can turn them on with VITE_PRO_LOCKS=on.
export const LOCKS_ON = import.meta.env.VITE_PRO_LOCKS === 'on'
export const PAYMENTS_LIVE = false

export const FREE = {
  chapters: 2,            // first 2 chapters of every handbook
  sql: 15,                // SQL Lab problems 1..15
  py: 10,                 // Python Lab problems 1..10
  spark: ['partitions', 'shuffle'],
  drills: ['schema-drift'],
  weeks: 2,               // 24-week path: weeks 1 and 2
  atlas: ['databricks', 'spark', 'kafka'],
}

// Until accounts carry a Pro flag (with payments), nobody has Pro.
export function hasPro() { return false }

export function isLocked(kind, id) {
  if (!LOCKS_ON || hasPro()) return false
  switch (kind) {
    case 'chapter': return Number(id) > FREE.chapters
    case 'sql': return Number(id) > FREE.sql
    case 'py': return Number(id) > FREE.py
    case 'spark': return !FREE.spark.includes(id)
    case 'drill': return !FREE.drills.includes(id)
    case 'week': return Number(id) > FREE.weeks
    case 'atlas': return !FREE.atlas.includes(id)
    default: return false
  }
}
