import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import guide from '../content/guide.json'
import sqlQ from '../content/sql-questions.json'
import pyQ from '../content/py-questions.json'
import scen from '../content/scenarios.json'
import { useProgress, update } from '../lib/progress.js'
import { EXTRA_CARDS } from '../data/flashcards.js'
import TruckArt from '../components/TruckArt.jsx'
import './flashcards.css'

// Leitner boxes: 1 = daily, 2 = every 3 days, 3 = weekly, 4 = every 2 weeks, 5 = monthly
const INTERVAL = [0, 1, 3, 7, 14, 30]
const DAY = 86400000

function buildDeck() {
  const deck = []
  for (const q of guide.qa) deck.push({ id: 'g:' + q.q, topic: q.topic.replace(/^\S+\s/, '').split(' — ')[0], q: q.q, a: q.a })
  for (const q of sqlQ.questions.filter((x) => x.mode === 'concept' || x.n >= 70)) deck.push({ id: 's:' + q.n, topic: 'SQL', q: q.title, a: q.note, code: q.answer })
  for (const q of pyQ.questions.filter((x) => x.section === 'PySpark')) deck.push({ id: 'p:' + q.n, topic: 'PySpark', q: q.title, a: q.note, code: q.answer })
  for (const s of scen.sections) for (const q of s.questions) if (q.summary) deck.push({ id: 'c:' + q.n, topic: 'Scenario', q: q.title, a: q.summary })
  EXTRA_CARDS.forEach((c, i) => deck.push({ id: 'x:' + i, ...c }))
  // Every card owns one truck-art banner, numbered by its place in the deck.
  deck.forEach((c, i) => { c.art = i + 1 })
  return deck
}

function Tarp({ n, small }) {
  return (
    <div className={'fc-tarp' + (small ? ' small' : '')} aria-label={`Truck art number ${n}, still covered`}>
      <span className="fc-tarp-no">No.{String(n).padStart(3, '0')}</span>
      {!small && <span className="fc-tarp-txt">🔒 Get this card right to uncover its truck art</span>}
    </div>
  )
}

