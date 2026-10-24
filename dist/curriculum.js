/* Additive curriculum registration. Existing course IDs, saved stats and rewards remain unchanged. */
const curriculumCourseMeta={},curriculumEnglishBanks={},curriculumTitles={};
let curriculumRequestedFocus=null;
function registerJapanese(id,title,banks,prerequisite){
 const courses=banks.map((bank,stage)=>{const i=TOPICS.length;TOPICS.push(['📖',title+' '+(stage+1),'ことば・文脈から考える','jp',i-JP_START]);JP_BANK[i-JP_START]=bank;curriculumCourseMeta[i]={title,stage,subject:'jp'};return i});
 Practice.defs.push({id,subject:'jp',courses,prerequisite});curriculumTitles[id]=title;practiceTestNames[id]=title;
}
for(const x of JP_ADVANCED)registerJapanese('jp_'+x.id,x.title,x.banks,'reading');
for(const x of JP_EXPRESSIONS){
 const completion=x.rows.map(r=>{const at=r[0].lastIndexOf(r[1]);return [r[0].slice(0,at)+'□'+r[0].slice(at+r[1].length)+'。□に入る言葉は？',r[1],r[2],r[0]+'：'+r[3]]});
 const meaning=x.rows.map(r=>['「'+r[0]+'」の意味は？',r[3],r[4],r[6]]);
 const scenario=x.rows.map((r,i)=>[r[5]+' この場面に合う表現は？',r[0],[x.rows[(i+1)%x.rows.length][0],x.rows[(i+2)%x.rows.length][0]].join('|'),r[6]]);
 registerJapanese('jp_'+x.id,x.title,[completion,meaning,scenario],'sentence');
}
const vocabularyCount=VOCABULARY_GROUPS.reduce((n,g)=>n+g.words.length,0);
for(const [index,g] of VOCABULARY_GROUPS.entries()){
 const base=EN_WORDS.length*4,id='vocab_'+g.id;
 const bank=g.words.map(w=>[w.word,'<span class="vocab-choice">'+esc(w.meaning)+'</span>',w.meaning,null,{vocabulary:true,word:w}]);
 EN_WORDS.push(bank);curriculumEnglishBanks[base/4]={kind:'vocabulary',title:g.title,group:g};
 const courses=[0,1,2,3].map(stage=>{const course=base+stage;curriculumCourseMeta['en:'+course]={title:g.title,stage,subject:'en'};return course});
 Practice.defs.push({id,subject:'en',courses,prerequisite:index?'vocab_'+VOCABULARY_GROUPS[index-1].id:'enReply'});
 curriculumTitles[id]='英単語 · '+g.title;practiceTestNames[id]=g.title;
}
const curriculumSelection=practiceSelection;
practiceSelection=function(kind){
 const active=kind==='en'?englishSession:session;
 if(curriculumRequestedFocus){const d=Practice.defs.find(x=>x.id===curriculumRequestedFocus&&x.subject===kind);if(d){active.practiceFocus=d.id;active.selectedPracticeFocus=d.id}curriculumRequestedFocus=null}
 if(kind==='en'&&(!data.sound||!('speechSynthesis' in window))){
  const id=active.practiceFocus||Practice.focus(person(),kind).id, fallback=curriculumAudioFallback[id];
  if(fallback)active.practiceFocus=fallback;
 }
 return curriculumSelection(kind);
};
function startSelectedPractice(id){
 if(!freeSubjectChoice())return;
 const d=Practice.defs.find(x=>x.id===id);if(!d)return;
 curriculumRequestedFocus=id;
 if(d.subject==='en')startEnglish();else start(d.courses[Practice.skill(person(),d).level],true);
}
function openPracticeCourses(kind){
 if(!freeSubjectChoice())return;
 leaveQuizScreen();cancelAutoNext();session=null;englishSession=null;view='courses';
 const name={math:'さんすう',jp:'こくご',en:'えいご'}[kind];
 app.innerHTML='<section class="panel"><button class="sub" onclick="home()">← にわへ</button><h1>'+name+' · 分野をえらぶ</h1><p>どこからでも練習できます。選んだ分野の中で、じぶんに合う問題に調整します。</p>'+(kind==='en'?'<p class="muted">追加の単語帳：'+vocabularyCount+'見出し語。活用形や会話の文は別の単語として数えません。音声が使えないときは読む練習に切り替えます。</p>':'')+'<div class="curriculum-grid">'+Practice.defs.filter(d=>d.subject===kind).map(d=>'<button class="sub" onclick="startSelectedPractice(\''+d.id+'\')">'+esc(curriculumTitles[d.id]||practiceTestNames[d.id]||d.id)+'</button>').join('')+'</div><p class="muted">選択式で扱える内容を練習します。全教科書の網羅や、書く・話す力の習得を保証するものではありません。</p></section>';
}
const curriculumHome=home;
home=function(){curriculumRequestedFocus=null;curriculumHome();if(freeSubjectChoice())app.insertAdjacentHTML('beforeend','<section class="panel"><h2>分野をえらんで練習</h2><div class="actions"><button class="sub" onclick="openPracticeCourses(\'math\')">さんすう</button><button class="sub" onclick="openPracticeCourses(\'jp\')">こくご</button><button class="sub" onclick="openPracticeCourses(\'en\')">えいご</button></div></section>')};
function buildCurriculumEnglish(e,item){
 const meta=curriculumEnglishBanks[Math.floor(item.course/4)];if(!meta)return false;
 if(meta.kind!=='vocabulary')return buildAdvancedEnglish(e,item,meta);
 const all=EN_WORDS[Math.floor(item.course/4)],limit=[7,13,19,25][item.course%4],bank=all.slice(0,Math.min(limit,all.length));
 let pool=bank.filter(w=>!e.seen.includes(w[0]));if(!pool.length)pool=bank;
 e.word=pool[rand(0,pool.length-1)];e.seen.push(e.word[0]);
 const target=e.word[4].word;
 const others=bank.filter(w=>w!==e.word&&w[2]!==e.word[2]&&(!target.synonymGroup||target.synonymGroup!==w[4].word.synonymGroup)).map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,e.count-1).map(x=>x.w);
 e.choices=[e.word,...others].sort(()=>Math.random()-.5);e.curriculumKind='単語の意味';e.answerAudio=e.word[0];e.audioTarget=e.word[0];
 const reading=!data.sound||!('speechSynthesis'in window);
 e.readingAlternative=reading;
 renderCurriculumEnglish(e,'ことばの意味をえらぼう',esc(e.word[0]),reading?'音声なし：読む練習':'英語を聞く・読む',e.word[0]);
 return true;
}
function renderCurriculumEnglish(e,title,context,mode,audioText){
 e.audioTarget=audioText;
 app.innerHTML=`<section class="quiz"><div class="quiztop"><button class="sub" onclick="home()">⌂ にわへ</button><strong>🔤 えいご</strong><span>${e.n+1} / 5</span></div><div class="board"><div class="eyebrow">${esc(mode)}</div><h1 class="question">${esc(title)}</h1>${context?'<p class="english-context">'+context+'</p>':''}<button class="primary" onclick="englishSay(englishSession.audioTarget)">🔊 もういちど きく</button><div class="choices">${e.choices.map((w,i)=>`<button class="choice curriculum-choice" onclick="englishAnswer(${i},this)">${w[1]}</button>`).join('')}</div><div id="englishFeedback" class="feedback" role="status"></div><div class="actions"><button class="sub" id="englishHint" onclick="englishHint()">💡 ヒント</button><button class="primary hidden" id="englishNext" onclick="englishAdvance()">つぎへ →</button></div></div></section>`;
 if(e.readingAlternative){const audioButton=document.querySelector('.board > button.primary');if(audioButton)audioButton.hidden=true}
 else englishSay(audioText);
}
const curriculumSnapshot=practiceTestSnapshot;
practiceTestSnapshot=function(english){const x=curriculumSnapshot(english);if(!x)return x;const meta=curriculumCourseMeta[english?'en:'+x.course:x.course];if(meta)x.topic=meta.title;if(!english&&q.type==='mathExtended')x.variant=meta.title;if(english&&englishSession.curriculumKind)x.variant=englishSession.curriculumKind+(englishSession.readingAlternative?'（読む練習）':'');return x};
document.head.insertAdjacentHTML('beforeend','<style>.curriculum-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.curriculum-grid button{font-size:16px;overflow-wrap:anywhere}.english-context{font-size:clamp(20px,4vw,30px);margin:5px 0;line-height:1.5;overflow-wrap:anywhere}.curriculum-choice,.vocab-choice{font-size:20px!important;line-height:1.5;overflow-wrap:anywhere}.board{scroll-padding:12px}@media(max-width:500px){.curriculum-choice,.vocab-choice{font-size:17px!important}}body.quiz-mode .board:has(.curriculum-choice){justify-content:flex-start}</style>');

