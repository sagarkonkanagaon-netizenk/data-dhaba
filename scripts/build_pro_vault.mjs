// Builds the encrypted Pro vault the owner page reads (public/pro-vault/).
//
//   node scripts/build_pro_vault.mjs --src <folder with pNN-* project folders> --pass-file <file with the passphrase>
//
// Each project becomes one file: gzip(JSON of its text files), encrypted with AES-256-GCM. The key comes from the
// passphrase via PBKDF2-SHA256 (600,000 iterations, random salt). Without the passphrase the files are unreadable,
// so they can sit on a public static site. The passphrase is never written into the repo.
// Run it locally whenever a project is added; commit only public/pro-vault/.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]]] : a), []))
if (!args.src || !args['pass-file']) { console.error('usage: --src <dir> --pass-file <file>'); process.exit(1) }
const pass = fs.readFileSync(args['pass-file'], 'utf8').trim()
if (pass.length < 16) { console.error('passphrase too short'); process.exit(1) }
const OUT = path.resolve(args.out || 'public/pro-vault')
const ITER = 600000
const TEXT = new Set(['.md', '.py', '.sql', '.yml', '.yaml', '.json', '.toml', '.txt', '.ini', '.tf', '.lkml', '.sh', '.cfg', '.example', '.csv', '.js', '.mjs', '.html', '.conf', '.properties', '.gitignore', ''])
const SKIP_DIRS = new Set(['var', 'var10', 'target', 'logs', '__pycache__', '.pytest_cache', '.ruff_cache', '.terraform', 'node_modules', '.git'])
const MAX = 300 * 1024

function walk(dir, base, out) {
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

function seal(key, buf) {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key, iv)
  return Buffer.concat([iv, c.update(buf), c.final(), c.getAuthTag()])
}

const salt = crypto.randomBytes(16)
const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, 'sha256')
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
const projects = []
for (const name of fs.readdirSync(args.src).filter((n) => /^p\d\d-/.test(n)).sort()) {
  const files = walk(path.join(args.src, name), path.join(args.src, name), [])
  const id = crypto.randomBytes(6).toString('hex')
  fs.writeFileSync(path.join(OUT, `${id}.bin`), seal(key, zlib.gzipSync(Buffer.from(JSON.stringify({ name, files })))))
  projects.push({ n: Number(name.slice(1, 3)), file: `${id}.bin`, files: files.length })
  console.log(`${name}: ${files.length} files`)
}
const index = { v: 1, iter: ITER, salt: salt.toString('base64'), check: seal(key, Buffer.from('data-dhaba-owner')).toString('base64'), projects }
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index))
console.log(`vault: ${projects.length} projects -> ${OUT}`)