export default function Flashcards() {
  const deck = useMemo(buildDeck, [])
  const topics = useMemo(() => ['All', ...new Set(deck.map((c) => c.topic))], [deck])
  const p = useProgress()
  const [topic, setTopic] = useState('All')
  const [flipped, setFlipped] = useState(false)
  const [skip, setSkip] = useState(0)
  const [fresh, setFresh] = useState(null)
  const [yard, setYard] = useState(false)
  const now = Date.now()
  const pool = deck.filter((c) => topic === 'All' || c.topic === topic)
  const due = pool.filter((c) => !p.cards[c.id] || p.cards[c.id].due <= now)
  const card = due.length ? due[skip % due.length] : null
  const mastered = pool.filter((c) => p.cards[c.id]?.box >= 4).length
  const owned = deck.filter((c) => p.cards[c.id]?.art).length

  function grade(g) {
    const cur = p.cards[card.id]?.box || 0
    const box = g === 'again' ? 1 : g === 'hard' ? Math.max(1, cur) : Math.min(5, cur + 1)
    const had = !!p.cards[card.id]?.art
    const art = had || g === 'good'
    update((s) => { s.cards = { ...s.cards, [card.id]: { box, due: Date.now() + (g === 'again' ? 60000 : INTERVAL[box] * DAY), ...(art ? { art: true } : {}) } } })
    if (art && !had) setFresh(card)
    setFlipped(false)
    if (g === 'again') setSkip((x) => x + 1)
  }

  return (
    <div className="page">
      <div className="container narrow">
        <Link to="/interview" className="small">← Interview prep</Link>
        <div className="page-head" style={{ marginTop: 10 }}>
          <div className="eyebrow">Flashcards · spaced repetition</div>
          <h1>Five minutes a day</h1>
          <p>Cards you know come back less often; cards you miss come back soon. {deck.length} cards across SQL, Spark, Python, Kafka, Airflow, dbt, Snowflake, Databricks, modelling, streaming and system design. Each card hides its own hand-painted Data Dhaba truck. Get the card right to uncover it.</p>
        </div>
        <div className="tabs" style={{ marginBottom: 18 }}>
          {topics.map((t) => <button key={t} className={t === topic ? 'on' : ''} onClick={() => { setTopic(t); setFlipped(false); setSkip(0) }}>{t}</button>)}
        </div>
        <div className="row small muted" style={{ marginBottom: 12 }}>
          <span><b style={{ color: 'var(--text)' }}>{due.length}</b> due now</span><span>·</span><span><b style={{ color: 'var(--text)' }}>{mastered}</b> of {pool.length} mastered</span><span>·</span>
          <button type="button" className="fc-yard-btn" onClick={() => setYard((y) => !y)}>🚚 Truck yard {owned}/{deck.length}</button>
        </div>
        {card ? (
          <>
            <div className={'flash' + (flipped ? ' flipped' : '')} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped((f) => !f) } }} aria-label="Flip card">
              <div className="flash-inner">
                <div className="flash-face card">
                  <div className="fc-banner">{p.cards[card.id]?.art ? <TruckArt n={card.art} /> : <Tarp n={card.art} />}</div>
                  <span className="chip" style={{ alignSelf: 'flex-start' }}>{card.topic}</span>
                  <div className="q">{card.q}</div>
                  <div className="small muted center">Tap to see the answer</div>
                </div>
                <div className="flash-face flash-back card">
                  <span className="chip chip-primary" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>{card.topic} · answer</span>
                  <div className="a">{card.a}</div>
                  {card.code && <pre className="out" style={{ background: 'var(--code-bg)', color: 'var(--code-text)', borderRadius: 10, marginTop: 12, overflowX: 'auto' }}>{card.code}</pre>}
                </div>
              </div>
            </div>
            {flipped ? (
              <div className="grade">
                <button className="btn btn-ghost" onClick={() => grade('again')}>Again</button>
                <button className="btn btn-ghost" onClick={() => grade('hard')}>Hard</button>
                <button className="btn btn-primary" onClick={() => grade('good')}>Got it</button>
              </div>
            ) : (
              <div className="grade" style={{ gridTemplateColumns: '1fr' }}><button className="btn btn-ghost" onClick={() => setFlipped(true)}>Show answer</button></div>
            )}
          </>
        ) : (
          <div className="card empty" style={{ display: yard ? 'none' : undefined }}>
            <div style={{ fontSize: '2rem' }}>🎉</div>
            <h3>All caught up</h3>
            <p>No cards due in this topic. Come back tomorrow, or pick another topic.</p>
          </div>
        )}
        {yard && (
          <section className="fc-yard" aria-labelledby="fc-yard-h">
            <div className="spread"><h2 id="fc-yard-h">Your truck yard</h2><span className="small muted">{owned} of {deck.length} uncovered</span></div>
            <p className="small muted">Every card has its own hand-painted Data Dhaba lorry. Answer a card right once and its truck joins your yard.</p>
            <div className="fc-yard-grid">
              {deck.map((c) => p.cards[c.id]?.art
                ? <TruckArt key={c.id} n={c.art} className="fc-thumb" />
                : <Tarp key={c.id} n={c.art} small />)}
            </div>
          </section>
        )}
      </div>
      {fresh && (
        <div className="fc-reveal" role="dialog" aria-modal="true" aria-label="New truck art uncovered" onClick={() => setFresh(null)}>
          <div className="fc-reveal-card" onClick={(e) => e.stopPropagation()}>
            <span className="fc-reveal-k">New truck uncovered</span>
            <div className="fc-reveal-art"><TruckArt n={fresh.art} /></div>
            <b>No.{String(fresh.art).padStart(3, '0')} joins your yard</b>
            <span className="small muted">{owned} of {deck.length} collected</span>
            <button type="button" className="btn btn-primary" onClick={() => setFresh(null)} autoFocus>Next card</button>
          </div>
        </div>
      )}
    </div>
  )
}
