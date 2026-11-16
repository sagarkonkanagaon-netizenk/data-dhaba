import { useEffect, useState } from 'react'
import './stuck.css'
import { STUCK } from '../data/stuck.js'

// A ladder for when a learner is stuck: a nudge first, then the approach in words.
// The answer stays in the reveal panel below, so each step gives away a little more.
export default function Stuck({ lab, n }) {
  const steps = (STUCK[lab] || {})[n]
  const [level, setLevel] = useState(0)
  useEffect(() => { setLevel(0) }, [lab, n])
  if (!steps) return null
  const labels = ['Stuck? Get a hint', 'Still stuck? Show the approach']
  return (
    <div className="stuck" aria-live="polite">
      {steps.slice(0, level).map((s, i) => (
        <div key={i} className="stuck-step">
          <span className="stuck-k">{i === 0 ? 'Hint' : 'Approach'}</span>
          <p>{s}</p>
        </div>
      ))}
      {level < steps.length
        ? <button className="btn btn-ghost btn-sm" onClick={() => setLevel(level + 1)}>💡 {labels[level]}</button>
        : <p className="small muted" style={{ margin: 0 }}>Try writing it now. The full answer is in “Reveal the answer” below if you need it.</p>}
    </div>
  )
}
