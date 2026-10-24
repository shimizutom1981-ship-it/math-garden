const assert=require('node:assert/strict');
const {model}=require('./dist/written-hints.js');
const get=(op,a,b,scale)=>model({meta:{op,a,b,scale},answer:'SENTINEL ANSWER',hint:'SENTINEL ANSWER'});
assert.equal(get('fractionAdd',1,2),null);
assert.equal(get('divide',2,0),null);
assert.equal(get('subtract',2,3),null);
assert.equal(model({text:'1 + 2',answer:3}),null);
assert.equal(get('add',99,1).marks.length,2);
assert.deepEqual(get('subtract',402,187).marks,['100の位は 3 として考える','10の位は 9 として考える','1の位は 12 として考える']);
assert.deepEqual(get('subtract',1000,1).marks,['1000の位は 0 として考える','100の位は 9 として考える','10の位は 9 として考える','1の位は 10 として考える']);
assert.equal(get('subtract',87,23).marks.length,0);
assert.deepEqual(get('decimalSubtract',20,19,10).marks,['1の位は 1 として考える','小数第1位は 10 として考える']);
const dec=get('decimalAdd',23,4,10);assert.equal(dec.rows[0].indexOf('.'),dec.rows[1].indexOf('.'));
assert.match(get('multiply',24,13).detail,/一つ左/);
assert.match(get('decimalMultiply',25,3,100).detail,/右から2けた/);
assert.match(get('divide',29,4).detail,/あまり/);
assert.match(get('decimalDivide',75,3,100).detail,/一の位に0/);
for(const op of ['add','subtract','multiply','divide','decimalAdd','decimalSubtract','decimalMultiply','decimalDivide']){
 const m=get(op,432,12,op.startsWith('decimal')?100:undefined);
 assert.ok(m);assert.ok(m.rows.some(r=>r.includes('□')));
 assert.ok(!JSON.stringify(m).includes('SENTINEL ANSWER'));
}
console.log('PASS written arithmetic: carries, chained-zero borrowing, decimals, multiply shifts, division/remainder, unsupported inputs and no answer-field leakage');
const expansion=require('./dist/math-expansion.js');
for(const d of expansion.defs)for(let stage=0;stage<d.stages.length;stage++)for(let n=0;n<50;n++){
 const q=expansion.make(d.id,stage);
 const supported=['mathCarry','mathBorrow','mathProduct','mathQuotient'].includes(d.id)||d.id==='mathDecimal'&&stage>0;
 assert.equal(!!model(q),supported);
}
console.log('PASS all 28 expansion stages: 1400 generated questions routed to written hints or existing concept hints');
