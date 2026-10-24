const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function node(){return {innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},appendChild(){},append(){},remove(){},setAttribute(){},addEventListener(){},focus(){},insertAdjacentHTML(){},querySelector:()=>node(),querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:100,height:100})}}
const body=node(),app=node(),document={body,head:node(),documentElement:node(),hidden:false,addEventListener(){},createElement:node,querySelector:s=>s==='#app'?app:node(),querySelectorAll:()=>[]};
const legacy={version:1,mentalCurriculumVersion:1,current:0,sound:false,music:false,profiles:[{name:'Synthetic adult',stats:{},flowers:10,game:{coins:100,growth:30,owned:['crown'],equipped:{hat:'crown'},days:{}}},{name:'Synthetic child',stats:{},flowers:0}]};
const storage=new Map([['kazunoniwa-v1',JSON.stringify(legacy)]]);
const c={console,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},Date,Math,performance:{now:()=>Date.now()},scrollTo(){},addEventListener(){},requestAnimationFrame(){},matchMedia:()=>({matches:true}),navigator:{},location:{},confirm:()=>true};c.window=c;vm.createContext(c);
const html=fs.readFileSync('dist/index.html','utf8');
for(const source of [html,fs.readFileSync('dist/game.js','utf8'),fs.readFileSync('dist/practice-ui.js','utf8')])assert.doesNotMatch(source,/onclick=["']continuePractice\(\)/);
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c);
const run=s=>vm.runInContext(s,c);
assert.equal(run('freeSubjectChoice()'),false);assert.equal(run('practiceFlow().next'),'math');
run("data.profiles.forEach(p=>p.practiceFlow={freeChoice:true,next:'math'})");
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
 assert.equal(run('view'),'result');run('continuePractice()');assert.equal(run('view'),'result');run('nextSubjectPractice()');
 assert.equal(run('view'),'quiz');assert.equal(run('(session||englishSession)?.selectedPracticeFocus'),undefined);
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
run("data.current=0;person().game.coins=100;person().game.days={};person().flowers=10;practiceFlow().next='math';home();startGuidedPractice()");
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
run("start(7,false)");finishSyntheticSet('math');run('continuePractice()');assert.equal(run('view'),'result');run('nextSubjectPractice()');assert.equal(run('subject'),'jp');
run("home();startGuidedPractice()");assert.equal(run('subject'),'jp');
const fresh={...c};fresh.window=fresh;vm.createContext(fresh);
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],fresh);
assert.equal(vm.runInContext('practiceContinuation',fresh),null);vm.runInContext('nextSubjectPractice()',fresh);assert.equal(vm.runInContext('view',fresh),'welcome');
assert.equal(vm.runInContext('person().flowers',fresh),run('person().flowers'));
console.log('PASS category reset on subject change, profile/navigation isolation, manual/free practice and reload without stale reward/continuation');
run("data.current=0;delete person().practiceFlow;home()");
assert.equal(run('freeSubjectChoice()'),false);assert.match(app.innerHTML,/subject-home-choices" hidden/);
run('startSelectedPractice("mathCarry");openPracticeCourses("en")');assert.equal(run('view'),'home');
run('startGuidedPractice()');assert.equal(run('subject'),'math');
finishSyntheticSet('math');assert.equal(run('practiceFlow().next'),'jp');
const rewardAfterMath=run('person().game.coins');run('continuePractice();finish()');assert.equal(run('view'),'result');assert.equal(run('person().game.coins'),rewardAfterMath);
run('home();startGuidedPractice()');assert.equal(run('subject'),'jp');
run("practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'));advance();home();startGuidedPractice()");assert.equal(run('subject'),'jp');assert.equal(run('session.n'),0);
finishSyntheticSet('jp');assert.equal(run('practiceFlow().next'),'en');run('home();startGuidedPractice()');finishSyntheticSet('en');assert.equal(run('practiceFlow().next'),'math');
run('parents()');assert.equal(run('view'),'parent');run('setFreeSubjectChoice(true)');assert.equal(run('freeSubjectChoice()'),true);
run('home();startSelectedPractice("mathCarry")');assert.equal(run('session.selectedPracticeFocus'),'mathCarry');finishSyntheticSet('math');run('continuePractice()');assert.equal(run('view'),'result');
const inventoryBeforeToggle=run('JSON.stringify(person().game.owned)'),skillsBeforeToggle=run('JSON.stringify(person().practice)');
run('parents();setFreeSubjectChoice(false);home()');assert.equal(run('freeSubjectChoice()'),false);assert.equal(run('JSON.stringify(person().game.owned)'),inventoryBeforeToggle);assert.equal(run('JSON.stringify(person().practice)'),skillsBeforeToggle);
run('data.current=1;delete person().practiceFlow;home()');assert.equal(run('freeSubjectChoice()'),false);assert.equal(run('practiceFlow().next'),'math');
run('parents();setFreeSubjectChoice(true);home();startEnglish();home()');assert.equal(run('practiceFlow().next'),'en');
run('chooseChild(0)');assert.equal(run('freeSubjectChoice()'),false);run('chooseChild(1)');assert.equal(run('freeSubjectChoice()'),true);assert.equal(run('practiceFlow().next'),'en');
const resumed={...c};resumed.window=resumed;vm.createContext(resumed);
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],resumed);
assert.equal(vm.runInContext('freeSubjectChoice()',resumed),true);assert.equal(vm.runInContext('practiceFlow().next',resumed),'en');
vm.runInContext('home();startGuidedPractice()',resumed);assert.equal(vm.runInContext('!!englishSession&&session===null',resumed),true);
run('parents();practiceTestToggle(true)');assert.equal(run('practiceTestVisible'),true);
console.log('PASS default/migrated profiles sequential; parent toggle both ways, per-profile persisted resume, stop/restart, full cycle, no shortcut and unchanged mastery/inventory');
const spoken=[];c.speechSynthesis.speak=u=>spoken.push(u.text);run('data.sound=true;practiceTestVisible=false');
const readingCourses=[22,20,...run("Practice.defs.find(d=>d.id==='jp_kanjiContext').courses")];
let readingChecks=0,previousLeakCases=0;
for(const course of readingCourses){
 const count=run(`JP_BANK[${course}-JP_START].length`);
 run(`subject='jp';view='quiz';session={i:${course},auto:false,seen:{},n:0,correct:0,misses:0}`);
 for(let j=0;j<count;j++){
  spoken.length=0;run('nextQuestion()');
  assert.ok(run('q.readingTask'));assert.equal(spoken.at(-1),run('speechText(q.instructionSpeech)'));
  if(course!==22){assert.notEqual(run('q.text'),spoken.at(-1));previousLeakCases++}
  assert.doesNotMatch(app.innerHTML,/<ruby|<rt\b|aria-label="[^"]*正解/);
  run('speakQuestion()');assert.equal(spoken.at(-1),run('speechText(q.instructionSpeech)'));
  const pronounced=run('q.answer');run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");
  assert.ok(spoken.at(-1).startsWith(pronounced));assert.equal(run('session.done'),true);
  run('speakQuestion()');assert.equal(spoken.at(-1),`正解は、${pronounced}です。`);readingChecks++;
 }
}
assert.equal(readingChecks,34);assert.equal(previousLeakCases,26);
for(const id of ['words','jp_kanjiContext']){
 run(`Object.assign(Practice.skill(person(),Practice.defs.find(d=>d.id==='${id}')),{level:${id==='words'?1:2},support:0,retry:null});Practice.state(person()).turns.jp=0;session={i:22,auto:true,practiceFocus:'${id}',seen:{},n:0};subject='jp';view='quiz';nextQuestion()`);
 assert.equal(spoken.at(-1),run('speechText(q.instructionSpeech)'));
}
run("subject='jp';session={i:24,auto:false,seen:{},n:0};view='quiz';nextQuestion()");assert.equal(spoken.at(-1),run('speechText(q.text)'));
run("subject='math';session={i:12,auto:false,seen:{},n:0};view='quiz';nextQuestion()");assert.equal(spoken.at(-1),run('speechText(q.text)'));
console.log('PASS all 26 kanji +8 kana reading items: neutral automatic/replay audio, pronunciation only after correct answer, adaptive routes and other speech unchanged');

