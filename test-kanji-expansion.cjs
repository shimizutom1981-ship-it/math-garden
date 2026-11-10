const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const crypto=require('node:crypto'),content=require('./dist/kanji-expansion.js'),baseline=require('./test-kanji-expansion-baseline.json');
const grades=[
'一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六',
'引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読内南肉馬売買麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話',
'悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和'
];
// MEXT 2017 curriculum commentary, appendix grade allocation, printed pp.192–193:
// https://www.mext.go.jp/content/20220606-mxt_kyoiku02-100002607_002.pdf (PDF pp.195–196)
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name)};
test('48 additions, original rows and higher-grade banks retained exactly',()=>{
 assert.equal(content.items.length,48);
 for(const x of baseline){const b=run('JP_BANK['+x.course+'-JP_START]');assert.equal(b.length,x.n+(x.stage<3?16:0));assert.equal(crypto.createHash('sha256').update(JSON.stringify(b.slice(0,x.n))).digest('hex'),x.hash);assert.equal(P.defs.find(d=>d.id==='jp_gradeKanji').courses[x.stage],x.course);}
});
test('official grade allocation, one target kanji and no existing target duplication',()=>{
 assert.deepEqual(grades.map(g=>g.length),[80,160,200]);assert.equal(new Set(content.items.map(x=>x.kanji)).size,48);
 for(const x of content.items){assert.ok(grades[x.grade-1].includes(x.kanji),x.id);assert.deepEqual(x.sentence.match(/[\u3400-\u9fff]/gu),[x.kanji]);assert.equal(x.sentence.split('「'+x.target+'」').length,2);const b=run('JP_BANK['+baseline[x.grade-1].course+'-JP_START]');assert.ok(!b.slice(0,24).some(r=>r[0].includes(x.kanji)));}
});
test('unique question IDs, nonempty choices and explicit contextual target',()=>{
 assert.equal(new Set(content.items.map(x=>x.id)).size,48);
 for(const x of content.items){assert.equal(x.row.length,4);assert.ok(x.row.every(v=>v.trim()));assert.equal(new Set([x.answer,...x.wrong]).size,3);assert.ok([x.answer,...x.wrong].every(v=>/^[ぁ-ゖー]+$/u.test(v)));assert.ok(x.row[0].endsWith('「'+x.target+'」の よみかたは？'));}
});
test('all 40 items reachable without repeats and answer occurs exactly once',()=>{
 const old=Math.random;try{for(const rng of [()=>0,()=>.999999999]){Math.random=rng;for(const x of baseline.slice(0,3)){run('session={auto:false,seen:{}}');const seen=new Set();for(let n=0;n<40;n++){const q=run('makeQuestion('+x.course+')');assert.equal(q.choices.filter(v=>v===q.answer).length,1);const key=q.text+'|'+q.answer;assert.ok(!seen.has(key));seen.add(key)}}}}finally{Math.random=old}
});
test('idempotent load, grade ranks, and saved profiles remain unchanged',()=>{
 vm.runInContext(fs.readFileSync('dist/kanji-expansion.js','utf8'),c);const before=run('JSON.stringify(data)');const map=run('PracticePresets.build(Practice)');for(const x of baseline.slice(0,3)){assert.equal(run('JP_BANK['+x.course+'-JP_START].length'),40);assert.ok(map.jp_gradeKanji[x.stage].rank<=5);run('session={auto:false,seen:{}}');for(let n=0;n<80;n++)run('q=makeQuestion('+x.course+')')};assert.equal(run('JSON.stringify(data)'),before);assert.equal(P.defs.filter(d=>![...c.ShapeExpansion.defs,...c.LearningExpansion.defs].some(x=>x.id===d.id)).reduce((n,d)=>n+d.courses.length,0),435);
});
test('silent mode does not speak; listening never reveals target reading',()=>{
 const spoken=[];c.speechSynthesis={cancel(){},getVoices:()=>[],speak(u){spoken.push(u.text)}};c.SpeechSynthesisUtterance=function(text){this.text=text};
 for(const sound of [false,true]){run('data.sound='+sound+';data.noListening='+!sound+';view="quiz"');for(const x of baseline.slice(0,3)){run('session={auto:false,seen:{},done:false}');for(let n=0;n<40;n++){run('q=makeQuestion('+x.course+');speakQuestion()');assert.ok(run('q.text.length>0'));}}if(!sound)assert.equal(spoken.length,0);}
 assert.ok(spoken.length>0);assert.ok(spoken.every(t=>t==='画面の漢字の読み方を、選択肢からえらぼう。'),JSON.stringify(spoken.slice(0,4)));
});
console.log(passed+' kanji expansion tests passed');
`)(require);

