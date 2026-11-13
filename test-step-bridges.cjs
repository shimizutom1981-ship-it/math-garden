const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const B=c.StepBridges,def=id=>P.defs.find(d=>d.id===id);
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const kanji=/[㐀-鿿]/u;
function place(id,stage,extra=''){
 run('for(const d of Practice.defs){const s=Practice.skill(person(),d);Object.assign(s,{level:d.courses.length-1,support:0,misses:0});delete s.gentleBridge;delete s.pendingGentle;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}'+
  '{const a=Practice.state(person());a.settings={kanji:true,carry:true,pace:"standard"};a.lowerPresets={};a.rangeLimits={};a.limits={};a.stepBridges={};a.turns={}}');
 run('{const d=foundationById("'+id+'"),s=Practice.skill(person(),d);s.level='+stage+';for(let i='+stage+';i<d.courses.length;i++)s.stages[i]={mastered:false,attempts:0,firstCorrect:0,recent:[]};'+extra+'}');
 const d=def(id);run('subject="'+d.subject+'";view="quiz";session={i:'+d.courses[stage]+',auto:true,practiceFocus:"'+id+'",seen:{},n:0,correct:0,misses:0}');
}
const skillState=id=>run('JSON.parse(JSON.stringify(Practice.skill(person(),foundationById("'+id+'"))))');
const bridge=key=>run('JSON.parse(JSON.stringify(Practice.state(person()).stepBridges["'+key+'"]||null))');
function nextAt(stage){for(let n=0;n<20;n++){run('nextQuestion()');if(run('practiceItem&&practiceItem.index')===stage)return run('q');reply(true)}throw new Error('stage not reached '+JSON.stringify(run('[practiceItem,view,session&&session.n,Practice.skill(person(),foundationById("addition")).level,Practice.state(person()).stepBridges]')))}
function reply(correct){run('practiceClock.start-=2000');run('answer('+(correct?'q.choices.indexOf(q.answer)':'q.choices.findIndex(x=>x!==q.answer)')+',document.createElement("button"))');run('session.n=0')}
function checkQuestion(q){
 assert.ok(Array.isArray(q.choices));assert.equal(new Set(q.choices.map(String)).size,q.choices.length);
 assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.doesNotMatch(String(q.text)+(q.hint||'')+(q.visual||'')+q.choices.join(''),kanji);
}

test('bridge data: categories, odd-one-out and opposite pairs are unambiguous and kana only',()=>{
 assert.equal(B.OPPOSITES.length,11);assert.equal(B.opposites.length,22);
 assert.equal(new Set(B.OPPOSITES.flatMap(x=>[x[1],x[3]])).size,22);
 const member=x=>B.CATEGORIES.findIndex(c=>c[1].includes(x));
 for(const x of B.together){assert.equal(member(x.shown[0]),member(x.answer));assert.equal(member(x.shown[1]),member(x.answer));assert.notEqual(member(x.other),member(x.answer));assert.ok(!x.shown.includes(x.answer))}
 for(const x of B.oddOne){assert.equal(member(x.same[0]),member(x.same[1]));assert.notEqual(member(x.answer),member(x.same[0]));assert.notEqual(x.same[0],x.same[1])}
 assert.equal(B.teenFacts.length,36);for(const [a,b] of B.teenFacts){assert.ok(a>=11&&a<=18&&b>=1);assert.ok(a%10+b<10)}
});

test('every bridge step renders valid questions with the planned choice count and pictures',()=>{
 for(const [key,plan] of Object.entries(B.PLANS)){
  const [id,stage]=key.split(':');
  plan.steps.forEach((step,k)=>{
   place(id,+stage);run('Practice.state(person()).stepBridges["'+key+'"]={step:'+k+',run:0,miss:0,clean:0}');
   let seen=0;
   for(let n=0;n<60;n++){run('nextQuestion()');if(run('practiceItem.index')!==+stage)continue;const q=run('q');
    assert.equal(q.stepBridge.step,k);assert.equal(q.stepBridge.form,step.form);assert.equal(q.choices.length,step.choices);checkQuestion(q);seen++;
    if(id!=='words'){assert.ok(q.visualHTML);assert.equal(q.visualHTML.includes('sb-reveal'),step.form.endsWith('reveal'))}
    if(key==='addition:3'){assert.ok(q.answer>=11&&q.answer<=19);if(q.a&&q.b)assert.equal(q.answer,q.a+q.b)}
    if(id==='mathDecompose'){const total=+stage?10:5,part=+q.text.split(' ')[0];assert.equal(q.answer,total-part);assert.ok(q.choices.every(x=>x>=1&&x<total))}
    if(step.form.includes('opposite')){const x=B.opposites.find(o=>q.text==='「'+o.word+'」の はんたいは？');assert.ok(x);assert.ok(String(q.answer).endsWith(x.opp))}
   }
   assert.ok(seen>=40);
  });
 }
});

