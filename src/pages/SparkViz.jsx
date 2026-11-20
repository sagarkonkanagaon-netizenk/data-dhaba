import { useEffect, useMemo, useState } from 'react'
import ProGate from '../components/ProGate.jsx'
import { isLocked } from '../lib/tier.js'
import { Link } from 'react-router-dom'
import './sparkviz.css'
import SparkCase from '../components/SparkCase.jsx'
import { ISSUES, FAMILIES } from '../data/sparkIssues.js'
import { FREE_CASES } from '../data/sparkCasesFree.js'
import { useProContent } from '../lib/proContent.js'

// Spark, made visible: partitions, shuffles, skew and broadcast joins as moving rows.
// Every scene opens with a prediction, because guessing first is what makes the answer stick.

const KEY_COLOR = { A: '#e8366f', B: '#0f8f86', C: '#7c4ddb', D: '#d9822b', E: '#2f80d1', F: '#5b9a3c', G: '#b8487a', H: '#8a6d1f' }
const W = 640

function Predict({ q, options, answer, why, onDone }) {
  const [pick, setPick] = useState(null)
  return (
    <div className="sv-predict">
      <div className="sv-predict-q"><span className="sv-tag">Predict first</span>{q}</div>
      <div className="sv-opts">
        {options.map((o) => (
          <button key={o} disabled={pick !== null}
            className={'sv-opt' + (pick === null ? '' : o === answer ? ' ok' : o === pick ? ' bad' : ' dim')}
            onClick={() => { setPick(o); onDone && onDone() }}>{o}</button>
        ))}
      </div>
      {pick !== null && <p className="sv-why">{pick === answer ? '✅ Right. ' : `❌ Not quite: it is “${answer}”. `}{why}</p>}
    </div>
  )
}

function Dot({ x, y, k, r = 7, faded, label }) {
  return (
    <g className="sv-dot" style={{ transform: `translate(${x}px, ${y}px)`, opacity: faded ? 0 : 1 }}>
      <circle r={r} fill={KEY_COLOR[k] || '#888'} />
      {label && <text y={3.5} textAnchor="middle" className="sv-dot-t">{k}</text>}
    </g>
  )
}

function Box({ x, y, w, h, title, sub, hot }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={'sv-box' + (hot ? ' hot' : '')} />
      <text x={x + 10} y={y + 17} className="sv-box-t">{title}</text>
      {sub && <text x={x + w - 10} y={y + 17} textAnchor="end" className="sv-box-s">{sub}</text>}
    </g>
  )
}

// Place n dots in a grid inside a box.
function slot(box, i, cols = 6) {
  return { x: box.x + 18 + (i % cols) * 22, y: box.y + 36 + Math.floor(i / cols) * 22 }
}

