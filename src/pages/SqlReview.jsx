import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import data from '../content/sql-questions.json'
import { useProgress } from '../lib/progress.js'
import { seed, dueList, GAPS } from '../lib/review.js'
import { PATTERN_OF } from '../data/sqlPatterns.js'
import './sqlreview.css'

// Spaced review: today's few problems to solve again from memory, so patterns stick for interview day.
const QS = data.questions
const PER_DAY = 5
const DAY = 864e5

export default function SqlReview() {
  const p = useProgress()
  const solved = QS.filter((q) => q.mode === 'check' && p.sql[q.n] === 'solved').map((q) => q.n)
  const state = useMemo(() => seed(solved), [solved.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  const due = dueList(state)
  const today = due.slice(0, PER_DAY)
  const boxes = GAPS.map((g, i) => Object.values(state).filter((v) => v.box === i).length)
  const upcoming = Object.entries(state).filter(([, v]) => v.due > Date.now()).sort((a, b) => a[1].due - b[1].due).slice(0, 6)
  const byN = (n) => QS.find((q) => q.n === Number(n))
  return (
    <div className="page review">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">SQL Arena · Spaced review</div>
          <h1>Solve it again, <em>just before you forget it</em></h1>
          <p>Every problem you solve comes back after 1, 3, 7, 21 and 60 days. Solve it from memory and it waits longer next time. Get it wrong and it starts again. Five a day is enough to walk into an interview with every pattern fresh.</p>
        </div>

        {!solved.length ? (
          <div className="card rv-empty">
            <b>Nothing to review yet.</b>
            <p className="muted">Solve a few problems in the SQL Lab first. Each one you solve joins your review queue.</p>
            <Link to="/practice/sql" className="btn btn-primary">Open the SQL Lab</Link>
          </div>
        ) : (
          <>
            <section aria-labelledby="rv-today">
              <h2 id="rv-today">Today{due.length ? `: ${today.length} of ${due.length} due` : ''}</h2>
              {today.length ? (
                <ol className="rv-list">
                  {today.map((x) => {
                    const q = byN(x.n)
                    return (
                      <li key={x.n}>
                        <Link to={`/practice/sql/${x.n}?review=1`} className="card card-link rv-item">
                          <span className="chip">Q{x.n}</span>
                          <b>{q.title}</b>
                          <span className="small muted">{PATTERN_OF[x.n] ? PATTERN_OF[x.n].name + ' · ' : ''}{x.box ? `review ${x.box + 1}` : 'first review'}</span>
                          <span className="small rv-go">Solve it again from a blank editor →</span>
                        </Link>
                      </li>
                    )
                  })}
                </ol>
              ) : <p className="rv-clear">✓ All caught up. Come back tomorrow.</p>}
            </section>

            <section className="rv-boxes" aria-label="How well you know your problems">
              {GAPS.map((g, i) => (
                <div key={g}><b>{boxes[i]}</b><span>{i === GAPS.length - 1 ? 'locked in' : `next in ${g} day${g === 1 ? '' : 's'}`}</span></div>
              ))}
            </section>

            {upcoming.length > 0 && (
              <section>
                <h2>Coming up</h2>
                <ul className="rv-up small">
                  {upcoming.map(([n, v]) => <li key={n}><span>Q{n} · {byN(n).title}</span><span className="muted">in {Math.max(1, Math.ceil((v.due - Date.now()) / DAY))} day{Math.ceil((v.due - Date.now()) / DAY) > 1 ? 's' : ''}</span></li>)}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
