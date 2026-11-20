import { useEffect, useState } from 'react'
import ProGate from '../components/ProGate.jsx'
import { isLocked } from '../lib/tier.js'
import { useProContent } from '../lib/proContent.js'
import { Link, useNavigate, useParams } from 'react-router-dom'
import data from '../content/py-questions.json'
import CodeEditor from '../components/CodeEditor.jsx'
import Markdown from '../components/Markdown.jsx'
import { runPython, stopPython, isPyReady } from '../lib/py.js'
import { useProgress, setIn, getProgress } from '../lib/progress.js'
import Stuck from '../components/Stuck.jsx'

const QS = data.questions.filter((q) => q.section === 'Python')

function starter(q) {
  const m = /^def (\w+)\(([^)]*)\)/m.exec(q.answer)
  if (q.check && m) {
    return `def ${m[1]}(${m[2]}):\n    # your code here\n    pass\n\n\nprint(${m[1]}(${q.check.args}))  # expected: ${q.given.split('→')[1]?.split(',')[0]?.trim() || '?'}\n`
  }
  if (m) return `def ${m[1]}(${m[2]}):\n    # your code here\n    pass\n`
  return `# ${q.title}\n# ${q.given}\n\n`
}

function key(n) { return `z2h:code:py:${n}` }

export default function PyLab() {
  const { n } = useParams()
  const navigate = useNavigate()
  const p = useProgress()
  // 100 more problems (101-200) live in Pro storage, so only Pro members download them.
  const { pro, data: proQs, err: proErr } = useProContent('python-problems.json')
  const ALL = proQs ? [...QS, ...proQs] : QS
  const wantsPro = Number(n) > 100
  const q = ALL.find((x) => String(x.n) === String(n)) || (wantsPro ? null : QS[0])
  const solved = ALL.filter((x) => p.py[x.n] === 'solved').length
  const [listOpen, setListOpen] = useState(false)
  let main
  if (q && q.n <= 100 && isLocked('py', q.n)) {
    main = <section><div className="qhead"><div className="row small muted"><span>{q.section}</span><span>·</span><span>Question {q.n} of {QS.length}</span></div><h1 className="q-title">{q.title}</h1></div><ProGate what={`all ${QS.length} Python and PySpark problems with answers`} /></section>
  } else if (q) {
    main = <PyQuestion key={q.n} q={q} list={ALL} />
  } else if (!pro) {
    main = <section><div className="qhead"><div className="row small muted"><span className="chip chip-pro">Pro</span><span>Problems 101 to 200</span></div><h1 className="q-title">100 Pro Python problems</h1></div><p className="muted">Parsing, dates and money, CDC and SCD2, streaming windows, joins, rate limiters and more. Each one has auto-checks on several test cases and a full answer.</p><ProGate what="100 more Python problems for data engineers" /></section>
  } else if (proErr) {
    main = <section><p className="err" role="alert">{proErr}</p></section>
  } else {
    main = <section><span className="loading"><span className="spinner" /> Loading Pro problems…</span></section>
  }
  const proList = proQs || []
  return (
    <div className="container">
      <div className="lab">
        <aside className={'qlist card' + (listOpen ? ' open' : '')} style={{ padding: 8 }}>
          <div className="spread" style={{ padding: '6px 8px' }}><b>Python lab</b><span className="chip chip-primary">{solved}/{ALL.length}</span></div>
          <div className="small muted" style={{ padding: '0 8px 6px' }}>PySpark questions are in <Link to="/interview/pyspark">Interview → PySpark</Link>.</div>
          <button className="qlist-toggle" aria-expanded={listOpen} onClick={() => setListOpen(!listOpen)}>
            <span>{q ? `Problem ${q.n}` : 'Pro problems'}</span><b>{listOpen ? 'Hide list ▴' : 'All problems ▾'}</b>
          </button>
          <div className="qlist-body" onClick={() => setListOpen(false)}>
          {QS.map((x) => (
            <button key={x.n} className={q && x.n === q.n ? 'on' : ''} onClick={() => navigate(`/practice/python/${x.n}`)}>
              <span className="n">{x.n}</span><span>{x.title}</span><span className="st">{isLocked('py', x.n) ? '🔒' : p.py[x.n] === 'solved' ? '✅' : p.py[x.n] === 'tried' ? '•' : ''}</span>
            </button>
          ))}
          <div className="small muted" style={{ padding: '10px 8px 4px' }}><span className="chip chip-pro">Pro</span> Problems 101 to 200</div>
          {pro ? proList.map((x) => (
            <button key={x.n} className={q && x.n === q.n ? 'on' : ''} onClick={() => navigate(`/practice/python/${x.n}`)}>
              <span className="n">{x.n}</span><span>{x.title}</span><span className="st">{p.py[x.n] === 'solved' ? '✅' : p.py[x.n] === 'tried' ? '•' : ''}</span>
            </button>
          )) : (
            <button className={wantsPro ? 'on' : ''} onClick={() => navigate('/practice/python/101')}>
              <span className="n">+100</span><span>Pro problems for data engineers</span><span className="st">🔒</span>
            </button>
          )}
          </div>
        </aside>
        {main}
      </div>
    </div>
  )
}

