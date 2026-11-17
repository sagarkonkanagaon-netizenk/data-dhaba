// Spaced review for SQL problems. A solved problem comes back after 1, 3, 7, 21 and 60 days.
// Solve it again when it is due and it moves to the next gap; get it wrong and it starts over.
const KEY = 'dd:sql-review'
const DAY = 864e5
export const GAPS = [1, 3, 7, 21, 60]

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch (e) { return {} } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch (e) { /* ignore */ } }

export function reviewState() { return read() }

export function recordResult(n, ok, now = Date.now()) {
  const s = read()
  const cur = s[n]
  if (ok) {
    if (!cur) s[n] = { box: 0, due: now + GAPS[0] * DAY }
    else if (cur.due <= now) { const box = Math.min(cur.box + 1, GAPS.length - 1); s[n] = { box, due: now + GAPS[box] * DAY } }
    else return
  } else {
    if (!cur || cur.due > now) return
    s[n] = { box: 0, due: now + GAPS[0] * DAY }
  }
  write(s)
}

// Problems solved before spaced review existed join the queue, spread over the coming days.
export function seed(solvedNs, now = Date.now()) {
  const s = read()
  let k = 0, changed = false
  for (const n of solvedNs) if (!s[n]) { s[n] = { box: 0, due: now + Math.floor(k++ / 5) * DAY }; changed = true }
  if (changed) write(s)
  return s
}

export function dueList(s = read(), now = Date.now()) {
  return Object.entries(s).filter(([, v]) => v.due <= now).sort((a, b) => a[1].due - b[1].due).map(([n, v]) => ({ n: Number(n), ...v }))
}
