const fs=require('node:fs'),assert=require('node:assert/strict');
const jp=require('./dist/language-depth.js'),conversation=require('./dist/conversation-depth.js'),junior=require('./dist/junior-english.js'),lexicon=require('./dist/junior-lexicon.js'),texts=require('./dist/junior-texts.js');
const jpRows=jp.japanese.flatMap(x=>x.banks.flat());
assert.equal(jpRows.length,144);assert.equal(new Set(jpRows.map(r=>r[0])).size,144);
for(const s of jp.japanese)for(const bank of s.banks){assert.ok(bank.length>=5);for(const r of bank){assert.equal(new Set([r[1],...r[2].split('|')]).size,3);assert.ok(r[3])}}
const all=[conversation,...junior.skills,...lexicon,...texts.skills],items=all.flatMap(s=>s.stages.flatMap(x=>x.items));
assert.equal(new Set(items.map(x=>x.id)).size,items.length);
for(const s of all)for(const stage of s.stages){assert.ok(stage.items.length>=5,s.id);for(const q of stage.items){assert.equal(q.choices.filter(x=>x===q.answer).length,1,q.id);assert.equal(new Set(q.choices).size,3,q.id);assert.ok(q.prompt&&q.audioText&&q.answerAudio&&q.hint);if(q.evidence)assert.ok((q.passage||q.audioText).includes(q.evidence),q.id);if(q.requiresAudio){assert.ok(q.fallbackPrompt.includes(q.passage||q.audioText));assert.ok(!q.prompt.includes(q.audioText));assert.ok(q.fallbackSkillId)}}}
for(const s of junior.grammar){assert.ok(s.examples.length>=6);for(const q of s.stages.flatMap(x=>x.items)){assert.equal(q.audioText,'Choose the correct answer.');assert.doesNotMatch(q.answerAudio,/[\u3000-\u9fff]/)}}
assert.equal(junior.grammar.length,27);assert.equal(lexicon.flatMap(x=>x.lexicon).length,120);
console.log('PASS 144 Japanese tasks, 32 elementary dialogues, 27 grammar domains, 120 lexical cards, 72 junior text/response tasks; unique options, explicit evidence and minimum bank sizes');
// Reuse the real application bootstrap without running unrelated integration assertions.
const setup=fs.readFileSync('test-integration.cjs','utf8').split("assert.equal(run('freeSubjectChoice()'),false)")[0].replace("m[1]?.includes('garden-questions-ui.js')","/garden-questions-ui|language-depth-ui|junior-english-ui/.test(m[1]||'')");
const test=String.raw`
const spoken=[];let cancellations=0;
c.speechSynthesis={cancel(){cancellations++},getVoices(){return [{lang:'en-US',name:'Synthetic English'}]},speak(u){spoken.push(u)}};
c.SpeechSynthesisUtterance=function(text){this.text=text};
run('data.sound=true;data.music=false;practiceTestVisible=false');
const original=JSON.parse(run('JSON.stringify(data)'));
// Every new kanji uses neutral automatic/replay narration before the answer.
for(const course of run("Practice.defs.find(d=>d.id==='jp_gradeKanji').courses")){
 run('session={auto:false,seen:{},n:0,help:false,wrong:false,done:false,correct:0,misses:0};view="quiz"');
 const size=run('JP_BANK['+course+'-JP_START].length'),seen=new Set();
 for(let n=0;n<size;n++){run('session.done=false;q=makeQuestion('+course+')');seen.add(run('q.text'));spoken.length=0;run('speakQuestion();speakQuestion()');assert.ok(spoken.every(u=>u.text===run('q.instructionSpeech')));assert.equal(run('q.readingTask'),'kanji');}
 assert.equal(seen.size,size);
}
// Real upper-course gating leaves seeds 0/1 out, while explicit course choice still works.
for(const seed of [0,1]){run('person().practice={version:1,configured:true,seed:'+seed+',skills:{},turns:{},rotations:{}}');for(let n=0;n<200;n++){run('person().practice.rotations.en='+n);assert.ok(!run('Practice.focus(person(),"en").upperEnglish'))}}
run('person().practice.seed=2');let upper=false;for(let n=0;n<200;n++){run('person().practice.rotations.en='+n);upper ||=run('!!Practice.focus(person(),"en").upperEnglish')}assert.ok(upper);
run('person().practice.seed=0;person().practice.skills.enReply={level:3,total:20}');upper=false;for(let n=0;n<200;n++){run('person().practice.rotations.en='+n);upper ||=run('!!Practice.focus(person(),"en").upperEnglish')}assert.ok(upper);
// Rendering and replay use English voice/rate. Text/next/home cancel previous audio.
for(const id of ['enConversationDepth','junior_listening']){
 run('data.sound=true;englishSession={n:0,seen:[],practiceFocus:"'+id+'"};view="quiz";englishNext()');
 let u=spoken.at(-1);assert.equal(u.lang,'en-US');assert.equal(u.rate,.75);assert.equal(u.voice.name,'Synthetic English');assert.equal(u.text,run('englishSession.audioTarget'));
 const before=cancellations;run('englishSay(englishSession.audioTarget);englishSay(englishSession.audioTarget)');assert.ok(cancellations>=before+2);
 const fallbackBefore=cancellations;run('useReadingPractice()');assert.ok(cancellations>fallbackBefore);assert.ok(run('englishSession.readingAlternative'));assert.match(run('englishSession.practiceFocus'),/Reading$/);
 run('data.sound=true;englishSession={n:0,seen:[],practiceFocus:"'+id+'"};view="quiz";englishNext()');const homeBefore=cancellations;run('home()');assert.ok(cancellations>homeBefore);
 run('data.sound=false;englishSession={n:0,seen:[],practiceFocus:"'+id+'"};view="quiz";englishNext()');assert.ok(run('englishSession.readingAlternative'));assert.match(run('practiceItem.skill'),/Reading$/);
}
// All new English stages can be rendered and exhausted without repeat before refill.
run('data.sound=true');
for(const skill of run('[ConversationDepth,...juniorSkills]'))for(let index=0;index<skill.stages.length;index++){
 run('englishSession={n:0,seen:[]};view="quiz"');const seen=new Set();
 for(let n=0;n<skill.stages[index].items.length;n++){
  run('buildAdvancedEnglish(englishSession,{index:'+index+'},{skill:[ConversationDepth,...juniorSkills].find(s=>s.id==="'+skill.id+'"),reading:false})');
  assert.equal(run('englishSession.answerAudio'),run('englishSession.extensionQuestion.answerAudio'));seen.add(run('englishSession.extensionQuestion.id'));
 }
 assert.equal(seen.size,skill.stages[index].items.length);
}
// Registration did not rewrite the existing inventory or legacy English level 100.
assert.equal(run('person().game.coins'),original.profiles[0].game.coins);assert.deepEqual(JSON.parse(run('JSON.stringify(person().game.owned)')),original.profiles[0].game.owned);
run('person().english={level:100,total:25};home()');assert.equal(run('person().english.level'),100);
console.log('PASS all 72 new kanji narration paths; upper-course isolation; English voice/replay/cancel/fallback; full bank exhaustion; inventory and legacy level 100');
console.log(run('JSON.stringify({japanese:JP_BANK.flat().length,words:VOCABULARY_GROUPS.flatMap(g=>g.words).length,newEnglish:[ConversationDepth,...juniorSkills].reduce((n,s)=>n+s.stages.reduce((n,t)=>n+t.items.length,0),0)})'));
`;
new Function('require',setup+test)(require);
