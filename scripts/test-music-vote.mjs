#!/usr/bin/env node
// Deterministic guards for the thumbs up/down on the music player.
// Run: node scripts/test-music-vote.mjs
//
// Voting spans the same three files as the play counter, and the failures that
// matter are the quiet ones: a vid leaking into a query string (and from there
// into access logs), totals sent back while voting is supposed to be blind, an
// unvalidated id growing visits.json without bound, a double-count when the
// same thumb is posted twice, or thumbs offered on an instance whose proxy
// cannot record them — a button that does nothing.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const proxy = readFileSync(join(root, 'proxy.js'), 'utf8');
const music = readFileSync(join(root, 'public', 'modules', 'music.mjs'), 'utf8');
const admin = readFileSync(join(root, 'public', 'admin.html'), 'utf8');
const css = readFileSync(join(root, 'public', 'pokerth.css'), 'utf8');

let n = 0, fail = 0;
function ok(cond, msg) { n++; if (!cond) { fail++; console.error('  ✗', msg); } else console.log('  ✓', msg); }

function body(src, name) {
  const head = src.indexOf('function ' + name + '(');
  if (head < 0) return '';
  let i = src.indexOf('{', head), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (!depth) return src.slice(i, j + 1); }
  }
  return '';
}

// ── 1. What the client sends ──────────────────────────────────────────────
const post = body(music, '_votePost');
ok(/method: 'POST'/.test(post), 'the vote is a POST');
ok(!/\?id=|\?vid=|searchParams/.test(post), 'nothing travels in a query string, where it would be logged');
ok(/if \(vote !== undefined\) body\.vote = vote;/.test(post),
  'a body without vote is a read, not a silent withdrawal');
ok(/catch/.test(post), 'a failed vote never breaks the player');

