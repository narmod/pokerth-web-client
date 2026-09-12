const SIZE_KEY = 'pth_interface_size';
const CONTRAST_KEY = 'pth_high_contrast';
const BROWSER_ZOOM_KEY = 'pth_browser_zoom';
const SIZES = ['standard', 'large', 'extra-large'];
const ADAPTIVE_PLAY = 'constrained-extra-large';
const ADAPTIVE_PLAY_QUERY = '(max-width: 740px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape)';
let invokingElement = null;
let standardMetricsViewport = null;
let standardMetricsRefreshFrame = null;

function read(key) {
  try { return localStorage.getItem(key); } catch (_error) { return null; }
}

function write(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (_error) { return false; }
}

function sizePreference() {
  const raw = read(SIZE_KEY);
  if (raw === null) return 'standard';
  if (SIZES.includes(raw)) return raw;
  write(SIZE_KEY, 'standard');
  return 'standard';
}

function booleanPreference(key) {
  const raw = read(key);
  if (raw === null) return false;
  if (raw === '1') return true;
  if (raw !== '0') write(key, '0');
  return false;
}

function getAccessibilityPreferences() {
  return {
    interfaceSize: sizePreference(),
    highContrast: booleanPreference(CONTRAST_KEY),
    browserZoom: booleanPreference(BROWSER_ZOOM_KEY),
  };
}

function syncControls(preferences) {
  try {
    document.querySelectorAll('input[name="interface-size"]').forEach((input) => {
      input.checked = input.value === preferences.interfaceSize;
    });
    const contrast = document.getElementById('accessibility-high-contrast');
    if (contrast) contrast.checked = preferences.highContrast;
    const browserZoom = document.getElementById('accessibility-browser-zoom');
    if (browserZoom) browserZoom.checked = preferences.browserZoom;
    const advancedBrowserZoom = document.getElementById('adv-browserzoom');
    if (advancedBrowserZoom) advancedBrowserZoom.checked = preferences.browserZoom;
  } catch (_error) {}
}

function isAdaptivePlay() {
  try { return document.documentElement.getAttribute('data-adaptive-play') === ADAPTIVE_PLAY; } catch (_error) { return false; }
}

function notifyAdaptivePlayChange() {
  try {
    window.requestAnimationFrame(() => {
      if (typeof window.reconfigureGameDrawersForAdaptivePlay === 'function') {
        window.reconfigureGameDrawersForAdaptivePlay(isAdaptivePlay());
        return;
      }
      if (typeof window.updateBottomLayout === 'function') window.updateBottomLayout();
      if (typeof window.renderSeats === 'function') window.renderSeats();
    });
  } catch (_error) {}
}

function syncAdaptivePlayState(interfaceSize = sizePreference()) {
  let active = false;
  try { active = interfaceSize === 'extra-large' && window.matchMedia(ADAPTIVE_PLAY_QUERY).matches; } catch (_error) {}
  const changed = active !== isAdaptivePlay();
  try {
    const root = document.documentElement;
    if (active) root.setAttribute('data-adaptive-play', ADAPTIVE_PLAY);
    else root.removeAttribute('data-adaptive-play');
  } catch (_error) {}
  return changed;
}

function cacheStandardMetrics(game, root, viewport) {
  const rootStyle = window.getComputedStyle(root);
  const communityScale = parseFloat(rootStyle.getPropertyValue('--standard-comm-scale'));
  const potFontBase = parseFloat(rootStyle.getPropertyValue('--standard-pot-font-base'));
  const potFontMin = parseFloat(rootStyle.getPropertyValue('--standard-pot-font-min'));
  const communityFontBase = parseFloat(rootStyle.getPropertyValue('--standard-community-font-base'));
  if (![communityScale, potFontBase, potFontMin, communityFontBase].every(Number.isFinite)
      || communityScale <= 0 || potFontBase <= 0 || potFontMin <= 0 || communityFontBase <= 0) return false;
  const rootFontSize = parseFloat(rootStyle.fontSize) || 16;
  game.style.setProperty('--active-standard-comm-scale', String(communityScale));
  game.style.setProperty('--active-pot-font-base', `${Math.max(potFontMin, potFontBase * communityScale)}px`);
  game.style.setProperty('--active-community-font-base', `${rootFontSize * communityFontBase * communityScale}px`);
  standardMetricsViewport = viewport;
  return true;
}

