import { useId } from 'react'
import { METALS } from '../data/tokens.js'
import './token.css'

// One face of a coin, drawn in SVG: milled rim, engraved ring, the Data Dhaba bowl mark, the number and a label.
export function CoinFace({ token, back = false }) {
  const uid = useId().replace(/:/g, '')
  const [light, mid, dark, rim] = METALS[token.metal]
  const g = (n) => `${n}-${uid}`
  const long = token.big.length > 3
  return (
    <svg viewBox="0 0 200 200" className="coin-svg" aria-hidden="true">
      <defs>
        <radialGradient id={g('face')} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={light} /><stop offset=".45" stopColor={mid} /><stop offset="1" stopColor={dark} />
        </radialGradient>
        <linearGradient id={g('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} /><stop offset=".5" stopColor={dark} /><stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={g('ink')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark} /><stop offset="1" stopColor={rim} />
        </linearGradient>
        <clipPath id={g('clip')}><circle cx="100" cy="100" r="96" /></clipPath>
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${g('rim')})`} />
      <circle cx="100" cy="100" r="93" fill="none" stroke={rim} strokeOpacity=".55" strokeWidth="6" strokeDasharray="1.6 2.4" />
      <circle cx="100" cy="100" r="86" fill={`url(#${g('face')})`} stroke={rim} strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="78" fill="none" stroke={light} strokeOpacity=".7" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="76" fill="none" stroke={dark} strokeOpacity=".45" strokeWidth="1" />
      {back ? (
        <g>
          <g transform="translate(100 108) rotate(-10) scale(.42)" fill={`url(#${g('ink')})`}>
            <path d="M-120 -20 H120 V0 A120 110 0 0 1 -120 0 Z" />
            <rect x="-34" y="-74" width="30" height="30" rx="6" />
            <rect x="10" y="-118" width="24" height="24" rx="5" />
            <rect x="-12" y="-158" width="18" height="18" rx="4" />
          </g>
          <text x="100" y="150" textAnchor="middle" className="coin-t coin-small" fill={`url(#${g('ink')})`}>DATA DHABA</text>
          <text x="100" y="54" textAnchor="middle" className="coin-t coin-tiny" fill={`url(#${g('ink')})`}>SQL ARENA</text>
        </g>
      ) : (
        <g>
          <g transform="translate(100 62) rotate(-10) scale(.16)" fill={`url(#${g('ink')})`}>
            <path d="M-120 -20 H120 V0 A120 110 0 0 1 -120 0 Z" />
            <rect x="-34" y="-74" width="30" height="30" rx="6" />
            <rect x="10" y="-118" width="24" height="24" rx="5" />
          </g>
          <text x="100" y={long ? 118 : 124} textAnchor="middle" className="coin-t" style={{ fontSize: long ? 40 : token.big.length === 3 ? 50 : 60 }} fill={`url(#${g('ink')})`}>{token.big}</text>
          <text x="100" y="146" textAnchor="middle" className="coin-t coin-small" fill={`url(#${g('ink')})`}>{token.small}</text>
          {[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`translate(${76 + i * 12} 162) scale(.9)`} d="M0 -5 L1.5 -1.5 L5 -1.5 L2.2 .8 L3.2 4.5 L0 2.3 L-3.2 4.5 L-2.2 .8 L-5 -1.5 L-1.5 -1.5 Z" fill={dark} fillOpacity=".75" />)}
        </g>
      )}
      <g clipPath={`url(#${g('clip')})`}><rect className="coin-shine" x="-60" y="-40" width="40" height="300" fill="#fff" opacity=".35" transform="rotate(25 100 100)" /></g>
    </svg>
  )
}

// A coin with thickness: front, back and a stacked edge, so it can spin in 3D.
export default function Token({ token, size = 120, locked = false, spin = false, className = '' }) {
  const [, , dark, rim] = METALS[token.metal]
  const half = 4 * (size / 120) + 0.5
  return (
    <span className={'token' + (locked ? ' locked' : '') + (spin ? ' spin' : '') + (className ? ' ' + className : '')} style={{ '--size': size + 'px', '--edge': dark, '--edge2': rim }} role="img" aria-label={`${token.name}: ${token.title}${locked ? ' (locked)' : ''}`}>
      <span className="token-3d">
        {Array.from({ length: 8 }, (_, i) => <i key={i} className="token-edge" style={{ transform: `translateZ(${(i - 3.5) * (size / 120)}px)` }} />)}
        <span className="token-face front" style={{ transform: `translateZ(${half}px)` }}><CoinFace token={token} /></span>
        <span className="token-face back" style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}><CoinFace token={token} back /></span>
      </span>
    </span>
  )
}
