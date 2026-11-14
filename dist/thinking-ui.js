/* First attempts, supporting speech, and reversible touch controls. */
(function(){
 'use strict';
 const priorAnswer=answer;
 answer=function(index,button){
  if(view==='quiz'&&session&&!session.done&&!button.disabled&&q?.choices[index]!==undefined)
   ThinkingActivities.record(q,q.choices[index]===q.answer&&!session.help&&!session.wrong);
  return priorAnswer(index,button);
 };
 const priorSpeech=speakQuestion;
 speakQuestion=function(){
  if(view==='quiz'&&session&&!session.done&&q?.thinkingKind){speak((q.passage?q.passage.join('。')+'。':'')+q.text);return}
  return priorSpeech();
 };
 const priorEnglishHint=englishHint;
 englishHint=function(){
  const e=englishSession,item=e?.thinking;
  if(view==='quiz'&&e&&!e.done&&item){e.help=true;document.querySelector('#englishFeedback').textContent=item.hint;speak(item.hint);return}
  return priorEnglishHint();
 };
 const priorConfigure=Practice.configure;
 Practice.configure=function(p,age,easy){
  const progress=Practice.state(p).thinkingFormats;
  const result=priorConfigure(p,age,easy);
  if(easy){const state=Practice.state(p);if(progress&&state.estimateHistory?.length)state.estimateHistory.at(-1).thinkingFormats=progress;state.thinkingFormats={}}
  return result;
 };
})();
