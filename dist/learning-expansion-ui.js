/* Presentation, explicit parent setup and first-answer rotation for new lessons. */
(function(){
 'use strict';
 const L=LearningExpansion;
 const previousSettings=practiceSettings;
 practiceSettings=function(){return previousSettings().replace('<h2>まとめて むずかしさを調整</h2>','<h2>まとめて むずかしさを調整</h2>'+`<section class="lesson-settings"><h2>あたらしい 問題を追加</h2><p>表・グラフ、かさ・重さ、条件やお知らせの読解に加え、小3向けに「おはなしに あう しき」「かみを きって くみあわせよう」「えいぶんに あう え」が選べます。選んだ子の新しい分野だけを設定します。</p><label for="lessonGrade">新しい問題をどこまで出す？</label><select id="lessonGrade"><option value="">範囲を選んでください</option value="1">小学1年相当まで（条件を読む国語）</option><option value="2">小学2年相当まで（表・かさ・お知らせ）</option><option value="3">小学3年相当まで（グラフ・重さ・文章と式・紙の図形・英語の絵など）</option></select><button class="primary" onclick="enableGardenLessons()">新しい問題の範囲を適用</button><p class="muted">既存分野の上下限・漢字の許可・記録は変わりません。新しい分野の上限と開始範囲を設定し、前提の練習が済んだ分野から出題します。下限の設定も守ります。</p><p id="lessonSetupStatus" role="status"></p></section>`);};
 window.enableGardenLessons=function(){
  if(view!=='parent')return;
  const value=document.querySelector('#lessonGrade')?.value,grade=Number(value);
  if(!['1','2','3'].includes(value))return;
  const p=person();
  for(const def of [...L.defs,...GardenActivities.lessons]){const cap=def.grades.reduce((last,g,i)=>g<=grade?i:last,-1);Practice.setLimit(p,def.id,cap);Practice.setRange(p,def.id,cap);}
  curriculumRequestedFocus=null;practiceItem=null;practiceContinuation=null;save();parents();
  const status=document.querySelector('#lessonSetupStatus');if(status)status.textContent=p.name+'さんの新しい問題を、小学'+grade+'年相当まで設定しました。';
 };
 const previousNext=nextQuestion;
 nextQuestion=function(){previousNext();if(view==='quiz'&&(q?.learningExpansion||q?.activity))document.querySelector('.board')?.classList.add('lesson-board');};
 const previousSpeech=speakQuestion;
 speakQuestion=function(){
  if(view==='quiz'&&q?.learningExpansion&&session&&!session.done){
   // Read source text, not the answer. Keep audio-free practice fully usable.
   const text=(q.passage?q.passage+'。':'')+q.text;
   speak(text.replace(/mL/g,'ミリリットル').replace(/dL/g,'デシリットル').replace(/L/g,'リットル').replace(/kg/g,'キログラム').replace(/g/g,'グラム'));return;
  }
  previousSpeech();
 };
 const previousHint=showHint;
 showHint=function(){
  previousHint();
  if(view!=='quiz'||!q?.learningExpansion||!session||session.done)return;
  for(const key of q.evidenceKeys||[])document.querySelectorAll('[data-evidence="'+key+'"]').forEach(el=>el.classList.add('lesson-evidence'));
 };
 const previousAnswer=answer;
 answer=function(index,el){
  if(session&&!session.done&&q?.learningExpansion&&!q.rotationRecorded&&!el.disabled&&q.choices[index]!==undefined){
   L.remember(person(),q);q.rotationRecorded=true;save();
  }
  previousAnswer(index,el);
 };
 document.head.insertAdjacentHTML('beforeend',`<style>
 .lesson-settings label{display:block;margin:12px 0 8px;font-weight:700}.lesson-settings select{display:block;width:100%;max-width:100%;padding:12px;font-size:16px;margin-bottom:14px}.lesson-settings{overflow-wrap:anywhere}
 body.quiz-mode .lesson-board{justify-content:flex-start;overflow-y:auto;gap:12px}.lesson-board>*{flex-shrink:0}
 body.quiz-mode .lesson-board .question{font-size:clamp(21px,5vw,29px);line-height:1.55;white-space:pre-line}
 .lesson-board .choices{flex-shrink:0}.lesson-board .choice{font-size:clamp(17px,4.5vw,24px)!important;white-space:normal;overflow-wrap:anywhere;line-height:1.45;min-height:52px}
 .lesson-figure{width:100%;max-width:360px;margin:0 auto}.lesson-caption{text-align:center;margin:0 0 4px;font-weight:700;font-size:18px}
 .lesson-svg{display:block;width:100%;max-width:340px;height:auto;max-height:245px;margin:0 auto;font-size:16px;font-family:inherit;color:#244735}
 .lesson-table{border-collapse:collapse;max-width:360px;width:100%;margin:0 auto;font-size:20px}.lesson-table caption{font-size:18px;padding:4px 0 10px;font-weight:700}.lesson-table th,.lesson-table td{padding:8px 12px;border:1px solid #b4cdbd;text-align:center}.lesson-table thead{background:#e4efe7}.lesson-table tbody th{font-weight:500}
 .lesson-passage{width:100%;background:#f4f8f2;border:1px solid #c8d8c9;border-radius:12px;padding:12px 16px;font-size:clamp(17px,4.5vw,22px);line-height:1.8;text-align:left;overflow-wrap:anywhere}.lesson-passage p{margin:0 0 5px}.lesson-passage p:last-child{margin:0}
 .lesson-passage .lesson-evidence{background:#fff0b7;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}.lesson-table .lesson-evidence{background:#fff0b7;outline:2px solid #967127;outline-offset:-2px}
 .lesson-svg .lesson-evidence line{stroke:#aa6312;stroke-width:3}.lesson-svg line.lesson-evidence{stroke:#aa6312;stroke-width:5}.lesson-svg .lesson-evidence rect{stroke:#aa6312;stroke-width:4}.lesson-svg .lesson-evidence text{font-weight:800}
 </style>`);
 document.querySelector('#parent').onclick=parents;
})();