function cacheRenderedStandardMetrics(game, root, viewport) {
  const communityScale = window.getComputedStyle(root).getPropertyValue('--comm-scale').trim();
  if (!communityScale) return false;
  game.style.setProperty('--active-standard-comm-scale', communityScale);
  const pot = document.getElementById('g-potbar');
  const communityCard = document.querySelector('#g-comm .pk');
  if (pot) game.style.setProperty('--active-pot-font-base', window.getComputedStyle(pot).fontSize);
  if (communityCard) game.style.setProperty('--active-community-font-base', window.getComputedStyle(communityCard).fontSize);
  standardMetricsViewport = viewport;
  return true;
}

function refreshStandardMetricsForViewport() {
  const root = document.documentElement;
  const game = document.getElementById('s-game');
  if (!game || sizePreference() === 'standard') return false;
  const viewport = `${window.innerWidth}x${window.innerHeight}`;
  if (viewport === standardMetricsViewport) return false;
  if (!cacheStandardMetrics(game, root, viewport)) return false;
  try { if (typeof window.renderSeats === 'function') window.renderSeats(); } catch (_error) {}
  return true;
}

function scheduleStandardMetricsRefresh() {
  try {
    if (standardMetricsRefreshFrame !== null) window.cancelAnimationFrame(standardMetricsRefreshFrame);
    standardMetricsRefreshFrame = window.requestAnimationFrame(() => {
      standardMetricsRefreshFrame = null;
      refreshStandardMetricsForViewport();
    });
  } catch (_error) {}
}

function applyAccessibilityPreferences() {
  const preferences = getAccessibilityPreferences();
  let sizeChanged = false;
  let adaptiveChanged = false;
  try {
    const root = document.documentElement;
    const previousSize = root.getAttribute('data-interface-size');
    const game = document.getElementById('s-game');
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    // A live Standard layout is the exact baseline when first enlarging. Cold
    // starts and viewport changes use the media-owned source instead: it never
    // inherits the active layout or loupe transform.
    if (game && preferences.interfaceSize !== 'standard' && standardMetricsViewport !== viewport) {
      if (previousSize === 'standard') cacheRenderedStandardMetrics(game, root, viewport);
      else cacheStandardMetrics(game, root, viewport);
    }
    root.setAttribute('data-interface-size', preferences.interfaceSize);
    root.setAttribute('data-high-contrast', preferences.highContrast ? 'true' : 'false');
    adaptiveChanged = syncAdaptivePlayState(preferences.interfaceSize);
    sizeChanged = previousSize !== null && previousSize !== preferences.interfaceSize;
  } catch (_error) {}
  syncControls(preferences);
  if (adaptiveChanged) notifyAdaptivePlayChange();
  else if (sizeChanged) {
    try {
      window.requestAnimationFrame(() => {
        if (typeof window.renderSeats === 'function') window.renderSeats();
      });
    } catch (_error) {}
  }
  try {
    if (typeof window._applyBrowserZoomOpt === 'function') window._applyBrowserZoomOpt();
  } catch (_error) {}
  return preferences;
}

function markChanged(key) {
  try {
    if (typeof window._cfgSyncMark === 'function') window._cfgSyncMark(key);
  } catch (_error) {}
}

function setInterfaceSize(value) {
  write(SIZE_KEY, SIZES.includes(value) ? value : 'standard');
  applyAccessibilityPreferences();
  markChanged('interface_size');
}

function setHighContrast(value) {
  write(CONTRAST_KEY, value ? '1' : '0');
  applyAccessibilityPreferences();
  markChanged('high_contrast');
}

function setBrowserZoom(value) {
  if (typeof window.setAdvOpt === 'function') {
    window.setAdvOpt('browser_zoom', !!value);
  } else {
    write(BROWSER_ZOOM_KEY, value ? '1' : '0');
    applyAccessibilityPreferences();
    markChanged('browser_zoom');
  }
}

