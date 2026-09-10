#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync('public/pokerth-client.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://pokerth.local/', pretendToBeVisual: true });
const w = dom.window;
for (const key of ['window', 'document', 'localStorage', 'Event', 'KeyboardEvent', 'HTMLElement']) {
  globalThis[key] = key === 'window' ? w : w[key];
}

let passed = 0;
let failed = 0;
function check(name, condition) {
  if (condition) { console.log('ok  -', name); passed++; }
  else { console.error('FAIL -', name); failed++; }
}

console.log('test-accessibility');
const contributing = readFileSync('CONTRIBUTING.md', 'utf8');
check('contributor setup documents the one-time Chromium install command',
  contributing.includes('npx playwright install chromium'));
const entries = ['connect', 'lobby', 'game'].map((surface) =>
  w.document.getElementById('accessibility-open-' + surface));
check('Accessibility entry point is available before login and in lobby/game headers',
  entries.every(Boolean));

const panel = w.document.getElementById('accessibility-modal');
check('Accessibility panel exists', !!panel);
check('Interface size offers Standard, Large, and Extra Large',
  !!panel && [...panel.querySelectorAll('input[name="interface-size"]')]
    .map((input) => input.value).join(',') === 'standard,large,extra-large');

let moduleLoaded = false;
try {
  await import('../public/modules/ui/accessibility.mjs');
  moduleLoaded = true;
} catch (error) {
  console.error('FAIL - Accessibility behavior loads:', error.message);
  failed++;
}

if (moduleLoaded && entries[0] && panel) {
  entries[0].click();
  check('entry point opens the panel without login', panel.hidden === false);
  const standard = panel.querySelector('input[value="standard"]');
  const close = panel.querySelector('#accessibility-close');
  const reset = panel.querySelector('#accessibility-reset');
  check('opening focuses the selected interface-size control',
    w.document.activeElement === standard);
  reset.focus();
  reset.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  check('Tab stays inside the open accessibility panel',
    w.document.activeElement === close);
  close.focus();
  close.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
  check('Shift+Tab stays inside the open accessibility panel',
    w.document.activeElement === reset);
  reset.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('Escape closes and restores focus to the exact invoking button',
    panel.hidden === true && w.document.activeElement === entries[0]);
  entries[0].click();
  const large = panel.querySelector('input[value="large"]');
  large.checked = true;
  large.dispatchEvent(new w.Event('change', { bubbles: true }));
  check('Interface size applies live through stable document state',
    w.document.documentElement.getAttribute('data-interface-size') === 'large');
  check('Interface size persists in this browser',
    w.localStorage.getItem('pth_interface_size') === 'large');

  const contrast = panel.querySelector('#accessibility-high-contrast');
  contrast.checked = true;
  contrast.dispatchEvent(new w.Event('change', { bubbles: true }));
  check('High contrast applies live and independently',
    w.document.documentElement.getAttribute('data-high-contrast') === 'true'
      && w.document.documentElement.getAttribute('data-interface-size') === 'large');

  const browserZoom = panel.querySelector('#accessibility-browser-zoom');
  browserZoom.checked = true;
  browserZoom.dispatchEvent(new w.Event('change', { bubbles: true }));
  check('pinch-zoom permission keeps the existing storage key and Advanced alias',
    w.localStorage.getItem('pth_browser_zoom') === '1'
      && w.document.getElementById('adv-browserzoom').checked === true);

  panel.querySelector('#accessibility-reset').click();
  check('Reset restores the accessibility baseline without changing pinch zoom',
    w.document.documentElement.getAttribute('data-interface-size') === 'standard'
      && w.document.documentElement.getAttribute('data-high-contrast') === 'false'
      && w.localStorage.getItem('pth_browser_zoom') === '1');

  w.localStorage.setItem('pth_interface_size', 'extra-large');
  w.localStorage.setItem('pth_high_contrast', '1');
  w.applyAccessibilityPreferences();
  w.document.documentElement.removeAttribute('data-interface-size');
  w.document.documentElement.removeAttribute('data-high-contrast');
  w.applyAccessibilityPreferences();
  check('valid choices restore from browser storage',
    w.document.documentElement.getAttribute('data-interface-size') === 'extra-large'
      && w.document.documentElement.getAttribute('data-high-contrast') === 'true');

  const portable = {
    pth_interface_size: w.localStorage.getItem('pth_interface_size'),
    pth_high_contrast: w.localStorage.getItem('pth_high_contrast'),
    pth_browser_zoom: w.localStorage.getItem('pth_browser_zoom'),
  };
  w.localStorage.removeItem('pth_interface_size');
  w.localStorage.removeItem('pth_high_contrast');
  Object.entries(portable).forEach(([key, value]) => w.localStorage.setItem(key, value));
  w.applyAccessibilityPreferences();
  check('exported preferences can be imported and applied together',
    w.document.documentElement.getAttribute('data-interface-size') === 'extra-large'
      && w.document.documentElement.getAttribute('data-high-contrast') === 'true'
      && browserZoom.checked === true);

  w.localStorage.setItem('pth_interface_size', 'giant');
  w.localStorage.setItem('pth_high_contrast', '1');
  w.localStorage.setItem('pth_browser_zoom', 'broken');
  w.applyAccessibilityPreferences();
  check('malformed properties fall back independently and preserve valid siblings',
    w.document.documentElement.getAttribute('data-interface-size') === 'standard'
      && w.document.documentElement.getAttribute('data-high-contrast') === 'true'
      && browserZoom.checked === false);

  const main = readFileSync('public/pokerth.js', 'utf8');
  const syncKeys = (main.match(/var _CFG_WEB_SYNC_KEYS = \[[\s\S]*?\];/) || [''])[0];
  check('accessibility preferences participate in existing account web sync',
    ['pth_interface_size', 'pth_high_contrast', 'pth_browser_zoom']
      .every((key) => syncKeys.includes("'" + key + "'")));
  check('existing full configuration backup carries browser-local accessibility keys',
    /k\.indexOf\('pth_'\) !== 0/.test(main) && /keys\[k\] = v/.test(main));

  const savedStorage = globalThis.localStorage;
  globalThis.localStorage = {
    getItem() { throw new Error('unavailable'); },
    setItem() { throw new Error('unavailable'); },
  };
  let unavailableError = null;
  try { w.applyAccessibilityPreferences(); } catch (error) { unavailableError = error; }
  check('unavailable storage cannot block the application',
    unavailableError === null
      && w.document.documentElement.getAttribute('data-interface-size') === 'standard'
      && w.document.documentElement.getAttribute('data-high-contrast') === 'false');
  globalThis.localStorage = savedStorage;
}

console.log(failed ? `FAIL ${failed}/${passed + failed}` : `PASS ${passed}/${passed}`);
process.exit(failed ? 1 : 0);
