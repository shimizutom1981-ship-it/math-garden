/* Register after all append-only banks: old course IDs and saved records stay valid. */
const foundationMakers={};
function foundationCourse(title,subject,maker){
 const i=TOPICS.length;TOPICS.push(['🌱',title,'ゆっくり れんしゅう',subject]);
 curriculumCourseMeta[i]={title,subject};foundationMakers[i]=()=>({...maker(),i});return i;
}
function foundationNumeric(answer,extra){
 const options=[answer,...[1,-1,2,-2,3].map(x=>answer+x).filter(x=>x>=0)].slice(0,3);
 return {type:'mental',answer,choices:options.sort(()=>Math.random()-.5),objects:0,...extra};
}
function foundationAdd(max,tens=false){
 const a=rand(tens?10:1,tens?17:max-1),b=rand(1,tens?9-a%10:max-a);
 return foundationNumeric(a+b,{type:'add',a,b,arithmetic:{op:'add',a,b},text:`${a} ＋ ${b} ＝ ？`,hint:`${a}から あと${b}こ かぞえよう。`,objects:tens?0:a+b,variant:b===1?'one-more':'combine'});
}
function foundationComplement(total){const a=rand(1,total-1);return foundationNumeric(total-a,{text:`${a} に あと いくつで ${total}？`,hint:`${a}から ${total}まで かぞえよう。`,variant:a<=total/2?'small-part':'large-part'})}
const foundationById=id=>Practice.defs.find(d=>d.id===id);
function foundationUpdate(id,values){Object.assign(foundationById(id),values)}
function foundationSkill(id,title,subject,courses,prerequisite,extra={}){Practice.defs.push({id,subject,courses,prerequisite,...extra});curriculumTitles[id]=title;practiceTestNames[id]=title}
const count3=foundationCourse('3まで かぞえる','math',()=>{const n=rand(1,3);return {type:'count',answer:n,choices:[1,2,3],text:'いくつ あるかな？',hint:'ひとつずつ さわって かぞえよう。',objects:n,variant:n===1?'one':'many'}});
foundationUpdate('number',{courses:[count3,0,1],exampleCount:3});
foundationSkill('compare','かずを くらべる','math',[2],'number');
const add3=foundationCourse('3まで あわせる','math',()=>foundationAdd(3));
const add9=foundationCourse('9まで あわせる','math',()=>foundationAdd(9));
const add19=foundationCourse('20まで・くりあがりなし','math',()=>foundationAdd(19,true));
foundationUpdate('addition',{courses:[add3,3,add9,add19],exampleCount:3,variantCount:2});
const sub9=foundationCourse('9まで・くりさがりなし','math',()=>{const a=rand(3,9),b=rand(1,a);return foundationNumeric(a-b,{type:'sub',a,b,arithmetic:{op:'subtract',a,b},text:`${a} − ${b} ＝ ？`,hint:`${a}こから ${b}こ とって かぞえよう。`,objects:a})});
foundationUpdate('subtraction',{courses:[4,sub9]});
const complement5=foundationCourse('5を つくる','math',()=>foundationComplement(5));
const complement10=foundationCourse('10を つくる','math',()=>foundationComplement(10));
const oldDecompose=[...foundationById('mathDecompose').courses];
foundationUpdate('mathDecompose',{courses:[complement5,complement10],prerequisite:'addition',variantCount:2});
foundationSkill('mathHundreds','100のまとまり・まとめて暗算','math',oldDecompose.slice(1),'mathCarry');
const carrySmall=foundationCourse('10を こえる・こたえは13まで','math',()=>{
 const a=rand(7,9),b=rand(11-a,13-a);return foundationNumeric(a+b,{a,b,type:'add',arithmetic:{op:'add',a,b},text:`${a} ＋ ${b} ＝ ？`,hint:`まず${10-a}こを たして10。のこりを たそう。`,variant:a===9?'near-ten':'make-ten'});
});
foundationUpdate('mathCarry',{courses:[carrySmall,...foundationById('mathCarry').courses],requires:['addition','mathDecompose'],carry:true,variantCount:2});
foundationUpdate('mathBorrow',{requires:['subtraction','mathDecompose'],carry:true,variantCount:2});
foundationUpdate('mental',{requires:['mathCarry','mathBorrow','mathHundreds'],carry:true});
const groups=foundationCourse('おなじ かずを あつめる','math',()=>{const a=rand(2,3),b=rand(2,4);return foundationNumeric(a*b,{text:`${a}こずつ ${b}くみ。ぜんぶで いくつ？`,hint:`${Array(b).fill(a).join(' ＋ ')} を かんがえよう。`,visualHTML:'<div style="display:flex;flex-wrap:wrap;gap:12px">'+Array(b).fill('<span>'+ '🍎'.repeat(a)+'</span>').join('')+'</div>'})});
const smallProduct=foundationCourse('2と5の だん','math',()=>{const a=Math.random()<.5?2:5,b=rand(1,9);return foundationNumeric(a*b,{type:'mul',a,b,arithmetic:{op:'multiply',a,b},text:`${a} × ${b} ＝ ？`,hint:`${a}こずつ ${b}くみ。${Array(b).fill(a).join(' ＋ ')} を かんがえよう。`})});
foundationUpdate('multiply',{courses:[groups,smallProduct,10],prerequisite:'addition'});
foundationUpdate('mathProduct',{requires:['multiply','mathCarry'],carry:true});
foundationUpdate('mathRational',{prerequisite:'fraction'});
foundationUpdate('mathDecimal',{prerequisite:'mathRational'});
foundationUpdate('mathPercent',{requires:['mathRational','mathDecimal']});
foundationUpdate('lifeShopping',{prerequisite:'subtraction',stageRequires:{1:['mathBorrow'],2:['mathCarry']}});
foundationUpdate('lifeLength',{prerequisite:'compare',stageRequires:{1:['subtraction'],2:['mathHundreds']}});
foundationUpdate('lifeClock',{prerequisite:'number',stageRequires:{2:['mathCarry']}});
curriculumTitles.number='かずを かぞえる';
const pictureMatch=foundationCourse('おなじ えを えらぶ','jp',()=>{
 const pictures=['🐱','🐶','🍎','🍌','🐘','🐟'],answer=pictures[rand(0,5)];
 return {type:'jp',course:0,text:'おなじ えを えらんでね。',visual:answer,answer,choices:[answer,...pictures.filter(x=>x!==answer).sort(()=>Math.random()-.5).slice(0,1)].sort(()=>Math.random()-.5),hint:'うえと おなじ えを さがそう。',variant:'match'};
});
foundationUpdate('letters',{courses:[pictureMatch,18,19]});
foundationSkill('katakana','カタカナ','jp',[20],'letters');
foundationSkill('kanji','かんじの よみ','jp',[22],'letters',{kanji:true});
// Keep kana-only short stories accessible independently of later kanji passages.
const kanaReading=foundationById('reading').courses.filter(i=>!(JP_BANK[i-JP_START]||[]).some(row=>/[\u3400-\u9fff]/u.test(row.join(''))));
const kanjiReading=foundationById('reading').courses.filter(i=>!kanaReading.includes(i));
foundationUpdate('reading',{courses:kanaReading});
foundationSkill('readingKanji','漢字まじりの読解','jp',kanjiReading,'reading',{kanji:true,requires:['reading','kanji']});
curriculumTitles.letters='ひらがな・えと ことば';curriculumTitles.words='ことばの いみ';
// Any Japanese bank containing kanji has an explicit reading prerequisite and opt-in.
for(const d of Practice.defs.filter(d=>d.subject==='jp'&&!['letters','kanji','katakana'].includes(d.id))){
 const hasKanji=d.courses.some(i=>(JP_BANK[i-JP_START]||[]).some(row=>/[\u3400-\u9fff]/u.test(row.join(''))));
 if(hasKanji){d.kanji=true;d.requires=[...new Set([...(d.requires||(d.prerequisite?[d.prerequisite]:[])),'kanji'])]}
}
const foundationMake=makeQuestion;
makeQuestion=function(i){
 const selected=session?.auto?practiceSelection(subject):null;
 const course=selected?selected.course:i;
 const activity=typeof GardenActivities==='undefined'?null:GardenActivities.early(course);
 if(activity||foundationMakers[course]){
  const result=activity||foundationMakers[course]();
  if(selected){
   const variant=result.variant||result.type;
   practiceBegin({...selected,variant,example:result.text+'|'+result.answer+'|'+(result.visual||'')});
   result.practice={skill:selected.skill,stage:selected.index,course,variant};
  }else practiceItem=null;
  return result;
 }
 return foundationMake(i);
};
const foundationAttempt=practiceAttempt;
practiceAttempt=function(clean){
 if(practiceItem){const english=practiceItem.skill&&Practice.defs.find(d=>d.id===practiceItem.skill)?.subject==='en';
  if(english)practiceItem.example=englishSession.extensionQuestion?.id||englishSession.word?.[0];
  else if(q.id&&(q.learningExpansion||q.activity))practiceItem.example=q.id;
  else practiceItem.example=q.text+'|'+q.answer+'|'+(q.chainWord||q.visual||'');
  if(!practiceItem.variant)practiceItem.variant=english?'select':q.type;
  if(!english){const ar=q.arithmetic||q.meta||{},a=ar.a??q.a,b=ar.b??q.b;
   if(practiceItem.skill==='addition')practiceItem.form=b===1?'one-more':'combine';
   if(practiceItem.skill==='mathCarry')practiceItem.form=a%10>=8?'near-ten':'make-ten';
   if(practiceItem.skill==='mathBorrow')practiceItem.form=a%10===0?'from-ten':'from-teen';
  }
 }
 foundationAttempt(clean);
};
practiceVariant=function(result){
 if(result.variant)return result.variant;
 const ar=result.arithmetic||result.meta||{},a=ar.a??result.a,b=ar.b??result.b;
 if(ar.op==='add'||result.type==='add')return a%10+b%10>=10?'add-carry':'add-no-carry';
 if(ar.op==='subtract'||result.type==='sub')return a%10<b%10?'sub-borrow':'sub-no-borrow';
 return result.type;
};
// Explicit foundation courses replace the old hidden, fixed prepStep shortcut.
adaptiveState=function(){const d=Practice.focus(person(),subject),item=Practice.pick(person(),subject,d.id);return {level:item.course,newCount:5}};
const foundationStart=start;
start=function(i,auto){
 const kind=subjectForCourse(i),d=Practice.defs.find(x=>x.subject===kind&&x.courses.includes(i));
 if(!auto&&(!d||!Practice.available(person(),kind).includes(d)||d.courses.indexOf(i)<Practice.floor(person(),d)||d.courses.indexOf(i)>Math.min(Practice.skill(person(),d).level,Practice.ceiling(person(),d)))){curriculumRequestedFocus=null;return foundationStart(Practice.pick(person(),kind).course,true)}
 return foundationStart(i,auto);
};
startSelectedPractice=function(id){
 if(!freeSubjectChoice())return;
 const d=foundationById(id);if(!d||!Practice.allowed(person(),d)||Practice.lowerAllowed&&!Practice.lowerAllowed(person(),d))return;
 curriculumRequestedFocus=id;if(d.subject==='en')startEnglish();else start(Practice.pick(person(),d.subject,id).course,true);
};
openPracticeCourses=function(kind){
 if(!freeSubjectChoice())return;leaveQuizScreen();cancelAutoNext();session=null;englishSession=null;view='courses';
 app.innerHTML='<section class="panel"><button class="sub" onclick="home()">← にわへ</button><h1>れんしゅうを えらぶ</h1><p>できる ところから、すこしずつ。</p><div class="curriculum-grid">'+Practice.available(person(),kind).map(d=>'<button class="sub" onclick="startSelectedPractice(\''+d.id+'\')">'+esc(curriculumTitles[d.id]||practiceTestNames[d.id]||d.id)+'</button>').join('')+'</div><p>つぎの ぶんやは、いまの れんしゅうに なれてから ふえるよ。</p></section>';
};
learningStageReport=function(){return '<section class="panel"><h2>分野ごとの進み方</h2><p>年齢や過去の合計正答数で、新しい内容へ飛ばしません。同じ段階の直近10問を5問ずつ確認し、両方で4問以上の自力正解、異なる問題、2セット以上での安定を確かめます。回数はこのアプリの設計上の目安です。</p><p>2回続けてつまずいたら1段階戻り、安定するまでその段階を練習します。挑戦問題も同じ段階です。ヒント利用・速すぎる連打は習得の根拠にしません。ゆっくり正解することは不利になりません。</p><p>旧方式の難易度推定は履歴として残し、新しい技能の習得判定は基礎から確認します。回答記録・コイン・育成データは残ります。</p></section>'};
practiceSettings=function(){
 const a=Practice.state(person());
 return `<section class="panel practice-settings"><h2>分野ごとの出題範囲</h2><p>${esc(person().name)}さんの設定です。上限を上げても前提の練習を飛ばしません。</p><label class="practice-check"><input type="checkbox" ${a.settings.kanji?'checked':''} onchange="setPracticePermission('kanji',this.checked)">漢字を使う国語の問題を許可する</label><label class="practice-check"><input type="checkbox" ${a.settings.carry?'checked':''} onchange="setPracticePermission('carry',this.checked)">くり上がり・くり下がりの問題を許可する</label><p>どちらも最初はOFFです。算数の基礎問題・ヒントはひらがなで出します。</p>${['math','jp','en'].map(kind=>`<details><summary>${{math:'算数',jp:'国語',en:'英語'}[kind]}の上限</summary><div class="practice-limits">${Practice.defs.filter(d=>d.subject===kind).map(d=>`<label>${esc(curriculumTitles[d.id]||practiceTestNames[d.id]||d.id)}<select aria-label="${esc(curriculumTitles[d.id]||practiceTestNames[d.id]||d.id)}の上限" onchange="setPracticeLimit('${d.id}',this.value)">${(d.prerequisite?[-1]:[]).concat(d.courses.map((_,i)=>i)).map(i=>`<option value="${i}" ${Practice.absoluteLimit(person(),d)===i?'selected':''}>${i<0?'出さない':(i+1)+'：'+esc(kind==='en'?(curriculumCourseMeta['en:'+d.courses[i]]?.title||'ステップ '+(i+1)):TOPICS[d.courses[i]][1])+'まで'+(typeof PracticePresets==='object'?' / '+(PracticePresets.build(Practice)[d.id]?.[i]?.label||'目安未設定'):'')}</option>`).join('')}</select></label>`).join('')}</div></details>`).join('')}<button class="sub" onclick="practiceSeed(true)">やさしく はじめなおす</button><p>このボタンは難易度の推定を基礎へ戻します。過去の回答・コイン・育成データ・分野別上限は残し、下限を解除し、漢字とくり上がりの許可はOFFにします。</p><p id="practiceSeedStatus" role="status"></p></section>`;
};
function setPracticePermission(key,value){if(view!=='parent'||!['kanji','carry'].includes(key))return;Practice.state(person()).settings[key]=value===true;save()}
function setPracticeLimit(id,value){if(view!=='parent')return;Practice.setLimit(person(),id,Number(value));save()}
practiceSeed=function(easy){Practice.configure(person(),null,easy);save();home()};
const foundationParents=parents;
parents=function(){foundationParents();const panel=app.querySelector('.practice-settings'),title=app.querySelector('h1');if(panel&&title&&title.insertAdjacentElement)title.insertAdjacentElement('afterend',panel)};
document.querySelector('#parent').onclick=parents;
const foundationWrittenHint=showHint;
showHint=function(){
 if(!session||session.done||view!=='quiz')return;
 const id=practiceItem?.skill||Practice.defs.find(d=>d.subject==='math'&&d.courses.includes(q.i))?.id;
 if(['number','compare','addition','subtraction','mathDecompose','mathCarry','mathBorrow','multiply','divide'].includes(id)){
  session.help=true;const h=document.querySelector('#hint');h.classList.remove('hidden');
  const hint=id==='mathCarry'?'まず 10の まとまりを つくって、のこりを たそう。':id==='mathBorrow'?'10の まとまりを ばらして、ひとつずつ ひこう。':q.hint;
  h.textContent=hint;speak(hint);return;
 }
 foundationWrittenHint();
};
document.head.insertAdjacentHTML('beforeend','<style>.practice-check{display:flex;align-items:center;gap:10px;margin:16px 0}.practice-settings .practice-check input{width:24px;min-width:24px;height:24px;margin:0}.practice-settings details{margin:16px 0}.practice-settings summary{padding:12px;cursor:pointer}.practice-limits{display:grid;gap:16px}.practice-limits label{display:grid;gap:6px;min-width:0}.practice-limits select{width:100%;min-width:0;max-width:100%;font-size:16px;padding:12px;min-height:48px}.practice-settings{overflow-wrap:anywhere}</style>');
// Complete registration before migrating, including profiles not currently selected.
data.profiles.forEach(p=>Practice.state(p));save();if(view==='home')home();

