const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function node(){return {innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},appendChild(){},append(){},remove(){},setAttribute(){},addEventListener(){},focus(){},insertAdjacentHTML(){},querySelector:()=>node(),querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:100,height:100})}}
const body=node(),app=node(),document={body,head:node(),documentElement:node(),hidden:false,addEventListener(){},createElement:node,querySelector:s=>s==='#app'?app:node(),querySelectorAll:()=>[]};
const legacy={version:1,mentalCurriculumVersion:1,current:0,sound:false,music:false,profiles:[{name:'Synthetic adult',stats:{},flowers:10,game:{coins:100,growth:30,owned:['crown'],equipped:{hat:'crown'},days:{}}},{name:'Synthetic child',stats:{},flowers:0}]};
const storage=new Map([['kazunoniwa-v1',JSON.stringify(legacy)]]);
const c={console,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},Date,Math,performance:{now:()=>Date.now()},scrollTo(){},addEventListener(){},requestAnimationFrame(){},matchMedia:()=>({matches:true}),navigator:{},location:{},confirm:()=>true};c.window=c;vm.createContext(c);
const html=fs.readFileSync('dist/index.html','utf8');
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c);
const run=s=>vm.runInContext(s,c);
run("Practice.configure(person(),44,false);data.sound=false;data.music=false;");
for(const subject of ['math','jp','en']){
 run(subject==='en'?'startEnglish()':`start(recommendationFor('${subject}'),true)`);
 for(let n=0;n<5;n++){
  run('practiceClock.start-=2000');
  if(subject==='en'){run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()")}else{run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}
 }
 assert.equal(run('view'),'result');console.log('PASS full five-question '+subject+' flow');
}
assert.equal(run('person().flowers'),13);assert.equal(run('person().game.coins'),130);
assert.equal(run('person().game.growth'),30);assert.equal(run('person().game.equipped.hat'),'crown');assert.equal(run('person().game.owned.includes("crown")'),true);
run('finish()');assert.equal(run('person().game.coins'),130);console.log('PASS rewards exactly once and inventory retained');
run("start(3,false);practiceClock=null;answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()");assert.equal(run('session.n'),1);console.log('PASS manual selection gameplay');
run("start(recommendationFor('math'),true);practiceClock.start-=2000;answer(q.choices.findIndex(x=>x!==q.answer),document.createElement('button'))");
const attempts=run('Practice.state(person()).turns.math');run("answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('Practice.state(person()).turns.math'),attempts);console.log('PASS wrong then corrected counted once');
for(const d of run('Practice.defs')){for(const course of d.courses){for(let n=0;n<40;n++){
 if(d.subject==='en'){run(`englishSession={n:0,seen:[],practiceFocus:'${d.id}'};view='quiz';englishNext()`);assert.equal(run('englishSession.choices.some(x=>x[0]===englishSession.word[0])'),true)}
 else {run(`session={auto:false,seen:{}};q=makeQuestion(${course})`);assert.equal(run('new Set(q.choices).size===q.choices.length&&q.choices.includes(q.answer)'),true)}
}}}console.log('PASS all existing generator courses, unique choices and correct answer');
assert.ok(JSON.parse(storage.get('kazunoniwa-v1')).profiles[0].practice);console.log('PASS existing save key persisted');
// Exhaust every fraction numerator/denominator, through manual and adaptive rendering.
for(const auto of [false,true])for(let b=2;b<=6;b++)for(let a=1;a<b;a++){
 run("Object.assign(Practice.skill(person(),Practice.defs.find(d=>d.id==='fraction')),{support:0,retry:null,misses:0});");
 const originalRandom=Math.random;let draws=[(b-2+.1)/5,(a-1+.1)/(b-1)];
 try{
  Math.random=()=>draws.length?draws.shift():originalRandom();
  run(`session={i:12,auto:${auto},practiceFocus:'fraction',seen:{},n:0,correct:0,misses:0};subject='math';view='quiz';nextQuestion()`);
 }finally{Math.random=originalRandom}
 assert.equal(run('q.a'),a);assert.equal(run('q.b'),b);assert.equal(run('q.answer'),`${a}/${b}`);
 assert.match(app.innerHTML,/class="fraction-diagram"[^>]*width:100%/);
 assert.ok(app.innerHTML.includes(`aria-label="${b}等分したうち${a}つが色付き"`));
 assert.equal((app.innerHTML.match(/background:#eab95f/g)||[]).length,a);
 assert.equal((app.innerHTML.match(/background:#fff;/g)||[]).length,b-a);
 assert.equal(run('new Set(q.choices).size'),4);
 run("if(practiceClock)practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'))");assert.equal(run('session.done'),true);
}
console.log('PASS all 15 fraction diagrams and answers in manual + adaptive modes');