/* ───────── 1. Partitions and tasks ───────── */
const FILE_MB = 1200
function PartitionsScene() {
  const [parts, setParts] = useState(4)
  const [cores, setCores] = useState(4)
  const per = FILE_MB / parts
  const taskS = 0.5 + per / 100 // fixed start-up cost plus time to read the partition
  const waves = Math.ceil(parts / cores)
  const total = waves * taskS
  const lanes = Array.from({ length: cores }, (_, c) => Array.from({ length: parts }, (_, p) => p).filter((p) => p % cores === c))
  const maxT = 13
  const scale = (W - 120) / maxT
  const idle = cores - Math.min(cores, parts)
  return (
    <>
      <Predict q="A 1,200 MB file on a cluster with 4 cores. Which finishes the stage fastest?" options={['1 partition', '4 partitions', '48 partitions']} answer="4 partitions"
        why="One partition leaves 3 cores idle. 48 tiny partitions spend more time starting tasks than reading data. A few partitions per core, around 128 MB each, is the usual sweet spot." />
      <div className="sv-controls">
        <label>Partitions <select value={parts} onChange={(e) => setParts(+e.target.value)}>{[1, 2, 4, 8, 16, 48].map((v) => <option key={v}>{v}</option>)}</select></label>
        <label>Cores <select value={cores} onChange={(e) => setCores(+e.target.value)}>{[2, 4, 8].map((v) => <option key={v}>{v}</option>)}</select></label>
      </div>
      <div className="sv-scroll"><svg viewBox={`0 0 ${W} ${40 + cores * 30}`} className="sv-svg" role="img" aria-label={`Task timeline: ${parts} partitions on ${cores} cores takes ${total.toFixed(1)} seconds`}>
        {lanes.map((ps, c) => (
          <g key={c}>
            <text x={8} y={34 + c * 30} className="sv-lane">Core {c + 1}</text>
            <line x1={70} x2={W - 40} y1={30 + c * 30} y2={30 + c * 30} className="sv-axis" />
            {ps.map((p, i) => (
              <rect key={p} x={70 + i * taskS * scale + 1} y={20 + c * 30} width={Math.max(2, taskS * scale - 2)} height={20} rx={4}
                className="sv-task" style={{ animationDelay: `${i * 0.25}s` }}>
                <title>Task {p + 1}: {per.toFixed(0)} MB, {taskS.toFixed(2)} s</title>
              </rect>
            ))}
          </g>
        ))}
        <line x1={70 + total * scale} x2={70 + total * scale} y1={10} y2={30 + cores * 30} className="sv-end" />
        <text x={Math.min(70 + total * scale + 6, W - 90)} y={14} className="sv-end-t">{total.toFixed(1)} s</text>
      </svg></div>
      <div className="sv-stats">
        <div><span>Partition size</span><b>{per >= 1 ? per.toFixed(0) : per.toFixed(1)} MB</b></div>
        <div><span>Tasks</span><b>{parts}</b></div>
        <div><span>Waves</span><b>{waves}</b></div>
        <div><span>Idle cores</span><b className={idle ? 'bad' : ''}>{idle}</b></div>
        <div><span>Stage time</span><b>{total.toFixed(1)} s</b></div>
      </div>
      <p className="sv-note">One partition is one task, and one core runs one task at a time. Each task pays a small start-up cost, so very small partitions waste time, and too few partitions leave cores idle. In real jobs, set <code>spark.sql.files.maxPartitionBytes</code> (default 128 MB) and <code>spark.sql.shuffle.partitions</code>, or let AQE coalesce them.</p>
    </>
  )
}

