import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import { DESIGN_CASES } from '../pro/designPro.js'
import { useProContent } from '../lib/proContent.js'
import { NotFound } from './Misc.jsx'

// Data system design cases. Everyone sees the title, level and the interviewer's brief (src/pro/designPro.js);
// the full walk-through (numbers, architecture, trade-offs, failure modes, 90-second answer) is Pro, from design.json.

export function DesignIndex() {
  return (
    <div className="page">
      <div className="container">
        <Link to="/interview" className="small">← Interview prep</Link>
        <div className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">System design · {DESIGN_CASES.length} cases</div>
          <h1>The round that decides senior offers.</h1>
          <p>Each case starts with the brief an interviewer reads out. Pro walks you through the rest the way a strong candidate would: the questions to ask, the numbers worked out, the architecture, the deep dives, trade-offs, failure modes, and a 90-second answer you can say out loud.</p>
        </div>
        <div className="grid g2 design-grid">
          {DESIGN_CASES.map((c) => (
            <Link key={c.slug} to={`/interview/design/${c.slug}`} className="card card-pad card-link design-card">
              <div className="design-meta"><span className="design-n">{String(c.n).padStart(2, '0')}</span><span className="chip">{c.domain}</span><span className="small muted">{c.level}</span></div>
              <h3>{c.title}</h3>
              <p className="muted small design-brief">{c.brief.replace(/^"|"$/g, '')}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DesignCase() {
  const { slug } = useParams()
  const i = DESIGN_CASES.findIndex((c) => c.slug === slug)
  const { pro, data, err } = useProContent('design.json')
  if (i < 0) return <NotFound />
  const meta = DESIGN_CASES[i]
  const next = DESIGN_CASES[(i + 1) % DESIGN_CASES.length]
  let main
  if (!pro) {
    main = (
      <>
        <h2 className="ds-h">The brief</h2>
        <blockquote className="design-quote">{meta.brief.replace(/^"|"$/g, '')}</blockquote>
        <ProGate what={`the full walk-through of all ${DESIGN_CASES.length} design cases`} />
      </>
    )
  } else if (err) main = <p className="err" role="alert">{err}</p>
  else if (!data) main = <span className="loading"><span className="spinner" /> Loading the case…</span>
  else {
    const c = data.find((x) => x.slug === slug)
    main = c ? <Protected><Markdown md={c.md} className="prose design-body no-try" /></Protected> : <p className="muted">This case is still uploading. Try again in a minute.</p>
  }
  return (
    <div className="page">
      <div className="container design-page">
        <Link to="/interview/design" className="small">← All design cases</Link>
        <header className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">Case {String(meta.n).padStart(2, '0')} · {meta.domain} · {meta.level}</div>
          <h1>{meta.title}</h1>
          <div className="chips">{meta.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        </header>
        {main}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <Link className="btn btn-ghost" to={`/interview/design/${next.slug}`}>Next: {next.title} →</Link>
        </div>
      </div>
    </div>
  )
}
