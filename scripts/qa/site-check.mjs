// Site check: opens every page of the built site (dist/) in a real browser at phone and desktop width
// and fails if any page throws a JavaScript error, renders blank, has no heading, or scrolls sideways.
//   npm run build && node scripts/qa/site-check.mjs
// Needs Playwright with Chromium (CI installs it; see .github/workflows/site-check.yml).
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium } from 'playwright'

const DIST = path.resolve('dist')
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.wasm': 'application/wasm' }
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

async function urls() {
  const u = ['/', '/path', '/learn', '/practice', '/practice/patterns', '/practice/mock', '/practice/review', '/practice/sql', '/practice/python', '/drills',
    '/interview', '/interview/scenarios', '/interview/pyspark', '/interview/playbook', '/interview/kit', '/interview/job-kit', '/interview/flashcards', '/interview/quiz',
    '/visual', '/spark-visual', '/atlas', '/playground', '/practice/tables', '/daily', '/notes', '/projects', '/resources', '/today', '/profile', '/progress',
    '/pro', '/pro/projects/food-delivery-lakehouse', '/pro/ladder', '/pro/lessons', '/pro/cheatsheets', '/about', '/privacy', '/terms', '/refund', '/shipping', '/contact']
  for (let w = 1; w <= 24; w++) u.push('/path/' + w)
  for (const b of read('src/content/books-index.json')) {
    u.push('/learn/' + b.slug)
    const f = `src/content/books/${b.slug}.json`
    if (fs.existsSync(f)) for (const c of read(f)) u.push(`/learn/${b.slug}/${c.slug}`)
  }
  for (const q of read('src/content/sql-questions.json').questions) u.push('/practice/sql/' + q.n)
  for (const q of read('src/content/py-questions.json').questions.filter((q) => q.section === 'Python')) u.push('/practice/python/' + q.n)
  const { DRILLS } = await import(path.resolve('src/data/drills.js')); for (const d of DRILLS) u.push('/drills/' + d.id)
  const { PRO_DRILLS } = await import(path.resolve('src/data/drillsPro.js')); for (const d of PRO_DRILLS.slice(0, 5)) u.push('/drills/' + d.id)
  const { TOOLS } = await import(path.resolve('src/data/atlas.js')); for (const t of TOOLS) u.push('/atlas/' + t.id)
  const { DAILY } = await import(path.resolve('src/data/daily.js')); for (const d of DAILY) u.push('/daily/' + d.id)
  for (const s of ['strategy', 'naukri', 'banner']) u.push('/interview/job-kit/' + s)
  return [...new Set(u)]
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p.endsWith('/')) p += 'index.html'
  const f = path.join(DIST, p)
  if (!f.startsWith(DIST) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res)
}).listen(0)
const base = `http://127.0.0.1:${server.address().port}`
const list = await urls()
const browser = await chromium.launch()
const problems = []
for (const width of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } })
  // Keep the check offline and fast: only our own files load.
  await ctx.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.fulfill({ status: 204, body: '' })))
  const page = await ctx.newPage()
  let errs = []
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0]))
  for (const u of list) {
    errs = []
    await page.goto(`${base}/#${u}`).catch((e) => errs.push(e.message))
    await page.waitForTimeout(500)
    const info = await page.evaluate(() => {
      const m = document.getElementById('main') || document.body
      return { h1: !!m.querySelector('h1'), len: m.innerText.length, wide: document.documentElement.scrollWidth > innerWidth + 2 }
    }).catch(() => ({ h1: false, len: 0, wide: false }))
    const why = [...errs.map((e) => 'JS error: ' + e)]
    if (!info.h1) why.push('no heading')
    if (info.len < 150) why.push(`almost empty (${info.len} characters)`)
    if (info.wide) why.push('scrolls sideways')
    if (why.length) problems.push(`${width}px ${u}: ${why.join('; ')}`)
  }
  await ctx.close()
}
await browser.close(); server.close()
console.log(`Checked ${list.length} pages at 390px and 1280px.`)
if (problems.length) { console.log(problems.join('\n')); console.log(`::error::${problems.length} page problems`); process.exit(1) }
console.log('All pages OK.')
