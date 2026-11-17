// Pro checkout with Razorpay. The price is never decided here: the payment server (supabase/functions/pro-pay)
// holds the prices, creates the order, and turns Pro on only after checking the payment with Razorpay.
import { client } from './auth.js'
import { setTier } from './tier.js'

// India pays in rupees; visitors abroad see US dollars once the server has USD prices.
export function inIndia() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return true
    if (tz) return false
  } catch (e) { /* ignore */ }
  return /-IN$/i.test(navigator.language || '')
}

export function money(amount, currency) {
  const v = amount / 100
  return currency === 'INR'
    ? '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '$' + v.toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

async function call(body) {
  const sb = await client()
  if (!sb) throw new Error('Accounts are not set up on this site.')
  const { data, error } = await sb.functions.invoke('pro-pay', { body })
  if (error) {
    let msg = error.message
    try { const j = await error.context.json(); if (j?.error) msg = j.error } catch (e) { /* ignore */ }
    throw new Error(msg)
  }
  return data
}

let pricesP = null
export function loadPrices() {
  if (!pricesP) pricesP = call({ action: 'prices' }).catch((e) => { pricesP = null; throw e })
  return pricesP
}

export async function refreshTier() {
  const sb = await client()
  if (!sb) return null
  const { data: { session } } = await sb.auth.getSession()
  if (!session) { setTier(null); return null }
  const { data, error } = await sb.rpc('my_pro')
  if (error) throw error
  setTier(data)
  return data
}

let scriptP = null
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve()
  if (!scriptP) {
    scriptP = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = resolve
      s.onerror = () => { scriptP = null; reject(new Error('Could not load the Razorpay checkout. Check your connection and try again.')) }
      document.head.appendChild(s)
    })
  }
  return scriptP
}

// Opens Razorpay for a plan. Resolves with { until } once Pro is on, or null if the learner closed the window.
export async function buyPro(plan, currency) {
  const [order] = await Promise.all([call({ action: 'order', plan, currency }), loadCheckout()])
  const paid = await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Data Dhaba',
      description: order.description,
      image: new URL(`${import.meta.env.BASE_URL}img/dd-icon-256.png`, window.location.href).href,
      prefill: { email: order.email || '' },
      notes: { plan },
      theme: { color: '#e8366f' },
      modal: { ondismiss: () => resolve(null), confirm_close: true },
      handler: (r) => resolve(r),
    })
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'The payment failed. No money was taken; please try again.')))
    rzp.open()
  })
  if (!paid) return null
  const res = await call({ action: 'verify', order_id: paid.razorpay_order_id, payment_id: paid.razorpay_payment_id, signature: paid.razorpay_signature })
  // Turning Pro on redraws the page, so leave a note for the Pro page to show the welcome message.
  try { sessionStorage.setItem('dd:paid', JSON.stringify({ ...res, at: Date.now() })) } catch (e) { /* ignore */ }
  await refreshTier().catch(() => {})
  return res
}

// The welcome note left by buyPro. It is shown for a minute after paying, then forgotten.
export function takePaidNote() {
  try {
    const v = JSON.parse(sessionStorage.getItem('dd:paid') || 'null')
    if (v && Date.now() - v.at < 60000) return v
    sessionStorage.removeItem('dd:paid')
  } catch (e) { /* ignore */ }
  return null
}

export async function myPayments() {
  const sb = await client()
  if (!sb) return []
  const { data } = await sb.from('payments').select('order_id, plan_key, amount, currency, status, payment_id, paid_at, pro_until, mode').eq('status', 'paid').order('paid_at', { ascending: false })
  return data || []
}
