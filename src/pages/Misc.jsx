import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { PAYMENTS_LIVE, PAYMENTS_TEST, getTier, hasPro } from '../lib/tier.js'
import { buyPro, inIndia, loadPrices, money, takePaidNote } from '../lib/pay.js'
import { useSignedIn } from '../components/Gate.jsx'
import Waitlist from '../components/Waitlist.jsx'
import { SHEETS } from '../pro/cheatsheets.js'
import { PRO_SHEETS } from '../pro/cheatsheetsPro.js'
const SHEET_COUNT = SHEETS.length
import { PRO_PRICE, PRO_PLANS, PRO_PILLARS, PRO_PROJECTS, PRO_CHEATSHEETS, PRO_PROJECT_COUNT, PRO_FAQ, PRO_FAQ_LIVE, PRO_TODAY, PRO_LADDER, PRO_LADDER_READY } from '../data/pro.js'
import guide from '../content/guide.json'
import { POLICIES } from '../data/policies.js'
import { BRAND, CERTS, FREE_PLATFORMS, MANTRAS, FINAL_WORD } from '../data/extras.js'
import { useProgress, toggleIn } from '../lib/progress.js'

const clean = (t) => t.replace(/^\S*\s*Project/, 'Project').replace(/^[^\w]+/, '')