test('fresh teen addition walks 10-and → 10+k → teen+picture → picture button → original, without stage evidence',()=>{
 place('addition',3);const forms=[];
 for(let n=0;n<40&&forms.length<5;n++){const q=nextAt(3);const form=q.stepBridge?q.stepBridge.form:'original';if(forms.at(-1)!==form)forms.push(form);
  if(q.stepBridge){reply(true);assert.equal(skillState('addition').stages[3].recent.length,0);assert.equal(skillState('addition').level,3)}}
 assert.deepEqual(forms,['ten-and','ten-plus','teen-plus-picture','teen-plus-reveal','original']);
 const q=run('q');assert.equal(q.stepBridge,undefined);assert.ok(!q.visualHTML);assert.equal(q.choices.length,3);
 assert.equal(skillState('addition').stages[3].mastered,false);
 // Bridge answers are still logged as attempts and in the subject turn counter.
 assert.ok(skillState('addition').stages[3].attempts>=12);
});

test('bridge misses step back one step and never demote the stage; first step cannot fall lower',()=>{
 place('addition',3);run('Practice.state(person()).stepBridges["addition:3"]={step:2,run:0,miss:0,clean:0}');
 nextAt(3);reply(false);nextAt(3);reply(false);
 assert.equal(bridge('addition:3').step,1);let s=skillState('addition');assert.equal(s.level,3);assert.equal(s.support,0);assert.equal(s.misses,0);
 run('Practice.state(person()).stepBridges["addition:3"].step=0');for(let n=0;n<6;n++){nextAt(3);reply(false)}
 assert.equal(bridge('addition:3').step,0);s=skillState('addition');assert.equal(s.level,3);
 // A correct answer between misses resets the miss count.
 run('Practice.state(person()).stepBridges["addition:3"]={step:2,run:0,miss:0,clean:0}');nextAt(3);reply(false);nextAt(3);reply(true);nextAt(3);reply(false);assert.equal(bridge('addition:3').step,2);
});

test('a step down from the original question returns later with one picture step first',()=>{
 place('addition',3);run('Practice.state(person()).stepBridges["addition:3"]={step:4,run:0,miss:0,clean:0}');
 nextAt(3);reply(false);nextAt(3);reply(false);
 assert.equal(skillState('addition').level,2);assert.equal(bridge('addition:3').step,3);
 run('{const s=Practice.skill(person(),foundationById("addition"));s.level=3;s.support=0;s.misses=0}');
 const q=nextAt(3);assert.equal(q.stepBridge.form,'teen-plus-reveal');
});

test('learners already steady on a stage keep the original question; mastered or review stages are never bridged',()=>{
 place('addition',3,'s.stages[3].recent=Array.from({length:10},(_,k)=>({ok:k<9?1:0,example:"e"+k,variant:"combine",session:k>>2}))');
 let q=nextAt(3);assert.equal(q.stepBridge,undefined);assert.equal(bridge('addition:3').step,4);
 place('multiply',0);run('{const s=Practice.skill(person(),foundationById("addition"));}');
 assert.equal(run('StepBridges.stepFor(person(),"addition",3)'),null);
 place('mathDecompose',1);run('Practice.skill(person(),foundationById("mathDecompose")).stages[1].mastered=true');assert.equal(run('StepBridges.stepFor(person(),"mathDecompose",1)'),null);
});

