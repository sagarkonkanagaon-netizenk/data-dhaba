// The gold Pro seal: a crowned, eight-pointed seal with "PRO" across it. Original artwork, drawn in SVG.
export default function ProBadge({ size = 28, label = false, title = 'Data Dhaba Pro member' }) {
  return (
    <span className={'pro-badge' + (label ? ' with-label' : '')} title={title}>
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title}>
        <defs>
          <linearGradient id="pbG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff3c4" /><stop offset=".35" stopColor="#f2c14b" /><stop offset=".7" stopColor="#c8901c" /><stop offset="1" stopColor="#8a5a0b" />
          </linearGradient>
          <linearGradient id="pbM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1035" /><stop offset="1" stopColor="#3d0a2a" /></linearGradient>
        </defs>
        {/* eight-pointed star seal: two rotated squares */}
        <rect x="12" y="14" width="40" height="40" rx="5" fill="url(#pbG)" transform="rotate(45 32 34)" />
        <rect x="12" y="14" width="40" height="40" rx="5" fill="url(#pbG)" />
        <circle cx="32" cy="34" r="16" fill="url(#pbM)" stroke="#fde7a0" strokeWidth="1.5" />
        {/* crown */}
        <path d="M20 12 L24 4 L28 10 L32 2 L36 10 L40 4 L44 12 Z" fill="url(#pbG)" stroke="#8a5a0b" strokeWidth=".8" strokeLinejoin="round" />
        <circle cx="32" cy="3" r="1.8" fill="#ff5c8f" />
        <text x="32" y="38.5" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="11" fill="#fde7a0" letterSpacing="1">PRO</text>
      </svg>
      {label && <span className="pro-badge-txt">Pro</span>}
    </span>
  )
}
