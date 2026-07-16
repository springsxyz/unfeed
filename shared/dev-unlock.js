/**
 * Dev unlock codes (local QA only). Production packs use the empty stub.
 * Copy dev-unlock.personal.stub.js → dev-unlock.personal.js and add your key.
 */
const UNFEED_DEV_UNLOCK_CODES = [];
if (typeof UNFEED_DEV_LOCAL_CODES !== "undefined") {
  UNFEED_DEV_UNLOCK_CODES.push(...UNFEED_DEV_LOCAL_CODES);
}
