/* Adapter over the established generators, selection controls and reward handlers. */
let practiceItem=null,practiceClock=null,practiceAnswered=false;
function practiceBegin(item){practiceItem=item;practiceAnswered=false;practiceClock={start:Date.now(),excluded:false};}
document.addEventListener('visibilitychange',()=>{if(practiceClock)practiceClock.excluded=true});
window.addEventListener('blur',()=>{if(practiceClock)practiceClock.excluded=true});
function practiceAttempt(clean){
 if(practiceAnswered||!practiceItem)return;
 practiceAnswered=true;
 const elapsed=Date.now()-practiceClock.start;
 // Pauses/background and long idle periods are excluded from timing evidence.
 const ms=practiceClock.excluded||elapsed>120000?null:elapsed;
 Practice.record(person(),practiceItem,clean,ms);save();
}
function practiceSelection(kind){
 const active=kind==='en'?englishSession:session;
 const focus=active.practiceFocus||(active.practiceFocus=Practice.focus(person(),kind).id);
 return Practice.pick(person(),kind,focus);
}
const practiceMake=makeQuestion;
function practiceVariant(result){const op=result.text.includes('＋')?'add':/[−－]/.test(result.text)?'sub':result.type;return op==='add'?(result.a%10+result.b%10>=10?'add-carry':'add-no-carry'):op==='sub'?(result.a%10<result.b%10?'sub-borrow':'sub-no-borrow'):result.type}
makeQuestion=function(i){
 if(!session?.auto){practiceItem=null;return practiceMake(i)}
 const item=practiceSelection(subject);let result=practiceMake(item.course);
 for(let tries=0;item.variant&&practiceVariant(result)!==item.variant&&tries<30;tries++)result=practiceMake(item.course);
 // Generator course and variant identify the precise skill/stage of every item.
 result.practice={skill:item.skill,stage:item.index,course:item.course,
  variant:practiceVariant(result)};
 practiceBegin({...item,variant:result.practice.variant});return result;
};
const practiceAnswer=answer;
answer=function(i,el){if(session&&!session.done&&q?.choices[i]!==undefined&&!el.disabled)practiceAttempt(q.choices[i]===q.answer&&!session.help&&!session.wrong);practiceAnswer(i,el)};
const practiceEnglishAnswer=englishAnswer;
englishAnswer=function(i,el){const e=englishSession;if(e&&!e.done&&e.choices[i]&&!el.disabled)practiceAttempt(e.choices[i][0]===e.word[0]&&!e.help);practiceEnglishAnswer(i,el)};
// The original correct-answer animations, timers, five-question rewards and XP stay intact.
advance=function(){if(!session?.done)return;session.n++;if(session.n>=5&&session.auto)Practice.complete(person(),subject);save();nextQuestion()};
const practiceEnglishAdvance=englishAdvance;
englishAdvance=function(){if(englishSession?.done&&englishSession.n===4)Practice.complete(person(),'en');practiceEnglishAdvance()};
adaptiveState=function(){const d=Practice.focus(person(),subject),s=Practice.skill(person(),d);return {level:d.courses[s.level],prepStep:3,newCount:5}};
homeStageLabel=function(){return '<small class="home-stage">じぶんの ペースで</small>'};
learningStageReport=function(){return '<section class="panel"><h2>じぶんに合う練習</h2><p>技能ごとに最初の回答とヒントの利用から出題を調整します。簡単な間は短いブロックで確認し、その後は少しずつ進みます。苦手なときは土台を練習して再挑戦します。5問を2回で、慣れた問題7・挑戦2・復習1が基本です。履歴が少ないときは開始範囲を使います。年齢は開始の目安だけで、上限にはしません。育成レベルやコインとは別の記録です。</p><p>遅い正解で難しくなくなることはありません。速い連打で難易度や報酬が上がることもありません。既存の問題の範囲内で調整します。</p></section>'};
function practiceSettings(){return `<section class="panel practice-settings"><h2>はじめの むずかしさ（任意）</h2><p>大人も子どもも、じぶんのペースで。年齢は保存せず、少しやさしい開始位置の目安にだけ使います。未回答の技能にだけ適用し、記録や持ち物は残ります。</p><label for="practiceAge">年齢（空欄でもOK）</label><input id="practiceAge" type="number" inputmode="numeric" min="3" max="120" autocomplete="off"><div class="actions"><button class="sub" onclick="practiceSeed(false)">目安から はじめる</button><button class="sub" onclick="practiceSeed(true)">やさしく はじめる</button></div><p id="practiceSeedStatus" role="status"></p></section>`}
function practiceSeed(easy){const raw=document.querySelector('#practiceAge').value,age=raw===''?null:Number(raw);Practice.configure(person(),age,easy);save();home()}
const practiceHome=home;
home=function(){practiceItem=null;practiceClock=null;practiceHome();if(!Practice.state(person()).configured)app.insertAdjacentHTML('beforeend',practiceSettings());app.insertAdjacentHTML('beforeend','<p class="muted" style="text-align:center;font-size:12px">数の庭 v2026.10.24.1 · 更新 2026-10-24</p>')};
const practiceParents=parents;
parents=function(){practiceParents();app.insertAdjacentHTML('beforeend',practiceSettings())};
document.querySelector('#parent').onclick=parents;
const practiceStart=start;
start=function(i,auto){Practice.state(person()).configured=true;practiceStart(i,auto)};
const practiceStartEnglish=startEnglish;
startEnglish=function(){Practice.state(person()).configured=true;practiceStartEnglish()};
document.head.insertAdjacentHTML('beforeend','<style>.practice-settings input{display:block;max-width:100%;width:10em;font-size:20px;padding:12px;margin:10px 0}.practice-settings .actions{flex-wrap:wrap}.practice-settings button{min-height:48px}</style>');
