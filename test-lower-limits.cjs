const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
const R=c.PracticePresets,L=c.PracticeLowerLimits,def=id=>P.defs.find(d=>d.id===id),copy=x=>JSON.parse(JSON.stringify(x));
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const fresh=()=>({name:'Synthetic',stats:{7:{total:20,ok:19}},flowers:10,game:{coins:90,growth:12,owned:['crown']},tileCycle:{version:1,round:2,stage:2,done:{math:true}}});
test('old starting range alone was a ceiling; explicit lower limit now raises actual questions',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);assert.equal(P.pick(p,'math').skill,'number');assert.equal(P.pick(p,'math').index,0);
 assert.ok(L.apply(p,'elementary-two'));assert.notEqual(P.pick(p,'math').skill,'number');assert.notEqual(P.pick(p,'jp').skill,'letters');assert.equal(P.pick(p,'en').index,8);
});
test('no implicit placement or changed questions for existing saves',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);const saved=copy(p);assert.equal(L.selected(saved),'none');assert.equal(P.pick(saved,'math').index,0);assert.equal(P.pick(saved,'jp').index,0);assert.equal(P.pick(saved,'en').index,0);
});
test('every preset and subject stays inside effective floor and ceiling in all selection modes',()=>{
 for(const preset of R.presets){const p=fresh();P.state(p).settings={kanji:true,carry:true};L.apply(p,preset.id);
  for(const kind of ['math','jp','en']){const b=L.bounds(p,kind),ds=P.available(p,kind);assert.ok(ds.length,preset.id+':'+kind);
   for(const d of ds)for(let turn=0;turn<10;turn++){P.state(p).turns[kind]=turn;const item=P.pick(p,kind,d.id);assert.equal(item.skill,d.id);assert.ok(item.index>=P.floor(p,d));assert.ok(item.index<=P.ceiling(p,d));assert.ok(R.build(P)[d.id][item.index].low>=b.effective,preset.id+':'+d.id)}
  }
 }
});
test('review, repeated mistakes and stale low estimate cannot slip below minimum',()=>{
 const p=fresh();L.apply(p,'preschool-middle');const d=def('number');
 for(let n=0;n<30;n++){P.record(p,{...P.pick(p,'math','number'),example:'miss'},false,2000);assert.equal(P.skill(p,d).level,1);assert.ok(P.pick(p,'math','number').index>=1)}
 P.skill(p,d).level=0;P.state(p).turns.math=5;assert.equal(P.pick(p,'math','number').index,1);assert.equal(P.skill(p,d).level,1);
});
test('explicit placement never invents answers, mastery, coins or tile progress',()=>{
 const p=fresh(),before=JSON.stringify(p);R.apply(p,'preschool-younger',P);L.apply(p,'junior-range');
 for(const s of Object.values(P.state(p).skills)){assert.equal(s.total,0);assert.deepEqual(copy(s.stages),{})}
 const {practice,...rest}=p;assert.equal(JSON.stringify(rest),before);assert.equal(P.mastered(p,def('number')),false);assert.equal(P.mastered(p,def('enReply')),false);
});
test('lower and upper settings are independent; caps and permission switches still win',()=>{
 const p=fresh();R.apply(p,'preschool-younger',P);R.applyLimit(p,'preschool-younger',P);const kept=JSON.stringify([P.state(p).limits,P.state(p).settings]);L.apply(p,'junior-range');assert.equal(JSON.stringify([P.state(p).limits,P.state(p).settings]),kept);
 for(const kind of ['math','jp','en']){assert.equal(L.bounds(p,kind).effective,0);assert.equal(P.pick(p,kind).index,0);assert.match(L.description(p,kind),/現在は年少/)}
 R.applyLimit(p,'unlimited',P);for(const kind of ['math','jp'])for(const d of P.available(p,kind))assert.ok(!d.kanji&&!d.carry);
});
test('subject-only lower settings leave all other subjects and the other child untouched',()=>{
 for(const kind of ['math','jp','en']){const p=fresh(),other=fresh(),before=JSON.stringify(other);for(const d of P.defs)P.skill(p,d);
 const a=P.state(p),unrelated=()=>JSON.stringify(P.defs.filter(d=>d.subject!==kind).map(d=>[a.skills[d.id],a.rangeLimits[d.id],a.lowerPresets[d.subject]])),prior=unrelated();L.apply(p,'elementary-two',kind);assert.equal(unrelated(),prior);assert.equal(JSON.stringify(other),before);assert.equal(L.selected(p,kind),'elementary-two');assert.equal(L.selected(p),'custom')}
});
test('invalid scope and preset do not mutate even an unmigrated profile',()=>{
 for(const [id,scope] of [['custom','all'],['missing','all'],['elementary-one','missing'],['none',null]]){const p=fresh(),before=JSON.stringify(p);assert.equal(L.apply(p,id,scope),false);assert.equal(JSON.stringify(p),before)}
});
test('save and restore, malformed values, disabling and easy restart are safe',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);L.apply(p,'preschool-middle','math');L.apply(p,'elementary-one','en');const restored=copy(p);
 for(const kind of ['math','jp','en'])assert.deepEqual(copy(P.pick(restored,kind)),copy(P.pick(p,kind)));
 P.state(restored).lowerPresets={math:'not-a-preset',jp:99,en:null};assert.equal(L.selected(restored),'none');assert.equal(P.pick(restored,'math').skill,'number');
 L.apply(p,'none');assert.equal(L.selected(p),'none');L.apply(p,'elementary-two');P.configure(p,null,true);assert.equal(L.selected(p),'none');assert.equal(P.pick(p,'math').index,0);assert.equal(p.game.coins,90);assert.equal(P.state(p).estimateHistory.at(-1).lowerPresets.math,'elementary-two');
});
test('full application reload restores explicit lower placement for both profiles',()=>{
 const saved=JSON.parse(storage.get('kazunoniwa-v1'));saved.noListening=true;saved.sound=false;saved.music=false;
 for(const p of saved.profiles){R.apply(p,'elementary-two',P);L.apply(p,'elementary-two')}
 storage.set('kazunoniwa-v1',JSON.stringify(saved));const reloaded={...c};reloaded.window=reloaded;vm.createContext(reloaded);
 for(const m of fs.readFileSync('dist/index.html','utf8').matchAll(/<script(?:\\s+src="([^"]+)")?[^>]*>([\\s\\S]*?)<\\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],reloaded);
 const values=vm.runInContext("data.profiles.map(p=>({lower:PracticeLowerLimits.selected(p),math:Practice.pick(p,'math').skill,en:Practice.pick(p,'en').index}))",reloaded);
 for(const v of values){assert.equal(v.lower,'elementary-two');assert.notEqual(v.math,'number');assert.equal(v.en,8)}
});
test('advancement requires observed stability only from the chosen floor, not fabricated earlier mastery',()=>{
 const p=fresh();R.apply(p,'elementary-one',P);L.apply(p,'elementary-one');const d=def('enWords'),s=P.skill(p,d);s.level=7;
 for(let index=4;index<=7;index++)s.stages[index]={mastered:true,attempts:10,firstCorrect:10,recent:Array.from({length:10},(_,i)=>({ok:1,example:String(i%4),variant:'select',session:Math.floor(i/5)}))};
 assert.equal(P.floor(p,d),4);assert.equal(R.advance(p,d,P),true);assert.equal(P.limit(p,d),11);assert.equal(s.stages[0],undefined);
});
test('range report and manual route cannot advertise or enter an excluded easier skill',()=>{
 run("home();data.profiles[0]={name:'Synthetic',stats:{},flowers:0};data.current=0;PracticePresets.apply(person(),'elementary-two',Practice);PracticeLowerLimits.apply(person(),'elementary-two');Practice.state(person()).recentItems.math=[{skill:'number',index:0}]");
 assert.notEqual(R.range(run('person()'),'math',P).stages[0].id,'number');run("start(foundationById('number').courses[0],false)");assert.equal(run('session.auto'),true);assert.notEqual(run('practiceItem.skill'),'number');
 run("home();person().practiceFlow.freeChoice=true;startSelectedPractice('number')");assert.equal(run('view'),'home');
});
const query=document.querySelector,controls=new Map();document.querySelector=s=>s.startsWith('#practiceLower')?(controls.has(s)?controls.get(s):(controls.set(s,element()),controls.get(s))):query(s);
function choose(scope,id){document.querySelector('#practiceLowerScope').value=scope;document.querySelector('#practiceLowerPreset').value=id}
test('UI requires Apply and remains inert outside parent; repeat and profile switch preserve data',()=>{
 run('parents()');let before=run('JSON.stringify(data)');choose('all','elementary-two');run('refreshPracticeLowerButton()');assert.equal(run('JSON.stringify(data)'),before);run("view='home';applyPracticeLowerLimit()");assert.equal(run('JSON.stringify(data)'),before);
 run('parents()');const other=run('JSON.stringify(data.profiles[1])');run('applyPracticeLowerLimit()');assert.equal(run('PracticeLowerLimits.selected(person())'),'elementary-two');assert.equal(run('JSON.stringify(data.profiles[1])'),other);
 before=run('JSON.stringify(person())');run('applyPracticeLowerLimit()');assert.equal(run('JSON.stringify(person())'),before);
 run('data.current=1;parents()');choose('en','preschool-middle');run('applyPracticeLowerLimit()');assert.equal(run('PracticeLowerLimits.selected(person(),"en")'),'preschool-middle');assert.equal(run('PracticeLowerLimits.selected(data.profiles[0])'),'elementary-two');
 assert.equal(JSON.parse(storage.get('kazunoniwa-v1')).profiles[1].practice.lowerPresets.en,'preschool-middle');
});
test('actual quiet questions respect lower settings and complete the unchanged 15-question tile cycle',()=>{
 run("home();data.profiles[0]={name:'Synthetic',stats:{},flowers:0};data.current=0;setNoListening(true);PracticePresets.apply(person(),'elementary-two',Practice);PracticeLowerLimits.apply(person(),'elementary-two');home()");const coins=run('game().coins');
 for(const kind of ['math','jp','en']){run(kind==='en'?'startEnglish()':"start(recommendationFor('"+kind+"'),true)");
  for(let n=0;n<5;n++){const item=run('practiceItem');assert.ok(item.index>=P.floor(run('person()'),def(item.skill)));assert.ok(!run('Object.keys(curriculumAudioFallback)').includes(item.skill));run('practiceClock.start-=2000');run(kind==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}
  assert.equal(run('view'),'result');
 }
 assert.equal(run('learningCycle().pending'),true);assert.equal(run('person().flowers'),3);assert.equal(run('game().coins'),coins+30);run('finish();englishFinish()');assert.equal(run('game().coins'),coins+30);
});
test('higher listening fallback honors its independent lower bound and cap in quiet mode',()=>{
 run("home();data.profiles[0]={name:'Synthetic',stats:{},flowers:0};data.current=0;setNoListening(true);PracticeLowerLimits.apply(person(),'junior-range','en');home()");
 const id='junior_listening',fallback=run("curriculumAudioFallback['junior_listening']");assert.ok(fallback);
 run("curriculumRequestedFocus='junior_listening';startEnglish()");assert.equal(run('practiceItem.skill'),fallback);assert.equal(run('englishSession.readingAlternative'),true);assert.ok(run('practiceItem.index')>=P.floor(run('person()'),def(fallback)));
 P.setLimit(run('person()'),fallback,-1);run("home();curriculumRequestedFocus='junior_listening';startEnglish()");assert.notEqual(run('practiceItem.skill'),fallback);assert.ok(!run('Object.keys(curriculumAudioFallback)').includes(run('practiceItem.skill')));
});
test('UI clearly distinguishes lower bound, old range, fallback and preserved permissions',()=>{
 const html=run('practiceSettings()');assert.match(html,/難易度の下限を一括設定/);assert.match(html,/id="practiceLowerApply"/);assert.match(html,/開始範囲の設定（出題範囲の上端）/);assert.match(html,/習得済みにはしません/);assert.match(html,/上限と漢字・くり上がりの許可を優先/);
});
console.log(count+' lower-limit tests passed');
`)(require);
