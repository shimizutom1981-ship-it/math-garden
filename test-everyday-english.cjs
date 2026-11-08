const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const E=require('./dist/everyday-english.js'),W=require('./dist/english-word-practice.js'),base=require('./test-everyday-english-baseline.json');
const banks=run('EN_WORDS.slice(0,3)'),bank=JSON.parse(JSON.stringify(banks[2]));
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
test('39 words append to things only, retaining all 144 original rows and every course',()=>{
 assert.equal(E.items.length,39);assert.deepEqual(Array.from(banks,b=>b.length),[48,48,87]);for(let i=0;i<3;i++)assert.equal(JSON.stringify(banks[i].slice(0,48)),JSON.stringify(base.banks[i]));assert.equal(JSON.stringify(P.defs.filter(d=>base.defs.some(old=>old.id===d.id)).map(d=>({id:d.id,courses:d.courses}))),JSON.stringify(base.defs));
 assert.equal(new Set(banks.flat().map(w=>w[0])).size,183);assert.deepEqual(E.items.reduce((o,x)=>(o[x.category]=(o[x.category]||0)+1,o),{}),{body:8,clothes:3,school:7,home:13,action:8});
});
test('safe pictures, kana hints, spelling, and unambiguous alternatives',()=>{
 const action=new Set(E.items.filter(x=>x.category==='action').map(x=>x.word));
 for(const x of E.items){assert.match(x.word,/^[a-z]+$/);assert.match(x.ja,/^[ぁ-ゖー ]+$/u);assert.ok(x.picture&&!/[<>]/.test(x.picture));const row=bank.find(w=>w[0]===x.word);assert.equal(row.length,3);assert.equal(row[1],x.picture);const alternatives=bank.filter(w=>run('englishPictureDistractor('+JSON.stringify(row)+','+JSON.stringify(w)+')'));assert.ok(alternatives.length>=2,x.word);assert.ok(alternatives.every(w=>action.has(w[0])===action.has(x.word)));}
 for(const g of E.conflicts)for(const a of g)for(const b of g){const left=bank.find(w=>w[0]===a),right=bank.find(w=>w[0]===b);assert.equal(run('englishPictureDistractor('+JSON.stringify(left)+','+JSON.stringify(right)+')'),false)}
});
test('loading new content does not rewrite profiles, settings or rewards',()=>{
 const before=run('JSON.stringify(data)');vm.runInContext(fs.readFileSync('dist/everyday-english.js','utf8'),c);assert.equal(run('JSON.stringify(data)'),before);assert.equal(run('EN_WORDS[2].length'),87);
});
test('existing per-word records survive expansion and new words gain opportunities',()=>{
 for(const mode of ['listening','reading']){
 const p={flowers:99,practice:{sentinel:1}},oldBank=base.banks[2],first=W.pick(p,2,mode,oldBank,[],()=>0);W.record(p,2,mode,oldBank,first.word[0],first.turn,1,true,false,2000);
 const before=JSON.stringify(p.englishWordPractice.banks['things:'+mode].words);W.bankState(p,2,mode,bank);assert.equal(JSON.stringify(p.englishWordPractice.banks['things:'+mode].words),before);assert.equal(p.flowers,99);assert.equal(p.practice.sentinel,1);
 const seen=new Set();for(let n=0;n<300;n++)seen.add(W.pick(p,2,mode,bank,[],()=>0).word[0]);for(const x of E.items)assert.ok(seen.has(x.word),x.word);assert.equal(W.bankState(p,2,mode,bank).words[first.word[0]].total,1);
 }
});
test('familiar-word suppression and error recovery still use the existing rule',()=>{
 const p={};for(let n=0;n<bank.length;n++)W.pick(p,2,'reading',bank,[],()=>0);const b=W.bankState(p,2,'reading',bank);
 const word=bank[0][0],r=b.words[word];Object.assign(r,{total:6,correct:6,wrong:0,streak:4,multipleSets:true,lastCleanTurn:1,lastCleanSet:1,lastShown:b.turn,lastAnswerTurn:0});
 assert.ok(W.record(p,2,'reading',bank,word,b.turn,2,true,false,2000));let s=W.bankState(p,2,'reading',bank);assert.equal(s.words[word].due,s.turn+bank.length*3);
 s.turn++;s.words[word].lastShown=s.turn;assert.ok(W.record(p,2,'reading',bank,word,s.turn,3,false,false,2000));s=W.bankState(p,2,'reading',bank);assert.equal(s.words[word].streak,0);assert.equal(s.words[word].due,s.turn+6);
});
console.log(passed+' everyday-English tests passed');
`)(require);

