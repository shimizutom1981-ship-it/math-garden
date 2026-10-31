const assert=require('node:assert/strict'),P=require('./dist/practice.js');
const profile=()=>({stats:{7:{total:20,ok:19,mastered:true}},flowers:12,game:{coins:100,growth:15,owned:['crown']}});
for(const age of [null,5,10,44]){const p=profile();P.configure(p,age,false);assert.equal(p.practice.seed,0);assert.equal(P.pick(p,'math').course,0);assert.ok(!Object.hasOwn(p.practice,'age'))}
console.log('PASS age cannot establish mastery or bypass prerequisites');
const p=profile();p.practice={version:1,configured:true,seed:3,skills:{addition:{level:2,total:50}}};const before=p.practice;
P.state(p);assert.equal(p.practice.previous,before);assert.equal(P.skill(p,P.defs[1]).level,0);assert.equal(p.game.coins,100);assert.equal(p.stats[7].total,20);
console.log('PASS legacy evidence archived without losing learning or rewards');
for(let n=0;n<30;n++){const q=P.pick(p,'math','addition');assert.equal(q.skill,'number');assert.equal(q.index,0);P.record(p,{...q,example:String(n)},true,3000)}
assert.equal(P.skill(p,P.defs[0]).level,0);P.complete(p,'math');
for(let n=0;n<10;n++)P.record(p,{...P.pick(p,'math','number'),example:String(n)},true,3000);
assert.equal(P.skill(p,P.defs[0]).level,1);
console.log('PASS one sitting cannot promote; stable evidence across sets can');
P.setLimit(p,'number',0);for(let n=0;n<10;n++){assert.equal(P.pick(p,'math').index,0);P.state(p).turns.math++}
P.configure(p,null,true);assert.equal(P.skill(p,P.defs[0]).level,0);assert.equal(P.limit(p,P.defs[0]),0);assert.ok(p.practice.estimateHistory.length);
assert.deepEqual(P.pick(JSON.parse(JSON.stringify(p)),'math'),P.pick(p,'math'));
console.log('PASS caps, easy start and save roundtrip');
