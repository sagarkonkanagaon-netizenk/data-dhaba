import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress, streak } from '../lib/progress.js'
import { tally, levelOf, LEVELS } from '../lib/xp.js'
import { tokensOf } from '../data/tokens.js'
import { PATTERN_OF } from '../data/sqlPatterns.js'
import { bestDailyStreak } from '../lib/streaks.js'
import Token from '../components/Token.jsx'
import TokenReveal from '../components/TokenReveal.jsx'
import './profile.css'

// The learner's profile: a rank card worth showing off, every stat that matters,
// a skill radar, a year-style activity map and the badge case with what to unlock next.

/* global __QUESTION_COUNTS__ */
const COUNTS = typeof __QUESTION_COUNTS__ !== 'undefined' ? __QUESTION_COUNTS__ : { sql: 109, py: 60 }
const HKEY = 'dd:handle'
function readJson(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } }

function Radar({ axes }) {
  const R = 92, C = 120, n = axes.length
  const at = (i, r) => [C + r * Math.sin((2 * Math.PI * i) / n), C - r * Math.cos((2 * Math.PI * i) / n)]
  const ring = (f) => axes.map((_, i) => at(i, R * f).join(',')).join(' ')
  const shape = axes.map((a, i) => at(i, R * Math.max(0.04, a.v / 100)).join(',')).join(' ')
  return (
    <svg viewBox="0 0 240 240" className="pf-radar" role="img" aria-label={'Skill radar: ' + axes.map((a) => `${a.k} ${a.v}%`).join(', ')}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ring(f)} className="pf-ring" />)}
      {axes.map((_, i) => <line key={i} x1={C} y1={C} x2={at(i, R)[0]} y2={at(i, R)[1]} className="pf-spoke" />)}
      <polygon points={shape} className="pf-shape" />
      {axes.map((a, i) => <circle key={a.k} cx={at(i, R * Math.max(0.04, a.v / 100))[0]} cy={at(i, R * Math.max(0.04, a.v / 100))[1]} r="3.5" className="pf-dot" />)}
      {axes.map((a, i) => {
        const [x, y] = at(i, R + 18)
        return <text key={a.k} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="pf-axis">{a.k}<tspan x={x} dy="12" className="pf-axis-v">{a.v}%</tspan></text>
      })}
    </svg>
  )
}

function Heatmap({ days }) {
  const set = new Set(days)
  const weeks = 26
  const now = new Date()
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const DAY = 86400000
  const start = end - (weeks * 7 - 1 + new Date(end).getUTCDay()) * DAY
  const cells = []
  for (let d = start; d <= end; d += DAY) {
    const k = new Date(d).toISOString().slice(0, 10)
    cells.push({ k, on: set.has(k) })
  }
  const active = cells.filter((c) => c.on).length
  return (
    <div>
      <div className="pf-heat" role="img" aria-label={`${active} active days in the last ${weeks} weeks`}>
        {cells.map((c) => <i key={c.k} className={c.on ? 'on' : ''} title={c.k + (c.on ? ': studied' : '')} />)}
      </div>
      <div className="small muted" style={{ marginTop: 8 }}>{active} active days in the last 6 months</div>
    </div>
  )
}

