const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const def=id=>P.defs.find(d=>d.id===id),copy=x=>JSON.parse(JSON.stringify(x));
let speeches=0,audioContexts=0;
c.speechSynthesis={cancel(){},speak(){speeches++},getVoices:()=>[],speaking:false,pending:false};c.SpeechSynthesisUtterance=function(t){this.text=t};
c.AudioContext=function(){audioContexts++;throw Error('Unexpected audio in quiet mode')};
function master(p){P.state(p).settings={kanji:true,carry:true};for(const d of P.defs){const s=P.skill(p,d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:10,firstCorrect:10,recent:[]})}}
function fresh(){run("home();data.profiles[0]={name:'Synthetic',stats:{},flowers:0};data.current=0;home()")}
function complete(kind){run(kind==='en'?'startEnglish()':"start(recommendationFor('"+kind+"'),true)");for(let n=0;n<5;n++){run('practiceClock.start-=2000');run(kind==='en'?"englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()":"answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}assert.equal(run('view'),'result')}
test('mode is saved browser-wide without changing learner records or difficulty caps',()=>{
 run('home();data.sound=true;data.music=true');const before=run('JSON.stringify(data.profiles)');run('setNoListening(true)');assert.equal(run('JSON.stringify(data.profiles)'),before);assert.equal(run('data.sound||data.music'),false);
 const saved=JSON.parse(storage.get('kazunoniwa-v1'));assert.equal(saved.noListening,true);assert.equal(saved.beforeQuiet.sound,true);assert.equal(saved.beforeQuiet.music,true);
 run('data.current=1;home()');assert.equal(run('data.noListening'),true);run('data.current=0;home()');
 const again=run('JSON.stringify(data)');run('setNoListening(true);setNoListening("true")');assert.equal(run('JSON.stringify(data)'),again);
});
test('speech, music and effects stay silent, including stale sound settings',()=>{
 run("speak('test');englishSay('test');playFeedSound(true);musicControl();startMusic();data.sound=true;data.music=true;speak('test');englishSay('test');playFeedSound(true);startMusic()");assert.equal(speeches,0);assert.equal(audioContexts,0);run('data.sound=false;data.music=false');
});
test('all 32 introductory English stages display a complete readable question',()=>{
 master(run('person()'));
 for(const id of ['enWords','enDescribe','enSentence','enReply']){const d=def(id);for(let i=0;i<d.courses.length;i++){
 P.skill(run('person()'),d).level=i;run("home();curriculumRequestedFocus='"+id+"';startEnglish()");assert.equal(run('practiceItem.skill'),id);assert.equal(run('practiceItem.index'),i);assert.equal(run('englishSession.readingAlternative'),true);
 assert.ok(app.innerHTML.includes(run('esc(englishSession.word[3]||englishSession.word[0])')));assert.doesNotMatch(app.innerHTML,/onclick="englishSay|onclick="englishOptionPreview|id="confirmEnglish"/);
 if(id==='enReply')for(const choice of run('englishSession.choices'))assert.ok(app.innerHTML.includes(run('esc('+JSON.stringify(choice[0])+')')));
 }}
});
test('explicit audio-only skills never enter the quiet automatic or requested pool',()=>{
 master(run('person()'));const ids=run('Object.keys(curriculumAudioFallback)');assert.ok(ids.length>5);
 for(let i=0;i<300;i++){P.state(run('person()')).rotations.en=i;assert.ok(!ids.includes(P.pick(run('person()'),'en').skill));}
 for(const id of ids){assert.ok(!ids.includes(P.pick(run('person()'),'en',id).skill));run("home();curriculumRequestedFocus='"+id+"';startEnglish()");assert.equal(run('practiceItem.skill'),run("curriculumAudioFallback['"+id+"']"));assert.equal(run('englishSession.readingAlternative'),true);}
 assert.ok(P.available(run('person()'),'en').some(d=>d.id==='enWords'));assert.ok(P.available(run('person()'),'en').some(d=>d.id.startsWith('vocab_')));
});
test('reading fallback keeps its own cap, mastery and prerequisite checks',()=>{
 const id='enListening',fallback=run("curriculumAudioFallback.enListening");master(run('person()'));P.setLimit(run('person()'),fallback,-1);const before=JSON.stringify(P.skill(run('person()'),def(id)));
 run("home();curriculumRequestedFocus='enListening';startEnglish()");assert.notEqual(run('practiceItem.skill'),id);assert.notEqual(run('practiceItem.skill'),fallback);run('practiceClock.start-=2000');run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");assert.equal(JSON.stringify(P.skill(run('person()'),def(id))),before);
 P.setLimit(run('person()'),fallback,0);P.skill(run('person()'),def(fallback)).level=0;run("home();curriculumRequestedFocus='enListening';startEnglish()");assert.equal(run('practiceItem.skill'),fallback);assert.equal(run('practiceItem.index'),0);
});
test('quiet English wrong and repeated answers keep existing first-attempt semantics',()=>{
 fresh();run('startEnglish();practiceClock.start-=2000');run("englishAnswer(englishSession.choices.findIndex(x=>x[0]!==englishSession.word[0]),document.createElement('button'))");assert.equal(run('Practice.skill(person(),foundationById("enWords")).total'),1);assert.equal(run('englishSession.help'),true);
 run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");assert.equal(run('Practice.skill(person(),foundationById("enWords")).total'),1);assert.equal(run('englishSession.clean'),0);assert.equal(run('Practice.skill(person(),foundationById("enWords")).stages[0].recent[0].variant'),'reading');
});
test('preschool caps still permit all subjects and the complete tile reward cycle',()=>{
 fresh();run("PracticePresets.apply(person(),'preschool-younger',Practice);PracticePresets.applyLimit(person(),'preschool-younger',Practice)");const coins=run('game().coins');
 for(const kind of ['math','jp','en'])complete(kind);
 assert.equal(run('learningCycle().pending'),true);assert.equal(run('person().flowers'),3);assert.equal(run('game().coins'),coins+30);run('englishFinish();finish()');assert.equal(run('game().coins'),coins+30);
 run('openTileReward()');assert.equal(run('view'),'tileReward');
});
test('returning to listening restores saved sound preferences and audio availability',()=>{
 fresh();run('data.beforeQuiet={sound:true,music:false};setNoListening(false)');assert.equal(run('data.sound'),true);assert.equal(run('data.music'),false);master(run('person()'));run('delete person().tileCycle');
 assert.ok(P.available(run('person()'),'en').some(d=>d.id==='enListening'));run("curriculumRequestedFocus='enListening';startEnglish()");assert.equal(run('practiceItem.skill'),'enListening');assert.equal(run('englishSession.readingAlternative'),false);assert.ok(speeches>0);
});
test('switching during a question changes neither completed count nor reward',()=>{
 const before=run('JSON.stringify([englishSession.n,person().flowers,game().coins])');run('setNoListening(true)');assert.equal(run('JSON.stringify([englishSession.n,person().flowers,game().coins])'),before);assert.equal(run('englishSession.readingAlternative'),true);assert.equal(run('practiceItem.skill'),'enListeningReading');
 run('practiceClock.start-=2000');run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'))");const answer=run('JSON.stringify([englishSession.n,englishSession.word,englishSession.done,practiceItem])');run('data.beforeQuiet={sound:false,music:false};setNoListening(false)');assert.equal(run('JSON.stringify([englishSession.n,englishSession.word,englishSession.done,practiceItem])'),answer);
});
test('mode changes preserve the visible course subject',()=>{
 run("home();person().practiceFlow.freeChoice=true;openPracticeCourses('math');setNoListening(true)");assert.ok(app.innerHTML.includes("startSelectedPractice('number')"));assert.ok(!app.innerHTML.includes("startSelectedPractice('enWords')"));
});
test('switching during math cannot revive a stale unfinished English session',()=>{
 fresh();run('setNoListening(false);startEnglish();home();start(recommendationFor("math"),true)');const before=run('JSON.stringify([session,q,practiceItem])');run('setNoListening(true)');assert.equal(run('JSON.stringify([session,q,practiceItem])'),before);assert.equal(run('subject'),'math');
});
test('saved quiet mode prevents audio even before initialization finishes on reload',()=>{
 const saved=JSON.parse(storage.get('kazunoniwa-v1'));saved.noListening=true;saved.sound=true;saved.music=true;storage.set('kazunoniwa-v1',JSON.stringify(saved));
 const reload={...c};reload.window=reload;vm.createContext(reload);const before=[speeches,audioContexts];
 for(const m of fs.readFileSync('dist/index.html','utf8').matchAll(/<script(?:\\s+src="([^"]+)")?[^>]*>([\\s\\S]*?)<\\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],reload);
 assert.equal(vm.runInContext('data.noListening&&!data.sound&&!data.music',reload),true);assert.deepEqual([speeches,audioContexts],before);
});
test('tile reward locks audio at initialization and after a verified live mode change',()=>{
 const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};let handler;
 const parent={postMessage(){}},tile={console,Math,Date,setTimeout:()=>1,clearTimeout(){},parent,location:{origin:'https://example.test'},document:{getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:()=>({...element(),dataset:{}})},addEventListener(type,fn){handler=fn},AudioContext:function(){throw Error('Tile must stay silent')}};tile.window=tile;vm.createContext(tile);
 const script=fs.readFileSync('dist/komorebi-reward.html','utf8').match(/<script>([\\s\\S]*?)<\\/script>/)[1];vm.runInContext(script,tile);
 handler({source:parent,origin:tile.location.origin,data:{type:'komorebi:init',token:'test',level:1,noListening:true}});assert.equal(el('sound').disabled,true);el('sound').onclick();assert.equal(vm.runInContext('sound',tile),false);
 const audio=(quiet,token='test')=>handler({source:parent,origin:tile.location.origin,data:{type:'komorebi:audio',token,noListening:quiet}});
 audio(false,'wrong');assert.equal(el('sound').disabled,true);audio(false);assert.equal(el('sound').disabled,false);audio(true);assert.equal(el('sound').disabled,true);el('sound').onclick();assert.equal(vm.runInContext('sound',tile),false);
});
console.log(count+' quiet-mode tests passed');
`)(require);
