import { useEffect, useRef } from 'react'

// Cloudflare Turnstile, the free invisible "are you human" check. Only shows when VITE_TURNSTILE_SITE_KEY is set
// (a public key, kept as a GitHub repo variable). Supabase checks the token when captcha is switched on in Auth.
export const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading = null
function load() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!loading) loading = new Promise((ok, fail) => { const s = document.createElement('script'); s.src = SRC; s.async = true; s.onload = () => ok(window.turnstile); s.onerror = fail; document.head.appendChild(s) })
  return loading
}

// onToken(token) runs when the check passes, onToken('') when the token expires. Change `reset` to get a fresh token.
export default function Turnstile({ onToken, reset = 0 }) {
  const box = useRef(null)
  const id = useRef(null)
  useEffect(() => {
    if (!TURNSTILE_KEY) return undefined
    let gone = false
    load().then((ts) => {
      if (gone || !box.current) return
      id.current = ts.render(box.current, { sitekey: TURNSTILE_KEY, size: 'flexible', appearance: 'interaction-only',
        callback: (t) => onToken(t), 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') })
    }).catch(() => onToken(''))
    return () => { gone = true; try { if (id.current != null) window.turnstile.remove(id.current) } catch (e) { /* ignore */ } }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (reset && id.current != null) { try { window.turnstile.reset(id.current) } catch (e) { /* ignore */ } onToken('') } }, [reset]) // eslint-disable-line react-hooks/exhaustive-deps
  return TURNSTILE_KEY ? <div ref={box} className="turnstile" style={{ marginTop: 8 }} /> : null
}
