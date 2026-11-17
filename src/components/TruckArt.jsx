// Truck-art banners for flashcards: every card gets its own Data Dhaba scene, generated from
// its number. Highway, sky, a painted lorry and something from the dhaba. Our own art, no logos.

const PALETTES = [
  // sky top, sky bottom, hills, road, accent 1, accent 2, accent 3
  ['#ff9a3c', '#ffd27a', '#8a3b2b', '#3a2b2b', '#e8366f', '#14b8a6', '#ffd23f'], // dhaba dusk
  ['#1b1446', '#5b2a86', '#140f33', '#211a3a', '#ff5c8f', '#2ee6d6', '#ffc94a'], // highway night
  ['#7fd6ff', '#fff1c1', '#3c7a4a', '#4a4a4a', '#ff3d6e', '#1e88e5', '#ffb300'], // morning run
  ['#ff6f61', '#ffc1a1', '#6b2d5c', '#3b2433', '#2ec4b6', '#ffe066', '#7b2ff7'], // pink sunset
  ['#0f3b46', '#2a9d8f', '#0b2a31', '#1d2b2f', '#f4a261', '#e9c46a', '#e76f51'], // monsoon
  ['#f9d976', '#f39f86', '#9c4f2e', '#4a3326', '#2b59c3', '#d7263d', '#1b998b'], // desert NH
  ['#24243e', '#0f0c29', '#302b63', '#18162b', '#00f5d4', '#f15bb5', '#fee440'], // neon dhaba
  ['#b8e1dd', '#f6f5ae', '#4f772d', '#3d3d3d', '#d00000', '#3a86ff', '#ff9f1c'], // Punjab fields
]
const TRUCK = ['#e63946', '#ffb703', '#2a9d8f', '#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#06d6a0', '#118ab2', '#ef476f', '#f4a261', '#9b5de5']
const SLOGANS = [
  'QUERY OK PLEASE', 'USE INDEX AT NIGHT', 'BURI NAZAR WALE TERA NULL HO', 'JOIN SLOW · DRIVE SAFE', 'DATA KI GAADI',
  'NO SHUFFLE NO TENSION', 'PARTITION KARO PYAAR SE', 'CHAI · SQL · REPEAT', 'MAA KA ASHIRWAD · ZERO NULLS', 'SKEW SE BACHO',
  'DEKHO MAGAR SELECT * NAHI', 'HORN OK · SCHEMA OK', 'DELTA SE DILLI', 'KAFKA EXPRESS', 'DIPPER DO · DEDUP KARO',
  'LATE DATA? WATERMARK LAGAO', 'JAI HO · JOB SUCCEEDED', 'BROADCAST KARO BHAI', 'MERGE KARO · MAST RAHO', 'SPARK RANI',
  'PIPELINE MAHARAJA', 'AIRFLOW ON TIME', 'DAG DAG DAGGA', 'GOLD LAYER SPECIAL', 'BRONZE SE GOLD TAK',
]
const PROPS = ['chai', 'charpai', 'lantern', 'board', 'kettle', 'tandoor']
const PATTERNS = ['diamonds', 'flowers', 'stripes', 'dots', 'zigzag', 'eyes']

// Different strides for each feature, so neighbouring numbers never look alike.
function pick(n, arr, stride, off = 0) { return arr[((n * stride) + off) % arr.length] }

