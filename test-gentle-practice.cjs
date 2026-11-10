const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const copy=x=>JSON.parse(JSON.stringify(x)),def=id=>P.defs.find(d=>d.id===id);
function fresh(){const p={stats:{},flowers:8,game:{coins:50,owned:['crown']}};P.setGentle(p,true);return p}
function set(p,id,answers=[true,true,true,true,true],ms=2000){
 const d=def(id),items=[];P.beginSet(p,d.subject);
 for(let n=0;n<5;n++){
  const item=P.pick(p,d.subject,id);items.push(item.index);
  P.record(p,{...item,example:'example-'+n%4,variant:'regular'},answers[n],ms);
 }
 P.complete(p,d.subject);return items;
}
function promoteNumber(){const p=fresh();for(let i=0;i<3;i++)set(p,'number');assert.equal(P.skill(p,def('number')).level,1);return p}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
test('normal mode stays unchanged; gentle mode requires 15 varied answers across three sets',()=>{
 const normal={};for(let i=0;i<2;i++)set(normal,'number');assert.equal(P.skill(normal,def('number')).level,1);
 const p=fresh();for(let i=0;i<2;i++)set(p,'number');assert.equal(P.skill(p,def('number')).level,0);
 P.beginSet(p,'math');for(let n=0;n<5;n++){const item=P.pick(p,'math','number');P.record(p,{...item,example:'example-'+n%4},true,2000);assert.equal(P.skill(p,def('number')).level,0)}
 assert.equal(P.mastered(p,def('number'),0),false);P.complete(p,'math');assert.equal(P.skill(p,def('number')).level,1);
});
test('new level appears once then twice; a miss holds the introduction and repeated misses step back',()=>{
 const p=promoteNumber();assert.deepEqual(set(p,'number'),[0,0,0,0,1]);
 assert.deepEqual(set(p,'number',[true,true,true,false,true]),[0,0,0,1,1]);
 assert.deepEqual(set(p,'number'),[0,0,0,1,1]);assert.equal(P.skill(p,def('number')).gentleBridge,undefined);
 P.beginSet(p,'math');for(let n=0;n<2;n++)P.record(p,{skill:'number',index:1,example:'hard-'+n},false,2000);
 assert.equal(P.skill(p,def('number')).level,0);assert.equal(P.skill(p,def('number')).support,1);
});
test('an interrupted set or reload restarts the gentle mix without skipping to hard questions',()=>{
 let p=promoteNumber();P.beginSet(p,'math');for(let n=0;n<3;n++){const item=P.pick(p,'math','number');P.record(p,{...item,example:'old-'+n},true,2000)}
 p=copy(p);assert.deepEqual(set(p,'number'),[0,0,0,0,1]);
 p=copy(p);assert.deepEqual(set(p,'number'),[0,0,0,1,1]);
});
test('hints, repeated examples, rapid taps and insufficient independent success do not promote',()=>{
 for(const mode of ['hint','same','fast','two-misses']){
  const p=fresh();for(let block=0;block<3;block++){
   P.beginSet(p,'math');for(let n=0;n<5;n++){const item=P.pick(p,'math','number');P.record(p,{...item,example:mode==='same'?'same':'example-'+n%4},!(mode==='hint'&&n===4||mode==='two-misses'&&n===4&&block<2),mode==='fast'?100:2000)}P.complete(p,'math');
  }
  assert.equal(P.skill(p,def('number')).level,0,mode);
 }
 const slow=fresh();for(let n=0;n<3;n++)set(slow,'number',undefined,100000);assert.equal(P.skill(slow,def('number')).level,1);
});
test('lowering limits cancels pending advancement and no gentle review crosses a parent floor',()=>{
 const p=promoteNumber();P.setLimit(p,'number',0);assert.equal(P.skill(p,def('number')).gentleBridge,undefined);for(let i=0;i<8;i++)set(p,'number');assert.equal(P.pick(p,'math','number').index,0);
 const q=promoteNumber();c.PracticeLowerLimits.apply(q,'preschool-middle','math');for(let n=0;n<10;n++){const item=P.pick(q,'math');assert.ok(item.index>=P.floor(q,def(item.skill)))}
});
test('starting-range advancement also uses gentle evidence and adds only one level at a set boundary',()=>{
 const p=fresh();c.PracticePresets.apply(p,'preschool-younger',P);
 for(let n=0;n<2;n++)set(p,'number');assert.equal(P.limit(p,def('number')),0);
 set(p,'number');assert.equal(P.skill(p,def('number')).level,1);assert.equal(P.limit(p,def('number')),2);
 assert.deepEqual(set(p,'number'),[0,0,0,0,1]);
});
test('easy start preserves other children, earned rewards, answers and caps while releasing lower placement',()=>{
 run('home();parents()');
 run("PracticeLowerLimits.apply(person(),'elementary-two');Practice.setLimit(person(),'number',1);Practice.state(person()).settings.kanji=true");
 const other=run('JSON.stringify(data.profiles[1])'),kept=run('JSON.stringify({stats:person().stats,flowers:person().flowers,game:person().game,tileCycle:person().tileCycle,limits:person().practice.limits})');
 run('startGentlePractice()');assert.equal(run('Practice.gentle(person())'),true);
 assert.equal(run('JSON.stringify({stats:person().stats,flowers:person().flowers,game:person().game,tileCycle:person().tileCycle,limits:person().practice.limits})'),kept);
 assert.equal(run('JSON.stringify(data.profiles[1])'),other);assert.equal(run('Object.keys(person().practice.lowerPresets).length'),0);
 for(const subject of ['math','jp','en'])assert.equal(run("Practice.pick(person(),'"+subject+"').index"),0);
 assert.ok(run("practiceSettings().includes('ゆっくり練習：ON')"));
 const restored=JSON.parse(storage.get('kazunoniwa-v1'));assert.equal(P.gentle(restored.profiles[0]),true);assert.equal(P.gentle(restored.profiles[1]),false);
 const level=run('Practice.skill(person(),Practice.defs[0]).level');run('stopGentlePractice()');assert.equal(run('Practice.gentle(person())'),false);assert.equal(run('Practice.skill(person(),Practice.defs[0]).level'),level);
});
test('three subjects still award one tile stage, with unchanged first-answer and duplicate-reward behavior',()=>{
 run('parents();startGentlePractice();delete person().tileCycle');
 const coins=run('person().game.coins'),flowers=run('person().flowers');
 for(const subject of ['math','jp','en']){
  run(subject==='en'?'startEnglish()':"start(recommendationFor('"+subject+"'),true)");
  for(let n=0;n<5;n++){
   assert.equal(run('practiceItem.index'),0);run('practiceClock.start-=2000');
   run(subject==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
  }
  assert.equal(run('view'),'result');
 }
 assert.equal(run('person().game.coins'),coins+30);assert.equal(run('person().flowers'),flowers+3);assert.equal(run('learningCycle().pending'),true);
 run('finish();englishFinish()');assert.equal(run('person().game.coins'),coins+30);
});
test('real math, Japanese and English rendering honor the one-new-question bridge and recover after reload',()=>{
 for(const [subject,id] of [['math','number'],['jp','letters'],['en','enWords']]){
  run('delete person().tileCycle;home();parents();startGentlePractice()');
  const p=run('person()');for(let n=0;n<3;n++)set(p,id);
  run(subject==='en'?'startEnglish()':"start(recommendationFor('"+subject+"'),true)");
  const seen=[];for(let n=0;n<5;n++){
   seen.push(run('practiceItem.index'));run('practiceClock.start-=2000');
   run(subject==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
  }
  assert.deepEqual(seen,[0,0,0,0,1],subject);
  assert.equal(P.gentle(JSON.parse(storage.get('kazunoniwa-v1')).profiles[0]),true);
 }
});
console.log(passed+' gentle-practice tests passed');
`)(require);