/* ───────── 2. Narrow vs wide (the shuffle) ───────── */
const ROWS = [
  ['A', 120], ['C', 40], ['B', 300], ['D', 80], ['A', 60], ['E', 220],
  ['B', 90], ['C', 500], ['A', 410], ['E', 30], ['D', 260], ['B', 150],
  ['C', 70], ['D', 330], ['A', 20], ['E', 180], ['B', 45], ['C', 210],
]
const OUT_OF = { A: 0, D: 0, B: 1, E: 1, C: 2 }
function ShuffleScene() {
  const [step, setStep] = useState(0)
  const inBox = [0, 1, 2].map((i) => ({ x: 20, y: 30 + i * 108, w: 170, h: 96 }))
  const outBox = [0, 1, 2].map((i) => ({ x: W - 190, y: 30 + i * 108, w: 170, h: 96 }))
  const rows = ROWS.map(([k, amt], i) => ({ k, amt, i, inP: Math.floor(i / 6), keep: amt >= 50 }))
  const outIdx = {}
  const placed = rows.map((r) => {
    if (step < 2) return { ...r, ...slot(inBox[r.inP], r.i % 6) }
    const p = OUT_OF[r.k]
    if (!r.keep) return { ...r, ...slot(inBox[r.inP], r.i % 6) }
    outIdx[p] = (outIdx[p] || 0)
    const pos = slot(outBox[p], outIdx[p]++)
    return { ...r, ...pos, moved: p !== r.inP }
  })
  const kept = rows.filter((r) => r.keep)
  const moved = placed.filter((r) => r.keep && r.moved).length
  const totals = {}
  kept.forEach((r) => { totals[r.k] = (totals[r.k] || 0) + r.amt })
  const STEPS = [
    ['Read', 'spark.read.parquet("orders")', 'Three input partitions, one task each. Rows sit wherever the file blocks were.'],
    ['filter(amount >= 50)', '.filter("amount >= 50")', 'Narrow: each task filters its own rows. Nothing leaves its partition, so no network and no new stage.'],
    ['groupBy("key")', '.groupBy("key")', 'Wide: all rows with the same key must meet in one partition, so Spark writes shuffle files and sends rows across the network. This starts a new stage.'],
    ['sum("amount")', '.agg(F.sum("amount"))', 'Each output partition now holds whole keys and can sum them on its own. The shuffle was the expensive part.'],
  ]
  return (
    <>
      <Predict q="Which of these steps sends rows across the network?" options={['filter', 'groupBy', 'neither']} answer="groupBy"
        why="A filter only needs the row in front of it. A groupBy needs every row with the same key in one place, which means a shuffle." />
      <div className="sv-steps">
        {STEPS.map(([t], i) => <button key={t} className={'sv-step' + (i === step ? ' on' : i < step ? ' done' : '')} onClick={() => setStep(i)}>{i + 1}. {t}</button>)}
      </div>
      <div className="sv-scroll"><svg viewBox={`0 0 ${W} 360`} className="sv-svg" role="img" aria-label={STEPS[step][2]}>
        {inBox.map((b, i) => <Box key={'i' + i} {...b} title={`Input partition ${i + 1}`} />)}
        {outBox.map((b, i) => <Box key={'o' + i} {...b} title={`Shuffle partition ${i + 1}`} sub={step >= 2 ? Object.entries(OUT_OF).filter(([, p]) => p === i).map(([k]) => k).join(', ') : ''} />)}
        {step >= 2 && <text x={W / 2} y={190} textAnchor="middle" className="sv-net">⇄ network</text>}
        {placed.map((r) => <Dot key={r.i} x={r.x} y={r.y} k={r.k} label faded={step >= 1 && !r.keep} />)}
        {step === 3 && outBox.map((b, i) => (
          <text key={'s' + i} x={b.x + b.w / 2} y={b.y + b.h - 8} textAnchor="middle" className="sv-sum">
            {Object.entries(OUT_OF).filter(([, p]) => p === i).map(([k]) => `${k} = ${totals[k] || 0}`).join('   ')}
          </text>
        ))}
      </svg></div>
      <pre className="mini-code">{'df = (' + STEPS.slice(0, step + 1).map((s) => s[1]).join('\n      ') + ')'}</pre>
      <div className="sv-stats">
        <div><span>Rows kept</span><b>{step >= 1 ? kept.length : rows.length} of {rows.length}</b></div>
        <div><span>Rows shuffled</span><b className={step >= 2 ? 'bad' : ''}>{step >= 2 ? moved : 0}</b></div>
        <div><span>Stages</span><b>{step >= 2 ? 2 : 1}</b></div>
      </div>
      <p className="sv-note">{STEPS[step][2]} Filtering before the groupBy meant {rows.length - kept.length} fewer rows to shuffle: always filter and select early.</p>
      <div className="row"><button className="btn btn-primary btn-sm" onClick={() => setStep((step + 1) % 4)}>{step < 3 ? 'Next step →' : 'Start again'}</button></div>
    </>
  )
}

