const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const button=()=>document.createElement('button');
const W=run("GardenWorkshop");
run("for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}person().practiceFlow={freeChoice:true,next:'math'};Practice.setGentle(person(),true);data.sound=false;data.noListening=true");
function focus(skill,stage,n,set=2){
 const d=P.defs.find(d=>d.id===skill),p=run('person()'),state=P.skill(p,d);
 Object.assign(state,{level:stage,support:0,misses:0});delete state.gentleBridge;delete state.pendingGentle;
 P.state(p).sessions[d.subject]=set;P.state(p).turns[d.subject]=0;
 run('home();startSelectedPractice('+JSON.stringify(skill)+')');
 if(d.subject==='en')run('englishSession.n='+n+';englishNext()');
 else run('session.n='+n+';nextQuestion()');
 assert.equal(run('practiceItem.skill'),skill);
}
for(const [skill,stage,kind] of [['letters',1,'sounds'],['letters',2,'sounds'],['compare',0,'acorns'],['lifeLength',0,'pencil'],['lifeLength',1,'pencil'],['readingConditions',0,'memo'],['readingConditions',1,'memo'],['readingConditions',2,'memo'],['multiply',0,'seedlings'],['multiply',1,'seedlings'],['multiply',2,'seedlings']]){
 focus(skill,stage,2);
 for(let i=0;i<25;i++){
  if(i)run('nextQuestion()');
  const q=run('q');assert.equal(q.workshop,kind);assert.equal(q.choices.filter(x=>x===q.answer).length,1);
  assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.practice.skill,skill);
  if(kind==='sounds'){assert.equal(q.names[0][0],q.names[1][0]);assert.equal(q.answer,q.names[0].length===q.names[1].length?'おなじ':Array.from(q.names).sort((a,b)=>a.length-b.length)[0]);assert.equal(q.choices.includes('おなじ'),stage===2);assert.ok(!q.visualHTML.includes('onclick="GardenWorkshop.say'))}
  if(kind==='acorns'){assert.equal(q.answer==='おなじ',q.upper===q.lower);assert.equal(q.visualHTML.split('class="gw-link"').length-1,Math.min(q.upper,q.lower));assert.equal(q.choices.length,3);assert.ok(q.upper<=q.lower||q.answer==='うえが おおい')}
  if(kind==='pencil'){assert.equal(q.answer,q.length+' cm');assert.equal(q.start===0,stage===0);assert.equal(q.visualHTML.split('class="gw-unit"').length-1,q.length);if(stage){W.slide(button());assert.ok(q.aligned);W.slide(button());assert.equal(q.aligned,false);assert.equal(run('session.help'),true)}}
  if(kind==='memo'){assert.equal(q.visualHTML.split('class="gw-pot-card"').length-1,stage===2?3:2);if(stage===2){assert.ok(q.answer.endsWith('あかい はち'));for(const choice of q.choices)assert.equal(q.matches[choice].length,choice===q.answer?1:2)}}
  if(kind==='seedlings'){assert.equal(q.answer,(q.rows+1)*q.per);if(!stage)assert.ok(q.answer<=12);if(stage===1)assert.ok([2,5].includes(q.per));assert.equal(q.visualHTML.includes('ひとれつ うえる'),stage<2);if(stage<2){const b=button();W.plant(b);assert.ok(b.disabled);assert.equal(b.innerHTML.split('🌱').length-1,q.per)}}
 }
 const state=P.skill(run('person()'),P.defs.find(d=>d.id===skill)),total=state.total;
 run("practiceClock.start-=2000;answer(q.choices.findIndex(x=>x!==q.answer),document.createElement('button'))");
 assert.equal(run('session.done'),false);assert.equal(run('session.help'),true);
 run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");
 assert.equal(run('session.done'),true);assert.equal(state.total,total+1);assert.ok(run('autoNextTimer!==null'));
}
focus('compare',0,2);
P.skill(run('person()'),P.defs.find(d=>d.id==='compare')).stages[0].mastered=false;
run('nextQuestion()');
assert.equal(run('q.choices.length'),2);assert.ok(run('q.lower>=q.upper'));
focus('readingConditions',2,2);
const memo=run('q'),cards=[0,1,2].map(pot=>({dataset:{pot},classList:{toggle(_,value){this.selected=value}}}));
const selectAll=document.querySelectorAll;
document.querySelectorAll=selector=>selector==='.gw-pot-card'?cards:selectAll(selector);
for(const choice of [...memo.choices.filter(x=>x!==memo.answer),memo.answer]){
 run('answer('+memo.choices.indexOf(choice)+',document.createElement("button"))');
 assert.deepEqual(cards.filter(card=>card.classList.selected).map(card=>card.dataset.pot),Array.from(memo.matches[choice]).sort());
 assert.equal(run('session.done'),choice===memo.answer);
}
document.querySelectorAll=selectAll;
console.log('PASS introductory choices and watering highlights on two retries and success');
console.log('PASS guided math/Japanese routing, 275 items, visual helpers, retries and one score per item');
for(const audible of [false,true]){
 const spoken=[];c.speechSynthesis={cancel(){},getVoices(){return[]},speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('data.sound='+audible+';data.noListening='+!audible);
 focus('letters',1,2);const names=run('q.names');assert.equal(app.innerHTML.includes('onclick="GardenWorkshop.say'),audible);
 if(audible){W.say(1,button());assert.equal(spoken.slice(-names[1].length).join(''),names[1]);assert.equal(run('session.done'),false)}
 focus('enWords',4,1);const e=run('englishSession');assert.equal(e.curriculumKind,'にわっちの おつかい');assert.ok(e.audioTarget.endsWith(', please!'));assert.equal(e.readingAlternative,!audible);
 if(audible)assert.equal(spoken.at(-1),e.audioTarget);
 run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(x=>x[0]!==englishSession.word[0]),document.createElement('button'))");
 assert.equal(e.done,false);assert.equal(e.help,true);
 run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");
 assert.equal(e.done,true);assert.ok(run('autoNextTimer!==null'));run('englishAdvance()');assert.equal(e.n,2);assert.notEqual(e.curriculumKind,'にわっちの おつかい');
 focus('enWords',8,1);assert.match(run('englishSession.audioTarget'),/^The .+ card, please!$/);
 run("EnglishSteps.entry(person(),'color').manual=false");focus('enDescribe',0,1);
 assert.equal(run('englishSession.curriculumKind'),'にわっちの おつかい');assert.match(run('englishSession.audioTarget'),/^A .+ ball, please!$/);
 run("EnglishSteps.reset(person());EnglishSteps.entry(person(),'color').step=1");
 focus('enDescribe',0,1);const color=run('englishSession');assert.equal(color.englishStep.kind,'phrase');assert.equal(color.curriculumKind,'にわっちの おつかい');assert.match(color.audioTarget,/^A (red|green) apple, please!$/);
 assert.deepEqual(Array.from(color.choices,w=>w[1]).sort(),['🍎','🍏'].sort());
 const steps=run("EnglishSteps.entry(person(),'color').attempts");run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");
 assert.equal(run("EnglishSteps.entry(person(),'color').attempts"),steps+1);
}
console.log('PASS spoken and silent errands, picture-word replay, single-tap delivery, and separate color-step scoring');
focus('letters',2,2);
for(let i=0;i<12&&run('q.answer')!=='おなじ';i++)run('nextQuestion()');
assert.equal(run('q.answer'),'おなじ');
run("answer(q.choices.indexOf('おなじ'),document.createElement('button'))");assert.equal(run('session.done'),true);
// Answer through the same five-question flow as the learner.
const rational=P.defs.find(d=>d.id==='mathRational'),firstCourse=rational.courses[0];
run('delete person().stats['+firstCourse+']');
focus('mathRational',0,0);
for(const expected of ['1/2 m','1/2 m','1/4 m','3/4 m','3/4 L']){
 assert.equal(run('q.answer'),expected);
 if(run('session.n')===0)run('showHint()');
 run("practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");
}
assert.equal(run('view'),'result');
`)(require);
