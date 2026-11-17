import { useState } from 'react'
import ResultTable from './ResultTable.jsx'
import './stepthrough.css'

// Watch it run: the learner's own query, one clause at a time, in the order SQL executes it.
// Each step is a real query run by DuckDB, so the rows on screen are exactly what that stage produces.
export default function StepThrough({ data, onClose }) {
  const [i, setI] = useState(0)
  if (data.error) {
    return (
      <div className="st-box">
        <div className="st-top"><b>Watch it run</b><button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button></div>
        <div className="err">{data.error}</div>
      </div>
    )
  }
  const steps = data.steps
  const s = steps[i]
  const n = (x) => (x.r.result ? x.r.result.rows.length : null)
  const prev = i > 0 ? n(steps[i - 1]) : null
  const cur = n(s)
  const change = prev === null || cur === null ? null : cur === prev ? 'same number of rows' : `${prev} → ${cur} rows`
  return (
    <div className="st-box" aria-label="Your query, step by step">
      <div className="st-top">
        <b>Watch it run</b>
        <span className="small muted">The order SQL really runs your query. Not the order you wrote it.</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <ol className="st-rail">
        {steps.map((x, k) => (
          <li key={x.step}>
            <button className={k === i ? 'on' : k < i ? 'past' : ''} onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}>
              <span className="st-n">{k + 1}</span>{x.step}<small>{n(x) === null ? 'error' : `${n(x)} rows`}</small>
            </button>
          </li>
        ))}
      </ol>
      <div className="st-say"><b>{s.step}.</b> {s.say}{change && <span className="st-change">{change}</span>}</div>
      <details className="st-sql"><summary>The query for this step</summary><pre><code>{s.sql}</code></pre></details>
      <div className="result">
        {s.r.error ? <div className="err">{s.r.error}</div> : <ResultTable result={s.r.result} max={50} />}
      </div>
      <div className="st-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => setI(i - 1)} disabled={i === 0}>← Back</button>
        <span className="small muted">Step {i + 1} of {steps.length}</span>
        <button className="btn btn-primary btn-sm" onClick={() => setI(i + 1)} disabled={i === steps.length - 1}>Next step →</button>
      </div>
    </div>
  )
}