test('make-5, make-10 and opposites bridges advance in order; gentle pace needs four in a row',()=>{
 for(const [id,stage,forms] of [['mathDecompose',0,['hand-two','hand-three','original']],['mathDecompose',1,['frame-two','hands-three','frame-reveal','original']],['words',0,['together','odd-one','picture-opposite','word-opposite','original']]]){
  place(id,stage);const seen=[];
  for(let n=0;n<40&&seen.at(-1)!=='original';n++){const q=nextAt(stage),form=q.stepBridge?q.stepBridge.form:'original';if(seen.at(-1)!==form)seen.push(form);if(q.stepBridge)reply(true)}
  assert.deepEqual(seen,forms);
 }
 place('mathDecompose',1);run('Practice.state(person()).settings.pace="gentle"');
 let answered=0;while(bridge('mathDecompose:1')?.step!==1){const q=nextAt(1);assert.ok(q.stepBridge);reply(true);answered++;assert.ok(answered<=4)}
 assert.equal(answered,4);
});

test('B: a new stage starts with two choices and a visible picture, then returns to the original choices',()=>{
 place('mathCarry',0);
 let q=nextAt(0);assert.equal(q.choices.length,2);assert.ok(q.stepIntro);assert.ok(q.visualHTML.includes('sb-frame'));checkQuestion(q);
 assert.equal((q.visualHTML.match(/sb-cell sb-a/g)||[]).length,q.a);assert.equal((q.visualHTML.match(/sb-cell sb-b/g)||[]).length,q.b);
 for(let n=0;n<3;n++){q=nextAt(0);assert.ok(q.stepIntro);reply(true)}
 q=nextAt(0);assert.ok(!q.stepIntro);assert.equal(q.choices.length,3);assert.ok(!q.visualHTML);
 // Intro answers are ordinary stage evidence, so the existing promotion rules still apply.
 assert.equal(skillState('mathCarry').stages[0].recent.length,3);
 place('letters',2);q=nextAt(2);if(!q.activity)assert.equal(q.choices.length,2);
});

test('C: after a first wrong answer the picture appears, a hidden picture opens and one more wrong choice fades',()=>{
 const inserted=[],opened=[];let buttons=[];
 const fake=()=>({insertAdjacentHTML:(where,html)=>inserted.push(html),setAttribute:(k)=>opened.push(k),classList:{add(){},remove(){},toggle(){}}});
 const saved={qs:document.querySelector,qa:document.querySelectorAll};
 document.querySelector=s=>s==='#app'?app:(s==='.choices'||s==='.sb-reveal')?fake():element();
 document.querySelectorAll=s=>s==='.choice'?buttons:[];
 try{
  run('session={auto:false,seen:{},n:0,done:false,help:false,wrong:false};q={type:"mathExtended",text:"8 ＋ 5 ＝ ？",answer:"13",choices:["12","13","15","11"],meta:{op:"add",a:8,b:5},i:58};q.stepSupport=StepBridges.supportFor(q)');
  buttons=[0,1,2,3].map(()=>({disabled:false,classList:{add(){}}}));
  run('answer(0,{disabled:false})');buttons[0].disabled=true;run('q.stepMissSupported=false;StepBridges.afterMiss()');
  assert.ok(inserted.some(h=>h.includes('sb-support')&&(h.match(/sb-cell sb-a/g)||[]).length===8&&(h.match(/sb-cell sb-b/g)||[]).length===5));
  assert.equal(buttons.filter(b=>b.disabled).length,2);assert.equal(buttons[1].disabled,false);assert.equal(buttons[2].disabled,true);
  assert.ok(opened.includes('open'));
  // Questions that already show a picture or an activity are left as they are.
  inserted.length=0;run('q={type:"add",text:"2 ＋ 1 ＝ ？",answer:3,choices:[2,3,4],visualHTML:"<div></div>",a:2,b:1};q.stepSupport=StepBridges.supportFor(q)');
  assert.equal(run('q.stepSupport'),'');
 }finally{document.querySelector=saved.qs;document.querySelectorAll=saved.qa}
 assert.equal(B.supportFor({text:'3 に あと いくつで 10？',answer:7,choices:[6,7,8]}).match(/sb-cell sb-a/g).length,3);
 assert.equal(B.supportFor({type:'mathExtended',text:'15 − 8 ＝ ？',meta:{op:'subtract',a:15,b:8}}).match(/sb-cell sb-x/g).length,8);
 assert.equal(B.supportFor({type:'mathExtended',text:'35 ＋ 8 ＝ ？',meta:{op:'add',a:35,b:8}}),'');
});

