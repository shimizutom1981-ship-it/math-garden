/* Deterministic, browser-local practice. No reward, identity or inventory writes. */
(function(root){
 'use strict';
 const defs=[
  ['number','math',[0,1,2],null],['addition','math',[3,5,7], 'number'],
  ['subtraction','math',[4,6,8],'number'],['mental','math',[9,13,14,15,17],'addition'],
  ['multiply','math',[10,16],'addition'],['divide','math',[11],'multiply'],['fraction','math',[12],'divide'],
  ['letters','jp',[18,19,20],null],['words','jp',[21,22,27],'letters'],
  ['sentence','jp',[23,26,28],'letters'],['reading','jp',[24,25,29,30],'sentence'],
  ['enWords','en',[0,1,2,3,4,5,6,7,8,9,10,11],null],
  ['enDescribe','en',[12,13,14,15,16,17,18,19],'enWords'],
  ['enSentence','en',[20,21,22,23,24,25,26,27],'enDescribe'],
  ['enReply','en',[28,29,30,31],'enSentence']
 ].map(([id,subject,courses,prerequisite])=>({id,subject,courses,prerequisite}));
 const mix=['fluent','fluent','challenge','fluent','fluent','review','fluent','challenge','fluent','fluent'];
 const bounded=(n,max)=>Number.isInteger(n)?Math.max(0,Math.min(max,n)):0;
 function state(p){
  if(!p.practice||p.practice.version!==1)p.practice={version:1,configured:false,seed:0,skills:{},turns:{},rotations:{}};
  const a=p.practice;for(const k of ['skills','turns','rotations'])if(!a[k]||typeof a[k]!=='object'||Array.isArray(a[k]))a[k]={};
  a.seed=bounded(a.seed,3);return a;
 }
 function configure(p,age,easy){
  const a=state(p); // Store only a coarse starting seed, never the entered age.
  a.seed=easy||!Number.isFinite(age)||age<3||age>120?0:age<8?0:age<11?1:age<15?2:3;
  a.configured=true;
  for(const d of defs){const s=a.skills[d.id];if(s&&s.total===0)delete a.skills[d.id]}
 }
 function skill(p,d){
  const a=state(p);let s=a.skills[d.id];
  if(!s||typeof s!=='object'){
   let level=Math.min(d.courses.length-1,a.seed);
   // Actual per-course evidence wins over a subject-wide legacy cursor.
   d.courses.forEach((c,j)=>{const old=d.subject==='en'?null:p.stats?.[c];if(old?.total>=4&&old.ok/old.total>=.8)level=Math.max(level,j)});
   if(d.subject==='en'&&p.english?.total>=4&&d.courses.includes(p.english.level))level=Math.max(level,d.courses.indexOf(p.english.level));
   s=a.skills[d.id]={level,total:0,block:[],misses:0,calibrating:true,times:[],support:0,retry:null};
  }
  s.level=bounded(s.level,d.courses.length-1);s.total=bounded(s.total,1000000000);
  s.block=Array.isArray(s.block)?s.block.filter(x=>x===0||x===1).slice(-9):[];
  s.times=Array.isArray(s.times)?s.times.filter(Number.isFinite).slice(-20):[];
  s.support=bounded(s.support,2);s.misses=bounded(s.misses,3);
  return s;
 }
 function upperEnglishReady(p){const d=defs.find(x=>x.id==="enReply"),s=skill(p,d);return state(p).seed>=2||(s.total>=20&&s.level===d.courses.length-1)}
 function available(p,subject){return defs.filter(d=>d.subject===subject&&(!d.upperEnglish||upperEnglishReady(p))&&(!d.prerequisite||state(p).seed>0||skill(p,defs.find(x=>x.id===d.prerequisite)).total>=4&&skill(p,defs.find(x=>x.id===d.prerequisite)).level>=Math.min(1,defs.find(x=>x.id===d.prerequisite).courses.length-1)))}
 function focus(p,subject){const ds=available(p,subject),a=state(p);return ds[bounded(a.rotations[subject],1000000000)%ds.length]}
 function pick(p,subject,focusId){
  const a=state(p),d=defs.find(x=>x.id===focusId)||focus(p,subject),s=skill(p,d);
  const turn=bounded(a.turns[subject],1000000000),mode=mix[turn%10];
  let target=d,index=s.level,kind=mode;
  if(s.support){kind='prerequisite';if(index>0)index--;else if(d.prerequisite){target=defs.find(x=>x.id===d.prerequisite);index=skill(p,target).level}}
  else if(Number.isInteger(s.retry)){kind='retry';index=bounded(s.retry,d.courses.length-1)}
  else if(mode==='challenge')index=Math.min(index+1,d.courses.length-1);
  else if(mode==='review')index=Math.max(0,index-1);
  return {focus:d.id,skill:target.id,index,course:target.courses[index],kind,turn,variant:kind==='retry'?s.retryVariant:undefined};
 }
 function record(p,item,clean,ms){
  const a=state(p),d=defs.find(x=>x.id===item.skill);if(!d)return;
  const s=skill(p,d),owner=skill(p,defs.find(x=>x.id===item.focus));
  a.turns[d.subject]=bounded(a.turns[d.subject],1000000000)+1;
  // First attempt is recorded immediately, including abandoned wrong answers.
  // Very fast clicks cannot supply mastery evidence. Slow correct is always valid.
  const rapid=Number.isFinite(ms)&&ms<450,ok=!!clean&&!rapid;
  s.total++;s.block.push(ok?1:0);s.block=s.block.slice(-10);
  if(!s.stages||typeof s.stages!=='object')s.stages={};
  const key=item.index+':'+(item.variant||'regular');
  const stage=s.stages[key]||(s.stages[key]={attempts:0,firstCorrect:0,misses:0});
  stage.attempts++;if(ok){stage.firstCorrect++;stage.misses=0}else stage.misses=(stage.misses||0)+1;
  if(ok&&Number.isFinite(ms)&&ms>=450&&ms<=120000)s.times.push(ms);
  s.times=s.times.slice(-20);
  if(item.kind==='prerequisite'){owner.support=Math.max(0,owner.support-1);return}
  if(item.kind==='retry')owner.retry=null;
  if(!ok){s.misses++;if(s.misses>=2||stage.misses>=2){s.support=2;s.retry=item.index;s.retryVariant=item.variant;s.misses=0;s.block=[];s.calibrating=false}return}
  s.misses=0;
  // Review below the current level is deliberately not promotion evidence.
  if(item.index<s.level){s.block.pop();return}
  const n=s.calibrating?4:10;
  if(s.block.length>=n){
   const block=s.block.slice(-n),wins=block.reduce((x,y)=>x+y,0);
   if(wins>=(s.calibrating?4:9)){s.level=Math.min(s.level+1,d.courses.length-1);s.block=[]}
   else {s.calibrating=false;s.block=[]}
  }
 }
 function complete(p,subject){const a=state(p);a.rotations[subject]=bounded(a.rotations[subject],1000000000)+1}
 const api={defs,mix,state,configure,skill,focus,pick,record,complete};
 if(typeof module==='object')module.exports=api;else root.Practice=api;
})(typeof globalThis==='object'?globalThis:this);
