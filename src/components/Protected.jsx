import { useEffect, useMemo, useState } from 'react'
import { client, AUTH_EVENT } from '../lib/auth.js'
import './protected.css'

// Read-only wrapper for paid and course content: a faint watermark with the reader's email,
// and no copy, cut, right-click, drag or print. Inputs and code editors inside still work normally.
// Screenshots cannot be blocked by any website; the email watermark makes a leaked screenshot traceable.

let cached = ''
export function useViewerEmail() {
  const [email, setEmail] = useState(cached)
  useEffect(() => {
    let live = true
    const load = async () => {
      try {
        const sb = await client()
        if (!sb) return
        const { data: { session } } = await sb.auth.getSession()
        cached = session?.user?.email || ''
        if (live) setEmail(cached)
      } catch (e) { /* ignore */ }
    }
    load()
    window.addEventListener(AUTH_EVENT, load)
    return () => { live = false; window.removeEventListener(AUTH_EVENT, load) }
  }, [])
  return email
}

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]))
const editable = (el) => Boolean(el && el.closest && el.closest('input, textarea, select, [contenteditable="true"], .cm-editor, .monaco-editor'))

export default function Protected({ children, className = '' }) {
  const email = useViewerEmail()
  const mark = email ? `datadhaba.in · ${email}` : 'datadhaba.in'
  const bg = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><text x="20" y="130" transform="rotate(-24 210 110)" font-family="Arial, sans-serif" font-size="15" fill="#888" fill-opacity="0.16">${esc(mark)}</text></svg>`
    return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`
  }, [mark])

  useEffect(() => {
    // Block the print and save shortcuts while protected content is on screen.
    const key = (e) => {
      const k = (e.key || '').toLowerCase()
      if ((e.ctrlKey || e.metaKey) && (k === 'p' || k === 's')) { e.preventDefault(); e.stopPropagation() }
    }
    window.addEventListener('keydown', key, true)
    return () => window.removeEventListener('keydown', key, true)
  }, [])

  const block = (e) => { if (!editable(e.target)) e.preventDefault() }
  return (
    <div className={'protected ' + className} onCopy={block} onCut={block} onContextMenu={block} onDragStart={block}>
      {children}
      <div className="protected-mark" aria-hidden="true" style={{ backgroundImage: bg }} />
    </div>
  )
}
