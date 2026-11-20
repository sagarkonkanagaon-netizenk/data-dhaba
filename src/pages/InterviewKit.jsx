import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import { useProContent } from '../lib/proContent.js'
import './jobkit.css'

// Pro interview kit: the question bank (from Pro storage) with think-then-reveal practice, plus the round guide.
const LV = { 1: 'Every interview', 2: '2 to 5 years', 3: 'Senior' }
const KEY = 'dd:ivk'
const readMarks = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { return {} } }

export default function InterviewKit() {
  const { pro, data, err } = useProContent('interview.json')
  const [topic, setTopic] = useState('all')
  const [lvl, setLvl] = useState(0)
  const [q, setQ] = useState('')
  const [onlyReview, setOnlyReview] = useState(false)
  const [open, setOpen] = useState({})
  const [marks, setMarks] = useState(readMarks)
  const mark = (id, v) => setMarks((m) => { const n = { ...m, [id]: v }; try { localStorage.setItem(KEY, JSON.stringify(n)) } catch (e) { /* ignore */ } return n })

  const all = useMemo(() => (data ? data.topics.flatMap((t) => t.qs.map((x) => ({ ...x, id: `${t.id}-${x.n}`, topic: t.id, ttitle: t.title }))) : []), [data])
  const list = all.filter((x) => (topic === 'all' || x.topic === topic) && (!lvl || x.lvl === lvl) && (!onlyReview || marks[x.id] === 'again')
    && (!q || (x.q + ' ' + x.a).toLowerCase().includes(q.toLowerCase())))
  const nailed = Object.values(marks).filter((v) => v === 'ok').length
  const random = () => { if (!list.length) return; const x = list[Math.floor(Math.random() * list.length)]; setOpen({}); setTimeout(() => document.getElementById('q-' + x.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 30) }

  const head = (
    <div className="page-head">
      <div className="eyebrow">Pro · Interview kit</div>
      <h1>{data ? data.total : '500'} interview questions, with the answer and the next question</h1>
      <p className="muted">The questions data engineering rounds in India keep asking, by topic and level. Say your answer out loud first, then reveal the model answer and the follow-up the interviewer usually asks next. Mark each one, and come back to the ones you missed.</p>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Link className="btn btn-ghost btn-sm" to="/interview/job-kit/interview-kit">How each round works</Link>
        <Link className="btn btn-ghost btn-sm" to="/interview/job-kit">The full job kit</Link>
      </div>
    </div>
  )
  if (!pro) return <div className="page"><div className="container">{head}<ProGate what="all interview questions with model answers" /></div></div>
  if (err) return <div className="page"><div className="container">{head}<p className="err" role="alert">{err}</p></div></div>
  if (!data) return <div className="page container"><span className="loading"><span className="spinner" /> Loading questions…</span></div>

  return (
    <div className="page"><div className="container">
      {head}
      <div className="ivk-bar card card-pad">
        <div className="ivk-tabs" role="tablist" aria-label="Topics">
          <button type="button" role="tab" aria-selected={topic === 'all'} className={topic === 'all' ? 'on' : ''} onClick={() => setTopic('all')}>All <span>{all.length}</span></button>
          {data.topics.map((t) => <button key={t.id} type="button" role="tab" aria-selected={topic === t.id} className={topic === t.id ? 'on' : ''} onClick={() => setTopic(t.id)}>{t.title} <span>{t.qs.length}</span></button>)}
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <input className="ivk-search" placeholder="Search questions and answers" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          <select value={lvl} onChange={(e) => setLvl(Number(e.target.value))} aria-label="Level">
            <option value={0}>All levels</option>{[1, 2, 3].map((l) => <option key={l} value={l}>{LV[l]}</option>)}
          </select>
          <label className="small"><input type="checkbox" checked={onlyReview} onChange={(e) => setOnlyReview(e.target.checked)} /> Only "practise again"</label>
          <button type="button" className="btn btn-ghost btn-sm" onClick={random}>Random question</button>
          <span className="small muted" style={{ marginLeft: 'auto' }}>{nailed} of {all.length} nailed</span>
        </div>
      </div>
      <Protected>
      <ol className="ivk-list">
        {list.map((x) => (
          <li key={x.id} id={'q-' + x.id} className={'card card-pad ivk-q' + (marks[x.id] === 'ok' ? ' ok' : marks[x.id] === 'again' ? ' again' : '')}>
            <div className="small muted">{x.ttitle} · {LV[x.lvl]}</div>
            <b className="ivk-qt">{x.q}</b>
            {open[x.id] ? (
              <>
                <p className="ivk-a">{x.a}</p>
                <p className="ivk-f"><b>They'll ask next:</b> {x.f}</p>
                <div className="row" style={{ gap: 8 }}>
                  <button type="button" className={'btn btn-sm ' + (marks[x.id] === 'ok' ? 'btn-primary' : 'btn-ghost')} onClick={() => mark(x.id, 'ok')}>✓ Nailed it</button>
                  <button type="button" className={'btn btn-sm ' + (marks[x.id] === 'again' ? 'btn-primary' : 'btn-ghost')} onClick={() => mark(x.id, 'again')}>↻ Practise again</button>
                </div>
              </>
            ) : <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => ({ ...o, [x.id]: true }))}>Say it out loud, then reveal</button>}
          </li>
        ))}
        {!list.length && <li className="muted">No questions match.</li>}
      </ol>
      </Protected>
    </div></div>
  )
}
