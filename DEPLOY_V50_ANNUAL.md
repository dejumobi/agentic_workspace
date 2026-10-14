# MofePlay V50 — monthly and yearly subscriptions

Keep current STRIPE_SAX_PRICE_ID, STRIPE_PIANO_PRICE_ID and STRIPE_GUITAR_PRICE_ID for CAD $7/month.
Add Text variables:
STRIPE_SAX_YEARLY_PRICE_ID = price_1UO7yIGyN288jtDbYa5El8Fo
STRIPE_PIANO_YEARLY_PRICE_ID = price_1UO7zuGyN288jtDbdtXpKUuT
STRIPE_GUITAR_YEARLY_PRICE_ID = price_1UO81cGyN288jtDbETTnwfNU

Each yearly Stripe price must be active, CAD $70, recurring every one year. Save variables before deploying. Keep the existing live Stripe secret and webhook signing secret. No database migration is required.

The member chooses Monthly or Yearly on each locked instrument card. Both offer the first eligible seven-day trial without requiring a card. If there is no payment method when the trial ends, it cancels without a charge. If a member voluntarily provides a payment method, the selected plan can be charged when the trial ends, as Stripe checkout discloses. A completed previous trial cannot be repeated by switching billing plans. Yearly payments renew annually until cancelled. Existing subscriptions and trials are preserved; this release does not automatically migrate them.

A price mismatch fails safely. The code checks amount, currency, active status and recurring interval. Webhooks accept both configured yearly and monthly IDs and preserve historical prices from checkout records. Open checkout links for a different selected plan are expired before a new one is created. Existing active members use Manage billing and support for changes; this release does not add self-service plan switching inside the app.

All V49 improvements remain: owner return links, managed video refresh and introduction slots, private member support requests/replies, clean guitar footer, piano groove rehearsal, and terms/disclaimer.
