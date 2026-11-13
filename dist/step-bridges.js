/* Step bridges v2026.11.13.1
 * Small supported steps inside existing stages, so a stage never jumps at once.
 * No new course IDs or stage indexes: saved stages, limits and the 449-stage map stay valid.
 *  A. Bridge steps before the hardest preschool jumps (teens, make 5/10, opposites).
 *  B. Picture + two choices first, then fewer pictures, then the original question.
 *  C. After a first wrong answer the picture appears and one more wrong choice fades.
 * Bridge-step answers are kept out of stage promotion/demotion evidence; the step itself
 * advances after consecutive clean answers and steps back after two misses in a row.
 */
(function(root){
 'use strict';
 const NEED=3,GENTLE_NEED=4;

 /* ---------- pictures ---------- */
 function frame(cells,size=10){
  return '<span class="sb-frame'+(size===5?' sb-frame5':'')+'">'+cells.map(c=>'<span class="sb-cell'+(c?' sb-'+c:'')+'"></span>').join('')+'</span>';
 }
 function frames(sequence,label){
  const out=[];for(let k=0;k<Math.max(1,Math.ceil(sequence.length/10));k++){const part=sequence.slice(k*10,k*10+10);while(part.length<10)part.push('');out.push(frame(part))}
  return '<div class="sb-frames" role="img" aria-label="'+label+'">'+out.join('')+'</div>';
 }
 const fill=(n,c)=>Array.from({length:n},()=>c);
 function teenPicture(n){return frames(fill(n,'a'),'10の まとまりと '+(n-10)+'こ')}
 function addPicture(a,b){return frames([...fill(a,'a'),...fill(b,'b')],a+'こと '+b+'こ')}
 function subPicture(a,b){return frames([...fill(a-b,'a'),...fill(b,'x')],a+'こから '+b+'こ とる')}
 function partFrame(part,total){
  if(total===5)return '<div class="sb-frames" role="img" aria-label="5の わくに '+part+'こ">'+frame([...fill(part,'a'),...fill(5-part,'')],5)+'</div>';
  return frames([...fill(part,'a'),...fill(total-part,'')],'10の わくに '+part+'こ');
 }
 function hand(up){
  const xs=[8,26,44,62,80];
  return '<svg class="sb-hand" viewBox="0 0 100 120" width="96" height="116" aria-hidden="true">'+xs.map((x,k)=>k<up
   ?'<rect x="'+x+'" y="8" width="13" height="58" rx="6" fill="#f2c79a" stroke="#8a5a34" stroke-width="2"/>'
   :'<rect x="'+x+'" y="8" width="13" height="58" rx="6" fill="#fff" stroke="#9a948e" stroke-width="2" stroke-dasharray="4 3"/>').join('')+
   '<rect x="6" y="60" width="90" height="54" rx="18" fill="#f2c79a" stroke="#8a5a34" stroke-width="2"/></svg>';
 }
 function hands(up,total){
  const label='ゆびが '+up+'ほん たっている';
  if(total===5)return '<div class="sb-hands" role="img" aria-label="'+label+'">'+hand(up)+'</div>';
  return '<div class="sb-hands" role="img" aria-label="'+label+'">'+hand(Math.min(5,up))+hand(Math.max(0,up-5))+'</div>';
 }
 const reveal=html=>'<details class="sb-reveal"><summary>🖼️ えを みる</summary>'+html+'</details>';

 /* ---------- support picture for any small add/subtract/complement question (B, C) ---------- */
 function parts(q){
  const m=q.arithmetic||q.meta||{};
  const a=Number(m.a??q.a),b=Number(m.b??q.b);
  const complement=/^(\d+) に あと いくつで (5|10)？$/.exec(q.text||'');
  if(complement)return {op:'complement',a:+complement[1],total:+complement[2]};
  if(!Number.isInteger(a)||!Number.isInteger(b))return null;
  const op=m.op==='subtract'||q.type==='sub'?'subtract':m.op==='add'||q.type==='add'?'add':null;
  return op?{op,a,b}:null;
 }
 function supportFor(q){
  if(!q||q.activity||q.visualHTML||q.objects||q.visual||q.pictureClue)return '';
  const p=parts(q);if(!p)return '';
  if(p.op==='complement')return partFrame(p.a,p.total);
  if(p.op==='add'&&p.a>=1&&p.b>=1&&p.a+p.b<=20)return addPicture(p.a,p.b);
  if(p.op==='subtract'&&p.b>=1&&p.a>=p.b&&p.a<=20)return subPicture(p.a,p.b);
  return '';
 }

 /* ---------- question builders ---------- */
 function nearChoices(answer,count,lo,hi){
  const out=[answer];
  for(let d=1;out.length<count&&d<=hi-lo+1;d++)for(const v of [answer+d,answer-d])if(out.length<count&&v>=lo&&v<=hi)out.push(v);
  return out;
 }
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 function numeric(answer,count,lo,hi,extra){return {type:'mental',answer,choices:shuffle(nearChoices(answer,count,lo,hi)),objects:0,...extra}}
 const range=(lo,hi)=>Array.from({length:hi-lo+1},(_,k)=>k+lo);
 const teenFacts=[];for(let a=11;a<=18;a++)for(let b=1;b<=19-a;b++)teenFacts.push([a,b]);

 const CATEGORIES=[
  ['くだもの',['🍎','🍌','🍇','🍓','🍊','🍑','🍉']],
  ['どうぶつ',['🐶','🐱','🐘','🐰','🐻','🦒','🐷']],
  ['のりもの',['🚗','🚌','🚃','✈️','🚲','🚢']],
  ['おはな',['🌷','🌻','🌹','🌼']]
 ];
 const OPPOSITES=[
  ['🐘','おおきい','🐜','ちいさい'],['🐇','はやい','🐢','おそい'],['🪨','おもい','🪶','かるい'],
  ['💡','あかるい','🌑','くらい'],['🍰','あまい','🌶️','からい'],['😄','わらう','😢','なく'],
  ['⬆️','うえ','⬇️','した'],['🔥','あつい','🧊','つめたい'],['🍎🍎🍎🍎','おおい','🍎','すくない'],
  ['🦒','たかい','🐧','ひくい'],['🌞','ひる','🌛','よる']
 ];
 const opposites=OPPOSITES.flatMap(([i1,w1,i2,w2],pair)=>[{pair,icon:i1,word:w1,oppIcon:i2,opp:w2},{pair,icon:i2,word:w2,oppIcon:i1,opp:w1}]);
 const together=[],oddOne=[];
 CATEGORIES.forEach(([name,members],c)=>members.forEach((m,k)=>{
  const otherMembers=CATEGORIES[(c+1+k%3)%CATEGORIES.length][1],stranger=otherMembers[k%otherMembers.length];
  const shown=[m,members[(k+1)%members.length]],answer=members[(k+2)%members.length];
  together.push({name,shown,answer,other:stranger});
  oddOne.push({name,same:[m,members[(k+1)%members.length]],answer:stranger});
 }));

 // Step makers return the replacement question; base keeps i/practice/course.
 const PLANS={
  'addition:3':{title:'20までの たしざんの はしわたし',steps:[
   {form:'ten-and',choices:2,make(base,pick){const k=pick(range(1,9)),n=10+k;
    return numeric(n,2,11,19,{text:'10と '+k+'で いくつ？',hint:'10の まとまりの つぎから、11、12…と かぞえよう。',visualHTML:teenPicture(n),a:10,b:k,variant:'combine'})}},
   {form:'ten-plus',choices:3,make(base,pick){const k=pick(range(1,9));
    return numeric(10+k,3,11,19,{type:'add',text:'10 ＋ '+k+' ＝ ？',hint:'10と '+k+'で いくつかな。えを みて かぞえよう。',visualHTML:teenPicture(10+k),a:10,b:k,arithmetic:{op:'add',a:10,b:k},variant:'combine'})}},
   {form:'teen-plus-picture',choices:3,make(base,pick){const [a,b]=pick(teenFacts);
    return numeric(a+b,3,11,19,{type:'add',text:a+' ＋ '+b+' ＝ ？',hint:'10の まとまりは そのまま。ばらの '+(a-10)+'こと '+b+'こを あわせよう。',visualHTML:addPicture(a,b),a,b,arithmetic:{op:'add',a,b},variant:b===1?'one-more':'combine'})}},
   {form:'teen-plus-reveal',choices:3,make(base,pick){const [a,b]=pick(teenFacts);
    return numeric(a+b,3,11,19,{type:'add',text:a+' ＋ '+b+' ＝ ？',hint:'10の まとまりは そのまま。ばらの '+(a-10)+'こと '+b+'こを あわせよう。',visualHTML:reveal(addPicture(a,b)),a,b,arithmetic:{op:'add',a,b},variant:b===1?'one-more':'combine'})}}
  ]},
  'mathDecompose:0':{title:'5を つくる はしわたし',steps:[
   {form:'hand-two',choices:2,make(base,pick){const a=pick(range(1,4));
    return numeric(5-a,2,1,4,{text:a+' に あと いくつで 5？',hint:'たって いない ゆびを かぞえよう。',visualHTML:hands(a,5),variant:a<=2?'small-part':'large-part'})}},
   {form:'hand-three',choices:3,make(base,pick){const a=pick(range(1,4));
    return numeric(5-a,3,1,4,{text:a+' に あと いくつで 5？',hint:'たって いない ゆびを かぞえよう。',visualHTML:hands(a,5),variant:a<=2?'small-part':'large-part'})}}
  ]},
  'mathDecompose:1':{title:'10を つくる はしわたし',steps:[
   {form:'frame-two',choices:2,make(base,pick){const a=pick(range(1,9));
    return numeric(10-a,2,1,9,{text:a+' に あと いくつで 10？',hint:'あいている しかくを かぞえよう。',visualHTML:partFrame(a,10),variant:a<=5?'small-part':'large-part'})}},
   {form:'hands-three',choices:3,make(base,pick){const a=pick(range(1,9));
    return numeric(10-a,3,1,9,{text:a+' に あと いくつで 10？',hint:'たって いない ゆびを かぞえよう。',visualHTML:hands(a,10),variant:a<=5?'small-part':'large-part'})}},
   {form:'frame-reveal',choices:3,make(base,pick){const a=pick(range(1,9));
    return numeric(10-a,3,1,9,{text:a+' に あと いくつで 10？',hint:'あいている しかくを かぞえよう。',visualHTML:reveal(partFrame(a,10)),variant:a<=5?'small-part':'large-part'})}}
  ]},
  'words:0':{title:'はんたいの ことばの はしわたし',steps:[
   {form:'together',choices:2,make(base,pick){const x=pick(together);
    return {type:'jp',course:base.course,text:'おなじ なかまは どっち？',visual:x.shown.join(' '),answer:x.answer,choices:shuffle([x.answer,x.other]),hint:x.name+'の なかまを さがそう。',readingTask:null,instructionSpeech:null}}},
   {form:'odd-one',choices:3,make(base,pick){const x=pick(oddOne);
    return {type:'jp',course:base.course,text:'ひとつだけ なかまじゃないのは どれ？',visual:'',answer:x.answer,choices:shuffle([...x.same,x.answer]),hint:'ふたつは '+x.name+'の なかまだよ。',readingTask:null,instructionSpeech:null}}},
   {form:'picture-opposite',choices:2,make(base,pick){const x=pick(opposites),pool=opposites.filter(o=>o.pair!==x.pair),other=pool[Math.floor(Math.random()*pool.length)];
    const answer=x.oppIcon+' '+x.opp;
    return {type:'jp',course:base.course,text:'「'+x.word+'」の はんたいは？',visual:x.icon+' '+x.word,answer,choices:shuffle([answer,other.icon+' '+other.word]),hint:'えを みて、はんたいの ようすを かんがえよう。',readingTask:null,instructionSpeech:null}}},
   {form:'word-opposite',choices:3,make(base,pick){const x=pick(opposites),others=shuffle(opposites.filter(o=>o.pair!==x.pair)).filter((o,k,all)=>all.findIndex(y=>y.pair===o.pair)===k).slice(0,2);
    return {type:'jp',course:base.course,text:'「'+x.word+'」の はんたいは？',visual:'',answer:x.opp,choices:shuffle([x.opp,...others.map(o=>o.word)]),hint:'「'+x.word+'」の はんたいの ようすを おもいうかべよう。',readingTask:null,instructionSpeech:null}}}
  ]}
 };
 // Stages where the first questions use two choices and a visible picture (B), without bridge steps.
 const INTRO={addition:[0,1,2],subtraction:[0,1],mathCarry:[0,1],mathBorrow:[0],letters:[1,2],words:[1],katakana:[0],sentence:[0]};

 const api={PLANS,INTRO,NEED,GENTLE_NEED,supportFor,parts,teenFacts,together,oddOne,opposites,CATEGORIES,OPPOSITES,
  pictures:{frame,frames,teenPicture,addPicture,subPicture,partFrame,hands,reveal}};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 if(root.StepBridges)return;
 root.StepBridges=api;

 /* ---------- learner state ---------- */
 const key=(skill,index)=>skill+':'+index;
 function store(p){const a=Practice.state(p);if(!a.stepBridges||typeof a.stepBridges!=='object'||Array.isArray(a.stepBridges))a.stepBridges={};return a.stepBridges}
 function entry(p,skill,index){
  const all=store(p),k=key(skill,index);
  if(!all[k]||typeof all[k]!=='object'){
   const d=Practice.defs.find(x=>x.id===skill),recent=d?(Practice.skill(p,d).stages[index]?.recent||[]):[];
   const last=recent.slice(-10),plan=PLANS[k];
   // Existing learners who already answer this stage steadily keep the original question.
   all[k]={step:plan&&last.length>=10&&last.filter(x=>x.ok).length>=8?plan.steps.length:0,run:0,miss:0,clean:recent.length>=5?NEED:0};
  }
  const e=all[k];for(const f of ['step','run','miss','clean'])if(!Number.isInteger(e[f])||e[f]<0)e[f]=0;
  if(PLANS[k])e.step=Math.min(e.step,PLANS[k].steps.length);
  return e;
 }
 // Which bridge step this item uses; null means the original question.
 function stepFor(p,skill,index){
  const plan=PLANS[key(skill,index)];if(!plan)return null;
  const d=Practice.defs.find(x=>x.id===skill);if(!d)return null;
  const s=Practice.skill(p,d);
  if(index!==s.level||s.stages[index]?.mastered)return null;
  const e=entry(p,skill,index);return e.step<plan.steps.length?e.step:null;
 }
 function introFor(p,skill,index){
  if(!(INTRO[skill]||[]).includes(index))return false;
  const d=Practice.defs.find(x=>x.id===skill);if(!d)return false;
  const s=Practice.skill(p,d);
  return index===s.level&&!s.stages[index]?.mastered&&entry(p,skill,index).clean<NEED;
 }
 function twoChoices(q){
  if(!Array.isArray(q.choices)||q.choices.length<=2)return;
  const others=q.choices.filter(x=>x!==q.answer),num=Number(q.answer);
  const keep=Number.isFinite(num)&&others.every(x=>Number.isFinite(Number(x)))?others.sort((x,y)=>Math.abs(Number(x)-num)-Math.abs(Number(y)-num))[0]:others[Math.floor(Math.random()*others.length)];
  q.choices=shuffle([q.answer,keep]);
 }
 api.entry=entry;api.stepFor=stepFor;api.introFor=introFor;

 /* ---------- question generation ---------- */
 const before=makeQuestion;
 makeQuestion=function(i){
  let result=before(i);
  const item=typeof practiceItem==='object'?practiceItem:null;
  if(session?.auto&&item&&result?.practice?.skill===item.skill&&!result.activity){
   const p=person(),k=key(item.skill,item.index),step=stepFor(p,item.skill,item.index);
   if(step!==null){
    const plan=PLANS[k],maker=plan.steps[step];
    const pick=bank=>lowerGradePick('step-bridge:'+k+':'+maker.form,bank);
    result={...maker.make(result,pick),i:result.i,practice:{...result.practice,variant:maker.form},stepBridge:{key:k,step,form:maker.form,steps:plan.steps.length}};
    item.stepBridge=result.stepBridge;item.example=maker.form+':'+result.answer;
   }else if(introFor(p,item.skill,item.index)){
    twoChoices(result);
    const picture=supportFor(result);if(picture){result.visualHTML=picture;result.stepIntroPicture=true}
    result.stepIntro=true;item.stepIntro=true;
   }
  }
  if(result&&!result.stepSupport){const picture=supportFor(result);if(picture)result.stepSupport=picture}
  return result;
 };

 /* ---------- recording: bridge answers never promote or demote a stage ---------- */
 const baseRecord=Practice.record;
 Practice.record=function(p,item,clean,ms){
  const d=Practice.defs.find(x=>x.id===item?.skill);
  if(!d)return baseRecord(p,item,clean,ms);
  const ok=!!clean&&!(Number.isFinite(ms)&&ms<450),k=key(item.skill,item.index),plan=PLANS[k];
  if(item.stepBridge&&plan){
   const s=Practice.skill(p,d),level=s.level,e=entry(p,item.skill,item.index);
   // Log the attempt with a different current level so the engine returns before promotion/demotion.
   s.level=item.index===0?1:item.index-1;
   try{baseRecord(p,item,clean,ms)}finally{s.level=level}
   const stage=s.stages[item.index];if(stage&&Array.isArray(stage.recent))stage.recent.pop();
   if(Practice.gentle(p)&&s.gentleBridge?.level===s.level){s.gentleBridge.position++;if(!ok)s.gentleBridge.missed=true}
   if(ok){e.run++;e.miss=0;if(e.run>=(Practice.gentle(p)?GENTLE_NEED:NEED)){e.step=Math.min(plan.steps.length,e.step+1);e.run=0}}
   else{e.run=0;e.miss++;if(e.miss>=2){if(e.step>0)e.step--;e.miss=0}}
   return;
  }
  const s=Practice.skill(p,d),levelBefore=s.level;
  const result=baseRecord(p,item,clean,ms);
  if(item.index===levelBefore&&(plan||(INTRO[item.skill]||[]).includes(item.index))){
   const e=entry(p,item.skill,item.index);
   if(ok)e.clean++;
   // Coming back after a step down starts with one picture step, not from the beginning.
   if(plan&&s.level<item.index){e.step=Math.max(0,plan.steps.length-1);e.run=0;e.miss=0}
  }
  return result;
 };
 const baseConfigure=Practice.configure;
 Practice.configure=function(p,age,easy){const r=baseConfigure(p,age,easy);if(easy)Practice.state(p).stepBridges={};return r};

 /* ---------- C: support after the first wrong answer ---------- */
 function afterMiss(){
  if(!q||q.activity||q.stepMissSupported)return;
  q.stepMissSupported=true;
  document.querySelector('.sb-reveal')?.setAttribute('open','');
  if(q.stepSupport&&!q.visualHTML){
   document.querySelector('.choices')?.insertAdjacentHTML('beforebegin','<div class="sb-support" role="group" aria-label="えで かんがえよう">'+q.stepSupport+'</div>');
   q.stepSupportShown=true;
  }
  const buttons=Array.from(document.querySelectorAll('.choice'));
  if(buttons.length!==q.choices.length)return;
  const open=buttons.map((b,k)=>({b,k})).filter(x=>!x.b.disabled);
  if(open.length<=2)return;
  const num=Number(q.answer),wrong=open.filter(x=>q.choices[x.k]!==q.answer);
  wrong.sort((x,y)=>Number.isFinite(num)?Math.abs(Number(q.choices[y.k])-num)-Math.abs(Number(q.choices[x.k])-num):0);
  const fade=wrong[0];if(fade){fade.b.disabled=true;fade.b.classList.add('sb-faded');q.stepFadedChoice=fade.k}
 }
 api.afterMiss=afterMiss;
 const baseAnswer=answer;
 answer=function(index,el){
  const fresh=!!session&&!session.done&&!session.wrong;
  baseAnswer(index,el);
  if(fresh&&session&&!session.done&&session.wrong)afterMiss();
 };

 document.head.insertAdjacentHTML('beforeend','<style>'+
  '.sb-frames{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:12px auto}'+
  '.sb-frame{display:grid;grid-template-columns:repeat(5,34px);gap:4px;padding:6px;border:3px solid #497554;border-radius:10px;background:#fff}'+
  '.sb-frame5{grid-template-columns:repeat(5,40px)}'+
  '.sb-cell{width:34px;height:34px;border:1px dashed #b8c9bc;border-radius:50%;box-sizing:border-box}.sb-frame5 .sb-cell{width:40px;height:40px}'+
  '.sb-a{background:#4f9a6f;border:2px solid #2f6b4b}.sb-b{background:#f0a24a;border:2px solid #b06a1d}'+
  '.sb-x{background:#cfe3d6;border:2px solid #8fb39d;position:relative}.sb-x:after{content:"";position:absolute;left:-2px;right:-2px;top:50%;border-top:3px solid #c0473a;transform:rotate(-35deg)}'+
  '.sb-hands{display:flex;gap:10px;justify-content:center;margin:10px auto}'+
  '.sb-reveal{margin:10px auto;text-align:center}.sb-reveal summary{display:inline-block;min-height:44px;padding:10px 16px;border-radius:999px;background:#eef5ef;border:2px solid #497554;cursor:pointer;font-size:18px}'+
  '.sb-support{margin:8px auto}.choice.sb-faded{opacity:.25}'+
  '@media (max-width:360px){.sb-frame{grid-template-columns:repeat(5,26px)}.sb-cell{width:26px;height:26px}}'+
  '</style>');
})(typeof globalThis==='object'?globalThis:this);