test('progress survives JSON backup; easy restart clears steps but keeps records and rewards',()=>{
 place('addition',3);for(let n=0;n<4;n++){nextAt(3);reply(true)}
 const saved=run('JSON.stringify(person())'),copy=JSON.parse(saved);assert.equal(copy.practice.stepBridges['addition:3'].step,1);
 const coins=run('person().game.coins'),stats=run('JSON.stringify(person().stats)');
 run('Practice.configure(person(),null,true)');assert.equal(run('JSON.stringify(Practice.state(person()).stepBridges)'),'{}');
 assert.equal(run('person().game.coins'),coins);assert.equal(run('JSON.stringify(person().stats)'),stats);
});

test('D: step audit — every picture drop or range jump on the preschool–grade 1 path has a bridge or an intro picture',()=>{
 const path={number:[0,1,2],addition:[0,1,2,3],subtraction:[0,1],mathDecompose:[0,1],mathCarry:[0,1],mathBorrow:[0],letters:[0,1,2],words:[0,1]};
 const nums=q=>[q.a,q.b,q.answer,q.meta?.a,q.meta?.b,...String(q.text).match(/\d+/g)||[]].map(Number).filter(Number.isFinite);
 const profile={};
 for(const [id,stages] of Object.entries(path))for(const k of stages){
  let picture=0,support=0,max=0;run('session={auto:false,seen:{}}');
  for(let n=0;n<120;n++){const q=run('makeQuestion('+def(id).courses[k]+')');
   if(q.visualHTML||q.objects||q.pictureClue||q.activity||(q.type==='jp'&&/\p{Extended_Pictographic}/u.test(q.visual||'')))picture++;
   if(B.supportFor(q))support++;max=Math.max(max,...nums(q),0)}
  profile[id+':'+k]={picture:picture/120,support:support/120,max};
 }
 const gaps=[];
 for(const [id,stages] of Object.entries(path))for(let n=1;n<stages.length;n++){
  const a=profile[id+':'+stages[n-1]],b=profile[id+':'+stages[n]],key=id+':'+stages[n];
  const reasons=[];if(a.picture>=.5&&b.picture<.5)reasons.push('picture drop');if(a.max&&b.max>2*a.max)reasons.push('range '+a.max+'→'+b.max);
  if(reasons.length)gaps.push({key,reasons});
 }
 // Preschool–grade 1 math answered from text alone, with no picture to count.
 for(const [key,v] of Object.entries(profile))if(v.max&&v.picture<.5&&!gaps.some(g=>g.key===key))gaps.push({key,reasons:['no picture']});
 // Range across skills: teen addition must not appear before teen numbers have been introduced.
 if(profile['addition:3'].max>profile['number:2'].max)gaps.push({key:'addition:3',reasons:['beyond counting range']});
 // Concept jump flagged by review: opposite words right after kana reading.
 gaps.push({key:'words:0',reasons:['abstract concept']});
 const covered=key=>{const plan=B.PLANS[key];if(plan)return plan.steps[0].choices===2;const [id,k]=key.split(':');return (B.INTRO[id]||[]).includes(+k)&&profile[key].support>=.9};
 for(const g of gaps)console.log('  gap '+g.key+' ('+g.reasons.join(', ')+') → '+(B.PLANS[g.key]?'bridge steps':(covered(g.key)?'intro picture':'UNCOVERED')));
 assert.ok(gaps.length>=6);assert.deepEqual(gaps.filter(g=>!covered(g.key)).map(g=>g.key),[]);
 assert.ok(B.PLANS['addition:3'].steps[0].form==='ten-and');
});

test('three subjects still complete as 5-question sets with one reward each',()=>{
 run('Practice.configure(person(),null,true);delete person().tileCycle');const coins=run('person().game.coins');
 for(const subject of ['math','jp']){run("start(recommendationFor('"+subject+"'),true)");for(let n=0;n<5;n++){run('practiceClock.start-=2000');run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}assert.equal(run('view'),'result')}
 assert.ok(run('person().game.coins')>coins);
});
console.log(passed+' step-bridge tests passed');
`)(require);
