const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),L=require('./dist/math-life-expansion.js'),F=require('./dist/fraction-variety.js'),baseline=require('./test-math-variety-baseline.json');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const added=Object.entries(L.banks).flatMap(([id,stages])=>stages.flatMap((bank,stage)=>bank.map(q=>({id,stage,q}))));
test('all existing courses and bank rows preserved byte-for-byte',()=>{
 assert.equal(JSON.stringify(P.defs.map(d=>({id:d.id,courses:d.courses}))),JSON.stringify(baseline.defs));
 for(const x of baseline.banks)x.stages.forEach((s,stage)=>{const b=c.GardenQuestions.banks[x.id][stage];assert.equal(b.length,s.n+(L.banks[x.id]?.[stage]?.length||0));assert.equal(crypto.createHash('sha256').update(JSON.stringify(b.slice(0,s.n))).digest('hex'),s.hash)});
});
test('new clock and shopping answers independently recomputed within existing bounds',()=>{
 for(const {id,stage,q} of added){const m=q.meta;let answer;
 if(m.op==='clockChoice'){const correct=m.shown.filter(x=>x.h===m.h&&x.m===m.m);assert.equal(correct.length,1);answer=correct[0].label;assert.equal(m.m,stage*30);assert.equal((q.visualHTML.match(/<svg/g)||[]).length,3);}
 else if(m.op==='clockHourBetween'){answer=m.h+' と '+(m.h%12+1)+' の あいだ';assert.equal(stage,1);assert.equal(m.m,30);}
 else{assert.ok(m.prices.every(p=>p%10===0&&p>0));assert.ok(m.prices.length<=2);const sum=m.prices.reduce((a,b)=>a+b,0);answer=(m.op==='shoppingTotal'?sum:m.paid-sum)+'円';if(m.op!=='shoppingTotal'){assert.ok(m.paid<=100&&m.paid>sum);if(m.op==='coinChange'){assert.equal(m.paid,m.coinCount*10);assert.equal((q.visualHTML.match(/>10円<\/span>/g)||[]).length,m.coinCount)}}assert.ok(parseInt(answer)<=100);}
 assert.equal(q.answer,answer);assert.equal(q.choices.filter(v=>v===answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.text&&q.hint);if(q.visualHTML)assert.match(q.visualHTML,/aria-label=/);
 }
});
test('fraction quantities and all distractors are mathematically distinct',()=>{
 assert.equal(F.items.length,72);assert.equal(new Set(F.items.map(x=>x.id)).size,72);
 for(const q of F.items){const m=q.meta;assert.ok(m.d>=2&&m.d<=10&&m.n>0&&m.n<m.d);assert.equal(m.whole,1);assert.equal(m.equalParts,true);const equal=x=>x.n*m.d===m.n*x.d;
 assert.equal(m.options.filter(equal).length,1);for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert.notEqual(m.options[a].n*m.options[b].d,m.options[b].n*m.options[a].d);
 const expected=m.mode==='fractionToLine'?m.options.find(equal).label:m.n+'/'+m.d+(m.unit?' '+m.unit:'');assert.equal(q.answer,expected);assert.equal(q.choices.filter(v=>v===expected).length,1);assert.equal(new Set(q.choices).size,3);assert.match(q.visualHTML,/viewBox=/);assert.match(q.visualHTML,/aria-label=/);assert.ok(!/NaN|Infinity|<script/i.test(q.visualHTML));
 if(m.mode==='tapeToFraction'||m.mode==='vesselToFraction'){assert.equal((q.visualHTML.match(/<rect /g)||[]).length,m.d);assert.equal((q.visualHTML.match(/<circle /g)||[]).length,m.n)}
 }
});
test('new banks exhaust once without repetition at both RNG boundaries',()=>{
 for(const rng of [()=>0,()=>.999999999])for(const id of Object.keys(L.banks))for(let stage=0;stage<3;stage++){if(!L.banks[id][stage].length)continue;const bank=c.GardenQuestions.banks[id][stage],used=[],seen=new Set();for(let n=0;n<bank.length;n++){const q=c.GardenQuestions.pick(id,stage,used,rng),key=q.text+JSON.stringify(q.meta);assert.ok(!seen.has(key));seen.add(key)}assert.equal(seen.size,bank.length)}
});
test('fraction integration retains original generator and rotates all 72 new questions',()=>{
 const course=P.defs.find(d=>d.id==='mathRational').courses[0],old=Math.random;
 try{for(const rng of [()=>0,()=>.999999999]){Math.random=rng;run('session={auto:false,seen:{}}');const seen=new Set();for(let n=0;n<144;n++){const q=run('makeQuestion('+course+')');if(n%2===0){assert.equal(q.meta.op,'fractionVariety');assert.ok(!seen.has(q.id));seen.add(q.id)}else assert.equal(q.meta.op,'fractionDiagram')}assert.equal(seen.size,72)}}finally{Math.random=old}
});
test('all targeted questions are reachable silently and preserve learner state and grade ranges',()=>{
 const before=run('JSON.stringify(data)'),spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};run('data.sound=false;data.noListening=true;view="quiz"');const stable=run('JSON.stringify(data)');const map=run('PracticePresets.build(Practice)');
 for(const [id,stages] of [['lifeClock',[0,1]],['lifeShopping',[1,2]],['mathRational',[0]]])for(const stage of stages){assert.ok(map[id][stage].rank<=5);const course=P.defs.find(d=>d.id===id).courses[stage];run('session={auto:false,seen:{},done:false}');for(let n=0;n<160;n++){run('q=makeQuestion('+course+');speakQuestion()');assert.ok(run('q.text.length>0'));assert.ok(run('q.choices.includes(q.answer)'));}}
 assert.equal(spoken.length,0);assert.equal(run('JSON.stringify(data)'),stable);
});
console.log(passed+' math variety tests passed; '+added.length+' life-math additions + '+F.items.length+' fraction representations');
`)(require);