export function Projects() {
  const p = useProgress()
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">Portfolio projects</div>
          <h1>Build things you can talk about</h1>
          <p>Six projects that map to what interviewers ask. Build them on Databricks Free Edition and an Azure free account, push the code to GitHub, and write a README that explains each design choice.</p>
        </div>
        <div className="grid g2">
          {guide.projects.map((pr, i) => {
            const id = 'proj' + (i + 1)
            return (
              <div key={pr.title} className="card card-pad">
                <div className="spread"><span className="chip chip-primary">{clean(pr.title).split(' · ')[0]}</span>{p.checks[id] && <span className="chip chip-ok">Built</span>}</div>
                <h2 style={{ margin: '12px 0 6px' }}>{clean(pr.title).split(' · ').slice(1).join(' · ') || clean(pr.title)}</h2>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>{pr.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                <p className="muted small">{pr.why}</p>
                <ol style={{ paddingLeft: '1.2em', margin: '8px 0 12px' }}>{pr.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                <label className="row small"><input type="checkbox" checked={!!p.checks[id]} onChange={() => toggleIn('checks', id)} /> I built this and pushed it to GitHub</label>
              </div>
            )
          })}
        </div>
        <div className="card card-pad" style={{ marginTop: 28 }}>
          <h3>Want worked examples?</h3>
          <p className="muted">The Pro career-ladder projects are full worked examples, with starter code, tests and a solution walkthrough, so you can see what a finished project looks like.</p>
        </div>
      </div>
    </div>
  )
}

function ResCard({ r }) {
  return (
    <a href={r.href} target="_blank" rel="noreferrer" className="card card-pad card-link">
      <b>{r.title}</b>
      {r.by && <div className="small muted" style={{ margin: '4px 0' }}>{r.by}</div>}
      <p className="small" style={{ margin: 0 }}>{r.desc}</p>
    </a>
  )
}

export function Resources() {
  const yt = guide.resources.filter((r) => r.kind === 'yt').map((r) => ({ ...r, by: r.by.replace(/^by\s*/, '').replace(/\s*FREE$/, '') }))
  const paid = guide.resources.filter((r) => r.kind === 'udemy').map((r) => ({ ...r, by: 'Udemy · paid, wait for a sale' }))
  const free = [...FREE_PLATFORMS, { title: 'LeetCode Database problems', href: 'https://leetcode.com/problemset/database/', desc: 'Free-tier SQL problems with a judge, sorted by difficulty.' }]
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">Resources</div>
          <h1>The best of the rest, curated</h1>
          <p>These are the videos and platforms worth your time, plus the certifications that matter and when to take them.</p>
        </div>
        <div className="section-head"><h2>Certifications</h2></div>
        <div className="grid g3">
          {CERTS.map((c) => (
            <div key={c.code} className="card card-pad">
              <div className="spread"><span className="chip chip-primary">{c.code}</span><span className="chip">{c.tier}</span></div>
              <h3 style={{ margin: '10px 0 4px' }}>{c.name}</h3>
              <div className="small muted">{c.when}</div>
              <p className="small">{c.why}</p>
            </div>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: 40 }}><h2>Free platforms to practise on</h2></div>
        <div className="grid g3">{free.map((r) => <ResCard key={r.title} r={r} />)}</div>
        <div className="section-head" style={{ marginTop: 40 }}><h2>Free video courses</h2></div>
        <div className="grid g4">{yt.map((r) => <ResCard key={r.title} r={r} />)}</div>
        <div className="section-head" style={{ marginTop: 40 }}><h2>Paid courses, if you want structure</h2><p>Optional. Udemy runs sales most weeks, so never pay full price.</p></div>
        <div className="grid g3">{paid.map((r) => <ResCard key={r.title} r={r} />)}</div>
      </div>
    </div>
  )
}

export function About() {
  return (
    <div className="page">
      <div className="container narrow">
        <div className="page-head">
          <div className="eyebrow">About</div>
          <h1>Why this exists</h1>
          <p>Most data engineering courses stop at slides. {BRAND.name} is hands-on and built from real production work: you write SQL and Python that actually runs, fix broken pipelines, and practise the interviews.</p>
        </div>
        <div className="card card-pad">
          <h3>Made by working data engineers</h3>
          <p className="muted">The handbooks, notes and interview material here come from years of building and running data platforms in production.</p>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <a className="btn btn-ghost btn-sm" href={`mailto:${BRAND.email}`}>Email</a>
          </div>
        </div>
        <h2 style={{ marginTop: 32 }}>Mantras</h2>
        <ul className="ticks">{MANTRAS.map((m) => <li key={m}>{m}</li>)}</ul>
        <div className="note" style={{ marginTop: 24 }}>{FINAL_WORD}</div>
        <div className="row" style={{ marginTop: 20 }}><Link className="btn btn-primary" to="/path">Start the path</Link><Link className="btn btn-ghost" to="/practice/sql">Open the SQL lab</Link></div>
      </div>
    </div>
  )
}

// What a free account keeps once Pro is on sale (matches FREE in lib/tier.js).
const FREE_LIVE = ['Weeks 1 and 2 of the 24-week path', 'The first 2 chapters of every handbook', 'Sample labs: SQL problems 1 to 5 and Python problems 1 to 3, auto-checked', 'The Playground, the daily challenge, flashcards and progress tracking', 'Two Spark scenes, one incident drill and three Atlas tool pages', 'No ads']
const FREE = ['The full 24-week path and every handbook', 'SQL lab: 78 questions, auto-checked', 'Python lab with auto-checks', 'Incident drills, scenario and PySpark questions', 'Flashcards and progress tracking', 'No ads']
export function Pro() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const signedIn = useSignedIn()
  // Checkout is open to everyone with live keys; with test keys only on /pro?test=1, so visitors never see it.
  const selling = PAYMENTS_LIVE || (PAYMENTS_TEST && params.get('test') === '1')
  const [plan, setPlan] = useState('')
  const [prices, setPrices] = useState(null)
  const [cur, setCur] = useState(() => (inIndia() ? 'INR' : 'USD'))
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(takePaidNote)
  useEffect(() => { if (selling) loadPrices().then(setPrices).catch(() => setPrices({ prices: { INR: { '6m': 249900, '1y': 359900 } } })) }, [selling])
  // USD shows only once the payment server has USD prices; until then everyone pays in rupees.
  const usd = Boolean(prices?.prices?.USD)
  const currency = cur === 'USD' && usd ? 'USD' : 'INR'
  const priceOf = (pl) => (currency === 'USD' ? money(prices.prices.USD[pl.id], 'USD') : pl.amount)
  const pick = (name) => { setPlan(name); document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  async function buy(pl) {
    setErr(''); setDone(null)
    if (!signedIn) { navigate(`/account?next=${encodeURIComponent('/pro' + (selling && !PAYMENTS_LIVE ? '?test=1' : ''))}`); return }
    setBusy(pl.id)
    try { const r = await buyPro(pl.id, currency); if (r) setDone(r) } catch (e) { setErr(e.message || String(e)) } finally { setBusy('') }
  }
  const tier = getTier()
  return (
    <div className="page">
      <div className="container">
        {selling && !PAYMENTS_LIVE && <div className="note" role="status" style={{ marginBottom: 16 }}><b>Test mode.</b> Payments use Razorpay test keys: no real money moves. Only you can see this page.</div>}
        <div className="page-head center" style={{ marginInline: 'auto' }}>
          <div className="eyebrow">Data Dhaba Pro · {selling ? 'Open now' : PRO_PRICE.status}</div>
          <h1>Everything between learning and getting hired.</h1>
          {selling
            ? <p>The course teaches you data engineering. Pro gives you the finish: every chapter, lab answer and drill, plus {PRO_LADDER_READY} career-ladder projects built end to end, with more added as they are finished.</p>
            : <p>The course teaches you data engineering. Pro gives you the portfolio, the shortcuts and the interview practice that land the job: {PRO_PROJECT_COUNT} end-to-end projects, 60+ cheat sheets, 500+ interview answers and an AI mock interviewer.</p>}
        </div>

        {(done || hasPro()) && selling && (
          <div className="card card-pad pro-done" role="status" style={{ marginBottom: 16, borderColor: 'var(--ok, #2ea86b)' }}>
            <h3 style={{ marginTop: 0 }}>{done ? '🎉 Pro is on. Welcome in!' : 'You have Pro'}</h3>
            <p className="muted">{tier.owner ? 'Owner access: everything is open.' : `Your Pro runs until ${done?.until || tier.until}.`} Buying again adds the time to your current end date.</p>
            <div className="row" style={{ flexWrap: 'wrap' }}><Link className="btn btn-primary" to="/pro/ladder">Open your Pro projects</Link><Link className="btn btn-ghost" to="/account">Your account and receipts</Link></div>
          </div>
        )}

        {selling && usd && (
          <p className="small muted center" style={{ marginTop: 0 }}>
            {currency === 'INR' ? <>Prices in Indian rupees. <button className="linkish" onClick={() => setCur('USD')}>Paying from outside India?</button></> : <>Prices in US dollars. <button className="linkish" onClick={() => setCur('INR')}>Paying from India?</button></>}
          </p>
        )}
        <div className="pro-plans">
          {PRO_PLANS.map((pl) => (
            <div key={pl.id} className={'card pro-plan' + (pl.best ? ' best' : '')}>
              <div className="spread"><span className="chip">{pl.name}</span>{pl.best ? <span className="chip chip-primary">Best value</span> : <span className="chip chip-warn">{selling ? 'One-time' : PRO_PRICE.status}</span>}</div>
              <div className="price">{selling ? priceOf(pl) : pl.amount}</div>
              <div className="small muted">{pl.per}{currency === 'INR' || !selling ? ` · ${pl.sub}` : ''}</div>
              {selling
                ? <button className={'btn ' + (pl.best ? 'btn-primary' : 'btn-ghost')} disabled={Boolean(busy)} onClick={() => buy(pl)}>{busy === pl.id ? 'Opening checkout…' : signedIn ? `Get Pro · ${pl.name}` : 'Sign in to buy'}</button>
                : <button className={'btn ' + (pl.best ? 'btn-primary' : 'btn-ghost')} onClick={() => pick(pl.name)}>Join the waitlist</button>}
            </div>
          ))}
        </div>
        {err && <p className="err center" role="alert">{err}</p>}
        <p className="small muted center" style={{ marginTop: 0 }}>{selling
          ? <>One-time payment, no auto-renew. Full refund within 7 days (<Link to="/refund">refund policy</Link>). Pay with UPI, cards, net banking or wallets through Razorpay.</>
          : 'Coming soon. No payment now: you get an email the day it opens.'}</p>

        {selling && (
          <>
            <h2 className="ds-h">In Pro today</h2>
            <div className="card card-pad"><ul className="ticks">{PRO_TODAY.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </>
        )}

        {!selling && <div id="waitlist" className="wl-wrap"><Waitlist plan={plan} /></div>}

        <h2 className="ds-h">Preview Pro</h2>
        <div className="grid g2 pro-preview">
          <Link to="/pro/projects/food-delivery-lakehouse" className="card card-pad card-link">
            <span className="chip chip-ok">Preview</span>
            <h3>Project 1: Food-delivery lakehouse</h3>
            <p className="muted">The whole thing, unlocked: a brief from your lead, messy data to download, 7 build steps with solutions and checkpoints, a README and interview answers.</p>
            <b className="how-link">Open the project →</b>
          </Link>
          <Link to="/pro/cheatsheets" className="card card-pad card-link">
            <span className="chip chip-ok">Preview</span>
            <h3>{SHEET_COUNT} printable cheat sheets</h3>
            <p className="muted">Window functions, joins and their traps, the PySpark API, Delta Lake commands and Spark tuning. One page each, ready to print.</p>
            <b className="how-link">Open the cheat sheets →</b>
          </Link>
        </div>

        <h2 className="ds-h">{selling ? 'On the way to Pro' : 'What you get'}</h2>
        {selling && <p className="muted" style={{ marginTop: -4 }}>Being built now. Each part joins Pro as it is finished.</p>}
        <div className="grid g2 pro-pillars">
          {PRO_PILLARS.map((x) => (
            <div key={x.t} className="card card-pad pro-pillar">
              <b className="pro-k">{x.k}</b>
              <div><h3>{x.t} {x.ready && <span className="chip chip-ok">In Pro now</span>}</h3><p className="muted">{x.d}</p>{x.to && <Link to={x.to} className="how-link small">Open →</Link>}</div>
            </div>
          ))}
        </div>

        <h2 className="ds-h">{selling ? <>The project catalogue <span className="small muted">{PRO_PROJECT_COUNT} planned, in build</span></> : <>The {PRO_PROJECT_COUNT} projects</>}</h2>
        <p className="muted" style={{ marginTop: -4 }}>Each one is a portfolio piece: a brief, messy data, a step-by-step build, a solution walkthrough and a README ready for GitHub.</p>
        <div className="grid g2">
          {PRO_PROJECTS.map((g, i) => (
            <details key={g.group} className="card card-pad pro-group" open={i === 0}>
              <summary><h3>{g.group}</h3><span className="chip">{g.items.length}</span></summary>
              <ol className="pro-list" start={PRO_PROJECTS.slice(0, i).reduce((a, x) => a + x.items.length, 1)}>{g.items.map((it, j) => <li key={it}>{i === 0 && j === 0 ? <><Link to="/pro/projects/food-delivery-lakehouse">{it}</Link> <span className="chip chip-ok">Preview</span></> : it}</li>)}</ol>
            </details>
          ))}
        </div>

        <h2 className="ds-h">The career ladder <span className="small muted">{PRO_LADDER_READY} of {PRO_LADDER.length} built</span> {selling && <Link className="small" to="/pro/ladder">open →</Link>}</h2>
        <p className="muted" style={{ marginTop: -4 }}>One project per role, from intern to head of data engineering. Each is built and checked end to end, with a brief, starter code, hints and a marking rubric. Solutions open with Pro.</p>
        <div className="card card-pad">
          <ol className="pro-list pro-ladder">{PRO_LADDER.map((p) => (
            <li key={p.n}><b>{p.title}</b> <span className="small muted">· {p.role}</span> {p.ready ? <span className="chip chip-ok">Ready</span> : <span className="chip">In build</span>}</li>
          ))}</ol>
        </div>

        <h2 className="ds-h">Cheat sheets <span className="small muted">60+ planned, including</span></h2>
        <div className="chips pro-chips">{PRO_CHEATSHEETS.map((c) => { const sh = SHEETS.find((x) => x.title.toLowerCase() === c.toLowerCase()); const ps = PRO_SHEETS.find((x) => x.title.toLowerCase() === c.toLowerCase()); return sh ? <Link key={c} to={`/pro/cheatsheets/${sh.slug}`} className="chip chip-ok">{c} · preview</Link> : ps ? <Link key={c} to={`/pro/cheatsheets/${ps.slug}`} className="chip">{c}</Link> : <span key={c} className="chip">{c}</span> })}</div>

        <h2 className="ds-h">What the course includes without Pro</h2>
        <div className="card card-pad">
          <ul className="ticks">{(selling ? FREE_LIVE : FREE).map((x) => <li key={x}>{x}</li>)}</ul>
          <Link className="btn btn-ghost" to="/path">Start learning</Link>
        </div>
        <h2 className="ds-h">Questions</h2>
        <div className="faq">
          {(selling ? PRO_FAQ_LIVE : PRO_FAQ).map((f) => (
            <details key={f.q} className="faq-item"><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
        <div className="card card-pad pro-end">
          <div><h3>Can't afford Pro?</h3><p className="muted">Students can ask for a free pass. Nobody should be priced out of learning.</p></div>
          <a className="btn btn-ghost" href={`mailto:${BRAND.email}?subject=${encodeURIComponent('Data Dhaba student pass')}`}>Ask for a student pass</a>
        </div>
      </div>
    </div>
  )
}

export function NotFound() {
  // A bare #anchor (not #/route) is never a page: go home instead of showing a dead end.
  if (typeof window !== 'undefined' && window.location.hash && !window.location.hash.startsWith('#/')) return <Navigate to="/" replace />
  return (
    <div className="page">
      <div className="container narrow center">
        <div style={{ fontSize: '3rem' }}>🧭</div>
        <h1>This page fell out of the pipeline</h1>
        <p className="muted">It may have moved. Try the path or search with Ctrl+K.</p>
        <div className="row" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" to="/">Home</Link><Link className="btn btn-ghost" to="/path">The path</Link></div>
      </div>
    </div>
  )
}

function Policy({ eyebrow, title, updated, sections }) {
  return (
    <div className="page">
      <div className="container narrow">
        <div className="page-head">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p className="small muted">Last updated {updated}</p>
        </div>
        <div className="prose">
          {sections.map(([h, body]) => (
            <section key={h}><h2>{h}</h2>{body.map((t) => <p key={t}>{t}</p>)}</section>
          ))}
          <p>Questions? Email <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.</p>
        </div>
      </div>
    </div>
  )
}

export function Privacy() {
  return <Policy {...POLICIES.privacy} />
}

export function Refund() {
  return <Policy {...POLICIES.refund} />
}

export function Shipping() {
  return <Policy {...POLICIES.shipping} />
}

export function Terms() {
  return <Policy {...POLICIES.terms} />
}
