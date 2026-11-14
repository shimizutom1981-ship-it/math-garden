const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const S=require('./dist/shape-expansion.js'),base=require('./test-shapes-baseline.json'),ids=S.defs.map(x=>x.id),newSkill=d=>ids.includes(d.id)||[...c.LearningExpansion.defs,...run('GardenActivities.lessons'),...c.ThinkingContent.defs].some(x=>x.id===d.id);
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
test('append-only registration preserves all previous skills, topics, and grade mapping',()=>{
 assert.equal(JSON.stringify(P.defs.filter(d=>!newSkill(d))),JSON.stringify(base.defs));
 assert.equal(run('JSON.stringify(TOPICS.slice(0,'+base.topics.length+'))'),JSON.stringify(base.topics));
 const grades=run('PracticePresets.build(Practice)');for(const [id,rows] of Object.entries(base.grades))assert.equal(JSON.stringify(grades[id]),JSON.stringify(rows));
 assert.equal(P.defs.length,base.defs.length+3+c.LearningExpansion.defs.length+3+c.ThinkingContent.defs.length);assert.equal(run('TOPICS.length'),base.topics.length+3+2+c.LearningExpansion.defs.reduce((n,d)=>n+d.stages.length,0)+c.ThinkingContent.defs.filter(d=>d.subject!=="en").reduce((n,d)=>n+d.stages.length,0));
});
test('33 meaningful variants have unique IDs, unique answer choices and valid diagrams',()=>{
 assert.deepEqual(Object.values(S.banks).map(b=>b.length),[12,12,9]);const all=Object.values(S.banks).flat();assert.equal(new Set(all.map(q=>q.id)).size,33);
 for(const q of all){assert.equal(new Set(q.choices).size,3);assert.equal(q.choices.filter(x=>x===q.answer).length,1);assert.match(q.visualHTML,/<svg/);assert.ok(!/NaN|Infinity|<script/.test(q.visualHTML));assert.doesNotMatch(q.text+q.hint+q.choices.join(''),/[\u3400-\u9fff]/u)}
 for(const bank of Object.values(S.banks))assert.equal(new Set(bank.map(q=>q.text+'|'+q.answer+'|'+q.visualHTML)).size,bank.length);
});
test('family membership is unique despite rotations; edge and vertex answers follow geometry',()=>{
 for(const q of S.banks.shapeFamily){const correct=q.meta.options.filter(o=>o.kind===q.meta.target);assert.equal(correct.length,1);assert.equal(correct[0].label,q.answer);assert.equal(new Set(q.meta.options.map(o=>o.kind)).size,3)}
 for(const q of S.banks.shapeEdges){const vs=q.meta.vertices;assert.ok([3,4].includes(vs.length));assert.equal(q.answer,String(vs.length));assert.equal(new Set(vs.map(v=>v.join(','))).size,vs.length);let area=0;for(let i=0;i<vs.length;i++){const a=vs[i],b=vs[(i+1)%vs.length];assert.notDeepEqual(a,b);area+=a[0]*b[1]-b[0]*a[1]}assert.notEqual(area,0);assert.equal((q.visualHTML.match(/<circle /g)||[]).length,q.meta.part==='vertex'?vs.length:0)}
});
test('circle radii end on the circle and diameters pass through the center',()=>{
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
 for(const q of S.banks.circleParts){const m=q.meta;assert.equal(q.answer,{center:'ちゅうしん',radius:'はんけい',diameter:'ちょっけい'}[m.part]);near(Math.hypot(m.x-m.cx,m.y-m.cy),m.r);near(Math.hypot(m.ox-m.cx,m.oy-m.cy),m.r);near((m.x+m.ox)/2,m.cx);near((m.y+m.oy)/2,m.cy);if(m.part==='diameter')near(Math.hypot(m.x-m.ox,m.y-m.oy),m.r*2)}
});
test('new skills start disabled and explicit grade caps open only the intended grades',()=>{
 const grades=run('PracticePresets.build(Practice)');for(const [i,id] of ids.entries()){const d=P.defs.find(x=>x.id===id),p={};assert.equal(P.absoluteLimit(p,d),-1);assert.equal(P.allowed(p,d),false);assert.equal(grades[id][0].rank,i+3)}
 for(const [preset,rank] of [['preschool-older',2],['elementary-one',3],['elementary-two',4],['elementary-3',5]]){const p={};c.PracticePresets.applyLimit(p,preset,P);for(const id of ids){const d=P.defs.find(x=>x.id===id);assert.equal(P.absoluteLimit(p,d),grades[id][0].rank<=rank?0:-1)}}
});
test('both explicit start range and absolute cap are needed, while legacy defaults stay unchanged',()=>{
 for(const id of ids){const d=P.defs.find(x=>x.id===id),p={},other={};P.setLimit(p,id,0);assert.equal(P.limit(p,d),-1);P.setRange(p,id,0);assert.equal(P.limit(p,d),0);P.setRange(other,id,0);assert.equal(P.limit(other,d),-1);P.setLimit(other,id,0);assert.equal(P.limit(other,d),0)}
 for(const d of P.defs.filter(d=>!newSkill(d))){assert.equal(P.absoluteLimit({},d),d.courses.length-1);assert.equal(P.limit({},d),d.courses.length-1)}
 const p={};c.PracticePresets.applyLimit(p,'elementary-3',P);for(const id of ids)assert.equal(P.limit(p,P.defs.find(d=>d.id===id)),-1);c.PracticePresets.apply(p,'elementary-3',P);for(const id of ids)assert.equal(P.limit(p,P.defs.find(d=>d.id===id)),0);
});
test('every question is reachable without repetition at RNG extremes and after recycling',()=>{
 for(const id of ids)for(const rng of [()=>0,()=>.999999999]){const seen=[],picked=new Set();for(let n=0;n<S.banks[id].length;n++){const q=S.pick(id,seen,rng);assert.ok(!picked.has(q.id));picked.add(q.id);assert.equal(q.skill,id)}S.pick(id,seen,rng);assert.equal(seen.length,1)}
});
test('manual and guided routes retain actual skill, course and stage after explicit enable',()=>{
 run('for(const d of Practice.defs){Practice.setLimit(person(),d.id,d.courses.length-1);Practice.setRange(person(),d.id,d.courses.length-1);const s=Practice.skill(person(),d);s.level=d.courses.length-1;d.courses.forEach((_,i)=>s.stages[i]={mastered:true,attempts:20,firstCorrect:20,recent:[]})}Practice.state(person()).settings={kanji:true,carry:true};');
 for(const id of ids){const d=P.defs.find(x=>x.id===id);for(const auto of [false,true]){run('subject="math";session={auto:'+auto+',practiceFocus:'+JSON.stringify(id)+',seen:{}}');const picked=new Set();for(let n=0;n<S.banks[id].length;n++){const q=run('makeQuestion('+d.courses[0]+')');assert.equal(q.i,d.courses[0]);assert.equal(q.skill,id);assert.equal(q.stage,0);assert.ok(q.visualHTML);assert.ok(!picked.has(q.id));picked.add(q.id);if(auto){assert.equal(run('practiceItem.skill'),id);assert.equal(run('practiceItem.index'),0)}}}}
});
test('repeated registration and question generation preserve saved state and rewards',()=>{
 const before=run('JSON.stringify(data)'),defs=JSON.stringify(P.defs);vm.runInContext(fs.readFileSync('dist/shape-expansion.js','utf8'),c);assert.equal(JSON.stringify(P.defs),defs);
 for(const id of ids){const d=P.defs.find(x=>x.id===id);run('session={auto:false,seen:{}}');for(let n=0;n<30;n++)run('makeQuestion('+d.courses[0]+')')}
 assert.equal(run('JSON.stringify(data)'),before);
});
console.log(passed+' shape expansion tests passed');
`)(require);
