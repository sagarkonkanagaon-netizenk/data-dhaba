import { useState } from 'react'
import { Link } from 'react-router-dom'
import sqlQ from '../content/sql-questions.json'
import pyQ from '../content/py-questions.json'
import { WEEKS } from '../data/path.js'
import { DRILLS } from '../data/drills.js'
import { TOOLS, PAGES, LAYER_BY_ID } from '../data/atlas.js'
import { dayKey, dayNumber, challengeFor } from '../data/daily.js'
import { useProgress, streak } from '../lib/progress.js'
import { tally, levelOf, badgesOf } from '../lib/xp.js'
import { weekStats, resolveRef, practiceLink, checkKey } from './Path.jsx'
import { dailyStreak } from './Daily.jsx'
import { Onboarding, getProfile, startWeek } from '../components/Mission.jsx'
import './today.css'

// Today: the learner's home once they have started. One clear next step, today's challenge,
// the streak, and the things they left half done. Everything is worked out from saved progress.

function greeting(h) {
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// The single most useful thing to do next in the learner's current week.
function nextStep(week, p) {
  const reads = week.read.map(resolveRef)
  const unread = reads.find((r) => r.key && !p.chapters[r.key])
  if (unread) return { k: 'Read', title: unread.title, sub: `${unread.book} · about ${unread.minutes} min`, to: unread.to, xp: 10 }
  for (const pr of week.practice) {
    if (pr.kind === 'sql' || pr.kind === 'py') {
      const area = p[pr.kind]
      for (let i = pr.from; i <= pr.to; i++) {
        if (area[i] !== 'solved') {
          const q = (pr.kind === 'sql' ? sqlQ : pyQ).questions.find((x) => x.n === i)
          if (q) return { k: 'Solve', title: q.title, sub: `${pr.kind === 'sql' ? 'SQL' : 'Python'} Lab · question ${i}`, to: practiceLink({ ...pr, from: i }), xp: 20 }
        }
      }
    }
    if (pr.kind === 'drill' && !p.drills[pr.id]) return { k: 'Fix', title: pr.label, sub: 'Incident drill', to: practiceLink(pr), xp: 50 }
  }
  const open = week.checks.findIndex((_, i) => !p.checks[checkKey(week.n, i)])
  if (open >= 0) return { k: 'Check', title: week.checks[open], sub: `Tick it off on the Week ${week.n} page when you can do it`, to: `/path/${week.n}`, xp: 5 }
  return { k: 'Next', title: `Week ${week.n} is done`, sub: 'Move on to the next week', to: `/path/${Math.min(week.n + 1, WEEKS.length)}`, xp: 0 }
}

export default function Today() {
  const p = useProgress()
  const [onboard, setOnboard] = useState(false)
  const profile = getProfile()
  const t = tally(p)
  const lv = levelOf(t.xp)
  const days = streak(p.days)
  const sqlStreak = dailyStreak(p.checks)
  const now = new Date()

  const from = startWeek(profile)
  const week = WEEKS.find((w) => w.n >= from && weekStats(w, p).pct < 100) || WEEKS.find((w) => weekStats(w, p).pct < 100) || WEEKS[WEEKS.length - 1]
  const ws = weekStats(week, p)
  const step = nextStep(week, p)

  const n = dayNumber()
  const ch = challengeFor(n)
  const solvedToday = !!p.checks['daily:' + dayKey()]?.solved

  const started = [
    ...sqlQ.questions.filter((q) => p.sql[q.n] === 'tried').map((q) => ({ to: `/practice/sql/${q.n}`, k: 'SQL', title: q.title, n: q.n })),
    ...pyQ.questions.filter((q) => p.py[q.n] === 'tried').map((q) => ({ to: `/practice/python/${q.n}`, k: 'Python', title: q.title, n: q.n })),
  ].slice(0, 4)

  const due = Object.values(p.cards).filter((c) => c.due <= Date.now()).length
  const drill = DRILLS.find((d) => !p.drills[d.id])
  const full = TOOLS.filter((x) => PAGES[x.id])
  const tool = full[n % full.length]
  const badges = badgesOf(p).filter((b) => b.earned).length

  return (
    <div className="page today">
      <div className="container">
        <header className="td-head">
          <div>
            <div className="eyebrow">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <h1>{greeting(now.getHours())}. <em>Here is your day.</em></h1>
            <p className="muted">One step at a time. Do the card on the left and you have moved forward today.</p>
          </div>
          <Link to="/progress" className="td-me card" aria-label={`Level ${lv.i + 1}, ${lv.name}, ${t.xp} XP`}>
            <span className="td-lv" aria-hidden="true">{lv.icon}</span>
            <span className="td-me-txt">
              <span className="small muted">Level {lv.i + 1}</span>
              <b>{lv.name}</b>
              <span className="progress"><i style={{ width: lv.pct + '%' }} /></span>
              <span className="small muted">{t.xp} XP{lv.next ? ` · ${lv.next.xp - t.xp} to ${lv.next.name}` : ''}</span>
            </span>
          </Link>
        </header>

        <div className="td-streaks" role="list">
          <div role="listitem"><b>🔥 {days}</b><span>day study streak</span></div>
          <div role="listitem"><b>🧩 {sqlStreak}</b><span>daily SQL streak</span></div>
          <div role="listitem"><b>🏅 {badges}</b><span>badges earned</span></div>
          <div role="listitem"><b>🃏 {due}</b><span>flashcards due</span></div>
        </div>

        <div className="td-main">
          <section className="td-next card" aria-labelledby="td-next-h">
            <div className="spread"><span className="eyebrow" id="td-next-h" style={{ margin: 0 }}>Your one next step</span>{step.xp > 0 && <span className="chip chip-primary">+{step.xp} XP</span>}</div>
            <span className="td-k">{step.k}</span>
            <h2>{step.title}</h2>
            <p className="muted">{step.sub}</p>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <Link to={step.to} className="btn btn-primary">Start now</Link>
              <Link to={`/path/${week.n}`} className="btn btn-ghost">See Week {week.n}</Link>
            </div>
            <div className="td-week">
              <div className="spread small"><span>Week {week.n} · {week.title}</span><b>{ws.pct}%</b></div>
              <div className="progress"><i style={{ width: ws.pct + '%' }} /></div>
              <div className="small muted">{ws.readDone} of {ws.reads} chapters read · {ws.checks} of {week.checks.length} checks ticked</div>
            </div>
            {!profile && (
              <button type="button" className="td-plan" onClick={() => setOnboard(true)}>
                <b>Make this your plan.</b> Answer three questions and we start you at the right week, at your pace. →
              </button>
            )}
          </section>

          <section className={'td-daily card' + (solvedToday ? ' done' : '')} aria-labelledby="td-daily-h">
            <div className="spread"><span className="eyebrow" id="td-daily-h" style={{ margin: 0 }}>Daily SQL #{n}</span><span className="chip">{ch.level}</span></div>
            <h2>{ch.title}</h2>
            <p className="small">{ch.prompt}</p>
            <p className="td-cols small"><span className="muted">Return</span> <code>{ch.cols}</code></p>
            {solvedToday
              ? <p className="td-solved">✓ Solved today. Come back after midnight for the next one.</p>
              : <p className="small muted">Same question for everyone today. Solve it to keep your streak and earn 30 XP.</p>}
            <Link to="/daily" className={'btn ' + (solvedToday ? 'btn-ghost' : 'btn-primary')}>{solvedToday ? 'See your result' : 'Solve today\'s challenge'}</Link>
          </section>
        </div>

        {started.length > 0 && (
          <section className="td-sec" aria-labelledby="td-started-h">
            <h2 id="td-started-h">Finish what you started</h2>
            <div className="td-list">
              {started.map((x) => (
                <Link key={x.to} to={x.to} className="td-item card card-link">
                  <span className="chip">{x.k} {x.n}</span>
                  <b>{x.title}</b>
                  <span className="small muted">You tried this. One more go →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="td-sec" aria-labelledby="td-more-h">
          <h2 id="td-more-h">Got ten more minutes?</h2>
          <div className="td-more">
            <Link to={`/atlas/${tool.id}`} className="td-tile card card-link">
              <span className="td-tile-k">Tool of the day</span>
              <b>{tool.name}</b>
              <span className="small muted">{tool.one}</span>
              <span className="small">{LAYER_BY_ID[tool.layer].name} · read the 8-block page →</span>
            </Link>
            <Link to="/interview/flashcards" className="td-tile card card-link">
              <span className="td-tile-k">Review</span>
              <b>{due ? `${due} flashcard${due === 1 ? '' : 's'} due` : 'Five minutes of flashcards'}</b>
              <span className="small muted">Spaced repetition keeps what you learnt this week from fading.</span>
              <span className="small">Start reviewing →</span>
            </Link>
            {drill
              ? (
                <Link to={`/drills/${drill.id}`} className="td-tile card card-link">
                  <span className="td-tile-k">On call</span>
                  <b>{drill.title}</b>
                  <span className="small muted">A pipeline broke. Read the page, find the cause, fix it.</span>
                  <span className="small">Take the drill · +50 XP →</span>
                </Link>
              )
              : (
                <Link to="/spark-visual" className="td-tile card card-link">
                  <span className="td-tile-k">See it</span>
                  <b>Spark Visualizer</b>
                  <span className="small muted">Watch partitions, shuffles and skew happen.</span>
                  <span className="small">Open it →</span>
                </Link>
              )}
          </div>
        </section>
      </div>
      {onboard && <Onboarding onClose={() => setOnboard(false)} />}
    </div>
  )
}
