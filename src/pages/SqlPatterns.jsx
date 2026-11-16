import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import data from '../content/sql-questions.json'
import { PATTERNS } from '../data/sqlPatterns.js'
import { useProgress } from '../lib/progress.js'
import './sqlpatterns.css'

// 25 patterns cover the 78 problems. Learn the shape once, then spot it in any question.
const QS = Object.fromEntries(data.questions.map((q) => [q.n, q]))

export default function SqlPatterns() {
  const p = useProgress()
  const [open, setOpen] = useState(() => (typeof location !== 'undefined' ? location.hash.split('#')[2] || null : null))
  useEffect(() => { if (open) document.getElementById('pt-' + open)?.scrollIntoView({ block: 'start' }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const solvedIn = (pt) => pt.qs.filter((n) => p.sql[n] === 'solved').length
  const mastered = PATTERNS.filter((pt) => solvedIn(pt) === pt.qs.length).length
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">SQL patterns</div>
          <h1>25 patterns. <em>Every SQL question.</em></h1>
          <p>Interviewers rarely ask something new. They dress up the same 25 shapes in a new story. Learn to spot the pattern, reuse the recipe, and a hard question becomes a familiar one.</p>
        </div>
        <div className="pt-summary">
          <div><b>{mastered}</b><span>of {PATTERNS.length} patterns mastered</span></div>
          <div className="pt-bar"><i style={{ width: `${(mastered / PATTERNS.length) * 100}%` }} /></div>
          <Link to="/practice/sql" className="btn btn-ghost btn-sm">Back to SQL Lab</Link>
        </div>
        <div className="pt-grid">
          {PATTERNS.map((pt, i) => {
            const s = solvedIn(pt)
            const on = open === pt.id
            return (
              <article key={pt.id} id={'pt-' + pt.id} className={'pt-card' + (on ? ' on' : '') + (s === pt.qs.length ? ' done' : '')}>
                <button className="pt-head" aria-expanded={on} onClick={() => setOpen(on ? null : pt.id)}>
                  <span className="pt-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pt-t"><b>{pt.name}</b><span>Spot it: {pt.spot}</span></span>
                  <span className="pt-s">{s}/{pt.qs.length}</span>
                </button>
                {on && (
                  <div className="pt-body">
                    <div className="pt-k">The recipe</div>
                    <pre className="pt-code"><code>{pt.recipe}</code></pre>
                    <div className="pt-k">Practise it</div>
                    <ul className="pt-qs">
                      {pt.qs.map((n) => (
                        <li key={n}>
                          <Link to={`/practice/sql/${n}`}>
                            <span className="pt-qn">{n}</span><span>{QS[n]?.title}</span>
                            <span className="pt-st">{p.sql[n] === 'solved' ? '✅' : p.sql[n] === 'tried' ? '•' : ''}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
