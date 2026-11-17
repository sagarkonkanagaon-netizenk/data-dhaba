import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Token from './Token.jsx'
import { METALS } from '../data/tokens.js'

// Party poppers: two bursts of confetti, ribbons and glitter shot from the bottom corners.
function poppers(canvas, colors) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {}
  const dpr = window.devicePixelRatio || 1
  const W = innerWidth, H = innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr)
  const parts = []
  const burst = (side, n, power) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 - side * (0.12 + Math.random() * 0.6)
      const v = power * (0.55 + Math.random() * 0.6)
      const kind = Math.random() < 0.18 ? 'ribbon' : Math.random() < 0.35 ? 'glitter' : 'paper'
      parts.push({ x: side < 0 ? W * 0.04 : W * 0.96, y: H + 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, s: 6 + Math.random() * 7, c: colors[(Math.random() * colors.length) | 0], kind, ph: Math.random() * 6, life: 0 })
    }
  }
  const P = Math.min(26, H / 28)
  burst(-1, 110, P); burst(1, 110, P)
  const t2 = setTimeout(() => { burst(-1, 80, P * 0.9); burst(1, 80, P * 0.9) }, 1400)
  let raf
  const tick = () => {
    ctx.clearRect(0, 0, W, H)
    let alive = 0
    for (const p of parts) {
      p.life++
      p.vy += p.kind === 'glitter' ? 0.16 : 0.24; p.vx *= 0.985; p.vy *= p.kind === 'ribbon' ? 0.985 : 0.995
      p.x += p.vx + (p.kind === 'paper' ? Math.sin(p.life / 9 + p.ph) * 0.6 : 0); p.y += p.vy; p.r += p.vr
      if (p.y > H + 40 || p.life > 380) continue
      alive++
      ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = Math.max(0, 1 - p.life / 380)
      ctx.fillStyle = p.c; ctx.strokeStyle = p.c
      if (p.kind === 'glitter') { const tw = 0.5 + 0.5 * Math.sin(p.life / 3 + p.ph); ctx.globalAlpha *= tw; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, 7); ctx.fill() }
      else if (p.kind === 'ribbon') { ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 26; k++) { const xx = -k * 1.6; const yy = Math.sin(k / 3 + p.life / 5 + p.ph) * 5; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy) } ctx.stroke() }
      else { ctx.rotate(p.r); ctx.scale(1, Math.abs(Math.cos(p.life / 7 + p.ph))); ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s / 1.5) }
      ctx.restore()
    }
    if (alive || parts.length < 200) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => { cancelAnimationFrame(raf); clearTimeout(t2) }
}

export default function TokenReveal({ token, next, onClose }) {
  const cv = useRef(null)
  const [light, mid, , , glow] = METALS[token.metal]
  useEffect(() => {
    const stop = poppers(cv.current, [light, mid, '#ffffff', '#e8366f', '#8ff7ee', '#f2b14b'])
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => { stop(); window.removeEventListener('keydown', k) }
  }, [token.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const share = `I just earned the ${token.title} badge on Data Dhaba: ${token.desc}. ${location.origin}`
  return (
    <div className="tk-stage" role="dialog" aria-label={`${token.name} unlocked`} style={{ '--glow': glow, '--tk-light': light }} onClick={onClose}>
      <canvas ref={cv} className="tk-confetti" aria-hidden="true" />
      <span className="tk-popper l" aria-hidden="true">🎉</span>
      <span className="tk-popper r" aria-hidden="true">🎉</span>
      <div className="tk-inner" onClick={(e) => e.stopPropagation()}>
        <div className="tk-rays" aria-hidden="true" />
        <div className="tk-glow" aria-hidden="true" />
        <div className="tk-flash" aria-hidden="true" />
        <div className="tk-coin"><Token token={token} size={290} /></div>
        <div className="tk-text">
          <span className="tk-kicker">{token.name} unlocked</span>
          <h2 className="tk-title">{token.title}</h2>
          <p className="tk-desc">{token.desc}.</p>
          {next && <p className="tk-next">Next: {next.title}, {next.desc.toLowerCase()}.</p>}
          <div className="tk-btns">
            <button className="btn btn-primary" onClick={onClose}>Keep going</button>
            <a className="btn btn-ghost" href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(share)}`} target="_blank" rel="noreferrer">Share on LinkedIn</a>
            <Link className="btn btn-ghost" to="/progress#tokens" onClick={onClose}>See all badges</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
