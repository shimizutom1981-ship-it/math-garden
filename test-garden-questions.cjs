const assert=require('node:assert/strict');
const Q=require('./dist/garden-questions.js');
let total=0;
for(const [id,stages] of Object.entries(Q.banks))for(const [stage,bank] of stages.entries()){
 const keys=new Set();
 for(const q of bank){
  assert.ok(!keys.has(q.text+'|'+JSON.stringify(q.meta)));keys.add(q.text+'|'+JSON.stringify(q.meta));
  assert.equal(new Set(q.choices).size,q.choices.length);
  assert.equal(q.choices.filter(x=>x===q.answer).length,1);
  const m=q.meta;let expected;
  switch(m.op){
   case 'bridge':expected=String(m.a+m.b-m.base);assert.ok(m.base%10===0);assert.ok(+expected>=1&&+expected<=8);break;
   case 'compensate':expected=String(m.rounded-m.b);assert.equal(m.a+m.b,m.a+m.rounded-Number(q.answer));break;
   case 'change':expected=String(m.paid-m.prices.reduce((a,b)=>a+b,0))+(stage===0?'えん':'円');assert.ok(m.paid>m.prices.reduce((a,b)=>a+b,0));if(stage===0)assert.ok(m.paid<=10);break;
   case 'clock':expected=`${m.h}じ${m.m?' はん':''}`;assert.ok(m.h>=1&&m.h<=12);assert.equal(m.m,stage*30);break;
   case 'elapsed':{const minutes=m.h*60+m.m+m.elapsed;expected=`${Math.floor(minutes/60)%12||12}時${minutes%60}分`;break;}
   case 'compareLength':expected=m.a>m.b?'あ':'い';assert.notEqual(m.a,m.b);break;
   case 'lengthDifference':expected=(m.a-m.b)+'cm';break;
   case 'lengthUnits':expected=(m.m*100+m.cm)+'cm';break;
   default:assert.fail(m.op);
  }
  assert.equal(q.answer,expected);assert.ok(q.text&&q.hint);
  if(q.visualHTML)assert.match(q.visualHTML,/aria-label=/);
  total++;
 }
 // Deterministic RNG extremes: all content selected once before exhaustion.
 for(const rng of [()=>0,()=>.999999999]){
  const seen=[],selected=new Set();for(let n=0;n<bank.length;n++){const q=Q.pick(id,stage,seen,rng),key=q.text+'|'+JSON.stringify(q.meta);assert.ok(!selected.has(key));selected.add(key)}
  assert.equal(selected.size,bank.length);Q.pick(id,stage,seen,rng);assert.equal(seen.length,1);
 }
 console.log(`PASS ${id} stage ${stage}: ${bank.length} unique questions, exhaust/recycle at both RNG boundaries`);
}
for(const bank of Q.japanese){assert.equal(bank.length,8);for(const [text,answer,others,hint] of bank){assert.equal(new Set([answer,...others.split('|')]).size,3);assert.ok(text&&hint);}}
for(const bank of Q.english){assert.equal(bank.length,6);for(const q of bank){assert.equal(new Set(q.choices).size,3);assert.ok(q.audioText&&q.prompt&&q.fallbackPrompt);assert.equal(q.choices.filter(x=>x===q.answer).length,1);}}
assert.throws(()=>Q.pick('missing',0),RangeError);assert.throws(()=>Q.pick('lifeClock',3),RangeError);
console.log(`PASS all ${total} math questions + 32 reading + 18 dialogue items`);