function resetAccessibilityPreferences() {
  write(SIZE_KEY, 'standard');
  write(CONTRAST_KEY, '0');
  applyAccessibilityPreferences();
  markChanged('interface_size');
  markChanged('high_contrast');
}

function panelFocusables(panel) {
  return [...panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden);
}

function openAccessibility(invoker) {
  const panel = document.getElementById('accessibility-modal');
  if (!panel) return;
  if (invoker && typeof invoker.focus === 'function') invokingElement = invoker;
  applyAccessibilityPreferences();
  panel.hidden = false;
  panel.setAttribute('aria-hidden', 'false');
  const first = panel.querySelector('input[name="interface-size"]:checked') || panel.querySelector('input, button');
  try { if (first) first.focus(); } catch (_error) {}
}

function closeAccessibility() {
  const panel = document.getElementById('accessibility-modal');
  if (!panel) return;
  panel.hidden = true;
  panel.setAttribute('aria-hidden', 'true');
  const target = invokingElement;
  invokingElement = null;
  if (isAdaptivePlay() && typeof window.reconfigureGameDrawersForAdaptivePlay === 'function') {
    // An open drawer already owns focus management in this adaptive layout
    // (see reconfigureGameDrawersForAdaptivePlay). Clicking Close natively
    // moves focus onto the Close button first; re-run the drawer
    // reconfiguration so it reclaims focus instead of handing it to this
    // modal's own invoker.
    window.reconfigureGameDrawersForAdaptivePlay(true);
    return;
  }
  try { if (target && target.isConnected) target.focus(); } catch (_error) {}
}

function bind() {
  try {
    document.querySelectorAll('.accessibility-entry').forEach((button) => {
      button.addEventListener('click', () => openAccessibility(button));
    });
    document.querySelectorAll('input[name="interface-size"]').forEach((input) => {
      input.addEventListener('change', () => { if (input.checked) setInterfaceSize(input.value); });
    });
    const contrast = document.getElementById('accessibility-high-contrast');
    if (contrast) contrast.addEventListener('change', () => setHighContrast(contrast.checked));
    const browserZoom = document.getElementById('accessibility-browser-zoom');
    if (browserZoom) browserZoom.addEventListener('change', () => setBrowserZoom(browserZoom.checked));
    const reset = document.getElementById('accessibility-reset');
    if (reset) reset.addEventListener('click', resetAccessibilityPreferences);
    const close = document.getElementById('accessibility-close');
    if (close) close.addEventListener('click', closeAccessibility);
    const backdrop = document.querySelector('#accessibility-modal .accessibility-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeAccessibility);
    document.addEventListener('keydown', (event) => {
      const panel = document.getElementById('accessibility-modal');
      if (event.key === 'Escape' && panel && !panel.hidden) {
        event.preventDefault();
        closeAccessibility();
      } else if (event.key === 'Tab' && panel && !panel.hidden) {
        const focusables = panelFocusables(panel);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.matchMedia(ADAPTIVE_PLAY_QUERY).addEventListener('change', () => {
      if (!syncAdaptivePlayState()) return;
      notifyAdaptivePlayChange();
    });
    window.addEventListener('resize', scheduleStandardMetricsRefresh, { passive: true });
  } catch (_error) {}
  applyAccessibilityPreferences();
}

window.getAccessibilityPreferences = getAccessibilityPreferences;
window.applyAccessibilityPreferences = applyAccessibilityPreferences;
window.openAccessibility = openAccessibility;
window.closeAccessibility = closeAccessibility;
window.resetAccessibilityPreferences = resetAccessibilityPreferences;
window.isAdaptivePlay = isAdaptivePlay;
window.isAdaptivePortraitPlay = isAdaptivePlay;

try {
  window.addEventListener('storage', (event) => {
    if ([SIZE_KEY, CONTRAST_KEY, BROWSER_ZOOM_KEY].includes(event.key)) applyAccessibilityPreferences();
  });
} catch (_error) {}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
else bind();

export {
  applyAccessibilityPreferences,
  closeAccessibility,
  getAccessibilityPreferences,
  openAccessibility,
  resetAccessibilityPreferences,
  setBrowserZoom,
  setHighContrast,
  setInterfaceSize,
};
