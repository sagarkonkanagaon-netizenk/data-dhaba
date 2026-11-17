// Shared by the Pro build scripts: collects a project's text files (code, SQL, docs, config), skipping run output.
import fs from 'node:fs'
import path from 'node:path'

const TEXT = new Set(['.md', '.py', '.sql', '.yml', '.yaml', '.json', '.toml', '.txt', '.ini', '.tf', '.lkml', '.sh', '.cfg', '.example', '.csv', '.js', '.mjs', '.html', '.conf', '.properties', '.gitignore', ''])
const SKIP_DIRS = new Set(['var', 'var10', 'target', 'logs', '__pycache__', '.pytest_cache', '.ruff_cache', '.terraform', 'node_modules', '.git'])
const MAX = 300 * 1024

export function walk(dir, base, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name)
    const rel = path.relative(base, full)
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue
      if (rel === 'starter') { const r = path.join(full, 'README.md'); if (fs.existsSync(r)) out.push({ path: 'starter/README.md', text: fs.readFileSync(r, 'utf8') }); continue }
      walk(full, base, out)
    } else {
      const ext = path.extname(e.name).toLowerCase()
      const st = fs.statSync(full)
      if (!TEXT.has(ext) && !['Makefile', 'Dockerfile'].includes(e.name)) continue
      if (st.size > MAX) { out.push({ path: rel, text: `(file not included: ${(st.size / 1024).toFixed(0)} KB)` }); continue }
      out.push({ path: rel, text: fs.readFileSync(full, 'utf8') })
    }
  }
  return out
}

