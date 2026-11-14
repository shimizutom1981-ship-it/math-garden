/* Small, picture-supported English steps inside existing courses.
 * Preparation has its own evidence: it never counts as sentence mastery.
 * No course IDs, parent caps, placements, other subjects or rewards are changed.
 */
(function(root){
 'use strict';
 const colors=[['red','#df5757','あか'],['blue','#589ad6','あお'],['green','#72af76','みどり'],['yellow','#e9c849','きいろ']];
 const animals=[['cat','🐱','ねこ'],['dog','🐶','いぬ'],['rabbit','🐰','うさぎ'],['bear','🐻','くま'],['bird','🐦','とり'],['fish','🐟','さかな']];
 const actions=[['running','はしっている','🏃'],['sleeping','ねている','😴'],['eating','たべている','🍽️']];
 const places=[['on','うえ','above'],['under','した','under'],['next to','よこ','beside']];
 const banks={},plans={color:['color','phrase'],number:['number','count'],action:['animalSentence','action','actionSentence'],place:['animalSentence','place','placeSentence','beside'],reply:['greeting']};
 const labels={color:'いろの ことば',phrase:'いろと もの',number:'かずの ことば',count:'かずと どうぶつ',animalSentence:'みじかい ぶん',action:'うごきの ことば',actionSentence:'どうぶつの うごき',place:'ばしょの ことば',placeSentence:'ばしょの みじかい ぶん',beside:'よこの ばしょ',greeting:'みじかい やりとり'};
 function add(kind,id,text,meaning,choices,help=''){
  (banks[kind]??=[]).push({id:kind+':'+id,text,meaning,choices,help});
 }
 const ball=color=>'<svg viewBox="0 0 100 85" width="100" height="85" role="img" aria-label="'+color[2]+'の ボール"><circle cx="50" cy="42" r="30" fill="'+color[1]+'" stroke="#52616a" stroke-width="3"/></svg>';
 colors.forEach((c,i)=>{
  const other=colors[(i+1)%colors.length],opts=[c,other].map(x=>[x[0],ball(x),x[2]]);
  add('color',c[0],c[0],c[2],opts);
  add('phrase',c[0],'a '+c[0]+' ball',c[2]+'の ボール',opts,'a ball は「ボール」だよ。いろの ことばを みつけよう。');
 });
 const numbers=[['one',1],['two',2],['three',3]];
 numbers.forEach((n,i)=>{
  add('number',n[0],n[0],String(n[1]),[n,numbers[(i+1)%3]].map(x=>[x[0],'●'.repeat(x[1]),String(x[1])]));
  for(const animal of animals.slice(0,3)){
   const word=animal[0]+(n[1]===1?'':'s');
   add('count',n[0]+animal[0],n[0]+' '+word,animal[2]+n[1]+'ひき',[n,numbers[(i+1)%3]].map(x=>[x[0],animal[1].repeat(x[1]),animal[2]+x[1]+'ひき']),animal[0]+' は「'+animal[2]+'」。かずを みよう。');
  }
 });
 animals.forEach((a,i)=>add('animalSentence',a[0],'It is a '+a[0]+'.','これは '+a[2]+'です。',[a,animals[(i+1)%animals.length]].map(x=>[x[0],x[1],x[2]]),'It is a ... は「これは …です」。さいごの ことばを みよう。'));
 actions.forEach((a,i)=>{
  add('action',a[0],a[0],a[1],[a,actions[(i+1)%3]].map(x=>[x[0],x[2],x[1]]));
  for(const animal of animals.slice(0,2)){
   add('actionSentence',animal[0]+a[0],'The '+animal[0]+' / is '+a[0]+'.',animal[2]+'が '+a[1],[a,actions[(i+1)%3]].map(x=>[x[0],animal[1]+' '+x[2],animal[2]+'が '+x[1]]),'The '+animal[0]+' は「'+animal[2]+'」。うごきの ことばを みよう。');
  }
 });
 function scene(animal,place){
  const [x,y]={'on':[52,40],'under':[52,85],'next to':[110,85]}[place[0]];
  return '<svg viewBox="0 0 140 105" width="140" height="105" role="img" aria-label="'+animal[2]+'が つくえの '+place[1]+'"><path d="M22 47 H82 M28 49 V96 M76 49 V96" fill="none" stroke="#795333" stroke-width="6"/><text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="28">'+animal[1]+'</text></svg>';
 }
 for(const a of animals.slice(0,3))for(const [i,p] of places.entries()){
  const opts=[p,places[i===0?1:0]].map(x=>[x[0],scene(a,x),a[2]+'が つくえの '+x[1]]);
  if(i<2){
   add('place',a[0]+p[0],p[0]+' the table','つくえの '+p[1],opts,'table は「つくえ」。どうぶつの ばしょを みよう。');
   add('placeSentence',a[0]+p[0],'The '+a[0]+' / is / '+p[0]+' the table.',a[2]+'が つくえの '+p[1]+'に いる',opts,'The '+a[0]+' は「'+a[2]+'」。is は「いる」。ばしょを みよう。');
  }else{
   add('beside',a[0]+'next', 'The '+a[0]+' / is / next to the table.',a[2]+'が つくえの よこに いる',opts,'next to は ばしょの ことば。うえ・した・よこを くらべよう。');
   add('beside',a[0]+'on', 'The '+a[0]+' / is / on the table.',a[2]+'が つくえの うえに いる',[opts[1],opts[0]],'on と next to。ばしょを くらべよう。');
  }
 }
 const greetings=[['Good morning!','おはよう','🌅','Good night!','おやすみ','🌙'],['Good night!','おやすみ','🌙','Good morning!','おはよう','🌅'],['Thank you.','ありがとう','🎁','Good morning!','おはよう','🌅'],['See you!','またね','👋','Thank you.','ありがとう','🎁']];
 greetings.forEach(([en,ja,icon,other,otherJa,otherIcon])=>add('greeting',en,en,ja,[[en,icon+'<br>'+ja,ja],[other,otherIcon+'<br>'+otherJa,otherJa]]));
 function planFor(item){
  if(item.skill==='enDescribe')return item.index<4?'color':'number';
  if(item.skill==='gardenEnglishPhrase')return 'color';
  if(item.skill==='enSentence')return item.index<4?'action':'place';
  if(['englishPictureSentence','gardenEnglishBuild'].includes(item.skill))return 'place';
  if(['enReply','enSocialDialog','enInformationDialog','enConversationDepth','enConversationDepthReading'].includes(item.skill))return 'reply';
  return null;
 }
 const api={banks,plans,planFor};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 root.EnglishSteps=api;
 const P=Practice;
 function state(p){const a=P.state(p);if(!a.englishSteps||typeof a.englishSteps!=='object'||Array.isArray(a.englishSteps))a.englishSteps={};return a.englishSteps}
 function entry(p,key){return state(p)[key]??={step:0,recent:{},attempts:0,misses:0,introducedAt:null,manual:false}}
 function stageFor(p,item,n){
  const key=planFor(item);if(!key)return null;
  const e=entry(p,key),d=P.defs.find(x=>x.id===item.skill);
  if(!d||!e.manual&&P.skill(p,d).stages[item.index]?.mastered)return null;
  let step=e.step;
  if(step>0&&e.introducedAt!==null){
   const sets=e.introSets||0;
   // One new question in the first set, two in the second, then this step.
   if(sets===0&&n!==2||sets===1&&![1,3].includes(n))step--;
  }
  return step<plans[key].length?{key,step,kind:plans[key][step]}:null;
 }
 api.entry=entry;api.stageFor=stageFor;
 const build=buildCurriculumEnglish;
 buildCurriculumEnglish=function(e,item){
  e.englishStep=null;
  const step=stageFor(person(),item,e.n);
  if(!step)return build(e,item);
  const bank=banks[step.kind],unused=bank.filter(x=>!e.seen.includes('english-step:'+x.id)),pool=unused.length?unused:bank;
  const row=pool[rand(0,pool.length-1)];e.seen.push('english-step:'+row.id);
  e.thinking=null;e.englishStep={...step,id:row.id};item.englishStep=e.englishStep;
  const target=row.text.replaceAll(' / ',' ');
  e.word=[target,row.choices[0][1],row.meaning];e.choices=ThinkingContent.shuffle(row.choices.map((x,i)=>i?[...x]:[target,x[1],x[2]]));
  e.extensionQuestion={id:'english-step:'+row.id};e.answerAudio=row.text.replaceAll(' / ',' ');
  e.readingAlternative=data.noListening||!data.sound||!('speechSynthesis'in window);
  e.curriculumKind='すこしずつ えいご · '+labels[step.kind];
  const text=row.text.split(' / ').map(x=>'<span lang="en">'+esc(x)+'</span>').join('<span aria-hidden="true"> / </span>');
  renderCurriculumEnglish(e,'あう えを えらぼう。',text,e.curriculumKind,e.answerAudio);
  document.querySelector('.board')?.classList.add('english-step-board');
  document.querySelectorAll('.choice').forEach((button,i)=>button.setAttribute('aria-label',e.choices[i][2]));
  if(row.help)document.querySelector('.english-context')?.insertAdjacentHTML('afterend','<p class="english-step-help">'+esc(row.help)+'</p>');
  return true;
 };
 const record=P.record;
 P.record=function(p,item,clean,ms){
  const step=item?.englishStep;
  if(!step){
   const result=record(p,item,clean,ms),key=planFor(item||{});
   if(key){const e=entry(p,key);e.lastSession=P.state(p).sessions.en||0;e.originalMisses=clean?0:(e.originalMisses||0)+1;if(e.originalMisses>=2&&e.step>=plans[key].length){e.step=plans[key].length-1;e.recent[e.step]=[];e.introducedAt=null;e.manual=true;e.originalMisses=0}}
   return result;
  }
  const d=P.defs.find(x=>x.id===item.skill),s=P.skill(p,d),a=P.state(p),e=entry(p,step.key),ok=!!clean&&!(Number.isFinite(ms)&&ms<450);
  // Count practice and the set normally; keep all bridge evidence separate.
  s.total++;delete s.pendingGentle;
  a.turns.en=(a.turns.en||0)+1;a.recentItems.en=[...(a.recentItems.en||[]),{skill:item.skill,index:item.index}].slice(-10);
  e.lastSession=a.sessions.en||0;e.attempts++;e.recent[step.step]=[...(e.recent[step.step]||[]),{ok:ok?1:0,id:step.id,session:a.sessions.en||0}].slice(-15);
  if(step.step===e.step){
   e.misses=ok?0:e.misses+1;
   if(e.misses>=2){e.recent[e.step]=[];if(e.step>0)e.step--;e.introducedAt=null;e.misses=0}
  }
 };
 const complete=P.complete;
 P.complete=function(p,subject){
  complete(p,subject);if(subject!=='en')return;
  for(const [key,e] of Object.entries(state(p))){
   if(e.lastSession!==P.state(p).sessions.en-1)continue;
   if(e.introducedAt!==null)e.introSets=(e.introSets||0)+1;
   if(!plans[key]||e.step>=plans[key].length)continue;
   const size=P.gentle(p)?15:10,recent=(e.recent[e.step]||[]).slice(-size),need=P.gentle(p)?14:8;
   if(recent.length<size||recent.filter(x=>x.ok).length<need||recent.slice(-5).filter(x=>x.ok).length<4)continue;
   if(new Set(recent.filter(x=>x.ok).map(x=>x.id)).size<Math.min(4,banks[plans[key][e.step]].length)||new Set(recent.map(x=>x.session)).size<(P.gentle(p)?3:2))continue;
   e.step++;e.recent[e.step]=[];e.introducedAt=P.state(p).sessions.en;e.introSets=0;e.misses=0;
  }
 };
 const next=englishNext;
 englishNext=function(){
  next();const e=englishSession;if(view!=='quiz'||!e||e.done||e.rewarded)return;
  // A sentence must remain visible even when listening is enabled.
  if(e.level>=12&&!e.curriculumKind)document.querySelector('.question')?.insertAdjacentHTML('afterend','<p class="english-context" lang="en">'+esc(e.word[3]||e.word[0])+'</p>');
  if(planFor(practiceItem))document.querySelector('.actions')?.insertAdjacentHTML('afterend','<button class="sub english-easier" onclick="EnglishSteps.easier()">🌱 えいごを やさしく</button>');
 };
 const auto=scheduleAutoNext;
 scheduleAutoNext=function(english){if(english&&englishSession?.englishStep){cancelAutoNext();return}return auto(english)};
 const answer=englishAnswer;
 englishAnswer=function(i,button){answer(i,button);if(englishSession?.done){const easier=document.querySelector('.english-easier');if(easier)easier.disabled=true}};
 function reset(p,keys){
  const a=P.state(p);a.englishStepHistory??=[];a.englishStepHistory.push({at:new Date().toISOString(),steps:JSON.parse(JSON.stringify(state(p)))});a.englishStepHistory=a.englishStepHistory.slice(-5);
  for(const key of keys)state(p)[key]={step:0,recent:{},attempts:0,misses:0,introducedAt:null,manual:true};
 }
 api.reset=p=>reset(p,Object.keys(plans));
 api.easier=function(){
  if(view==='parent'){api.reset(person());save();parents();return}
  const e=englishSession,key=planFor(practiceItem||{});if(view!=='quiz'||!e||e.done||!key)return;
  reset(person(),[key]);cancelAutoNext();save();englishNext();
 };
 const settings=practiceSettings;
 practiceSettings=function(){return settings()+'<section class="panel"><h2>えいごを 短いことばから</h2><p>英語の文が難しいときは、絵と2つの選択肢で練習します。文の準備をやさしい段階に戻し、慣れてから少しずつ進みます。</p><button class="sub" onclick="EnglishSteps.easier()">英語だけ やさしく戻す</button><p>算数・国語、学習履歴、上限・下限、コイン・育成データはそのままです。</p></section>'};
 const configure=P.configure;
 P.configure=function(p,age,easy){const r=configure(p,age,easy);if(easy)api.reset(p);return r};
 document.head.insertAdjacentHTML('beforeend','<style>.english-step-help{font-size:17px;line-height:1.6;margin:8px auto 12px;max-width:32em}.english-easier{margin-top:12px;font-size:15px}.english-context>span[lang]{display:inline-block}.english-step-board .curriculum-choice{min-height:100px;font-size:38px!important}.english-step-board .curriculum-choice svg{max-width:100%;height:auto}</style>');
})(typeof globalThis==='object'?globalThis:this);
