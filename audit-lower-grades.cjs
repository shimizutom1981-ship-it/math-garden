/* Reproducible runtime audit. Choice order is never counted as a new question. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(){return {innerHTML:'',textContent:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},appendChild(){},append(){},remove(){},setAttribute(){},addEventListener(){},focus(){},insertAdjacentHTML(){},querySelector:()=>element(),querySelectorAll:()=>[],getBoundingClientRect:()=>({top:0,left:0,width:100,height:100})}}
const app=element(),document={body:element(),head:element(),documentElement:element(),hidden:false,addEventListener(){},createElement:element,querySelector:s=>s==='#app'?app:element(),querySelectorAll:()=>[]};
const legacy={version:1,mentalCurriculum:2,current:0,sound:false,music:false,profiles:[{name:'Synthetic',stats:{7:{ok:50,total:50,streak:50,mastered:true}},flowers:12,game:{coins:100,growth:30,owned:['crown'],equipped:{hat:'crown'},days:{}},practice:{version:1,seed:3,configured:true,skills:{addition:{level:2,total:100}}}},{name:'Other',stats:{},flowers:0}]};
const storage=new Map([['kazunoniwa-v1',JSON.stringify(legacy)]]);
const c={console,document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},Date,Math,performance:{now:()=>Date.now()},scrollTo(){},addEventListener(){},requestAnimationFrame(){},matchMedia:()=>({matches:true}),navigator:{},location:{},confirm:()=>true};let seed=20261107;c.Math=Object.create(Math);c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);c.window=c;vm.createContext(c);
for(const m of fs.readFileSync('dist/index.html','utf8').replace(process.argv.includes('--baseline')?/<script src="\.\/lower-grade-content(?:-ui)?\.js[^"]*"><\/script>/g:/$^/g,'').matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c,{filename:m[1]||'index.html'});
const run=s=>vm.runInContext(s,c),P=c.Practice;


const rows=JSON.parse(run(`JSON.stringify(Practice.defs.flatMap(d=>PracticePresets.build(Practice)[d.id].filter(r=>r.rank>=0&&r.rank<=5).map(r=>({id:d.id,subject:d.subject,title:curriculumTitles[d.id]||practiceTestNames[d.id],...r}))))`));
const baseline=process.argv.includes('--baseline');
// Exact parameter spaces read from the current generators, not estimates from RNG.
const counts={number:[3,5,5],addition:[3,10,36,44],subtraction:[14,42],mental:[9999,108,384,1026,672],multiply:[baseline?6:11,18,72],divide:[72],fraction:[15],mathDecompose:[4,9],mathCarry:[9,44,2156,137984],mathBorrow:[44,792,50688],mathProduct:[64,304,1064],mathQuotient:[64,288],mathRational:[44],mathDecimal:[1764,3040],lifeShopping:[45,baseline?9:45,36],lifeClock:[12,12,192],lifeLength:[72,36,171],compare:[45],mathHundreds:[387,35361]};
for(const row of rows){
 seed=20261107+row.course*7919;
 if(row.subject==='en'){
  row.registered=run(`EN_WORDS[${Math.floor(row.course/4)}].length`);
  row.bankIndex=Math.floor(row.course/4);row.words=JSON.parse(run(`JSON.stringify(EN_WORDS[${Math.floor(row.course/4)}].map(x=>x[0]))`));
  row.unique=new Set(row.words).size;row.method='static';
 }else{
  const b=JSON.parse(run(`JSON.stringify(JP_BANK[${row.course}-JP_START]||null)`));
  if(row.subject==='jp'&&b){row.registered=b.length;row.unique=new Set(b.map(r=>r[0]+'|'+r[1])).size;row.method='static'}
  else{
   row.registered=null;const s=new Set(),answers=new Set();run(`session={auto:false,seen:{}}`);
   for(let i=0;i<2000;i++){const q=JSON.parse(run(`JSON.stringify(makeQuestion(${row.course}))`)); s.add(JSON.stringify([q.text,q.answer,q.visual,q.objects,q.a,q.b,q.meta]));answers.add(q.answer)}
   row.unique=s.size;row.answers=answers.size;row.method='sample2000';row.exact=counts[row.id]?.[row.index]??(row.id==='letters'&&row.index===0?(baseline?6:18):null);if(row.exact!==null)assert.ok(row.unique<=row.exact);if(row.subject==='math')assert.ok(Number.isInteger(row.exact));
  }
 }
}
fs.writeFileSync(process.argv.includes('--baseline')?'lower-grade-audit-before.json':'lower-grade-audit-after.json',JSON.stringify(rows,null,2));
console.log(rows.map(r=>[r.subject,r.id,r.index+1,r.rank,r.course,r.exact??r.unique,r.method,r.title].join('\t')).join('\n'));
