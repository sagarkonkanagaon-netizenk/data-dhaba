import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import { SHEETS } from '../pro/cheatsheets.js'
import { PRO_SHEETS } from '../pro/cheatsheetsPro.js'
import { useProContent } from '../lib/proContent.js'
import { NotFound } from './Misc.jsx'

// Cheat sheets: 5 open to everyone (src/pro/cheatsheets.js), 60 more in Pro. The Pro text comes from Pro storage
// (cheatsheets.json); this file only knows their titles. Pro sheets are read-only like the rest of Pro content.
const TOTAL = SHEETS.length + PRO_SHEETS.length

function byTag(list) {
  const groups = []
  for (const s of list) {
    let g = groups.find((x) => x.tag === s.tag)
    if (!g) groups.push((g = { tag: s.tag, sheets: [] }))
    g.sheets.push(s)
  }
  return groups.sort((a, b) => b.sheets.length - a.sheets.length || a.tag.localeCompare(b.tag))
}

export function SheetIndex() {
  const groups = useMemo(() => byTag(PRO_SHEETS), [])
  return (
    <div className="page">
      <div className="container">
        <Link to="/pro" className="small">← Data Dhaba Pro</Link>
        <div className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">Cheat sheets · {TOTAL}</div>
          <h1>One page. Everything you need.</h1>
          <p>Revise from them the night before an interview. {SHEETS.length} are open to everyone and print on one page. Pro adds {PRO_SHEETS.length} more, from Spark internals to Terraform, and every SQL, Python and Terraform example in them has been run and checked.</p>
        </div>
        <h2 className="ds-h">Open to everyone</h2>
        <div className="grid g3">
          {SHEETS.map((s) => (
            <Link key={s.slug} to={`/pro/cheatsheets/${s.slug}`} className="card card-pad card-link sheet-card">
              <span className="chip">{s.tag}</span>
              <h3>{s.title}</h3>
              <span className="small muted">Open and print →</span>
            </Link>
          ))}
        </div>
        <h2 className="ds-h">In Pro <span className="small muted">{PRO_SHEETS.length} sheets</span></h2>
        <div className="sheet-groups">
          {groups.map((g) => (
            <section key={g.tag} className="card card-pad sheet-group">
              <h3>{g.tag} <span className="small muted">{g.sheets.length}</span></h3>
              <ul className="sheet-list">
                {g.sheets.map((s) => <li key={s.slug}><Link to={`/pro/cheatsheets/${s.slug}`}>{s.title}</Link></li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function SheetBody({ s, pro }) {
  const body = <Markdown md={s.md} className="prose sheet-body no-try" />
  return (
    <article className="sheet">
      <header className="sheet-head">
        <div><span className="sheet-brand">data<b>dhaba</b> · cheat sheet</span><h1>{s.title}</h1></div>
        <span className={pro ? 'chip chip-pro' : 'chip'}>{pro ? `Pro · ${s.tag}` : s.tag}</span>
      </header>
      {pro ? <Protected>{body}</Protected> : body}
      <footer className="sheet-foot">datadhaba.in</footer>
    </article>
  )
}

function ProSheet({ slug }) {
  const meta = PRO_SHEETS.find((x) => x.slug === slug)
  const { pro, data, err } = useProContent('cheatsheets.json')
  const i = PRO_SHEETS.findIndex((x) => x.slug === slug)
  const next = PRO_SHEETS[(i + 1) % PRO_SHEETS.length]
  let main
  if (!pro) {
    main = (
      <>
        <article className="sheet">
          <header className="sheet-head">
            <div><span className="sheet-brand">data<b>dhaba</b> · cheat sheet</span><h1>{meta.title}</h1></div>
            <span className="chip chip-pro">Pro · {meta.tag}</span>
          </header>
        </article>
        <ProGate what={`all ${PRO_SHEETS.length} Pro cheat sheets`} />
      </>
    )
  } else if (err) main = <p className="err" role="alert">{err}</p>
  else if (!data) main = <span className="loading"><span className="spinner" /> Loading the sheet…</span>
  else {
    const s = data.find((x) => x.slug === slug)
    main = s ? <SheetBody s={s} pro /> : <p className="muted">This sheet is still uploading. Try again in a minute.</p>
  }
  return (
    <div className="page sheet-page">
      <div className="container">
        <div className="spread no-print"><Link to="/pro/cheatsheets" className="small">← All cheat sheets</Link></div>
        {main}
        <div className="row no-print" style={{ justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to={`/pro/cheatsheets/${next.slug}`}>Next: {next.title} →</Link>
        </div>
      </div>
    </div>
  )
}

export function Sheet() {
  const { slug } = useParams()
  const i = SHEETS.findIndex((s) => s.slug === slug)
  if (i < 0) return PRO_SHEETS.some((s) => s.slug === slug) ? <ProSheet slug={slug} /> : <NotFound />
  const s = SHEETS[i]
  const next = SHEETS[(i + 1) % SHEETS.length]
  return (
    <div className="page sheet-page">
      <div className="container">
        <div className="spread no-print">
          <Link to="/pro/cheatsheets" className="small">← All cheat sheets</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
        <SheetBody s={s} />
        <div className="row no-print" style={{ justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to={`/pro/cheatsheets/${next.slug}`}>Next: {next.title} →</Link>
          <Link className="btn btn-primary" to="/pro/cheatsheets">{PRO_SHEETS.length} more in Pro</Link>
        </div>
      </div>
    </div>
  )
}
