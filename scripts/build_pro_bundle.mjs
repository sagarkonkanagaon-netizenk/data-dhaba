// Builds the Pro project files that paying learners download from Supabase Storage (bucket "pro", folder "projects").
//
//   node scripts/build_pro_bundle.mjs --src <folder with pNN-* project folders> --out <folder>
//
// Each project becomes <out>/pNN.bin = gzip(JSON { name, files: [{ path, text }] }), plus <out>/index.json.
// The files are NOT encrypted: they are protected by the bucket being private, readable only by accounts
// the database says have Pro (see supabase/payments.sql). Never put them in public/ or commit them.
// Upload: Supabase > Storage > pro > create folder "projects" > upload every file from <out> (replace existing).
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { walk } from './pro_files.mjs'

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]]] : a), []))
if (!args.src || !args.out) { console.error('usage: --src <dir> --out <dir>'); process.exit(1) }
const OUT = path.resolve(args.out)
if (OUT.startsWith(path.resolve('public'))) { console.error('refusing to write Pro files into public/'); process.exit(1) }
fs.mkdirSync(OUT, { recursive: true })
const only = args.only ? new Set(args.only.split(',').map(Number)) : null
const projects = []
for (const name of fs.readdirSync(args.src).filter((n) => /^p\d\d-/.test(n)).sort()) {
  const n = Number(name.slice(1, 3))
  if (only && !only.has(n)) continue
  const files = walk(path.join(args.src, name), path.join(args.src, name), [])
  const file = `p${String(n).padStart(2, '0')}.bin`
  fs.writeFileSync(path.join(OUT, file), zlib.gzipSync(Buffer.from(JSON.stringify({ name, files })), { level: 9 }))
  projects.push({ n, name, file, files: files.length })
  console.log(`${name}: ${files.length} files -> ${file}`)
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ v: 1, built: new Date().toISOString().slice(0, 10), projects }, null, 1))
console.log(`${projects.length} projects -> ${OUT}`)
