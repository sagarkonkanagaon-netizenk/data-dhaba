import { Link, useParams } from 'react-router-dom'
import ProGate from '../components/ProGate.jsx'
import ProjectReader from '../components/ProjectReader.jsx'
import { TEMPLATES } from '../pro/templatesPro.js'
import { useProContent } from '../lib/proContent.js'
import { NotFound } from './Misc.jsx'

// Production templates: everyone sees what each one is; Pro opens every file (read-only, like other Pro content).
// Set TEMPLATE_DOWNLOAD to true to let Pro members download a template as a .tar to start their own repo.
export const TEMPLATE_DOWNLOAD = false

export function TemplateIndex() {
  return (
    <div className="page">
      <div className="container">
        <Link to="/pro" className="small">← Data Dhaba Pro</Link>
        <div className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">Production templates · {TEMPLATES.length}</div>
          <h1>Start where real teams start.</h1>
          <p>Each template is a complete repo laid out the way production data teams lay theirs out, with tests and a CI workflow already wired. Every test suite was run before it shipped: Spark and Delta locally, Kafka against a real broker, Airflow, dbt and Terraform with their own tools.</p>
        </div>
        <div className="grid g2 tpl-grid">
          {TEMPLATES.map((t) => (
            <Link key={t.slug} to={`/pro/templates/${t.slug}`} className="card card-pad card-link tpl-card">
              <div className="design-meta"><span className="design-n">{String(t.n).padStart(2, '0')}</span><span className="small muted">{t.files} files</span></div>
              <h3>{t.title}</h3>
              <p className="muted small">{t.summary}</p>
              <div className="chips">{t.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TemplatePage() {
  const { slug } = useParams()
  const i = TEMPLATES.findIndex((t) => t.slug === slug)
  const { pro, data, err } = useProContent('templates.json')
  if (i < 0) return <NotFound />
  const meta = TEMPLATES[i]
  const next = TEMPLATES[(i + 1) % TEMPLATES.length]
  let main
  if (!pro) main = <ProGate what={`all ${TEMPLATES.length} production templates`} />
  else if (err) main = <p className="err" role="alert">{err}</p>
  else if (!data) main = <span className="loading"><span className="spinner" /> Loading the template…</span>
  else {
    const t = data.find((x) => x.slug === slug)
    main = t ? <ProjectReader key={t.slug} project={{ name: t.slug, files: t.files }} allowDownload={TEMPLATE_DOWNLOAD} /> : <p className="muted">This template is still uploading. Try again in a minute.</p>
  }
  return (
    <div className="page">
      <div className="container">
        <Link to="/pro/templates" className="small">← All templates</Link>
        <header className="page-head" style={{ marginTop: 14 }}>
          <div className="eyebrow">Template {String(meta.n).padStart(2, '0')} · {meta.files} files</div>
          <h1 className="tpl-title">{meta.title}</h1>
          <p>{meta.summary}</p>
          <div className="chips">{meta.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </header>
        {main}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <Link className="btn btn-ghost" to={`/pro/templates/${next.slug}`}>Next: {next.title} →</Link>
        </div>
      </div>
    </div>
  )
}
