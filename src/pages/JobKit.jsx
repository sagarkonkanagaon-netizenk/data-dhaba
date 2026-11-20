import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProGate from '../components/ProGate.jsx'
import Protected from '../components/Protected.jsx'
import Markdown from '../components/Markdown.jsx'
import { useProContent } from '../lib/proContent.js'
import './jobkit.css'

// The Pro job kit: strategy, study plan, Naukri, LinkedIn, resume, interview kit, templates (text from Pro storage)
// and a LinkedIn banner maker that runs in the browser.
const GUIDES = [
  { slug: 'strategy', icon: '🧭', title: 'The job-hunt strategy', d: 'Referrals, recruiter search, a 40-company target list and a 45-minute daily routine.' },
  { slug: 'study-plan', icon: '📚', title: 'How to target and study', d: 'What your interviews really test, and 12, 8 and 6-week plans by experience.' },
  { slug: 'naukri', icon: '🔎', title: 'Your Naukri profile', d: 'Headline formula, key skills, bullets, the filters that hide you, staying active.' },
  { slug: 'linkedin', icon: '💼', title: 'Your LinkedIn profile', d: 'Headline, About, skills, Featured and Open to Work, built for recruiter search.' },
  { slug: 'resume', icon: '📄', title: 'The ATS-proof resume', d: 'Format rules, 10-minute tailoring and a bank of measurable bullets.' },
  { slug: 'interview-kit', icon: '🎤', title: 'The interview kit', d: 'Every round explained, your project story, 40+ model answers, design frame, HR answers.' },
  { slug: 'templates', icon: '✉️', title: 'Copy-paste templates', d: 'Referral asks, recruiter replies, follow-ups, offer negotiation, resignation.' },
]

export default function JobKit() {
  const { slug } = useParams()
  const { pro, data, err } = useProContent('career.json')
  useEffect(() => { window.scrollTo?.(0, 0) }, [slug])
  if (slug === 'banner') return <BannerPage pro={pro} />
  const g = slug && GUIDES.find((x) => x.slug === slug)
  if (slug && !g) return <div className="page container">Guide not found. <Link to="/interview/job-kit">Job kit</Link></div>
  if (g) {
    const doc = data && data.find((x) => x.slug === slug)
    const i = GUIDES.indexOf(g)
    return (
      <div className="page"><div className="container narrow">
        <Link to="/interview/job-kit" className="small">← Job kit</Link>
        <div className="row small muted" style={{ margin: '10px 0 8px' }}><span className="chip chip-pro">Pro</span><span>Job kit · {i + 1} of {GUIDES.length}</span></div>
        {!pro ? <><h1>{g.title}</h1><p className="muted">{g.d}</p><ProGate what="the full job kit" /></>
          : err ? <p className="err" role="alert">{err}</p>
          : !doc ? <span className="loading"><span className="spinner" /> Loading…</span>
          : <Protected><Markdown md={doc.md} /></Protected>}
        <div className="chapter-foot">
          {GUIDES[i - 1] ? <Link to={`/interview/job-kit/${GUIDES[i - 1].slug}`}><small>← Previous</small>{GUIDES[i - 1].title}</Link> : <span />}
          {GUIDES[i + 1] ? <Link className="next" to={`/interview/job-kit/${GUIDES[i + 1].slug}`}><small>Next →</small>{GUIDES[i + 1].title}</Link> : <Link className="next" to="/interview/job-kit/banner"><small>Next →</small>LinkedIn banner maker</Link>}
        </div>
      </div></div>
    )
  }
  return (
    <div className="page"><div className="container">
      <div className="page-head">
        <div className="eyebrow">Pro · Job kit</div>
        <h1>Get the interview, then get the offer</h1>
        <p className="muted">Everything outside the code: how to target companies, get referrals, set up Naukri and LinkedIn so recruiters find you, write a resume that passes ATS, and walk into every round prepared.</p>
      </div>
      <div className="grid g2 jk-grid">
        {GUIDES.map((x, i) => (
          <Link key={x.slug} to={`/interview/job-kit/${x.slug}`} className="card card-pad card-link jk-card">
            <span className="jk-ic" aria-hidden="true">{x.icon}</span>
            <div><div className="small muted">{String(i + 1).padStart(2, '0')}{pro ? '' : ' · 🔒 Pro'}</div><b>{x.title}</b><p className="small muted">{x.d}</p></div>
          </Link>
        ))}
        <Link to="/interview/job-kit/banner" className="card card-pad card-link jk-card jk-banner-card">
          <span className="jk-ic" aria-hidden="true">🎨</span>
          <div><div className="small muted">08{pro ? '' : ' · 🔒 Pro'}</div><b>LinkedIn banner maker</b><p className="small muted">Type your title and stack, pick a style, download a 1584 x 396 banner.</p></div>
        </Link>
      </div>
    </div></div>
  )
}

