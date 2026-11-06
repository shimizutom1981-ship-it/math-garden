const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function node(){return {innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},appendChild(){},append(){},remove(){},setAttribute(){},addEventListener(){},focus(){},insertAdjacentHTML(){},querySelector:()=>node(),querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:100,height:100})}}
const body=node(),app=node(),document={body,head:node(),documentElement:node(),hidden:false,addEventListener(){},createElement:node,querySelector:s=>s==='#app'?app:node(),querySelectorAll:()=>[]};
const legacy={version:1,mentalCurriculumVersion:1,current:0,sound:false,music:false,profiles:[{name:'Synthetic adult',stats:{},flowers:10,game:{coins:100,growth:30,owned:['crown'],equipped:{hat:'crown'},days:{}}},{name:'Synthetic child',stats:{},flowers:0}]};
const storage=new Map([['kazunoniwa-v1',JSON.stringify(legacy)]]);
const c={console,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},Date,Math,performance:{now:()=>Date.now()},scrollTo(){},addEventListener(type,fn){if(type==='message')c.onMessage=fn},requestAnimationFrame(){},matchMedia:()=>({matches:true}),navigator:{},location:{origin:"https://example.test"},confirm:()=>true};c.window=c;vm.createContext(c);
const html=fs.readFileSync('dist/index.html','utf8');
for(const source of [html,fs.readFileSync('dist/game.js','utf8'),fs.readFileSync('dist/practice-ui.js','utf8')])assert.doesNotMatch(source,/onclick=["']continuePractice\(\)/);
for(const m of html.matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g)){
 const adding=m[1]?.includes('garden-questions-ui.js');
 const baseline=adding?vm.runInContext('JSON.stringify({data,defs:Practice.defs,topics:TOPICS})',c):null;
 vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c);
 if(adding){const before=JSON.parse(baseline),after=JSON.parse(vm.runInContext('JSON.stringify({data,defs:Practice.defs,topics:TOPICS})',c));assert.deepEqual(after.data,before.data);assert.deepEqual(after.defs.slice(0,before.defs.length),before.defs);assert.deepEqual(after.topics.slice(0,before.topics.length),before.topics);}
}
const run=s=>vm.runInContext(s,c);

run("data.sound=false;data.music=false");
function complete(kind){run(kind==='en'?'startEnglish()':`start(recommendationFor('${kind}'),true)`);for(let n=0;n<5;n++){if(kind==='en')run("englishAnswer(englishSession.choices.findIndex(x=>x[0]===englishSession.word[0]),document.createElement('button'));englishAdvance()");else run("answer(q.choices.indexOf(q.answer),document.createElement('button'));advance()")}assert.equal(run('view'),'result')}
complete('math');complete('math');assert.equal(run('learningCycle().done.length'),1);assert.equal(run('learningCycle().pending'),false);
complete('jp');complete('en');assert.equal(run('learningCycle().pending'),true);assert.equal(run('learningCycle().level'),1);
run('englishFinish()');assert.equal(run('learningCycle().done.length'),3);
run('startEnglish()');assert.equal(run('view'),'tileReward');
run('data.current=1;home()');assert.equal(run('learningCycle().pending'),false);
run('data.current=0;home()');assert.equal(run('learningCycle().pending'),true);
// Reload preserves the earned reward and keeps profiles separate.
const saved=JSON.parse(storage.get('kazunoniwa-v1'));assert.equal(saved.profiles[0].tileCycle.pending,true);assert.notEqual(saved.profiles[1].tileCycle?.pending,true);
let init;const frame={contentWindow:{postMessage(m){init=m}}};const prior=document.querySelector;document.querySelector=s=>s==='#tileRewardFrame'?frame:prior(s);
run('openTileReward()');c.onMessage({source:frame.contentWindow,origin:'https://example.test',data:{type:'komorebi:ready'}});assert.equal(init.level,1);
const completed={level:1,groups:6,done:6,stacks:Array.from({length:18},()=>[]),tray:[]};
function event(type,state,token=init.token){c.onMessage({source:frame.contentWindow,origin:'https://example.test',data:{type,token,state}})}
event('komorebi:complete');assert.equal(run('learningCycle().pending'),true);
event('komorebi:save',completed,'wrong-token');assert.equal(run('learningCycle().board'),null);
event('komorebi:save',completed);event('komorebi:complete');assert.equal(run('learningCycle().pending'),false);assert.equal(run('learningCycle().level'),2);assert.equal(run('practiceFlow().next'),'math');assert.equal(run('learningCycle().done.length'),0);
event('komorebi:complete');assert.equal(run('learningCycle().level'),2);
complete('math');complete('jp');complete('en');assert.equal(run('learningCycle().pending'),true);assert.equal(run('learningCycle().level'),2);
console.log('PASS real 15-question cycle, no duplicate rewards, profile isolation, persistence, valid completion, replay rejection, next cycle');
