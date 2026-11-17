// Policy pages, shared by the app (src/pages/Misc.jsx) and the plain-HTML copies that
// scripts/build_seo.mjs writes to /terms/, /privacy/, /refund/ and /shipping/ for Razorpay's website check and search engines.
import { BRAND } from './extras.js'

export const POLICIES = {
  privacy: { path: '/privacy', eyebrow: 'Privacy', title: 'Your data, in plain words', updated: '17 November 2026', sections: [
    ['The short version', [`${BRAND.name} has no ads and no tracking cookies. To use most of the site you create an account with your email. We keep your email and your learning progress, and nothing else.`]],
    ['Your progress', ['XP, streaks, solved questions and checklists are saved in your browser and, when you are signed in, copied to your account so they follow you to a new device. Use Export on the My progress page to keep your own copy.']],
    ['The Pro waitlist', ['If you join the waitlist, we keep your name, email, the plan you picked, where you are in your career and any note you write. It is stored in a private database (or Google Form) that only the site\'s author can read.', 'We use it only to email you about Pro. We never sell it or share it. Email us and we will delete it.']],
    ['Accounts', ['When you sign in with an email link or Google, we store your email, your plan, and a random id plus a short label (such as "Chrome on Android") for the one device your account is active on. That is how one account stays on one device.', 'Accounts are run by Supabase, our database provider. You can ask us to delete your account at any time.']],
    ['Code that runs in your browser', ['The SQL engine (DuckDB) and Python (Pyodide) are downloaded from the jsDelivr CDN the first time you use them. Your queries and code run on your device and are not sent anywhere.']],
    ['Payments', ['Pro payments are handled by Razorpay. Your card, UPI or bank details go to Razorpay, never to us. We keep the order and payment IDs, the plan, the amount and the date, so we can show your receipts, keep your Pro on and handle refunds.']],
    ['Contact messages', ['If you use the contact form, we keep your name, email, topic and message in the same private database, only to reply to you. Email us and we will delete it.']],
    ['Hosting', ['The site is hosted on GitHub Pages. GitHub may keep standard server logs, such as IP addresses, to run and protect the service.']],
  ]},
  refund: { path: '/refund', eyebrow: 'Refunds', title: 'Refund and cancellation policy', updated: '17 November 2026', sections: [
    ['Who this covers', ['This policy applies to every Data Dhaba Pro purchase. Payments are processed by Razorpay. Free accounts cost nothing, so there is nothing to refund.']],
    ['7-day full refund', ['If Pro is not right for you, ask for a refund within 7 days of your purchase and you get the full amount back. No reason needed.', 'To ask, email us from the email on your account with the payment ID from your receipt, or use the contact form and pick "Pro and payments".']],
    ['After 7 days', ['After the 7-day window, payments are not refundable, including for unused months. You keep Pro until the end of the period you paid for.']],
    ['How refunds are paid', ['Approved refunds go back to the original payment method (UPI, card or net banking). We start them within 2 working days; your bank usually shows the money within 5 to 7 working days after that.']],
    ['Charged twice or payment failed?', ['If you were charged more than once, or money left your account but Pro did not unlock, email us with the payment ID. We refund duplicate or failed payments in full, at any time.']],
    ['Cancellation and renewal', ['Pro is a one-time payment for 6 months or 1 year. It does not renew automatically, so there is nothing to cancel. When it ends you keep your free account and your progress.']],
    ['Misuse', ['Accounts that share or resell Pro content, or break the terms of use, can be closed without a refund.']],
  ]},
  shipping: { path: '/shipping', eyebrow: 'Delivery', title: 'Shipping and delivery policy', updated: '17 November 2026', sections: [
    ['Digital product, nothing shipped', [`${BRAND.name} Pro is an online course subscription. There are no physical goods and nothing is shipped to any address.`]],
    ['When you get access', ['Pro turns on in your Data Dhaba account as soon as Razorpay confirms your payment, usually within seconds. You can use it right away at datadhaba.in, signed in with the same email.']],
    ['If access does not turn on', ['If Pro is not active within 24 hours of a successful payment, email us with your payment ID. We will turn it on, or refund you in full.']],
    ['Delivery charges', ['There are no delivery or handling charges. The price on the Pro page is the full amount you pay.']],
  ]},
  terms: { path: '/terms', eyebrow: 'Terms', title: 'Terms of use', updated: '17 November 2026', sections: [
    ['Using the site', [`You can use ${BRAND.name} for your own learning and share links to any page. Please don\'t copy the handbooks or questions wholesale onto other sites.`]],
    ['No guarantees', ['We work hard to keep the content correct, but it is provided as is. It is learning material, not professional advice, and it can\'t promise a job or an exam result.']],
    ['Pro', ['Pro is a one-time payment for 6 months (₹2,499) or 1 year (₹3,599) that does not renew automatically. Payments are processed securely by Razorpay; we never see or store your card or UPI details. Refunds follow our refund and cancellation policy at datadhaba.in/#/refund.']],
    ['Who runs Data Dhaba', [`${BRAND.name} is run by ${BRAND.author} as a sole proprietorship (registered with Udyam), based in Vijayapura, Karnataka, India. Contact: ${BRAND.email}.`]],
    ['Delivery', ['Pro is digital. Nothing is shipped. Access turns on in your account as soon as the payment is confirmed, usually within seconds and always within 24 hours. If it has not turned on within 24 hours, email us with your payment ID and we will turn it on or refund you in full.']],
    ['Personal use', ['Pro is for the person who bought it. Please don\'t share your account or post Pro solutions publicly.']],
    ['Names and trademarks', ['Product names such as Databricks, Azure, Spark or Kafka belong to their owners and are used only to describe what you learn. RasoiRun is a made-up company.']],
  ]},
}
