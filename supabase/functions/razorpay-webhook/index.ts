// Data Dhaba Pro: Razorpay webhook (Supabase Edge Function "razorpay-webhook").
// Turns Pro on even when the learner closed the tab before the site could confirm the payment.
// Razorpay > Settings > Webhooks: URL https://<project-ref>.supabase.co/functions/v1/razorpay-webhook,
// events payment.captured and order.paid, and a secret you also save here as RAZORPAY_WEBHOOK_SECRET.
// Turn OFF "Verify JWT" for this function: Razorpay signs its calls with that secret instead.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? ''
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })

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
const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return ok({ error: 'POST only' }, 405)
  if (!WEBHOOK_SECRET) return ok({ error: 'not configured' }, 503)
  const raw = await req.text()
  if (!same(await hmacHex(WEBHOOK_SECRET, raw), req.headers.get('x-razorpay-signature') ?? '')) return ok({ error: 'bad signature' }, 401)

  const evt = JSON.parse(raw)
  if (evt.event !== 'payment.captured' && evt.event !== 'order.paid') return ok({ ignored: evt.event })
  const pay = evt.payload?.payment?.entity
  if (!pay?.order_id) return ok({ ignored: 'no order' })

  const { data: row } = await admin.from('payments').select('amount, currency, status').eq('order_id', pay.order_id).maybeSingle()
  if (!row) return ok({ ignored: 'unknown order' })        // not a Data Dhaba Pro order
  if (row.status === 'paid') return ok({ done: 'already paid' })
  if (pay.amount !== row.amount || pay.currency !== row.currency || pay.status !== 'captured') return ok({ ignored: 'mismatch' })

  const { data: until, error } = await admin.rpc('grant_pro', { p_order_id: pay.order_id, p_payment_id: pay.id })
  if (error) { console.error(error); return ok({ error: 'grant failed' }, 500) }   // Razorpay retries on 5xx
  return ok({ pro: true, until })
})
