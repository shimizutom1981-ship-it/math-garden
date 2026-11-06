/* A browser-wide environment choice, independent of each child's learning record. */
(function(){
 let courseSubject='en';
 const previousCourses=openPracticeCourses;
 openPracticeCourses=function(kind){courseSubject=kind;return previousCourses(kind)};
 const priorFilter=Practice.canSelect;
 Practice.canSelect=(p,d)=>(!priorFilter||priorFilter(p,d))&&(!data.noListening&&data.sound&&'speechSynthesis'in window||!curriculumAudioFallback[d.id]);
 function refreshMode(){refresh();refreshMusic()}
 window.setNoListening=function(on){
  if(typeof on!=='boolean'||on===(data.noListening===true))return;
  if(on){
   data.beforeQuiet={sound:!!data.sound,music:!!data.music};data.noListening=true;data.sound=false;data.music=false;
   stopMusic();if('speechSynthesis'in window)speechSynthesis.cancel();
   // Stop any already scheduled effect, as well as future sounds.
   if(petSoundContext?.state==='running')petSoundContext.suspend().catch(()=>{});
  }else{
   data.noListening=false;data.sound=data.beforeQuiet?.sound===true;data.music=data.beforeQuiet?.music===true;delete data.beforeQuiet;
  }
  save();refreshMode();if(typeof refreshTileAudio==='function')refreshTileAudio();
  // Do not erase completed answers, change the question count, or grant a reward.
  if(view==='quiz'&&!session&&englishSession&&!englishSession.done){cancelAutoNext();englishNext()}
  else if(view==='home')home();
  else if(view==='courses')openPracticeCourses(courseSubject);
  else if(view==='parent')parents();
  if(!on)startMusic();
 };
 // Stale category buttons follow the same rules as automatic selection.
 const selected=startSelectedPractice;
 startSelectedPractice=function(id){return selected(data.noListening?(curriculumAudioFallback[id]||id):id)};
 const previousAttempt=practiceAttempt;
 practiceAttempt=function(clean){
  if(practiceItem&&Practice.defs.find(d=>d.id===practiceItem.skill)?.subject==='en')practiceItem.form=englishSession.readingAlternative?'reading':'listening';
  return previousAttempt(clean);
 };
 const previousHome=home;
 home=function(){previousHome();app.insertAdjacentHTML('afterbegin','<p class="quiet-mode-note" role="status">'+(data.noListening?'🔇 リスニングなし：文字や絵で答えられる問題を出します。音楽・読み上げもOFF。':'音を出せないときは、上の「リスニングあり」を押して切り替えられます。')+'</p>')};
 const previousParents=parents;
 parents=function(){previousParents();app.insertAdjacentHTML('beforeend','<section class="panel"><h2>音を出せない場所での練習</h2><button class="sub" data-listening-mode aria-pressed="'+(data.noListening===true)+'" onclick="setNoListening(!data.noListening)">'+(data.noListening?'🔇 リスニングなし':'🔊 リスニングあり')+'</button><p>「リスニングなし」では、英語の文字や絵から答える問題と読む練習を選びます。聞き取り専用の成績には記録しません。初級の単語・文・返事は、読む・聞くを合わせた意味理解の進み具合です。算数・国語・英語を5問ずつ進める流れと報酬は同じです。</p><p class="muted">このブラウザ全体に保存する設定です。子どもを切り替えても音は出ません。戻すと、切り替え前の音声・音楽設定に戻ります。難易度の上限や過去の記録は変わりません。</p></section>');refreshMode()};
 document.querySelector('#parent').onclick=parents;
 document.head.insertAdjacentHTML('beforeend','<style>.quiet-mode-note{text-align:center;line-height:1.6;padding:10px 14px;background:#edf4e7;border-radius:12px}.quiet-reply{display:block;font-size:clamp(16px,4vw,24px);line-height:1.4;overflow-wrap:anywhere}[data-listening-mode][aria-pressed="true"]{background:#dcebcf;border:2px solid #56794d}.tools{flex-wrap:wrap}.tools [data-listening-mode]{font-size:14px;min-height:44px}</style>');
 refreshMode();if(view==='home')home();
})();
