const BASE = import.meta.env.VITE_PYODIDE_BASE || 'https://cdn.jsdelivr.net/npm/pyodide@0.29.5/'
let worker = null
let seq = 0
const pending = new Map()
let ready = false

function spawn() {
  worker = new Worker(new URL('./pyworker.js', import.meta.url), { type: 'module' })
  worker.onmessage = (e) => {
    const p = pending.get(e.data.id)
    if (p) { pending.delete(e.data.id); ready = true; p(e.data) }
  }
  worker.onerror = (e) => {
    for (const [id, p] of pending) p({ id, error: 'Python worker crashed: ' + (e.message || 'unknown error') })
    pending.clear()
    worker = null
  }
}

export function isPyReady() { return ready }

export function runPython(code, check, opts = {}) {
  if (!worker) spawn()
  const id = ++seq
  const base = new URL(BASE, window.location.href).href
  return new Promise((resolve) => {
    pending.set(id, resolve)
    worker.postMessage({ id, code, base, check, show: Boolean(opts.show) })
  })
}

export function stopPython() {
  if (worker) worker.terminate()
  worker = null
  ready = false
  for (const [id, p] of pending) p({ id, error: 'Stopped.' })
  pending.clear()
}

// Translate SQL written in another dialect (Snowflake, BigQuery, T-SQL...) into DuckDB SQL.
export const DIALECTS = [
  ['duckdb', 'DuckDB (default)'], ['snowflake', 'Snowflake'], ['bigquery', 'BigQuery'], ['tsql', 'T-SQL (SQL Server, Synapse)'],
  ['spark', 'Spark SQL (Databricks)'], ['postgres', 'PostgreSQL'], ['mysql', 'MySQL'], ['redshift', 'Redshift'], ['oracle', 'Oracle'],
]
export function transpileSql(sql, dialect) {
  if (!worker) spawn()
  const id = ++seq
  const base = new URL(BASE, window.location.href).href
  const wheel = new URL(import.meta.env.BASE_URL + 'vendor/sqlglot-30.32.0-py3-none-any.whl', window.location.href).href
  return new Promise((resolve) => {
    pending.set(id, resolve)
    worker.postMessage({ id, base, transpile: { sql, dialect, wheel } })
  })
}
