const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const L=require('./dist/learning-expansion.js'),ids=L.defs.map(d=>d.id),old=d=>!ids.includes(d.id)&&![...run('GardenActivities.lessons'),...c.ThinkingContent.defs].some(x=>x.id===d.id),all=Object.values(L.banks).flat(2);
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const plain=x=>JSON.parse(JSON.stringify(x));
function ready(){run("for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};delete person().practice.lowerPresets.math;delete person().practice.lowerPresets.jp;delete person().tileCycle;person().practiceFlow={freeChoice:true,next:'math'};")}
test('132 questions in 11 stages have unique IDs, choices, source data and kana-only prose',()=>{
 assert.equal(all.length,132);assert.equal(new Set(all.map(q=>q.id)).size,132);
 assert.deepEqual(Object.values(L.banks).map(bs=>bs.map(b=>b.length)),[[12,12],[12,12],[12,12],[12,12],[12,12,12]]);
 for(const q of all){assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.doesNotMatch(q.text+q.hint+q.choices.join('')+(q.passage||''),/[\u3400-\u9fff]/u);assert.doesNotMatch(q.visualHTML||'',/NaN|Infinity|<script/)}
 for(const stages of Object.values(L.banks))for(const bank of stages)assert.equal(new Set(bank.map(q=>q.text+'|'+q.answer+'|'+(q.visualHTML||''))).size,bank.length);
});
test('table and graph answers are independently recalculated from source values',()=>{
 for(const q of [...L.banks.dataTable.flat(),...L.banks.dataBars.flat()]){
  const m=q.meta;let expected;
  if(['table-read','bar-read'].includes(m.kind))expected=m.values[m.target]+m.unit;
  if(m.kind==='table-difference')expected=(m.values[m.a]-m.values[m.b])+m.unit;
  if(m.kind==='table-total')expected=(m.values[m.a]+m.values[m.b])+m.unit;
  if(['table-most','bar-most'].includes(m.kind))expected=m.labels[m.values.indexOf(Math.max(...m.values))];
  if(m.kind==='bar-least')expected=m.labels[m.values.indexOf(Math.min(...m.values))];
  if(m.kind==='bar-reverse')expected=m.labels[m.target];
  assert.equal(q.answer,expected,q.id);
  if(m.kind==='table-total')assert.ok(m.values[m.a]+m.values[m.b]<10,'no hidden carrying');
  if(m.tick){const rects=[...q.visualHTML.matchAll(/<rect x="([\d.]+)" y="([\d.e-]+)" width="42" height="([\d.e-]+)"/g)];assert.equal(rects.length,3);rects.forEach((r,i)=>{const scale=150/(Math.max(...m.values)+m.tick);assert.ok(Math.abs(+r[3]-m.values[i]*scale)<1e-8);assert.ok(Math.abs(+r[2]+ +r[3]-185)<1e-8)})}
 }
});
test('capacity/mass conversions and drawn waterlines/pointers follow independent units and geometry',()=>{
 const units={mL:1,dL:100,L:1000,g:1,kg:1000};
 for(const q of [...L.banks.measureCapacity.flat(),...L.banks.measureMass.flat()]){
  const m=q.meta;
  if(m.kind.endsWith('-unit'))assert.equal(q.answer,m.value*units[m.from]/units[m.to]+m.to);
  if(m.kind.endsWith('-scale'))assert.equal(q.answer,m.value+m.unit);
  if(m.kind==='capacity-scale'){const r=q.visualHTML.match(/<rect x="87" y="([\d.e-]+)" width="141" height="([\d.e-]+)"/);assert.ok(r);assert.ok(Math.abs(+r[2]-15*m.value/m.tick)<1e-9);assert.ok(Math.abs(+r[1]+ +r[2]-190)<1e-9)}
  if(m.kind==='mass-scale'){const r=q.visualHTML.match(/<line data-evidence="measure" x1="160" y1="112" x2="([\d.e-]+)" y2="([\d.e-]+)"/);assert.ok(r);const angle=(-210+24*m.value/m.tick)*Math.PI/180;assert.ok(Math.abs(+r[1]-160-68*Math.cos(angle))<1e-8);assert.ok(Math.abs(+r[2]-112-68*Math.sin(angle))<1e-8)}
 }
});
test('all reading evidence exists literally in the displayed source, and highlights source rows',()=>{
 for(const q of L.banks.readingConditions.flat()){assert.ok(q.evidence.length);q.evidence.forEach(e=>assert.ok(q.passage.includes(e),q.id+':'+e));assert.ok(q.evidenceKeys.length);q.evidenceKeys.forEach(key=>assert.ok(q.visualHTML.includes('data-evidence="'+key+'"')))}
 for(const q of all)for(const key of q.evidenceKeys||[])assert.ok(q.visualHTML.includes('data-evidence="'+key+'"'),q.id+':'+key);
});
test('registration preserves old definitions and IDs; repeat loading is inert',()=>{
 const base=require('./test-shapes-baseline.json');
 assert.deepEqual(plain(P.defs.filter(d=>old(d)&&!c.ShapeExpansion.defs.some(s=>s.id===d.id))),base.defs);
 assert.equal(P.defs.length,base.defs.length+3+5+3+c.ThinkingContent.defs.length);assert.equal(P.defs.filter(d=>!c.ThinkingContent.defs.some(x=>x.id===d.id)).reduce((n,d)=>n+d.courses.length,0),452);
 const before=run('JSON.stringify({data,defs:Practice.defs,topics:TOPICS})');vm.runInContext(fs.readFileSync('dist/learning-expansion.js','utf8'),c);assert.equal(run('JSON.stringify({data,defs:Practice.defs,topics:TOPICS})'),before);
});
test('new lessons default on, while prerequisites and explicit grade bounds still apply',()=>{
 const table=c.PracticePresets.build(P);
 for(const d of L.defs){const def=P.defs.find(x=>x.id===d.id);assert.equal(P.limit({},def),def.courses.length-1);assert.equal(P.allowed({},def),false);assert.deepEqual(plain(table[d.id].map(row=>row.rank)),d.grades.map(g=>g+2))}
 for(const [preset,grade] of [['preschool-older',0],['elementary-one',1],['elementary-two',2],['elementary-3',3]]){
  const p={};c.PracticePresets.apply(p,preset,P);c.PracticePresets.applyLimit(p,preset,P);
  for(const d of L.defs){const def=P.defs.find(x=>x.id===d.id),cap=d.grades.reduce((last,g,i)=>g<=grade?i:last,-1);assert.equal(P.limit(p,def),cap)}
 }
 const p={};c.PracticePresets.apply(p,'elementary-3',P);c.PracticePresets.applyLimit(p,'elementary-3',P);assert.equal(P.pick(p,'math','dataBars').skill,'number');assert.equal(P.pick(p,'jp','readingConditions').skill,'letters');
});
test('existing profiles reach all added fields in normal rotation without setup or rewritten history',()=>{
 const additions=[...L.defs,...run('GardenActivities.lessons'),...c.ThinkingContent.defs];
 for(const lesson of additions){
  const d=P.defs.find(x=>x.id===lesson.id),p={flowers:12,game:{coins:100},stats:{},practice:{version:2,configured:true,settings:{kanji:true,carry:true},skills:{}}};
  const completePrerequisites=def=>{for(const id of def.requires||(def.prerequisite?[def.prerequisite]:[])){const pre=P.defs.find(x=>x.id===id);completePrerequisites(pre);P.skill(p,pre).stages[pre.courses.length-1]={mastered:true}}};
  assert.equal(P.allowed(p,d),false);completePrerequisites(d);
  assert.ok(P.available(p,d.subject).includes(d),d.id);
  P.state(p).rotations[d.subject]=P.available(p,d.subject).indexOf(d);
  const before=JSON.stringify({stats:p.stats,flowers:p.flowers,game:p.game});
  const item=P.pick(p,d.subject);assert.equal(item.skill,d.id);assert.equal(item.index,0);
  assert.deepEqual(plain(P.state(p).limits),{});assert.deepEqual(plain(P.state(p).rangeLimits),{});
  assert.equal(JSON.stringify({stats:p.stats,flowers:p.flowers,game:p.game}),before);
  const restored=JSON.parse(JSON.stringify(p));assert.deepEqual(plain(P.pick(restored,d.subject)),plain(item));
  P.setLimit(p,d.id,-1);assert.ok(!P.available(p,d.subject).includes(d));
  assert.equal(P.limit(JSON.parse(JSON.stringify(p)),d),-1);
  P.setLimit(p,d.id,d.courses.length-1);P.setRange(p,d.id,-1);assert.ok(!P.available(p,d.subject).includes(d));
 }
 const settings=run('practiceSettings()');assert.match(settings,/追加の操作は不要/);assert.match(settings,/追加分野の範囲を変更する（任意）/);assert.doesNotMatch(settings,/あたらしい 問題を追加/);
});
test('parent setup affects only new fields for the chosen child; invalid input does nothing',()=>{
 const originalQuery=document.querySelector,control={value:'3'};document.querySelector=s=>s==='#lessonGrade'?control:originalQuery(s);
 run('parents()');const snapshot=JSON.parse(run('JSON.stringify(data)'));run('enableGardenLessons()');const result=JSON.parse(run('JSON.stringify(data)'));
 assert.deepEqual(result.profiles[1],snapshot.profiles[1]);
 for(const d of P.defs.filter(old)){assert.equal(result.profiles[0].practice.limits[d.id],snapshot.profiles[0].practice.limits[d.id]);assert.equal(result.profiles[0].practice.rangeLimits[d.id],snapshot.profiles[0].practice.rangeLimits[d.id])}
 assert.deepEqual(result.profiles[0].stats,snapshot.profiles[0].stats);assert.deepEqual(result.profiles[0].game,snapshot.profiles[0].game);
 for(const d of L.defs)assert.equal(P.limit(run('person()'),P.defs.find(x=>x.id===d.id)),d.stages.length-1);
 control.value='';const before=run('JSON.stringify(data)');run('enableGardenLessons()');assert.equal(run('JSON.stringify(data)'),before);document.querySelector=originalQuery;
});
test('banks rotate across sets and JSON restore; independent children and skills do not interfere',()=>{
 for(const d of L.defs)for(let stage=0;stage<d.stages.length;stage++)for(const rng of [()=>0,()=>.9999999]){
  let p={},seen=[],picked=new Set();const key=d.id+':'+stage,bank=L.banks[d.id][stage];
  for(let n=0;n<bank.length;n++){if(n%5===0){seen=[];p=JSON.parse(JSON.stringify(p))}const q=L.pick(d.id,stage,p.lessonHistory?.[key]||[],seen,rng);assert.ok(!picked.has(q.id));picked.add(q.id);L.remember(p,q);L.remember(p,q)}
  assert.equal(p.lessonHistory[key].length,bank.length);assert.equal(picked.size,bank.length);const before=JSON.stringify(p);const q=L.pick(d.id,stage,p.lessonHistory[key],[],rng);assert.equal(JSON.stringify(p),before);L.remember(p,q);assert.equal(p.lessonHistory[key].length,1);
 }
 const a={},b={};L.remember(a,{...L.banks.dataTable[0][0]});assert.deepEqual(b,{});L.remember(a,{...L.banks.readingConditions[0][0]});assert.equal(Object.keys(a.lessonHistory).length,2);
});
test('all lessons are reachable on manual and guided routes, with real skill and stage IDs',()=>{
 ready();
 for(const d of L.defs){const def=P.defs.find(x=>x.id===d.id);for(let stage=0;stage<d.stages.length;stage++)for(const auto of [false,true]){
  run('subject='+JSON.stringify(d.subject)+';session={auto:'+auto+',practiceFocus:'+JSON.stringify(d.id)+',seen:{}};Practice.skill(person(),Practice.defs.find(d=>d.id==='+JSON.stringify(d.id)+')).level='+stage+';Practice.state(person()).turns[subject]=0');
  const set=new Set();for(let n=0;n<12;n++){const q=run('makeQuestion('+def.courses[stage]+')');assert.equal(q.skill,d.id);assert.equal(q.stage,stage);assert.equal(q.i,def.courses[stage]);assert.ok(!set.has(q.id));set.add(q.id);if(auto)assert.equal(run('practiceItem.skill'),d.id)}
 }}
});
test('wrong answer then correction persists one rotation and one attempt; hint highlights evidence',()=>{
 ready();run("subject='jp';Practice.skill(person(),Practice.defs.find(d=>d.id==='readingConditions')).level=0;startSelectedPractice('readingConditions');practiceClock.start-=2000");
 const id=run('q.id');run("answer(q.choices.findIndex(x=>x!==q.answer),document.createElement('button'))");const turns=run('person().practice.turns.jp');
 assert.equal(run('person().lessonHistory["readingConditions:0"].filter(x=>x==='+JSON.stringify(id)+').length'),1);
 run("answer(q.choices.indexOf(q.answer),document.createElement('button'));answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('person().practice.turns.jp'),turns);
 const recent=run("Practice.skill(person(),Practice.defs.find(d=>d.id==='readingConditions')).stages[0].recent");assert.equal(recent.at(-1).example,id);assert.equal(!!recent.at(-1).ok,false);
 assert.ok(JSON.parse(storage.get('kazunoniwa-v1')).profiles[0].lessonHistory['readingConditions:0'].includes(id));
});
test('new math and Japanese lessons still complete the 15-question reward cycle exactly once',()=>{
 ready();run('data.noListening=true;data.sound=false;data.music=false;delete person().tileCycle');const coins=run('person().game.coins'),flowers=run('person().flowers');
 for(const [kind,id] of [['math','dataBars'],['jp','readingConditions'],['en','enWords']]){
  run('subject='+JSON.stringify(kind));run(kind==='en'?'startEnglish()':'startSelectedPractice('+JSON.stringify(id)+')');
  for(let n=0;n<5;n++){run('practiceClock.start-=2000');run(kind==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}
  assert.equal(run('view'),'result');
 }
 assert.equal(run('person().game.coins'),coins+30);assert.equal(run('person().flowers'),flowers+3);assert.equal(run('person().tileCycle.pending'),true);
 run('finish();englishFinish()');assert.equal(run('person().game.coins'),coins+30);
});
console.log(count+' lesson expansion tests passed');
`)(require);
