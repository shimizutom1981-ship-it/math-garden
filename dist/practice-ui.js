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
home=function(){practiceContinuation=null;practiceItem=null;practiceClock=null;practiceHome();if(!Practice.state(person()).configured)app.insertAdjacentHTML('beforeend',practiceSettings());app.insertAdjacentHTML('beforeend','<p class="muted" style="text-align:center;font-size:12px">数の庭 v2026.10.24.10 · 更新 2026-10-24</p>')};
const practiceParents=parents;
parents=function(){practiceParents();app.insertAdjacentHTML('beforeend',practiceSettings())};
document.querySelector('#parent').onclick=parents;
const practiceStart=start;
start=function(i,auto){Practice.state(person()).configured=true;rememberPracticeSubject(subjectForCourse(i));practiceStart(i,auto)};
const practiceStartEnglish=startEnglish;
startEnglish=function(){Practice.state(person()).configured=true;rememberPracticeSubject('en');practiceStartEnglish()};
document.head.insertAdjacentHTML('beforeend','<style>.practice-settings input{display:block;max-width:100%;width:10em;font-size:20px;padding:12px;margin:10px 0}.practice-settings .actions{flex-wrap:wrap}.practice-settings button{min-height:48px}</style>');

// Opt-in inspection only: memory-local, reset on reload, never writes learner saves.
let practiceTestVisible=false,practiceTestQuestion=null;
const practiceTestNames={number:'数・比較',addition:'たし算',subtraction:'ひき算',mental:'暗算',multiply:'かけ算',divide:'わり算',fraction:'分数',letters:'文字',words:'語句',sentence:'文の意味',reading:'読解',enWords:'英単語',enDescribe:'英語の説明',enSentence:'英文',enReply:'英語の返事'};
function practiceTestSnapshot(english){
 const course=english?englishSession.level:q.i;
 const kind=english?'en':subject;
 const item=english||session?.auto?practiceItem:null;
 const def=Practice.defs.find(d=>d.subject===kind&&d.courses.includes(course));
 if(!def)return null;
 const estimate=person().practice?.skills?.[def.id];
 const variant=english?'聞いて選ぶ':Number.isFinite(q.a)&&Number.isFinite(q.b)?practiceVariant(q):q.type;
 const labels={'add-carry':'たし算・くり上がりあり','add-no-carry':'たし算・くり上がりなし','sub-borrow':'ひき算・くり下がりあり','sub-no-borrow':'ひき算・くり下がりなし',fraction:'分数の図',count:'数える',compare:'大小比較',mul:'かけ算',div:'わり算',mental:'暗算',jp:'ことばの選択'};
 const topic=english?['動物','食べ物','身の回り','色と物','数と動物','動作','位置','会話'][Math.floor(course/4)]:TOPICS[course][1];
 return {skill:def.id,name:practiceTestNames[def.id],course,stage:def.courses.indexOf(course)+1,total:def.courses.length,topic,variant:labels[variant]||variant,mode:item?.kind||'manual',estimate:Number.isInteger(estimate?.level)?estimate.level+1:null,calibrating:estimate?.calibrating===true,choices:english?englishSession.choices.length:q.choices.length};
}
function practiceTestMarkup(){
 const x=practiceTestQuestion;if(!practiceTestVisible||!x)return '';
 const modes={fluent:'通常',challenge:'挑戦',review:'復習',prerequisite:'前提練習',retry:'再挑戦',manual:'手動選択'};
 return `<aside id="practiceTestPanel" class="practice-test" aria-label="出題テスト情報"><strong>テスト表示</strong> · ${esc(x.name)} / ${esc(x.variant)}<br>実際の出題：段階 ${x.stage}/${x.total} · ${esc(x.topic)} · ${x.choices}択<br>選び方：${modes[x.mode]||esc(x.mode)}${x.calibrating?' · 初期調整中':''}<br>この技能の推定：${x.estimate===null?'未記録':'段階 '+x.estimate}（出題時点）<small>問題コースID ${x.course} · 技能 ${esc(x.skill)} · 段階は技能内の目安</small></aside>`;
}
function practiceTestRender(){document.querySelector('#practiceTestPanel')?.remove();const markup=practiceTestMarkup();if(markup&&view==='quiz')document.querySelector('.board')?.insertAdjacentHTML('beforeend',markup)}
function practiceTestToggle(on){practiceTestVisible=on===true;practiceTestRender()}
const practiceTestNext=nextQuestion;
nextQuestion=function(){practiceTestNext();if(view==='quiz'&&session&&!session.done){practiceTestQuestion=practiceTestSnapshot(false);practiceTestRender()}};
const practiceTestEnglishNext=englishNext;
englishNext=function(){practiceTestEnglishNext();if(view==='quiz'&&englishSession&&!englishSession.done){practiceTestQuestion=practiceTestSnapshot(true);practiceTestRender()}};
const practiceTestParents=parents;
parents=function(){practiceTestParents();app.insertAdjacentHTML('beforeend',`<section class="panel"><h2>アプリのテスト</h2><label style="display:flex;align-items:center;gap:12px"><input type="checkbox" id="practiceTestToggle" ${practiceTestVisible?'checked':''} onchange="practiceTestToggle(this.checked)">出題のテスト表示</label><p class="muted">種類・実際の出題段階・選び方・その技能の推定を表示します。このページを開いている間だけ有効です。再読み込みするとOFFに戻り、学習記録には保存しません。</p></section>`)};
document.querySelector('#parent').onclick=parents;
document.head.insertAdjacentHTML('beforeend','<style>.practice-test{width:100%;max-width:720px;text-align:left;font-size:12px;line-height:1.5;background:#edf2f5;color:#334b57;border:1px dashed #8198a3;border-radius:8px;padding:6px 9px;overflow-wrap:anywhere}.practice-test small{display:block;font-size:10px}@media(max-width:500px){.practice-test{font-size:11px;padding:5px 7px}}</style>');

