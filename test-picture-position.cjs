const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),baseline=JSON.parse(fs.readFileSync('test-picture-position-baseline.json','utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const def=id=>P.defs.find(d=>d.id===id),course=def('sentence').courses[1],pictureCourse=def('letters').courses[0],api=c.PicturePositionExpansion;
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
test('all original bank rows, course IDs, prerequisites and grade bounds are unchanged',()=>{
 assert.equal(run('JP_BANK.length'),baseline.banks.length);
 for(const [i,b] of baseline.banks.entries()){
  const current=run('JP_BANK['+i+']');if(b===null){assert.equal(current,undefined);continue;}assert.equal(hash(current.slice(0,b.length)),b.hash,'bank '+i);
  assert.equal(current.length,b.length+(i===course-run('JP_START')?18:0),'bank length '+i);
 }
 assert.equal(run('JSON.stringify(Practice.defs)'),baseline.defs);
 assert.equal(run('JSON.stringify(PracticePresets.build(Practice))'),baseline.grades);
 assert.equal(run('JSON.stringify(LowerGradeContent.pictures.slice(0,18))'),baseline.pictures);
});
test('14 distinct picture targets and 18 balanced reverse questions preserve simple vocabulary',()=>{
 assert.equal(api.pictures.length,14);assert.equal(run('LowerGradeContent.pictures.length'),32);
 assert.equal(run('new Set(LowerGradeContent.pictures.map(p=>p[0])).size'),32);
 assert.equal(api.items.length,18);assert.equal(new Set(api.items.map(x=>x.id)).size,18);
 for(const position of ['above','under','beside'])assert.equal(api.items.filter(x=>x.position===position).length,6);
 for(const item of api.items){
  assert.doesNotMatch(item.row.join(''),/[\u3400-\u9fff]/u);
  assert.equal(item.row[1],{above:'うえ',under:'した',beside:'よこ'}[item.position]);
  const options=[item.row[1],...item.row[2].split('|')];assert.equal(options.length,3);assert.equal(new Set(options).size,3);
 }
});
test('real manual generator reaches all 36 positions and 32 pictures before repeating, including RNG edges',()=>{
 const original=Math.random;try{for(const random of [0,.999999999]){Math.random=()=>random;
  for(const [target,total] of [[course,36],[pictureCourse,32]]){
   run('session={auto:false,seen:{}}');const seen=new Set(),ids=new Set();
   for(let n=0;n<total;n++){
    const q=run('makeQuestion('+target+')'),key=q.text+'|'+q.answer;
    assert.equal(q.i,target);assert.ok(!seen.has(key));seen.add(key);
    assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);
    if(target===pictureCourse){assert.equal(q.choices.length,2);assert.equal(q.answer,q.visual)}
    if(q.expansionId){ids.add(q.expansionId);assert.match(q.visualHTML,/<svg/);assert.equal(q.answer,{above:'うえ',under:'した',beside:'よこ'}[q.spatialMeta.position]);const xy={above:[75,35],under:[75,110],beside:[135,92]}[q.spatialMeta.position];assert.ok(q.visualHTML.includes('x="'+xy[0]+'" y="'+xy[1]+'"'));assert.ok(q.visualHTML.includes(q.spatialMeta.animal));}
   }
   assert.equal(seen.size,total);if(target===course)assert.equal(ids.size,18);
  }
 }}finally{Math.random=original}
});
test('guided routing keeps diagrams with the actual selected course and unchanged stage',()=>{
 run('for(const d of Practice.defs){const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};Object.assign(Practice.skill(person(),foundationById("sentence")),{level:1,support:0,retry:null});subject="jp";session={auto:true,practiceFocus:"sentence",seen:{}};');
 const ids=new Set();for(let n=0;n<90;n++){const q=run('makeQuestion('+course+')');if(q.expansionId){ids.add(q.expansionId);assert.equal(q.i,course);assert.equal(run('practiceItem.skill'),'sentence');assert.equal(run('practiceItem.index'),1);assert.ok(q.visualHTML)}}
 assert.equal(ids.size,18);
});
test('duplicate load and question generation do not change profile state or add duplicate rows',()=>{
 const before=run('JSON.stringify(data)'),size=run('JP_BANK['+course+'-JP_START].length'),make=run('makeQuestion');
 vm.runInContext(fs.readFileSync('dist/picture-position-expansion.js','utf8'),c);
 assert.equal(run('makeQuestion'),make);assert.equal(run('JSON.stringify(data)'),before);assert.equal(run('JP_BANK['+course+'-JP_START].length'),size);assert.equal(run('LowerGradeContent.pictures.length'),32);
 for(const target of [course,pictureCourse]){run('session={auto:false,seen:{}}');for(let n=0;n<80;n++)run('makeQuestion('+target+')')}
 assert.equal(run('JSON.stringify(data)'),before);
});
test('spoken prompts never announce the position answer and silent mode stays silent',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.sound=true;data.noListening=false;view="quiz";session={auto:false,seen:{},done:false}');
 let checked=0;for(let n=0;n<36;n++){run('q=makeQuestion('+course+')');if(run('!!q.expansionId')){run('speakQuestion()');assert.equal(spoken.at(-1),run('speechText(q.text)'));assert.ok(!spoken.at(-1).includes(run('q.answer')));checked++}}
 assert.equal(checked,18);const count=spoken.length;run('data.sound=false;data.noListening=true;speakQuestion()');assert.equal(spoken.length,count);
});
console.log(passed+' picture/position tests passed');
`)(require);
