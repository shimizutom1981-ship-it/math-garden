const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),content=require('./dist/language-expansion.js'),baseline=require('./test-language-expansion-baseline.json');
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
test('new language items extend nine existing banks and retain every original row',()=>{
 assert.equal(baseline.length,9);assert.equal(content.items.length,116);
 for(const x of baseline){const d=P.defs.find(d=>d.id===x.skill);assert.equal(d.courses[x.stage],x.course);const b=run('JP_BANK['+x.course+'-JP_START]');assert.equal(b.length,32);assert.equal(crypto.createHash('sha256').update(JSON.stringify(b.slice(0,x.n))).digest('hex'),x.hash)}
});
test('all new IDs, prompts and options are unique and nonempty in their banks',()=>{
 assert.equal(new Set(content.items.map(x=>x.id)).size,content.items.length);
 for(const x of baseline){const bank=run('JP_BANK['+x.course+'-JP_START]');assert.equal(new Set(bank.map(r=>r[0]+'|'+r[1])).size,bank.length)}
 for(const x of content.items){assert.equal(x.row.length,4);assert.ok(x.row.every(v=>typeof v==='string'&&v.trim()));const choices=[x.row[1],...x.row[2].split('|')];assert.ok(choices.length>=3&&choices.length<=4);assert.equal(new Set(choices).size,choices.length);}
});
test('all added text is kana-only and retains kana answer formats',()=>{
 for(const x of content.items){assert.doesNotMatch(x.row.join(''),/[\u3400-\u9fff]/u,x.id);if(x.skill==='letters'&&x.stage===2){assert.equal(Array.from(x.row[1]).length,1);assert.equal((x.row[0].match(/□/g)||[]).length,1)}if(x.skill==='katakana'){assert.match(x.row[0],/^[ぁ-ゖー]+$/u);assert.match(x.row[1],/^[ァ-ヶー]+$/u)}if(x.skill==='sentence'&&x.stage===0)assert.equal((x.row[0].match(/□/g)||[]).length,1)}
});
test('all 32 items per bank are reachable without repeat in a set at both RNG boundaries',()=>{
 const old=Math.random;try{for(const rng of [()=>0,()=>.999999999]){Math.random=rng;for(const x of baseline){run('session={auto:false,seen:{}}');const seen=new Set();for(let n=0;n<32;n++){const q=run('makeQuestion('+x.course+')');assert.equal(q.i,x.course);assert.equal(q.choices.filter(v=>v===q.answer).length,1);assert.equal(new Set(q.choices).size,q.choices.length);const key=q.text+'|'+q.answer+'|'+q.visual;assert.ok(!seen.has(key),x.skill+':'+x.stage);seen.add(key)}assert.equal(seen.size,32)}}}finally{Math.random=old}
});
test('registration is idempotent and preserves the separately expanded picture/position content',()=>{
 vm.runInContext(fs.readFileSync('dist/language-expansion.js','utf8'),c);for(const x of baseline)assert.equal(run('JP_BANK['+x.course+'-JP_START].length'),32);
 assert.equal(run('LowerGradeContent.pictures.length'),32);const pos=P.defs.find(d=>d.id==='sentence').courses[1];assert.equal(run('JP_BANK['+pos+'-JP_START].length'),36);
});
test('stage eligibility remains below grade-three cap with no curriculum changes',()=>{
 const map=run('PracticePresets.build(Practice)');for(const x of baseline)assert.ok(map[x.skill][x.stage].rank<=5);
 assert.equal(P.defs.filter(d=>!c.ShapeExpansion.defs.some(x=>x.id===d.id)).reduce((n,d)=>n+d.courses.length,0),435);
});
test('generation preserves both child profiles, limits, rewards and English word histories',()=>{
 const before=run('JSON.stringify(data)');for(const x of baseline){run('session={auto:false,seen:{}}');for(let n=0;n<64;n++)run('q=makeQuestion('+x.course+')')};assert.equal(run('JSON.stringify(data)'),before);
});
test('every new prompt is readable silently and speech is suppressed in no-listening mode',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};run('data.sound=false;data.noListening=true;view="quiz"');for(const x of baseline){run('session={auto:false,seen:{},done:false}');for(let n=0;n<32;n++){run('q=makeQuestion('+x.course+');speakQuestion()');assert.ok(run('q.text.length>0'));assert.ok(run('q.choices.includes(q.answer)'))}}assert.equal(spoken.length,0);
});
console.log(passed+' language expansion tests passed');
`)(require);

