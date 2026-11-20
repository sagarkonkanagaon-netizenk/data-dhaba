import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { COLUMNS, LAYERS, TOOLS, PAGES, LAYER_BY_ID, COL_BY_ID, TOOL_BY_ID } from '../data/atlas.js'
import './atlas.css'
import ProGate from '../components/ProGate.jsx'
import { isLocked } from '../lib/tier.js'
import { SYLLABUS, topicCount, TOTAL_TOPICS } from '../data/syllabus.js'
import { usePro } from '../lib/proContent.js'

// The Tech Stack Atlas: one map of every tool by the job it does and where it runs,
// and a page per tool that always follows the same eight blocks.

const DEMAND = { 3: 'In most job posts', 2: 'Common', 1: 'Good to know' }
const FULL = TOOLS.filter((t) => PAGES[t.id]).length

function Demand({ d }) {
  return <span className={'at-demand d' + d} title={DEMAND[d]} aria-label={DEMAND[d]}><i /><i /><i /></span>
}

function Chip({ t, dim }) {
  const full = !!PAGES[t.id]
  return (
    <Link to={`/atlas/${t.id}`} className={'at-chip' + (full ? ' full' : '') + (dim ? ' dim' : '')} title={t.one}>
      <span>{t.name}</span><Demand d={t.demand} />
    </Link>
  )
}

