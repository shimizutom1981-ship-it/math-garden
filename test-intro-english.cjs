const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+`
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name)}
const def=()=>P.defs.find(d=>d.id==='enWords');
const published=[[["cat","🐱","ねこ"],["dog","🐶","いぬ"],["rabbit","🐰","うさぎ"],["bear","🐻","くま"],["elephant","🐘","ぞう"],["fish","🐟","さかな"],["bird","🐦","とり"],["frog","🐸","かえる"],["lion","🦁","らいおん"],["tiger","🐯","とら"],["monkey","🐵","さる"],["panda","🐼","ぱんだ"],["giraffe","🦒","きりん"],["zebra","🦓","しまうま"],["horse","🐴","うま"],["cow","🐮","うし"],["pig","🐷","ぶた"],["sheep","🐑","ひつじ"],["mouse","🐭","ねずみ"],["turtle","🐢","かめ"],["whale","🐳","くじら"],["dolphin","🐬","いるか"],["fox","🦊","きつね"],["koala","🐨","こあら"]],[["apple","🍎","りんご"],["banana","🍌","ばなな"],["grapes","🍇","ぶどう"],["strawberry","🍓","いちご"],["bread","🍞","ぱん"],["rice ball","🍙","おにぎり"],["cake","🍰","けーき"],["egg","🥚","たまご"],["orange","🍊","おれんじ"],["peach","🍑","もも"],["pear","🍐","ようなし"],["melon","🍈","めろん"],["watermelon","🍉","すいか"],["lemon","🍋","れもん"],["pineapple","🍍","ぱいなっぷる"],["cherry","🍒","さくらんぼ"],["carrot","🥕","にんじん"],["tomato","🍅","とまと"],["potato","🥔","じゃがいも"],["corn","🌽","とうもろこし"],["cucumber","🥒","きゅうり"],["cheese","🧀","ちーず"],["cookie","🍪","くっきー"],["milk","🥛","ぎゅうにゅう"]],[["car","🚗","くるま"],["train","🚃","でんしゃ"],["airplane","✈️","ひこうき"],["bicycle","🚲","じてんしゃ"],["book","📖","ほん"],["umbrella","☂️","かさ"],["hat","👒","ぼうし"],["ball","⚽","ぼーる"],["bus","🚌","ばす"],["boat","⛵","ふね"],["rocket","🚀","ろけっと"],["truck","🚚","とらっく"],["pencil","✏️","えんぴつ"],["key","🔑","かぎ"],["bed","🛏️","べっど"],["chair","🪑","いす"],["door","🚪","どあ"],["clock","🕒","とけい"],["phone","📱","でんわ"],["bag","🎒","かばん"],["guitar","🎸","ぎたー"],["spoon","🥄","すぷーん"],["drum","🥁","たいこ"],["kite","🪁","たこ"]]];
const original=[['cat','dog','rabbit','bear','elephant','fish','bird','frog'],['apple','banana','grapes','strawberry','bread','rice ball','cake','egg'],['car','train','airplane','bicycle','book','umbrella','hat','ball']];
const banks=run('EN_WORDS.slice(0,3)');
const bankSize=48;
let spoken=[],utterances=[];
const englishVoice={lang:'en-US',name:'Synthetic US voice'};
c.speechSynthesis={cancel(){},getVoices:()=>[{lang:'ja-JP'},englishVoice],speak(u){spoken.push(u.text);utterances.push({text:u.text,lang:u.lang,rate:u.rate,voice:u.voice})}};c.SpeechSynthesisUtterance=function(text){this.text=text};
function fresh(){run("home();data.current=0;data.profiles[0]={name:'Synthetic',stats:{},flowers:0};Practice.state(person());home()");}
function at(stage){P.skill(run('person()'),def()).level=stage;P.state(run('person()')).turns.en=0;run("session=null;view='quiz';englishSession={n:0,clean:0,seen:[],practiceFocus:'enWords'}");}
function next(){run('englishNext()');return run('englishSession');}
function correct(){run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()");}
test('all three introductory banks expand to 48 familiar picture words without changing course IDs',()=>{
 assert.deepEqual(Array.from(def().courses),Array.from({length:12},(_,i)=>i));
 const words=[];
 banks.forEach((bank,i)=>{
  assert.equal(bank.length,bankSize);assert.deepEqual(JSON.parse(JSON.stringify(bank.slice(0,24))),published[i]);assert.deepEqual(Array.from(bank.slice(0,8),w=>w[0]),original[i]);
  for(const field of [0,1,2])assert.equal(new Set(bank.map(w=>w[field])).size,bankSize);
  for(const w of bank){assert.equal(w.length,3);assert.match(w[0],/^[a-z]+(?: [a-z]+)?$/);assert.ok(w[0].length<=12);assert.match(w[2],/^[ぁ-ゖー]+$/u);assert.ok(w[1]);words.push(w[0]);}
 });
 assert.equal(new Set(words).size,144);
});
test('all 12 stages keep their 2/3 choices and expose every word in listening and quiet modes',()=>{
 for(const quiet of [false,true])for(let stage=0;stage<12;stage++){
  fresh();run('data.noListening='+quiet+';data.sound='+!quiet);at(stage);
  const expected=banks[Math.floor(stage/4)],seen=new Set(),beforeSpeech=spoken.length;
  for(let n=0;n<bankSize;n++){
   if(n%5===0)run('englishSession.seen=[]');
   const e=next();assert.equal(e.level,stage);assert.equal(e.choices.length,stage%4<2?2:3);
   assert.equal(e.readingAlternative,quiet);assert.ok(expected.some(w=>w[0]===e.word[0]));assert.ok(!seen.has(e.word[0]));seen.add(e.word[0]);
   for(const field of [0,1,2])assert.equal(new Set(e.choices.map(w=>w[field])).size,e.count);
   assert.equal(e.choices.filter(w=>w[0]===e.word[0]).length,1);
   for(const choice of e.choices){assert.ok(app.innerHTML.includes('aria-label="'+choice[2]+'"'));assert.ok(app.innerHTML.includes(choice[1]));}
   if(quiet){assert.ok(app.innerHTML.includes('<p class="english-context">'+e.word[0]+'</p>'));assert.ok(!app.innerHTML.includes('onclick="englishSay'));}
   else {assert.equal(spoken.at(-1),e.word[0]);assert.equal(utterances.at(-1).lang,'en-US');assert.equal(utterances.at(-1).rate,.75);assert.equal(utterances.at(-1).voice,englishVoice);assert.ok(app.innerHTML.includes('<p class="english-context" lang="en">'+e.word[0]+'</p>'));assert.ok(app.innerHTML.indexOf('lang="en"')<app.innerHTML.indexOf('class="choices"'));assert.equal(e.done,false);}
  }
  assert.equal(seen.size,bankSize);assert.equal(spoken.length-beforeSpeech,quiet?0:bankSize);
 }
});
test('visible spelling keeps audio replay, first-answer recording and quiet-mode behavior',()=>{
 fresh();run('data.noListening=false;data.sound=true');at(0);const e=next();
 assert.equal(e.wordPractice.mode,'listening');assert.equal(e.readingAlternative,false);
 assert.ok(app.innerHTML.includes('<p class="english-context" lang="en">'+e.word[0]+'</p>'));
 const before=run('JSON.stringify([data,englishSession.n,englishSession.word,englishSession.choices])'),speechCount=spoken.length;
 run('englishSay(englishSession.word[0]);englishSay(englishSession.word[0])');
 assert.equal(run('JSON.stringify([data,englishSession.n,englishSession.word,englishSession.choices])'),before);assert.equal(spoken.length,speechCount+2);
 run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'))");
 assert.equal(run("person().englishWordPractice.banks['animals:listening'].words[englishSession.word[0]].correct"),1);
 assert.equal(run('practiceItem.form'),'listening');
 run('englishAdvance();setNoListening(true)');assert.equal(run('englishSession.n'),1);assert.equal(run('englishSession.readingAlternative'),true);
 assert.ok(app.innerHTML.includes('<p class="english-context">'+run('englishSession.word[0]')+'</p>'));assert.ok(!app.innerHTML.includes('onclick="englishSay'));
});
test('a bank is used before repeating across five-question sets; no duplicate in each set',()=>{
 fresh();run('data.noListening=true;data.sound=false');at(0);let cycle=[];
 for(let set=0;set<20;set++){
  run('englishSession.seen=[]');const within=new Set();
  for(let n=0;n<5;n++){
   const word=next().word[0];assert.ok(!within.has(word));within.add(word);cycle.push(word);
   if(cycle.length===bankSize){assert.equal(new Set(cycle).size,bankSize);cycle=[];}
  }
 }
});
test('broader and narrower meanings cannot be competing choices',()=>{
 const conflicts=[['bear','panda'],['melon','watermelon'],['car','bus'],['car','truck'],
  ...['duck','chicken','penguin','owl','eagle','parrot','swan'].map(w=>['bird',w]),
  ...['shark','whale','dolphin'].map(w=>['fish',w]),['monkey','gorilla'],['sheep','goat'],['potato','sweet potato'],
  ...['croissant','sandwich','hot dog','hamburger'].map(w=>['bread',w]),['sandwich','hamburger'],['sandwich','hot dog'],
  ['cake','pancakes'],['candy','chocolate'],['candy','lollipop'],['chocolate','lollipop'],['clock','watch'],['computer','keyboard']];
 for(const [a,b] of conflicts){
  const row=word=>banks.flat().find(w=>w[0]===word);
  assert.equal(run('englishPictureDistractor('+JSON.stringify(row(a))+','+JSON.stringify(row(b))+')'),false);
  assert.equal(run('englishPictureDistractor('+JSON.stringify(row(b))+','+JSON.stringify(row(a))+')'),false);
 }
 fresh();at(0);
 for(const stage of [0,2,4,6,8,10]){at(stage);for(let n=0;n<200;n++){
  run('englishSession.seen=[]');const e=next();
  for(const w of e.choices.filter(w=>w[0]!==e.word[0]))assert.equal(run('englishPictureDistractor('+JSON.stringify(e.word)+','+JSON.stringify(w)+')'),true);
 }}
});
test('every picture retains enough unambiguous alternatives for all introductory choice counts',()=>{
 for(const bank of banks)for(const word of bank){
  const others=bank.filter(other=>run('englishPictureDistractor('+JSON.stringify(word)+','+JSON.stringify(other)+')'));
  assert.ok(others.length>=2,word[0]);assert.ok(!others.includes(word));
 }
 for(const [a,b] of [['bee','snail'],['shirt','socks'],['milk','bread']]){
  const row=word=>banks.flat().find(w=>w[0]===word);
  assert.equal(run('englishPictureDistractor('+JSON.stringify(row(a))+','+JSON.stringify(row(b))+')'),true);
 }
});
test('new words replay in English without changing the question, difficulty, progress or rewards',()=>{
 fresh();run('data.noListening=false;data.sound=true');at(0);
 for(let bankIndex=0;bankIndex<3;bankIndex++)for(const row of banks[bankIndex].slice(24)){
  run('englishSession.word='+JSON.stringify(row));
  const before=run('JSON.stringify([data,englishSession,practiceItem])'),n=spoken.length;
  run('englishSay(englishSession.word[0]);englishSay(englishSession.word[0])');
  assert.equal(spoken.length,n+2);assert.deepEqual(spoken.slice(-2),[row[0],row[0]]);
  assert.equal(utterances.at(-1).lang,'en-US');assert.equal(utterances.at(-1).rate,.75);
  assert.equal(run('JSON.stringify([data,englishSession,practiceItem])'),before);
 }
 run('data.noListening=true');const n=spoken.length;run("englishSay('butterfly')");assert.equal(spoken.length,n);
});
test('every added word has a complete kana hint and correct-answer feedback',()=>{
 fresh();run('data.noListening=true;data.sound=false');
 for(const row of banks.flatMap(bank=>bank.slice(24))){
  c.hintFeedback=element();const previousQuery=document.querySelector;
  document.querySelector=s=>s==='#englishFeedback'?c.hintFeedback:previousQuery(s);
  try{
   run("view='quiz';englishSession={n:0,word:"+JSON.stringify(row)+",choices:["+JSON.stringify(row)+"],seen:[],help:false,done:false,clean:0};practiceItem=null;englishHint()");
   assert.equal(c.hintFeedback.textContent,'「'+row[2]+'」を さがしてね。');
   run("englishAnswer(0,document.createElement('button'))");
   assert.ok(c.hintFeedback.textContent.includes(row[0]+' ＝ '+row[2]));
  }finally{document.querySelector=previousQuery;}
 }
});
test('picture scheduling persists per child and bank without inventing answer evidence',()=>{
 fresh();at(0);run('englishNext()');
 assert.equal(run("person().englishWordPractice.banks['animals:reading'].turn"),1);
 assert.equal(run('data.profiles[1].englishWordPractice'),undefined);
 run('pickEnglishPicture({seen:[]},EN_WORDS[0]);pickEnglishPicture({seen:[]},EN_WORDS[1])');
 assert.equal(run("person().englishWordPractice.banks['animals:reading'].turn"),2);assert.equal(run("person().englishWordPractice.banks['food:reading'].turn"),1);
 assert.equal(run("Object.values(person().englishWordPractice.banks['animals:reading'].words).reduce((n,w)=>n+w.total,0)"),0);
 run('data.current=1');run('pickEnglishPicture({seen:[]},EN_WORDS[0])');assert.equal(run("person().englishWordPractice.banks['animals:reading'].turn"),1);
 run('data.current=0');assert.equal(run("person().englishWordPractice.banks['animals:reading'].turn"),2);
 run('data.profiles[0]=JSON.parse(JSON.stringify(data.profiles[0]))');assert.equal(run("person().englishWordPractice.banks['animals:reading'].turn"),2);
});
test('speech-off and speech-unavailable modes show readable questions with no speech',()=>{
 for(const unavailable of [false,true]){
  fresh();run('data.noListening=false;data.sound='+unavailable);if(unavailable)delete c.speechSynthesis;
  at(0);const before=spoken.length,e=next();assert.equal(e.readingAlternative,true);assert.ok(app.innerHTML.includes(e.word[0]));assert.equal(spoken.length,before);
  if(unavailable)c.speechSynthesis={cancel(){},getVoices:()=>[{lang:'ja-JP'},englishVoice],speak(u){spoken.push(u.text);utterances.push({text:u.text,lang:u.lang,rate:u.rate,voice:u.voice})}};
 }
});
test('first-attempt, hint and double-click scoring remain unchanged for new words',()=>{
 fresh();run('data.noListening=true;data.sound=false');at(0);
 do{run('englishSession.seen=[]');next()}while(original[0].includes(run('englishSession.word[0]')));
 run("practiceClock.start-=2000;englishAnswer(englishSession.choices.findIndex(w=>w[0]!==englishSession.word[0]),document.createElement('button'))");
 assert.equal(P.skill(run('person()'),def()).total,1);assert.equal(run('englishSession.help'),true);
 run("englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'));englishAnswer(englishSession.choices.findIndex(w=>w[0]===englishSession.word[0]),document.createElement('button'))");
 assert.equal(P.skill(run('person()'),def()).total,1);assert.equal(run('englishSession.clean'),0);assert.equal(P.skill(run('person()'),def()).stages[0].recent[0].variant,'reading');
});
test('youngest cap permits all 48 animals through real five-question sessions without promotion',()=>{
 fresh();run("data.noListening=true;data.sound=false;PracticePresets.apply(person(),'preschool-younger',Practice);PracticePresets.applyLimit(person(),'preschool-younger',Practice)");
 const exposed=new Set();
 for(let set=0;set<25;set++){
  run('home();startEnglish()');const within=new Set();
  for(let n=0;n<5;n++){
   const e=run('englishSession');assert.equal(run('practiceItem.index'),0);assert.equal(e.choices.length,2);assert.ok(!within.has(e.word[0]));within.add(e.word[0]);exposed.add(e.word[0]);correct();
  }
  assert.equal(run('view'),'result');
 }
 assert.equal(exposed.size,bankSize);assert.equal(P.skill(run('person()'),def()).level,0);assert.equal(P.absoluteLimit(run('person()'),def()),0);assert.equal(run('person().flowers'),25);assert.equal(run('game().coins'),82);
 const coins=run('game().coins');run('englishFinish()');assert.equal(run('game().coins'),coins);
});
test('explicit elementary lower bound and upper bound still select the correct picture bank',()=>{
 fresh();run("data.noListening=true;data.sound=false;PracticePresets.applyLimit(person(),'elementary-two',Practice);PracticeLowerLimits.apply(person(),'elementary-two','en')");
 const before=run('JSON.stringify([person().stats,person().flowers,person().tileCycle,person().practice.lowerPresets,person().practice.limits])');
 for(let n=0;n<50;n++){
  run("home();startEnglish()");const e=run('englishSession');assert.equal(run('practiceItem.skill'),'enWords');assert.ok(e.level>=8&&e.level<=11);assert.ok(banks[2].some(w=>w[0]===e.word[0]));
 }
 assert.equal(run('JSON.stringify([person().stats,person().flowers,person().tileCycle,person().practice.lowerPresets,person().practice.limits])'),before);
});
test('a live quiet-mode toggle keeps the same question count, bounds, records and rewards',()=>{
 fresh();run('data.noListening=false;data.sound=true;data.music=false');run("PracticePresets.applyLimit(person(),'preschool-younger',Practice);startEnglish()");
 const before=run('JSON.stringify([englishSession.n,person().english,person().practice.skills,person().practice.limits,person().flowers,game().coins])');
 run('setNoListening(true)');assert.equal(run('englishSession.readingAlternative'),true);assert.equal(run('practiceItem.index'),0);
 assert.equal(run('JSON.stringify([englishSession.n,person().english,person().practice.skills,person().practice.limits,person().flowers,game().coins])'),before);
 correct();assert.equal(run('englishSession.n'),1);
});
console.log(count+' introductory English breadth tests passed');
`)(require);