// Continuation is offered only after the existing reward/save handlers complete.
let practiceContinuation=null;
const continuationFinish=finish;
finish=function(){
 if(!session||session.rewarded)return;
 const completed=session,target={profile:person(),subject,auto:session.auto,course:session.i,focus:session.selectedPracticeFocus};
 continuationFinish();
 if(view==='result'&&completed.rewarded){completePracticeSubject(target.subject);practiceContinuation=target;renderSubjectContinuation()}
};
const continuationEnglishFinish=englishFinish;
englishFinish=function(){
 if(!englishSession||englishSession.rewarded)return;
 const completed=englishSession,target={profile:person(),subject:'en',auto:true,focus:englishSession.selectedPracticeFocus};
 continuationEnglishFinish();
 if(view==='result'&&completed.rewarded){
  completePracticeSubject('en');
  practiceContinuation=target;
  renderSubjectContinuation();
 }
};
function continuePractice(){
 // Retired handler: stale same-subject controls must never start another set.
}
const practiceSubjectOrder=['math','jp','en'];
function renderSubjectContinuation(){
 const target=practiceContinuation;if(!target)return;
 const next=practiceSubjectOrder[(practiceSubjectOrder.indexOf(target.subject)+1)%3];
 const name={math:'算数',jp:'国語',en:'英語'}[next];
 app.querySelector('.actions')?.insertAdjacentHTML('afterbegin','<button class="primary" onclick="nextSubjectPractice()">次は'+name+'へ →</button>');
}
function startGuidedPractice(){
 if(view!=='home')return;
 practiceContinuation=null;curriculumRequestedFocus=null;
 const next=practiceFlow().next;
 if(next==='en')startEnglish();else start(recommendationFor(next),true);
}
// Per-profile navigation preferences; separate from skill mastery and rewards.
function rememberPracticeSubject(kind){practiceFlow().next=kind;save()}
function completePracticeSubject(kind){practiceFlow().next=practiceSubjectOrder[(practiceSubjectOrder.indexOf(kind)+1)%3];save()}
function setFreeSubjectChoice(on){if(view!=='parent')return;practiceFlow().freeChoice=on===true;practiceContinuation=null;save();parents()}
const subjectChoiceParents=parents;
parents=function(){subjectChoiceParents();app.insertAdjacentHTML('beforeend',`<section class="panel"><h2>教科の進め方</h2><p>${esc(person().name)}さんの設定です。</p><label style="display:flex;align-items:center;gap:12px"><input id="freeSubjectChoice" type="checkbox" ${freeSubjectChoice()?'checked':''} onchange="setFreeSubjectChoice(this.checked)">教科・分野を自由に選べるようにする</label><p class="muted">OFFでは算数 → 国語 → 英語の順に5問ずつ進みます。途中でやめても、次は取り組み中の教科から再開できます。ONではホームで好きな教科・分野を選べます。結果画面はどちらの設定でも次の教科へ進みます。難易度・持ち物・報酬は変わりません。</p></section>`)};
document.querySelector('#parent').onclick=parents;
document.head.insertAdjacentHTML('beforeend','<style>.subject-home-choices[hidden]{display:none!important}</style>');
function nextSubjectPractice(){
 const target=practiceContinuation;
 if(view!=='result'||!target||person()!==target.profile)return;
 practiceContinuation=null;cancelAutoNext();curriculumRequestedFocus=null;
 const next=practiceSubjectOrder[(practiceSubjectOrder.indexOf(target.subject)+1)%3];
 // A selected category belongs only to its original subject. Each new subject
 // uses its own skill rotation and mastery, with the existing reward policy.
 if(next==='en')startEnglish();else start(recommendationFor(next),true);
}