const click = body(music, '_voteClick');
ok(/\(_vote\.mine === v\) \? 0 : v/.test(click), 'clicking the same thumb again takes the vote back');
ok(/_vote\.busy/.test(click), 'a second click cannot race the first');
ok(/if \(!id \|\| !_vote\.known/.test(click), 'nothing is sent before the proxy has answered');

const sync = body(music, '_voteSync');
ok(/if \(!id \|\| _vote\.id === id\) return;/.test(sync), 'one lookup per track, not one per render');

const apply = body(music, '_voteApply');
ok(/if \(id !== _curId\) return;/.test(apply), 'a late answer for a previous track is dropped');

const renderVote = body(music, '_renderVote');
ok(/row\.hidden = true/.test(renderVote), 'the thumbs stay hidden until the proxy answers');
ok(/c\.hidden = !_vote\.pub/.test(renderVote), 'counts are shown only when the server says they are public');
ok(!/_render\(\)/.test(renderVote), 'the refresh is in place — never a full rebuild, which would break the seek drag');

ok(/data-mvote/.test(music), 'the thumbs are wired outside data-mact, so they never touch the audio unlock');
ok(/thumb-up/.test(music) && /thumb-down/.test(music), 'both icons exist');

// ── 2. What the server accepts ────────────────────────────────────────────
const votable = body(proxy, 'musicVotable');
ok(/\^\[A-Za-z0-9_-\]\{1,64\}\$/.test(votable), 'the id charset is validated before it becomes a key');
ok(/musicListForClient\(\)/.test(votable), 'an id absent from the catalogue never creates a key');
ok(!/\.stream/.test(votable), 'radios ARE votable, unlike plays');

const hash = body(proxy, '_musicVoterHash');
ok(/sha256/.test(hash), 'the voter is stored as a hash, never as the raw id');
ok(/String\(trackId\)/.test(hash), 'the hash is salted per track, so two tracks cannot be correlated');
ok(/slice\(0, 12\)/.test(hash), 'the hash is truncated, keeping visits.json small as the playlist grows');

const record = body(proxy, 'recordMusicVote');
ok(/if \(vote !== prev\)/.test(record), 'reposting the same thumb changes nothing');
ok(/Math\.max\(0, b\.up - 1\)/.test(record) && /Math\.max\(0, b\.down - 1\)/.test(record),
  'changing your mind decrements the previous side, and a counter never goes negative');
ok(/MUSIC_VOTERS_MAX/.test(record), 'the voter set is bounded');
ok(/if \(!prev &&/.test(record), 'at the cap a known voter can still change their mind or withdraw');

const read = body(proxy, 'readMusicVote');
ok(/if \(out\.pub\)/.test(read), 'totals are attached only when the operator revealed them');
ok(/musicVotesPublic\(\)/.test(read), 'blind or not is decided server-side, not by a client flag');

const totals = body(proxy, 'musicVoteTotals');
ok(!/voters/.test(totals), 'the dashboard projection carries counts, never voter hashes');

ok(/reqPathOnly === '\/__music-vote'/.test(proxy), 'the public route exists');
ok(/vote must be 1, -1 or 0/.test(proxy), 'any other vote value is rejected');
ok(/musicVotesPublic: musicVotesPublic\(\)/.test(proxy), 'the flag is exposed in /app-config');
const togIdx = proxy.indexOf("reqPathOnly === '/admin/music-votes-public'");
ok(togIdx > 0, 'the admin toggle has its own route');
ok(/hasScope\('music', query, d && d\.token\)/.test(proxy.slice(togIdx, togIdx + 700)),
  'the toggle sits under the music scope, not the master token');

// ── 2b. The counting logic, actually run ──────────────────────────────────
// Regexes above say the guards are present; this lifts the four helpers out of
// proxy.js and exercises them, because the failure that costs real data is an
// arithmetic one — a thumb counted twice, or a total drifting below zero.
const lifted = ['_musicVoterHash', '_musicVoteBucket', 'readMusicVote', 'recordMusicVote', 'musicVoteTotals']
  .map(function (fn) { return 'function ' + fn + body(proxy, fn).replace(/^\{/, '(' + argsOf(proxy, fn) + ') {'); });
function argsOf(src, name) {
  const h = src.indexOf('function ' + name + '(');
  return src.slice(h + ('function ' + name + '(').length, src.indexOf(')', h));
}
const store = { musicVotes: {}, musicVotesSince: 0 };
const sandbox = new Function('crypto', 'visitsStore', 'MUSIC_VOTERS_MAX', 'musicVotable', 'musicVotesPublic', 'saveVisitsSoon',
  lifted.join('\n') + '\nreturn { readMusicVote, recordMusicVote, musicVoteTotals };');
const api = sandbox(await import('node:crypto'), store, 3, function (id) { return id === 'a' || id === 'radio1'; },
  function () { return pub; }, function () {});
let pub = false;

let r = api.recordMusicVote('a', 'dev1', 1);
ok(store.musicVotes.a.up === 1 && store.musicVotes.a.down === 0, 'a thumb up counts once');
ok(r.mine === 1, 'the caller is told what it now holds');
ok(r.up === undefined, 'blind mode sends back no totals at all');

api.recordMusicVote('a', 'dev1', 1);
ok(store.musicVotes.a.up === 1, 'reposting the same thumb does not count twice');

api.recordMusicVote('a', 'dev1', -1);
ok(store.musicVotes.a.up === 0 && store.musicVotes.a.down === 1, 'changing your mind moves the voice, it does not add one');

api.recordMusicVote('a', 'dev1', 0);
ok(store.musicVotes.a.up === 0 && store.musicVotes.a.down === 0, 'withdrawing removes it');
ok(Object.keys(store.musicVotes.a.voters).length === 0, 'and forgets the voter');

ok(api.recordMusicVote('a', '', 1) === null, 'no vid, no vote');
ok(api.recordMusicVote('nope', 'dev1', 1) === null, 'an id outside the catalogue is refused');
ok(api.recordMusicVote('radio1', 'dev1', 1) !== null && store.musicVotes.radio1.up === 1,
  'a radio can be voted on');

['d1', 'd2', 'd3'].forEach(function (d) { api.recordMusicVote('a', d, 1); });
ok(store.musicVotes.a.up === 3, 'three distinct devices, three voices');
api.recordMusicVote('a', 'd4', 1);
ok(store.musicVotes.a.up === 3, 'past the cap a new voter is not recorded');
api.recordMusicVote('a', 'd1', -1);
ok(store.musicVotes.a.up === 2 && store.musicVotes.a.down === 1,
  'but a voter already known still changes their mind at the cap');

pub = true;
r = api.readMusicVote('a', 'd1');
ok(r.up === 2 && r.down === 1 && r.mine === -1, 'once revealed, the totals travel with your own thumb');
ok(!('voters' in api.musicVoteTotals().a), 'the projection never leaks voter hashes');

// ── 3. What the dashboard shows ───────────────────────────────────────────
const badge = body(admin, 'mzVoteBadge');
ok(/if\(!mzVotesKnown\) return null;/.test(badge),
  'a proxy too old to record votes shows nothing, rather than a misleading zero');
ok(/if\(!up && !dn\) return null;/.test(badge), 'an entry nobody voted on stays clean');
ok(!/p\.stream/.test(badge), 'radios carry a vote badge even though they carry no play badge');
ok(/mzVotesKnown=\(d&&d\.votes!==undefined\)/.test(admin), 'the badge is wired to the track list payload');
ok(/id="mzVotesPub"/.test(admin), 'the reveal setting is on the Music tab');
ok(/<option value="0">Off \(blind\)<\/option>/.test(admin), 'blind is the default shown first');
ok(/\/admin\/music-votes-public/.test(admin), 'Save posts the setting');
ok(/\.music-vbtn/.test(css) && /\.music-vote-n/.test(css), 'the thumbs have their own style');

console.log(fail ? `FAIL ${fail}/${n}` : `OK ${n}/${n}`);
process.exit(fail ? 1 : 0);
