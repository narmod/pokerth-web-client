// Renders CHANGELOG.md (Keep a Changelog style) for the « Web client » sub-tab of the About page.
// Only the markdown the file actually uses: ## line headings, ### sections, « - » items with
// indented continuation lines, paragraphs, « > » notes, **bold**, *italic*, `code` and
// [links](https://…). Everything is HTML-escaped first; only http(s) links become anchors.
// The # title is skipped (the tab already says Changelog). Section names Added / Changed /
// Fixed reuse the translated sub-titles of the previous changelog view.

const SECTION_KEYS = {
  added:   ['abClNew', 'New'],
  changed: ['abClImprovements', 'Improvements'],
  fixed:   ['abClBugfixes', 'Bug fixes']
};

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Inline markdown → HTML. Code spans and backslash escapes are set aside first (placeholders),
// so bold or links may contain code and nothing inside a code span is formatted.
// Relative links ([docs/X.md](docs/X.md)) point at the file on GitHub.
const REPO_BLOB = 'https://github.com/narmod/pokerth-web-client/blob/main/';
export function inlineMd(text) {
  const kept = [];
  const hold = (html) => '\u0000' + (kept.push(html) - 1) + '\u0000';
  let s = String(text)
    .replace(/`([^`]+)`/g, (m, c) => hold('<code>' + esc(c) + '</code>'))
    .replace(/\\([\\`*_[\]()#+\-.!$])/g, (m, c) => hold(esc(c)));
  s = esc(s)
    .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (m, label, url) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:\/\//i.test(url)) return label;
      const href = /^https?:\/\//i.test(url) ? url : REPO_BLOB + url.replace(/^\.?\//, '');
      return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    })
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?!\s)([^*]+?)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => kept[+i]);
}

/**
 * @param {string} md  CHANGELOG.md text
 * @param {(key: string, fallback: string) => string} [tr]  translator for the section names
 * @returns {string} HTML using the .ab-cl-* classes of the About page
 */
export function renderChangelogMd(md, tr) {
  const t = typeof tr === 'function' ? tr : (k, fb) => fb;
  const out = [];
  let buf = null; // { cls, lines }
  let versions = 0;
  const flush = () => {
    if (!buf) return;
    out.push('<div class="' + buf.cls + '">' + inlineMd(buf.lines.join(' ')) + '</div>');
    buf = null;
  };
  String(md).replace(/\r\n?/g, '\n').split('\n').forEach((raw) => {
    const line = raw.replace(/\s+$/, '');
    let m;
    if (!line.trim()) { flush(); return; }
    if (/^#\s/.test(line)) { flush(); return; }
    if (/^(-{3,}|\*{3,})$/.test(line)) { flush(); out.push('<div class="ab-cl-gap"></div>'); return; }
    if ((m = /^##\s+(.*)$/.exec(line))) {
      flush();
      if (versions++ || out.length) out.push('<div class="ab-cl-gap"></div>');
      out.push('<div class="ab-cl-ver">' + inlineMd(m[1]) + '</div>');
      return;
    }
    if ((m = /^###\s+(.*)$/.exec(line))) {
      flush();
      const k = SECTION_KEYS[m[1].trim().toLowerCase()];
      out.push('<div class="ab-cl-grp">' + (k ? esc(t(k[0], k[1])) : inlineMd(m[1])) + '</div>');
      return;
    }
    if ((m = /^[-*]\s+(.*)$/.exec(line))) { flush(); buf = { cls: 'ab-cl-line ab-cl-item', lines: [m[1]] }; return; }
    if ((m = /^>\s?(.*)$/.exec(line))) {
      if (!buf || buf.cls !== 'ab-cl-line ab-cl-note') { flush(); buf = { cls: 'ab-cl-line ab-cl-note', lines: [] }; }
      buf.lines.push(m[1]);
      return;
    }
    if (buf && (/^\s/.test(line) || buf.cls === 'ab-cl-line ab-cl-p')) { buf.lines.push(line.trim()); return; }
    flush();
    buf = { cls: 'ab-cl-line ab-cl-p', lines: [line.trim()] };
  });
  flush();
  return out.join('');
}