// Cosmetic milestones migrate old saves without touching purchases or learning.
run("data.current=0;data.sound=false;game().growth=147;game().friends={momo:{growth:27,equipped:{}},sora:{growth:12,equipped:{}},hoshi:{growth:5,equipped:{}}};game().activeFriend='main';delete game().friendKeepsakes;home()");
assert.equal(run('game().friendKeepsakes.earned.length'),5);
run('petRoom()');
const beforeKeepsakes=run('JSON.stringify(data)');
for(let i=0;i<20;i++)run('syncFriendKeepsakes();home();petRoom()');
assert.equal(run('JSON.stringify(data)'),beforeKeepsakes);
assert.equal(run('friendKeepsakeShelf().includes("はなのはた")'),true);
run("game().activeFriend='hoshi';petRoom()");
assert.equal(run('friendKeepsakeProgress().includes("つぎは Lv.3")'),true);
const coinsBeforeFeed=run('game().coins');
run("feedPet('apple')");
assert.equal(run('game().coins'),coinsBeforeFeed-10);
assert.equal(run('game().friendKeepsakes.earned.filter(x=>x==="hoshi-3").length'),1);
const earnedSave=run('JSON.stringify(data)');
run('data=JSON.parse(localStorage.getItem(KEY));home()');
assert.equal(run('JSON.stringify(data)'),earnedSave);
run('data.current=1;home()');assert.equal(run('game().friendKeepsakes.earned.length'),0);
run('data.current=0;home()');assert.equal(run('game().friendKeepsakes.earned.length'),6);
assert.equal(run('game().owned.includes("crown")'),true);
run("game().friends.hoshi.growth=0;game().activeFriend='main';home()");
assert.equal(run('game().friendKeepsakes.earned.length'),6);
assert.equal(run('syncFriendKeepsakes().length'),0);
console.log('PASS friend milestones: retroactive grants once, repeated renders, feeding threshold, reload, independent profiles, permanent collection and purchased inventory');

