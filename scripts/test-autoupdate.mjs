// Deterministic test for the automatic updater's detection logic (proxy.js).
// The functions under test are pulled straight out of proxy.js and run against a
// fake `spawn`, so the real git plumbing is never invoked: what is checked here
// is the parsing of `git rev-parse`/`git diff --name-only` output and the rule
// that decides whether a pending update needs a restart or can go live as a
// static deploy.  Run: node scripts/test-autoupdate.mjs
import fs from 'fs';
const src = fs.readFileSync(new URL('../proxy.js', import.meta.url),'utf8');
function grab(name){
  const i = src.indexOf('function '+name+'(');
  if(i<0) throw new Error('not found '+name);
  let d=0,j=src.indexOf('{',i);
  for(let k=j;k<src.length;k++){ if(src[k]==='{')d++; else if(src[k]==='}'){d--; if(!d) return src.slice(i,k+1);} }
}
const EventEmitter = (await import('events')).EventEmitter;
let fakeOut='', fakeCode=0;
const harness = `
const GIT_UPDATABLE=true, GIT_SHALLOW=true, GIT_BRANCH='main', SAFE_PATH='/usr/bin';
const __dirname='/app';
function installKind(){return 'docker-git';}
let _upd={checking:false,checkedAt:0,available:false,local:'',remote:'',subject:'',files:0,needsRestart:false,error:'',lastAction:''};
let _updWaiters = [];
${grab('_updFlush')}
${grab('_pathNeedsRestart')}
${grab('_pkgDiffNeedsRestart')}
${grab('_filesNeedRestart')}
${grab('updateCheck')}
return {updateCheck, _pathNeedsRestart, _filesNeedRestart, get:()=>_upd};
`;
const spawn = (cmd,args,opts)=>{
  const ch=new EventEmitter(); ch.stdout=new EventEmitter(); ch.stderr=new EventEmitter(); ch.kill=()=>{};
  setTimeout(()=>{ ch.stdout.emit('data',Buffer.from(fakeOut)); ch.emit('close',fakeCode); },5);
  return ch;
};
const mod = new Function('spawn','process','setTimeout','clearTimeout','Date',harness)(spawn,process,setTimeout,clearTimeout,Date);
let fail=0;
const ok=(c,m)=>{ if(!c){ console.log('FAIL '+m); fail++; } else console.log('ok   '+m); };

ok(mod._pathNeedsRestart('proxy.js')===true,'proxy.js needs restart');
ok(mod._pathNeedsRestart('public/pokerth.js')===false,'served file: no restart');
ok(mod._pathNeedsRestart('public/modules/lang/fr.mjs')===false,'lang file: no restart');
ok(mod._pathNeedsRestart('package.json')===true,'package.json needs restart');
ok(mod._pathNeedsRestart('docs/ROADMAP.md')===false,'docs: no restart');
ok(mod._pathNeedsRestart('CHANGELOG.md')===false,'changelog: no restart');
// scripts/ (tests, manifest builders) and install.sh are not code the running
// proxy holds: no restart (proxy.js _pathNeedsRestart).
ok(mod._pathNeedsRestart('scripts/test-boot.mjs')===false,'scripts: no restart');
// The link with the Arena (an application of its own since web.327) is server code.
ok(mod._pathNeedsRestart('server/arena-link.js')===true,'the Arena link: restart');
ok(mod._pathNeedsRestart('install.sh')===false,'install.sh: no restart');
ok(mod._pathNeedsRestart('server/db-dialects.js')===true,'server/ code needs restart');
// package.json: only the version bump or a `node scripts/…` entry → no restart.
ok(mod._filesNeedRestart(['package.json'],'-  "version": "2.1.10-web.1",\n+  "version": "2.1.10-web.2",')===false,'package.json version bump: no restart');
ok(mod._filesNeedRestart(['package.json'],'+    "pg": "^8.16.0",')===true,'package.json dependency change: restart');

const A='a'.repeat(40), B='b'.repeat(40);
await new Promise(r=>{
  fakeOut=[A,B,'feat: new deck','--','public/decks/x.png','public/pokerth.js',''].join('\n');
  mod.updateCheck(u=>{ ok(u.available===true,'update detected'); ok(u.needsRestart===false,'static only'); ok(u.files===2,'2 files'); ok(u.subject==='feat: new deck','subject'); r(); });
});
await new Promise(r=>{
  fakeOut=[A,B,'fix: proxy','--','proxy.js',''].join('\n');
  mod.updateCheck(u=>{ ok(u.needsRestart===true,'restart required'); r(); });
});
await new Promise(r=>{
  fakeOut=[A,B,'release','--','package.json','public/sw.js','--pkg','-  "version": "1",','+  "version": "2",',''].join('\n');
  mod.updateCheck(u=>{ ok(u.needsRestart===false && u.files===2,'version-only package.json + served file: static deploy'); r(); });
});
await new Promise(r=>{
  // Two callers while a check runs: both get the fresh result (_updWaiters).
  fakeOut=[A,B,'x','--','public/a.js',''].join('\n');
  let n=0; const done=()=>{ if(++n===2){ ok(true,'concurrent callers both answered'); r(); } };
  mod.updateCheck(done); mod.updateCheck(done);
});
await new Promise(r=>{
  fakeOut=[A,A,'','--',''].join('\n');
  mod.updateCheck(u=>{ ok(u.available===false,'up to date'); ok(u.files===0,'no files'); r(); });
});
await new Promise(r=>{
  fakeCode=128; fakeOut='';
  mod.updateCheck(u=>{ ok(u.available===false && !!u.error,'git failure surfaced'); r(); });
});
console.log(fail? 'FAILURES: '+fail : 'ALL OK');
process.exit(fail?1:0);
