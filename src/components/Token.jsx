import { useId } from 'react'
import { METALS } from '../data/tokens.js'
import './token.css'

// Carved 3D badges. Every badge has its own silhouette and its own raised emblem, lit by an SVG
// lighting filter so the metal reads as carved, plus an engraved ribbon with the number.

const C = 100
const pt = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)]
const poly = (pts) => 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L') + ' Z'
function star(n, ro, ri, rot = -Math.PI / 2) {
  const out = []
  for (let i = 0; i < n * 2; i++) out.push(pt(i % 2 ? ri : ro, rot + (i * Math.PI) / n))
  return poly(out)
}
function wobble(fn, steps = 120) {
  const out = []
  for (let i = 0; i < steps; i++) { const a = (i / steps) * Math.PI * 2; out.push(pt(fn(a), a)) }
  return poly(out)
}
const circle = (r) => `M${C - r} ${C} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`

// Silhouettes, one per badge.
export const SHAPES = {
  scallop: wobble((a) => 90 + 6 * Math.cos(a * 18)),
  hex: poly([0, 1, 2, 3, 4, 5].map((i) => pt(94, -Math.PI / 2 + (i * Math.PI) / 3))),
  thali: circle(95),
  shield: 'M100 6 L182 32 V92 C182 148 146 180 100 196 C54 180 18 148 18 92 V32 Z',
  gem: poly([[100, 4], [166, 30], [196, 96], [160, 168], [100, 196], [40, 168], [4, 96], [34, 30]]),
  sun: star(16, 97, 80),
  seal: wobble((a) => 86 + 5 * Math.sin(a * 5) + 3 * Math.sin(a * 11 + 1) + 2 * Math.cos(a * 17)),
  rangoli: star(8, 97, 72, -Math.PI / 2 + Math.PI / 8),
}

