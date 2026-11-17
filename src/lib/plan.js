// Turns DuckDB's EXPLAIN ANALYZE (JSON) into plain steps, finds the slowest one, and suggests fixes.
import { splitSql } from './duck.js'

const NAMES = {
  TABLE_SCAN: 'Read table', SEQ_SCAN: 'Read table', READ_PARQUET: 'Read file', FILTER: 'Filter rows',
  HASH_JOIN: 'Hash join', NESTED_LOOP_JOIN: 'Nested loop join', BLOCKWISE_NL_JOIN: 'Row-by-row join', CROSS_PRODUCT: 'Cross join',
  PIECEWISE_MERGE_JOIN: 'Range join', ASOF_JOIN: 'As-of join', HASH_GROUP_BY: 'Group by', PERFECT_HASH_GROUP_BY: 'Group by',
  UNGROUPED_AGGREGATE: 'Aggregate', WINDOW: 'Window function', STREAMING_WINDOW: 'Window function', ORDER_BY: 'Sort',
  TOP_N: 'Top N', LIMIT: 'Limit', STREAMING_LIMIT: 'Limit', PROJECTION: 'Pick columns', HASH_DISTINCT: 'Distinct',
  UNION: 'Union', CTE: 'CTE', CTE_SCAN: 'Read CTE', DELIM_JOIN: 'Correlated subquery join', DELIM_SCAN: 'Correlated subquery',
}

export function explainSql(sql) {
  const stmts = splitSql(sql)
  if (!stmts.length) return null
  const last = stmts[stmts.length - 1]
  if (!/^\s*(with|select|from|\()/i.test(last)) return null
  return [...stmts.slice(0, -1), 'EXPLAIN (ANALYZE, FORMAT JSON) ' + last].join(';\n')
}

// Flatten the operator tree, skipping the wrapper nodes, keeping depth for indentation.
export function parsePlan(result) {
  const row = result && result.rows && result.rows[0]
  if (!row) return null
  const root = JSON.parse(row[row.length - 1])
  const ops = []
  const walk = (n, d) => {
    const t = n.operator_type || n.operator_name
    const skip = !t || t === 'EXPLAIN_ANALYZE' || t === 'RESULT_COLLECTOR'
    if (!skip) {
      const info = n.extra_info || {}
      const detail = info.Table || info.Function || info.Join || info.Conditions || info.Groups || info.Aggregates || info['Order By'] || info.Filters || info.Expression || ''
      ops.push({ type: t, name: NAMES[t] || t.replace(/_/g, ' ').toLowerCase(), rows: n.operator_cardinality || 0, scanned: n.operator_rows_scanned || 0, ms: (n.operator_timing || 0) * 1000, depth: d, detail: Array.isArray(detail) ? detail.join(', ') : String(detail), info })
    }
    for (const c of n.children || []) walk(c, skip ? d : d + 1)
  }
  walk(root, 0)
  const total = ops.reduce((a, o) => a + o.ms, 0) || 1
  ops.forEach((o) => { o.share = o.ms / total })
  return { ops, total, slowest: ops.reduce((a, o) => (o.ms > a.ms ? o : a), ops[0]), tips: tips(ops) }
}

function tips(ops) {
  const out = []
  const scanned = ops.filter((o) => o.type === 'TABLE_SCAN' || o.type === 'SEQ_SCAN')
  for (const s of scanned) {
    const cols = s.info.Projections ? [].concat(s.info.Projections).length : 0
    if (cols >= 8) out.push(`It reads ${cols} columns from ${s.info.Table || 'a table'}. Select only the columns you need: column stores like DuckDB, Snowflake and BigQuery read less data and run faster.`)
    if (s.scanned > 500000 && !s.info.Filters) out.push(`It reads all ${s.scanned.toLocaleString('en-IN')} rows of ${s.info.Table || 'a table'}. If you only need some of them, a WHERE on a date or key column lets the engine skip data.`)
  }
  if (ops.some((o) => ['NESTED_LOOP_JOIN', 'BLOCKWISE_NL_JOIN', 'CROSS_PRODUCT'].includes(o.type))) out.push('A join compares every row with every row. Give it an equality condition (a = b) so it can use a hash join, or check that you did not forget the ON clause.')
  if (ops.some((o) => o.type === 'DELIM_JOIN')) out.push('A correlated subquery runs per row. Rewriting it as a JOIN or a window function is usually faster and is what interviewers want to see.')
  const sort = ops.find((o) => o.type === 'ORDER_BY' && o.rows > 100000)
  if (sort) out.push(`It sorts ${sort.rows.toLocaleString('en-IN')} rows. If you only need the top few, add LIMIT so the engine can keep a small top-N instead of sorting everything.`)
  const win = ops.find((o) => o.type === 'WINDOW' && o.share > 0.4)
  if (win) out.push('The window function is the slowest step. Filter rows before it, and partition by a key with many values so the work spreads out.')
  const join = ops.find((o) => o.type === 'HASH_JOIN' && o.share > 0.4)
  if (join) out.push('The join is the slowest step. Filter and aggregate each side before joining so fewer rows meet in the middle.')
  return out.slice(0, 4)
}
