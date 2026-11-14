const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./dist/english-steps.js');
let count=0;
for(const [kind,bank] of Object.entries(E.banks)){
 assert.ok(bank.length>=3);assert.equal(new Set(bank.map(x=>x.id)).size,bank.length);
 for(const row of bank){count++;assert.equal(row.choices.length,2);assert.notEqual(row.choices[0][0],row.choices[1][0]);assert.ok(row.meaning);assert.ok(row.text.split(/\s+/).length<=10)}
}
for(const bank of ['place','placeSentence'])assert.ok(E.banks[bank].every(x=>!x.text.includes('next to')));
assert.ok(E.banks.beside.some(x=>x.text.includes('next to')));
console.log('PASS '+count+' two-choice preparation items; spatial contrast introduces on/under before next to');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const E=c.EnglishSteps,def=id=>P.defs.find(d=>d.id===id);
function item(p,id='englishPictureSentence',index=0,n=0){const q={skill:id,index,course:def(id).courses[index]};q.englishStep=E.stageFor(p,q,n);if(q.englishStep)q.englishStep.id=E.banks[q.englishStep.kind][n%E.banks[q.englishStep.kind].length].id;return q}
function set(p,id='englishPictureSentence',clean=true){for(let n=0;n<5;n++)P.record(p,item(p,id,0,n),clean,2000);P.complete(p,'en')}
const p={flowers:8,game:{coins:123},practice:{version:2,skills:{number:{level:0,total:4,stages:{}}},limits:{englishPictureSentence:0},lowerPresets:{en:'elementary-3'}}};
const other=JSON.stringify(P.state(p).skills.number),limits=JSON.stringify(P.state(p).limits),lower=JSON.stringify(P.state(p).lowerPresets);
assert.equal(item(p).englishStep.kind,'animalSentence');
set(p);assert.equal(E.entry(p,'place').step,0);set(p);assert.equal(E.entry(p,'place').step,1);
assert.equal(P.skill(p,def('englishPictureSentence')).total,10);assert.equal(P.skill(p,def('englishPictureSentence')).stages[0],undefined);
assert.deepEqual([0,1,2,3,4].map(n=>item(p,undefined,0,n).englishStep.step),[0,0,1,0,0]);
// Sets in another topic must not consume the introduction to this topic.
P.complete(p,'en');assert.equal(item(p,undefined,0,0).englishStep.step,0);
set(p);assert.deepEqual([0,1,2,3,4].map(n=>item(p,undefined,0,n).englishStep.step),[0,1,0,1,0]);
set(p);assert.ok([0,1,2,3,4].every(n=>item(p,undefined,0,n).englishStep.step===1));
assert.equal(JSON.stringify(P.state(p).skills.number),other);assert.equal(JSON.stringify(P.state(p).limits),limits);assert.equal(JSON.stringify(P.state(p).lowerPresets),lower);assert.equal(p.game.coins,123);
const round=JSON.parse(JSON.stringify(p));assert.deepEqual(E.stageFor(round,{skill:'englishPictureSentence',index:0},0),E.stageFor(p,{skill:'englishPictureSentence',index:0},0));
console.log('PASS two-set evidence, no sentence mastery from preparation, 1 then 2 new questions, roundtrip and unrelated state preserved');
const slow={};P.setGentle(slow,true);set(slow);set(slow);assert.equal(E.entry(slow,'place').step,0);set(slow);assert.equal(E.entry(slow,'place').step,1);
const fast={};for(let n=0;n<20;n++){P.record(fast,item(fast,undefined,0,n%5),true,30);if(n%5===4)P.complete(fast,'en')}assert.equal(E.entry(fast,'place').step,0);
const entry=E.entry(p,'place');entry.step=2;entry.introducedAt=null;
P.record(p,item(p),false,2000);P.record(p,item(p),false,2000);assert.equal(entry.step,1);assert.equal(entry.misses,0);
entry.step=E.plans.place.length;entry.introducedAt=P.state(p).sessions.en;entry.introSets=0;
assert.deepEqual([0,1,2,3,4].map(n=>item(p,undefined,0,n).englishStep?.step??'original'),[3,3,'original',3,3]);
entry.introSets=2;assert.equal(item(p).englishStep,null);P.record(p,item(p),false,2000);P.record(p,item(p),false,2000);assert.equal(entry.step,3);assert.equal(entry.manual,true);
const known={};P.skill(known,def('englishPictureSentence')).stages[0]={mastered:true,attempts:20,firstCorrect:20,recent:[]};assert.equal(item(known).englishStep,null);E.reset(known);assert.equal(item(known).englishStep.kind,'animalSentence');assert.equal(P.skill(known,def('englishPictureSentence')).stages[0].mastered,true);
console.log('PASS gentle evidence, rapid-click protection, regression after misses, final transition and optional reset preserves history');
// Use actual question/answer adapters, with and without sound, and a floor that skips words.
run("PracticePresets.applyLimit(person(),'elementary-3',Practice);PracticePresets.apply(person(),'elementary-3',Practice);PracticeLowerLimits.apply(person(),'elementary-3','en');person().practiceFlow={freeChoice:true,next:'en'}");
const otherProfile=run('JSON.stringify(data.profiles[1])');
for(const sound of [false,true]){
 c.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 run('home();data.sound='+sound+';data.noListening='+!sound+';startSelectedPractice("englishPictureSentence")');
 assert.equal(run('practiceItem.skill'),'englishPictureSentence');assert.ok(run('englishSession.englishStep'));assert.equal(run('englishSession.choices.length'),2);assert.ok(app.innerHTML.includes('It is a '));assert.ok(run('englishSession.readingAlternative')===!sound);
 const total=run('Practice.skill(person(),foundationById("englishPictureSentence")).total');
 run('practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(x=>x[0]!==englishSession.word[0]),document.createElement("button"))');
 run('englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement("button"));englishAnswer(0,document.createElement("button"))');
 assert.equal(run('Practice.skill(person(),foundationById("englishPictureSentence")).total'),total+1);assert.equal(run('englishSession.clean'),0);assert.equal(run('autoNextTimer'),null);assert.equal(run('englishSession.done'),true);
 for(let n=1;n<5;n++){run('englishAdvance();practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement("button"))')}
 run('englishAdvance()');assert.equal(run('view'),'result');const coins=run('person().game.coins');run('englishFinish()');assert.equal(run('person().game.coins'),coins);
}
run('home();startSelectedPractice("englishPictureSentence")');const n=run('englishSession.n');run('EnglishSteps.easier()');assert.equal(run('englishSession.n'),n);assert.equal(run('englishSession.englishStep.step'),0);assert.equal(run('JSON.stringify(data.profiles[1])'),otherProfile);
assert.ok(run('practiceSettings()').includes('英語だけ やさしく戻す'));
console.log('PASS actual quiet/sound UI, grade floor, first-answer guard, five questions and single reward, child-local easier button');
`)(require);
