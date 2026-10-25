(function(root){
'use strict';
const banks={};
const numeric=(text,value,hint,meta,unit='',visualHTML='')=>({type:'mathExtended',text,answer:String(value)+unit,choices:[value,...[1,-1,2,-2,3].map(n=>value+n).filter(n=>n>=0)].slice(0,4).map(n=>String(n)+unit),hint,meta,visualHTML});
function add(id,stage,q){(banks[id]??=[[],[],[]])[stage].push(q)}
function clock(h,m){const hand=(angle,len,color,width)=>`<line x1="80" y1="80" x2="${80+Math.sin(angle)*len}" y2="${80-Math.cos(angle)*len}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;return `<svg viewBox="0 0 160 160" width="160" height="160" style="max-width:100%;display:block;margin:auto" role="img" aria-label="${h}じ${m}ふんの とけい"><circle cx="80" cy="80" r="75" fill="#fff" stroke="#426657"/>${Array.from({length:12},(_,i)=>{let a=(i+1)*Math.PI/6;return `<text x="${80+Math.sin(a)*60}" y="${85-Math.cos(a)*60}" text-anchor="middle" font-size="14">${i+1}</text>`}).join('')}${hand((h%12+m/60)*Math.PI/6,35,'#315f4c',5)}${hand(m*Math.PI/30,50,'#a55723',3)}<circle cx="80" cy="80" r="3"/></svg>`}
function bars(a,b){return `<svg viewBox="0 0 300 90" width="300" height="90" style="max-width:100%;display:block;margin:auto" role="img" aria-label="あ は${a}めもり、い は${b}めもり。1めもりは1センチ"><text x="0" y="27">あ</text><text x="0" y="67">い</text>${[a,b].map((n,row)=>Array.from({length:n},(_,i)=>`<rect x="${30+i*24}" y="${10+row*40}" width="24" height="25" fill="${row?'#eac275':'#82b9a0'}" stroke="#345548"/>`).join('')).join('')}</svg>`}
for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)if(a+b>10)add('mentalBridge',0,numeric(`${a} ＋ ${b} は、10 ＋ □ と おなじ。□は？`,a+b-10,'まず 10の まとまりを つくろう。',{op:'bridge',a,b,base:10}));
for(let ten=1;ten<=8;ten++)for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)if(a+b>10){let base=(ten+1)*10;add('mentalBridge',1,numeric(`${ten*10+a} ＋ ${b} は、${base} ＋ □ と同じ。□は？`,a+b-10,'一の位を分けて、次の十のまとまりをつくろう。',{op:'bridge',a:ten*10+a,b,base}));}
for(let a=21;a<=49;a++)for(let b=11;b<=29;b++)if(b%10){const rounded=Math.ceil(b/10)*10;add('mentalBridge',2,numeric(`${a} ＋ ${b} は、${a} ＋ ${rounded} − □ と同じ。□は？`,rounded-b,'たす数をいくつ増やしたか考え、その分を引こう。',{op:'compensate',a,b,rounded}));}
const defs=[{id:'lifeShopping',title:'おかいものと おつり',stages:['1えんで おかいもの','10えんの おかいもの','2つ かって おつり']},{id:'lifeClock',title:'とけいと じかん',stages:['なんじかな','なんじ はんかな','何分あとかな']},{id:'lifeLength',title:'ながさを くらべよう',stages:['めもりで ながさ','ながさの ちがい','メートルと センチ']}];
for(let paid=2;paid<=10;paid++)for(let price=1;price<paid;price++)add('lifeShopping',0,numeric(`${paid}えん もっています。${price}えんの あめを かうと、おつりは？`,paid-price,'もっている おかねから、はらう おかねを ひこう。',{op:'change',paid,prices:[price]},'えん',`<div role="img" aria-label="1えんが${paid}こ" style="font-size:24px;overflow-wrap:anywhere">${'① '.repeat(paid)}</div>`));
for(let price=10;price<=90;price+=10)add('lifeShopping',1,numeric(`100円で ${price}円の パンを かいます。おつりは？`,100-price,'10円のまとまりで考えよう。',{op:'change',paid:100,prices:[price]},'円'));
for(let a=10;a<=80;a+=10)for(let b=10;b<=90-a;b+=10)add('lifeShopping',2,numeric(`100円で ${a}円の えんぴつと ${b}円の けしゴムを かいます。おつりは？`,100-a-b,'2つの値段をたしてから、100円から引こう。',{op:'change',paid:100,prices:[a,b]},'円'));
for(let h=1;h<=12;h++)for(let stage=0;stage<2;stage++){const m=stage*30,answer=`${h}じ${m?' はん':''}`;add('lifeClock',stage,{type:'mathExtended',text:'とけいは なんじ？',answer,choices:[answer,`${h%12+1}じ${m?' はん':''}`,`${h}じ${m?'':' はん'}`],hint:'みじかい はりは じ、ながい はりは ふんを あらわすよ。',meta:{op:'clock',h,m},visualHTML:clock(h,m)});}
for(let h=1;h<=12;h++)for(let m of [0,15,30,45])for(let elapsed of [5,10,15,30]){let total=(h*60+m+elapsed)%720;const format=t=>`${Math.floor((t%720)/60)||12}時${t%60}分`;add('lifeClock',2,{type:'mathExtended',text:`${h}時${m}分の ${elapsed}分あとは？`,answer:format(total),choices:[total,total+5,total+10].map(format),hint:'60分で1時間。12時の次は1時になるよ。',meta:{op:'elapsed',h,m,elapsed},visualHTML:clock(h,m)});}
for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)if(a!==b){add('lifeLength',0,{type:'mathExtended',text:'1めもりは 1センチ。ながいのは どっち？',answer:a>b?'あ':'い',choices:['あ','い'],hint:'ひだりの はしを そろえて、めもりを かぞえよう。',meta:{op:'compareLength',a,b},visualHTML:bars(a,b)});if(a>b)add('lifeLength',1,numeric(`あ は${a}cm、い は${b}cm。あ は い より何cm長い？`,a-b,'長いほうから短いほうを引こう。',{op:'lengthDifference',a,b},'cm',bars(a,b)));}
for(let m=1;m<=9;m++)for(let cm=5;cm<=95;cm+=5)add('lifeLength',2,numeric(`${m}m ${cm}cm は何cm？`,m*100+cm,'1mは100cm。mの部分をcmに直してから、たそう。',{op:'lengthUnits',m,cm},'cm'));
const japanese=[
[
['おなかが すいたので、パンを たべました。なぜ たべたの？','おなかが すいたから','ねむいから|さむいから'],
['てが よごれたので、てを あらいました。なぜ あらったの？','てが よごれたから','はなが さいたから|ほんを よんだから'],
['さむいので、うわぎを きました。なぜ きたの？','さむいから','あついから|のどが かわいたから'],
['のどが かわいたので、みずを のみました。なぜ のんだの？','のどが かわいたから','ねむいから|てが よごれたから'],
['まず くつを はき、それから そとへ でました。さきに したのは？','くつを はく','そとへ でる|ほんを よむ'],
['まず えを かき、それから いろを ぬりました。あとに したのは？','いろを ぬる','えを かく|てを あらう'],
['はこを あけてから、おもちゃを だしました。さきに したのは？','はこを あける','おもちゃを だす|はこを とじる'],
['くつを ぬいでから、へやに はいりました。あとに したのは？','へやに はいる','くつを ぬぐ|そとへ でる']
],
[
['はなに みずを あげようと しましたが、じょうろが からでした。みずを いれてから、はなに あげました。みずを いれたのは なぜ？','じょうろが からだったから','はなが からだったから|あめが ふったから'],
['あめが やんだので、かさを とじました。かさを とじたのは なぜ？','あめが やんだから','あめが ふりだしたから|かさを なくしたから'],
['ボールが とおくへ ころがったので、おいかけました。おいかけたのは なぜ？','ボールが とおくへ いったから','ボールを しまう はこが ないから|ボールが われたから'],
['ほんを よみたかったので、としょかんへ いきました。いったのは なぜ？','ほんを よみたかったから','くつを かいたかったから|パンを やきたかったから'],
['まず いちごを あらい、つぎに へたを とり、さいごに おさらに のせました。2ばんめに したのは？','へたを とる','いちごを あらう|おさらに のせる'],
['まず かみを おり、つぎに はさみで きり、さいごに ひらきました。さいごに したのは？','ひらく','かみを おる|はさみで きる'],
['まず たねを えらび、つぎに つちに うめ、さいごに みずを あげました。2ばんめは？','つちに うめる','たねを えらぶ|みずを あげる'],
['まず ほんを えらび、つぎに かりて、さいごに いえで よみました。かりる まえに したのは？','ほんを えらぶ','いえで よむ|ほんを かえす']
],
[
['あきは「なくした ぬいぐるみが みつかって、ほっとした」と いいました。あきの きもちは？','あんしんした','おこった|たいくつだった'],
['ゆいは「また あえて うれしい」と いいました。ゆいの きもちは？','うれしい','かなしい|こわい'],
['れんは「おもちゃが こわれて、かなしい」と いいました。れんの きもちは？','かなしい','うれしい|あんしんした'],
['そらは「おおきな おとが して、びっくりした」と いいました。そらの きもちは？','おどろいた','たいくつだった|ねむかった'],
['まいは「ひとりで くらい みちを あるくのは こわい」と いいました。まいの きもちは？','こわい','たのしい|うれしい'],
['こうは「まちじかんに なにも することが なくて、たいくつ」と いいました。こうの きもちは？','たいくつ','うれしい|おどろいた'],
['りなは「たのしみに していた おまつりが ちゅうしで、ざんねん」と いいました。りなの きもちは？','ざんねん','あんしんした|うれしい'],
['けいは「できなかった ことが できて、うれしい」と いいました。けいの きもちは？','うれしい','かなしい|こわい']
],
[
['朝は雨でした。昼には晴れましたが、運動場には水たまりがありました。先生は「すべると危ないので、中で遊ぼう」と言いました。中で遊ぶ理由は？','すべると危ないから','昼も雨がふっているから|遊ぶ時間がないから'],
['図書館の本を返す日でした。読み終わっていませんでしたが、約束の日なので返しました。返した理由は？','返す約束の日だから','読み終わったから|本がきらいだから'],
['先に手紙を書き、そのあと封筒に入れました。切手を貼ったのは封筒に入れたあとです。最初にしたことは？','手紙を書く','封筒に入れる|切手を貼る'],
['朝、犬にえさをあげました。散歩はそのあとです。帰ってから犬の足をふきました。散歩の直前にしたのは？','えさをあげる','足をふく|家に帰る'],
['試合には負けました。でも、あきは「最後まで力を出せて満足だ」と言いました。あきの気持ちは？','力を出しきれて満足','勝ってうれしい|力を出せず残念'],
['発表の前、ゆいは「間違えないか心配」と言いました。発表のあとには「無事に終わって安心した」と言いました。発表のあとの気持ちは？','安心','心配|怒り'],
['朝は遠足が楽しみでした。雨で中止と聞くと、れんは「残念だ」と言いました。中止と聞いたあとの気持ちは？','残念','楽しみ|安心'],
['そらは一人で箱を運ぼうとしましたが、重くて持てませんでした。友だちに頼んで、二人で運びました。頼んだ理由は？','一人では重くて持てないから','箱が空だったから|友だちが帰ったから']
]
].map(bank=>bank.map(row=>[...row,'おはなしの なかに ある ことばを てがかりに しよう。']));
const english=[
[
['おひるに あいました。ひるの あいさつを しよう。','Hello!','Good afternoon!','Good night!','Goodbye!'],
['かえります。わかれの あいさつを しよう。','Bye!','Goodbye!','Good morning!','An apple, please.'],
['ものを もらいました。おれいを いおう。','Here you are.','Thank you.','Good night!','I am five.'],
['あさ おきました。あさの あいさつを しよう。','Hello, sleepyhead!','Good morning!','Good night!','Goodbye!'],
['おやすみの じかんです。ねる まえの あいさつを しよう。','Time for bed.','Good night!','Good afternoon!','An apple, please.'],
['あした また あいます。わかれの あいさつを しよう。','Goodbye!','See you tomorrow!','Good morning!','It is red.']
],
[
['りんごを ひとつ ください と いおう。','What would you like?','An apple, please.','A pencil, please.','Good night!'],
['バナナを ひとつ ください と いおう。','What would you like?','A banana, please.','A book, please.','Goodbye!'],
['ミルクが のみたいです。','Milk or water?','Milk, please.','Water, please.','A pen, please.'],
['みずが のみたいです。','Milk or water?','Water, please.','Milk, please.','A book, please.'],
['パンが たべたいです。','Bread or rice?','Bread, please.','Rice, please.','A chair, please.'],
['ごはんが たべたいです。','Bread or rice?','Rice, please.','Bread, please.','A pen, please.']
],
[
['あいてに ペンを わたします。「どうぞ」と いおう。','A pen, please.','Here you are.','Good night!','I am five.'],
['クッキーを すすめられました。ほしいと つたえよう。','A cookie?','Yes, please.','No, thank you.','Goodbye!'],
['ミルクを すすめられました。いらないと つたえよう。','Some milk?','No, thank you.','Yes, please.','Good morning!'],
['ボールを かして と たのまれました。いいよ と こたえよう。','Can I borrow your ball?','Sure!','I am a ball.','It is Monday.'],
['ともだちが けしゴムを わたして くれました。おれいを いおう。','Here is your eraser.','Thank you.','Good night!','I am six.'],
['りんごを わたしたら おれいを いわれました。「どういたしまして」と こたえよう。','Thanks for the apple.','You are welcome.','I want a pencil.','Good night!']
]
].map((rows,s)=>rows.map((r,i)=>({id:`social-added-${s}-${i}`,prompt:r[0],context:r[0],target:r[1],audioText:r[1],answer:r[2],choices:r.slice(2),fallbackPrompt:`${r[0]}\n${r[1]}`,hint:'ばめんと、あいての ことばを たしかめよう。',mode:'dialog',requiresAudio:false,fallbackMode:'reading'})));
const key=q=>q.text+'|'+JSON.stringify(q.meta);
function pick(id,stage,seen=[],rng=Math.random){const bank=banks[id]?.[stage];if(!bank)throw new RangeError('Unknown question bank');let pool=bank.filter(q=>!seen.includes(key(q)));if(!pool.length){seen.length=0;pool=bank}const q=pool[Math.min(pool.length-1,Math.max(0,Math.floor(rng()*pool.length)))];seen.push(key(q));const choices=q.choices.slice();for(let i=choices.length-1;i>0;i--){let j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[choices[i],choices[j]]=[choices[j],choices[i]]}return {...q,choices,skill:id,stage};}
const api={banks,defs,japanese,english,pick};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GardenQuestions=api;
})(typeof globalThis!=='undefined'?globalThis:this);
