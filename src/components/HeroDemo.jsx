import { useEffect, useRef, useState } from 'react'
import './herodemo.css'

// The product, playing on its own on the home page: a SQL problem checked in the browser,
// the Spark Visualizer, and an incident drill. A scripted preview of real screens, so it
// costs nothing to load (the real engines load only when a learner opens a lab).

const SQL = `SELECT dept_id, name, salary
FROM (
  SELECT *, RANK() OVER (
    PARTITION BY dept_id ORDER BY salary DESC) AS r
  FROM emp) t
WHERE r = 1;`
const RESULT = [['1', 'Asha', '2,50,000'], ['2', 'Pooja', '1,50,000'], ['3', 'Imran', '1,30,000']]

const SCENES = ['SQL Lab', 'Spark', 'Incident']
const DUR = [9000, 7000, 8000]

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!m) return
    setR(m.matches)
    const f = () => setR(m.matches)
    m.addEventListener?.('change', f)
    return () => m.removeEventListener?.('change', f)
  }, [])
  return r
}

function SqlScene({ t, still }) {
  const typed = still ? SQL.length : Math.min(SQL.length, Math.floor(t / 22))
  const done = still || t > SQL.length * 22 + 700
  const rows = still ? 3 : Math.max(0, Math.min(3, Math.floor((t - SQL.length * 22 - 900) / 260)))
  const ok = still || t > SQL.length * 22 + 1900
  return (
    <div className="hd-sql">
      <div className="hd-q">
        <span className="hd-chip">Question 10 · Basics &amp; joins</span>
        <b>Highest-paid employee(s) in each department</b>
        <span className="hd-tables"><code>emp</code> 14 rows · <code>dept</code> 4 rows</span>
      </div>
      <pre className="hd-code" aria-label="SQL being written">{SQL.slice(0, typed)}<span className="hd-caret" /></pre>
      <div className="hd-bar"><span className={'hd-btn' + (done ? ' press' : '')}>Check answer</span><span className="hd-ms">{done ? 'Checked by DuckDB in your browser' : 'Ctrl + Enter to run'}</span></div>
      <table className="hd-res">
        <thead><tr><th>dept_id</th><th>name</th><th>salary</th></tr></thead>
        <tbody>{RESULT.map((r, i) => <tr key={r[1]} className={i < rows ? 'in' : ''}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}</tbody>
      </table>
      <div className={'hd-verdict' + (ok ? ' in' : '')}>✓ Correct. Your result matches. <b>+20 XP</b></div>
    </div>
  )
}

function SparkScene({ t, still }) {
  const salted = still || t > 3200
  const before = [16, 4, 2, 2]
  const after = [7, 6, 6, 5]
  const v = salted ? after : before
  return (
    <div className="hd-spark">
      <div className="hd-q"><span className="hd-chip">Spark Visualizer · Skew</span><b>Why does one task take forever?</b></div>
      <div className="hd-parts">
        {v.map((n, i) => (
          <div key={i} className={'hd-part' + (n === Math.max(...v) && !salted ? ' hot' : '')}>
            <span>Partition {i + 1}</span>
            <div className="hd-dots">{Array.from({ length: 16 }, (_, j) => <i key={j} className={j < n ? (i === 0 || (salted && j < 4) ? 'a' : 'b') : ''} />)}</div>
          </div>
        ))}
      </div>
      <div className="hd-tasks">
        {v.map((n, i) => <div key={i} className="hd-task"><span>Task {i + 1}</span><i style={{ width: `${(n / 16) * 100}%` }} className={!salted && i === 0 ? 'slow' : ''} /></div>)}
      </div>
      <div className="hd-stats">
        <span>Stage time vs even split</span><b className={salted ? 'ok' : 'bad'}>{salted ? '1.2×' : '2.7×'}</b>
        <span className="hd-switch">{salted ? 'Salted: key A spread over 4 partitions' : 'Key A holds 16 of 24 rows'}</span>
      </div>
    </div>
  )
}

const STEPS = [
  ['Read the page', 'revenue for 2 March is 0, bronze still loading'],
  ['Find the cause', 'upstream renamed amount → order_amount'],
  ['Fix the query', 'COALESCE both JSON fields, all 5 orders back'],
  ['Stop it recurring', 'schema check in bronze + a data contract'],
]
function IncidentScene({ t, still }) {
  const shown = still ? STEPS.length : Math.max(0, Math.min(STEPS.length, Math.floor((t - 900) / 1300)))
  return (
    <div className="hd-inc">
      <div className="hd-page"><span className="hd-p1">P2</span><div><b>silver.orders: revenue for 2 March is ₹0</b><span>Incident drill · Schema drift</span></div><span className="hd-clock">paged</span></div>
      <ol className="hd-steps">
        {STEPS.map(([a, b], i) => <li key={a} className={i < shown ? 'in' : ''}><span className="hd-tick">{i < shown ? '✓' : i + 1}</span><div><b>{a}</b><span>{b}</span></div></li>)}
      </ol>
      <div className={'hd-verdict' + (shown === STEPS.length ? ' in' : '')}>✓ Resolved. <b>+50 XP</b> and the <b>Firefighter</b> badge</div>
    </div>
  )
}

export default function HeroDemo() {
  const still = useReducedMotion()
  const [scene, setScene] = useState(0)
  const [t, setT] = useState(0)
  const [paused, setPaused] = useState(false)
  const [run, setRun] = useState(0)
  const pausedRef = useRef(false)
  pausedRef.current = paused
  useEffect(() => {
    if (still) return
    let raf, last = performance.now(), el = 0
    const tick = (now) => {
      if (!pausedRef.current) el += now - last
      last = now
      if (el > DUR[scene]) { setScene((s) => (s + 1) % SCENES.length); return }
      setT(el)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scene, still, run])
  const pick = (i) => { setT(0); setScene(i); setRun((r) => r + 1) }
  return (
    <div className="hd" onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hd-top">
        <span className="hd-lights" aria-hidden="true"><i /><i /><i /></span>
        <div className="hd-tabs" role="tablist" aria-label="Product preview">
          {SCENES.map((s, i) => (
            <button key={s} role="tab" aria-selected={i === scene} className={i === scene ? 'on' : ''} onClick={() => pick(i)}>
              {s}{i === scene && !still && <i className="hd-prog" style={{ width: `${Math.min(100, (t / DUR[i]) * 100)}%` }} />}
            </button>
          ))}
        </div>
        <span className="hd-url">datadhaba.in</span>
      </div>
      <div className="hd-body" key={scene + '-' + run}>
        {scene === 0 && <SqlScene t={t} still={still} />}
        {scene === 1 && <SparkScene t={t} still={still} />}
        {scene === 2 && <IncidentScene t={t} still={still} />}
      </div>
    </div>
  )
}
