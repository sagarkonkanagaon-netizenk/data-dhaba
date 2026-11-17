import { useState } from 'react'
import Token from './Token.jsx'
import TokenReveal from './TokenReveal.jsx'
import { tokensOf } from '../data/tokens.js'
import { PATTERN_OF } from '../data/sqlPatterns.js'
import { useProgress } from '../lib/progress.js'
import './tokencabinet.css'

// Every token, earned or locked, with progress towards the next. Tap an earned one to replay its reveal.
export default function TokenCabinet() {
  const p = useProgress()
  const all = tokensOf(p, PATTERN_OF)
  const [show, setShow] = useState(null)
  const got = all.filter((t) => t.earned).length
  return (
    <section id="tokens" className="tkc" aria-labelledby="tkc-h">
      <div className="spread"><h2 id="tkc-h">SQL badges</h2><span className="small muted">{got} of {all.length} collected · built to be hard</span></div>
      <div className="tkc-grid">
        {all.map((t) => (
          <button key={t.id} type="button" className={'tkc-item' + (t.earned ? ' got' : '')} onClick={() => t.earned && setShow(t)} disabled={!t.earned} aria-label={t.earned ? `${t.title}, ${t.name}. Replay the reveal` : `${t.title}, locked, ${t.pct}% of the way`}>
            <Token token={t} size={96} locked={!t.earned} spin={t.earned} />
            <b>{t.title}</b>
            <span className="small muted">{t.desc}</span>
            {t.earned
              ? <span className="tkc-tag">Earned · tap to replay</span>
              : (
                <span className="tkc-reqs">
                  {t.reqs.map((r) => (
                    <span key={r.label} className={'tkc-prog' + (r.ok ? ' ok' : '')} title={r.label}>
                      <span className="tkc-l">{r.ok ? '✓ ' : ''}{r.label}</span>
                      <span className="tkc-bar"><i style={{ width: (100 * r.have / r.need) + '%' }} /></span>
                      <small>{r.have} / {r.need}</small>
                    </span>
                  ))}
                </span>
              )}
          </button>
        ))}
      </div>
      {show && <TokenReveal token={show} onClose={() => setShow(null)} />}
    </section>
  )
}