export function AtlasMap() {
  const [col, setCol] = useState('all')
  const [q, setQ] = useState('')
  const [onlyTop, setOnlyTop] = useState(false)
  const match = (t) => (!q || (t.name + ' ' + t.one).toLowerCase().includes(q.toLowerCase())) && (!onlyTop || t.demand === 3)
  const cols = col === 'all' ? COLUMNS : COLUMNS.filter((c) => c.id === col)
  const hits = TOOLS.filter(match).length
  return (
    <div className="page atlas">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">Tech Stack Atlas</div>
          <h1>Every data engineering tool, <em>on one map</em></h1>
          <p>Rows are the jobs in a data pipeline. Columns are where the tool runs. Tools in the same row do the same job, so once you learn one, you already understand its twin on every other cloud.</p>
        </div>

        <div className="at-stats">
          <div><b>{TOOLS.length}</b><span>tools mapped</span></div>
          <div><b>{LAYERS.length}</b><span>pipeline layers</span></div>
          <div><b>{COLUMNS.length - 2}</b><span>clouds + platforms + open source</span></div>
          <div><b>{TOTAL_TOPICS.toLocaleString('en-IN')}</b><span>syllabus topics, end to end</span></div>
          <div><b>{FULL}</b><span>full tool pages so far</span></div>
        </div>

        <div className="at-controls">
          <div className="at-seg" role="group" aria-label="Show cloud">
            <button className={col === 'all' ? 'on' : ''} onClick={() => setCol('all')}>All</button>
            {COLUMNS.map((c) => <button key={c.id} className={col === c.id ? 'on' : ''} onClick={() => setCol(c.id)}>{c.name}</button>)}
          </div>
          <input className="at-search" type="search" placeholder="Search tools, e.g. Kafka, warehouse, CDC" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tools" />
          <label className="at-top"><input type="checkbox" checked={onlyTop} onChange={(e) => setOnlyTop(e.target.checked)} /> Only the most asked</label>
        </div>
        <div className="at-legend small muted">
          <span><Demand d={3} /> In most job posts</span><span><Demand d={2} /> Common</span><span><Demand d={1} /> Good to know</span>
          <span><span className="at-chip full at-chip-demo">Bold</span> = full page ready</span>
          {(q || onlyTop) && <span><b>{hits}</b> match{hits === 1 ? '' : 'es'}</span>}
        </div>

        <div className="at-scroll">
          <div className="at-grid" style={{ '--cols': cols.length }}>
            <div className="at-corner">Layer</div>
            {cols.map((c) => <div key={c.id} className="at-colh"><b>{c.name}</b><span>{c.note}</span></div>)}
            {LAYERS.map((l) => (
              <div key={l.id} className="at-row" style={{ display: 'contents' }}>
                <div className="at-layer"><span className="at-n">{String(l.n).padStart(2, '0')}</span><b>{l.name}</b><span>{l.job}</span></div>
                {cols.map((c) => {
                  const ts = TOOLS.filter((t) => t.layer === l.id && t.col === c.id)
                  return (
                    <div key={c.id} className="at-cell">
                      {ts.length ? ts.map((t) => <Chip key={t.id} t={t} dim={!match(t)} />) : <span className="at-none">—</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <section className="at-how card">
          <h2>How every tool page teaches</h2>
          <ol>
            <li><b>What it is</b>: the theory in plain words</li>
            <li><b>Why it exists</b>: the problem it solved</li>
            <li><b>Where companies use it</b>: real pipeline jobs</li>
            <li><b>How a data engineer uses it</b></li>
            <li><b>How a data analyst uses it</b></li>
            <li><b>When not to use it</b>: the judgement interviewers test</li>
            <li><b>Same job on other clouds</b></li>
            <li><b>Try it and interview questions</b></li>
          </ol>
        </section>
      </div>
    </div>
  )
}

function Block({ n, title, children, tone }) {
  return (
    <section className={'at-block' + (tone ? ' ' + tone : '')}>
      <h2><span>{n}</span>{title}</h2>
      {children}
    </section>
  )
}
// The full syllabus: every topic title is public, every explanation is Pro.
function Syllabus({ t }) {
  const pro = usePro()
  const lessons = t.id === 'spark'
  const mods = SYLLABUS[t.id] || []
  const [open, setOpen] = useState(0)
  if (!mods.length) return null
  const n = topicCount(t.id)
  return (
    <section className="at-syl" aria-labelledby="at-syl-h">
      <div className="at-syl-head">
        <div>
          <span className="at-syl-k">Full syllabus</span>
          <h2 id="at-syl-h">{t.name}, end to end</h2>
          <p className="muted small">{mods.length} modules · {n} topics, from first steps to production and interview level. Every topic is explained in Pro with diagrams, runnable code, real failure stories and interview answers.</p>
        </div>
        {pro && lessons ? <Link to="/pro/lessons" className="btn btn-primary btn-sm">Open the 56 Spark lessons</Link>
          : pro ? <span className="small muted">Your Pro includes these lessons as each one is finished.</span>
          : <Link to="/pro" className="btn btn-primary btn-sm">Unlock all {n} lessons</Link>}
      </div>
      <ol className="at-mods">
        {mods.map((m, i) => (
          <li key={m.name} className={open === i ? 'open' : ''}>
            <button type="button" className="at-mod" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span className="at-mod-n">{String(i + 1).padStart(2, '0')}</span>
              <b>{m.name}</b>
              <span className="small muted">{m.topics.length} topics</span>
              <span className="at-mod-arrow" aria-hidden="true">▾</span>
            </button>
            {open === i && (
              <ul className="at-topics">
                {m.topics.map((x) => <li key={x}><span>{x}</span><span className="at-pro" title="Explanation in Pro">🔒 Pro</span></li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

const List = ({ items }) => <ul className="at-list">{items.map((x) => <li key={x}>{x}</li>)}</ul>

export function AtlasTool() {
  const { id } = useParams()
  const t = TOOL_BY_ID[id]
  const twins = useMemo(() => (t ? TOOLS.filter((x) => x.layer === t.layer && x.id !== t.id) : []), [t])
  if (!t) {
    return <div className="page"><div className="container"><h1>Tool not found</h1><Link to="/atlas">Back to the Atlas</Link></div></div>
  }
  const pg = PAGES[t.id]
  const layer = LAYER_BY_ID[t.layer]
  const col = COL_BY_ID[t.col]
  return (
    <div className="page atlas">
      <div className="container at-tool">
        <nav className="small muted at-crumbs"><Link to="/atlas">Tech Stack Atlas</Link> / {layer.name} / {col.name}</nav>
        <header className="at-head">
          <span className="at-badge" aria-hidden="true">{t.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 3)}</span>
          <div>
            <h1>{t.name}</h1>
            <p className="at-one">{t.one}</p>
            <div className="at-tags">
              <span className="chip">Layer {String(layer.n).padStart(2, '0')} · {layer.name}</span>
              <span className="chip">{col.name}</span>
              <span className="chip"><Demand d={t.demand} /> {DEMAND[t.demand]}</span>
            </div>
          </div>
        </header>

        {pg && isLocked('atlas', t.id) ? (
          <div className="at-blocks">
            <Block n="1" title="What it is"><p>{pg.what}</p></Block>
            <ProGate what="every Atlas tool page" preview={<Block n="2" title="Why it exists"><p>{pg.why}</p></Block>} />
          </div>
        ) : pg ? (
          <div className="at-blocks">
            <Block n="1" title="What it is"><p>{pg.what}</p></Block>
            <Block n="2" title="Why it exists"><p>{pg.why}</p></Block>
            <Block n="3" title="Where companies use it"><List items={pg.where} /></Block>
            <div className="at-two">
              <Block n="4" title="How a data engineer uses it" tone="de"><List items={pg.de} /></Block>
              <Block n="5" title="How a data analyst uses it" tone="da"><List items={pg.da} /></Block>
            </div>
            <Block n="6" title="When not to use it" tone="warn"><List items={pg.avoid} /></Block>
            <Block n="7" title="Same job on other clouds"><p>{pg.equiv}</p></Block>
            <Block n="8" title="Try it, then answer like an interviewer expects">
              <div className="at-try">{pg.tryit.map(([label, to]) => <Link key={to} to={to} className="btn btn-ghost btn-sm">{label} →</Link>)}</div>
              <ol className="at-iq">{pg.iq.map((x) => <li key={x}>{x}</li>)}</ol>
            </Block>
          </div>
        ) : (
          <div className="card at-soon">
            <b>The eight-block overview for {t.name} is being written.</b>
            <p className="muted">The full topic-by-topic syllabus is below. Tools in the same row do the same job, and some already have full overview pages.</p>
          </div>
        )}

        <Syllabus t={t} />

        <section className="at-twins">
          <h2>Same job: {layer.name.toLowerCase()}</h2>
          <p className="muted small">{layer.job}</p>
          <div className="at-twin-grid">
            {twins.map((x) => (
              <Link key={x.id} to={`/atlas/${x.id}`} className={'at-twin' + (PAGES[x.id] ? ' full' : '')}>
                <span className="small muted">{COL_BY_ID[x.col].name}</span>
                <b>{x.name}</b>
                <span className="small">{x.one}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function Atlas() {
  const { id } = useParams()
  return id ? <AtlasTool /> : <AtlasMap />
}
