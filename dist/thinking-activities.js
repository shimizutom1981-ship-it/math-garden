/* Append-only registration and adapters for the existing five-question sessions. */
const ThinkingActivities=(()=>{
 'use strict';
 const C=ThinkingContent;
 const interactive=(n,slow=Practice.gentle(person()))=>n===2||(!slow&&n===4);
 const formatDepth=key=>Math.min(2,Math.max(0,Practice.state(person()).thinkingFormats?.[key]?.depth||0));
 const track=(item,key)=>({...item,thinkingTrack:key,thinkingDepth:formatDepth(key)});
 function early(course){
  if(!session||!interactive(session.n))return null;
  const kind=subjectForCourse(course),set=Practice.state(person()).sessions[kind]||0;
  const number=foundationById('number').courses.indexOf(course);
  if(number>=0&&number<=1&&set%3===2){
   const depth=Math.min(formatDepth('match'),number?2:1),max=depth<2?3:5;
   return track(C.match(lowerGradePick('thinking-match-'+max,Array.from({length:max},(_,i)=>i+1)),depth),'match');
  }
  if(course===foundationById('subtraction').courses[0]&&set%2===1){
   const max=formatDepth('hidden')?5:3,pairs=[];
   for(let t=2;t<=max;t++)for(let v=1;v<t;v++)pairs.push([t,v]);
   const [total,visible]=lowerGradePick('thinking-hidden-'+max,pairs);
   const item=track(C.hidden(total,visible),'hidden');item.choices=C.shuffle([item.answer,...item.choices.filter(v=>v!==item.answer).slice(0,2)]);return item;
  }
  const letters=foundationById('letters').courses.indexOf(course),kata=course===foundationById('katakana').courses[0];
  if((letters>=1||kata)&&set%2===1){
   const key=kata?'kata':'hira',depth=Math.min(formatDepth(key),letters===1?0:2);
   const bank=(kata?EarlyPractice.katakana:EarlyPractice.hiragana).filter(([,w])=>Array.from(w).length===(depth?3:2));
   const [icon,word]=lowerGradePick('thinking-word-'+key+'-'+depth,bank);
   const extra=depth===2?Array.from(kata?'アイウエオカキク':'あいうえおかきく').find(x=>!word.includes(x)):null;
   const item=track(C.assemble(icon,word,extra),key);item.tokens=C.shuffle(item.tokens);return item;
  }
  return null;
 }
 const previousEarly=GardenActivities.early;
 GardenActivities.early=function(course){const item=early(course);return item?{...item,type:item.type==='jp'?'jp':'mental',i:course,variant:item.thinkingKind}:previousEarly(course)};
 function question(id,stage){
  const seen=session?(session.thinkingSeen??={}):{},item=C.pick(id,stage,seen[id+':'+stage]??=[]);
  item.variant=item.thinkingKind;item.interactive=interactive(session?.n);
  if(item.interactive&&['detective','evidence'].includes(item.thinkingKind)){
   item.responseChoices=item.choices;item.responseAnswer=item.answer;
   item.answer=item.thinkingKind==='detective'?JSON.stringify([item.responseAnswer,item.meta.correct]):JSON.stringify([item.responseAnswer,item.evidence]);
   item.choices=[item.answer,'__retry__'];item.selection=null;item.detail=null;item.phase=0;
  }
  if(item.thinkingKind==='pattern'&&item.interactive)item.selection=null;
  return item;
 }
 for(const def of C.defs){
  const courses=def.stages.map((title,stage)=>{
   if(def.subject!=='en')return foundationCourse(title,def.subject,()=>question(def.id,stage));
   const course=EN_WORDS.length*4;EN_WORDS.push([]);curriculumCourseMeta['en:'+course]={title,stage,subject:'en'};return course;
  });
  foundationSkill(def.id,def.title,def.subject,courses,def.prerequisite,{defaultLimit:-1,defaultRange:-1,requires:def.requires,stageRequires:def.stageRequires||{},carry:!!def.carry});
 }
 function cards(item,english=false){
  const selected=item.selectedTokens||[],method=english?'ThinkingActivities.englishToken':'ThinkingActivities.token';
  return '<div class="th-slots" aria-label="ならべた ことば">'+Array.from({length:item.requiredLength||item.tokens.length},(_,i)=>selected[i]===undefined?'<span class="th-slot">□</span>':'<button class="th-card" onclick="'+method+'('+selected[i]+')" aria-label="'+C.esc(item.tokens[selected[i]])+'を もどす">'+C.esc(item.tokens[selected[i]])+'</button>').join('')+'</div>'+
   '<div class="th-cards">'+item.tokens.map((token,i)=>'<button class="th-card" '+(selected.includes(i)?'disabled':'')+' onclick="'+method+'('+i+')">'+C.esc(token)+'</button>').join('')+'</div>';
 }
 function work(item){
  if(item.thinkingKind==='match')return ['くだもの','じぶんの おさら'].map((title,tray)=>'<div class="th-label">'+title+'</div><div class="th-plate">'+item.matchSlots.map((inPlate,i)=>inPlate===!!tray?'<button class="th-card th-fruit" onclick="ThinkingActivities.toggle('+i+')" aria-label="いちごを '+(tray?'もどす':'おさらに のせる')+'">🍓</button>':'').join('')+'</div>').join('');
  if(item.thinkingKind==='assemble')return cards(item);
  if(item.thinkingKind==='pattern')return '<div class="th-cards">'+item.choices.map((v,i)=>'<button class="th-card '+(item.selection===i?'th-selected':'')+'" aria-pressed="'+(item.selection===i)+'" onclick="ThinkingActivities.select('+i+')">'+item.choicePictures[v]+'</button>').join('')+'</div>';
  const responses=item.responseChoices;
  if(item.phase===0)return '<p class="th-label">'+(item.thinkingKind==='evidence'?'① こたえを えらぼう':'① どこを たしかめる？')+'</p><div class="th-cards">'+responses.map((v,i)=>'<button class="th-card '+(item.selection===i?'th-selected':'')+'" aria-pressed="'+(item.selection===i)+'" onclick="ThinkingActivities.select('+i+')">'+C.esc(v)+'</button>').join('')+'</div>';
  const evidence=item.thinkingKind==='evidence',options=evidence?item.passage:item.corrections;
  return '<p>えらんだ こたえ：'+C.esc(responses[item.selection])+'</p><button class="sub" onclick="ThinkingActivities.back()">こたえを えらびなおす</button><p class="th-label">'+(evidence?'② てがかりの ぶんを さわろう':'② ただしい こたえを えらぼう')+'</p><div class="th-cards th-lines">'+options.map((v,i)=>'<button class="th-card '+(item.detail===i?'th-selected':'')+'" aria-pressed="'+(item.detail===i)+'" onclick="ThinkingActivities.detail('+i+')">'+C.esc(v)+'</button>').join('')+'</div>';
 }
 function custom(item){return item.thinkingKind==='match'||item.thinkingKind==='assemble'||item.interactive&&['pattern','detective','evidence'].includes(item.thinkingKind)}
 function complete(item){
  if(item.thinkingKind==='match')return true;
  if(item.thinkingKind==='assemble')return item.selectedTokens.length===item.requiredLength;
  if(item.thinkingKind==='pattern')return item.selection!==null;
  return item.phase===0?item.selection!==null:item.detail!==null;
 }
 function confirmLabel(item){return ['detective','evidence'].includes(item.thinkingKind)&&item.phase===0?'つぎへ':'できたよ'}
 function markup(item){return '<div id="thinking-work">'+work(item)+'</div><button class="primary th-confirm" onclick="ThinkingActivities.submit(this)" '+(complete(item)?'':'disabled')+'>'+confirmLabel(item)+'</button>'}
 const previousMarkup=GardenActivities.responseMarkup;
 GardenActivities.responseMarkup=item=>custom(item)?markup(item):previousMarkup(item);
 function active(){return view==='quiz'&&session&&!session.done&&q?.thinkingKind&&custom(q)}
 function refresh(){document.querySelector('#thinking-work').innerHTML=work(q);const b=document.querySelector('.th-confirm');b.disabled=!complete(q);b.textContent=confirmLabel(q)}
 function toggle(i){if(!active()||q.thinkingKind!=='match'||typeof q.matchSlots[i]!=='boolean')return;q.matchSlots[i]=!q.matchSlots[i];refresh()}
 function token(i){if(!active()||q.thinkingKind!=='assemble'||!Number.isInteger(i)||!q.tokens[i])return;const at=q.selectedTokens.indexOf(i);if(at>=0)q.selectedTokens.splice(at,1);else if(q.selectedTokens.length<q.requiredLength)q.selectedTokens.push(i);refresh()}
 function select(i){if(!active()||!Number.isInteger(i))return;const values=q.responseChoices||q.choices;if(values[i]===undefined)return;q.selection=i;q.detail=null;refresh()}
 function detail(i){if(!active()||q.phase!==1||!Number.isInteger(i))return;const values=q.thinkingKind==='evidence'?q.passage:q.corrections;if(values[i]===undefined)return;q.detail=i;refresh()}
 function back(){if(!active())return;q.phase=0;q.detail=null;refresh()}
 function value(item){
  if(item.thinkingKind==='match')return item.matchSlots.filter(Boolean).length;
  if(item.thinkingKind==='assemble')return item.selectedTokens.map(i=>item.tokens[i]).join('');
  if(item.thinkingKind==='pattern')return item.choices[item.selection];
  return JSON.stringify([item.responseChoices[item.selection],item.thinkingKind==='evidence'?item.detail:item.corrections[item.detail]]);
 }
 function submit(button){
  if(!active()||button.disabled||!complete(q))return;
  if(['detective','evidence'].includes(q.thinkingKind)&&q.phase===0){q.phase=1;refresh();return}
  const response=value(q),index=q.choices.indexOf(response),fallback=q.choices.indexOf('__retry__');
  answer(index<0?fallback:index,button);
  if(session.done)document.querySelectorAll('#thinking-work button,.th-confirm').forEach(b=>b.disabled=true);
  else{if(q.responseChoices)q.phase=0;refresh()}
 }
 function record(item,clean){
  if(!item.thinkingTrack||item.thinkingRecorded)return;
  item.thinkingRecorded=true;
  const state=Practice.state(person());state.thinkingFormats??={};
  const progress=state.thinkingFormats[item.thinkingTrack]??={depth:0,clean:0,examples:[]};
  if(!Number.isInteger(progress.clean))progress.clean=0;
  if(!Array.isArray(progress.examples))progress.examples=[];
  if(clean){progress.clean++;if(!progress.examples.includes(item.id))progress.examples.push(item.id)}else{progress.clean=0;progress.examples=[]}
  if(progress.clean>=4&&progress.examples.length>=3&&progress.depth<2){progress.depth++;progress.clean=0;progress.examples=[]}
  save();
 }
 const oldEnglish=buildCurriculumEnglish;
 buildCurriculumEnglish=function(e,item){
  e.thinking=null;
  if(!['gardenEnglishPhrase','gardenEnglishBuild'].includes(item.skill))return oldEnglish(e,item);
  const q=C.pick(item.skill,item.index,e.seen);e.thinking=q;e.extensionQuestion={id:q.id};e.answerAudio=q.answer;
  e.curriculumKind=C.defs.find(d=>d.id===item.skill).title;e.readingAlternative=data.noListening||!data.sound||!('speechSynthesis'in window);
  if(q.thinkingKind==='phrase'){
   e.choices=q.choices;e.word=e.choices.find(x=>x[0]===q.answer);
   renderCurriculumEnglish(e,'えいごに あう えを えらぼう。','<span lang="en">'+C.esc(q.answer)+'</span>',e.curriculumKind,q.answer);
  }else{
   q.interactive=interactive(e.n);q.tokens=C.shuffle(q.tokens);q.selectedTokens=[];
   e.word=[q.answer,C.esc(q.answer),q.meaning];
   if(q.interactive)e.choices=[e.word,['__retry__','',q.meaning]];
   else{const alternatives=C.banks.gardenEnglishBuild[item.index].filter(x=>x.answer!==q.answer&&x.answer.split(' ')[1]===q.answer.split(' ')[1]);e.choices=C.shuffle([e.word,...C.shuffle(alternatives).slice(0,1).map(x=>[x.answer,C.esc(x.answer),x.meaning])])}
   renderCurriculumEnglish(e,q.interactive?'えに あう えいぶんを つくろう。':'えに あう えいぶんは？',q.visualHTML,e.curriculumKind,'Look at the picture.');
   if(q.interactive)document.querySelector('.choices').outerHTML='<div id="thinking-english">'+cards(q,true)+'</div><button class="primary th-en-confirm" disabled onclick="ThinkingActivities.englishSubmit(this)">できたよ</button>';
  }
  document.querySelector('.board')?.classList.add('lesson-board');return true;
 };
 function englishToken(i){
  const e=englishSession,item=e?.thinking;if(view!=='quiz'||!e||e.done||!item?.interactive||!Number.isInteger(i)||!item.tokens[i])return;
  const at=item.selectedTokens.indexOf(i);if(at>=0)item.selectedTokens.splice(at,1);else item.selectedTokens.push(i);
  document.querySelector('#thinking-english').innerHTML=cards(item,true);document.querySelector('.th-en-confirm').disabled=item.selectedTokens.length!==item.tokens.length;
 }
 function englishSubmit(button){
  const e=englishSession,item=e?.thinking;if(view!=='quiz'||!e||e.done||!item?.interactive||button.disabled||item.selectedTokens.length!==item.tokens.length)return;
  const sentence=item.selectedTokens.map(i=>item.tokens[i]).join(' ');englishAnswer(sentence===item.answer?0:1,button);
  if(e.done)document.querySelectorAll('#thinking-english button,.th-en-confirm').forEach(b=>b.disabled=true);else button.disabled=false;
 }
 return {interactive,question,early,custom,markup,token,toggle,select,detail,back,submit,value,record,englishToken,englishSubmit};
})();
