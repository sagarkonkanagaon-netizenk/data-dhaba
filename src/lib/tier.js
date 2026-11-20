// Free vs Pro. Free gives the start of everything; Pro gives the finish.
//
// Payments switch on with the Razorpay key id the site is built with (VITE_RAZORPAY_KEY_ID, public by design):
//   rzp_live_…  -> Pro is on sale to everyone and the free limits below apply.
//   rzp_test_…  -> nothing changes for visitors; the checkout shows only on /pro?test=1, for testing.
//   (none)      -> waitlist only, as before.
// A preview build can turn the locks on without payments with VITE_PRO_LOCKS=on.
//
// Who has Pro is decided by the database (has_pro / my_pro in supabase/payments.sql). The copy kept here only
// decides what the page shows; the Pro project files themselves are served only to accounts the database says have Pro.
export const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
export const PAYMENTS_LIVE = /^rzp_live_/.test(RZP_KEY)
export const PAYMENTS_TEST = /^rzp_test_/.test(RZP_KEY)
export const LOCKS_ON = PAYMENTS_LIVE || import.meta.env.VITE_PRO_LOCKS === 'on'

export const FREE = {
  chapters: 2,            // first 2 chapters of every handbook
  sql: 5,                 // SQL Lab: sample problems 1..5 free, the rest Pro
  py: 3,                  // Python Lab: sample problems 1..3 free, the rest Pro
  spark: ['partitions', 'shuffle'],
  drills: ['schema-drift'],
  weeks: 2,               // 24-week path: weeks 1 and 2
  atlas: ['databricks', 'spark', 'kafka'],
}

// ---- the signed-in learner's Pro status, refreshed from the database ----
export const TIER_EVENT = 'dd:tier'
const KEY = 'dd:pro'
const NONE = { pro: false, owner: false, until: null }
let tier = (() => { try { return { ...NONE, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch (e) { return NONE } })()

export function getTier() { return tier }
export function hasPro() { return Boolean(tier.pro) }
export function setTier(next) {
  const t = next ? { pro: Boolean(next.pro), owner: Boolean(next.owner), until: next.until || null } : NONE
  const changed = t.pro !== tier.pro || t.owner !== tier.owner || t.until !== tier.until
  tier = t
  try { if (t.pro || t.until) localStorage.setItem(KEY, JSON.stringify(t)); else localStorage.removeItem(KEY) } catch (e) { /* ignore */ }
  if (changed) { try { window.dispatchEvent(new Event(TIER_EVENT)) } catch (e) { /* ignore */ } }
}

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
    case 'datasets': return true   // the practice-tables guide is Pro
    default: return false
  }
}