const curriculumMathCourses={},curriculumAudioFallback={};
for(const d of MathExpansion.defs){
 const courses=d.stages.map((title,stage)=>{const i=TOPICS.length;TOPICS.push(['🔢',title,'考えてえらぼう','math']);curriculumMathCourses[i]={id:d.id,stage};curriculumCourseMeta[i]={title,stage,subject:'math'};return i});
 Practice.defs.push({id:d.id,subject:'math',courses,prerequisite:d.prerequisite||'number'});
 curriculumTitles[d.id]=d.title;practiceTestNames[d.id]=d.title;
}
function makeCurriculumMath(i){const m=curriculumMathCourses[i];return m?{...MathExpansion.make(m.id,m.stage),i}:null}
function registerAdvancedEnglish(skill,reading){
 const base=EN_WORDS.length*4,id=reading?skill.stages[0].items[0].fallbackSkillId:skill.id;
 EN_WORDS.push([]);
 const courses=skill.stages.map((stage,index)=>{const course=base+index;curriculumCourseMeta['en:'+course]={title:stage.title,stage:index,subject:'en'};return course});
 curriculumEnglishBanks[base/4]={kind:'advanced',skill,reading};
 Practice.defs.push({id,subject:'en',courses,prerequisite:'enWords'});
 curriculumTitles[id]=skill.title+(reading?'（読む練習）':'');practiceTestNames[id]=curriculumTitles[id];return id;
}
for(const skill of ENGLISH_EXTENSION_SKILLS){
 registerAdvancedEnglish(skill,false);
 if(skill.stages[0].items[0].requiresAudio)curriculumAudioFallback[skill.id]=registerAdvancedEnglish(skill,true);
}
function buildAdvancedEnglish(e,item,meta){
 const stage=meta.skill.stages[item.index],pool=stage.items.filter(x=>!e.seen.includes(x.id)),items=pool.length?pool:stage.items;
 const question=items[rand(0,items.length-1)];e.seen.push(question.id);
 e.word=[question.answer,esc(question.answer),question.hint];
 e.choices=question.choices.map(x=>[x,esc(x),question.hint]).sort(()=>Math.random()-.5);
 e.curriculumKind={listen:'聞き取り',spell:'つづり',dialog:'会話'}[question.mode]||meta.skill.title;
 e.readingAlternative=meta.reading||!data.sound||!('speechSynthesis'in window);
 e.answerAudio=question.answer;e.extensionQuestion=question;
 renderCurriculumEnglish(e,meta.skill.title,esc(e.readingAlternative?question.fallbackPrompt:question.prompt),e.readingAlternative?'音声なし：読む練習':'聞いて・考えてえらぼう',question.audioText);
 if(question.requiresAudio&&!meta.reading&&!e.readingAlternative)document.querySelector('.actions')?.insertAdjacentHTML('beforeend','<button class="sub" onclick="useReadingPractice()">音が出ないとき：読む練習へ</button>');
 return true;
}
function useReadingPractice(){
 const e=englishSession;if(view!=='quiz'||!e||e.done)return;
 const fallback=curriculumAudioFallback[e.practiceFocus];if(!fallback)return;
 e.practiceFocus=fallback;e.selectedPracticeFocus=fallback;englishNext();
}
