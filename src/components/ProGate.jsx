import { Link } from 'react-router-dom'
import { PAYMENTS_LIVE } from '../lib/tier.js'
import { PRO_PRICE, PRO_PROJECT_COUNT } from '../data/pro.js'
import './progate.css'

// The card a learner sees where Pro content starts. It always says what they get, never just "locked".
export default function ProGate({ what, preview }) {
  return (
    <div className="pl">
      {preview && <div className="pl-preview" aria-hidden="true">{preview}</div>}
      <div className="pl-card">
        <span className="pl-badge">Pro</span>
        <h3>{what ? `Unlock ${what}` : 'Unlock the full course'}</h3>
        <ul className="pl-list">
          <li>All 120 handbook chapters and every new handbook</li>
          <li>All 158 SQL and Python lab problems with official answers, plus every practice dataset explained</li>
          <li>{PRO_PROJECT_COUNT} portfolio projects with solutions</li>
          <li>The full 24-week path, every drill and Spark scene, all Atlas pages</li>
        </ul>
        <div className="pl-cta">
          <Link to="/pro" className="btn btn-primary">{PAYMENTS_LIVE ? `Get Pro · ${PRO_PRICE.amount} ${PRO_PRICE.note}` : 'Join the early list'}</Link>
          <span className="small muted">{PAYMENTS_LIVE ? 'One-time payment. No auto-renew.' : `Pro is opening soon, from ${PRO_PRICE.amount} ${PRO_PRICE.note}.`}</span>
        </div>
      </div>
    </div>
  )
}
