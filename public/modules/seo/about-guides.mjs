// About › « Poker guides » tab (web.243).
// The list of guide pages (/rules, /hand-rankings, /faq…) is written into the
// served page by proxy.js (seoAboutGuides), in the page's language, so search
// engines and AI crawlers that run no JavaScript find every guide from the
// home page. A returning player often has an interface language other than
// the page's (the bare / is served in English, the saved language applies at
// boot): when the About window shows the Guides tab, the list is fetched again
// in the player's language from /seo-guides.json. Offline, the served list stays.

const cache = new Map();

export async function refreshAboutGuides(lang) {
  const box = document.getElementById('ab-guides');
  if (!box || !lang) return;
  const want = String(lang).toLowerCase();
  if (String(box.dataset.lang || '').toLowerCase() === want) return;
  try {
    let d = cache.get(want);
    if (!d) {
      const r = await fetch('/seo-guides.json?lang=' + encodeURIComponent(lang), { cache: 'no-cache' });
      if (!r.ok) return;
      d = await r.json();
      cache.set(want, d);
    }
    const ul = box.querySelector('ul');
    if (!ul || !Array.isArray(d.links) || !d.links.length) return;
    ul.replaceChildren(...d.links.map(([href, label]) => {
      const li = document.createElement('li'), a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label;
      li.append(a);
      return li;
    }));
    box.dataset.lang = want;
  } catch (e) { /* offline or blocked: keep the list the page was served with */ }
}
