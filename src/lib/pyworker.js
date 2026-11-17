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

self.onmessage = async (e) => {
  const { id, code, base, check, show } = e.data
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
