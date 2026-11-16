import './rowdiff.css'

const MAX = 6
const cell = (v, k) => (v === null || v === undefined ? <td key={k} className="null">NULL</td> : <td key={k}>{typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 10000) / 10000 : String(v)}</td>)

function Rows({ title, tone, cols, rows, hi }) {
  if (!rows.length) return null
  return (
    <div className={'rd-set ' + tone}>
      <div className="rd-h"><b>{title}</b><span>{rows.length} row{rows.length === 1 ? '' : 's'}</span></div>
      <div className="rd-scroll">
        <table className="rtable">
          <thead><tr>{cols.map((c) => <th key={c} className={c === hi ? 'rd-hi' : ''}>{c}</th>)}</tr></thead>
          <tbody>{rows.slice(0, MAX).map((r, i) => <tr key={i}>{r.map((v, j) => cell(v, j))}</tr>)}</tbody>
        </table>
      </div>
      {rows.length > MAX && <div className="small muted rd-more">and {rows.length - MAX} more</div>}
    </div>
  )
}

// Shows what is wrong with a result: the likely cause first, then the exact rows.
export default function RowDiff({ diff }) {
  if (!diff) return null
  return (
    <div className="rd">
      <div className="rd-top"><span className="rd-tag">Explain my mistake</span></div>
      {diff.causes.map((c) => <p key={c} className="rd-cause">{c}</p>)}
      <div className="rd-grid">
        <Rows title="Expected, but missing from yours" tone="miss" cols={diff.cols} rows={diff.missing} hi={diff.column} />
        <Rows title="In yours, but not expected" tone="extra" cols={diff.gotCols} rows={diff.extra} hi={diff.column} />
      </div>
    </div>
  )
}
