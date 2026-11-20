import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import { CERT_TRACKS } from '../pro/certsPro.js'
import { useProContent } from '../lib/proContent.js'
import { NotFound } from './Misc.jsx'

// Certification prep: everyone sees the tracks and their topic areas; Pro gets the study guide and the practice
// questions, in practice mode (answer, see why, next) or exam mode (all questions, timed, scored by topic at the end).
const BEST_KEY = (id) => `dd:cert-best:${id}`
const readBest = (id) => { try { return JSON.parse(localStorage.getItem(BEST_KEY(id)) || 'null') } catch { return null } }
const saveBest = (id, pct) => { try { const b = readBest(id); if (!b || pct > b) localStorage.setItem(BEST_KEY(id), JSON.stringify(pct)) } catch { /* private mode */ } }

export function CertIndex() {
  return (
    <div className="page">
      <div className="container">
        <Link to="/pro" className="small">← Data Dhaba Pro</Link>
        <div className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">Certification prep · {CERT_TRACKS.length} tracks</div>
          <h1>Book the exam when the numbers say you're ready.</h1>
          <p>Each track has a study guide with a week-by-week plan and a bank of original practice questions, every one with the reason the right answer is right. Practise topic by topic, then sit a timed mock and see your score per topic.</p>
        </div>
        <div className="grid g2">
          {CERT_TRACKS.map((t) => {
            const best = readBest(t.id)
            return (
              <Link key={t.id} to={`/pro/certs/${t.id}`} className="card card-pad card-link cert-card">
                <div className="design-meta"><span className="chip">{t.vendor}</span><span className="small muted">{t.level} · {t.count} questions</span>{best != null && <span className="chip chip-ok">Best {best}%</span>}</div>
                <h3>{t.title}</h3>
                <ul className="cert-domains">{t.domains.map((d) => <li key={d.id}>{d.name}</li>)}</ul>
              </Link>
            )
          })}
        </div>
        <p className="small muted" style={{ marginTop: 18 }}>Independent study material, not affiliated with or endorsed by Databricks, Microsoft or AWS. Questions are written from scratch for practice; they are not taken from any real exam.</p>
      </div>
    </div>
  )
}