// Enter via the real welcome handler; removing the modal alone leaves .wrap inert.
const wrap=node();wrap.inert=true;
const previousQuery=document.querySelector;
document.querySelector=s=>s==='.wrap'?wrap:previousQuery(s);
run('chooseChild(0);petRoom()');assert.equal(wrap.inert,false);
const navigationSave=run('JSON.stringify(data)');
for(let i=0;i<10;i++){
 run('home();home()');assert.equal(run('view'),'home');
 assert.ok(app.innerHTML.includes('onclick="petRoom()"'));
 run('petRoom()');assert.equal(run('view'),'pet');
 assert.equal(run('JSON.stringify(data)'),navigationSave);
}
assert.equal(wrap.inert,false);
console.log('PASS welcome releases inert; repeated garden return and pet re-entry preserve complete profile data');

const hintNode=node(),hintButton=node();
document.querySelector=s=>s==='#hint'?hintNode:s==='#hintButton'?hintButton:s==='.wrap'?wrap:previousQuery(s);
run("data.sound=true;subject='math';view='quiz';session={help:false,done:false};q={arithmetic:{op:'subtract',a:402,b:187},answer:215,hint:'ANSWER LEAK'}");
const beforeHint=run('JSON.stringify(data)');
run('showHint()');assert.ok(hintNode.innerHTML.includes('1 / 2'));assert.ok(!hintNode.innerHTML.includes('215'));assert.equal(run('session.help'),true);
run('showHint()');assert.ok(hintNode.innerHTML.includes('2 / 2'));assert.ok(hintNode.innerHTML.includes('12'));
for(let i=0;i<20;i++)run('showHint()');
assert.ok(hintNode.innerHTML.includes('2 / 2'));assert.ok(!spoken.at(-1).includes('ANSWER LEAK'));assert.ok(!spoken.at(-1).includes('215'));
assert.equal(run('JSON.stringify(data)'),beforeHint);
run("q={arithmetic:{op:'add',a:9,b:8}};showHint()");assert.ok(hintNode.innerHTML.includes('1 / 2'));
run("q={type:'fraction',hint:'KEEP ORIGINAL'};showHint()");assert.equal(hintNode.textContent,'KEEP ORIGINAL');
run("session.done=true;q={arithmetic:{op:'add',a:1,b:2}};showHint()");assert.equal(hintNode.textContent,'KEEP ORIGINAL');
for(let i=0;i<13;i++)for(let j=0;j<20;j++){
 const x=run(`makeMathQuestion(${i})`);
 if(['add','sub','mul','div','mixed'].includes(x.type))assert.ok(c.WrittenHints.model(x));
 else assert.equal(c.WrittenHints.model(x),null);
}
for(const i of [14,16])for(let j=0;j<20;j++)assert.ok(c.WrittenHints.model(run(`makeMentalQuestion(${i})`)));
console.log('PASS structured generators, staged hints/reset, rapid repeated hints, no speech answer leak, unchanged saves and concept fallback');

