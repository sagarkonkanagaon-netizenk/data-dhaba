import './planview.css'

// The query plan as a readable list: each step, rows out, time, and the slowest step highlighted.
export default function PlanView({ plan, onClose }) {
  if (!plan) return null
  if (plan.error) return <div className="pv-box"><div className="pv-top"><b>Query plan</b><button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button></div><div className="err">{plan.error}</div></div>
  const { ops, total, slowest } = plan
  const speed = total < 60 ? ['Fast', 'ok'] : total < 400 ? ['Fine', 'mid'] : ['Slow', 'bad']
  return (
    <div className="pv-box" aria-label="Query plan">
      <div className="pv-top">
        <b>Query plan</b>
        <span className={'pv-speed ' + speed[1]}>{speed[0]} · {Math.round(total)} ms</span>
        <span className="small muted">Read from the bottom up: the engine starts by reading tables and ends with your result.</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <ol className="pv-ops">
        {ops.map((o, i) => (
          <li key={i} className={o === slowest && ops.length > 1 ? 'slow' : ''} style={{ '--d': o.depth }}>
            <div className="pv-line">
              <b>{o.name}</b>
              {o.detail && <code title={o.detail}>{o.detail.length > 80 ? o.detail.slice(0, 77) + '…' : o.detail}</code>}
              <span className="pv-num">{o.rows.toLocaleString('en-IN')} rows{o.scanned ? ` · read ${o.scanned.toLocaleString('en-IN')}` : ''}</span>
              <span className="pv-num">{o.ms < 1 ? '<1' : Math.round(o.ms)} ms</span>
            </div>
            <i className="pv-bar" style={{ width: Math.max(1, Math.round(o.share * 100)) + '%' }} />
            {o === slowest && ops.length > 1 && <span className="pv-tag">slowest step</span>}
          </li>
        ))}
      </ol>
      {plan.tips.length > 0
        ? <div className="pv-tips"><b>How to make it faster</b><ul>{plan.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
        : <p className="small pv-good">No obvious problems in this plan. This is how a good query looks.</p>}
    </div>
  )
}
