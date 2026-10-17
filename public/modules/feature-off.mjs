// Admin kill switches (/app-config.featureOff), as the modules read them.
//
// window._pthFeatureOff is a { key: true } map. pokerth-client.html fills it at
// boot from the last list the server sent (pth_feature_off), so a feature read
// once at startup (splash, back guard) is already off on the next visit; then
// pokerth.js replaces it with the fresh list when /app-config answers.
//
// Every module that reads one of these options straight from localStorage must
// ask here first: the admin switch wins over the player's stored choice, which
// is left untouched and takes effect again once the admin reopens the feature.
// scripts/test-feature-off.mjs guards that no reader skips this check.
export function featureOff(key) {
  try { return !!(typeof window !== 'undefined' && window._pthFeatureOff && window._pthFeatureOff[key]); }
  catch (e) { return false; }
}
