const fs=require('node:fs');
const C=require('./dist/thinking-content.js');
const assert=require('node:assert/strict');
let items=0;
for(const d of C.defs)for(const [stage,bank] of C.banks[d.id].entries()){
 const ids=new Set();
 for(const q of bank){
  items++;assert.ok(!ids.has(q.id));ids.add(q.id);
  if(q.choices){const keys=q.choices.map(x=>Array.isArray(x)?x[0]:x);assert.equal(new Set(keys).size,keys.length,q.id);assert.equal(keys.filter(x=>x===q.answer).length,1,q.id)}
  if(q.thinkingKind==='pattern'){
   const {pattern,sequence}=q.meta;const offsets=pattern.map((_,offset)=>offset).filter(offset=>sequence.every((x,i)=>x===pattern[(i+offset)%pattern.length]));
   assert.ok(offsets.length);assert.ok(offsets.every(offset=>pattern[(sequence.length+offset)%pattern.length]===q.answer));
  }
  if(q.thinkingKind==='detective'){
   const m=q.meta,value=m.op==='＋'?m.a+m.b:m.a-m.b;
   assert.equal(m.correct,value);assert.equal(m.error==='ok',m.shown===value);
   if(m.error==='tens'){assert.equal(m.shown%10,value%10);assert.notEqual(Math.floor(m.shown/10),Math.floor(value/10))}
   if(m.error==='ones'){assert.equal(Math.floor(m.shown/10),Math.floor(value/10));assert.notEqual(m.shown%10,value%10)}
  }
  if(q.thinkingKind==='remainder'){
   const m=q.meta;
   if(m.kind==='car'){assert.ok(m.value*m.each>=m.total);assert.ok((m.value-1)*m.each<m.total)}
   else{assert.ok(m.value*m.each<=m.total);assert.ok((m.value+1)*m.each>m.total)}
   assert.equal(stage===0,m.total%m.each===0);
  }
  if(q.thinkingKind==='schedule'){const m=q.meta;assert.equal(m.start+m.duration+m.travel,m.end);assert.ok(m.start>0&&m.end<720);assert.equal(q.answer,C.time(m.start))}
  if(q.thinkingKind==='evidence'){assert.equal(q.passage.length,stage+2);assert.ok(q.passage[q.evidence]);assert.equal(/[\u3400-\u9fff]/u.test(q.text+q.passage.join('')+q.choices.join('')),false)}
  if(q.thinkingKind==='englishBuild')assert.equal(q.tokens.join(' '),q.answer);
 }
}
console.log('PASS '+items+' new items: independent arithmetic, remainders, schedules, patterns, unique answers, kana and English');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const T=run('ThinkingActivities'),C=run('ThinkingContent'),def=id=>P.defs.find(d=>d.id===id),btn=()=>document.createElement('button');
for(const preset of c.PracticePresets.presets){const p={};c.PracticePresets.applyLimit(p,preset.id,P);c.PracticePresets.apply(p,preset.id,P);for(const d of C.defs){const expected=d.grades.reduce((cap,g,i)=>g+2<=preset.rank?i:cap,-1);assert.equal(P.limit(p,def(d.id)),expected)}}
for(const d of C.defs){assert.equal(P.limit({},def(d.id)),def(d.id).courses.length-1);assert.equal(P.allowed({},def(d.id)),false)}
const settings=run('practiceSettings()');
assert.match(settings,/<option value="0">年長相当/);assert.match(settings,/<option value="1">小学1年相当/);
assert.doesNotMatch(settings,/<\/option\s+value=/);
const otherProfile=run('JSON.stringify(data.profiles[1])'),originalQuery=document.querySelector;
document.querySelector=s=>s==='#lessonGrade'?{value:'0'}:originalQuery(s);
run("view='parent';enableGardenLessons()");
assert.equal(P.limit(run('person()'),def('gardenPattern')),2);
for(const d of C.defs.filter(x=>x.id!=='gardenPattern'))assert.equal(P.limit(run('person()'),def(d.id)),-1);
assert.equal(run('JSON.stringify(data.profiles[1])'),otherProfile);document.querySelector=originalQuery;
run("for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}person().practice.settings.kanji=true;person().practice.settings.carry=true;person().practiceFlow={freeChoice:true,next:'math'};Practice.setGentle(person(),true);data.sound=false;data.noListening=true");
function focus(id,stage,set=0,n=0){
 const d=def(id),p=run('person()'),s=P.skill(p,d);Object.assign(s,{level:stage,support:0,misses:0});delete s.gentleBridge;delete s.pendingGentle;
 P.state(p).turns[d.subject]=0;P.state(p).sessions[d.subject]=set;
 run('home();startSelectedPractice('+JSON.stringify(id)+')');
 if(n)run(d.subject==='en'?'englishSession.n='+n+';englishNext()':'session.n='+n+';nextQuestion()');
 assert.equal(run('practiceItem.skill'),id);
}
focus('number',0,2,2);assert.equal(run('q.thinkingKind'),'match');
let q=run('q'),total=run('Practice.skill(person(),foundationById("number")).total');
T.submit(btn());assert.equal(run('session.done'),false);assert.equal(run('Practice.skill(person(),foundationById("number")).total'),total+1);
T.toggle(0);T.toggle(0);assert.equal(q.matchSlots.filter(Boolean).length,0);
for(let i=0;i<q.answer;i++)T.toggle(i);T.submit(btn());assert.equal(run('session.done'),true);T.toggle(0);T.submit(btn());
assert.equal(run('Practice.skill(person(),foundationById("number")).total'),total+1);assert.equal(run('person().practice.thinkingFormats.match.clean'),0);
for(const [id,stage,set,kind] of [['subtraction',0,1,'hidden'],['letters',1,1,'assemble'],['katakana',0,1,'assemble']]){
 for(let n=0;n<5;n++){
  focus(id,stage,set,n);assert.equal(!!run('q.thinkingKind'),n===2);
  if(n!==2)continue;
  q=run('q');assert.equal(q.thinkingKind,kind);
  if(kind==='hidden'){assert.equal(q.answer,q.meta.total-q.meta.visible);assert.ok(q.meta.total<=3)}
  else{
   assert.equal(q.requiredLength,2);assert.ok(q.tokens.length===2);
   const chosen=[];for(const ch of q.answer){const i=q.tokens.findIndex((x,k)=>x===ch&&!chosen.includes(k));chosen.push(i);T.token(i)}
   T.token(chosen[0]);assert.equal(q.selectedTokens.length,1);T.token(chosen[0]);
   q.selectedTokens=[];for(const i of chosen)T.token(i);T.submit(btn());assert.equal(run('session.done'),true);
  }
 }
}
console.log('PASS age limits, first-attempt accounting, one interactive early item per gentle set, reversible touch and kana cards');
for(const id of ['gardenDetective','gardenEvidence']){
 focus(id,0,0,2);q=run('q');assert.ok(q.interactive);const s=P.skill(run('person()'),def(id)),before=s.total;
 T.select(q.responseChoices.findIndex(x=>x!==q.responseAnswer));T.submit(btn());assert.equal(q.phase,1);assert.equal(s.total,before);
 T.detail(0);T.submit(btn());assert.equal(s.total,before+1);assert.equal(run('session.done'),false);assert.equal(q.phase,0);
 T.select(q.responseChoices.indexOf(q.responseAnswer));T.submit(btn());T.back();assert.equal(q.phase,0);T.submit(btn());
 T.detail(id==='gardenEvidence'?q.evidence:q.corrections.indexOf(q.meta.correct));T.submit(btn());assert.equal(run('session.done'),true);T.submit(btn());assert.equal(s.total,before+1);assert.equal(s.stages[0].recent.at(-1).ok,0);
}
focus('gardenPattern',2,0,2);q=run('q');T.select(q.choices.indexOf(q.answer));T.submit(btn());assert.equal(run('session.done'),true);
for(const id of ['gardenDetective','gardenEvidence','gardenPattern'])for(const n of [0,1,3,4]){focus(id,0,0,n);assert.equal(run('q.interactive'),false)}
console.log('PASS multi-step answers grade once, wrong evidence is not clean success, retry/back and pattern planting');
for(const quiet of [true,false]){
 c.speechSynthesis={cancel(){},getVoices(){return []},speak(){}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.noListening='+quiet+';data.sound='+!quiet);
 for(const id of ['gardenEnglishPhrase','gardenEnglishBuild'])for(const stage of [0,1])for(let n=0;n<5;n++){
  focus(id,stage,0,n);const e=run('englishSession'),item=e.thinking;assert.equal(e.readingAlternative,quiet);assert.equal(run('practiceItem.skill'),id);
  if(id==='gardenEnglishBuild'){
   assert.equal(item.interactive,n===2);
   if(item.interactive){
    const s=P.skill(run('person()'),def(id)),before=s.total;
    const correct=C.banks[id][stage].find(x=>x.id===item.id).tokens;
    correct.slice().reverse().forEach(t=>T.englishToken(item.tokens.indexOf(t)));T.englishSubmit(btn());assert.equal(e.done,false);assert.equal(s.total,before+1);
    for(const i of [...item.selectedTokens])T.englishToken(i);for(const t of correct)T.englishToken(item.tokens.indexOf(t));T.englishSubmit(btn());assert.equal(e.done,true);T.englishSubmit(btn());assert.equal(s.total,before+1);
   }
  }else assert.equal(e.choices.length,stage?3:2);
 }
}
console.log('PASS phrase and English card activities in sound/quiet modes, two/three chunks, retries, no duplicate records');
run('data.noListening=true;data.sound=false;delete person().tileCycle');
const coins=run('person().game.coins'),flowers=run('person().flowers');
for(const id of ['gardenSchedule','gardenEvidence','gardenEnglishBuild']){
 focus(id,0);
 for(let n=0;n<5;n++){
  run('practiceClock.start-=2000');
  if(id==='gardenEnglishBuild')run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()");
  else run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
 }assert.equal(run('view'),'result');
}
assert.equal(run('person().game.coins'),coins+30);assert.equal(run('person().flowers'),flowers+3);assert.equal(run('person().tileCycle.pending'),true);
run('finish();englishFinish()');assert.equal(run('person().game.coins'),coins+30);
const saved=JSON.parse(storage.get('kazunoniwa-v1'));assert.ok(saved.profiles[0].practice.thinkingFormats);assert.equal(saved.profiles[1].practice?.thinkingFormats,undefined);
for(const id of ['gardenDetective','gardenSchedule']){P.state(run('person()')).settings.carry=false;assert.equal(P.allowed(run('person()'),def(id)),false)}
console.log('PASS complete three-subject reward, duplicate finish guard, saved per-child progress and carry permissions');
`)(require);
