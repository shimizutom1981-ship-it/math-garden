/* Versioned, browser-local estimates. Historical stats and rewards are never reset. */
(function(root){
 'use strict';
 const defs=[
  ['number','math',[0,1,2],null],['addition','math',[3,5],'number'],
  ['subtraction','math',[4,6],'number'],['mental','math',[9,13,14,15,17],'mathBorrow'],
  ['multiply','math',[10,16],'mathCarry'],['divide','math',[11],'multiply'],['fraction','math',[12],'divide'],
  ['letters','jp',[18,19],null],['words','jp',[21,27],'letters'],
  ['sentence','jp',[23,26,28],'words'],['reading','jp',[24,25,29,30],'sentence'],
  ['enWords','en',[0,1,2,3,4,5,6,7,8,9,10,11],null],
  ['enDescribe','en',[12,13,14,15,16,17,18,19],'enWords'],
  ['enSentence','en',[20,21,22,23,24,25,26,27],'enDescribe'],
  ['enReply','en',[28,29,30,31],'enSentence']
 ].map(([id,subject,courses,prerequisite])=>({id,subject,courses,prerequisite}));
 const mix=['fluent','fluent','challenge','fluent','fluent','review','fluent','challenge','fluent','fluent'];
 const bounded=(n,max)=>Number.isInteger(n)?Math.max(0,Math.min(max,n)):0;
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function state(p){
  if(!object(p.practice)||p.practice.version!==2){
   const previous=p.practice;
   p.practice={version:2,configured:!!previous?.configured,seed:0,skills:{},turns:{},rotations:{},sessions:{},limits:{},settings:{kanji:false,carry:false}};
   if(previous)p.practice.previous=previous; // Keep all old estimates as history, not proof of new concepts.
  }
  const a=p.practice;
  for(const k of ['skills','turns','rotations','sessions','limits','settings','recentItems','rangeLimits','lowerPresets'])if(!object(a[k]))a[k]={};
  return a;
 }
 function skill(p,d){
  const a=state(p);let s=a.skills[d.id];
  if(!object(s))s=a.skills[d.id]={level:0,total:0,misses:0,calibrating:false,times:[],support:0,stages:{}};
  s.level=bounded(s.level,d.courses.length-1);s.total=bounded(s.total,1e9);
  if(!object(s.stages))s.stages={};
  if(!Array.isArray(s.times))s.times=[];
  return s;
 }
 function configure(p,age,easy){
  const a=state(p);a.configured=true;a.seed=0; // Age never proves a prerequisite.
  if(easy){
   a.estimateHistory??=[];a.estimateHistory.push({skills:a.skills,sessions:a.sessions,rotations:a.rotations,lowerPresets:a.lowerPresets});
   a.skills={};a.sessions={};a.rotations={};a.recentItems={};a.lowerPresets={};a.settings.kanji=false;a.settings.carry=false;
  }
 }
 function absoluteLimit(p,d){const v=state(p).limits[d.id];return Number.isInteger(v)?Math.max(d.prerequisite?-1:0,Math.min(d.courses.length-1,v)):d.courses.length-1}
 function limit(p,d){const v=state(p).rangeLimits[d.id];return Math.min(absoluteLimit(p,d),Number.isInteger(v)?Math.max(d.prerequisite?-1:0,Math.min(d.courses.length-1,v)):d.courses.length-1)}
 function constrain(p,d,cap){
  const s=skill(p,d);if(s.level>Math.max(0,cap)){s.level=Math.max(0,cap);s.misses=0;s.support=0;
   for(const [index,stage] of Object.entries(s.stages))if(+index>=s.level){stage.mastered=false;stage.recent=[]}
  }
 }
 function setLimit(p,id,value){
  const d=defs.find(x=>x.id===id);if(!d||!Number.isInteger(value))return;
  const cap=Math.max(d.prerequisite?-1:0,Math.min(d.courses.length-1,value));state(p).limits[id]=cap;
  if(state(p).rangePreset)state(p).rangeCustomized=true;
  constrain(p,d,limit(p,d));
 }
 function setRange(p,id,value){const d=defs.find(x=>x.id===id);if(!d||!Number.isInteger(value))return;state(p).rangeLimits[id]=Math.max(d.prerequisite?-1:0,Math.min(d.courses.length-1,value));constrain(p,d,limit(p,d))}
 function mastered(p,d,index=d.courses.length-1){return !!skill(p,d).stages[index]?.mastered}
 function allowed(p,d,seen=new Set()){
  if(!d||seen.has(d.id)||limit(p,d)<0)return false;
  const a=state(p);if(d.kanji&&!a.settings.kanji||d.carry&&!a.settings.carry)return false;
  seen.add(d.id);
  const requirements=d.requires||(d.prerequisite?[d.prerequisite]:[]);
  return requirements.every(id=>{const pre=defs.find(x=>x.id===id);return pre&&((api.placementReady&&api.placementReady(p,pre))||allowed(p,pre,new Set(seen))&&mastered(p,pre))});
 }
 // Selection filters never change prerequisite evidence or saved difficulty limits.
 function selectable(p,d){return allowed(p,d)&&(!api.canSelect||api.canSelect(p,d))}
 function baseAvailable(p,subject){return defs.filter(d=>d.subject===subject&&selectable(p,d))}
 function available(p,subject){const ds=baseAvailable(p,subject);return api.filterAvailable?api.filterAvailable(p,subject,ds):ds}
 function floor(p,d,ds){return api.minimum?api.minimum(p,d,ds):0}
 function ceiling(p,d){
  let cap=limit(p,d);
  for(let i=1;i<=cap;i++)if(!(d.stageRequires?.[i]||[]).every(id=>{const pre=defs.find(x=>x.id===id);return pre&&((api.placementReady&&api.placementReady(p,pre))||allowed(p,pre)&&mastered(p,pre))})){cap=i-1;break}
  return cap;
 }
 function focus(p,subject){const ds=available(p,subject);return ds[bounded(state(p).rotations[subject],1e9)%ds.length]}
 function pick(p,subject,focusId){
  const a=state(p),requested=defs.find(x=>x.id===focusId&&x.subject===subject);
  const ds=requested&&selectable(p,requested)&&(!api.hasLower||!api.hasLower(p,subject))?[requested]:available(p,subject),d=requested&&ds.includes(requested)?requested:ds[bounded(a.rotations[subject],1e9)%ds.length],s=skill(p,d);
  const turn=bounded(a.turns[subject],1e9),mode=mix[turn%10];
  const minimum=floor(p,d,ds);if(s.level<minimum)s.level=minimum;
  let index=Math.min(s.level,ceiling(p,d)),kind=s.support?'prerequisite':mode;
  // Challenge means a different example of the current concept, never a new concept.
  if(!s.support&&mode==='review')index=Math.max(minimum,index-1);
  return {focus:d.id,skill:d.id,index,course:d.courses[index],kind,turn};
 }
 function record(p,item,clean,ms){
  const a=state(p),d=defs.find(x=>x.id===item.skill);if(!d)return;
  const s=skill(p,d),ok=!!clean&&!(Number.isFinite(ms)&&ms<450);
  a.recentItems[d.subject]=[...(Array.isArray(a.recentItems[d.subject])?a.recentItems[d.subject]:[]),{skill:d.id,index:item.index}].slice(-10);
  a.turns[d.subject]=bounded(a.turns[d.subject],1e9)+1;s.total++;
  const stage=s.stages[item.index]??={attempts:0,firstCorrect:0,recent:[],mastered:false};
  stage.attempts++;if(ok)stage.firstCorrect++;
  if(ok&&Number.isFinite(ms)&&ms>=450&&ms<=120000)s.times=[...s.times,ms].slice(-20);
  const evidence={ok:ok?1:0,example:item.example||item.variant||'regular',variant:item.form||item.variant||'regular',session:bounded(a.sessions[d.subject],1e9)};
  stage.recent=[...(stage.recent||[]),evidence].slice(-10);
  if(item.index!==s.level)return; // Review never promotes or demotes a different stage.
  if(!ok){
   s.misses=(s.misses||0)+1;
   // A repeated miss/hint on the same form counts even if a different form was correct between them.
   const sameForm=stage.recent.filter(x=>x.variant===evidence.variant).slice(-2);
   if(s.misses>=2||sameForm.length===2&&sameForm.every(x=>!x.ok)){
    for(const [key,value] of Object.entries(s.stages))if(+key>=Math.max(floor(p,d),s.level-1)){value.mastered=false;value.recent=[]}
    s.level=Math.max(floor(p,d),s.level-1);s.support=1;s.misses=0;
   }
   return;
  }
  s.misses=0;
  const recent=stage.recent,correct=recent.filter(x=>x.ok);
  const stable=recent.length===10&&recent.slice(0,5).reduce((n,x)=>n+x.ok,0)>=4&&recent.slice(5).reduce((n,x)=>n+x.ok,0)>=4;
  const varied=new Set(correct.map(x=>x.example)).size>=Math.min(4,d.exampleCount||4)&&new Set(correct.map(x=>x.variant)).size>=(d.variantCount||1);
  const repeated=new Set(correct.map(x=>x.session)).size>=2;
  if(stable&&varied&&repeated){stage.mastered=true;s.support=0;s.level=Math.min(s.level+1,ceiling(p,d),d.courses.length-1);if(api.onMastered)api.onMastered(p,d)}
 }
 function complete(p,subject){const a=state(p);a.rotations[subject]=bounded(a.rotations[subject],1e9)+1;a.sessions[subject]=bounded(a.sessions[subject],1e9)+1}
 const api={defs,mix,state,configure,skill,focus,pick,record,complete,available,baseAvailable,floor,allowed,mastered,limit,absoluteLimit,ceiling,setLimit,setRange};
 if(typeof module==='object')module.exports=api;else root.Practice=api;
})(typeof globalThis==='object'?globalThis:this);


