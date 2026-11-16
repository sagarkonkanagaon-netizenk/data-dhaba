import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import sqlQ from '../content/sql-questions.json'
import booksIndex from '../content/books-index.json'
import { WEEKS } from '../data/path.js'
import { DRILLS } from '../data/drills.js'
import { useProgress, streak } from '../lib/progress.js'
import { tally, levelOf } from '../lib/xp.js'
import { weekStats, resolveRef } from '../pages/Path.jsx'

const PKEY = 'z2h:profile'
export function getProfile() { try { return JSON.parse(localStorage.getItem(PKEY)) || null } catch (e) { return null } }
export function setProfile(v) { try { localStorage.setItem(PKEY, JSON.stringify(v)) } catch (e) { /* ignore */ } }

const QS = [
  { k: 'start', q: 'Where are you starting from?', opts: [['new', 'New to data', 'I am learning SQL from scratch'], ['sql', 'I know SQL', 'Queries are fine, Spark is new'], ['de', 'Already in data', 'I want cloud, Databricks and interviews']] },
  { k: 'goal', q: 'What do you want most?', opts: [['job', 'My first DE job', 'Switch careers or land a first role'], ['better', 'A better offer', 'Move up from where I am'], ['skills', 'Just the skills', 'Learn properly, no rush']] },
  { k: 'time', q: 'How much time do you have?', opts: [['light', 'About 1 hour a day', 'Steady and sustainable'], ['normal', 'About 2 hours a day', 'The plan as written'], ['sprint', '4+ hours a day', 'Interview in a few weeks']] },
]

export function startWeek(profile) {
  if (!profile) return 1
  if (profile.start === 'de') return profile.goal === 'skills' ? 5 : 7
  if (profile.start === 'sql') return 3
  return 1
}

const PACE = { light: { f: 2, label: 'About 1 hour a day' }, normal: { f: 1, label: 'About 2 hours a day' }, sprint: { f: 0.5, label: '4+ hours a day' } }
const GOAL = {
  job: { label: 'Land my first DE job', focus: ['Build each week’s ticket and push it to GitHub: that is your portfolio', 'From Week 22: capstone, project story and ten tailored applications'] },
  better: { label: 'Get a better offer', focus: ['Skim what you know, then go deep on Spark internals, modelling and system design', 'Practise the scenario questions and the interview playbook every week'] },
  skills: { label: 'Learn the skills properly', focus: ['Follow the chapters in order and run every example', 'Take the end-of-week checks before you move on'] },
}
const START = { new: 'New to data', sql: 'I know SQL', de: 'Already in data' }

// A plan made from the three answers: where to start, how long it takes at this pace, and a first win for today.
export function planFor(profile) {
  if (!profile) return null
  const start = startWeek(profile)
  const pace = PACE[profile.time] || PACE.normal
  const weeks = Math.ceil((WEEKS.length - start + 1) * pace.f)
  const from = profile.at ? new Date(profile.at) : new Date()
  const finish = new Date(from.getTime() + weeks * 7 * 864e5)
  const week = WEEKS.find((w) => w.n === start) || WEEKS[0]
  const first = week.read.map(resolveRef).find((r) => r.key) || resolveRef(week.read[0])
  return {
    start, week, weeks, finish, pace: pace.label,
    goal: (GOAL[profile.goal] || GOAL.skills).label,
    from: START[profile.start] || START.new,
    focus: (GOAL[profile.goal] || GOAL.skills).focus,
    first,
  }
}

