import { useMemo, useState } from 'react'
import Markdown from '../components/Markdown.jsx'
import { highlight } from '../lib/md.js'
import { PRO_LADDER } from '../data/pro.js'

// Owner-only reader for the Pro projects. The files on the site are encrypted (AES-256-GCM, key from the
// passphrase via PBKDF2-SHA256), built by scripts/build_pro_vault.mjs. Nothing here works without the passphrase,
// and the passphrase never leaves this browser tab.
const BASE = `${import.meta.env.BASE_URL}pro-vault/`
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

async function deriveKey(pass, index) {
  const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: b64(index.salt), iterations: index.iter },
    raw, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
}

async function open(key, bytes) {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, key, bytes.slice(12)))
}

async function gunzipJson(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return JSON.parse(await new Response(stream).text())
}

const LANG = { py: 'python', sql: 'sql', sh: 'bash', json: 'json', yml: 'yaml', yaml: 'yaml', scala: 'scala' }
const ORDER = ['README.md', 'COMPLETION.md', 'course/', 'docs/', 'architecture/']
const rank = (p) => { const i = ORDER.findIndex((o) => p === o || p.startsWith(o)); return i < 0 ? ORDER.length : i }

function FileView({ file }) {
  if (!file) return null
  const ext = file.path.split('.').pop().toLowerCase()
  if (ext === 'md') return <Markdown md={file.text} />
  return <pre className="owner-code"><code dangerouslySetInnerHTML={{ __html: highlight(file.text, LANG[ext]) }} /></pre>
}

export default function ProOwner() {
  const [pass, setPass] = useState('')
  const [state, setState] = useState({ step: 'locked' })
  const [project, setProject] = useState(null)
  const [path, setPath] = useState('README.md')

  async function unlock(e) {
    e.preventDefault()
    setState({ step: 'busy' })
    try {
      const index = await (await fetch(BASE + 'index.json', { cache: 'no-store' })).json()
      const key = await deriveKey(pass, index)
      await open(key, b64(index.check))                       // throws on a wrong passphrase
      setPass('')
      setState({ step: 'open', key, index })
    } catch (err) {
      setState({ step: 'locked', error: 'That passphrase does not open the vault.' })
    }
  }

  async function load(p) {
    setProject({ n: p.n, loading: true })
    const bytes = new Uint8Array(await (await fetch(BASE + p.file, { cache: 'no-store' })).arrayBuffer())
    const data = await gunzipJson(await open(state.key, bytes))
    data.files.sort((a, b) => rank(a.path) - rank(b.path) || a.path.localeCompare(b.path))
    setProject({ n: p.n, ...data })
    setPath('README.md')
    setTimeout(() => document.querySelector('.owner-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const file = useMemo(() => project?.files?.find((f) => f.path === path), [project, path])

  if (state.step !== 'open') {
    return (
      <div className="page"><div className="container" style={{ maxWidth: 520 }}>
        <div className="eyebrow">Owner only</div>
        <h1>Pro project vault</h1>
        <p className="muted">The Pro projects are stored on this site encrypted. Enter the owner passphrase to read them. It stays in this tab and is never sent anywhere.</p>
        <form className="card card-pad" onSubmit={unlock}>
          <label htmlFor="vault-pass" className="small">Passphrase</label>
          <input id="vault-pass" type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)}
            style={{ width: '100%', margin: '6px 0 12px', padding: '10px 12px', fontSize: 16 }} />
          <button className="btn" disabled={!pass || state.step === 'busy'}>{state.step === 'busy' ? 'Opening…' : 'Open the vault'}</button>
          {state.error && <p className="small" role="alert" style={{ color: 'var(--danger)', marginTop: 10 }}>{state.error}</p>}
        </form>
      </div></div>
    )
  }

  const title = (n) => PRO_LADDER.find((x) => x.n === n)
  return (
    <div className="page"><div className="container">
      <div className="eyebrow">Owner only · {state.index.projects.length} projects</div>
      <h1>Pro project vault</h1>
      <div className="grid g2" style={{ gap: 8, marginBottom: 16 }}>
        {state.index.projects.map((p) => (
          <button key={p.n} className={`card card-pad owner-proj${project?.n === p.n ? ' on' : ''}`} onClick={() => load(p)} style={{ textAlign: 'left' }}>
            <b>P{String(p.n).padStart(2, '0')} · {title(p.n)?.title}</b>
            <div className="small muted">{title(p.n)?.role} · {p.files} files</div>
          </button>
        ))}
      </div>
      {project?.loading && <p className="muted">Decrypting…</p>}
      {project?.files && (
        <div className="owner-reader">
          <nav className="card card-pad owner-tree" aria-label="Files">
            <select className="owner-select" value={path} onChange={(e) => setPath(e.target.value)} aria-label="Choose a file">
              {project.files.map((f) => <option key={f.path} value={f.path}>{f.path}</option>)}
            </select>
            <ul>{project.files.map((f) => (
              <li key={f.path}><button className={f.path === path ? 'on' : ''} onClick={() => setPath(f.path)}>{f.path}</button></li>
            ))}</ul>
          </nav>
          <article className="card card-pad owner-file">
            <div className="small muted" style={{ marginBottom: 8 }}>{project.name} / {path}</div>
            <FileView file={file} />
          </article>
        </div>
      )}
    </div></div>
  )
}
