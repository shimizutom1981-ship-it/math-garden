const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const E=c.EarlyPractice,def=id=>P.defs.find(d=>d.id===id),hira=def('letters').courses[2],kata=def('katakana').courses[0];
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
test('120 picture clues have one blank, one valid character answer and script-matched distractors',()=>{
 assert.equal(E.items.length,120);assert.equal(E.hiragana.length,30);assert.equal(E.katakana.length,30);
 assert.equal(new Set(E.items.map(x=>x.id)).size,120);
 for(const item of E.items){
  assert.equal((item.masked.match(/□/g)||[]).length,1);assert.equal(item.masked.replace('□',item.row[1]),item.word);
  const options=[item.row[1],...item.row[2].split('|')];assert.equal(new Set(options).size,3);assert.equal(Array.from(item.row[1]).length,1);
  for(const option of options)assert.match(option,item.script==='hiragana'?/^[ぁ-ゖー]$/u:/^[ァ-ヶー]$/u);
  assert.ok(item.icon);assert.doesNotMatch(item.row.join(''),/[\u3400-\u9fff]/u);
 }
 assert.equal(run('JP_BANK['+hira+'-JP_START].length'),92);assert.equal(run('JP_BANK['+kata+'-JP_START].length'),92);
});
test('all new and original kana questions are reachable, with pictures on the actual rendered question',()=>{
 const random=Math.random;try{for(const rng of [0,.999999999]){Math.random=()=>rng;
  for(const course of [hira,kata]){
   run('session={auto:false,seen:{}}');const ids=new Set(),seen=new Set();
   for(let n=0;n<92;n++){
    const q=run('makeQuestion('+course+')');assert.equal(q.i,course);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);
    const key=q.text+'|'+q.answer+'|'+q.visual;assert.ok(!seen.has(key));seen.add(key);
    if(q.earlyPracticeId){ids.add(q.earlyPracticeId);assert.equal(q.pictureClue.masked.replace('□',q.answer),q.pictureClue.word);assert.equal(q.readingTask,'kana-blank');}
   }
   assert.equal(ids.size,60);
  }
 }}finally{Math.random=random}
});
test('automatic and replay audio never reveal the pictured word before answering',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.sound=true;data.noListening=false;view="quiz"');let checked=0;
 for(const course of [hira,kata]){run('session={auto:false,seen:{},done:false}');for(let n=0;n<92;n++){
  run('q=makeQuestion('+course+')');if(run('!!q.earlyPracticeId')){run('speakQuestion();speakQuestion()');assert.equal(spoken.at(-1),run('speechText(q.instructionSpeech)'));assert.ok(!spoken.at(-1).includes(run('q.pictureClue.word')));checked++}
 }}assert.equal(checked,120);
 const count=spoken.length;run('data.noListening=true;speakQuestion()');assert.equal(spoken.length,count);run('data.noListening=false;data.sound=false');
});
test('all small addition and subtraction facts rotate fairly, with correct diagrams and bounded options',()=>{
 const random=Math.random;try{for(const rng of [0,.999999999]){Math.random=()=>rng;
  for(const [id,stage,max,total,op] of [['addition',0,3,3,'add'],['addition',1,5,10,'add'],['addition',2,9,36,'add'],['subtraction',0,5,15,'subtract'],['subtraction',1,9,45,'subtract']]){
   const course=def(id).courses[stage],seen=new Set(),forms=new Set();run('session={auto:false,seen:{}}');
   for(let n=0;n<total*3;n++){
    if(n%total===0)seen.clear();const q=run('makeQuestion('+course+')'),key=q.a+':'+q.b;
    assert.ok(!seen.has(key));seen.add(key);assert.equal(q.basicPractice.op,op);forms.add(q.basicPractice.form);
    assert.equal(q.answer,op==='add'?q.a+q.b:q.a-q.b);assert.ok(q.a>=1&&q.b>=1&&q.a<=max&&q.b<=max);
    assert.ok(q.answer>=0&&q.answer<=max);assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3);
    assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.ok(q.choices.every(n=>n>=0&&n<=max));
    assert.equal((q.visualHTML.match(/class="object basic-counter/g)||[]).length,op==='add'?q.a+q.b:q.a);
    assert.equal((q.visualHTML.match(/basic-counter removed/g)||[]).length,op==='add'?0:q.b);
    assert.doesNotMatch(q.visualHTML,/speak\(/);assert.equal(q.objects,0);
   }assert.equal(seen.size,total);assert.equal(forms.size,3);
  }
 }}finally{Math.random=random}
});
test('duplicate registration and manual generation preserve course IDs, profiles, limits and rewards',()=>{
 const before=run('JSON.stringify(data)'),definitions=JSON.stringify(P.defs),make=run('makeQuestion');
 vm.runInContext(fs.readFileSync('dist/early-practice.js','utf8'),c);assert.equal(run('makeQuestion'),make);
 assert.equal(run('JP_BANK['+hira+'-JP_START].length'),92);assert.equal(run('JP_BANK['+kata+'-JP_START].length'),92);
 for(const course of [hira,kata,...def('addition').courses.slice(0,3),...def('subtraction').courses]){run('session={auto:false,seen:{}}');for(let n=0;n<100;n++)run('makeQuestion('+course+')')}
 assert.equal(run('JSON.stringify(data)'),before);assert.equal(JSON.stringify(P.defs),definitions);
});
test('adaptive rendering keeps the existing stage and does not count assisted answers as independent success',()=>{
 run('for(const d of Practice.defs){const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};Practice.state(person()).lowerPresets={}');
 for(const [id,stage] of [['letters',2],['katakana',0],['addition',0],['addition',1],['subtraction',0]]){
  const d=def(id),course=d.courses[stage];run('Object.assign(Practice.skill(person(),foundationById("'+id+'")),{level:'+stage+',support:0,misses:0});Practice.state(person()).turns["'+d.subject+'"]=0;subject="'+d.subject+'";view="quiz";session={i:'+course+',auto:true,practiceFocus:"'+id+'",seen:{},n:0,correct:0,misses:0};');
  let found=false;for(let n=0;n<92;n++){run('nextQuestion()');if(run('!!q.pictureClue||!!q.basicPractice')){found=true;break}}
  assert.ok(found);assert.equal(run('practiceItem.skill'),id);assert.equal(run('practiceItem.index'),stage);
  assert.ok(app.innerHTML.includes(id==='letters'||id==='katakana'?'kana-picture':'basic-arithmetic'));
  const total=run('Practice.skill(person(),foundationById("'+id+'")).total');run('practiceClock.start-=2000;showHint();answer(q.choices.indexOf(q.answer),document.createElement("button"))');
  assert.equal(run('Practice.skill(person(),foundationById("'+id+'")).total'),total+1);
  assert.equal(run('Practice.skill(person(),foundationById("'+id+'")).stages['+stage+'].recent.at(-1).ok'),0);
 }
});
console.log(passed+' early-practice tests passed');
`)(require);
