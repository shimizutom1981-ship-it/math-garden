const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0]
 .replace('hidden:false,addEventListener(){}','hidden:false,listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}');
new Function('require',setup+String.raw`
const callbacks=new Map(),pending=new Set();let serial=0;
c.setTimeout=(fn,delay)=>{const id=++serial;callbacks.set(id,{fn,delay});pending.add(id);return id};
c.clearTimeout=id=>pending.delete(id);
const btn=()=>document.createElement('button'),def=id=>P.defs.find(d=>d.id===id);
function tick(){const id=run('autoNextTimer');assert.ok(pending.has(id));assert.equal(callbacks.get(id).delay,2200);pending.delete(id);callbacks.get(id).fn();return id}
run("for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}person().practice.settings.kanji=true;person().practice.settings.carry=true;person().practiceFlow={freeChoice:true,next:'math'};Practice.setGentle(person(),true);data.sound=false;data.noListening=true");
function focus(id,stage=0,n=0,set=0){
 const d=def(id),p=run('person()'),s=P.skill(p,d);Object.assign(s,{level:stage,support:0,misses:0});delete s.gentleBridge;delete s.pendingGentle;
 P.state(p).turns[d.subject]=0;P.state(p).sessions[d.subject]=set;
 run('home();startSelectedPractice('+JSON.stringify(id)+')');
 if(n)run(d.subject==='en'?'englishSession.n='+n+';englishNext()':'session.n='+n+';nextQuestion()');
 assert.equal(run('practiceItem.skill'),id);
}
function solve(){
 run('practiceClock.start-=2000');
 if(def(run('practiceItem.skill')).subject==='en'){
  const e=run('englishSession'),t=e.thinking;
  if(t?.interactive&&t.thinkingKind==='englishBuild'){
   const tokens=run('ThinkingContent').banks.gardenEnglishBuild.flat().find(x=>x.id===t.id).tokens;
   for(const token of tokens)run('ThinkingActivities').englishToken(t.tokens.indexOf(token));run('ThinkingActivities').englishSubmit(btn());
  }else run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");
 }else{
  const q=run('q'),T=run('ThinkingActivities');
  if(T.custom(q)){
   if(q.thinkingKind==='match'){for(let i=0;i<q.answer;i++)T.toggle(i)}
   else if(q.thinkingKind==='assemble'){const used=[];for(const token of q.answer){const i=q.tokens.findIndex((t,i)=>t===token&&!used.includes(i));used.push(i);T.token(i)}}
   else if(q.thinkingKind==='pattern')T.select(q.choices.indexOf(q.answer));
   else{T.select(q.responseChoices.indexOf(q.responseAnswer));T.submit(btn());assert.equal(run('autoNextTimer'),null);assert.equal(run('session.done'),false);T.detail(q.thinkingKind==='evidence'?q.evidence:q.corrections.indexOf(q.meta.correct))}
   T.submit(btn());
  }else if(q.slots){for(let i=0;i<q.answer;i++)run('GardenActivities').toggle(i);run('GardenActivities').submit(btn())}
  else run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");
 }
}
// Exercise each excluded family through real answer adapters and the timer.
for(const row of run('ThinkingContent.defs'))for(let stage=0;stage<row.stages.length;stage++)for(const n of [0,2]){
 focus(row.id,stage,n);solve();const english=row.subject==='en';assert.equal(run(english?'englishSession.done':'session.done'),true);const id=tick();assert.equal(run(english?'englishSession.n':'session.n'),n+1);callbacks.get(id).fn();assert.equal(run(english?'englishSession.n':'session.n'),n+1);
}
for(const id of ['storyEquation','paperPuzzle','number','addition','letters']){focus(id);solve();tick();assert.equal(run('session.n'),1)}
for(const [id,set] of [['number',2],['letters',1],['subtraction',1]]){focus(id,id==='letters'?1:0,2,set);solve();tick();assert.equal(run('session.n'),3)}
for(const quiet of [true,false]){
 c.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.noListening='+quiet+';data.sound='+!quiet+';EnglishSteps.reset(person())');focus('englishPictureSentence');assert.ok(run('englishSession.englishStep'));solve();tick();assert.equal(run('englishSession.n'),1);
}
console.log('PASS automatic progression for all thinking stages, interactive answers, paper/story problems and English preparation in both sound modes');
// Wrong/incomplete answers stay put; an eventual correction records only once.
focus('gardenSchedule');const total=run('Practice.skill(person(),foundationById("gardenSchedule")).total');
run("answer(q.choices.findIndex(x=>x!==q.answer),document.createElement('button'))");assert.equal(run('autoNextTimer'),null);assert.equal(run('session.n'),0);solve();tick();assert.equal(run('session.n'),1);assert.equal(run('Practice.skill(person(),foundationById("gardenSchedule")).total'),total+1);
// Navigation, child changes, background tabs and replacement questions cannot inherit a callback.
focus('gardenSchedule');solve();let stale=callbacks.get(run('autoNextTimer')).fn;run('home()');stale();assert.equal(run('view'),'home');
focus('gardenSchedule');solve();stale=callbacks.get(run('autoNextTimer')).fn;run('chooseChild(1)');const other=run('JSON.stringify(person())');stale();assert.equal(run('JSON.stringify(person())'),other);run('chooseChild(0)');
focus('gardenSchedule');solve();stale=callbacks.get(run('autoNextTimer')).fn;document.hidden=true;document.listeners.visibilitychange.forEach(fn=>fn());assert.equal(run('autoNextTimer'),null);stale();assert.equal(run('session.n'),0);document.hidden=false;document.listeners.visibilitychange.forEach(fn=>fn());tick();assert.equal(run('session.n'),1);
focus('gardenSchedule');solve();stale=callbacks.get(run('autoNextTimer')).fn;run('nextQuestion()');solve();const fresh=run('autoNextTimer');stale();assert.equal(run('autoNextTimer'),fresh);assert.equal(run('session.n'),0);tick();assert.equal(run('session.n'),1);
focus('gardenSchedule');solve();stale=callbacks.get(run('autoNextTimer')).fn;run('advance()');stale();assert.equal(run('session.n'),1);
console.log('PASS wrong-answer retry, double-callback protection, home/profile switch, background resume and stale timer isolation');
// Five answers finish each set once and still unlock one tile stage after three subjects.
run('data.noListening=true;data.sound=false;delete person().tileCycle');const coins=run('game().coins'),flowers=run('person().flowers');
for(const id of ['gardenSchedule','gardenEvidence','englishPictureSentence']){
 focus(id);for(let n=0;n<5;n++){solve();tick()}
 assert.equal(run('view'),'result');run(def(id).subject==='en'?'englishFinish()':'finish()');
}
assert.equal(run('game().coins'),coins+30);assert.equal(run('person().flowers'),flowers+3);assert.equal(run('learningCycle().pending'),true);
console.log('PASS 15 automatically advanced answers, one reward per set, saved three-subject completion and tile unlock');
`)(require);