/* ───────── LinkedIn banner maker ───────── */
const W = 1584, H = 396
const STYLES = [
  { id: 'pipeline', name: 'Pipeline', bg: ['#0b1020', '#131b35'], ink: '#f4f6ff', sub: '#9fb0d9', accent: '#2dd4bf', chip: 'rgba(45,212,191,.14)' },
  { id: 'paper', name: 'Paper', bg: ['#fbfaf7', '#f1eee8'], ink: '#16141f', sub: '#5b5870', accent: '#c8155a', chip: 'rgba(200,21,90,.09)' },
  { id: 'terminal', name: 'Terminal', bg: ['#07110c', '#0c1a13'], ink: '#d9ffe9', sub: '#7fbf9a', accent: '#4ade80', chip: 'rgba(74,222,128,.12)' },
  { id: 'sunrise', name: 'Sunrise', bg: ['#2a0f3d', '#c8155a'], ink: '#ffffff', sub: '#ffd6e6', accent: '#ffb347', chip: 'rgba(255,255,255,.16)' },
]

function drawArt(ctx, s) {
  ctx.save()
  if (s.id === 'pipeline' || s.id === 'sunrise') {
    // flowing lines: data moving left to right
    for (let i = 0; i < 9; i++) {
      ctx.beginPath()
      const y0 = 40 + i * 40
      ctx.moveTo(0, y0)
      for (let x = 0; x <= W; x += 24) ctx.lineTo(x, y0 + Math.sin(x / 140 + i * 0.7) * 18 + (x / W) * (i - 4) * 6)
      ctx.strokeStyle = s.accent; ctx.globalAlpha = 0.05 + i * 0.015; ctx.lineWidth = 2; ctx.stroke()
    }
    ctx.globalAlpha = 0.9
    for (let i = 0; i < 14; i++) {
      const x = 80 + ((i * 97) % 700), y = 60 + ((i * 53) % 280)
      ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2); ctx.fillStyle = s.accent; ctx.globalAlpha = 0.25 + (i % 4) * 0.1; ctx.fill()
    }
  } else if (s.id === 'paper') {
    ctx.fillStyle = s.sub; ctx.globalAlpha = 0.18
    for (let x = 20; x < W; x += 28) for (let y = 20; y < H; y += 28) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill() }
    ctx.globalAlpha = 1; ctx.fillStyle = s.accent; ctx.fillRect(W - 12, 0, 12, H)
  } else {
    ctx.font = '18px ui-monospace, SFMono-Regular, Menlo, monospace'; ctx.fillStyle = s.accent; ctx.globalAlpha = 0.13
    const lines = ['df = spark.read.format("delta").load(bronze)', 'df.dropDuplicates(["order_id"])', '  .withColumn("ingested_at", F.current_timestamp())', 'silver.alias("t").merge(df.alias("s"), "t.id = s.id")', 'SELECT customer_id, SUM(amount) OVER (PARTITION BY ...)', 'spark.conf.set("spark.sql.adaptive.enabled", "true")', 'OPTIMIZE gold.sales ZORDER BY (order_date)', 'airflow dags trigger daily_orders', 'kafka-console-consumer --topic orders --from-beginning']
    lines.forEach((l, i) => ctx.fillText(l, 40, 44 + i * 40))
  }
  ctx.restore()
}

