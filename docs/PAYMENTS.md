# Pro payments: how they work and how to switch them on

Pro is a one-time payment through Razorpay: **₹1,999 for 6 months** or **₹2,999 for 1 year**, no auto-renew.
Visitors outside India can be shown US-dollar prices once you set them (see "Prices in US dollars" below).

## How it fits together

| Piece | Where | What it does |
|---|---|---|
| Pro page checkout | `src/pages/Misc.jsx` (`Pro`), `src/lib/pay.js` | Shows the plans, opens Razorpay, shows the welcome message |
| Who has Pro | `supabase/payments.sql` (`has_pro`, `my_pro`) | Owner emails, or a `pro_until` date in the future |
| Payment server | `supabase/functions/pro-pay` | Holds the prices, creates the Razorpay order, checks the payment with Razorpay, turns Pro on |
| Webhook | `supabase/functions/razorpay-webhook` | Turns Pro on even if the learner closed the tab before the site confirmed |
| Pro projects | Storage bucket `pro`, folder `projects` | Private; downloadable only by accounts with Pro |
| Locks on the site | `src/lib/tier.js` | Free limits switch on for everyone when the site is built with a live key |

The browser never sends a price. Pro turns on only after the server has checked the signature and asked Razorpay that
the payment is captured, for the right order, amount and currency. Buying again adds the time to the current end date.

**Note on the locks:** handbook chapters, lab answers and other site pages are part of the site's code, so the locks on
them are a display limit. The career-ladder projects are different: they never ship with the site and the database
hands them only to Pro accounts.

## One-time setup (test mode first)

### 1. Supabase database
1. SQL Editor → New query → paste `supabase/payments.sql` → Run.
2. Run the owner SQL that adds your login email to `pro_owners` (kept outside the repo).

### 2. Razorpay test keys
1. Razorpay Dashboard → switch to **Test Mode** → Account & Settings → API Keys → Generate key.
   Copy the **Key Id** (`rzp_test_…`) and the **Key Secret** (shown once).
2. Account & Settings → Webhooks → Add new webhook:
   - URL: `https://<project-ref>.supabase.co/functions/v1/razorpay-webhook`
   - Secret: any long random string (you'll paste it in Supabase too)
   - Events: `payment.captured` and `order.paid`
3. Payment capture should be **Automatic** (the default).

### 3. Supabase Edge Functions
1. Edge Functions → Deploy a new function → Via editor. Name it `pro-pay`, paste `supabase/functions/pro-pay/index.ts`, Deploy.
2. Same again for `razorpay-webhook` with `supabase/functions/razorpay-webhook/index.ts`.
3. For **both** functions, open the function's settings and turn **off** JWT verification
   (`pro-pay` checks the sign-in itself; Razorpay signs webhook calls with the webhook secret instead).
4. Edge Functions → Secrets → add:
   - `RAZORPAY_KEY_ID` = `rzp_test_…`
   - `RAZORPAY_KEY_SECRET` = the key secret
   - `RAZORPAY_WEBHOOK_SECRET` = the webhook secret from step 2
   - `PRO_TEST_EMAILS` = your login email (only these accounts can check out while the keys are test keys)

### 4. Pro project files
Storage → bucket `pro` (the SQL created it, private) → create folder `projects` → upload every file from the
bundle (`index.json`, `p01.bin` … `p14.bin`). Rebuild it after adding a project:
`node scripts/build_pro_bundle.mjs --src <data-dhaba-pro>/projects --out <folder>` and upload the new files.
Also flip that project's `ready: true` in `src/data/pro.js`.

### 5. GitHub
Repository → Settings → Secrets and variables → Actions → **Variables** → New repository variable:
`VITE_RAZORPAY_KEY_ID` = `rzp_test_…`. Then re-run the Pages deploy (or merge any PR).

With a **test** key nothing changes for visitors. The checkout appears only at `datadhaba.in/#/pro?test=1`.

### 6. Test it
Sign in, open `datadhaba.in/#/pro?test=1`, buy a plan. In test mode use UPI `success@razorpay` or a test card from
Razorpay's test-card list. Then check: the Pro page says "Pro is on", Account shows "Pro, until …" with the payment,
and `#/pro/ladder` opens the projects. In Supabase, Table Editor → `payments` shows the row as `paid`.

## Going live (after Razorpay activates your account)
1. Razorpay → **Live Mode** → API Keys → Generate live key. Add a live webhook (same URL and events, a new secret).
2. Supabase secrets: replace `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` with the live values.
   `PRO_TEST_EMAILS` no longer matters with live keys.
3. GitHub variable `VITE_RAZORPAY_KEY_ID` = `rzp_live_…`, re-run the deploy. Pro is now on sale and the free limits apply.
4. Remove Pro given by test payments (keeps anyone who also paid for real):
   ```sql
   update profiles set plan = 'free', pro_until = null
    where user_id in (select user_id from payments where mode = 'test')
      and user_id not in (select user_id from payments where mode = 'live' and status = 'paid');
   delete from payments where mode = 'test';
   ```

## Prices in US dollars (visitors outside India)
1. Razorpay → Account & Settings → International payments → request activation.
2. Once approved, add the Supabase secrets `PRO_USD_6M` and `PRO_USD_1Y` in **cents** (for example `2900` = $29).
Nothing in dollars shows anywhere until both are set. Visitors whose timezone is not India then see dollar prices,
with a "Paying from India?" switch. Rupee prices never change from here: they are fixed in `pro-pay`.

## Refunds
Refund in Razorpay (Payments → the payment → Refund), then record it:
```sql
update payments set status = 'refunded' where payment_id = 'pay_…';
update profiles set pro_until = current_date - 1
 where user_id = (select user_id from payments where payment_id = 'pay_…');
```