function shuffle(list, seed) {
  const a = [...list]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

function Practice({ track, exam, onDone }) {
  const [seed] = useState(() => Math.floor(Math.random() * 100000))
  const [domain, setDomain] = useState('all')
  const qs = useMemo(() => shuffle(exam || domain === 'all' ? track.qs : track.qs.filter((q) => q.domain === domain), seed), [track, domain, exam, seed])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState({})
  const [left, setLeft] = useState(exam ? qs.length * 90 : null)
  const finished = exam ? left === 0 || picked.done : i >= qs.length
  useEffect(() => {
    if (!exam || finished) return undefined
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [exam, finished])
  useEffect(() => { setI(0); setPicked({}) }, [domain])
  const q = qs[Math.min(i, qs.length - 1)]
  const answered = picked[q?.n] != null

  if (finished) {
    const byDomain = track.domains.map((d) => {
      const list = qs.filter((x) => x.domain === d.id)
      return { ...d, total: list.length, right: list.filter((x) => picked[x.n] === x.answer).length }
    }).filter((d) => d.total)
    const right = qs.filter((x) => picked[x.n] === x.answer).length
    const pct = Math.round((right / qs.length) * 100)
    if (exam) saveBest(track.id, pct)
    return (
      <div className="card card-pad cert-result">
        <h3>{right} of {qs.length} right · {pct}%</h3>
        <p className="muted">{pct >= 80 ? 'Strong. Take one more mock on another day; if it holds, book the exam.' : 'Not yet. Practise the weakest topic below, read every explanation, then try again.'}</p>
        <table className="cert-table"><tbody>{byDomain.map((d) => (
          <tr key={d.id}><td>{d.name}</td><td>{d.right}/{d.total}</td><td><span className="cert-bar"><span style={{ width: `${(d.right / d.total) * 100}%` }} /></span></td></tr>
        ))}</tbody></table>
        {exam && (
          <details className="cert-review"><summary>Review every question</summary>
            {qs.map((x) => (
              <div key={x.n} className={`cert-rev ${picked[x.n] === x.answer ? 'ok' : 'bad'}`}>
                <b>{x.q}</b>
                <div className="small">Your answer: {picked[x.n] != null ? x.options[picked[x.n]] : 'not answered'}</div>
                <div className="small">Right answer: {x.options[x.answer]}</div>
                <div className="small muted">{x.why}</div>
              </div>
            ))}
          </details>
        )}
        <button className="btn btn-primary" onClick={onDone}>Done</button>
      </div>
    )
  }

  return (
    <div className="card card-pad cert-q">
      <div className="spread small muted">
        <span>Question {i + 1} of {qs.length}</span>
        {exam ? <span className="cert-timer">{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')} left</span> : (
          <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Topic">
            <option value="all">All topics</option>
            {track.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
      </div>
      <h3 className="cert-question">{q.q}</h3>
      <div className="cert-options">
        {q.options.map((o, k) => {
          const state = !exam && answered ? (k === q.answer ? 'right' : picked[q.n] === k ? 'wrong' : '') : picked[q.n] === k ? 'chosen' : ''
          return <button key={k} className={`cert-opt ${state}`} disabled={!exam && answered} onClick={() => setPicked((p) => ({ ...p, [q.n]: k }))}><b>{'ABCD'[k]}</b> {o}</button>
        })}
      </div>
      {!exam && answered && <p className={`cert-why ${picked[q.n] === q.answer ? 'ok' : 'bad'}`}><b>{picked[q.n] === q.answer ? 'Right.' : 'Not quite.'}</b> {q.why}</p>}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
        {exam && i === qs.length - 1
          ? <button className="btn btn-primary btn-sm" onClick={() => setPicked((p) => ({ ...p, done: true }))}>Finish and score</button>
          : <button className="btn btn-primary btn-sm" disabled={!exam && !answered} onClick={() => setI(i + 1)}>{i === qs.length - 1 ? 'See my score' : 'Next →'}</button>}
      </div>
    </div>
  )
}

export function CertTrack() {
  const { id } = useParams()
  const meta = CERT_TRACKS.find((t) => t.id === id)
  const { pro, data, err } = useProContent('certs.json')
  const [mode, setMode] = useState(null)
  if (!meta) return <NotFound />
  const track = data?.find((t) => t.id === id)
  let main
  if (!pro) {
    main = (
      <>
        <h2 className="ds-h">Topic areas</h2>
        <ul className="cert-domains">{meta.domains.map((d) => <li key={d.id}>{d.name} <span className="small muted">· {d.count} practice questions</span></li>)}</ul>
        <ProGate what={`the study guides and ${CERT_TRACKS.reduce((a, t) => a + t.count, 0)} practice questions`} />
      </>
    )
  } else if (err) main = <p className="err" role="alert">{err}</p>
  else if (!track) main = <span className="loading"><span className="spinner" /> Loading the track…</span>
  else if (mode) main = <Protected><Practice key={mode} track={track} exam={mode === 'exam'} onDone={() => setMode(null)} /></Protected>
  else {
    main = (
      <>
        <div className="row cert-modes">
          <button className="btn btn-primary" onClick={() => setMode('practice')}>Practise by topic</button>
          <button className="btn btn-ghost" onClick={() => setMode('exam')}>Timed mock: {track.qs.length} questions, {Math.round(track.qs.length * 1.5)} minutes</button>
        </div>
        <Protected><Markdown md={track.guide} className="prose no-try" /></Protected>
      </>
    )
  }
  return (
    <div className="page">
      <div className="container design-page">
        <Link to="/pro/certs" className="small">← All certification tracks</Link>
        <header className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">{meta.vendor} · {meta.level} · {meta.count} practice questions</div>
          <h1 className="tpl-title">{meta.title}</h1>
        </header>
        {main}
      </div>
    </div>
  )
}
