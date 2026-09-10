const SIZE_KEY = 'pth_interface_size';
const CONTRAST_KEY = 'pth_high_contrast';
const BROWSER_ZOOM_KEY = 'pth_browser_zoom';
const SIZES = ['standard', 'large', 'extra-large'];
let invokingElement = null;

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

function applyAccessibilityPreferences() {
  const preferences = getAccessibilityPreferences();
  let sizeChanged = false;
  try {
    const root = document.documentElement;
    const previousSize = root.getAttribute('data-interface-size');
    const game = document.getElementById('s-game');
    if (game && previousSize === 'standard' && preferences.interfaceSize !== 'standard') {
      const standardCommunityScale = window.getComputedStyle(root).getPropertyValue('--comm-scale').trim();
      if (standardCommunityScale) game.style.setProperty('--active-standard-comm-scale', standardCommunityScale);
      const pot = document.getElementById('g-potbar');
      const communityCard = document.querySelector('#g-comm .pk');
      if (pot) game.style.setProperty('--active-pot-font-base', window.getComputedStyle(pot).fontSize);
      if (communityCard) game.style.setProperty('--active-community-font-base', window.getComputedStyle(communityCard).fontSize);
    }
    root.setAttribute('data-interface-size', preferences.interfaceSize);
    root.setAttribute('data-high-contrast', preferences.highContrast ? 'true' : 'false');
    if (game && preferences.interfaceSize === 'standard') {
      game.style.removeProperty('--active-standard-comm-scale');
      game.style.removeProperty('--active-pot-font-base');
      game.style.removeProperty('--active-community-font-base');
    }
    sizeChanged = previousSize !== null && previousSize !== preferences.interfaceSize;
  } catch (_error) {}
  syncControls(preferences);
  if (sizeChanged) {
    try {
      window.requestAnimationFrame(() => {
        const portraitExtraLarge = preferences.interfaceSize === 'extra-large'
          && window.matchMedia('(max-width: 740px) and (orientation: portrait)').matches;
        if (portraitExtraLarge && typeof window.updateBottomLayout === 'function') window.updateBottomLayout();
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
  } catch (_error) {}
  applyAccessibilityPreferences();
}

window.getAccessibilityPreferences = getAccessibilityPreferences;
window.applyAccessibilityPreferences = applyAccessibilityPreferences;
window.openAccessibility = openAccessibility;
window.closeAccessibility = closeAccessibility;
window.resetAccessibilityPreferences = resetAccessibilityPreferences;

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
