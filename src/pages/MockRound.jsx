import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../content/sql-questions.json'
import CodeEditor from '../components/CodeEditor.jsx'
import ResultTable from '../components/ResultTable.jsx'
import { parseSchema } from '../lib/schema.js'
import { runIsolated, compareResults } from '../lib/duck.js'
import { setIn, getProgress } from '../lib/progress.js'
import { PATTERN_OF } from '../data/sqlPatterns.js'
import { recordResult } from '../lib/review.js'
import './mockround.css'

// Timed mock interview rounds: a few problems, one clock, no hints, then a scorecard
// that reads like interviewer feedback. Problems are checked by DuckDB in the browser.

const QS = data.questions.filter((q) => q.mode === 'check')
const BY = (secs) => QS.filter((q) => secs.includes(q.section))

export const ROUNDS = [
  {
    id: 'screen', name: 'Phone screen', mins: 25, icon: '📞',
    blurb: 'Two problems, the first filter most companies run. Joins, grouping and one window function.',
    pools: [['Basics & joins', 'Aggregation'], ['Window functions']],
  },
  {
    id: 'analyst', name: 'Analytics round', mins: 40, icon: '📊',
    blurb: 'Three business questions: aggregates, windows and dates. What product and analyst teams ask.',
    pools: [['Aggregation', 'Basics & joins'], ['Window functions'], ['Dates, streaks & time series', 'Classic problems']],
  },
  {
    id: 'de', name: 'Data engineer onsite', mins: 45, icon: '🏗️',
    blurb: 'Three problems from the pipeline side: dedup, incremental loads, SCD and data quality checks.',
    pools: [['Window functions', 'Dates, streaks & time series'], ['Data engineering SQL'], ['Data engineering track']],
  },
]

const HKEY = 'dd:mock-history'
function readHistory() { try { return JSON.parse(localStorage.getItem(HKEY)) || [] } catch (e) { return [] } }
function saveHistory(h) { try { localStorage.setItem(HKEY, JSON.stringify(h.slice(-30))) } catch (e) { /* ignore */ } }

