'use strict';
const assert=require('node:assert/strict');
const {defs,make}=require('./dist/math-expansion.js');
let seed=0x6a09e667;
function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const rat=s=>{const [n,d]=s.split('/').map(Number);return n/d;};
function expected(q){
 const m=q.meta;
 switch(m.op){
 case 'missing':return String(m.total-m.a);
 case 'sum3':return String(m.a+m.b+m.c);
 case 'add':return String(m.a+m.b);
 case 'subtract':return String(m.a-m.b);
 case 'multiply':return String(m.a*m.b);
 case 'divide':return m.remainder?`${Math.floor(m.a/m.b)} あまり ${m.a%m.b}`:String(m.a/m.b);
 case 'order':return String(m.variant===0?m.a+m.b*m.c:m.variant===1?(m.a+m.b)*m.c:m.a+m.b);
 case 'fractionDiagram':return m.n/m.d;
 case 'fractionCompare':return Math.max(m.n/m.d,m.n/m.b);
 case 'equivalent':return m.n/m.d;
 case 'fractionAdd':return m.n/m.d+m.b/m.e;
 case 'decimalCompare':return String(Math.max(m.a,m.b)/m.scale);
 case 'decimalSubtract':return String((m.a-m.b)/m.scale);
 case 'decimalAdd':return String((m.a+m.b)/m.scale);
 case 'decimalDivide':return String(m.a/m.b/m.scale);
 case 'decimalMultiply':return String(m.a*m.b/m.scale);
 case 'percentDiagram':return `${m.n*10}%`;
 case 'percentCompare':return m.p>m.q?`${m.p}%`:`${m.q/100}倍`;
 case 'percentPractical':return `${m.discount?m.price-m.price*m.p/100:m.price*m.p/100}円`;
 default:throw Error(m.op);
 }
}
let count=0;
const stages=defs.reduce((n,d)=>n+d.stages.length,0);
assert.equal(new Set(defs.map(d=>d.id)).size,defs.length);
for(const d of defs){
 assert.ok(d.stages.length>=3);
 if(d.prerequisite)assert.ok(defs.some(x=>x.id===d.prerequisite));
 for(let stage=0;stage<d.stages.length;stage++){
  const prompts=new Set();
  for(let i=0;i<250;i++){
   const q=make(d.id,stage,rng),m=q.meta;
   assert.equal(q.type,'mathExtended');assert.equal(q.skill,d.id);assert.equal(q.stage,stage);
   assert.ok(q.text && q.hint);assert.ok(q.choices.length>=3 && q.choices.length<=4);
   assert.equal(new Set(q.choices).size,q.choices.length);
   assert.equal(q.choices.filter(x=>x===q.answer).length,1);
   assert.ok(q.choices.every(x=>typeof x==='string' && !/NaN|undefined|Infinity/.test(x)));
   const want=expected(q);
   if(typeof want==='number')assert.ok(Math.abs(rat(q.answer)-want)<1e-12,JSON.stringify(q));
   else assert.equal(q.answer,want);
   const fractions=q.choices.filter(x=>/^\d+\/\d+$/.test(x));
   assert.equal(new Set(fractions.map(rat)).size,fractions.length,'Equivalent distractors');
   if(m.op==='add')assert.ok(m.a%10+m.b%10>=10,'must carry');
   if(m.op==='subtract'){assert.ok(m.a%10<m.b%10,'must borrow');assert.ok(m.a>=m.b);}
   if(m.op==='divide')assert.ok(m.remainder<m.b);
   if(q.visualHTML){assert.match(q.visualHTML,/width="100%"/);assert.match(q.visualHTML,/role="img" aria-label=/);const filled=(q.visualHTML.match(/fill="#357f65"/g)||[]).length;assert.equal(filled,m.n);}
   prompts.add(JSON.stringify(m));count++;
  }
  assert.ok(prompts.size>=8,`${d.id} ${stage}: insufficient variety`);
  // Constant RNGs must terminate and still produce valid, unique options.
  for(const v of [0,.999999]){const q=make(d.id,stage,()=>v);assert.equal(new Set(q.choices).size,q.choices.length);}
 }
}
assert.throws(()=>make('unknown',0),RangeError);
assert.throws(()=>make(defs[0].id,-1),RangeError);
assert.throws(()=>make(defs[0].id,3),RangeError);
assert.throws(()=>make(defs[0].id,.5),RangeError);
const fs=require('node:fs'),vm=require('node:vm'),browser={};
vm.runInNewContext(fs.readFileSync('./dist/math-expansion.js','utf8'),browser);
assert.equal(browser.MathExpansion.defs.length,defs.length);
assert.equal(browser.MathExpansion.make('mathDecompose',0,()=>0).answer,'9');
console.log(`PASS: ${defs.length} independent skills, ${stages} stages, ${count} generated arithmetic/choice checks; browser global, boundaries, accessible diagrams verified.`);
