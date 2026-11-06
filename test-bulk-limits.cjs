const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
const R=c.PracticePresets,copy=x=>JSON.parse(JSON.stringify(x)),def=id=>P.defs.find(d=>d.id===id);
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const fresh=()=>({name:'Synthetic',stats:{7:{ok:19,total:20,mastered:true}},flowers:10,game:{coins:90,growth:12,owned:['crown']},tileCycle:{version:1,round:2,stage:2,done:{math:true},reward:{token:'synthetic',stage:2}}});
test('every grade cap covers all skills using the same grade map',()=>{
 for(const preset of R.presets){const p=fresh();assert.ok(R.applyLimit(p,preset.id,P));for(const d of P.defs)assert.equal(P.absoluteLimit(p,d),preset.limits[d.id]??(d.prerequisite?-1:0),preset.id+':'+d.id)}
});
test('bulk caps preserve start ranges, permissions, advancement, history, coins and tile progress',()=>{
 const p=fresh(),other=fresh(),before=JSON.stringify(p),beforeOther=JSON.stringify(other);R.apply(p,'elementary-two',P);
 const a=P.state(p);a.rangeProgress.addition={status:'advanced',from:'a',to:'b'};a.settings.carry=false;
 const kept=()=>JSON.stringify([a.rangeLimits,a.initialRanges,a.rangeProgress,a.autoAdvance,a.settings,a.rangePreset]);const previous=kept();
 for(const id of ['preschool-younger','elementary-one','unlimited']){assert.ok(R.applyLimit(p,id,P));assert.equal(kept(),previous);const {practice,...rest}=p;assert.equal(JSON.stringify(rest),before);assert.equal(JSON.stringify(other),beforeOther)}
});
test('subject-only cap preserves other subjects and their skill evidence',()=>{
 for(const subject of ['math','jp','en']){const p=fresh();R.apply(p,'junior-range',P);for(const d of P.defs){P.skill(p,d).level=d.courses.length-1;P.skill(p,d).stages[0]={mastered:true,recent:[{ok:1}]}}
 const unrelated=P.defs.filter(d=>d.subject!==subject),previous=JSON.stringify(unrelated.map(d=>[P.absoluteLimit(p,d),P.skill(p,d)]));
 assert.ok(R.applyLimit(p,'preschool-younger',P,subject));assert.equal(JSON.stringify(unrelated.map(d=>[P.absoluteLimit(p,d),P.skill(p,d)])),previous);
 for(const d of P.defs.filter(d=>d.subject===subject))assert.equal(P.absoluteLimit(p,d),R.presets[0].limits[d.id]??(d.prerequisite?-1:0))}
});
test('invalid scope and preset are true no-ops even on unmigrated profiles',()=>{
 for(const [id,scope] of [['missing','all'],['custom','all'],['elementary-one','missing'],['unlimited',''],['unlimited',null]]){const p=fresh(),before=JSON.stringify(p);assert.equal(R.applyLimit(p,id,P,scope),false);assert.equal(JSON.stringify(p),before)}
});
test('lowering then raising cannot bypass prerequisites or revive high mastery',()=>{
 const p=fresh();R.apply(p,'junior-range',P);for(const d of P.defs){const s=P.skill(p,d);s.level=d.courses.length-1;s.total=100;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:100,firstCorrect:99,recent:[{ok:1}]})}
 R.applyLimit(p,'preschool-younger',P);for(const subject of ['math','jp','en'])for(let turn=0;turn<10;turn++){P.state(p).turns[subject]=turn;const item=P.pick(p,subject);assert.equal(item.index,0);assert.ok(['number','letters','enWords'].includes(item.skill))}
 R.applyLimit(p,'unlimited',P);assert.equal(P.skill(p,def('number')).level,0);assert.equal(P.mastered(p,def('number')),false);assert.equal(P.pick(p,'math','mathCarry').skill,'number');assert.equal(P.skill(p,def('number')).total,100);assert.equal(P.skill(p,def('number')).stages[2].firstCorrect,99);
});
test('bulk cap prevents automatic advancement and remains after starting preset changes',()=>{
 const p=fresh();R.apply(p,'preschool-younger',P);R.applyLimit(p,'preschool-younger',P);
 const s=P.skill(p,def('number'));s.stages[0]={mastered:true,attempts:10,firstCorrect:10,recent:Array.from({length:10},(_,i)=>({ok:1,example:String(i%3),variant:'count',session:Math.floor(i/5)}))};
 assert.equal(R.advance(p,def('number'),P),false);assert.match(P.state(p).rangeProgress.number.reason,/絶対上限/);
 R.apply(p,'junior-range',P);assert.equal(P.absoluteLimit(p,def('number')),0);assert.equal(P.limit(p,def('number')),0);
});
test('selected cap reflects actual per-skill limits and per-subject differences',()=>{
 const p=fresh();assert.equal(R.selectedLimit(p,P),'unlimited');R.applyLimit(p,'elementary-one',P);assert.equal(R.selectedLimit(p,P),'elementary-one');
 P.setLimit(p,'addition',0);assert.equal(R.selectedLimit(p,P),'custom');assert.equal(R.selectedLimit(p,P,'jp'),'elementary-one');R.applyLimit(p,'unlimited',P,'math');assert.equal(R.selectedLimit(p,P,'math'),'unlimited');assert.equal(R.selectedLimit(p,P),'custom');
});
test('new unknown dependent skills remain disabled by grades, but all stages opens their cap',()=>{
 const extra={id:'futureSkill',subject:'math',courses:[999,1000],prerequisite:'number'};P.defs.push(extra);try{const p=fresh();R.applyLimit(p,'junior-range',P);assert.equal(P.absoluteLimit(p,extra),-1);R.applyLimit(p,'unlimited',P);assert.equal(P.absoluteLimit(p,extra),1)}finally{P.defs.pop()}
});
test('saved and restored caps are identical, including mixed subject settings',()=>{
 const p=fresh();R.applyLimit(p,'elementary-one',P);R.applyLimit(p,'preschool-older',P,'en');const restored=copy(p);for(const d of P.defs)assert.equal(P.absoluteLimit(restored,d),P.absoluteLimit(p,d));assert.equal(R.selectedLimit(restored,P),'custom');assert.deepEqual(copy(P.pick(restored,'math')),copy(P.pick(p,'math')));
});
// Persist mock controls so the real DOM-facing Apply handler is exercised.
const query=document.querySelector,controls=new Map();document.querySelector=s=>s.startsWith('#practiceBulkLimit')||s==='#practiceLimitScope'?(controls.has(s)?controls.get(s):(controls.set(s,element()),controls.get(s))):query(s);
function choose(scope,id){document.querySelector('#practiceLimitScope').value=scope;document.querySelector('#practiceBulkLimit').value=id}
test('selecting or cancelling without Apply never changes settings; stale handler outside parent is inert',()=>{
 run('parents()');const before=run('JSON.stringify(data)');choose('math','elementary-one');run('refreshPracticeLimitButton()');assert.equal(run('JSON.stringify(data)'),before);
 run("view='home';applyPracticeBulkLimit()");assert.equal(run('JSON.stringify(data)'),before);
});
test('Apply saves current child only, supports repeated Apply, refreshes details and profile switch',()=>{
 run('parents()');const other=run('JSON.stringify(data.profiles[1])');choose('all','elementary-one');run('applyPracticeBulkLimit()');assert.equal(run('PracticePresets.selectedLimit(person(),Practice)'),'elementary-one');assert.equal(run('JSON.stringify(data.profiles[1])'),other);
 const first=run('JSON.stringify(person())');run('applyPracticeBulkLimit()');assert.equal(run('JSON.stringify(person())'),first);
 run("setPracticeLimit('addition','0')");assert.equal(document.querySelector('#practiceBulkLimit').value,'custom');assert.equal(document.querySelector('#practiceBulkLimitApply').disabled,true);
 const savedFirst=run('JSON.stringify(data.profiles[0])');run('data.current=1;parents()');choose('all','preschool-younger');run('applyPracticeBulkLimit()');assert.equal(run('JSON.stringify(data.profiles[0])'),savedFirst);
 const stored=JSON.parse(storage.get('kazunoniwa-v1'));assert.equal(R.selectedLimit(stored.profiles[1],P),'preschool-younger');assert.equal(stored.profiles[0].practice.limits.addition,0);
});
test('UI retains the existing detailed controls and separates caps from starting ranges',()=>{
 const html=run('practiceSettings()');assert.match(html,/難易度の上限を一括設定/);assert.match(html,/開始範囲の設定/);assert.match(html,/分野ごとの絶対上限/);assert.match(html,/id="practiceBulkLimitApply"/);assert.match(html,/id="practicePreset"/);assert.match(html,/漢字を使う国語の問題を許可する/);
});
console.log(count+' bulk-limit tests passed');
`)(require);
