import { norm } from './duck.js'

// "Explain my mistake": compare a wrong result with the expected one, row by row,
// and turn the difference into the most likely cause, in plain words.

const key = (r) => r.map(norm).join('␟')

function multiset(rows) {
  const m = new Map()
  for (const r of rows) { const k = key(r); const e = m.get(k); if (e) e.n++; else m.set(k, { n: 1, row: r }) }
  return m
}

// rows in a that are not in b, counting duplicates
function minus(a, b) {
  const out = []
  for (const [k, { n, row }] of a) {
    const left = n - (b.get(k)?.n || 0)
    for (let i = 0; i < left; i++) out.push(row)
  }
  return out
}

const hasDupes = (rows) => new Set(rows.map(key)).size < rows.length
const isNum = (v) => v !== null && v !== '' && !isNaN(Number(v))

export function diffResults(got, want) {
  if (!got || !want) return null
  const out = { cols: want.cols, gotCols: got.cols, missing: [], extra: [], causes: [], column: null }

  if (got.cols.length !== want.cols.length) {
    out.causes.push(`The expected result has ${want.cols.length} column${want.cols.length === 1 ? '' : 's'} (${want.cols.join(', ')}); yours has ${got.cols.length} (${got.cols.join(', ')}). Select exactly the columns the question asks for.`)
    return out
  }

  const G = multiset(got.rows); const W = multiset(want.rows)
  out.missing = minus(W, G)
  out.extra = minus(G, W)
  const m = out.missing.length; const e = out.extra.length

  // Same rows except one column: name the column.
  if (m && m === e) {
    const bad = want.cols.map((_, j) => j).filter((j) => {
      const a = out.missing.map((r) => norm(r[j])).sort().join('|')
      const b = out.extra.map((r) => norm(r[j])).sort().join('|')
      return a !== b
    })
    if (bad.length === 1) {
      const j = bad[0]
      out.column = want.cols[j]
      const nums = out.missing.every((r) => isNum(r[j])) && out.extra.every((r) => isNum(r[j]))
      if (nums) {
        const ws = out.missing.map((r) => Number(r[j])).sort((x, y) => x - y)
        const gs = out.extra.map((r) => Number(r[j])).sort((x, y) => x - y)
        const ratio = gs.map((g, i) => (ws[i] ? g / ws[i] : NaN))
        if (ratio.every((x) => Math.abs(x - Math.round(x)) < 1e-9 && Math.round(x) > 1)) out.causes.push(`Only the column "${out.column}" is off, and your numbers are whole multiples of the right ones. A join is probably repeating rows before you aggregate (fan-out). Aggregate first, then join, or join on the full key.`)
        else if (gs.every((g, i) => Math.abs(g - ws[i]) < 1)) out.causes.push(`Only the column "${out.column}" is off, and only slightly. Check rounding (ROUND to the asked decimals) and integer division (cast to DECIMAL before dividing).`)
        else out.causes.push(`Every row is right except the column "${out.column}". Re-check how you calculate it: the aggregate, the filter inside it, or which rows it covers.`)
      } else if (out.missing.some((r) => r[j] === null) || out.extra.some((r) => r[j] === null)) {
        out.causes.push(`Only the column "${out.column}" is off, and NULLs are involved. Check COALESCE, and whether a LEFT JOIN should keep the row with a NULL or a default value.`)
      } else {
        out.causes.push(`Every row is right except the column "${out.column}". Compare a few values below to see the pattern.`)
      }
    }
  }

  if (!out.causes.length) {
    if (e && !m) {
      if (hasDupes(got.rows) && !hasDupes(want.rows)) out.causes.push('Your result repeats some rows. A join is matching more than one row (fan-out), or you need DISTINCT or a GROUP BY.')
      else out.causes.push(`You return ${e} row${e === 1 ? '' : 's'} too many. A filter is missing or too loose (WHERE, HAVING, or a date range boundary like < vs <=).`)
    } else if (m && !e) {
      if (out.missing.some((r) => r.some((v) => v === null))) out.causes.push(`You are missing ${m} row${m === 1 ? '' : 's'}, and they contain NULLs. An INNER JOIN or a WHERE on the right table may be dropping them: try a LEFT JOIN, and move that condition into ON.`)
      else out.causes.push(`You are missing ${m} row${m === 1 ? '' : 's'}. A filter is too strict, an INNER JOIN should be a LEFT JOIN, or ties are being cut (ROW_NUMBER where RANK keeps ties).`)
    } else if (m && e) {
      out.causes.push(`${m} expected row${m === 1 ? ' is' : 's are'} missing and ${e} row${e === 1 ? '' : 's'} should not be there. Compare them below: usually it is the wrong grouping level or the wrong join key.`)
    }
  }
  return out
}