/* ───────── 3. Skew and salting ───────── */
function SkewScene() {
  const [salt, setSalt] = useState(false)
  const keys = [...Array(16).fill('A'), 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'B']
  const part = (k, i) => {
    if (k === 'A') return salt ? i % 4 : 0
    return { B: 1, C: 2, D: 3, E: 1, F: 2, G: 3, H: 1 }[k]
  }
  const boxes = [0, 1, 2, 3].map((i) => ({ x: 20 + i * 155, y: 20, w: 145, h: 140 }))
  const counts = [0, 0, 0, 0]
  const dots = keys.map((k, i) => { const p = part(k, i); const pos = slot(boxes[p], counts[p]++, 6); return { k, i, ...pos } })
  const max = Math.max(...counts)
  const avg = keys.length / 4
  const unit = (W - 140) / 16
  return (
    <>
      <Predict q="Key A has 16 of 24 rows. Compared with a perfectly even split, how long does this stage take?" options={['About the same', 'About 2.7× longer', 'Faster']} answer="About 2.7× longer"
        why="A stage ends when its slowest task ends. The partition holding all 16 A rows does 16 rows of work while an even split would give each task 6: 16 ÷ 6 ≈ 2.7×." />
      <div className="sv-controls">
        <label className="sv-switch"><input type="checkbox" checked={salt} onChange={(e) => setSalt(e.target.checked)} /> Salt the hot key (add a random 0–3 to A)</label>
      </div>
      <div className="sv-scroll"><svg viewBox={`0 0 ${W} 300`} className="sv-svg" role="img" aria-label={`Biggest partition has ${max} rows`}>
        {boxes.map((b, i) => <Box key={i} {...b} title={`Partition ${i + 1}`} sub={`${counts[i]} rows`} hot={counts[i] === max && max > avg * 1.5} />)}
        {dots.map((d) => <Dot key={d.i} x={d.x} y={d.y} k={d.k} label />)}
        {counts.map((c, i) => (
          <g key={'t' + i}>
            <text x={8} y={196 + i * 24} className="sv-lane">Task {i + 1}</text>
            <rect x={70} y={184 + i * 24} width={c * unit} height={16} rx={4} className={'sv-task' + (c === max && max > avg * 1.5 ? ' slow' : '')} />
          </g>
        ))}
        <line x1={70 + max * unit} x2={70 + max * unit} y1={176} y2={284} className="sv-end" />
      </svg></div>
      <div className="sv-stats">
        <div><span>Biggest partition</span><b className={max > avg * 1.5 ? 'bad' : ''}>{max} rows</b></div>
        <div><span>Even split</span><b>{avg} rows</b></div>
        <div><span>Stage time vs even</span><b>{(max / avg).toFixed(1)}×</b></div>
      </div>
      <p className="sv-note">{salt
        ? 'With a salt, A is spread over four partitions. You join or aggregate on (key, salt), then combine the four partial results. Spark 3+ can also split skewed partitions for you with AQE (spark.sql.adaptive.skewJoin.enabled).'
        : 'Every A row hashes to the same partition, so one task does most of the work while the other cores wait. In the Spark UI this looks like one task with a much longer duration than the median.'}</p>
    </>
  )
}