run("data.sound=false;data.current=0;game().growth=297;avatarState();railState();railState().passengers=['main','momo','sora','hoshi'];railRoom()");
const trainSave=run('JSON.stringify(data)');
assert.equal((app.innerHTML.match(/class="rail-driver"/g)||[]).length,1);
assert.ok(app.innerHTML.indexOf('class="rail-driver"')>app.innerHTML.indexOf('class="rail-train"'));
assert.ok(app.innerHTML.includes(run('avatarArt()')));
for(const id of ['main','momo','sora','hoshi'])assert.ok(app.innerHTML.includes(run(`FRIENDS.find(f=>f.id==='${id}').icon`)));
run('railRoom();railRoom()');assert.equal(run('JSON.stringify(data)'),trainSave);
run("setAvatar('outfit','driver');setAvatar('accessory','railcap');railRoom()");
assert.ok(app.innerHTML.includes(run('avatarArt()')));assert.ok(app.innerHTML.includes('fill="#284b77"'));
run('data.current=1;railRoom()');assert.ok(app.innerHTML.includes(run('avatarArt()')));assert.equal(run('avatarState().outfit'),'everyday');
run('data.current=0;railRoom()');assert.equal(run('avatarState().outfit'),'driver');
const timers=[],cancelled=[];c.setTimeout=(f)=>{timers.push(f);return timers.length};c.clearTimeout=id=>cancelled.push(id);
let trainNode=node(),statusNode=node();const priorAppQuery=app.querySelector;
app.querySelector=s=>s==='.rail-train'?trainNode:s==='.rail-status'?statusNode:priorAppQuery(s);
run('railDepart();railDepart()');assert.ok(cancelled.includes(timers.length-1));
const oldArrival=timers.at(-1);trainNode=node();statusNode=node();statusNode.textContent='NEW SCREEN';oldArrival();assert.equal(statusNode.textContent,'NEW SCREEN');
run('railDepart()');timers.at(-1)();assert.ok(statusNode.textContent.includes('とうちゃく'));
console.log('PASS avatar inside train, all friends retained, clothing/profile changes, repeated render and departure, stale arrival isolated');

run('data.current=0;avatarRoom()');
const preservedBeforeOutfit=run('JSON.stringify({game:game(),stats:person().stats,flowers:person().flowers,practice:person().practice,flow:person().practiceFlow})');
for(const [key,options] of run('Object.entries(AVATAR_OPTIONS)'))for(const option of options){
 run(`setAvatar('${key}','${option[0]}')`);
 assert.equal(run(`avatarState()['${key}']`),option[0]);
 assert.ok(app.innerHTML.includes(run('avatarArt()')));
}
const selectedAvatar=run('JSON.stringify(person().avatar)');
run('home();avatarRoom()');assert.equal(run('JSON.stringify(person().avatar)'),selectedAvatar);
run('data=JSON.parse(localStorage.getItem(KEY));home();avatarRoom()');assert.equal(run('JSON.stringify(person().avatar)'),selectedAvatar);
assert.equal(run('JSON.stringify({game:game(),stats:person().stats,flowers:person().flowers,practice:person().practice,flow:person().practiceFlow})'),preservedBeforeOutfit);
run("data.current=1;setAvatar('hair','short');data.current=0;avatarRoom()");assert.equal(run('JSON.stringify(person().avatar)'),selectedAvatar);
console.log('PASS all unlocked avatar choices preview and save; reopen/reload/profile isolation preserve coins, purchases and learning records');
