import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ProGate from '../components/ProGate.jsx'
import ProjectReader from '../components/ProjectReader.jsx'
import { client } from '../lib/auth.js'
import { getTier } from '../lib/tier.js'
import { usePro } from '../lib/proContent.js'
import { PRO_LADDER, PRO_LADDER_READY } from '../data/pro.js'
import ProBadge from '../components/ProBadge.jsx'

// The career-ladder projects for Pro members. The files live in a private Supabase Storage bucket; the database
// hands them only to accounts with Pro (supabase/payments.sql), so this page cannot be unlocked from the browser.
async function fetchFile(name) {
  const sb = await client()
  if (!sb) throw new Error('Accounts are not set up on this site.')
  const { data, error } = await sb.storage.from('pro').download(`projects/${name}`)
  if (error) throw new Error(/not.?found|400|403/i.test(error.message || '') ? 'Your account does not have Pro, or this project is not uploaded yet.' : error.message)
  return data
}
async function readJson(blob, gz) {
  if (gz) {
    try { return JSON.parse(await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).text()) } catch (e) { /* the browser may have unzipped it already */ }
  }
  return JSON.parse(await blob.text())
}
const pad = (n) => String(n).padStart(2, '0')

export default function ProLadder() {
  const { n } = useParams()
  const navigate = useNavigate()
  const pro = usePro()
  const [index, setIndex] = useState(null)
  const [project, setProject] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!pro) return
    fetchFile('index.json').then((b) => readJson(b, false)).then(setIndex).catch((e) => setErr(e.message))
  }, [pro])

  useEffect(() => {
    if (!pro || !n || !index) { setProject(null); return }
    const p = index.projects.find((x) => x.n === Number(n))
    if (!p) { setErr(`Project ${n} is not uploaded yet.`); return }
    setErr(''); setProject({ n: p.n, loading: true })
    fetchFile(p.file).then((b) => readJson(b, true)).then((data) => {
      setProject({ n: p.n, ...data })
      setTimeout(() => document.querySelector('.owner-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }).catch((e) => { setErr(e.message); setProject(null) })
  }, [pro, n, index])

  const meta = (k) => PRO_LADDER.find((x) => x.n === k)
  const tier = getTier()

  return (
    <div className="page"><div className="container">
      <div className="page-head">
        <div className="eyebrow">Pro · Career ladder · {PRO_LADDER_READY} of {PRO_LADDER.length} built</div>
        <h1>Your Pro projects</h1>
        <p className="muted">One project per role, from intern to head of data engineering. Each has a brief, starter code, the full solution, tests, a walkthrough and a README for your GitHub. New ones appear here as they are finished.</p>
        {pro && <p className="row small muted" style={{ gap: 10 }}><ProBadge size={40} label /><span>{tier.owner ? 'Owner access.' : tier.until ? `Member until ${tier.until}.` : 'Member.'}</span></p>}
        {pro && (
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 8 }} aria-label="Everything in your Pro">
            <Link className="btn btn-ghost btn-sm" to="/pro/lessons">Spark course · 56 lessons</Link>
            <Link className="btn btn-ghost btn-sm" to="/pro/python">Python course · 50 lessons</Link>
            <Link className="btn btn-ghost btn-sm" to="/practice/python/101">Pro Python problems · 100</Link>
            <Link className="btn btn-ghost btn-sm" to="/drills">On-call drills · 108</Link>
            <Link className="btn btn-ghost btn-sm" to="/spark-visual">Spark issue library · 156</Link>
            <Link className="btn btn-ghost btn-sm" to="/learn/python">Python deep dives · 4</Link>
            <Link className="btn btn-ghost btn-sm" to="/practice">SQL and Python labs</Link>
            <Link className="btn btn-ghost btn-sm" to="/interview/kit">Interview kit · 300 questions</Link>
            <Link className="btn btn-ghost btn-sm" to="/interview/job-kit">Job kit</Link>
          </div>
        )}
      </div>

      {!pro ? (
        <>
          <div className="card card-pad">
            <ol className="pro-list pro-ladder">{PRO_LADDER.map((p) => (
              <li key={p.n}><b>🔒 {p.title}</b> <span className="small muted">· {p.role}</span> {p.ready ? <span className="chip chip-ok">Ready</span> : <span className="chip">In build</span>}</li>
            ))}</ol>
          </div>
          <ProGate what={`all ${PRO_LADDER_READY} career-ladder projects with full solutions`} />
        </>
      ) : (
        <>
          <div className="grid g2" style={{ gap: 8, marginBottom: 16 }}>
            {PRO_LADDER.map((p) => {
              const up = index?.projects.some((x) => x.n === p.n)
              return (
                <button key={p.n} disabled={!up} className={`card card-pad owner-proj${Number(n) === p.n ? ' on' : ''}`} style={{ textAlign: 'left', opacity: up ? 1 : 0.6 }}
                  onClick={() => navigate(`/pro/ladder/${p.n}`)}>
                  <b>P{pad(p.n)} · {p.title}</b>
                  <div className="small muted">{p.role} · {up ? `${index.projects.find((x) => x.n === p.n).files} files` : index ? 'Coming soon' : 'Loading…'}</div>
                </button>
              )
            })}
          </div>
          {err && <p className="err" role="alert">{err} <Link to="/contact">Contact us</Link> if this looks wrong.</p>}
          {project?.loading && <p className="muted"><span className="spinner" /> Opening P{pad(project.n)}…</p>}
          {project?.files && <><h2 className="ds-h">P{pad(project.n)} · {meta(project.n)?.title}</h2><ProjectReader key={project.n} project={project} /></>}
        </>
      )}
    </div></div>
  )
}