export const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export function Onboarding({ onClose }) {
  const [i, setI] = useState(0)
  const [ans, setAns] = useState({})
  const [plan, setPlan] = useState(null)
  const navigate = useNavigate()
  const q = QS[i]
  const pick = (v) => {
    const next = { ...ans, [q.k]: v }
    setAns(next)
    if (i + 1 < QS.length) setI(i + 1)
    else { const prof = { ...next, at: Date.now() }; setProfile(prof); setPlan(planFor(prof)) }
  }
  const go = (to) => { onClose(); navigate(to) }
  if (plan) {
    return (
      <div className="levelup" role="dialog" aria-label="Your plan" onClick={onClose}>
        <div className="levelup-card onboard" onClick={(e) => e.stopPropagation()}>
          <div className="eyebrow" style={{ margin: 0 }}>Your plan is ready</div>
          <h2 style={{ textAlign: 'left', margin: '8px 0 14px' }}>Start at Week {plan.start}: {plan.week.title}</h2>
          <div className="plan-facts">
            <div><span>Goal</span><b>{plan.goal}</b></div>
            <div><span>Pace</span><b>{plan.pace}</b></div>
            <div><span>Finish by</span><b>{fmtDate(plan.finish)}</b><small>{plan.weeks} weeks</small></div>
          </div>
          <ul className="ticks small" style={{ margin: '14px 0' }}>{plan.focus.map((f) => <li key={f}>{f}</li>)}</ul>
          <div className="plan-win">
            <div className="small muted">Your first win, right now ({plan.first.minutes} min)</div>
            <b>{plan.first.title}</b>
            <div className="small muted">{plan.first.book}: read it and run the examples in your browser.</div>
          </div>
          <div className="row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => go(plan.first.to)}>Start my first win</button>
            <button className="btn btn-ghost" onClick={() => go(`/path/${plan.start}`)}>See Week {plan.start}</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="levelup" role="dialog" aria-label="Find your starting point" onClick={onClose}>
      <div className="levelup-card onboard" onClick={(e) => e.stopPropagation()}>
        <div className="spread small muted"><span className="eyebrow" style={{ margin: 0 }}>Step {i + 1} of {QS.length}</span><button className="btn btn-ghost btn-sm" onClick={onClose}>Skip</button></div>
        <div className="progress" style={{ margin: '14px 0 18px' }}><i style={{ width: ((i + 1) / QS.length) * 100 + '%' }} /></div>
        <h2 style={{ textAlign: 'left' }}>{q.q}</h2>
        <div className="stack" style={{ gap: 8 }}>
          {q.opts.map(([v, t, d]) => (
            <button key={v} className="opt" onClick={() => pick(v)}><span className="opt-l">→</span><span><b>{t}</b><br /><span className="small muted">{d}</span></span></button>
          ))}
        </div>
      </div>
    </div>
  )
}

// The learner's plan on the home page, with a way to change it.
export function PlanCard({ onChange }) {
  const p = useProgress()
  const plan = planFor(getProfile())
  if (!plan) return null
  const weekNow = WEEKS.find((w) => w.n >= plan.start && weekStats(w, p).pct < 100) || WEEKS[WEEKS.length - 1]
  const left = WEEKS.filter((w) => w.n >= plan.start && weekStats(w, p).pct < 100).length
  const daysLeft = Math.ceil((plan.finish - Date.now()) / 864e5)
  const behind = daysLeft > 0 && left * 7 * (plan.weeks / Math.max(1, WEEKS.length - plan.start + 1)) > daysLeft
  return (
    <div className="plan-card card card-pad">
      <div className="spread" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="eyebrow" style={{ margin: 0 }}>Your plan · {plan.from} → {plan.goal}</div>
        <button className="btn btn-ghost btn-sm" onClick={onChange}>Change</button>
      </div>
      <div className="plan-facts">
        <div><span>Now</span><b>Week {weekNow.n}</b><small>{weekNow.title}</small></div>
        <div><span>Pace</span><b>{plan.pace}</b></div>
        <div><span>Finish by</span><b>{fmtDate(plan.finish)}</b><small>{daysLeft > 0 ? (behind ? 'A little behind: add one session this week' : 'On track') : 'Target date passed: pick a new pace'}</small></div>
      </div>
    </div>
  )
}

export default function Mission({ onChange }) {
  const p = useProgress()
  const t = tally(p)
  const lv = levelOf(t.xp)
  const s = streak(p.days)
  const week = WEEKS.find((w) => weekStats(w, p).pct < 100) || WEEKS[WEEKS.length - 1]
  const book = booksIndex.find((b) => b.chapters.some((c) => !p.chapters[`${b.slug}/${c.num}`])) || booksIndex[0]
  const ch = book.chapters.find((c) => !p.chapters[`${book.slug}/${c.num}`]) || book.chapters[0]
  const q = sqlQ.questions.find((x) => p.sql[x.n] !== 'solved') || sqlQ.questions[0]
  const drill = DRILLS.find((d) => !p.drills[d.id])
  const due = Object.values(p.cards).filter((c) => c.due <= Date.now()).length
  const tasks = [
    { to: `/learn/${book.slug}/${ch.slug}`, k: 'Read', t: ch.title, d: `${book.title} · ${ch.minutes} min`, done: false, xp: 10 },
    { to: `/practice/sql/${q.n}`, k: 'Solve', t: q.title, d: `SQL lab · question ${q.n}`, xp: 20 },
    drill
      ? { to: `/drills/${drill.id}`, k: 'Fix', t: drill.title, d: 'Incident drill', xp: 50 }
      : { to: '/interview/flashcards', k: 'Review', t: due ? `${due} flashcards due` : 'Flashcards', d: 'Five minutes', xp: 5 },
  ]
  let backedUp = 0
  try { backedUp = Number(localStorage.getItem('dd:backup')) || 0 } catch (e) { /* ignore */ }
  const nudge = t.xp >= 100 && Date.now() - backedUp > 14 * 864e5
  return (
    <section className="mission">
      <div className="container">
        {onChange && getProfile() && <PlanCard onChange={onChange} />}
        {nudge && <Link to="/progress#backup" className="backup-nudge"><span aria-hidden="true">💾</span><span><b>{t.xp} XP saved only in this browser.</b> Back it up in one tap, so clearing your browser never wipes it.</span><span className="backup-go">Back up →</span></Link>}
        <div className="mission-grid">
          <div className="mission-me card">
            <div className="lv-ico">{lv.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="small muted">Level {lv.i + 1}</div>
              <b className="lv-name">{lv.name}</b>
              <div className="progress" style={{ margin: '8px 0 6px' }}><i style={{ width: lv.pct + '%' }} /></div>
              <div className="small muted">{t.xp} XP{lv.next ? ` · ${lv.next.xp - t.xp} to ${lv.next.name}` : ''}</div>
            </div>
            <div className="streak"><b>🔥 {s}</b><span>day streak</span></div>
          </div>
          <div className="mission-tasks">
            <div className="spread" style={{ marginBottom: 10 }}>
              <div className="eyebrow" style={{ margin: 0 }}>Today's mission · Week {week.n}</div>
              <Link to={`/path/${week.n}`} className="small">{week.title} →</Link>
            </div>
            <div className="grid g3">
              {tasks.map((x) => (
                <Link key={x.to} to={x.to} className="card card-pad card-link task">
                  <div className="spread"><span className="tile-k">{x.k}</span><span className="chip chip-primary">+{x.xp} XP</span></div>
                  <b>{x.t}</b>
                  <div className="small muted">{x.d}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
