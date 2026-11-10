const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),baseline=require('./test-length-baseline.json'),L=require('./dist/length-expansion.js');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const d=P.defs.find(x=>x.id==='lifeLength');
test('original rows, courses, prerequisites, and grade settings remain identical',()=>{
 assert.equal(hash(P.defs.filter(d=>![...c.ShapeExpansion.defs,...c.LearningExpansion.defs].some(s=>s.id===d.id))),baseline.defs);assert.equal(hash(Object.fromEntries(Object.entries(run('PracticePresets.build(Practice)')).filter(([id])=>![...c.ShapeExpansion.defs,...c.LearningExpansion.defs].some(s=>s.id===id)))),baseline.grades);
 assert.deepEqual(L.banks.map(b=>b.length),[9,36,171]);
 for(const [stage,b] of baseline.banks.entries()){const bank=c.GardenQuestions.banks.lifeLength[stage];assert.equal(hash(bank.slice(0,b.n)),b.hash);assert.equal(bank.length,b.n+L.banks[stage].length)}
});
test('independently recomputed lengths and unit conversions have one correct choice',()=>{
 const ids=new Set();for(const [stage,bank] of L.banks.entries())for(const q of bank){
  const m=q.meta;assert.ok(!ids.has(q.expansionId));ids.add(q.expansionId);
  assert.equal(new Set(q.choices).size,3);assert.equal(q.choices.filter(x=>x===q.answer).length,1);
  if(stage<2){assert.ok(Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end<=9&&m.start<m.end);assert.equal(m.tickValue,1);assert.equal(q.answer,(m.end-m.start)+'cm');assert.equal(m.start===0,stage===0);assert.equal((q.visualHTML.match(/<text /g)||[]).length,10);for(const n of [m.start,m.end])assert.ok(q.visualHTML.includes('x1="'+(28+n*30)+'"'));assert.match(q.visualHTML,/viewBox="0 0 340 115"/);assert.ok(!/NaN|Infinity/.test(q.visualHTML))}
  else {assert.equal(q.answer,Math.floor(m.value/100)+'m '+m.value%100+'cm');assert.ok(m.m>=1&&m.m<=9&&m.cm>=5&&m.cm<=95&&m.cm%5===0);for(const choice of q.choices){const parts=choice.match(/^(\d+)m (\d+)cm$/);assert.ok(parts);if(choice!==q.answer)assert.notEqual(Number(parts[1])*100+Number(parts[2]),m.value)}}
 }
 assert.equal(ids.size,216);
});
test('all additions and old content are reachable before repetition at both RNG boundaries',()=>{
 for(const rng of [()=>0,()=>.999999999])for(let stage=0;stage<3;stage++){
  const bank=c.GardenQuestions.banks.lifeLength[stage],used=[],seen=new Set(),added=new Set();
  for(let n=0;n<bank.length;n++){const q=c.GardenQuestions.pick('lifeLength',stage,used,rng),key=q.text+'|'+JSON.stringify(q.meta);assert.ok(!seen.has(key));seen.add(key);if(q.expansionId)added.add(q.expansionId)}
  assert.equal(seen.size,bank.length);assert.equal(added.size,L.banks[stage].length);
 }
});
test('manual and guided paths keep actual stage, correct units, and graphics',()=>{
 run('for(const d of Practice.defs){const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};');
 for(let stage=0;stage<3;stage++)for(const auto of [false,true]){
  run('Object.assign(Practice.skill(person(),foundationById("lifeLength")),{level:'+stage+',support:0,retry:null});subject="math";session={auto:'+auto+',practiceFocus:"lifeLength",seen:{}};');
  const ids=new Set();for(let n=0;n<c.GardenQuestions.banks.lifeLength[stage].length;n++){
   const q=run('makeQuestion('+d.courses[stage]+')');assert.equal(q.i,d.courses[stage]);if(auto){assert.equal(run('practiceItem.skill'),'lifeLength');assert.equal(run('practiceItem.index'),stage)}
   if(q.expansionId){ids.add(q.expansionId);if(stage<2)assert.match(q.visualHTML,/<svg/)}
  }assert.equal(ids.size,L.banks[stage].length);
 }
});
test('duplicate load, install, and generation preserve saved profiles and reward state',()=>{
 const before=run('JSON.stringify(data)'),lengths=c.GardenQuestions.banks.lifeLength.map(b=>b.length);
 vm.runInContext(fs.readFileSync('dist/length-expansion.js','utf8'),c);c.LengthExpansion.install(c.GardenQuestions);
 assert.deepEqual(c.GardenQuestions.banks.lifeLength.map(b=>b.length),lengths);
 for(const course of d.courses){run('session={auto:false,seen:{}}');for(let n=0;n<400;n++)run('makeQuestion('+course+')')}
 assert.equal(run('JSON.stringify(data)'),before);
});
test('ruler additions do not announce the numeric answer before answering and respect silent mode',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.sound=true;data.noListening=false;view="quiz";session={auto:false,seen:{},done:false}');
 for(const course of d.courses.slice(0,2))for(let n=0;n<100;n++){run('q=makeQuestion('+course+')');if(run('!!q.expansionId')){run('speakQuestion()');assert.equal(spoken.at(-1),run('speechText(q.text)'))}}
 const count=spoken.length;assert.ok(count>0);run('data.sound=false;data.noListening=true;speakQuestion()');assert.equal(spoken.length,count);
});
console.log(passed+' length expansion tests passed');
`)(require);