// Raised emblems, drawn in the middle of the badge (roughly 60..140).
const EMBLEMS = {
  chai: (
    <g>
      <path d="M78 84 H122 L115 136 Q114 142 108 142 H92 Q86 142 85 136 Z" />
      <rect x="80" y="100" width="40" height="5" rx="2" opacity=".55" />
      <rect x="92" y="60" width="9" height="9" rx="2" /><rect x="104" y="50" width="7" height="7" rx="2" /><rect x="96" y="40" width="5" height="5" rx="1.5" />
    </g>
  ),
  tandoor: (
    <g>
      <path d="M66 140 Q64 92 100 84 Q136 92 134 140 Z" />
      <ellipse cx="100" cy="86" rx="16" ry="5" opacity=".5" />
      <rect x="86" y="56" width="7" height="24" rx="2" /><rect x="97" y="44" width="7" height="36" rx="2" /><rect x="108" y="62" width="7" height="18" rx="2" />
    </g>
  ),
  join: (
    <g>
      <path d="M72 76 L100 104 L128 76 V132 L100 104 L72 132 Z" />
    </g>
  ),
  crown: (
    <g>
      <path d="M62 128 L58 74 L80 98 L100 64 L120 98 L142 74 L138 128 Z" />
      <rect x="60" y="132" width="80" height="10" rx="4" />
      <circle cx="58" cy="70" r="6" /><circle cx="100" cy="58" r="7" /><circle cx="142" cy="70" r="6" />
    </g>
  ),
  facets: (
    <g fill="none" strokeWidth="3" strokeLinejoin="round">
      <path d="M70 60 H130 L150 92 L100 150 L50 92 Z" />
      <path d="M50 92 H150 M70 60 L84 92 L100 60 L116 92 L130 60 M84 92 L100 150 L116 92" />
    </g>
  ),
  sunrise: (
    <g>
      <path d="M58 126 A42 42 0 0 1 142 126 Z" />
      <rect x="48" y="130" width="104" height="6" rx="3" />
      {[-60, -30, 0, 30, 60].map((d) => <rect key={d} x="97" y="52" width="6" height="16" rx="3" transform={`rotate(${d} 100 126)`} />)}
    </g>
  ),
  letter: (
    <g>
      <path d="M58 80 H142 V136 H58 Z" />
      <path d="M58 80 L100 112 L142 80" fill="none" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="132" cy="80" r="16" /><path d="M124 80 L130 86 L141 74" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  weave: (
    <g>
      {[0, 1, 2].map((i) => <rect key={'h' + i} x="62" y={68 + i * 24} width="76" height="12" rx="6" />)}
      {[0, 1, 2].map((i) => <rect key={'v' + i} x={70 + i * 24} y="60" width="12" height="76" rx="6" opacity=".75" />)}
    </g>
  ),
}

function Lights({ id }) {
  return (
    <>
      <filter id={id + 'bevel'} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b" />
        <feSpecularLighting in="b" surfaceScale="5" specularConstant="1" specularExponent="24" lightingColor="#ffffff" result="s"><feDistantLight azimuth="225" elevation="42" /></feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
        <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".75" k4="0" />
      </filter>
      <filter id={id + 'relief'} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b" />
        <feSpecularLighting in="b" surfaceScale="3.5" specularConstant="1.1" specularExponent="18" lightingColor="#ffffff" result="s"><feDistantLight azimuth="225" elevation="48" /></feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
        <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".9" k4="0" result="lit" />
        <feDropShadow in="lit" dx="1.5" dy="2.5" stdDeviation="1.6" floodColor="#000" floodOpacity=".45" />
      </filter>
    </>
  )
}

export function CoinFace({ token, back = false }) {
  const uid = 'b' + useId().replace(/[^a-z0-9]/gi, '')
  const [light, mid, dark, rim] = METALS[token.metal]
  const shape = SHAPES[token.shape]
  const g = (n) => `${uid}${n}`
  return (
    <svg viewBox="0 0 200 200" className="coin-svg" aria-hidden="true">
      <defs>
        <Lights id={uid} />
        <radialGradient id={g('face')} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor={light} /><stop offset=".42" stopColor={mid} /><stop offset="1" stopColor={dark} />
        </radialGradient>
        <linearGradient id={g('deep')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark} /><stop offset="1" stopColor={rim} />
        </linearGradient>
        <linearGradient id={g('raised')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} /><stop offset=".55" stopColor={mid} /><stop offset="1" stopColor={dark} />
        </linearGradient>
        <clipPath id={g('clip')}><path d={shape} /></clipPath>
      </defs>
      {/* the slab, bevelled */}
      <path d={shape} fill={`url(#${g('face')})`} filter={`url(#${g('bevel')})`} />
      {/* carved-in inner field: the same silhouette, smaller, darker, so the border reads as a raised frame */}
      <g transform="translate(100 100) scale(.8) translate(-100 -100)">
        <path d={shape} fill={`url(#${g('deep')})`} opacity=".55" />
        <path d={shape} fill="none" stroke={light} strokeOpacity=".55" strokeWidth="2.4" transform="translate(1.4 1.8)" />
      </g>
      {token.shape === 'thali' && !back && [0, 1, 2, 3, 4, 5].map((i) => {
        const [x, y] = pt(70, -Math.PI / 2 + (i * Math.PI) / 3)
        return <g key={i}><circle cx={x} cy={y} r="11" fill={`url(#${g('deep')})`} opacity=".7" /><circle cx={x + 1} cy={y + 1.5} r="11" fill="none" stroke={light} strokeOpacity=".6" strokeWidth="1.5" /></g>
      })}
      {back ? (
        <g filter={`url(#${g('relief')})`} fill={`url(#${g('raised')})`}>
          <g transform="translate(100 104) rotate(-10) scale(.36)">
            <path d="M-120 -20 H120 V0 A120 110 0 0 1 -120 0 Z" />
            <rect x="-34" y="-74" width="30" height="30" rx="6" /><rect x="10" y="-118" width="24" height="24" rx="5" /><rect x="-12" y="-158" width="18" height="18" rx="4" />
          </g>
          <text x="100" y="152" textAnchor="middle" className="coin-t coin-small">DATA DHABA</text>
        </g>
      ) : (
        <>
          <g filter={`url(#${g('relief')})`} fill={`url(#${g('raised')})`} stroke={`url(#${g('raised')})`} transform={token.shape === 'thali' ? 'translate(100 92) scale(.62) translate(-100 -100)' : 'translate(100 92) scale(.78) translate(-100 -100)'}>
            {EMBLEMS[token.emblem]}
          </g>
          {/* engraved ribbon with the number */}
          <g filter={`url(#${g('relief')})`}>
            <path d="M44 146 H156 L148 158 L156 170 H44 L52 158 Z" fill={`url(#${g('raised')})`} />
          </g>
          <text x="100" y="163" textAnchor="middle" className="coin-t coin-rib" fill={light} opacity=".7" transform="translate(.8 1)">{token.big} {token.small}</text>
          <text x="100" y="163" textAnchor="middle" className="coin-t coin-rib" fill={rim}>{token.big} {token.small}</text>
        </>
      )}
      <g clipPath={`url(#${g('clip')})`}><rect className="coin-shine" x="-60" y="-40" width="34" height="300" fill="#fff" opacity=".28" transform="rotate(25 100 100)" /></g>
    </svg>
  )
}

// The silhouette, used for each slice of the badge's thickness.
function Edge({ token, i, n, size }) {
  const [, , dark, rim] = METALS[token.metal]
  return (
    <svg viewBox="0 0 200 200" className="token-edge" style={{ transform: `translateZ(${(i - (n - 1) / 2) * (size / 120)}px)` }} aria-hidden="true">
      <path d={SHAPES[token.shape]} fill={i % 2 ? dark : rim} />
    </svg>
  )
}

// A badge with thickness: front, back and a stack of silhouette slices, so it can spin in 3D.
export default function Token({ token, size = 120, locked = false, spin = false, className = '' }) {
  const n = 9
  const half = ((n - 1) / 2) * (size / 120) + 0.5
  return (
    <span className={'token' + (locked ? ' locked' : '') + (spin ? ' spin' : '') + (className ? ' ' + className : '')} style={{ '--size': size + 'px' }} role="img" aria-label={`${token.title}, ${token.desc}${locked ? ' (locked)' : ''}`}>
      <span className="token-3d">
        {Array.from({ length: n }, (_, i) => <Edge key={i} token={token} i={i} n={n} size={size} />)}
        <span className="token-face front" style={{ transform: `translateZ(${half}px)` }}><CoinFace token={token} /></span>
        <span className="token-face back" style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}><CoinFace token={token} back /></span>
      </span>
    </span>
  )
}
