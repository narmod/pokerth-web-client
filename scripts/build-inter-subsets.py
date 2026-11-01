#!/usr/bin/env python3
"""Split public/fonts/InterVariable.woff2 (the official QML client's Inter,
opsz 14-32 + wght 100-900) into unicode-range subsets, like Google Fonts:
the browser only downloads the parts a page needs (Latin alone ≈ 106 kB
instead of 342 kB). Glyphs, advances, axes and layout features are kept;
only kerning / contextual rules ACROSS two subsets are lost (sub-pixel, seen
in Polish, Turkish, Vietnamese — accepted by narmod, 2026-11-01).

Writes public/fonts/inter-qml-<subset>.woff2 and prints the @font-face block
for public/pokerth.css. Needs fonttools + brotli:
    pip install fonttools brotli
    python3 scripts/build-inter-subsets.py
"""
import os, subprocess, sys
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'fonts', 'InterVariable.woff2')
OUT = os.path.join(ROOT, 'public', 'fonts')

# Google Fonts ranges. 'symbols' and 'pua' take what is left of the cmap.
RANGES = {
    'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
    'cyrillic-ext': 'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
    'cyrillic': 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
    'greek-ext': 'U+1F00-1FFF',
    'greek': 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF',
    'vietnamese': 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
}
# Declaration order in the CSS: the LAST face wins for a shared character.
CSS_ORDER = ['pua', 'symbols', 'cyrillic-ext', 'cyrillic', 'greek-ext', 'greek', 'vietnamese', 'latin-ext', 'latin']


def expand(r):
    s = set()
    for part in r.split(','):
        a = part.strip()[2:].split('-')
        s.update(range(int(a[0], 16), int(a[-1], 16) + 1))
    return s


def compact(cs):
    cs = sorted(cs); out = []; i = 0
    while i < len(cs):
        j = i
        while j + 1 < len(cs) and cs[j + 1] == cs[j] + 1:
            j += 1
        out.append('U+%04X' % cs[i] if i == j else 'U+%04X-%04X' % (cs[i], cs[j]))
        i = j + 1
    return ','.join(out)


def main():
    cmap = set(TTFont(SRC).getBestCmap())
    ranges = dict(RANGES)
    covered = set()
    for r in RANGES.values():
        covered |= expand(r) & cmap
    rest = cmap - covered
    pua = {c for c in rest if 0xE000 <= c <= 0xF8FF or c > 0xFFFF}
    ranges['symbols'] = compact(rest - pua)
    ranges['pua'] = compact(pua)
    css = []
    for k in CSS_ORDER:
        out = os.path.join(OUT, 'inter-qml-%s.woff2' % k)
        subprocess.check_call([sys.executable, '-m', 'fontTools.subset', SRC, '--unicodes=' + ranges[k],
                               '--layout-features=*', '--flavor=woff2', '--name-IDs=*', '--name-languages=*',
                               '--notdef-outline', '--glyph-names', '--legacy-kern', '--output-file=' + out])
        print('%-13s %7d bytes' % (k, os.path.getsize(out)), file=sys.stderr)
        css.append("@font-face {\n  font-family: 'Inter';\n  src: url('fonts/inter-qml-%s.woff2') format('woff2');\n"
                   "  font-weight: 100 900;\n  font-style: normal;\n  font-display: swap;\n  unicode-range: %s;\n}"
                   % (k, ranges[k].replace(',', ', ')))
    print('\n'.join(css))


if __name__ == '__main__':
    main()
