const assert=require('node:assert/strict'),fs=require('node:fs');
const W=require('./dist/english-word-practice.js');
const bank=Array.from({length:48},(_,i)=>['word '+i,'picture '+i,'meaning '+i]);
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name)}
function rng(seed=73){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32)}
function answer(p,choice,ok=true,hint=false,ms=2000,set=Math.floor((choice.turn-1)/5),mode='reading'){
 return W.record(p,0,mode,bank,choice.word[0],choice.turn,set,ok,hint,ms);
}
function b(p,mode='reading'){return W.bankState(p,0,mode,bank)}
function next(p,seen=[],mode='reading'){return W.pick(p,0,mode,bank,seen,random)}
const random=rng();
test('legacy aggregate data is retained and never inferred as word evidence',()=>{
 const p={name:'Child',english:{total:500,correct:500},practice:{version:2,limits:{enWords:0}},game:{coins:87}};
 const original=JSON.stringify(p);next(p);const {englishWordPractice,...rest}=p;
 assert.equal(JSON.stringify(rest),original);assert.equal(Object.values(b(p).words).reduce((n,w)=>n+w.total,0),0);
});
test('unanswered presentations cover all 48 words without creating successes',()=>{
 const p={},seen=new Set();for(let i=0;i<48;i++){const q=next(p);assert.ok(!seen.has(q.word[0]));seen.add(q.word[0]);}
 assert.equal(Object.values(b(p).words).reduce((n,w)=>n+w.total,0),0);
});
test('first answers are recorded once even after correction or duplicate callbacks',()=>{
 const p={},q=next(p);assert.equal(answer(p,q,false),true);assert.equal(answer(p,q,true),false);
 assert.equal(b(p).words[q.word[0]].total,1);assert.equal(b(p).words[q.word[0]].wrong,1);
});
test('an older unrecorded presentation cannot submit after that word is shown again',()=>{
 const p={},first=next(p);for(let i=0;i<48;i++)next(p);
 assert.equal(answer(p,first),false);
});
test('four spaced unaided successes across sets are needed; misses clear familiarity',()=>{
 const p={},first=next(p),word=first.word[0];answer(p,first);
 assert.equal(W.stable(b(p).words[word]),false);
 for(let i=1;i<4;i++){
  const state=b(p);state.turn+=5;state.words[word].lastShown=state.turn;const q={word:first.word,turn:state.turn};answer(p,q,true,false,2000,i);
  assert.equal(W.stable(b(p).words[word]),i===3);
 }
 assert.equal(b(p).words[word].due-b(p).turn,96);
 const state=b(p);state.turn+=5;state.words[word].lastShown=state.turn;answer(p,{word:first.word,turn:state.turn},false);
 assert.equal(b(p).words[word].streak,0);assert.equal(W.stable(b(p).words[word]),false);assert.equal(b(p).words[word].due-b(p).turn,6);
});
test('rapid clicks, hints, immediate repetitions, and single-set successes do not establish familiarity',()=>{
 for(const kind of ['rapid','hint','repeat','single-set']){
  const p={},q=next(p);for(let i=0;i<6;i++){
   const state=b(p);state.turn+=kind==='repeat'?1:5;state.words[q.word[0]].lastShown=state.turn;
   answer(p,{word:q.word,turn:state.turn},true,kind==='hint',kind==='rapid'?100:2000,kind==='single-set'?0:i);
  }
  assert.equal(W.stable(b(p).words[q.word[0]]),false,kind);
 }
});
test('heavily practiced words remain in rotation but appear less than words still needing practice',()=>{
 for(const knownCount of [1,12,47]){
  const p={};for(let i=0;i<48;i++)next(p);for(const r of Object.values(b(p).words))Object.assign(r,{total:1,wrong:1,due:0});
  for(let i=0;i<knownCount;i++)Object.assign(b(p).words[bank[i][0]],{total:6,correct:6,wrong:0,streak:6,multipleSets:true,lastCleanTurn:1,lastCleanSet:0,due:48+192});
  const counts=Array(48).fill(0);let seen=[];
  for(let i=0;i<4800;i++){
   if(i%5===0)seen=[];
   const q=next(p,seen),index=bank.indexOf(q.word);seen.push(q.word[0]);counts[index]++;answer(p,q,index<knownCount);
  }
  const known=counts.slice(0,knownCount).reduce((a,n)=>a+n,0)/knownCount;
  const practice=counts.slice(knownCount).reduce((a,n)=>a+n,0)/(48-knownCount);
  assert.ok(counts.every(n=>n>0));assert.ok(known<practice*.8,JSON.stringify({knownCount,known,practice}));
 }
});
test('new words are not starved by persistent misses and there are no within-set repeats',()=>{
 const p={},all=new Set();let seen=[];
 for(let i=0;i<125;i++){
  if(i%5===0)seen=[];const q=next(p,seen);assert.ok(!seen.includes(q.word[0]));seen.push(q.word[0]);all.add(q.word[0]);answer(p,q,false);
 }
 assert.equal(all.size,48);
});
test('recent words stay spaced across sets and reloads, including wrong answers',()=>{
 let p={},last=[];
 for(let i=0;i<300;i++){
  const q=next(p);assert.ok(!last.includes(q.word[0]));answer(p,q,false);last=[...last,q.word[0]].slice(-2);
  p=JSON.parse(JSON.stringify(p));
 }
});
test('children, banks, and reading/listening evidence are independent and roundtrip exactly',()=>{
 const p={},other={},q=next(p);answer(p,q);next(other);next(p,[],'listening');W.pick(p,1,'reading',bank,[]);
 assert.equal(b(p).words[q.word[0]].total,1);assert.equal(Object.values(b(other).words).reduce((n,r)=>n+r.total,0),0);
 assert.equal(Object.values(b(p,'listening').words).reduce((n,r)=>n+r.total,0),0);
 const restored=JSON.parse(JSON.stringify(p));assert.deepEqual(restored,p);
});
test('malformed imported scheduling state is bounded and cannot break selection',()=>{
 for(const value of [null,[],42,{version:1,banks:[]},{version:1,banks:{'animals:reading':{turn:-5,words:{'word 0':{total:-1,correct:Infinity,streak:99,multipleSets:true},unexpected:{total:3}},recent:[{},'bad','word 0']}}}]){
  const p={englishWordPractice:value};const q=next(p);assert.ok(bank.includes(q.word));answer(p,q);const s=b(p);
  assert.equal(Object.hasOwn(s.words,'unexpected'),false);assert.ok(Object.values(s.words).every(r=>r.correct<=r.total&&r.streak<=6));
 }
});
console.log(passed+' word scheduler unit tests passed');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
function fresh(){run("home();data.current=0;data.profiles[0]={name:'Synthetic',stats:{},flowers:0};Practice.state(person());data.noListening=true;data.sound=false;PracticePresets.applyLimit(person(),'preschool-younger',Practice);startEnglish()");}
function wrong(){run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(w=>w[0]!==englishSession.word[0]),document.createElement('button'))");}
function correct(){run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'))");}
function word(){return run("person().englishWordPractice.banks[['animals','food','things'][englishSession.wordPractice.bankIndex]+':'+englishSession.wordPractice.mode].words[englishSession.word[0]]")}
test('real answers in all three picture banks are recorded separately in both audio modes',()=>{
 c.speechSynthesis={cancel(){},getVoices:()=>[],speak(){}};c.SpeechSynthesisUtterance=function(){};
 for(const quiet of [false,true])for(const stage of [0,4,8]){
  fresh();run('home();data.noListening='+quiet+';data.sound='+!quiet+";Practice.setLimit(person(),'enWords',11);Practice.setRange(person(),'enWords',11);Practice.skill(person(),Practice.defs.find(d=>d.id==='enWords')).level="+stage+";Practice.state(person()).turns.en=0;startEnglish()");
  assert.equal(run('englishSession.level'),stage);correct();assert.equal(word().correct,1);assert.equal(word().streak,1);
  assert.equal(run('englishSession.wordPractice.mode'),quiet?'reading':'listening');
 }
});
test('actual wrong first answer persists immediately on abandonment and correction adds no success',()=>{
 fresh();const target=run('englishSession.word[0]');wrong();assert.equal(word().wrong,1);assert.equal(word().correct,0);
 assert.equal(JSON.parse(storage.get('kazunoniwa-v1')).profiles[0].englishWordPractice.banks['animals:reading'].words[target].wrong,1);
 correct();correct();assert.equal(word().total,1);assert.equal(word().wrong,1);run('home()');
 assert.equal(run("person().englishWordPractice.banks['animals:reading'].words["+JSON.stringify(target)+"].wrong"),1);
});
test('actual hint-assisted and rapid correct answers do not increase the clean streak',()=>{
 fresh();run('englishHint()');correct();assert.equal(word().correct,1);assert.equal(word().hinted,1);assert.equal(word().streak,0);
 fresh();run("englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'))");assert.equal(word().correct,1);assert.equal(word().rapid,1);assert.equal(word().streak,0);
});
test('actual first clean correct is counted once; next question starts a new record',()=>{
 fresh();correct();correct();assert.equal(word().total,1);assert.equal(word().streak,1);run('englishAdvance()');assert.equal(word().total,0);correct();assert.equal(word().total,1);
});
test('invalid choices, disabled buttons and callbacks outside quiz do not create evidence',()=>{
 fresh();run("englishAnswer(-1,document.createElement('button'));englishAnswer(0,{disabled:true})");assert.equal(word().total,0);
 run("home();englishAnswer(0,document.createElement('button'))");assert.equal(word().total,0);
});
test('quiet switch does not transfer reading confidence into listening or count an unanswered item',()=>{
 fresh();const old=run('englishSession.word[0]');
 c.speechSynthesis={cancel(){},getVoices:()=>[],speak(){}};c.SpeechSynthesisUtterance=function(){};
 run('data.beforeQuiet={sound:true,music:false};setNoListening(false)');assert.equal(run('englishSession.wordPractice.mode'),'listening');assert.equal(word().total,0);
 correct();assert.equal(word().total,1);assert.equal(run("person().englishWordPractice.banks['animals:reading'].words["+JSON.stringify(old)+"].total"),0);
});
test('profile replacement reuses persisted word evidence; old callbacks cannot change another child',()=>{
 fresh();correct();const target=run('englishSession.word[0]');const snapshot=run('JSON.stringify(data.profiles[0])');
 run('home();data.profiles[0]=JSON.parse('+JSON.stringify(snapshot)+');startEnglish()');
 assert.equal(run("person().englishWordPractice.banks['animals:reading'].words["+JSON.stringify(target)+"].correct"),1);
 run('home();data.current=1;startEnglish()');assert.equal(word().total,0);
});
return (async()=>{
 fresh();wrong();correct();const target=run('englishSession.word[0]');const json=run('JSON.stringify(data)');
 c.restoreEvent={target:{files:[{size:json.length,text:async()=>json}]}};
 run('home();data.profiles[0].englishWordPractice={version:1,banks:{}}');await run('restore(restoreEvent)');
 test('actual JSON import preserves word records, rewards and difficulty settings',()=>{
  assert.equal(run("person().englishWordPractice.banks['animals:reading'].words["+JSON.stringify(target)+"].wrong"),1);
  const expected=JSON.parse(json).profiles[0];assert.deepEqual(JSON.parse(run('JSON.stringify(person())')),expected);
 });
 const reload={console,document,localStorage:c.localStorage,setTimeout:c.setTimeout,clearTimeout:c.clearTimeout,setInterval:c.setInterval,clearInterval:c.clearInterval,Date,Math,performance:c.performance,scrollTo(){},addEventListener(){},requestAnimationFrame(){},matchMedia:c.matchMedia,navigator:{},location:{},confirm:()=>true};reload.window=reload;vm.createContext(reload);
 for(const m of fs.readFileSync('dist/index.html','utf8').matchAll(/<script(?:\\s+src="([^"]+)")?[^>]*>([\\s\\S]*?)<\\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],reload);
 test('new page execution loads saved word history without fabricating answers',()=>{
  const actual=JSON.parse(vm.runInContext('JSON.stringify(data.profiles[0].englishWordPractice)',reload));
  assert.deepEqual(actual,JSON.parse(json).profiles[0].englishWordPractice);
 });
 console.log(passed+' word scheduler integration tests passed');
})();
`)(require).catch(error=>{console.error(error);process.exitCode=1});
