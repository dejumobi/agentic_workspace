# MofePlay V48 — CAD $7 introductory pricing and optional support

Create a NEW recurring CAD $7/month price for each existing Stripe instrument product in live mode. Stripe price amounts cannot be edited. Replace STRIPE_SAX_PRICE_ID, STRIPE_PIANO_PRICE_ID, STRIPE_GUITAR_PRICE_ID in Cloudflare with the NEW price IDs. Do not use the old CAD $20 IDs with this release: checkout intentionally rejects a mismatched amount. Keep STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET unchanged. Redeploy the contents of this ZIP to the existing project (the _worker.js file must be at deployment root).

Existing subscriptions continue at their agreed price; this update does not change their invoices. Prior price mappings are verified through stored instrument checkout records so existing paid and trial access survives the configuration change. Contact existing $20 members separately if you wish to move them to the new price.

The first trial for each instrument remains seven days without a required card. If no payment method exists when it ends, Stripe cancels the trial. The member can subscribe afterwards. Introductory price copy does not promise a lifetime rate; communicate future price changes before they take effect.

Optional support: /support.html is available from the homepage and account. Signed-in members can choose a one-time CAD $1–$500 contribution. It uses the existing Stripe integration; no separate payment link, price ID, or webhook is required. Checkout Session write plus product/price creation permissions must be available for inline price_data (the previously selected full access except sensitive operations key should cover them). Contribution payments do not grant access or create subscriptions. Thank-you messages verify payment server-side.

Deployment checks: a regular member sees $7, first eligible checkout offers a card-free trial, returning checkout charges CAD $7/month, contributions use payment mode, billing portal still works, existing subscriptions remain accessible. Test payments and cancellation paths in Stripe sandbox with matching sandbox $7 price IDs before deploying. No live charge was made during package validation.
