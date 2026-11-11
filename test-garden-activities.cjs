const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const A=run('GardenActivities'),def=id=>P.defs.find(d=>d.id===id);
const btn=()=>document.createElement('button');
const spoken=[];
c.speechSynthesis={cancel(){},getVoices(){return []},speak(u){spoken.push(u.text)}};
c.SpeechSynthesisUtterance=function(text){this.text=text};
for(const preset of c.PracticePresets.presets){
 const p={};c.PracticePresets.applyLimit(p,preset.id,P);c.PracticePresets.apply(p,preset.id,P);
 for(const lesson of A.lessons)assert.equal(P.limit(p,def(lesson.id)),preset.rank>=5?0:-1);
}
run("for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}person().practiceFlow={freeChoice:true,next:'math'};Practice.setGentle(person(),true);data.sound=true;data.noListening=false");
function focus(id,stage,set){
 const d=def(id),p=run('person()'),s=P.skill(p,d);
 Object.assign(s,{level:stage,support:0,misses:0});delete s.gentleBridge;delete s.pendingGentle;
 P.state(p).turns[d.subject]=0;P.state(p).sessions[d.subject]=set;
 run('home();startSelectedPractice('+JSON.stringify(id)+')');
}
function advanceCorrect(){
 run("practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
}
function atThird(id,stage,set){
 focus(id,stage,set);
 for(let i=0;i<2;i++){assert.ok(!run('q.activity'));advanceCorrect()}
}
for(const [set,kind] of [[0,'basket'],[1,'give']]){
 atThird('number',0,set);
 const q=run('q'),confirm=btn(),p=run('person()'),s=P.skill(p,def('number'));
 assert.equal(q.activity,kind);assert.match(app.innerHTML,/class="primary ga-confirm"/);
 assert.doesNotMatch(app.innerHTML,/class="choices"/);assert.ok(q.slots.length<=3);
 const before=s.total;A.submit(confirm);assert.equal(confirm.disabled,true);
 assert.equal(s.total,before+1);const startSpeech=spoken.length;
 A.toggle(0);A.toggle(0);assert.equal(q.slots.filter(Boolean).length,0);
 for(let i=0;i<q.answer;i++)A.toggle(i);
 assert.equal(spoken.length,startSpeech);assert.equal(run('session.done'),false);
 // The VM stub does not retain querySelector nodes, so re-use an enabled DOM button.
 A.submit(btn());assert.equal(run('session.done'),true);A.submit(btn());A.toggle(0);
 assert.equal(q.slots.filter(Boolean).length,q.answer);assert.equal(s.total,before+1);
 assert.equal(s.stages[0].recent.at(-1).ok,0);
 run('advance()');for(let i=0;i<2;i++){assert.ok(!run('q.activity'));advanceCorrect()}
 assert.equal(run('view'),'result');
}
atThird('subtraction',0,0);
assert.equal(run('q.activity'),'missing');
assert.equal(run('q.answer'),(run('q.visualHTML').match(/にんじんなし/g)||[]).length);
for(const stage of [1,2]){
 atThird('letters',stage,0);const q=run('q');assert.equal(q.activity,'chain');
 assert.equal(q.answer[0],q.chainWord.at(-1));assert.ok(q.choices.every(x=>x===q.answer||x[0]!==q.answer[0]));
 assert.equal(q.visualHTML.includes('<mark>'),stage===1);
 for(let i=0;i<2;i++){A.sayOption(i);assert.equal(spoken.at(-1),q.choices[i])}
 run('data.noListening=true');const n=spoken.length;A.sayOption(0);assert.equal(spoken.length,n);run('data.noListening=false');
 run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('session.done'),true);
}
console.log('PASS preschool turns, two-way touch, silence, correct first-attempt grading, kana levels');
for(const [id,size] of [['storyEquation',30],['paperPuzzle',12]]){
 const course=def(id).courses[0];run('session={auto:false,n:0,seen:{}}');
 const ids=new Set();
 for(let i=0;i<size;i++){
  const q=run('makeQuestion('+course+')');
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.equal(new Set(q.choices).size,3);
  assert.ok(q.waitForNext&&q.reviewText&&q.reviewHTML);
  if(id==='storyEquation'){
   const [a,op,b]=q.answer.split(' '),value=({'＋':+a + +b,'−':a-b,'÷':a/b,'×':a*b})[op];
   assert.ok(Number.isInteger(value));assert.ok(q.reviewText.includes(String(value)));
   if(q.id.startsWith('boxes-')||q.id.startsWith('share-')){
    const sizes=q.reviewHTML.split('class="ga-group">').slice(1).map(x=>(x.split('</span>')[0].match(/🍓/gu)||[]).length);
    assert.equal(sizes.reduce((a,b)=>a+b,0),Number(a));assert.ok(sizes.every(x=>x===(q.id.startsWith('boxes-')?Number(b):value)));
   }
  }else{
   assert.match(q.visualHTML,/stroke-dasharray/);assert.ok(q.choices.every(x=>q.choicePictures[x].includes('<svg')));
   assert.ok(q.reviewHTML.includes(q.id.endsWith('join')?'ga-close':'ga-open'));
  }
 }
}
console.log('PASS all story equations, both division interpretations, 12 cut and recombination puzzles');
for(const quiet of [false,true]){
 run('data.noListening='+quiet+';data.sound='+!quiet);focus('englishPictureSentence',0,0);
 const seen=new Set();
 for(let i=0;i<18;i++){
  if(i)run('englishNext()');
  const e=run('englishSession'),id=e.extensionQuestion.id;assert.ok(!seen.has(id));seen.add(id);
  assert.match(app.innerHTML,/lang="en"/);assert.equal(e.choices.length,2);assert.equal(e.readingAlternative,quiet);
  for(const [text,svg] of e.choices){
   assert.equal(text.split(' ')[1],e.word[0].split(' ')[1]);assert.equal(text.split(' ').at(-1),e.word[0].split(' ').at(-1));assert.ok(svg.includes('<svg'));
  }assert.notEqual(e.choices[0][0],e.choices[1][0]);assert.equal(e.choices.filter(x=>x[0]===e.word[0]).length,1);
 }
}
run("delete person().tileCycle;data.sound=false;data.noListening=true");
for(const [id,stage] of [['storyEquation',0],['letters',1],['englishPictureSentence',0]]){
 focus(id,stage,0);
 for(let n=0;n<5;n++){
  if(id==='englishPictureSentence')run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()");
  else advanceCorrect();
 }assert.equal(run('view'),'result');
}
assert.equal(run('person().tileCycle.pending'),true);
console.log('PASS 18 matched English scenes with and without sound, three complete sets and reward');
`)(require);
