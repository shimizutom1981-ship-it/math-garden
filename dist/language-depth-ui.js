/* Append-only registration: existing profile records and course IDs stay intact. */
for(const skill of LanguageDepth.japanese){
 if(skill.kanji)for(const bank of skill.banks)bank.readingTask='kanji';
 registerJapanese(skill.id,skill.title,skill.banks,'reading');
 if(skill.kanji)Practice.defs.find(d=>d.id===skill.id).courses.forEach((course,stage)=>{TOPICS[course][1]=`${stage+1}年の漢字読み（一部）`;curriculumCourseMeta[course].title=TOPICS[course][1]});
}
registerAdvancedEnglish(ConversationDepth,false);
curriculumAudioFallback[ConversationDepth.id]=registerAdvancedEnglish(ConversationDepth,true);
const depthEnglishBuild=buildAdvancedEnglish;
buildAdvancedEnglish=function(e,item,meta){const result=depthEnglishBuild(e,item,meta);if(meta.skill.id===ConversationDepth.id){e.answerAudio=e.extensionQuestion.answerAudio;document.querySelector('.board')?.classList.add('language-depth-board')}return result};
const depthNextQuestion=nextQuestion;
nextQuestion=function(){depthNextQuestion();if(view==='quiz'&&q&&LanguageDepth.japanese.some(s=>Practice.defs.find(d=>d.id===s.id).courses.includes(q.i)))document.querySelector('.board')?.classList.add('language-depth-board')};
// Stop an unfinished dialogue before switching to text, the next item, or the garden.
function cancelDepthSpeech(){if(englishSession?.extensionQuestion?.id?.startsWith('conversation-depth-')&&'speechSynthesis'in window)speechSynthesis.cancel()}
const depthEnglishNext=englishNext;
englishNext=function(){cancelDepthSpeech();return depthEnglishNext()};
const depthLeaveQuiz=leaveQuizScreen;
leaveQuizScreen=function(){cancelDepthSpeech();return depthLeaveQuiz()};
document.head.insertAdjacentHTML('beforeend','<style>body.quiz-mode .language-depth-board .question{font-size:clamp(18px,4.5vw,26px);line-height:1.7;white-space:pre-line;text-align:left}.language-depth-board .english-context{font-size:clamp(18px,4vw,24px);white-space:pre-line;text-align:left}.language-depth-board .choices{flex-shrink:0}.language-depth-board .choice{font-size:clamp(16px,4vw,22px)!important;line-height:1.5;white-space:normal;overflow-wrap:anywhere}body.quiz-mode .language-depth-board{justify-content:flex-start;overflow-y:auto;min-height:0;gap:12px}.language-depth-board>*{flex-shrink:0}</style>');