// Prefer problems the learner has not solved yet, so a mock tests rather than repeats.
function pick(round) {
  const p = getProgress()
  const used = new Set()
  return round.pools.map((secs) => {
    const pool = BY(secs).filter((q) => !used.has(q.n))
    const fresh = pool.filter((q) => p.sql[q.n] !== 'solved')
    const from = fresh.length ? fresh : pool
    const q = from[Math.floor(Math.random() * from.length)]
    used.add(q.n)
    return q.n
  })
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const refCache = new Map()
function expected(q) {
  if (!refCache.has(q.n)) {
    const pr = runIsolated({ setup: q.setup, sql: q.ref, check: q.check })
    refCache.set(q.n, pr)
    pr.then((r) => { if (r.error) refCache.delete(q.n) })
  }
  return refCache.get(q.n)
}

// Interviewer-style verdict from solved count, time used and wrong submissions.
export function grade(items, secsUsed, limit) {
  const solved = items.filter((x) => x.ok).length
  const total = items.length
  const wrong = items.reduce((a, x) => a + x.wrong, 0)
  const speed = secsUsed / limit
  let score = Math.round((solved / total) * 80 + (solved ? Math.max(0, 1 - speed) * 15 : 0) + (solved ? Math.max(0, 5 - wrong) : 0))
  score = Math.min(100, score)
  const signal = score >= 85 ? ['Strong hire', 'ok'] : score >= 65 ? ['Hire', 'ok'] : score >= 45 ? ['Lean no hire', 'warn'] : ['No hire yet', 'bad']
  return { solved, total, wrong, score, signal }
}

function Setup({ onStart, history }) {
  return (
    <div className="mr-setup">
      <div className="page-head">
        <div className="eyebrow">SQL Arena · Mock rounds</div>
        <h1>Practise the real thing: <em>one clock, no hints</em></h1>
        <p>Pick a round. The timer starts when you press Start. You can run your query as often as you like, but every wrong submission is counted, just as an interviewer would notice. At the end you get a scorecard and a hiring signal.</p>
      </div>
      <div className="mr-rounds">
        {ROUNDS.map((r) => (
          <div key={r.id} className="mr-round card">
            <span className="mr-ico" aria-hidden="true">{r.icon}</span>
            <b>{r.name}</b>
            <span className="small muted">{r.pools.length} problems · {r.mins} minutes</span>
            <p className="small">{r.blurb}</p>
            <button className="btn btn-primary" onClick={() => onStart(r)}>Start {r.name.toLowerCase()}</button>
          </div>
        ))}
      </div>
      <ul className="mr-rules small muted">
        <li>No hints, no answers and no expected output until the round ends.</li>
        <li>Unsolved problems you leave get the full explanation on the scorecard.</li>
        <li>Rounds prefer problems you have not solved yet, so each one is a real test.</li>
      </ul>
      {history.length > 0 && (
        <section className="mr-hist">
          <h2>Your last rounds</h2>
          <table className="mr-table">
            <thead><tr><th>Date</th><th>Round</th><th>Solved</th><th>Time</th><th>Score</th></tr></thead>
            <tbody>
              {[...history].reverse().slice(0, 8).map((h) => (
                <tr key={h.at}><td>{new Date(h.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td><td>{h.name}</td><td>{h.solved}/{h.total}</td><td>{fmt(h.secs)}</td><td><b>{h.score}</b></td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}

function Scorecard({ round, qs, items, secs, onAgain }) {
  const g = grade(items, secs, round.mins * 60)
  return (
    <div className="mr-score">
      <div className="page-head">
        <div className="eyebrow">Scorecard · {round.name}</div>
        <h1>{g.solved} of {g.total} solved in {fmt(secs)}</h1>
      </div>
      <div className="mr-sum">
        <div className={'mr-signal ' + g.signal[1]}><span>Hiring signal</span><b>{g.signal[0]}</b></div>
        <div><span>Score</span><b>{g.score}<small>/100</small></b></div>
        <div><span>Wrong submissions</span><b>{g.wrong}</b></div>
        <div><span>Time used</span><b>{Math.round((secs / (round.mins * 60)) * 100)}%</b></div>
      </div>
      <ol className="mr-review">
        {qs.map((q, i) => {
          const it = items[i]
          const pat = PATTERN_OF[q.n]
          return (
            <li key={q.n} className={'card ' + (it.ok ? 'ok' : 'miss')}>
              <div className="spread"><b>{it.ok ? '✓' : '✗'} {q.title}</b><span className="small muted">{it.ok ? `solved at ${fmt(it.at)}` : 'not solved'}{it.wrong ? ` · ${it.wrong} wrong` : ''}</span></div>
              {pat && <span className="small">Pattern: <Link to={`/practice/patterns#${pat.id}`}>{pat.name}</Link></span>}
              {!it.ok && (
                <details className="reveal"><summary>See a model answer</summary><div className="inner"><pre><code>{q.answer}</code></pre>{q.note && <p className="small"><b>Why:</b> {q.note}</p>}</div></details>
              )}
              <Link to={`/practice/sql/${q.n}`} className="small">Open in the SQL Lab →</Link>
            </li>
          )
        })}
      </ol>
      <p className="small muted">{g.signal[1] === 'ok' ? 'Good round. Interviewers also listen to how you explain your approach, so practise saying it out loud.' : 'Review the patterns for the problems you missed, then take another round in a day or two.'}</p>
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={onAgain}>Take another round</button>
        <Link to="/practice/patterns" className="btn btn-ghost">Review the patterns</Link>
      </div>
    </div>
  )
}

function Live({ round, qs, onFinish }) {
  const limit = round.mins * 60
  const [cur, setCur] = useState(0)
  const [codes, setCodes] = useState(() => qs.map((q) => q.starter || `-- ${q.title}\n\n`))
  const [items, setItems] = useState(() => qs.map(() => ({ ok: false, wrong: 0, at: 0 })))
  const [res, setRes] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(null)
  const [secs, setSecs] = useState(0)
  const start = useRef(Date.now())
  const done = useRef(false)
  const q = qs[cur]
  const schema = useMemo(() => (q.tables.length ? parseSchema(q.setup, q.tables) : []), [q])

  const finish = (its = items) => { if (done.current) return; done.current = true; onFinish(its, Math.min(limit, Math.round((Date.now() - start.current) / 1000))) }
  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.round((Date.now() - start.current) / 1000)
      setSecs(s)
      if (s >= limit) finish()
    }, 500)
    return () => clearInterval(t)
  })
  useEffect(() => { setRes(null); setMsg(null) }, [cur])

  async function run() {
    setBusy('run'); setMsg(null)
    const r = await runIsolated({ setup: q.setup, sql: codes[cur], check: q.check })
    setRes(r); setBusy(null)
  }
  async function submit() {
    setBusy('check')
    const [r, w] = await Promise.all([runIsolated({ setup: q.setup, sql: codes[cur], check: q.check }), expected(q)])
    setRes(r); setBusy(null)
    if (r.error) { setMsg({ ok: false, t: 'Your SQL has an error. That does not count as a wrong submission.' }); return }
    const v = compareResults(r.result, w.result)
    recordResult(q.n, v.ok)
    const next = items.map((x, i) => (i !== cur ? x : v.ok ? { ...x, ok: true, at: Math.round((Date.now() - start.current) / 1000) } : { ...x, wrong: x.wrong + 1 }))
    setItems(next)
    if (v.ok) {
      if (getProgress().sql[q.n] !== 'solved') setIn('sql', q.n, 'solved')
      setMsg({ ok: true, t: 'Accepted.' })
      const open = next.findIndex((x) => !x.ok)
      if (open < 0) finish(next)
    } else {
      setMsg({ ok: false, t: 'Not accepted. The interviewer noted it. Check your logic and try again.' })
    }
  }

  const left = Math.max(0, limit - secs)
  return (
    <div className="mr-live">
      <div className="mr-bar">
        <b>{round.icon} {round.name}</b>
        <div className="mr-tabs" role="tablist" aria-label="Problems">
          {qs.map((x, i) => <button key={x.n} role="tab" aria-selected={i === cur} className={(i === cur ? 'on ' : '') + (items[i].ok ? 'ok' : '')} onClick={() => setCur(i)}>{items[i].ok ? '✓ ' : ''}Problem {i + 1}</button>)}
        </div>
        <span className={'mr-clock' + (left < 300 ? ' low' : '')} aria-live="off" aria-label="Time left">{fmt(left)}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => finish()}>End round</button>
      </div>
      <h2 className="mr-q">{q.title}</h2>
      {q.given && q.given !== '—' && !schema.length && <div className="given">{q.given}</div>}
      {schema.length > 0 && (
        <div className="mr-schema">
          {schema.map((t) => <div key={t.name}><code>{t.name}</code><span>{t.cols.map((c) => c.name).join(', ')}</span></div>)}
        </div>
      )}
      <CodeEditor value={codes[cur]} onChange={(v) => setCodes((cs) => cs.map((c, i) => (i === cur ? v : c)))} onRun={run} />
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={run} disabled={!!busy}>{busy === 'run' ? 'Running…' : '▶ Run'}</button>
        <button className="btn btn-primary" onClick={submit} disabled={!!busy || items[cur].ok}>{items[cur].ok ? 'Accepted' : busy === 'check' ? 'Submitting…' : 'Submit'}</button>
        <span className="small muted">Wrong submissions: {items[cur].wrong}</span>
      </div>
      {msg && <div className={'verdict ' + (msg.ok ? 'ok' : 'bad')} style={{ margin: '10px 0' }}><span>{msg.ok ? '✅' : '❌'}</span><div>{msg.t}</div></div>}
      {res && (
        <div className="result" style={{ marginTop: 8 }}>
          <div className="result-head"><span>Your result {res.result ? `· ${res.result.rows.length} rows` : ''}</span><span>{Math.round(res.ms)} ms</span></div>
          {res.error ? <div className="err">{res.error}</div> : <ResultTable result={res.result} />}
        </div>
      )}
    </div>
  )
}

export default function MockRound() {
  const [state, setState] = useState({ stage: 'setup' })
  const [history, setHistory] = useState(readHistory)
  const qs = state.ns ? state.ns.map((n) => QS.find((q) => q.n === n)) : []
  const start = (round) => { setState({ stage: 'live', round, ns: pick(round), key: Date.now() }); window.scrollTo(0, 0) }
  const finish = (items, secs) => {
    const g = grade(items, secs, state.round.mins * 60)
    const h = [...readHistory(), { at: Date.now(), name: state.round.name, solved: g.solved, total: g.total, secs, score: g.score }]
    saveHistory(h); setHistory(h)
    setState((s) => ({ ...s, stage: 'score', items, secs }))
    window.scrollTo(0, 0)
  }
  return (
    <div className="page mock">
      <div className="container">
        {state.stage === 'setup' && <Setup onStart={start} history={history} />}
        {state.stage === 'live' && <Live key={state.key} round={state.round} qs={qs} onFinish={finish} />}
        {state.stage === 'score' && <Scorecard round={state.round} qs={qs} items={state.items} secs={state.secs} onAgain={() => setState({ stage: 'setup' })} />}
      </div>
    </div>
  )
}
