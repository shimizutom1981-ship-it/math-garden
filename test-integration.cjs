const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function node(){return {innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},appendChild(){},append(){},remove(){},setAttribute(){},addEventListener(){},focus(){},insertAdjacentHTML(){},querySelector:()=>node(),querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:100,height:100})}}
const body=node(),app=node(),document={body,head:node(),documentElement:node(),hidden:false,addEventListener(){},createElement:node,querySelector:s=>s==='#app'?app:node(),querySelectorAll:()=>[]};
const legacy={version:1,mentalCurriculumVersion:1,current:0,sound:false,music:false,profiles:[{name:'Synthetic adult',stats:{},flowers:10,game:{coins:100,growth:30,owned:['crown'],equipped:{hat:'crown'},days:{}}},{name:'Synthetic child',stats:{},flowers:0}]};
const storage=new Map([['kazunoniwa-v1',JSON.stringify(legacy)]]);
const c={console,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},Date,Math,performance:{now:()=>Date.now()},scrollTo(){},addEventListener(){},requestAnimationFrame(){},matchMedia:()=>({matches:true}),navigator:{},location:{},confirm:()=>true};c.window=c;vm.createContext(c);
const html=fs.readFileSync('dist/index.html','utf8');
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c);
const run=s=>vm.runInContext(s,c);
run("Practice.configure(person(),44,false);data.sound=false;data.music=false;");
for(const subject of ['math','jp','en']){
 run(subject==='en'?'startEnglish()':`start(recommendationFor('${subject}'),true)`);
 for(let n=0;n<5;n++){
  run('practiceClock.start-=2000');
  if(subject==='en'){run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()")}else{run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}
 }
 assert.equal(run('view'),'result');console.log('PASS full five-question '+subject+' flow');
}
assert.equal(run('person().flowers'),13);assert.equal(run('person().game.coins'),130);
assert.equal(run('person().game.growth'),30);assert.equal(run('person().game.equipped.hat'),'crown');assert.equal(run('person().game.owned.includes("crown")'),true);
run('finish()');assert.equal(run('person().game.coins'),130);console.log('PASS rewards exactly once and inventory retained');
run("start(3,false);practiceClock=null;answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");assert.equal(run('session.n'),1);console.log('PASS manual selection gameplay');
run("start(recommendationFor('math'),true);practiceClock.start-=2000;answer(q.choices.findIndex(x=>x!==q.answer),document.createElement('button'))");
const attempts=run('Practice.state(person()).turns.math');run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('Practice.state(person()).turns.math'),attempts);console.log('PASS wrong then corrected counted once');
for(const d of run('Practice.defs')){for(const course of d.courses){for(let n=0;n<40;n++){
 if(d.subject==='en'){run(`englishSession={n:0,seen:[],practiceFocus:'${d.id}'};view='quiz';englishNext()`);assert.equal(run('englishSession.choices.some(x=>x[0]===englishSession.word[0])'),true)}
 else {run(`session={auto:false,seen:{}};q=makeQuestion(${course})`);assert.equal(run('new Set(q.choices).size===q.choices.length&&q.choices.includes(q.answer)'),true)}
}}}console.log('PASS all existing generator courses, unique choices and correct answer');
assert.ok(JSON.parse(storage.get('kazunoniwa-v1')).profiles[0].practice);console.log('PASS existing save key persisted');
// Exhaust every fraction numerator/denominator, through manual and adaptive rendering.
for(const auto of [false,true])for(let b=2;b<=6;b++)for(let a=1;a<b;a++){
 run("Object.assign(Practice.skill(person(),Practice.defs.find(d=>d.id==='fraction')),{support:0,retry:null,misses:0});");
 const originalRandom=Math.random;let draws=[(b-2+.1)/5,(a-1+.1)/(b-1)];
 try{
  Math.random=()=>draws.length?draws.shift():originalRandom();
  run(`session={i:12,auto:${auto},practiceFocus:'fraction',seen:{},n:0,correct:0,misses:0};subject='math';view='quiz';nextQuestion()`);
 }finally{Math.random=originalRandom}
 assert.equal(run('q.a'),a);assert.equal(run('q.b'),b);assert.equal(run('q.answer'),`${a}/${b}`);
 assert.match(app.innerHTML,/class="fraction-diagram"[^>]*width:100%/);
 assert.ok(app.innerHTML.includes(`aria-label="${b}等分したうち${a}つが色付き"`));
 assert.equal((app.innerHTML.match(/background:#eab95f/g)||[]).length,a);
 assert.equal((app.innerHTML.match(/background:#fff;/g)||[]).length,b-a);
 assert.equal(run('new Set(q.choices).size'),4);
 run("if(practiceClock)practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('session.done'),true);
}
console.log('PASS all 15 fraction diagrams and answers in manual + adaptive modes');
assert.equal(run('practiceTestVisible'),false);assert.equal(run('practiceTestMarkup()'),'');
const beforeToggle=run('JSON.stringify(data)'),storedBefore=storage.get('kazunoniwa-v1');
run('practiceTestToggle(true)');assert.ok(run('practiceTestMarkup().includes("practiceTestPanel")'));
run('practiceTestToggle(false)');assert.equal(run('practiceTestMarkup()'),'');
assert.equal(run('JSON.stringify(data)'),beforeToggle);assert.equal(storage.get('kazunoniwa-v1'),storedBefore);
console.log('PASS test toggle defaults OFF and changes no learner/save data');
run('practiceTestToggle(true)');
c.speechSynthesis={cancel(){},getVoices(){return []},speak(){}};c.SpeechSynthesisUtterance=function(text){this.text=text};run('data.sound=true');
for(const def of run('Practice.defs'))for(const course of def.courses){
 run(`Object.assign(Practice.skill(person(),Practice.defs.find(d=>d.id==='${def.id}')),{level:${def.courses.indexOf(course)},support:0,retry:null});Practice.state(person()).turns['${def.subject}']=0`);
 if(def.subject==='en')run(`session=null;englishSession={n:0,seen:[],practiceFocus:'${def.id}'};view='quiz';englishNext()`);
 else run(`session={i:${course},auto:true,practiceFocus:'${def.id}',seen:{},n:0,correct:0,misses:0};subject='${def.subject}';view='quiz';nextQuestion()`);
 assert.equal(run('practiceTestQuestion.course'),course);assert.equal(run('practiceTestQuestion.stage'),def.courses.indexOf(course)+1);
 assert.equal(run('practiceTestQuestion.skill'),def.id);assert.equal(run('practiceTestQuestion.mode'),'fluent');
}
console.log('PASS actual skill, generated stage and mode across every course in all subjects');
run('data.sound=false');
run("Object.assign(Practice.skill(person(),Practice.defs[1]),{level:0,support:0,retry:null});Practice.state(person()).turns.math=2;session={i:3,auto:true,practiceFocus:'addition',seen:{},n:0};subject='math';view='quiz';nextQuestion()");
assert.equal(run('practiceTestQuestion.mode'),'challenge');assert.equal(run('practiceTestQuestion.stage'),2);assert.equal(run('practiceTestQuestion.estimate'),1);
const snapshot=run('JSON.stringify(practiceTestQuestion)');run('Practice.skill(person(),Practice.defs[1]).level=2');assert.equal(run('JSON.stringify(practiceTestQuestion)'),snapshot);
run("Practice.state(person()).turns.math=5;nextQuestion()");assert.equal(run('practiceTestQuestion.mode'),'review');assert.equal(run('practiceTestQuestion.stage'),2);assert.equal(run('practiceTestQuestion.estimate'),3);
run("Object.assign(Practice.skill(person(),Practice.defs[1]),{support:2,retry:2});nextQuestion()");assert.equal(run('practiceTestQuestion.mode'),'prerequisite');
run("session.auto=false;session.i=12;nextQuestion()");assert.equal(run('practiceTestQuestion.mode'),'manual');assert.equal(run('practiceTestQuestion.course'),12);
console.log('PASS generated stage differs from frozen learner estimate; challenge/review/prerequisite/manual labels');
for(const [kind,auto,course] of [['math',true,3],['jp',true,18],['en',true,0],['math',false,7],['jp',false,24]]){
 run("data.current=0;person().game.coins=100;person().game.days={};person().flowers=10;practiceTestVisible=true");
 run(kind==='en'?'startEnglish()':`start(${course},${auto})`);
 for(let set=0;set<3;set++){
  for(let n=0;n<5;n++){
   run('if(practiceClock)practiceClock.start-=2000');
   run(kind==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
  }
  assert.equal(run('view'),'result');assert.equal(run('person().game.coins'),110+set*3);assert.equal(run('person().flowers'),11+set);
  run(kind==='en'?'englishFinish()':'finish()');assert.equal(run('person().game.coins'),110+set*3);
  run('continuePractice()');const active=run(kind==='en'?'englishSession':'session');
  assert.equal(run('view'),'quiz');assert.equal(active.n,0);assert.equal(run('practiceTestVisible'),true);
  if(kind!=='en'){assert.equal(run('subject'),kind);assert.equal(active.auto,auto);if(!auto)assert.equal(active.i,course)}
  run('continuePractice()');assert.equal(run(kind==='en'?'englishSession':'session'),active);
  assert.equal(run('person().game.coins'),110+set*3);
 }
 console.log('PASS repeated continuation + double-click/reward guard: '+kind+' '+(auto?'adaptive':'manual'));
}
run("home();continuePractice()");assert.equal(run('view'),'home');console.log('PASS home route retained; stale continuation ignored');
for(const [animal,emoji] of [['cat','🐱'],['dog','🐶']]){
 const rows=run('EN_WORDS[5]'),running=rows.find(w=>w[0]===`The ${animal} is running.`);
 assert.ok(running[1].includes('<svg data-action="running"'));assert.ok(running[1].includes(emoji));assert.ok(!running[1].includes('>running<'));
 assert.equal(rows.find(w=>w[0]===`The ${animal} is sleeping.`)[1],emoji+'💤');
 assert.equal(rows.find(w=>w[0]===`The ${animal} is eating.`)[1],emoji+'🍽️');
}console.log('PASS running SVG maps to correct animal/action; other English action icons unchanged');
assert.equal(run('vocabularyCount'),750);
assert.equal(run('new Set(VOCABULARY_GROUPS.flatMap(g=>g.words.map(w=>w.word.toLowerCase()))).size'),750);
assert.equal(run('JP_ADVANCED.reduce((n,g)=>n+g.banks.flat().length,0)+JP_EXPRESSIONS.reduce((n,g)=>n+g.rows.length*3,0)'),162);
for(const kind of ['math','jp','en']){run(`openPracticeCourses('${kind}')`);assert.equal(run('view'),'courses')}
for(const def of run('Practice.defs').filter(d=>/^(jp_|vocab_|math|enListening|enSpelling|enSocial|enInformation)/.test(d.id))){
 run(`data.sound=false;startSelectedPractice('${def.id}')`);
 const actual=run('practiceItem.skill');
 for(let n=0;n<5;n++){
  assert.equal(run('subject'),def.subject==='en'?'jp':def.subject);
  run('practiceClock.start-=2000');
  if(def.subject==='en'){
   assert.equal(run('new Set(englishSession.choices.map(w=>w[1])).size===englishSession.choices.length'),true);
   if(def.id.startsWith('vocab_'))assert.equal(run('englishSession.choices.filter(w=>w!==englishSession.word).every(w=>w[2]!==englishSession.word[2]&&(!englishSession.word[4].word.synonymGroup||w[4].word.synonymGroup!==englishSession.word[4].word.synonymGroup))'),true);
   run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()");
  }else run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
 }
 assert.equal(run('view'),'result');run('continuePractice()');
 assert.equal(run(def.subject==='en'?'englishSession.selectedPracticeFocus':'session.selectedPracticeFocus'),def.id);
 if(def.id==='enListening'||def.id==='enSpelling')assert.notEqual(actual,def.id);
}
console.log('PASS 750 distinct headwords,162 Japanese questions, all new skill flows/continuation, synonym-safe vocabulary and independent reading fallback');
run("data.sound=false;startSelectedPractice('enListening');practiceClock.start-=2000");
const listeningBefore=run("Practice.skill(person(),Practice.defs.find(d=>d.id==='enListening')).total"),readingId=run('practiceItem.skill');
const readingBefore=run(`Practice.skill(person(),Practice.defs.find(d=>d.id==='${readingId}')).total`);
run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");
assert.equal(run("Practice.skill(person(),Practice.defs.find(d=>d.id==='enListening')).total"),listeningBefore);
assert.equal(run(`Practice.skill(person(),Practice.defs.find(d=>d.id==='${readingId}')).total`),readingBefore+1);
assert.equal(run("person().game.equipped.hat"),'crown');
console.log('PASS audio-free answers never credit listening mastery; inventory retained after curriculum sessions');
function finishSyntheticSet(kind){for(let n=0;n<5;n++){run('if(practiceClock)practiceClock.start-=2000');run(kind==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}}
run("data.current=0;person().game.coins=100;person().game.days={};person().flowers=10;home();startGuidedPractice()");
let initialSession=run('session');run('startGuidedPractice()');assert.equal(run('session'),initialSession);
let expectedCoins=100;
for(const [i,kind] of ['math','jp','en','math','jp','en'].entries()){
 assert.equal(run(kind==='en'?'!!englishSession&&session===null':`subject==='${kind}'&&!!session`),true);
 const otherSkills=run(`JSON.stringify(Object.fromEntries(Object.entries(Practice.state(person()).skills).filter(([id])=>Practice.defs.find(d=>d.id===id)?.subject!=='${kind}')))`);
 finishSyntheticSet(kind);expectedCoins+=i<3?10:3;
 assert.equal(run('person().game.coins'),expectedCoins);assert.equal(run('person().flowers'),11+i);
 assert.equal(run(`JSON.stringify(Object.fromEntries(Object.entries(Practice.state(person()).skills).filter(([id])=>Practice.defs.find(d=>d.id===id)?.subject!=='${kind}')))`),otherSkills);
 run(kind==='en'?'englishFinish()':'finish()');assert.equal(run('person().game.coins'),expectedCoins);
 run('nextSubjectPractice()');const nextSession=run('session||englishSession');run('nextSubjectPractice();continuePractice()');assert.equal(run('session||englishSession'),nextSession);assert.equal(run('person().game.coins'),expectedCoins);
}
console.log('PASS two math/Japanese/English cycles; independent mastery, repeat-click guards and unchanged reward amounts');
run("home();startSelectedPractice('mathCarry')");finishSyntheticSet('math');run('nextSubjectPractice()');assert.equal(run('subject'),'jp');assert.equal(run('session.selectedPracticeFocus'),undefined);assert.equal(run('curriculumRequestedFocus'),null);
finishSyntheticSet('jp');const previousProfile=run('data.current');run('chooseChild(1);nextSubjectPractice()');assert.equal(run('view'),'home');assert.equal(run('practiceContinuation'),null);
run('startEnglish()');finishSyntheticSet('en');run('home();nextSubjectPractice()');assert.equal(run('view'),'home');
run("start(7,false)");finishSyntheticSet('math');run('continuePractice()');assert.equal(run('session.auto'),false);assert.equal(run('session.i'),7);
run("home();startGuidedPractice()");assert.equal(run('subject'),'math');
const fresh={...c};fresh.window=fresh;vm.createContext(fresh);
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],fresh);
assert.equal(vm.runInContext('practiceContinuation',fresh),null);vm.runInContext('nextSubjectPractice()',fresh);assert.equal(vm.runInContext('view',fresh),'welcome');
assert.equal(vm.runInContext('person().flowers',fresh),run('person().flowers'));
console.log('PASS category reset on subject change, profile/navigation isolation, manual/free practice and reload without stale reward/continuation');
