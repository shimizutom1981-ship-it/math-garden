const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
const R=c.PracticePresets,copy=x=>JSON.parse(JSON.stringify(x));
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const fresh=()=>({name:'Synthetic',stats:{7:{total:20,ok:19,mastered:true}},flowers:10,game:{coins:90,growth:12,owned:['crown']}});
test('preset applies only to the current profile and preserves all historical data',()=>{
 const children=[fresh(),fresh()],other=JSON.stringify(children[1]),historical=JSON.stringify(children[0]);
 for(const preset of R.presets){assert.ok(R.apply(children[0],preset.id,P));assert.equal(R.selected(children[0],P),preset.id);assert.equal(JSON.stringify(children[1]),other);const {practice,...rest}=children[0];assert.equal(JSON.stringify(rest),historical)}
});
test('all preset ranges survive save and reload',()=>{for(const preset of R.presets){const p=fresh();R.apply(p,preset.id,P);const restored=copy(p);assert.equal(R.selected(restored,P),preset.id);assert.equal(P.state(restored).settings.kanji,preset.kanji);assert.deepEqual(copy(P.state(restored).limits),copy(P.state(p).limits))}});
test('raising a preset creates no mastery and cannot skip prerequisites',()=>{const p=fresh();R.apply(p,'preschool-younger',P);R.apply(p,'elementary-two',P);assert.equal(P.pick(p,'math','mathCarry').skill,'number');assert.equal(P.pick(p,'jp','kanji').skill,'letters');for(const s of Object.values(P.state(p).skills)){assert.equal(s.total,0);assert.equal(s.level,0);assert.deepEqual(copy(s.stages),{})}});
test('lowering applies immediately despite high old estimates, then raising cannot restore mastery',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);for(const d of P.defs){const s=P.skill(p,d);s.level=d.courses.length-1;s.total=100;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:100,firstCorrect:100,recent:[]})}
 R.apply(p,'preschool-younger',P);
 for(const subject of ['math','jp','en'])for(let turn=0;turn<10;turn++){P.state(p).turns[subject]=turn;const q=P.pick(p,subject,subject==='math'?'mathCarry':subject==='jp'?'kanji':'enReply');assert.equal(q.index,0);assert.ok(['number','letters','enWords'].includes(q.skill))}
 R.apply(p,'elementary-two',P);assert.equal(P.skill(p,P.defs.find(d=>d.id==='mathCarry')).level,0);assert.equal(P.pick(p,'math','mathCarry').skill,'number');assert.equal(p.stats[7].total,20);assert.equal(p.game.coins,90);
});
test('details show custom when changed, exact restoration matches preset, selecting preset reapplies all limits',()=>{
 const p=fresh();R.apply(p,'elementary-one',P);P.setLimit(p,'addition',0);assert.equal(R.selected(p,P),'custom');P.setLimit(p,'addition',3);assert.equal(R.selected(p,P),'custom');P.state(p).settings.kanji=false;assert.equal(R.selected(p,P),'custom');R.apply(p,'elementary-one',P);assert.equal(R.selected(p,P),'elementary-one');assert.equal(P.limit(p,P.defs.find(d=>d.id==='divide')),-1);
});
test('existing users keep custom settings; no inferred grade or changes to prior migration history',()=>{
 const p=fresh();p.practice={version:1,seed:3,skills:{addition:{total:80,level:2}}};P.state(p);P.setLimit(p,'addition',1);P.state(p).settings.kanji=true;const before=JSON.stringify(p);assert.equal(R.selected(p,P),'custom');assert.equal(JSON.stringify(p),before);R.apply(p,'preschool-middle',P);assert.equal(p.practice.previous.skills.addition.total,80);
});
test('all declared skills exist and later unknown content is excluded',()=>{
 for(const preset of R.presets){for(const id of Object.keys(preset.limits))assert.ok(P.defs.some(d=>d.id===id),id);const p=fresh();R.apply(p,preset.id,P);for(const d of P.defs)assert.ok(P.limit(p,d)<=d.courses.length-1)}
 const extra={id:'futureSkill',subject:'math',courses:[999],prerequisite:'number'};P.defs.push(extra);const p=fresh();R.apply(p,'elementary-two',P);assert.equal(P.limit(p,extra),-1);P.defs.pop();
});
test('UI handlers, profile switch, preset/custom label and quiz entry use current child only',()=>{
 run('parents()');const other=run('JSON.stringify(data.profiles[1])');run("applyPracticePreset('elementary-one')");assert.equal(run('PracticePresets.selected(person(),Practice)'),'elementary-one');assert.equal(run('JSON.stringify(data.profiles[1])'),other);
 run("setPracticeLimit('addition','0')");assert.equal(run('PracticePresets.selected(person(),Practice)'),'custom');
 run("data.current=1;parents();applyPracticePreset('preschool-younger')");assert.equal(run('PracticePresets.selected(person(),Practice)'),'preschool-younger');assert.equal(run('data.profiles[0].practice.limits.addition'),0);
 run("start(recommendationFor('math'),true)");assert.equal(run('practiceItem.index'),0);assert.equal(run('practiceItem.skill'),'number');
 const stored=JSON.parse(storage.get('kazunoniwa-v1'));assert.equal(R.selected(stored.profiles[1],P),'preschool-younger');assert.equal(R.selected(stored.profiles[0],P),'custom');
});
test('repeated misses on one form lower only that unit, not counting or another subject',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);for(const d of P.defs){const s=P.skill(p,d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}
 const d=P.defs.find(d=>d.id==='mathCarry'),s=P.skill(p,d);s.level=1;s.misses=0;s.stages[1].recent=[];
 const number=JSON.stringify(P.skill(p,P.defs.find(d=>d.id==='number'))),jp=JSON.stringify(P.skill(p,P.defs.find(d=>d.id==='letters')));
 const item={focus:d.id,skill:d.id,index:1,course:d.courses[1],kind:'fluent'};
 P.record(p,{...item,example:'a',variant:'carry-nine'},false,2000);assert.equal(s.level,1);
 P.record(p,{...item,example:'b',variant:'carry-eight'},true,2000);
 P.record(p,{...item,example:'c',variant:'carry-nine'},false,2000);assert.equal(s.level,0);assert.equal(s.support,1);
 assert.equal(JSON.stringify(P.skill(p,P.defs.find(d=>d.id==='number'))),number);assert.equal(JSON.stringify(P.skill(p,P.defs.find(d=>d.id==='letters'))),jp);
 const range=R.range(p,'math',P);assert.ok(range.support.includes('mathCarry'));assert.equal(range.label,'小学1年相当の問題');
});
test('range labels use current unit stages and caps; unknown content never invents a grade',()=>{
 const p=fresh();R.apply(p,'elementary-two',P);assert.equal(R.range(p,'math',P).label,'年少相当の問題');
 for(const d of P.defs){const s=P.skill(p,d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,recent:[]})}
 P.state(p).recentItems.math=[{skill:'mathCarry',index:3}];assert.equal(R.range(p,'math',P).label,'小学2年相当の問題');
 R.apply(p,'preschool-younger',P);assert.equal(R.range(p,'math',P).label,'年少相当の問題');
 const unknown={id:'futureUnknown',subject:'math',courses:[999],prerequisite:null};P.defs.push(unknown);P.state(p).recentItems.math=[{skill:unknown.id,index:0}];assert.equal(R.range(p,'math',P).label,'学年の目安を設けていない問題');P.defs.pop();
});
test('every implemented stage is mapped and every preset uses the same complete table',()=>{
 const table=R.build(P);let stages=0;
 for(const d of P.defs){assert.equal(table[d.id].length,d.courses.length);for(const row of table[d.id]){assert.ok(row.rank>=0,d.id+':'+row.index);assert.ok(row.label&&row.basis);stages++}}
 for(const preset of R.presets)for(const d of P.defs){let cap=-1;for(const row of table[d.id]){if(row.rank>preset.rank)break;cap=row.index}assert.equal(preset.limits[d.id]??-1,cap)}
 console.log(P.defs.length+' skills / '+stages+' stages mapped');
});
console.log(count+' preset tests passed');
`)(require);
