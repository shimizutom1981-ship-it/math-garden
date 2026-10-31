const fs=require('node:fs'),setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
const R=c.PracticePresets,def=id=>P.defs.find(d=>d.id===id),fresh=()=>({stats:{7:{ok:19,total:20}},game:{coins:200,growth:30},flowers:10});let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name)}
function certify(p,id,index){const d=def(id),s=P.skill(p,d);s.level=index;s.stages[index]={mastered:true,attempts:10,firstCorrect:10,recent:Array.from({length:10},(_,i)=>({ok:1,example:String(i%5),variant:i%2?'a':'b',session:Math.floor(i/5)}))}}
function prerequisites(p,id){const d=def(id);for(const pre of d.requires||(d.prerequisite?[d.prerequisite]:[])){prerequisites(p,pre);def(pre).courses.forEach((_,i)=>certify(p,pre,i))}}
test('every required stage must be stable before independent one-band advancement',()=>{
 const p=fresh(),other=fresh();R.apply(p,'preschool-middle',P);prerequisites(p,'addition');certify(p,'addition',1);
 assert.equal(R.advance(p,def('addition'),P),false);certify(p,'addition',0);P.skill(p,def('addition')).level=1;
 const number=JSON.stringify(P.skill(p,def('number'))),jp=JSON.stringify(P.skill(p,def('letters'))),beforeOther=JSON.stringify(other);
 assert.equal(R.advance(p,def('addition'),P),true);assert.equal(P.limit(p,def('addition')),3);assert.equal(P.skill(p,def('addition')).level,2);
 assert.equal(P.state(p).rangeProgress.addition.from,'年中相当');assert.equal(P.state(p).rangeProgress.addition.to,'年長相当');
 assert.equal(JSON.stringify(P.skill(p,def('number'))),number);assert.equal(JSON.stringify(P.skill(p,def('letters'))),jp);assert.equal(JSON.stringify(other),beforeOther);assert.equal(R.advance(p,def('addition'),P),false);
});
test('record hook advances after varied clean attempts across completed sets, not four answers',()=>{
 const p=fresh();R.apply(p,'preschool-younger',P);
 for(let n=0;n<4;n++)P.record(p,{...P.pick(p,'math'),example:String(n%3)},true,2000);
 assert.equal(P.limit(p,def('number')),0);
 for(let n=4;n<15;n++){P.record(p,{...P.pick(p,'math'),example:String(n%3)},true,2000);if(n%5===4)P.complete(p,'math')}
 assert.equal(P.limit(p,def('number')),2);assert.equal(P.limit(p,def('letters')),0);assert.equal(P.state(p).settings.kanji,false);assert.equal(P.state(p).settings.carry,false);
});
test('repeated example, missing form, hints, or one sitting cannot clear a range',()=>{
 for(const mode of ['same-example','same-form','hint','same-session']){const p=fresh();R.apply(p,'elementary-one',P);prerequisites(p,'mathDecompose');certify(p,'mathDecompose',0);certify(p,'mathDecompose',1);const stage=P.skill(p,def('mathDecompose')).stages[1];
  stage.recent.forEach(x=>{if(mode==='same-example')x.example='same';if(mode==='same-form')x.variant='a';if(mode==='same-session')x.session=0;if(mode==='hint')x.ok=0});assert.equal(R.advancement(p,def('mathDecompose'),P).ready,false,mode);
 }
});
test('explicit absolute limits remain after preset changes and range clear requires parent action',()=>{
 const p=fresh();P.setLimit(p,'addition',1);R.apply(p,'preschool-middle',P);prerequisites(p,'addition');certify(p,'addition',0);certify(p,'addition',1);
 assert.equal(R.advance(p,def('addition'),P),false);assert.match(P.state(p).rangeProgress.addition.reason,/絶対上限/);assert.equal(P.limit(p,def('addition')),1);
 R.apply(p,'elementary-6',P);assert.equal(P.absoluteLimit(p,def('addition')),1);assert.equal(P.limit(p,def('addition')),1);
});
test('disabled concepts never auto-enable; no invented next grade; failed unit can return to review',()=>{
 const p=fresh();R.apply(p,'elementary-one',P);prerequisites(p,'mathCarry');certify(p,'mathCarry',0);certify(p,'mathCarry',1);P.state(p).settings.carry=false;assert.equal(R.advance(p,def('mathCarry'),P),false);assert.equal(P.state(p).settings.carry,false);
 const q=fresh();R.apply(q,'preschool-middle',P);def('number').courses.forEach((_,i)=>certify(q,'number',i));assert.equal(R.advance(q,def('number'),P),false);assert.match(P.state(q).rangeProgress.number.reason,/未実装/);
 for(let n=0;n<2;n++)P.record(q,{...P.pick(q,'math','number'),example:'miss',variant:'count'},false,2000);assert.equal(P.skill(q,def('number')).level,1);assert.equal(P.skill(q,def('number')).support,1);assert.equal(R.advancement(q,def('number'),P).ready,false);
});
test('advancement roundtrips without changing historical learning, rewards, or another child',()=>{
 const p=fresh(),before=JSON.stringify(p);R.apply(p,'preschool-younger',P);certify(p,'number',0);R.advance(p,def('number'),P);const restored=JSON.parse(JSON.stringify(p));assert.equal(P.limit(restored,def('number')),2);assert.equal(P.state(restored).rangeProgress.number.status,'advanced');const {practice,...rest}=restored;assert.equal(JSON.stringify(rest),before);
});
console.log(count+' advancement tests passed');
`)(require);