/* ───────── 4. Broadcast join ───────── */
function JoinScene() {
  const [mode, setMode] = useState('shuffle')
  const execs = [0, 1, 2].map((i) => ({ x: 20 + i * 205, y: 120, w: 190, h: 150 }))
  const dim = { x: W / 2 - 95, y: 10, w: 190, h: 70 }
  const orderKeys = ['A', 'B', 'C', 'D', 'A', 'C', 'B', 'D', 'A', 'B', 'C', 'D', 'C', 'A', 'D', 'B', 'A', 'C']
  const home = (k) => ({ A: 0, D: 0, B: 1, C: 2 }[k])
  const cnt = [0, 0, 0]
  const orders = orderKeys.map((k, i) => {
    const src = Math.floor(i / 6)
    const p = mode === 'shuffle' ? home(k) : src
    return { k, i, src, p, ...slot(execs[p], cnt[p]++, 8) }
  })
  const movedOrders = orders.filter((o) => o.p !== o.src).length
  const dimRows = ['A', 'B', 'C', 'D']
  const dimDots = mode === 'shuffle'
    ? dimRows.map((k, i) => { const p = home(k); return { id: k, k, ...slot(execs[p], 12 + dimRows.slice(0, i).filter((x) => home(x) === p).length, 8) } })
    : execs.flatMap((e, p) => dimRows.map((k, i) => ({ id: k + p, k, ...slot(e, 12 + i, 8) })))
  return (
    <>
      <Predict q="You join a 1 TB orders table with a 4-row customers table. What should move across the network?" options={['The orders', 'The customers', 'Both']} answer="The customers"
        why="Copying 4 small rows to every executor is cheap. Moving 1 TB of orders is not. That is a broadcast join, and Spark picks it on its own below spark.sql.autoBroadcastJoinThreshold (10 MB by default)." />
      <div className="tabs" style={{ marginBottom: 12 }}>
        <button className={mode === 'shuffle' ? 'on' : ''} onClick={() => setMode('shuffle')}>Shuffle (sort-merge) join</button>
        <button className={mode === 'broadcast' ? 'on' : ''} onClick={() => setMode('broadcast')}>Broadcast join</button>
      </div>
      <div className="sv-scroll"><svg viewBox={`0 0 ${W} 290`} className="sv-svg" role="img" aria-label={`${mode} join moves ${mode === 'shuffle' ? movedOrders : 0} order rows`}>
        <Box {...dim} title="customers (tiny)" sub="4 rows" />
        {dimRows.map((k, i) => <Dot key={'h' + k} x={dim.x + 35 + i * 40} y={dim.y + 46} k={k} r={8} label />)}
        {execs.map((e, i) => <Box key={i} {...e} title={`Executor ${i + 1}`} sub={mode === 'shuffle' ? Object.entries({ A: 0, D: 0, B: 1, C: 2 }).filter(([, p]) => p === i).map(([k]) => k).join(', ') : 'all keys'} />)}
        {orders.map((o) => <Dot key={o.i} x={o.x} y={o.y} k={o.k} r={6} />)}
        {dimDots.map((d) => <g key={d.id}><Dot x={d.x} y={d.y} k={d.k} r={8} label /></g>)}
      </svg></div>
      <div className="sv-stats">
        <div><span>Order rows moved</span><b className={mode === 'shuffle' ? 'bad' : 'ok'}>{mode === 'shuffle' ? movedOrders : 0} of {orders.length}</b></div>
        <div><span>Customer rows copied</span><b>{mode === 'shuffle' ? 4 : 12}</b></div>
        <div><span>Big table shuffled?</span><b className={mode === 'shuffle' ? 'bad' : 'ok'}>{mode === 'shuffle' ? 'Yes' : 'No'}</b></div>
      </div>
      <pre className="mini-code">{mode === 'shuffle' ? 'orders.join(customers, "customer_id")  # both sides shuffled by key' : 'from pyspark.sql import functions as F\norders.join(F.broadcast(customers), "customer_id")  # orders stay put'}</pre>
      <p className="sv-note">{mode === 'shuffle'
        ? 'Both tables are re-partitioned by customer_id so matching keys meet on the same executor. With a 1 TB table, that is 1 TB written to disk and sent over the network.'
        : 'The small table is copied from the top box to every executor (the circles with letters), and each executor joins its own orders locally. The big orders table never moves. Only broadcast tables that fit comfortably in executor memory.'}</p>
    </>
  )
}