function PyQuestion({ q, list }) {
  const navigate = useNavigate()
  const p = useProgress()
  const [code, setCode] = useState(() => { try { return localStorage.getItem(key(q.n)) || starter(q) } catch (e) { return starter(q) } })
  const [busy, setBusy] = useState(null)
  const [out, setOut] = useState(null)
  const [verdict, setVerdict] = useState(null)
  useEffect(() => { try { localStorage.setItem(key(q.n), code) } catch (e) { /* ignore */ } }, [code, q.n])
  const idx = list.findIndex((x) => x.n === q.n)
  const prev = list[idx - 1]
  const next = list[idx + 1]

  async function run() {
    setBusy('run'); setVerdict(null)
    const r = await runPython(code)
    setOut(r); setBusy(null)
    if (!getProgress().py[q.n]) setIn('py', q.n, 'tried')
  }
  async function check() {
    setBusy('check')
    const r = await runPython(code, { ref: q.answer, ...q.check })
    setBusy(null); setOut(r)
    if (r.error) { setVerdict({ ok: false, why: r.error.split('\n').slice(-1)[0] }); return }
    setVerdict(r.verdict)
    if (r.verdict.ok) setIn('py', q.n, 'solved')
  }
  return (
    <section>
      <div className="qhead">
        <div className="row small muted">{q.n > 100 && <span className="chip chip-pro">Pro</span>}<span>{q.topic || 'Python'}</span><span>·</span><span>Question {q.n}</span>{p.py[q.n] === 'solved' && <span className="chip chip-ok">Solved</span>}</div>
        <h1 className="q-title">{q.title}</h1>
      </div>
      {q.prompt && <div className="q-prompt"><Markdown md={q.prompt} /></div>}
      {q.given && <div className="given">{q.prompt ? <><b>Example: </b>{q.given}</> : q.given}</div>}
      <div style={{ marginTop: 12 }}><CodeEditor value={code} onChange={setCode} onRun={run} lang="python" minHeight={200} /></div>
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={run} disabled={!!busy}>{busy === 'run' ? 'Running…' : '▶ Run'}</button>
        {q.check && <button className="btn btn-primary" onClick={check} disabled={!!busy}>{busy === 'check' ? 'Checking…' : 'Check answer'}</button>}
        {busy && <button className="btn btn-ghost btn-sm" onClick={() => { stopPython(); setBusy(null) }}>Stop</button>}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setCode(starter(q)); setOut(null); setVerdict(null) }}>Reset</button>
      </div>
      {busy && !isPyReady() && <span className="loading"><span className="spinner" /> Starting Python in your browser. The first run downloads it once.</span>}
      {!q.check && <p className="small muted">No auto-check for this one: run your code, then compare with the answer.</p>}
      {verdict && (
        <div className={'verdict ' + (verdict.ok ? 'ok' : 'bad')} style={{ margin: '10px 0' }}>
          <span>{verdict.ok ? '✅' : '❌'}</span>
          <div>{verdict.ok ? (q.check?.cases?.length > 1 ? `Correct on all ${q.check.cases.length} test cases.` : 'Correct on the example.') : 'Not yet.'}
            <small>{verdict.ok ? (q.check?.cases?.length > 1 ? 'Open the answer below and compare your approach and its complexity.' : 'Now think about edge cases: empty input, duplicates, very large input.') : verdict.why || `Got ${verdict.got}, expected ${verdict.want}.`}</small>
          </div>
        </div>
      )}
      {out && (out.out || out.error) && (
        <div className="result" style={{ marginTop: 8 }}>
          <div className="result-head"><span>Output</span></div>
          {out.out && <pre className="out">{out.out}</pre>}
          {out.error && <div className="err">{out.error}</div>}
        </div>
      )}
      <Stuck lab="py" n={q.n} />
      <details className="reveal" style={{ marginTop: 16 }}>
        <summary>Reveal the answer and explanation</summary>
        <div className="inner">
          <Markdown md={'```python\n' + q.answer + '\n```'} />
          {q.note && <div className="note"><b>Why: </b>{q.note}</div>}
          {!q.check && p.py[q.n] !== 'solved' && <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setIn('py', q.n, 'solved')}>Mark as solved</button>}
        </div>
      </details>
      <div className="chapter-foot">
        {prev ? <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/practice/python/${prev.n}`) }}><small>← {prev.n}</small>{prev.title}</a> : <span />}
        {next ? <a href="#" className="next" onClick={(e) => { e.preventDefault(); navigate(`/practice/python/${next.n}`) }}><small>{next.n} →</small>{next.title}</a> : <Link className="next" to="/interview/pyspark"><small>Next →</small>PySpark questions</Link>}
      </div>
    </section>
  )
}
