// Runs Python in a Web Worker so infinite loops can be stopped.
let pyodide = null

async function init(base) {
  if (pyodide) return pyodide
  const mod = await import(/* @vite-ignore */ base + 'pyodide.mjs')
  pyodide = await mod.loadPyodide({ indexURL: base })
  return pyodide
}

// SQL dialect translation with sqlglot (pure Python, MIT licence), unpacked once from a vendored wheel.
let glot = false
async function transpile(py, { sql, dialect, wheel }) {
  if (!glot) { const buf = await (await fetch(wheel)).arrayBuffer(); py.unpackArchive(buf, 'wheel'); glot = true }
  py.globals.set('__sql', sql); py.globals.set('__dialect', dialect)
  return JSON.parse(py.runPython(`
import json, sqlglot
try:
    __r = json.dumps({"sql": ";\\n".join(sqlglot.transpile(__sql, read=__dialect, write="duckdb", pretty=True))})
except Exception as __e:
    __r = json.dumps({"error": str(__e).split("\\n")[0]})
__r
`))
}

// Step-through: split the outer SELECT into the order SQL really runs it
// (FROM, WHERE, GROUP BY, HAVING, SELECT, QUALIFY, ORDER BY, LIMIT) and return one query per step.
async function steps(py, { sql, wheel }) {
  if (!glot) { const buf = await (await fetch(wheel)).arrayBuffer(); py.unpackArchive(buf, 'wheel'); glot = true }
  py.globals.set('__sql', sql)
  return JSON.parse(py.runPython(`
import json, sqlglot
from sqlglot import exp
def __steps(src):
    stmts = [s for s in sqlglot.parse(src, read="duckdb") if s is not None]
    if not stmts:
        return {"error": "Write a query first."}
    q = stmts[-1]
    if not isinstance(q, exp.Select):
        return {"error": "Watch it run works on a single SELECT query (CTEs are fine). This one is a " + q.key.upper() + "."}
    a = q.args
    def make(keep, star=False, group_view=False):
        s = q.copy()
        for k in ["where", "group", "having", "qualify", "order", "limit", "offset", "distinct", "windows"]:
            if k not in keep:
                s.set(k, None)
        if star:
            s.set("expressions", [exp.Star()])
        if group_view:
            sel = a["expressions"]
            aliases = {e.alias: e.this for e in sel if isinstance(e, exp.Alias)}
            keys = []
            for g in a["group"].expressions:
                if isinstance(g, exp.Literal) and g.is_int and 0 < int(g.name) <= len(sel):
                    t = sel[int(g.name) - 1]
                    keys.append(exp.alias_(t.this.copy(), t.alias) if isinstance(t, exp.Alias) else t.copy())
                elif isinstance(g, exp.Column) and not g.table and g.name in aliases:
                    keys.append(exp.alias_(aliases[g.name].copy(), g.name))
                else:
                    keys.append(g.copy())
            cols = []
            for i, g in enumerate(keys):
                cols.append(g if isinstance(g, (exp.Column, exp.Alias)) else exp.alias_(g, "group_key_%d" % (i + 1)))
            cols.append(exp.alias_(exp.Count(this=exp.Star()), "rows_in_group"))
            s.set("expressions", cols)
            s.set("order", exp.Order(expressions=[exp.Ordered(this=exp.Literal.number(i + 1)) for i in range(len(keys))]))
        return s.sql(dialect="duckdb", pretty=True)
    out = []
    has = lambda k: a.get(k) is not None and (k != "group" or bool(a["group"].expressions))
    if a.get("from_") is None and a.get("from") is None:
        return {"error": "This query has no FROM, so there is nothing to step through."}
    joins = len(a.get("joins") or [])
    out.append({"step": "FROM" + (" + JOIN" if joins else ""), "say": "First SQL builds the rows to work on: the table" + (" and every join" if joins else "") + ". Nothing is filtered or picked yet.", "sql": make([], star=True)})
    if has("where"):
        out.append({"step": "WHERE", "say": "WHERE keeps only rows where the condition is true. It runs before grouping, so it cannot use SUM or COUNT.", "sql": make(["where"], star=True)})
    if has("group"):
        out.append({"step": "GROUP BY", "say": "GROUP BY folds the rows into one row per group. Here you see each group and how many rows went into it.", "sql": make(["where", "group"], group_view=True)})
    if has("having"):
        out.append({"step": "HAVING", "say": "HAVING filters whole groups, using aggregates like COUNT or SUM.", "sql": make(["where", "group", "having"], group_view=True)})
    out.append({"step": "SELECT" + (" + DISTINCT" if has("distinct") else ""), "say": "Now SQL works out the columns you asked for, including window functions. This is why WHERE cannot see a SELECT alias.", "sql": make(["where", "group", "having", "distinct", "windows"])})
    if has("qualify"):
        out.append({"step": "QUALIFY", "say": "QUALIFY filters on window function results, after they are computed.", "sql": make(["where", "group", "having", "distinct", "windows", "qualify"])})
    if has("order"):
        out.append({"step": "ORDER BY", "say": "ORDER BY sorts the final rows. It runs late, so it can use SELECT aliases.", "sql": make(["where", "group", "having", "distinct", "windows", "qualify", "order"])})
    if has("limit") or has("offset"):
        out.append({"step": "LIMIT", "say": "LIMIT keeps the first rows of the sorted result. It is the very last step.", "sql": make(["where", "group", "having", "distinct", "windows", "qualify", "order", "limit", "offset"])})
    pre = ";\\n".join(s.sql(dialect="duckdb") for s in stmts[:-1])
    return {"steps": out, "pre": pre}
try:
    __r = json.dumps(__steps(__sql))
except Exception as __e:
    __r = json.dumps({"error": "Could not read this query: " + str(__e).split("\\n")[0]})
__r
`))
}

