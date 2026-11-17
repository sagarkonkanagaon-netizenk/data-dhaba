import { useMemo, useState } from 'react'

// Spark UI simulator: one stage drawn as task bars on cores, with the same summary numbers
// the real Spark UI shows. Every case has a broken "before" and a fixed "after".

function noise(i) { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }

export function simulate(s) {
  const k = Math.max(1, Math.ceil(s.tasks / 480)) // draw at most ~480 bars
  const n = Math.ceil(s.tasks / k)
  const hot = new Map(s.hot || [])
  const fail = new Set(s.fail || [])
  const durs = Array.from({ length: n }, (_, i) => {
    let d = s.base * (1 + (s.spread ?? 0.3) * (noise(i) - 0.5)) * k
    if (hot.has(i)) d *= hot.get(i)
    return Math.max(0.01, d)
  })
  const free = Array(s.cores).fill(0)
  const bars = []
  durs.forEach((d, i) => {
    let c = 0
    for (let j = 1; j < free.length; j++) if (free[j] < free[c]) c = j
    const start = free[c]
    if (fail.has(i)) {
      bars.push({ i, c, start, d: d * 0.6, failed: true })
      free[c] = start + d * 0.6
      let c2 = 0
      for (let j = 1; j < free.length; j++) if (free[j] < free[c2]) c2 = j
      bars.push({ i, c: c2, start: free[c2], d, retry: true, hot: hot.has(i) })
      free[c2] += d
    } else {
      bars.push({ i, c, start, d, hot: hot.has(i) })
      free[c] = start + d
    }
  })
  const total = Math.max(...free)
  const sorted = [...durs].sort((a, b) => a - b).map((d) => d / k)
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))]
  return { bars, total, k, stats: { min: q(0), p25: q(0.25), med: q(0.5), p75: q(0.75), max: q(1) } }
}

const fmt = (s) => (s >= 3600 ? (s / 3600).toFixed(1) + ' h' : s >= 60 ? (s / 60).toFixed(1) + ' min' : s >= 1 ? s.toFixed(1) + ' s' : Math.round(s * 1000) + ' ms')

export function StageView({ s, label, fixed }) {
  const sim = useMemo(() => simulate(s), [s])
  const W = 640
  const lanes = Math.min(s.cores, 16)
  const laneH = lanes > 8 ? 12 : 22
  const H = 26 + lanes * (laneH + 4)
  const sc = (W - 70) / sim.total
  const idle = s.cores - Math.min(s.cores, s.tasks)
  return (
    <div className="sc-stage">
      <div className="sc-stage-h"><b>{label}</b><span>Stage time <b>{fmt(sim.total)}</b></span></div>
      <div className="sv-scroll"><svg viewBox={`0 0 ${W} ${H}`} className="sv-svg" role="img" aria-label={`${label}: ${s.tasks} tasks on ${s.cores} cores, stage takes ${fmt(sim.total)}`}>
        {Array.from({ length: lanes }, (_, c) => <text key={c} x="4" y={22 + c * (laneH + 4) + laneH * 0.75} className="sv-lane">Core {c + 1}</text>)}
        {sim.bars.filter((b) => b.c < lanes).map((b, j) => (
          <rect key={j} x={60 + b.start * sc} y={22 + b.c * (laneH + 4)} width={Math.max(1.2, b.d * sc - 0.8)} height={laneH} rx="2"
            className={'sc-bar' + (b.failed ? ' failed' : b.hot ? (fixed ? ' split' : ' hot') : '')} style={{ animationDelay: `${Math.min(1.2, (b.start / sim.total) * 1.2)}s` }} />
        ))}
        <text x={W - 4} y="12" textAnchor="end" className="sv-end-t">{s.tasks.toLocaleString('en-IN')} tasks{sim.k > 1 ? ` (1 bar = ${sim.k})` : ''}{s.cores > lanes ? ` · first ${lanes} of ${s.cores} cores` : ''}</text>
      </svg></div>
      <table className="sc-table">
        <thead><tr><th>Task time</th><th>Min</th><th>25th</th><th>Median</th><th>75th</th><th>Max</th></tr></thead>
        <tbody><tr><td>Duration</td>{['min', 'p25', 'med', 'p75', 'max'].map((x) => <td key={x} className={x === 'max' && sim.stats.max > sim.stats.med * 4 ? 'bad' : ''}>{fmt(sim.stats[x])}</td>)}</tr></tbody>
      </table>
      <div className="sv-stats">
        <div><span>Tasks</span><b>{s.tasks.toLocaleString('en-IN')}</b></div>
        <div><span>Idle cores</span><b className={idle ? 'bad' : ''}>{idle}</b></div>
        <div><span>Shuffle read</span><b>{s.shuffleGB ? s.shuffleGB + ' GB' : '0'}</b></div>
        <div><span>Spill (disk)</span><b className={s.spillGB ? 'bad' : 'ok'}>{s.spillGB ? s.spillGB + ' GB' : '0'}</b></div>
        <div><span>GC time</span><b className={s.gcPct > 20 ? 'bad' : ''}>{s.gcPct || 2}%</b></div>
        {s.fail?.length ? <div><span>Failed tasks</span><b className="bad">{s.fail.length}</b></div> : null}
      </div>
    </div>
  )
}

export default function SparkCase({ issue, d }) {
  const [pick, setPick] = useState(null)
  const [fixed, setFixed] = useState(false)
  return (
    <div className="sc">
      <div className="sc-pager"><span>🚨 On call</span>{issue.sym}</div>
      <StageView key={fixed ? 'a' : 'b'} fixed={fixed} s={fixed ? d.after : d.before} label={fixed ? 'After the fix' : 'What the Spark UI shows'} />
      <div className="sv-predict">
        <div className="sv-predict-q"><span className="sv-tag">Diagnose first</span>{d.predict.q}</div>
        <div className="sv-opts">
          {d.predict.options.map((o) => (
            <button key={o} type="button" disabled={pick !== null} onClick={() => setPick(o)}
              className={'sv-opt' + (pick === null ? '' : o === d.predict.answer ? ' ok' : o === pick ? ' bad' : ' dim')}>{o}</button>
          ))}
        </div>
      </div>
      {pick !== null && (
        <div className="sc-answer">
          <p><b>{pick === d.predict.answer ? '✅ Right.' : '❌ Not quite.'}</b> {d.cause}</p>
          <h3>The fix</h3>
          <p>{d.fix}</p>
          {d.code && <pre className="mini-code">{d.code}</pre>}
          <button type="button" className={'btn ' + (fixed ? 'btn-ghost' : 'btn-primary')} onClick={() => setFixed((f) => !f)}>{fixed ? 'Show the broken run again' : 'Apply the fix and re-run'}</button>
          {fixed && <p className="sc-gain">Stage time {fmt(simulate(d.before).total)} → <b>{fmt(simulate(d.after).total)}</b></p>}
        </div>
      )}
    </div>
  )
}
