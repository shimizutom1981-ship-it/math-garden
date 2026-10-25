/* Append courses only: existing course IDs, mastery, rewards and timing are unchanged. */
for(const d of GardenQuestions.defs){
 const courses=d.stages.map((title,stage)=>{const i=TOPICS.length;TOPICS.push(['🧺',title,'えを みて かんがえよう','math']);curriculumMathCourses[i]={id:d.id,stage};curriculumCourseMeta[i]={title,stage,subject:'math'};return i});
 Practice.defs.push({id:d.id,subject:'math',courses,prerequisite:'number'});
 curriculumTitles[d.id]=d.title;practiceTestNames[d.id]=d.title;
}
const gardenMath=makeCurriculumMath;
makeCurriculumMath=function(i){
 const m=curriculumMathCourses[i];if(!m)return gardenMath(i);
 const id=m.id==='mathDecompose'?'mentalBridge':m.id;
 if(!GardenQuestions.banks[id])return gardenMath(i);
 // Keep existing decomposition questions as well as the new equivalent-sum forms.
 if(m.id==='mathDecompose'&&Math.random()<.5)return gardenMath(i);
 const seen=session?(session.gardenSeen??={}):{};
 return {...GardenQuestions.pick(id,m.stage,seen[i]??=[]),skill:m.id,i};
};
const readingCourses=Practice.defs.find(d=>d.id==='reading').courses;
GardenQuestions.japanese.forEach((rows,stage)=>{
 const course=readingCourses[stage],bank=JP_BANK[TOPICS[course][4]??course-JP_START];
 const texts=new Set(bank.map(row=>row[0]));for(const row of rows)if(!texts.has(row[0])){bank.push(row);texts.add(row[0])}
});
const social=ENGLISH_EXTENSION_SKILLS.find(s=>s.id==='enSocialDialog');
GardenQuestions.english.forEach((items,stage)=>social.stages[stage].items.push(...items));
