const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),content=require('./dist/reading-expansion.js');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
const baseline=[
 [24,16,'f3f638bafc4567e2d4c5c2dcab61342d79d5ef57d67abe281d7118aeb911d6a2'],
 [25,16,'00e91b024b3db569cf6361c30aeec708b52b120168d48b6bda85f7887d32c581'],
 [29,14,'d15516998bb4a1bbcca1ef0d4916fd0bd20f08f3bef8a31b03a807e21cf4cf04'],
 [30,14,'2fbfa5ce857e7fb9e086be50e8d88361b474b8e08967f3adb0d36aad10430811']
];
test('68 authored additions raise four existing banks to 32, preserving every old row',()=>{
 assert.equal(content.items.length,68);
 assert.deepEqual(content.items.reduce((a,x)=>(a[x.skill+':'+x.stage]=(a[x.skill+':'+x.stage]||0)+1,a),{}),{'reading:0':16,'reading:1':16,'reading:2':18,'readingKanji:0':18});
 assert.deepEqual(Array.from(P.defs.find(d=>d.id==='reading').courses),[24,25,29]);assert.deepEqual(Array.from(P.defs.find(d=>d.id==='readingKanji').courses),[30]);
 for(const [course,n,hash] of baseline){const b=run('JP_BANK['+course+'-JP_START]');assert.equal(b.length,32);assert.equal(crypto.createHash('sha256').update(JSON.stringify(b.slice(0,n))).digest('hex'),hash)}
});
test('all additions have unique IDs and passages with explicit evidence in the passage',()=>{
 const ids=new Set(),texts=new Set();for(const r of content.items){assert.ok(!ids.has(r.id));ids.add(r.id);const [passage,question,...extra]=r.text.split('\n');assert.equal(extra.length,0);assert.ok(question?.endsWith('？'));assert.ok(passage.includes(r.evidence),r.id);assert.ok(!texts.has(passage),r.id);texts.add(passage);assert.ok(passage.length<=100);assert.ok(r.hint);const choices=[r.answer,...r.wrong];assert.equal(choices.length,3);assert.equal(new Set(choices).size,3);assert.ok(choices.every(x=>x.trim().length));}
});
test('kana stages introduce no kanji; new mixed text uses only audited grade-1/2 characters',()=>{
 // Deliberately narrow authoring vocabulary, not a claim to cover all grade-1/2 kanji.
 const allowed=new Set(Array.from('色紙切糸川森木下大小土見入空本月形雨石上音水白名前書先生山赤黄二花中学校家牛食数出外犬道歩虫近思高'));
 for(const r of content.items){const chars=JSON.stringify(r).match(/[\u3400-\u9fff]/gu)||[];if(r.skill==='reading')assert.equal(chars.length,0,r.id);else for(const ch of chars)assert.ok(allowed.has(ch),r.id+':'+ch);}
});
test('new content follows existing grade eligibility and does not enable kanji implicitly',()=>{
 const map=run('PracticePresets.build(Practice)');assert.deepEqual(Array.from(map.reading,x=>x.rank),[3,3,3]);assert.equal(map.readingKanji[0].rank,4);
 const p={stats:{}};P.configure(p,44,false);assert.ok(!P.allowed(p,P.defs.find(d=>d.id==='readingKanji')));
});
test('real generators expose each of 32 questions once per set, with unique correct options',()=>{
 const old=Math.random;try{for(const rng of [()=>0,()=>.999999999]){Math.random=rng;for(const [course] of baseline){run('session={auto:false,seen:{}}');const seen=new Set();for(let k=0;k<32;k++){const q=run('makeQuestion('+course+')');assert.equal(q.i,course);assert.ok(!seen.has(q.text));seen.add(q.text);assert.equal(q.choices.filter(v=>v===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);}assert.equal(seen.size,32)}}}finally{Math.random=old}
});
test('content registration is idempotent, avoiding duplicate rows on repeated script execution',()=>{
 vm.runInContext(fs.readFileSync('dist/reading-expansion.js','utf8'),c);for(const [course] of baseline)assert.equal(run('JP_BANK['+course+'-JP_START].length'),32);
});
test('question generation leaves both children, mastery, bounds and rewards unchanged',()=>{
 const old=run('JSON.stringify(data)');for(const [course] of baseline){run('session={auto:false,seen:{}}');for(let k=0;k<64;k++)run('q=makeQuestion('+course+')')};assert.equal(run('JSON.stringify(data)'),old);
});
test('all new questions are complete in silent mode and cause no speech',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};run('data.sound=false;data.noListening=true;view="quiz"');for(const [course] of baseline){run('session={auto:false,seen:{},done:false}');for(let k=0;k<32;k++){run('q=makeQuestion('+course+');speakQuestion()');const q=run('q');assert.ok(q.text);assert.ok(q.answer);assert.ok(q.choices.includes(q.answer));}}assert.equal(spoken.length,0);
});
console.log(passed+' reading expansion tests passed');
`)(require);
