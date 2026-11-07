/* Add representations within existing stages, without changing any persisted state. */
MathLifeExpansion.install(GardenQuestions);
const beforeFractionVariety=makeCurriculumMath;
makeCurriculumMath=function(i){
 const m=curriculumMathCourses[i];
 if(!m||m.id!=='mathRational'||m.stage!==0)return beforeFractionVariety(i);
 // Alternate new representations and the original area-diagram generator.
 // Rotation lasts only for this set and never affects learner records.
 const state=session?(session.fractionVariety??={turn:0,seen:[]}):{turn:0,seen:[]};
 if(state.turn++%2===1)return beforeFractionVariety(i);
 return {...FractionVariety.pick(state.seen),i};
};
