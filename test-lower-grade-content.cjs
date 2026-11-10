const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name)};
const contents=run('LowerGradeContent.jp'),def=id=>P.defs.find(d=>d.id===id);
const changed=[];for(const [id,stages] of Object.entries(contents))for(const stage of Object.keys(stages))changed.push({id,index:Number(stage),course:def(id).courses[stage]});
const expected={words:[32,32],sentence:[32,36,32],jp_punctuation:[32,32],letters:[32,32,32],katakana:[32],jp_gradeKanji:[40,40,40,12,12,12],kanji:[20]};
test('165 text/diagram items and twelve picture targets fill fifteen Japanese banks',()=>{
 assert.equal(Object.values(contents).flatMap(Object.values).flat().length,165);assert.equal(changed.length,14);
 for(const [id,counts] of Object.entries(expected))for(let stage=0;stage<counts.length;stage++){
  const n=id==='letters'&&stage===0?run('LowerGradeContent.pictures.length'):run('JP_BANK['+def(id).courses[stage]+'-JP_START].length');assert.equal(n,counts[stage]+(c.EarlyPractice.addedByCourse[def(id).courses[stage]]||0),id+':'+stage);
 }
});
test('every added row is unique within its bank and has one correct option',()=>{
 for(const [id,stages] of Object.entries(contents))for(const [stage,rows] of Object.entries(stages)){
  const bank=run('JP_BANK['+def(id).courses[stage]+'-JP_START]');assert.equal(new Set(bank.map(r=>r[0]+'|'+r[1])).size,bank.length);
  for(const r of rows){assert.equal(r.length,4);assert.ok(r.every(x=>typeof x==='string'&&x.trim()));const choices=[r[1],...r[2].split('|')];assert.equal(new Set(choices).size,choices.length);assert.ok(choices.length>=3&&choices.length<=4);}
 }
});
test('kana-only rows contain no kanji and missing-letter answers are one character',()=>{
 for(const {id,course} of changed)if(!def(id).kanji)for(const r of run('JP_BANK['+course+'-JP_START]'))assert.doesNotMatch(r.join(''),/[\u3400-\u9fff]/u);
 for(const r of contents.letters[2]){assert.equal(Array.from(r[1]).length,1);assert.equal((r[0].match(/□/g)||[]).length,1);}
 for(const r of contents.katakana[0]){assert.match(r[0],/^[ぁ-ゖー]+$/u);assert.match(r[1],/^[ァ-ヶー]+$/u);}
});
test('new kanji targets are separated by grade and later-grade banks remain unchanged',()=>{
 const words=run('LowerGradeContent.gradeWords');assert.deepEqual(Array.from(words,w=>w.length),[12,12,12]);assert.equal(new Set(words.flat().map(w=>w[0])).size,36);
 for(const stage of [3,4,5])assert.equal(run('JP_BANK['+def('jp_gradeKanji').courses[stage]+'-JP_START].length'),12);
});
test('all text rows are reachable through the real generator without repetition',()=>{
 for(const {id,index,course} of changed){
  const size=run('JP_BANK['+course+'-JP_START].length'),seen=new Set();run('session={auto:false,seen:{}}');
  for(let n=0;n<size;n++){
   const q=run('makeQuestion('+course+')');assert.equal(q.i,course);assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.filter(x=>x===q.answer).length,1);const key=q.text+'|'+q.answer+'|'+q.visual;assert.ok(!seen.has(key),id+':'+index);seen.add(key);
  }assert.equal(seen.size,size);
 }
});
test('picture matching exhausts thirty-two two-choice targets at both RNG boundaries',()=>{
 const original=Math.random;try{for(const random of [0,.999999999]){Math.random=()=>random;run('session={auto:false,seen:{}}');const seen=new Set();for(let n=0;n<32;n++){const q=run('makeQuestion('+def('letters').courses[0]+')');assert.equal(q.answer,q.visual);assert.equal(q.choices.length,2);assert.equal(new Set(q.choices).size,2);assert.ok(!seen.has(q.answer));seen.add(q.answer)}}}finally{Math.random=original}
});
test('tiny numeric stages exhaust their original facts without widening number ranges',()=>{
 const original=Math.random;try{for(const random of [0,.999999999]){Math.random=()=>random;
  for(const [id,stage,size] of [['number',0,3],['number',1,5],['number',2,5],['addition',0,3],['mathDecompose',0,4]]){
   run('session={auto:false,seen:{}}');const seen=new Set();
   for(let n=0;n<size*2;n++){const q=run('makeQuestion('+def(id).courses[stage]+')');if(n===size)seen.clear();const key=q.text+'|'+q.answer;assert.ok(!seen.has(key));seen.add(key);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);if(id==='number'){const low=stage===2?6:1,high=[3,5,10][stage];assert.ok(q.answer>=low&&q.answer<=high);assert.ok(q.choices.every(n=>n>=low&&n<=high));assert.equal(q.objects,q.answer);assert.equal(q.choices.length,stage===0?3:4)}if(id==='addition')assert.equal(q.answer,q.a+q.b);}
  }
 }}finally{Math.random=original}
});
test('eleven repeated-group facts retain at most twelve objects and four groups',()=>{
 run('session={auto:false,seen:{}}');const seen=new Set();for(let n=0;n<11;n++){const q=run('makeQuestion('+def('multiply').courses[0]+')'),m=q.meta;assert.equal(q.answer,m.a*m.b);assert.ok(m.a<=4&&m.b<=4&&q.answer<=12);assert.equal((q.visualHTML.match(/🍎/gu)||[]).length,q.answer);assert.equal((q.visualHTML.match(/<span>/g)||[]).length,m.b);assert.ok(!seen.has(m.a+':'+m.b));seen.add(m.a+':'+m.b)}assert.equal(seen.size,11);
});
test('all forty-five ten-yen change questions are independently correct and reachable',()=>{
 const bank=run('GardenQuestions.banks.lifeShopping[1].slice(0,45)');assert.equal(bank.length,45);assert.equal(new Set(bank.map(q=>q.text)).size,45);
 for(const q of bank){assert.equal(q.answer,(q.meta.paid-q.meta.prices[0])+'円');assert.equal(q.meta.paid%10,0);assert.equal(q.meta.prices[0]%10,0);assert.ok(q.meta.paid<=100);assert.ok(q.meta.prices[0]<q.meta.paid);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length)}
 for(const random of [()=>0,()=>.999999999]){const seen=[],selected=new Set();for(let n=0;n<45;n++){const q=c.GardenQuestions.pick('lifeShopping',1,seen,random);const key=q.text+JSON.stringify(q.meta);assert.ok(!selected.has(key));selected.add(key)}}
});
test('generation never alters profiles, rewards or mastery and selection history is set-local',()=>{
 const before=run('JSON.stringify(data)');for(const item of changed){run('session={auto:false,seen:{}}');for(let n=0;n<25;n++)run('makeQuestion('+item.course+')')}
 for(const id of ['number','addition','mathDecompose','multiply','letters']){run('session={auto:false,seen:{}}');for(let n=0;n<30;n++)run('makeQuestion('+def(id).courses[0]+')')}
 assert.equal(run('JSON.stringify(data)'),before);run('session={auto:false,seen:{}}');assert.equal(run('session.lowerGradeSeen'),undefined);
});
test('new kanji and katakana retain neutral narration before the answer',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};run('data.sound=true;data.noListening=false');
 for(const item of changed.filter(x=>['kanji','jp_gradeKanji','katakana'].includes(x.id))){const size=run('JP_BANK['+item.course+'-JP_START].length');run('session={auto:false,seen:{},done:false};view="quiz"');for(let n=0;n<size;n++){run('q=makeQuestion('+item.course+');speakQuestion()');assert.equal(spoken.at(-1),run('speechText(q.instructionSpeech)'));assert.ok(run('q.readingTask'));assert.notEqual(spoken.at(-1),run('q.answer'))}}
 run('data.sound=false;data.noListening=true');
});
test('adaptive routes keep actual skill and stage within the unchanged grade bounds',()=>{
 run('for(const d of Practice.defs){const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};');
 for(const item of [...changed,{id:'letters',index:0,course:def('letters').courses[0]},{id:'multiply',index:0,course:def('multiply').courses[0]},{id:'lifeShopping',index:1,course:def('lifeShopping').courses[1]}]){
  run('Object.assign(Practice.skill(person(),foundationById("'+item.id+'")),{level:'+item.index+',support:0,retry:null});Practice.state(person()).turns["'+def(item.id).subject+'"]=0;subject="'+def(item.id).subject+'";session={auto:true,practiceFocus:"'+item.id+'",seen:{}};q=makeQuestion('+item.course+')');
  assert.equal(run('practiceItem.skill'),item.id);assert.equal(run('practiceItem.index'),item.index);assert.equal(run('q.i'),item.course);assert.ok(run('PracticePresets.build(Practice)['+JSON.stringify(item.id)+']['+item.index+'].rank<=5'));
 }
});
console.log(count+' lower-grade content tests passed');
`)(require);