function wrapText(ctx, text, max) {
  const words = text.split(/\s+/); const out = []; let line = ''
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > max && line) { out.push(line); line = w } else line = t }
  if (line) out.push(line)
  return out
}

function draw(canvas, f) {
  const s = STYLES.find((x) => x.id === f.style) || STYLES[0]
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, s.bg[0]); g.addColorStop(1, s.bg[1])
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  drawArt(ctx, s)
  // Text block on the right: the profile photo covers the lower left on most screens.
  const x = 640, maxW = W - x - 70
  let y = 104
  ctx.textBaseline = 'alphabetic'
  if (f.name) { ctx.font = '600 26px Inter, system-ui, sans-serif'; ctx.fillStyle = s.sub; ctx.fillText(f.name.toUpperCase(), x, y); y += 58 }
  ctx.font = '800 60px Inter, system-ui, sans-serif'; ctx.fillStyle = s.ink
  for (const l of wrapText(ctx, f.title || 'Data Engineer', maxW).slice(0, 2)) { ctx.fillText(l, x, y); y += 66 }
  if (f.tagline) { ctx.font = '400 28px Inter, system-ui, sans-serif'; ctx.fillStyle = s.sub; for (const l of wrapText(ctx, f.tagline, maxW).slice(0, 2)) { ctx.fillText(l, x, y); y += 38 } }
  y += 14
  const chips = f.stack.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8)
  ctx.font = '600 22px Inter, system-ui, sans-serif'
  let cx = x
  for (const c of chips) {
    const w = ctx.measureText(c).width + 32
    if (cx + w > W - 60) { cx = x; y += 50 }
    if (y > H - 20) break
    ctx.fillStyle = s.chip; roundRect(ctx, cx, y - 28, w, 40, 20); ctx.fill()
    ctx.strokeStyle = s.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1
    ctx.fillStyle = s.ink; ctx.fillText(c, cx + 16, y)
    cx += w + 10
  }
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }

function BannerPage({ pro }) {
  const ref = useRef(null)
  const [f, setF] = useState({ style: 'pipeline', name: '', title: 'Data Engineer', tagline: 'I build reliable pipelines that stay correct when things go wrong', stack: 'Azure, Databricks, PySpark, Delta Lake, SQL' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  useEffect(() => { if (ref.current) draw(ref.current, f) }, [f, pro])
  const download = () => ref.current.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'linkedin-banner.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000) }, 'image/png')
  return (
    <div className="page"><div className="container">
      <Link to="/interview/job-kit" className="small">← Job kit</Link>
      <div className="page-head" style={{ marginTop: 10 }}>
        <div className="eyebrow">Pro · Job kit</div>
        <h1>LinkedIn banner maker</h1>
        <p className="muted">Your title and stack, readable on a phone, kept clear of where your profile photo sits. Download a 1584 x 396 PNG and upload it in LinkedIn under Edit profile, then the camera icon on the banner.</p>
      </div>
      {!pro ? <ProGate what="the banner maker and the full job kit" /> : (
        <div className="jk-maker">
          <canvas ref={ref} width={W} height={H} className="jk-canvas" aria-label="Banner preview" />
          <div className="jk-form card card-pad">
            <div className="jk-styles" role="radiogroup" aria-label="Style">
              {STYLES.map((s) => <button key={s.id} type="button" role="radio" aria-checked={f.style === s.id} className={f.style === s.id ? 'on' : ''} onClick={() => setF((x) => ({ ...x, style: s.id }))} style={{ background: `linear-gradient(120deg, ${s.bg[0]}, ${s.bg[1]})`, color: s.ink }}>{s.name}</button>)}
            </div>
            <label>Title<input value={f.title} maxLength={48} onChange={set('title')} /></label>
            <label>One line about you<input value={f.tagline} maxLength={90} onChange={set('tagline')} /></label>
            <label>Stack (comma separated, up to 8)<input value={f.stack} maxLength={140} onChange={set('stack')} /></label>
            <label>Name (optional)<input value={f.name} maxLength={40} onChange={set('name')} placeholder="Leave empty for no name" /></label>
            <button type="button" className="btn btn-primary" onClick={download}>Download PNG</button>
          </div>
        </div>
      )}
    </div></div>
  )
}