self.onmessage = async (e) => {
  const { id, code, base, check, show } = e.data
  if (e.data.steps) {
    try { self.postMessage({ id, ...(await steps(await init(base), e.data.steps)) }) } catch (err) { self.postMessage({ id, error: String(err.message || err) }) }
    return
  }
  if (e.data.transpile) {
    try { self.postMessage({ id, ...(await transpile(await init(base), e.data.transpile)) }) } catch (err) { self.postMessage({ id, error: String(err.message || err) }) }
    return
  }
  let out = ''
  try {
    const py = await init(base)
    py.setStdout({ batched: (s) => { out += s + '\n' } })
    py.setStderr({ batched: (s) => { out += s + '\n' } })
    // Fetch pandas, sqlite3 and friends on first import. zoneinfo needs the tzdata package.
    try {
      await py.loadPackagesFromImports(code)
      if (/\bzoneinfo\b/.test(code)) await py.loadPackage('tzdata')
    } catch (err) { /* the import itself will report a clear error */ }
    if (check) {
      py.globals.set('__user_code', code)
      py.globals.set('__ref_code', check.ref)
      py.globals.set('__fn', check.fn)
      py.globals.set('__args', check.args)
      const verdict = await py.runPythonAsync(`
import copy, json
def __run(src, fn, args_src):
    ns = {}
    exec(src, ns)
    f = ns.get(fn)
    if f is None:
        raise NameError(f"define a function named {fn}()")
    a, k = eval(f"(lambda *a, **k: (a, k))({args_src})", {})
    a2, k2 = copy.deepcopy(a), copy.deepcopy(k)
    res = f(*a2, **k2)
    if hasattr(res, '__next__') or hasattr(res, 'send'):
        res = list(res)
    return res, a2
__u = __run(__user_code, __fn, __args)
__r = __run(__ref_code, __fn, __args)
json.dumps({"ok": __u == __r, "got": repr(__u[0]), "want": repr(__r[0])})
`)
      self.postMessage({ id, out, verdict: JSON.parse(verdict) })
    } else if (show) {
      // Notebook style: print the value of the last line, if there is one.
      py.globals.set('__cell', code)
      // Errors show only the learner's own lines, not Pyodide's internals.
      const err = await py.runPythonAsync(`
from pyodide.code import eval_code_async as __eval
import traceback as __tbm
__err = None
try:
    __val = await __eval(__cell, globals(), filename="<cell>")
    if __val is not None:
        print(repr(__val))
except BaseException as __e:
    __tb = __e.__traceback__
    while __tb is not None and __tb.tb_frame.f_code.co_filename != "<cell>":
        __tb = __tb.tb_next
    __err = "".join(__tbm.format_exception(type(__e), __e, __tb)).replace('File "<cell>", ', "").strip()
__err
`)
      if (err) self.postMessage({ id, out, error: err })
      else self.postMessage({ id, out })
    } else {
      await py.runPythonAsync(code)
      self.postMessage({ id, out })
    }
  } catch (err) {
    const msg = String(err && err.message ? err.message : err)
    const lines = msg.split('\n').filter((l) => !l.includes('/lib/python') && !l.includes('pyodide') && !l.includes('_pyodide'))
    self.postMessage({ id, out, error: lines.join('\n').trim() })
  }
}
