const breadthSkills=[];
for(const group of JuniorBreadthData.vocabulary){
 const skill={id:'junior_breadth_'+group.key,title:'中学英語・語彙 '+group.title,stages:[0,1,2,3].map(level=>({title:group.title+' '+(level+1),items:group.rows.filter(r=>r.level===level).map((r,i)=>({id:`junior-breadth-${group.key}-${level}-${i}`,mode:'vocabulary',topic:r.topic,headword:r.word,prompt:`文の中の「${r.word}」の意味は？\n${r.example}`,fallbackPrompt:`文の中の「${r.word}」の意味は？\n${r.example}`,audioText:r.example,answerAudio:r.example,answer:r.meaning,choices:[r.meaning,...r.distractors],hint:r.translation+'（'+r.word+'：'+r.meaning+'）'}))}))};breadthSkills.push(skill);
}
for(const mode of ['reading','listen']){
 const skill={id:'junior_breadth_'+mode,title:mode==='reading'?'中学英語・資料を照らして読む':'中学英語・必要情報と概要を聞く',stages:[0,1,2,3].map(level=>({title:['情報を探して合わせる','条件と変更点','理由と意見を整理する','根拠から判断する'][level],items:JuniorBreadthData.reading.filter(set=>set.mode===mode&&set.level===level).flatMap(set=>set.questions.map(q=>{
 const text=set.sources.map(s=>s.label+'\n'+s.text).join('\n\n'),audioText=set.sources.map(s=>s.text).join('\n');
 return {id:'junior-breadth-'+set.id+'-'+q.id,mode:mode==='listen'?'listen':'reading',topic:q.kind,sourceSet:set.id,materialTitle:set.title,questionPrompt:q.prompt,sources:set.sources,evidence:q.evidence,requiresAudio:mode==='listen',fallbackSkillId:'junior_breadth_listenReading',prompt:mode==='listen'?'聞いて、情報や要点を選ぼう。\n'+q.prompt:set.title+'\n\n'+text+'\n\n'+q.prompt,fallbackPrompt:set.title+'\n\n'+text+'\n\n'+q.prompt,audioText:mode==='listen'?audioText:'Read the sources and choose the answer.',answerAudio:q.answer,answer:q.answer,choices:q.choices,hint:q.hint};
 }))}))};breadthSkills.push(skill);
}
for(const group of JuniorBreadthData.supplement){
 // Two explicit practice stages with at least six different examples each.
 const sorted=[...group.items].sort((a,b)=>a.level-b.level);
 breadthSkills.push({id:'junior_breadth_'+group.id,title:group.title,stages:[sorted.slice(0,Math.ceil(sorted.length/2)),sorted.slice(Math.ceil(sorted.length/2))].map((items,s)=>({title:group.title+(s?'・発展':'・基本'),items:items.map(q=>({...q,id:'junior-breadth-'+q.id,mode:'reading',fallbackPrompt:q.prompt,audioText:'Read the question and choose the answer.'}))}))});
}
breadthSkills.push(...JuniorSounds,JuniorSpellingPatterns);
for(const skill of breadthSkills){
 registerAdvancedEnglish(skill,false);const ids=[skill.id];
 if(skill.stages[0].items[0].requiresAudio){const fallback=registerAdvancedEnglish(skill,true);curriculumAudioFallback[skill.id]=fallback;ids.push(fallback)}
 for(const id of ids){const def=Practice.defs.find(d=>d.id===id);def.upperEnglish=true;def.prerequisite='enReply'}
}
const breadthRender=renderCurriculumEnglish;
renderCurriculumEnglish=function(e,title,context,mode,audioText){
 const q=e.extensionQuestion;
 if(q?.sources&&(q.mode==='reading'||e.readingAlternative))context='<span class="source-materials" role="group" aria-label="'+esc(q.materialTitle)+'">'+q.sources.map(s=>'<span class="source-card" role="group" aria-label="'+esc(s.label)+'"><strong>'+esc(s.label)+'</strong><span>'+esc(s.text)+'</span></span>').join('')+'</span><strong class="source-question">'+esc(q.questionPrompt)+'</strong>';
 return breadthRender(e,title,context,mode,audioText);
};
document.head.insertAdjacentHTML('beforeend','<style>.source-materials,.source-card,.source-card strong,.source-card>span,.source-question{display:block}.source-card{padding:12px;margin:8px 0;border:1px solid #cedbc5;border-radius:12px;background:#f3f7ed;text-align:left;font-size:clamp(16px,4vw,20px);line-height:1.55;white-space:pre-line}.source-card strong{margin-bottom:6px;color:#315b46}.source-question{margin:14px 0;font-size:clamp(17px,4vw,22px);line-height:1.5}</style>');
