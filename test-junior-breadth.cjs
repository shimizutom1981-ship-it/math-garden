const fs=require('node:fs'),assert=require('node:assert/strict');
const data=require('./dist/junior-breadth-data.js'),sounds=require('./dist/junior-sounds.js'),spelling=require('./dist/junior-spelling-patterns.js');
const normalize=s=>s.toLowerCase().trim().replace(/\s+/g,' ');
const setup=fs.readFileSync('test-integration.cjs','utf8').split("assert.equal(run('freeSubjectChoice()'),false)")[0].replace("m[1]?.includes('garden-questions-ui.js')","/garden-questions-ui|language-depth-ui|junior-english-ui|junior-breadth-ui/.test(m[1]||'')");
new Function('require',setup+String.raw`
const baseline=new Set(run('[...VOCABULARY_GROUPS.flatMap(g=>g.words.map(w=>w.word)),...JuniorLexicon.flatMap(g=>g.lexicon.map(w=>w[0]))]').map(w=>w.toLowerCase()));
const source=run('JuniorBreadthData');const lexical=source.vocabulary.flatMap(g=>g.rows),newWords=new Set();
for(const r of lexical){const word=r.word.toLowerCase().trim();assert.ok(!baseline.has(word),'old headword '+word);assert.ok(!newWords.has(word),'repeated headword '+word);newWords.add(word);assert.ok(r.example.toLowerCase().includes(word),word);assert.ok(r.translation&&r.meaning&&r.topic);assert.equal(new Set([r.meaning,...r.distractors]).size,3);}
const singles=new Set([...baseline,...newWords].filter(w=>!w.includes(' ')));assert.ok(singles.size>=2200,'lexical breadth target: '+singles.size);
const morphology={went:'go',gone:'go',did:'do',done:'do',was:'be',were:'be',been:'be',saw:'see',seen:'see',ate:'eat',eaten:'eat',bought:'buy',better:'good',best:'good',bigger:'big',biggest:'big',children:'child',mice:'mouse',teeth:'tooth',feet:'foot'};
for(const [form,lemma] of Object.entries(morphology))assert.ok(!(newWords.has(form)&&baseline.has(lemma)),'inflection not a new headword: '+form);
const skills=run('breadthSkills'),all=skills.flatMap(s=>s.stages.flatMap(t=>t.items));assert.equal(new Set(all.map(q=>q.id)).size,all.length);
for(const skill of skills){assert.ok(skill.stages.length<=4);for(const stage of skill.stages){assert.ok(stage.items.length>=6,skill.id);for(const q of stage.items){assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3,q.id);assert.equal(q.choices.filter(x=>x===q.answer).length,1,q.id);assert.ok(q.prompt&&q.hint&&q.answerAudio);if(q.requiresAudio){assert.ok(q.fallbackSkillId);assert.ok(!q.prompt.includes(q.audioText));}}}}
assert.equal(source.reading.filter(s=>s.mode==='reading').length,24);assert.equal(source.reading.filter(s=>s.mode==='listen').length,12);
for(const set of source.reading){assert.equal(set.questions.length,3);for(const q of set.questions){assert.equal(q.choices.filter(a=>a===q.answer).length,1);for(const e of q.evidence)assert.ok(set.sources[e.source].text.includes(e.quote),q.id)}if(set.mode==='reading'){assert.ok(set.sources.length>=2);assert.ok(set.questions.some(q=>new Set(q.evidence.map(e=>e.source)).size>=2),set.id)}else assert.deepEqual([...new Set(set.questions.map(q=>q.kind))].sort(),['detail','gist','main']);}
assert.equal(source.supplement.length,7);for(const g of source.supplement)assert.equal(g.items.length,12);
console.log('PASS distinct headwords '+singles.size+', new lexical cards '+lexical.length+', 24 paired sources/72 tasks, 12 listening sources/36 tasks, 84 coverage supplements and sound/spelling patterns');
// Every new bank is actually registered and selectable; no silent data-only additions.
c.speechSynthesis={cancel(){},getVoices(){return []},speak(){}};c.SpeechSynthesisUtterance=function(text){this.text=text};
run('data.sound=true;data.music=false;person().practiceFlow={freeChoice:true,next:"en"};Practice.configure(person(),12,false)');
for(const skill of skills){
 const def=run('Practice.defs.find(d=>d.id==="'+skill.id+'")');assert.equal(def.upperEnglish,true);assert.equal(def.courses.length,skill.stages.length);
 for(let level=0;level<skill.stages.length;level++){
  run('englishSession={n:0,seen:[]};view="quiz"');const ids=new Set();
  for(let n=0;n<skill.stages[level].items.length;n++){
   run('buildAdvancedEnglish(englishSession,{index:'+level+'},{skill:breadthSkills.find(s=>s.id==="'+skill.id+'"),reading:false})');
   ids.add(run('englishSession.extensionQuestion.id'));assert.equal(run('englishSession.answerAudio'),run('englishSession.extensionQuestion.answerAudio'));
  }
  assert.equal(ids.size,skill.stages[level].items.length,skill.id+' no-repeat');
 }
}
// Low seeds never enter upper English by automatic rotation; old IDs and math remain intact.
for(const seed of [0,1]){run('person().practice={version:1,configured:true,seed:'+seed+',skills:{},turns:{},rotations:{}}');for(let n=0;n<250;n++){run('person().practice.rotations.en='+n);assert.ok(!run('Practice.focus(person(),"en").upperEnglish'));}}
const speech=[];let cancels=0;c.speechSynthesis.speak=u=>speech.push(u);c.speechSynthesis.cancel=()=>cancels++;
for(const id of ['junior_breadth_listen','junior_soundPatterns']){
 run('data.sound=true;englishSession={n:0,seen:[],practiceFocus:"'+id+'"};view="quiz";englishNext()');assert.equal(speech.at(-1).lang,'en-US');assert.equal(speech.at(-1).rate,.75);
 let before=cancels;run('englishSay(englishSession.audioTarget);englishSay(englishSession.audioTarget)');assert.ok(cancels>=before+2);
 before=cancels;run('useReadingPractice()');assert.ok(cancels>before);assert.ok(run('englishSession.readingAlternative'));assert.match(run('practiceItem.skill'),/Reading$/);
}
delete c.speechSynthesis;run('data.sound=true;englishSession={n:0,seen:[],practiceFocus:"junior_breadth_listen"};view="quiz";englishNext()');assert.equal(run('practiceItem.skill'),'junior_breadth_listenReading');
// Grade/question grammar knowledge must not reveal a solution through automatic audio.
c.speechSynthesis={cancel(){},getVoices(){return []},speak(u){speech.push(u)}};speech.length=0;
run('englishSession={n:0,seen:[]};view="quiz";buildAdvancedEnglish(englishSession,{index:0},{skill:breadthSkills.find(s=>s.id==="junior_prosodyKnowledge"),reading:false})');assert.equal(speech.length,0);assert.ok(run('englishSession.readingAlternative'));
console.log('PASS every new bank registered/exhausted, legacy registration unchanged, low-stage isolation, audio en-US/replay/cancellation/text fallback, no automatic answer speech');
`)(require);
