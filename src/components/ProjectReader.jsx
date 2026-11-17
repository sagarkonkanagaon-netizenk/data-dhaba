import { useMemo, useState } from 'react'
import Markdown from './Markdown.jsx'
import { highlight } from '../lib/md.js'
import { makeTar, saveBlob } from '../lib/tar.js'

// Reads one Pro project ({ name, files: [{ path, text }] }): a file tree grouped by purpose, and the open file.
// Used by the owner vault and by the Pro projects page.
const LANG = { py: 'python', sql: 'sql', sh: 'bash', json: 'json', yml: 'yaml', yaml: 'yaml', scala: 'scala' }
const GROUPS = [
  ['Start here', (p) => ['README.md', 'COMPLETION.md', 'course/BRIEF.md', 'starter/README.md'].includes(p)],
  ['Course for learners', (p) => p.startsWith('course/')],
  ['Python code', (p) => /^(src|tools|dags|data|mock|pipeline|app|jobs|databricks|beam|streaming|connect)\//.test(p) && p.endsWith('.py')],
  ['SQL and dbt models', (p) => /\.(sql|lkml)$/.test(p) || /^(models|macros|seeds|dbt_tests|snapshots|analyses)\//.test(p) || /dbt_project|profiles/.test(p)],
  ['Tests', (p) => p.startsWith('tests/') || /(^|\/)test_[^/]*\.py$/.test(p)],
  ['Infra, CI and config', (p) => /^(infra|terraform|\.github|config|adf|contracts|docker|k8s|helm)\//.test(p) || /(Makefile|Dockerfile|docker-compose|\.tf$|\.ya?ml$|\.toml$|\.ini$|\.env|requirements|\.gitignore)/.test(p)],
  ['Docs and design', (p) => /^(docs|architecture)\//.test(p) || p.endsWith('.md')],
  ['Other files', () => true],
]
export function group(files) {
  const out = GROUPS.map(([name]) => ({ name, files: [] }))
  for (const f of files) out[GROUPS.findIndex(([, test]) => test(f.path))].files.push(f)
  const first = ['README.md', 'course/BRIEF.md', 'COMPLETION.md', 'starter/README.md']
  out[0].files.sort((a, b) => first.indexOf(a.path) - first.indexOf(b.path))
  return out.filter((g) => g.files.length)
}

function FileView({ file }) {
  if (!file) return null
  const ext = file.path.split('.').pop().toLowerCase()
  if (ext === 'md') return <Markdown md={file.text} />
  return <pre className="owner-code"><code dangerouslySetInnerHTML={{ __html: highlight(file.text, LANG[ext]) }} /></pre>
}

export default function ProjectReader({ project }) {
  const [path, setPath] = useState('README.md')
  const groups = useMemo(() => group([...project.files].sort((a, b) => a.path.localeCompare(b.path))), [project])
  const file = useMemo(() => project.files.find((f) => f.path === path), [project, path])
  const pick = (p) => { setPath(p); setTimeout(() => document.querySelector('.owner-file')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30) }
  const download = () => saveBlob(makeTar(Object.fromEntries(project.files.map((f) => [`${project.name}/${f.path}`, f.text]))), `${project.name}.tar`)
  return (
    <div className="owner-reader">
      <nav className="card card-pad owner-tree" aria-label="Files">
        <div className="small muted" style={{ marginBottom: 6 }}>{project.files.length} files · tap a folder to open it</div>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={download}>Download all files (.tar)</button>
        {groups.map((g, i) => (
          <details key={g.name} open={i === 0 || g.files.some((f) => f.path === path)}>
            <summary><b>{g.name}</b> <span className="chip">{g.files.length}</span></summary>
            <ul>{g.files.map((f) => (
              <li key={f.path}><button className={f.path === path ? 'on' : ''} onClick={() => pick(f.path)}>{f.path}</button></li>
            ))}</ul>
          </details>
        ))}
      </nav>
      <article className="card card-pad owner-file">
        <div className="small muted" style={{ marginBottom: 8 }}>{project.name} / {path}</div>
        <FileView file={file} />
      </article>
    </div>
  )
}