export default function Profile() {
  const p = useProgress()
  const t = tally(p)
  const lv = levelOf(t.xp)
  const tokens = tokensOf(p, PATTERN_OF)
  const earned = tokens.filter((x) => x.earned)
  const top = earned[earned.length - 1]
  const next = tokens.filter((x) => !x.earned).sort((a, b) => b.pct - a.pct)[0]
  const [handle, setHandle] = useState(() => readJson(HKEY, '') || '')
  const [editing, setEditing] = useState(false)
  const [show, setShow] = useState(null)
  const name = handle || 'Data Dhaba learner'
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const since = p.days.length ? new Date(p.days[0]).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'today'
  const mocks = readJson('dd:mock-history', [])
  const bestMock = mocks.reduce((a, h) => Math.max(a, h.score), 0)
  const deSolved = Object.entries(p.sql).filter(([n, v]) => v === 'solved' && Number(n) >= 59).length
  const pct = (a, b) => Math.min(100, Math.round((100 * a) / Math.max(1, b)))
  const axes = [
    { k: 'SQL', v: pct(t.n.sql, COUNTS.sql) },
    { k: 'Python', v: pct(t.n.py, COUNTS.py) },
    { k: 'Spark', v: pct(t.n.spark, 30) },
    { k: 'Pipelines', v: pct(deSolved + t.n.drill * 3, Math.max(1, COUNTS.sql - 58) + 15) },
    { k: 'Interview', v: pct(t.n.scenario + t.quiz / 5 + mocks.length * 2, 40) },
    { k: 'Habit', v: pct(Math.max(streak(p.days), bestDailyStreak(p.checks)), 30) },
  ]
  const tier = lv.i >= 6 ? 'mythic' : lv.i >= 4 ? 'epic' : lv.i >= 2 ? 'rare' : 'common'
  const save = (v) => { const clean = v.replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, 24).trim(); setHandle(clean); try { localStorage.setItem(HKEY, JSON.stringify(clean)) } catch (e) { /* ignore */ } setEditing(false) }

  return (
    <div className="page profile">
      <div className="container">
        <section className={'pf-card ' + tier} aria-label="Your rank card">
          <div className="pf-grid-bg" aria-hidden="true" />
          <div className="pf-main">
            <div className="pf-avatar" aria-hidden="true"><span>{initials}</span></div>
            <div className="pf-id">
              <span className="pf-tier">{tier} · level {lv.i + 1}</span>
              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); save(e.target.elements.h.value) }} className="pf-edit">
                  <input name="h" defaultValue={handle} maxLength={24} placeholder="Your name or handle" aria-label="Your name or handle" autoFocus />
                  <button className="btn btn-primary btn-sm">Save</button>
                </form>
              ) : (
                <h1>{name} <button type="button" className="pf-pen" onClick={() => setEditing(true)} aria-label="Change your name">✎</button></h1>
              )}
              <div className="pf-rank"><span aria-hidden="true">{lv.icon}</span> {lv.name}</div>
              <div className="pf-xp">
                <div className="pf-xpbar"><i style={{ width: lv.pct + '%' }} /></div>
                <span>{t.xp.toLocaleString('en-IN')} XP{lv.next ? ` · ${(lv.next.xp - t.xp).toLocaleString('en-IN')} to ${lv.next.name}` : ' · top rank'}</span>
              </div>
              <span className="pf-since">Learning since {since}</span>
            </div>
          </div>
          <div className="pf-emblem">
            {top ? (
              <button type="button" onClick={() => setShow(top)} aria-label={`Replay ${top.title}`}><Token token={top} size={170} spin /><b>{top.title}</b><span>Highest badge</span></button>
            ) : (
              <div className="pf-empty"><span>?</span><b>No badge yet</b><small>Solve 50 SQL problems for Chai Coder</small></div>
            )}
          </div>
        </section>

        <section className="pf-stats" aria-label="Stats">
          {[
            [t.n.sql, 'SQL solved', `of ${COUNTS.sql}`],
            [t.n.py, 'Python solved', `of ${COUNTS.py}`],
            [streak(p.days), 'Day streak', `best daily SQL ${bestDailyStreak(p.checks)}`],
            [bestMock || '–', 'Best mock score', `${mocks.length} round${mocks.length === 1 ? '' : 's'}`],
            [t.n.drill, 'Incidents fixed', 'on-call drills'],
            [`${earned.length}/${tokens.length}`, 'Badges', 'elite set'],
          ].map(([v, k, s]) => <div key={k}><b>{v}</b><span>{k}</span><small>{s}</small></div>)}
        </section>

        <div className="pf-two">
          <section className="card pf-box">
            <h2>Skill radar</h2>
            <Radar axes={axes} />
            <p className="small muted">Worked out from what you have done here. The weakest corner is your next best hour.</p>
          </section>
          <section className="card pf-box">
            <h2>Activity</h2>
            <Heatmap days={p.days} />
            {next && (
              <div className="pf-next">
                <Token token={next} size={78} locked />
                <div>
                  <span className="small muted">Closest badge</span>
                  <b>{next.title}</b>
                  <div className="pf-xpbar light"><i style={{ width: next.pct + '%' }} /></div>
                  <span className="small">{next.reqs.filter((r) => !r.ok).map((r) => `${r.need - r.have} more: ${r.label.toLowerCase()}`).join(' · ')}</span>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="pf-case" aria-labelledby="pf-case-h">
          <div className="spread"><h2 id="pf-case-h">Badge case</h2><Link to="/progress#tokens" className="small">How to earn each →</Link></div>
          <div className="pf-case-row">
            {tokens.map((x) => (
              <button key={x.id} type="button" className={'pf-slot' + (x.earned ? ' got' : '')} disabled={!x.earned} onClick={() => setShow(x)} aria-label={x.earned ? `${x.title}, replay` : `${x.title}, locked`}>
                <Token token={x} size={92} locked={!x.earned} spin={x.earned} />
                <span>{x.earned ? x.title : '???'}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pf-ladder" aria-label="Ranks">
          {LEVELS.map((l, i) => <div key={l.name} className={i < lv.i ? 'past' : i === lv.i ? 'now' : ''}><span aria-hidden="true">{l.icon}</span><b>{l.name}</b><small>{l.xp.toLocaleString('en-IN')} XP</small></div>)}
        </section>
      </div>
      {show && <TokenReveal token={show} onClose={() => setShow(null)} />}
    </div>
  )
}
