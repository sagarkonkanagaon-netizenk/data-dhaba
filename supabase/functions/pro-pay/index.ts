// Data Dhaba Pro checkout (Supabase Edge Function "pro-pay").
//   POST { action: "prices" }                                        -> which currencies are on sale (no sign-in needed)
//   POST { action: "order", plan: "6m" | "1y", currency: "INR" | "USD" } -> creates a Razorpay order for the fixed price
//   POST { action: "verify", order_id, payment_id, signature }       -> checks the payment and turns Pro on
// The browser never sends a price: prices live only here, in the smallest unit (paise / cents).
// India pays in rupees. Visitors abroad pay in US dollars once PRO_USD_6M and PRO_USD_1Y (in cents) are set;
// until then USD is simply not offered. USD needs International Payments switched on in Razorpay.
// Secrets (Supabase > Edge Functions > Secrets): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, optional PRO_TEST_EMAILS,
// and later PRO_USD_6M, PRO_USD_1Y.
// Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY itself.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const LABEL: Record<string, string> = { '6m': 'Data Dhaba Pro · 6 months', '1y': 'Data Dhaba Pro · 1 year' }
const cents = (v?: string) => (v && /^\d{3,6}$/.test(v) ? Number(v) : 0)
const PRICES: Record<string, Record<string, number>> = {
  INR: { '6m': 249900, '1y': 359900 },                       // ₹2,499 and ₹3,599: confirmed by Sagar, do not change here
  USD: { '6m': cents(Deno.env.get('PRO_USD_6M')), '1y': cents(Deno.env.get('PRO_USD_1Y')) },
}
// While the keys are test keys (rzp_test_...), only these emails may start a checkout, so nobody else
// can unlock Pro with Razorpay's test cards. Comma-separated; leave unset to allow anyone in test mode.
const TEST_EMAILS = (Deno.env.get('PRO_TEST_EMAILS') ?? '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean)
const onSale = (cur: string) => Boolean(PRICES[cur]?.['6m'] && PRICES[cur]?.['1y'])
const KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
const SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''
const API = Deno.env.get('RAZORPAY_API') ?? 'https://api.razorpay.com/v1'
const ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://datadhaba.in,https://www.datadhaba.in').split(',').map((s) => s.trim())
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })

function cors(req: Request) {
  const o = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg)))
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('')
}
function same(a: string, b: string) {
  if (a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

async function rzp(path: string, init: RequestInit = {}) {
  const r = await fetch(API + path, {
    ...init,
    headers: { Authorization: 'Basic ' + btoa(`${KEY_ID}:${SECRET}`), 'Content-Type': 'application/json' },
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j?.error?.description ?? `Razorpay error ${r.status}`)
  return j
}

Deno.serve(async (req) => {
  const h = cors(req)
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json' } })
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })
  if (req.method !== 'POST') return reply(405, { error: 'POST only' })
  if (!KEY_ID || !SECRET) return reply(503, { error: 'Payments are not set up yet.' })
  let body: Record<string, string>
  try { body = await req.json() } catch { return reply(400, { error: 'Bad request.' }) }
  if (body.action === 'prices') {
    return reply(200, { mode: KEY_ID.startsWith('rzp_live_') ? 'live' : 'test', prices: Object.fromEntries(Object.keys(PRICES).filter(onSale).map((c) => [c, PRICES[c]])) })
  }

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return reply(401, { error: 'Please sign in first.' })

  try {
    if (body.action === 'order') {
      if (!KEY_ID.startsWith('rzp_live_') && TEST_EMAILS.length && !TEST_EMAILS.includes((user.email ?? '').toLowerCase())) {
        return reply(403, { error: 'Payments are in test mode and not open yet.' })
      }
      const currency = body.currency ?? 'INR'
      if (!onSale(currency)) return reply(400, { error: 'That currency is not on sale.' })
      const amount = PRICES[currency][body.plan]
      if (!amount) return reply(400, { error: 'Unknown plan.' })
      // A light brake on abuse: at most 10 unpaid orders per account per hour.
      const since = new Date(Date.now() - 3600_000).toISOString()
      const { count } = await admin.from('payments').select('order_id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('status', 'created').gte('created_at', since)
      if ((count ?? 0) >= 10) return reply(429, { error: 'Too many tries. Please wait an hour or contact us.' })

      const order = await rzp('/orders', {
        method: 'POST',
        body: JSON.stringify({
          amount, currency, receipt: `dd_${Date.now()}`,
          notes: { user_id: user.id, plan: body.plan, email: user.email ?? '' },
        }),
      })
      const { error } = await admin.from('payments').insert({
        order_id: order.id, user_id: user.id, email: user.email, plan_key: body.plan, amount, currency,
        mode: KEY_ID.startsWith('rzp_live_') ? 'live' : 'test',
      })
      if (error) throw error
      return reply(200, { order_id: order.id, amount, currency, key_id: KEY_ID, description: LABEL[body.plan], email: user.email })
    }

    if (body.action === 'verify') {
      const { order_id, payment_id, signature } = body
      if (!order_id || !payment_id || !signature) return reply(400, { error: 'Missing payment details.' })
      const { data: row } = await admin.from('payments').select('*').eq('order_id', order_id).eq('user_id', user.id).maybeSingle()
      if (!row) return reply(404, { error: 'We could not find that order.' })
      if (row.status === 'paid') return reply(200, { pro: true, until: row.pro_until })
      if (!same(await hmacHex(SECRET, `${order_id}|${payment_id}`), String(signature))) return reply(400, { error: 'The payment could not be verified.' })

      // Ask Razorpay itself, so a faked callback cannot turn Pro on.
      let pay = await rzp(`/payments/${encodeURIComponent(payment_id)}`)
      if (pay.order_id !== order_id || pay.amount !== row.amount || pay.currency !== row.currency) return reply(400, { error: 'The payment does not match the order.' })
      if (pay.status === 'authorized') pay = await rzp(`/payments/${encodeURIComponent(payment_id)}/capture`, { method: 'POST', body: JSON.stringify({ amount: row.amount, currency: row.currency }) })
      if (pay.status !== 'captured') return reply(409, { error: 'The payment is not complete yet. If money left your account, Pro turns on within a few minutes.' })

      const { data: until, error } = await admin.rpc('grant_pro', { p_order_id: order_id, p_payment_id: payment_id })
      if (error) throw error
      return reply(200, { pro: true, until })
    }
    return reply(400, { error: 'Unknown action.' })
  } catch (e) {
    console.error(e)
    return reply(502, { error: 'Payment service error. Nothing was charged twice; please try again or contact us.' })
  }
})
