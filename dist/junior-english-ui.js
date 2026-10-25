/* Upper courses are explicit choices or unlocked by existing English evidence. */
const juniorSkills=[...JuniorEnglish.skills,...JuniorLexicon,...JuniorTexts.skills];
for(const skill of juniorSkills){
 registerAdvancedEnglish(skill,false);
 const ids=[skill.id];
 if(skill.stages[0].items[0].requiresAudio){const fallback=registerAdvancedEnglish(skill,true);curriculumAudioFallback[skill.id]=fallback;ids.push(fallback)}
 for(const id of ids){const d=Practice.defs.find(x=>x.id===id);d.upperEnglish=true;d.prerequisite='enReply'}
}
const juniorEnglishBuild=buildAdvancedEnglish;
buildAdvancedEnglish=function(e,item,meta){const result=juniorEnglishBuild(e,item,meta);if(meta.skill.id.startsWith('junior_')){e.answerAudio=e.extensionQuestion.answerAudio;document.querySelector('.board')?.classList.add('language-depth-board')}return result};
const juniorEnglishRender=renderCurriculumEnglish;
renderCurriculumEnglish=function(e,title,context,mode,audioText){if(e.extensionQuestion?.id?.startsWith('junior-')&&['grammar','reading'].includes(e.extensionQuestion.mode)){e.readingAlternative=true;mode='読んで考えてえらぼう'}return juniorEnglishRender(e,title,context,mode,audioText)};
const juniorEnglishNext=englishNext;
englishNext=function(){if(englishSession?.extensionQuestion?.id?.startsWith('junior-')&&'speechSynthesis'in window)speechSynthesis.cancel();return juniorEnglishNext()};
const juniorLeaveQuiz=leaveQuizScreen;
leaveQuizScreen=function(){if(englishSession?.extensionQuestion?.id?.startsWith('junior-')&&'speechSynthesis'in window)speechSynthesis.cancel();return juniorLeaveQuiz()};
