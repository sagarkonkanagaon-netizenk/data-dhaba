import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import Markdown from '../components/Markdown.jsx'
import { useProContent } from '../lib/proContent.js'

// The Pro Spark course: 56 lessons, each with how it works, runnable code, Spark UI signs, mistakes and an
// interview answer. The text comes from Pro storage, so only Pro members can open it.
export default function ProLessons() {
  const { slug } = useParams()
  const { pro, data, err } = useProContent('spark-lessons.json')
  const sections = useMemo(() => {
    const out = []
    for (const l of data || []) {
      let s = out.find((x) => x.name === l.section)
      if (!s) out.push((s = { name: l.section, lessons: [] }))
      s.lessons.push(l)
    }
    return out
  }, [data])
  useEffect(() => { window.scrollTo?.(0, 0) }, [slug])

  const head = (
    <div className="page-head">
      <div className="eyebrow">Pro · Spark course</div>
      <h1>Spark, from first job to interview level</h1>
      <p className="muted">56 lessons in 7 parts. Each one has the idea in one line, how it works, code checked on Spark 4, what you see in the Spark UI, common mistakes, an interview answer and three check questions.</p>
    </div>
  )
  if (!pro) return <div className="page"><div className="container">{head}<ProGate what="all 56 Spark lessons" /></div></div>
  if (err) return <div className="page"><div className="container">{head}<p className="err" role="alert">{err}</p></div></div>
  if (!data) return <div className="page container"><span className="loading"><span className="spinner" /> Loading lessons…</span></div>

  const idx = slug ? data.findIndex((l) => l.slug === slug) : -1
  const l = idx >= 0 ? data[idx] : null
  if (slug && !l) return <div className="page container">Lesson not found. <Link to="/pro/lessons">All Spark lessons</Link></div>
  if (l) {
    const prev = data[idx - 1]
    const next = data[idx + 1]
    return (
      <div className="page"><div className="container narrow">
        <Link to="/pro/lessons" className="small">← All Spark lessons</Link>
        <div className="row small muted" style={{ margin: '10px 0 8px' }}><span className="chip chip-pro">Pro</span><span>{l.section}</span><span>·</span><span>Lesson {idx + 1} of {data.length}</span></div>
        <Protected><Markdown md={l.md} /></Protected>
        <div className="chapter-foot">
          {prev ? <Link to={`/pro/lessons/${prev.slug}`}><small>← Previous</small>{prev.title}</Link> : <span />}
          {next ? <Link className="next" to={`/pro/lessons/${next.slug}`}><small>Next →</small>{next.title}</Link> : <Link className="next" to="/pro/lessons"><small>Done →</small>All lessons</Link>}
        </div>
      </div></div>
    )
  }
  let n = 0
  return (
    <div className="page"><div className="container">
      {head}
      {sections.map((s) => (
        <section key={s.name} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem' }}>{s.name}</h2>
          <div className="card">
            {s.lessons.map((x) => { n += 1; return (
              <Link key={x.slug} to={`/pro/lessons/${x.slug}`} className="linkrow" style={{ border: 0, borderBottom: '1px solid var(--line)', borderRadius: 0 }}>
                <span className="k" style={{ minWidth: 30 }}>{n}</span><span style={{ flex: 1 }}>{x.title}</span>
              </Link>
            ) })}
          </div>
        </section>
      ))}
    </div></div>
  )
}