function Pattern({ kind, x, y, w, h, c1, c2 }) {
  const out = []
  if (kind === 'stripes') for (let i = 0; i < w; i += 14) out.push(<rect key={i} x={x + i} y={y} width="7" height={h} fill={i % 28 ? c1 : c2} opacity=".85" />)
  if (kind === 'dots') for (let i = 8; i < w; i += 16) for (let j = 8; j < h; j += 14) out.push(<circle key={i + '-' + j} cx={x + i} cy={y + j} r="3.2" fill={(i + j) % 3 ? c1 : c2} />)
  if (kind === 'diamonds') for (let i = 0; i < w; i += 22) out.push(<path key={i} d={`M${x + i + 11} ${y + 3}l9 ${h / 2 - 3}-9 ${h / 2 - 3}-9 -${h / 2 - 3}z`} fill={i % 44 ? c1 : c2} />)
  if (kind === 'zigzag') out.push(<path key="z" d={Array.from({ length: Math.floor(w / 12) + 1 }, (_, i) => `${i ? 'L' : 'M'}${x + i * 12} ${y + (i % 2 ? h - 4 : 4)}`).join(' ')} fill="none" stroke={c1} strokeWidth="4" />, <path key="z2" d={Array.from({ length: Math.floor(w / 12) + 1 }, (_, i) => `${i ? 'L' : 'M'}${x + i * 12} ${y + (i % 2 ? 4 : h - 4)}`).join(' ')} fill="none" stroke={c2} strokeWidth="2" />)
  if (kind === 'flowers') for (let i = 12; i < w; i += 26) out.push(<g key={i} transform={`translate(${x + i} ${y + h / 2})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} rx="3.4" ry="7" transform={`rotate(${a}) translate(0 -6)`} fill={c1} />)}<circle r="3" fill={c2} /></g>)
  if (kind === 'eyes') for (let i = 14; i < w; i += 30) out.push(<g key={i} transform={`translate(${x + i} ${y + h / 2})`}><path d="M-11 0q11-10 22 0q-11 10-22 0z" fill="#fff" /><circle r="4" fill={c1} /><circle r="1.8" fill="#111" /></g>)
  return <g>{out}</g>
}

function Prop({ kind, x, c1, c2, c3 }) {
  const y = 150
  switch (kind) {
    case 'chai': return <g transform={`translate(${x} ${y})`}><rect x="-26" y="-6" width="52" height="40" rx="3" fill="#6b3e26" /><rect x="-30" y="-12" width="60" height="8" rx="2" fill="#8b5a3c" />{[-16, 0, 16].map((d) => <g key={d} transform={`translate(${d} -26)`}><path d="M-5 0h10l-2 14h-6z" fill="#fff8" stroke="#fff" strokeWidth="1" /><rect x="-4" y="5" width="8" height="8" fill="#c8813b" /><path d="M-2 -4q3 -6 0 -10M2 -4q3 -6 0 -10" stroke="#fff9" fill="none" strokeWidth="1.2" /></g>)}</g>
    case 'charpai': return <g transform={`translate(${x} ${y + 12})`}><rect x="-36" y="0" width="72" height="8" fill="#8b5a3c" /><path d="M-36 0l72 8M-36 8l72-8M-24 0l48 8M-24 8l48-8" stroke="#e9c46a" strokeWidth="1.4" /><rect x="-34" y="6" width="4" height="18" fill="#6b3e26" /><rect x="30" y="6" width="4" height="18" fill="#6b3e26" /></g>
    case 'lantern': return <g transform={`translate(${x} 40)`}><path d={`M-60 0q60 34 120 0`} stroke="#0006" fill="none" />{[-44, -18, 8, 34].map((d, i) => <g key={d} transform={`translate(${d} ${10 + Math.abs(d) * -0.06 + 16})`}><line y1="-12" y2="0" stroke="#0006" /><ellipse rx="6" ry="9" fill={[c1, c2, c3, c1][i]} /><ellipse rx="10" ry="12" fill={[c1, c2, c3, c1][i]} opacity=".25" /></g>)}</g>
    case 'board': return <g transform={`translate(${x} ${y - 30})`}><rect x="-2" y="20" width="4" height="40" fill="#5a3a22" /><rect x="-34" y="-4" width="68" height="28" rx="3" fill={c1} stroke="#fff" strokeWidth="2" /><text x="0" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">DHABA</text></g>
    case 'kettle': return <g transform={`translate(${x} ${y + 4})`}><path d="M-18 20h36l-4-26h-28z" fill="#c0c0c8" /><path d="M14 0q14 -2 18 -12" stroke="#c0c0c8" strokeWidth="5" fill="none" /><path d="M-12 -6q12 -14 24 0" stroke="#9a9aa4" strokeWidth="3" fill="none" /><path d="M-24 22h48" stroke="#ff7b00" strokeWidth="5" /><path d="M-4 -12q4 -8 0 -16M4 -12q4 -8 0 -16" stroke="#fff9" fill="none" /></g>
    default: return <g transform={`translate(${x} ${y})`}><path d="M-22 30q-4-34 22-40q26 6 22 40z" fill="#b5651d" /><ellipse cx="0" cy="-8" rx="10" ry="4" fill="#3b1f0e" /><path d="M-4 -12q4-10 0-18" stroke="#ff9f1c" strokeWidth="2.5" fill="none" /></g>
  }
}

function Lorry({ color, c1, c2, c3, pattern, slogan, flip, body, crown, big }) {
  // Side view, cab on the left. 230 wide, sits on the road at y=190.
  return (
    <g transform={flip ? 'translate(600 0) scale(-1 1)' : undefined}>
      <g transform={big ? 'translate(214 70) scale(1.18)' : 'translate(250 92)'}>
        {body === 'tanker' ? (
          <g>
            <rect x="74" y="8" width="156" height="66" rx="33" fill={color} />
            <rect x="74" y="8" width="156" height="66" rx="33" fill="url(#tank-sheen)" opacity=".35" />
            <Pattern kind={pattern} x={92} y={14} w={120} h={14} c1={c1} c2={c3} />
            <rect x="96" y="32" width="112" height="22" rx="4" fill="#fffbe9" />
            <g transform={flip ? 'translate(304 0) scale(-1 1)' : undefined}>
              <text x="152" y="47" textAnchor="middle" fontSize={slogan.length > 20 ? 8 : 10.5} fontWeight="900" fill={c2} fontFamily="system-ui, sans-serif">{slogan}</text>
            </g>
            <rect x="140" y="0" width="22" height="10" rx="2" fill="#ddd" />
            <rect x="70" y="70" width="160" height="8" fill="#333" />
          </g>
        ) : body === 'flatbed' ? (
          <g>
            <rect x="70" y="52" width="160" height="26" fill={color} />
            <Pattern kind={pattern} x={74} y={56} w={152} h={18} c1={c1} c2={c3} />
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={'s' + i} x={78 + i * 24} y={30} width="22" height="22" rx="8" fill={['#e9d8a6', '#d4a373', '#ccd5ae'][i % 3]} stroke="#0002" />)}
            {[0, 1, 2, 3, 4].map((i) => <rect key={'t' + i} x={90 + i * 26} y={10} width="22" height="20" rx="8" fill={['#d4a373', '#e9d8a6', '#faedcd'][i % 3]} stroke="#0002" />)}
            {[0, 1, 2].map((i) => <g key={'m' + i}><rect x={196 + (i % 2) * 14} y={i === 2 ? -6 : 14} width="12" height="18" rx="3" fill="#c0c0c8" /><rect x={198 + (i % 2) * 14} y={i === 2 ? -9 : 11} width="8" height="4" fill="#9a9aa4" /></g>)}
            <rect x="74" y="-2" width="150" height="10" rx="3" fill="#fffbe9" />
            <g transform={flip ? 'translate(298 0) scale(-1 1)' : undefined}>
              <text x="149" y="6" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={c2} fontFamily="system-ui, sans-serif">{slogan}</text>
            </g>
          </g>
        ) : (
          <g>
            <rect x="70" y="0" width="160" height="78" rx="4" fill={color} />
            <rect x="74" y="6" width="152" height="18" fill="#fff2" />
            <Pattern kind={pattern} x={74} y={6} w={152} h={18} c1={c1} c2={c3} />
            <rect x="74" y="28" width="152" height="30" rx="3" fill="#fffbe9" />
            <g transform={flip ? 'translate(300 0) scale(-1 1)' : undefined}>
              <text x="150" y="48" textAnchor="middle" fontSize={slogan.length > 20 ? 9.5 : 12} fontWeight="900" fill={c2} fontFamily="system-ui, sans-serif" letterSpacing=".5">{slogan}</text>
            </g>
            <Pattern kind="dots" x={74} y={60} w={152} h={14} c1={c2} c2={c1} />
          </g>
        )}
        {/* cab with the painted crown */}
        <path d="M70 78V18q0-10-10-10H22Q8 8 4 30L0 56v22z" fill={color} />
        {crown === 0 && <path d="M4 10q30-24 64 0" fill={c1} stroke="#fff" strokeWidth="2" />}
        {crown === 1 && <path d="M4 10l8-14 8 10 8-14 8 14 8-14 8 10 8-14 8 22z" fill={c1} stroke="#fff" strokeWidth="1.5" />}
        {crown === 2 && <g><rect x="4" y="-4" width="64" height="12" rx="6" fill={c1} stroke="#fff" strokeWidth="1.5" /><path d="M12 -4v-8M36 -4v-12M60 -4v-8" stroke={c3} strokeWidth="3" strokeLinecap="round" /></g>}
        {[10, 22, 34, 46, 58].map((d) => <circle key={d} cx={d} cy={6 - Math.sin((d - 4) / 64 * Math.PI) * 9} r="2.4" fill={c3} />)}
        <path d="M14 18h40v26H6z" fill="#bfe9ff" opacity=".9" />
        <path d="M18 22h10L14 40H10z" fill="#fff8" />
        <rect x="0" y="62" width="70" height="8" fill="#ddd" />
        <circle cx="4" cy="58" r="4" fill="#ffe680" />
        {/* tassels and mudflap */}
        {[76, 92, 108, 124, 140, 156, 172, 188, 204, 220].map((d, i) => <path key={d} d={`M${d} 78l3 9l3-9`} fill={[c1, c3, c2][i % 3]} />)}
        <rect x="208" y="78" width="16" height="22" rx="2" fill="#111" /><circle cx="216" cy="88" r="4" fill={c3} />
        {/* wheels */}
        {[30, 150, 190].map((d) => <g key={d}><circle cx={d} cy="86" r="16" fill="#1a1a1a" /><circle cx={d} cy="86" r="7" fill="#c9c9c9" /><circle cx={d} cy="86" r="2.5" fill={c1} /></g>)}
      </g>
    </g>
  )
}

export function artOf(n) {
  const pal = pick(n, PALETTES, 5, 1)
  return {
    pal,
    truck: pick(n, TRUCK, 7, 3),
    pattern: pick(n, PATTERNS, 1),
    slogan: pick(n, SLOGANS, 11, 2),
    prop: pick(n, PROPS, 13, 4),
    flip: n % 2 === 1,
    body: pick(n, ['box', 'tanker', 'flatbed'], 1, Math.floor(n / 6)),
    crown: (n * 5 + 1) % 3,
    big: n % 4 === 3,
    night: pal === PALETTES[1] || pal === PALETTES[6],
  }
}

export default function TruckArt({ n, className = '', title }) {
  const a = artOf(n)
  const [sky1, sky2, hills, road, c1, c2, c3] = a.pal
  const id = 'ta' + n
  const propX = a.flip ? 515 : 85
  return (
    <svg viewBox="0 0 600 220" className={'truck-art ' + className} role="img" aria-label={title || `Data Dhaba truck art number ${n}: ${a.slogan.toLowerCase()}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="tank-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></linearGradient>
        <linearGradient id={id + 's'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky1} /><stop offset="1" stopColor={sky2} /></linearGradient>
      </defs>
      <rect width="600" height="220" fill={`url(#${id}s)`} />
      {a.night
        ? <g>{Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 97 + n * 31) % 600} cy={(i * 53 + n * 17) % 110} r={i % 4 ? 1 : 1.8} fill="#fff" opacity=".8" />)}<circle cx={a.flip ? 64 : 536} cy="56" r="18" fill="#fff6d5" /><circle cx={a.flip ? 72 : 544} cy="50" r="16" fill={sky1} /></g>
        : <g><circle cx={a.flip ? 60 : 540} cy="56" r="26" fill={c3} opacity=".9" /><circle cx={a.flip ? 60 : 540} cy="56" r="40" fill={c3} opacity=".18" /></g>}
      <path d={`M0 150 L0 ${118 + (n % 5) * 4} Q 90 ${84 + (n % 7) * 3} 180 ${122 - (n % 3) * 5} T 360 ${116 + (n % 4) * 4} T 600 ${104 + (n % 6) * 3} L600 150z`} fill={hills} opacity=".75" />
      <path d={`M0 150 L0 132 Q 140 112 300 138 T 600 128 L600 150z`} fill={hills} />
      <rect y="150" width="600" height="70" fill={road} />
      <rect y="150" width="600" height="5" fill="#0003" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 54 + (n % 3) * 9} y="196" width="30" height="4" rx="2" fill="#fff" opacity=".7" />)}
      <Prop kind={a.prop} x={propX} c1={c1} c2={c2} c3={c3} />
      <Lorry color={a.truck} c1={c1} c2={c2} c3={c3} pattern={a.pattern} slogan={a.slogan} flip={a.flip} body={a.body} crown={a.crown} big={a.big} />
      <rect width="600" height="10" fill={c1} />
      <Pattern kind="zigzag" x={0} y={0} w={600} h={10} c1={c3} c2={c2} />
      <rect y="210" width="600" height="10" fill={c1} />
      <Pattern kind="dots" x={0} y={208} w={600} h={14} c1={c3} c2={c2} />
      <g transform={`translate(${a.flip ? 530 : 14} 20)`}><rect width="56" height="20" rx="10" fill="#0008" /><text x="28" y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="ui-monospace, monospace">No.{String(n).padStart(3, '0')}</text></g>
    </svg>
  )
}
