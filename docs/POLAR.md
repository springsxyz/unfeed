# Polar setup — UnFeed Pro

One-time **$9** Pro unlock via [Polar](https://polar.sh) (Merchant of Record).

## Dashboard steps (you)

1. Sign up / create org at https://polar.sh
2. **Products → New product**
   - Name: `UnFeed Pro`
   - Price: **$9 USD**, one-time
3. Add benefit: **License keys**
   - No activation limit (or set a soft limit if you want later)
4. Publish product → copy **Checkout link**
5. **Settings → General** → copy **Organization ID** (UUID)
6. Optional: copy the license **Benefit ID** to scope validation

Paste into [`shared/config.js`](../shared/config.js):

```js
const UNFEED_CHECKOUT_URL = "https://buy.polar.sh/..."; // your checkout
const UNFEED_POLAR_ORG_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const UNFEED_POLAR_BENEFIT_ID = ""; // optional but recommended
```

Reload the extension. Buy Pro opens checkout; after email delivery, paste the key → Unlock.

## How validation works

The popup calls Polar’s **public** Customer Portal API (no secret in the extension):

`POST https://api.polar.sh/v1/customer-portal/license-keys/validate`

Body: `{ key, organization_id, benefit_id? }`  
Success when `status === "granted"`.

Dev stub key `UNFEED-PRO` still unlocks locally for QA.

## Sandbox

Use Polar sandbox org + sandbox checkout URL while testing cards. Swap to production values before Chrome Web Store ship.