/* ───────── 5. The issue library ───────── */
function IssueLibrary() {
  const { pro, data: proCases, err } = useProContent('spark-cases.json')
  const caseFor = (id) => FREE_CASES[id] || (proCases && proCases[id])
  const [fam, setFam] = useState('all')
  const [open, setOpen] = useState(null)
  const list = ISSUES.filter((x) => fam === 'all' || x.fam === fam)
  const issue = open && ISSUES.find((x) => x.id === open)
  if (issue) {
    const d = caseFor(issue.id)
    return (
      <>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>← All {ISSUES.length} issues</button>
        <h3 className="sl-title">{issue.title}</h3>
        {d ? <SparkCase issue={issue} d={d} /> : pro ? (
          <div className="sl-locked">
            <div className="sc-pager"><span>🚨 On call</span>{issue.sym}</div>
            {err ? <p className="err" role="alert">{err}</p> : proCases ? <p>This case is still uploading. Try again in a minute.</p> : <p><span className="spinner" /> Loading the case…</p>}
          </div>
        ) : (
          <div className="sl-locked">
            <div className="sc-pager"><span>🚨 On call</span>{issue.sym}</div>
            <p>This case is in <b>Pro</b>: the simulated Spark UI before and after, a diagnose-first question, the root cause, the exact fix and the code.</p>
            <Link to="/pro" className="btn btn-primary">See Pro</Link>
          </div>
        )}
      </>
    )
  }
  return (
    <>
      <p className="sv-note" style={{ marginTop: 0 }}>{ISSUES.length} real production problems, each one a simulated Spark UI you diagnose before you see the fix. {pro ? 'Every case is open with your Pro.' : `${Object.keys(FREE_CASES).length} are free to try. The rest are in Pro.`}</p>
      <div className="sl-fams" role="group" aria-label="Filter by family">
        <button type="button" className={fam === 'all' ? 'on' : ''} onClick={() => setFam('all')}>All <span>{ISSUES.length}</span></button>
        {FAMILIES.map((f) => <button key={f.id} type="button" className={fam === f.id ? 'on' : ''} onClick={() => setFam(f.id)}>{f.icon} {f.name} <span>{ISSUES.filter((x) => x.fam === f.id).length}</span></button>)}
      </div>
      <ol className="sl-list">
        {list.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => { setOpen(x.id); window.scrollTo?.(0, 0) }}>
              <span className="sl-k">{FAMILIES.find((f) => f.id === x.fam).icon}</span>
              <span className="sl-txt"><b>{x.title}</b><small>{x.sym}</small></span>
              <span className={'sl-tag' + (FREE_CASES[x.id] || pro ? ' free' : '')}>{FREE_CASES[x.id] ? 'Try free' : pro ? 'Pro' : '🔒 Pro'}</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  )
}

const SCENES = [
  { id: 'partitions', label: 'Partitions & tasks', title: 'How many partitions should a job have?', C: PartitionsScene },
  { id: 'shuffle', label: 'Narrow vs wide', title: 'What is a shuffle, and why is it slow?', C: ShuffleScene },
  { id: 'skew', label: 'Skew', title: 'Why does one task take forever?', C: SkewScene },
  { id: 'join', label: 'Broadcast join', title: 'Which side of a join should move?', C: JoinScene },
  { id: 'issues', label: `Issue library · ${ISSUES.length}`, title: 'Diagnose real Spark incidents', C: IssueLibrary, open: true },
]

export default function SparkViz() {
  const [id, setId] = useState(() => (typeof location !== 'undefined' && SCENES.find((s) => location.hash.endsWith('#' + s.id)) ? location.hash.split('#').pop() : 'partitions'))
  const scene = useMemo(() => SCENES.find((s) => s.id === id) || SCENES[0], [id])
  useEffect(() => { window.scrollTo?.(0, 0) }, [])
  const C = scene.C
  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">Spark Visualizer</div>
          <h1>See what Spark does with your data</h1>
          <p>Four ideas decide whether a Spark job takes two minutes or two hours. Predict each one first, then watch the rows move. Then take on the issue library: {ISSUES.length} real incidents in a simulated Spark UI.</p>
        </div>
        <div className="tabs" role="tablist" style={{ marginBottom: 16 }}>
          {SCENES.map((s) => <button key={s.id} role="tab" aria-selected={s.id === id} className={s.id === id ? 'on' : ''} onClick={() => setId(s.id)}>{!s.open && isLocked('spark', s.id) ? '🔒 ' : ''}{s.label}</button>)}
        </div>
        <div className="viz card sv">
          <h2 className="sv-title">{scene.title}</h2>
          {!scene.open && isLocked('spark', scene.id) ? <ProGate what="all four Spark scenes" /> : <C key={scene.id} />}
        </div>
        <div className="row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to="/learn/pyspark">Read the PySpark handbook</Link>
          <Link className="btn btn-ghost" to="/visual">Visual SQL: joins and windows</Link>
          <Link className="btn btn-ghost" to="/interview/pyspark">PySpark interview questions</Link>
        </div>
      </div>
    </div>
  )
}
