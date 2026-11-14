/* Original practice material. Pure builders are also used by the content audit. */
(function(root){
'use strict';
const defs=[
 {id:'gardenPattern',title:'つづきの もよう',subject:'math',grades:[0,0,0],stages:['いろの くりかえし','かたちの くりかえし','3つの くりかえし'],prerequisite:'number'},
 {id:'gardenDetective',title:'にわっちの けいさんを たしかめよう',subject:'math',grades:[3,3],stages:['たしざんを たしかめる','ひきざんを たしかめる'],prerequisite:'mathCarry',stageRequires:{1:['mathBorrow']},carry:true},
 {id:'gardenRemainder',title:'あまりを どうする？',subject:'math',grades:[3,3],stages:['ぴったり わける','あまりの つかいみち'],prerequisite:'divide'},
 {id:'gardenEvidence',title:'こたえの てがかり',subject:'jp',grades:[3,3],stages:['2つの ぶんから','3つの ぶんから'],prerequisite:'reading'},
 {id:'gardenSchedule',title:'よていを たてよう',subject:'math',grades:[3,3],stages:['はじめる じこく','いどうの じかんも'],prerequisite:'lifeClock',requires:['lifeClock','mathBorrow'],carry:true},
 {id:'gardenEnglishPhrase',title:'いろと ものの えいご',subject:'en',grades:[3,3],stages:['いろを たしかめる','いろと ものを たしかめる'],prerequisite:'enDescribe'},
 {id:'gardenEnglishBuild',title:'えいぶんを つくろう',subject:'en',grades:[3,3],stages:['2つの カードで','3つの カードで'],prerequisite:'englishPictureSentence'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=(a,rng=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const base=(kind,id,extra)=>({activity:'thinking',thinkingKind:kind,id:'thinking-'+id,type:'mathExtended',objects:0,waitForNext:true,...extra});
const numerals=n=>Array.from({length:n+1},(_,i)=>i);
function match(count,depth){
 const max=depth<2?3:5;
 return base('match','match-'+depth+'-'+count,{text:'おてほんと おなじ かずを、おさらに のせよう。',hint:'おてほんの くだものと、ひとつずつ くらべよう。おさらの くだものは さわると もどせるよ。',
  answer:count,choices:numerals(max),matchSlots:Array(max).fill(false),meta:{count,depth,max},
  visualHTML:'<div class="th-label">おてほん</div><div class="th-plate '+(depth?'th-scatter':'')+'" role="img" aria-label="おてほんの いちご '+count+'こ">'+Array.from({length:count},(_,i)=>'<span style="--offset:'+([0,15,-8,12,-5][i])+'px">🍓</span>').join('')+'</div>',reviewText:'おてほんと おなじ '+count+'こに なったね。'});
}
function hidden(total,visible){
 return base('hidden','hidden-'+total+'-'+visible,{text:'かごの なかには、なんこ かくれている？',hint:'ぜんぶの かずから、みえている かずを とって かんがえよう。',
  answer:total-visible,choices:numerals(total),meta:{total,visible},
  visualHTML:'<p class="th-label">ぜんぶで '+total+'こ</p><div class="th-plate">'+'🍓'.repeat(visible)+'<span class="th-basket" role="img" aria-label="なかが みえない かご">🧺<b>？</b></span></div>',
  reviewText:total+'こから '+visible+'こを とると、'+(total-visible)+'こだね。'});
}
function assemble(icon,word,extraLetter){
 const tokens=Array.from(word);if(extraLetter)tokens.push(extraLetter);
 return base('assemble','assemble-'+word+'-'+(extraLetter||'none'),{type:'jp',text:'えの なまえを、じゅんに さわって つくろう。',hint:'えの なまえは「'+word+'」。はじめの おとから ならべよう。',
  answer:word,choices:[word,'__retry__'],tokens,selectedTokens:[],requiredLength:Array.from(word).length,meta:{word,extraLetter:extraLetter||null},
  visualHTML:'<div class="th-picture" role="img" aria-label="'+esc(word)+'の え">'+icon+'</div>',reviewText:word+'、できたね。'});
}
const colors=[['red','あか','#b93644'],['blue','あお','#296caa'],['yellow','きいろ','#ebbd39'],['green','みどり','#438954']];
const adjective=c=>c[1]+(c[0]==='green'?'の':'い');
function tile(kind,index){
 const c=colors[index%colors.length],shape=kind==='shape'?['まる','さんかく','しかく'][index%3]:adjective(c)+' はな';
 const body=kind==='shape'?['<circle cx="30" cy="30" r="21"/>','<path d="M30 7 L55 51 H5 Z"/>','<rect x="9" y="9" width="42" height="42"/>'][index%3]:Array.from({length:5},(_,i)=>'<ellipse cx="30" cy="17" rx="9" ry="13" transform="rotate('+(i*72)+' 30 30)"/>').join('')+'<circle cx="30" cy="30" r="7" fill="#fff5bb"/>';
 return '<svg class="th-tile" viewBox="0 0 60 60" role="img" aria-label="'+shape+'"><g fill="'+(kind==='shape'?'#39795e':c[2])+'" stroke="#244735" stroke-width="1.5">'+body+'</g></svg>';
}
const banks=Object.fromEntries(defs.map(d=>[d.id,d.stages.map(()=>[])]));
function add(id,stage,q){q.skill=id;q.stage=stage;banks[id][stage].push(q)}
for(let stage=0;stage<3;stage++)for(let pair=0;pair<3;pair++)for(let end=0;end<4;end++){
 const pattern=stage===2?[pair,pair,(pair+1)%3]:[pair,(pair+1)%3],sequence=Array.from({length:(stage===2?6:4)+end%2},(_,i)=>pattern[(i+Math.floor(end/2))%pattern.length]);
 const answer=pattern[(sequence.length+Math.floor(end/2))%pattern.length],kind=stage===1?'shape':'flower',choices=[...new Set(pattern)];
 add('gardenPattern',stage,base('pattern','pattern-'+stage+'-'+pair+'-'+end,{text:'つぎは どれ？ もようの つづきを つくろう。',hint:'さいしょから、くりかえしている ならびを たしかめよう。',answer,choices,meta:{pattern,sequence,kind},
  visualHTML:'<div class="th-pattern">'+sequence.map(n=>tile(kind,n)).join('')+'<span class="th-blank">？</span></div>',choicePictures:Object.fromEntries(choices.map(n=>[n,tile(kind,n)])),reviewText:'おなじ ならびが くりかえされているね。',reviewHTML:'<div class="th-pattern">'+[...sequence,answer].map(n=>tile(kind,n)).join('')+'</div>'}));
}
for(const [stage,op,facts] of [[0,'＋',[[23,18],[34,27],[46,15],[27,16],[35,28],[48,24]]],[1,'−',[[42,17],[53,28],[61,24],[74,36],[82,45],[93,57]]]]){
 for(const [a,b] of facts)for(const error of ['ok','tens','ones']){
  const correct=op==='＋'?a+b:a-b,shown=correct+(error==='tens'?-10:error==='ones'?1:0),answer=error==='ok'?'そのままで あっている':error==='tens'?'じゅうの くらいを なおす':'いちの くらいを なおす';
  add('gardenDetective',stage,base('detective','detective-'+stage+'-'+a+'-'+b+'-'+error,{text:'にわっちの こたえ。どこを たしかめる？',hint:op==='＋'?'いちの くらいを たして、10の まとまりを じゅうの くらいへ。':'いちの くらいが ひけないときは、じゅうの くらいから 10を かりよう。',
   answer,choices:['そのままで あっている','じゅうの くらいを なおす','いちの くらいを なおす'],corrections:[correct,correct-10,correct+1],meta:{a,b,op,correct,shown,error},
   visualHTML:'<div class="th-equation">🌱 '+a+' '+op+' '+b+' ＝ '+shown+'</div>',reviewText:a+' '+op+' '+b+' ＝ '+correct+'。'+(error==='ok'?'にわっちの こたえは あっていたね。':error==='tens'?'じゅうの くらいを たしかめよう。':'いちの くらいを たしかめよう。')}));
 }
}
for(let stage=0;stage<2;stage++)for(const [quotient,each,rest] of [[3,4,2],[4,3,1],[2,5,3],[5,4,1],[3,6,2],[4,5,4]])for(const kind of ['car','bag']){
 const total=quotient*each+(stage?rest:0),value=kind==='car'?Math.ceil(total/each):Math.floor(total/each),unit=kind==='car'?'だい':'ふくろ';
 const text=kind==='car'?total+'にんで、1だいに '+each+'にんまで のれる くるまに のります。みんなが のるには、なんだい いる？':total+'この あめを、1ふくろに '+each+'こずつ いれます。'+each+'こ そろった ふくろは、いくつ できる？';
 add('gardenRemainder',stage,base('remainder','remainder-'+stage+'-'+total+'-'+each+'-'+kind,{text,hint:kind==='car'?'あまった ひとも、くるまに のる ひつようが あるね。':'あまった あめだけで、ひとふくろぶん そろうかな。',answer:value+unit,choices:[value,value+1,value-1].map(n=>n+unit),meta:{total,each,kind,value},
  reviewText:total+' ÷ '+each+' ＝ '+Math.floor(total/each)+(total%each?' あまり '+total%each:'')+'。'+(kind==='car'?'みんなが のれるように ':'そろった ふくろは ')+value+unit+'。',
  reviewHTML:'<div class="th-groups">'+Array.from({length:Math.ceil(total/each)},(_,i)=>'<span>'+ (kind==='car'?'●':'🍬').repeat(Math.min(each,total-i*each))+'</span>').join('')+'</div>'}));
}
const readings=[
 [['あめが ふって います。','そらは あかい かさを さしました。','きのうは にわで あそびました。'],'そらの かさは なにいろ？','あか',['あお','きいろ'],1],
 [['にわの はちが かわいて いました。','ゆいは じょうろで みずを あげました。','そばでは ねこが ねています。'],'ゆいは なにで みずを あげた？','じょうろ',['コップ','バケツ'],1],
 [['れんは としょかんで どうぶつの ほんを かりました。','いえでは おやつを たべました。','つぎの ひは がっこうです。'],'どこで ほんを かりた？','としょかん',['がっこう','いえ'],0],
 [['あきは パンを 2こ かいました。','おみせは こうえんの となりです。','かえりに はなを みました。'],'パンは なんこ かった？','2こ',['1こ','3こ'],0],
 [['ゆいは くつを はいてから、そとに でました。','そとでは とりが ないて いました。','そらは くもって いました。'],'そとに でる まえに したのは？','くつを はく',['とりを みる','ほんを よむ'],0],
 [['あきは なくした ぼうしを さがして いました。','ぼうしが みつかり、あきは「ほっとした」と いいました。','あきは いえに かえりました。'],'ぼうしが みつかった あきの きもちは？','あんしんした',['おこった','たいくつだった'],1],
 [['そらは きのう りんごを たべました。','きょうは バナナを たべました。','あしたは みかんを たべる よていです。'],'きょう たべたのは？','バナナ',['りんご','みかん'],1],
 [['いもうとは へやで えを かいて います。','あねは にわで はなを みて います。','ちちは だいどころに います。'],'にわに いるのは？','あね',['いもうと','ちち'],1],
 [['うさぎは にんじんを たべました。','ねこは みずを のみました。','いぬは ボールで あそびました。'],'みずを のんだのは？','ねこ',['うさぎ','いぬ'],1],
 [['そらは えんぴつを わすれました。','ゆいが えんぴつを かして くれました。','そらは おれいを いいました。'],'えんぴつを かしたのは？','ゆい',['そら','せんせい'],1],
 [['かえりみちは あめでした。','かさが なかったので、みせで あまやどりを しました。','あめが やんでから かえりました。'],'あまやどりを したのは なぜ？','かさが なかったから',['おなかが すいたから','ほんを よみたいから'],1],
 [['あさは はれて いました。','ひるから あめが ふりました。','よるには あめが やみました。'],'あめが ふりはじめたのは？','ひる',['あさ','よる'],1]
];
for(let stage=0;stage<2;stage++)readings.forEach(([lines,text,answer,wrong,evidence],i)=>{
 const passage=lines.slice(0,stage?3:2);
 add('gardenEvidence',stage,base('evidence','evidence-'+stage+'-'+i,{type:'jp',text,hint:'きかれている ひと・もの・じかんが、どの ぶんに かいてあるか さがそう。',answer,choices:[answer,...wrong.slice(0,stage?2:1)],passage,evidence,
  visualHTML:'<div class="lesson-passage">'+passage.map(s=>'<p>'+esc(s)+'</p>').join('')+'</div>',reviewText:'てがかりは「'+passage[evidence]+'」だね。'}));
});
const time=n=>Math.floor(n/60)+'じ'+(n%60? n%60+'ふん':'');
for(let stage=0;stage<2;stage++)for(const end of [600,630,660,690])for(const duration of [15,30,45]){
 const travel=stage?15:0,start=end-duration-travel;
 add('gardenSchedule',stage,base('schedule','schedule-'+stage+'-'+end+'-'+duration,{text:time(end)+(travel?'に いえへ かえりつきます。':'に あそびおわります。')+'こうえんで '+duration+'ふん あそびます。'+(travel?'こうえんから いえまでは '+travel+'ふんです。':'')+'\nなんじから あそぶ？',
  answer:time(start),choices:[start,start+15,start-15].map(time),hint:(travel?'かえりつく':'あそびおわる')+' じこくから、'+(travel?'あるく じかんと ':'')+'あそぶ じかんを もどそう。',meta:{end,duration,travel,start},
  visualHTML:'<div class="th-timeline"><span>あそぶ<br>'+duration+'ふん</span>'+(travel?'<span>あるく<br>'+travel+'ふん</span>':'')+'<span>'+(travel?'かえる':'おわる')+'<br>'+time(end)+'</span></div>',reviewText:time(start)+'に はじめ、'+time(start+duration)+'に あそびおわる。'+(travel?travel+'ふん あるくと '+time(end)+'に かえりつくね。':'')}));
}
const objects=[['apple','りんご'],['ball','ボール'],['cup','コップ']];
function objectPicture(object,color){
 const shape=object==='apple'?'<path d="M30 17 C9 5 3 32 13 48 Q23 59 30 53 Q42 60 51 44 C61 18 44 8 30 17Z"/><path d="M30 17 L33 6" stroke="#65492d" stroke-width="4"/><path d="M34 12 Q50 2 51 11 Q45 18 34 12" fill="#4d8b4b"/>':object==='ball'?'<circle cx="30" cy="31" r="24"/><path d="M8 22 Q30 41 52 22 M30 7 Q15 31 30 55" fill="none" stroke="#fff" stroke-width="2"/>':'<path d="M10 12 H44 V44 Q27 56 10 44 Z"/><path d="M44 17 Q61 17 56 32 Q53 37 44 37" fill="none" stroke-width="5"/>';
 return '<svg class="th-object" viewBox="0 0 64 64" role="img" aria-label="'+adjective(color)+' '+objects.find(x=>x[0]===object)[1]+'"><g fill="'+color[2]+'" stroke="#365345" stroke-width="1.5">'+shape+'</g></svg>';
}
for(let stage=0;stage<2;stage++)for(const object of objects)for(let c=0;c<4;c++){
 const color=colors[c],other=colors[(c+1)%4],nextObject=objects[(objects.indexOf(object)+1)%3];
 const options=[[color,object],[other,object],...(stage?[[color,nextObject]]:[])];
 const answer='a '+color[0]+' '+object[0];
 add('gardenEnglishPhrase',stage,{id:'thinking-phrase-'+stage+'-'+object[0]+'-'+c,thinkingKind:'phrase',text:answer,meaning:adjective(color)+' '+object[1],answer,choices:options.map(([col,obj])=>['a '+col[0]+' '+obj[0],objectPicture(obj[0],col),adjective(col)+' '+obj[1]]),hint:'いろの ことばと、ものの ことばを ひとつずつ たしかめよう。'});
}
const places=[['on','うえ'],['under','した'],['next to','よこ']],animals=[['cat','ねこ','🐱'],['dog','いぬ','🐶'],['rabbit','うさぎ','🐰']];
function scene(animal,place){const [x,y]={'on':[52,40],'under':[52,85],'next to':[110,85]}[place[0]];return '<svg class="th-scene" viewBox="0 0 140 105" role="img" aria-label="'+animal[1]+'が つくえの '+place[1]+'に いる"><path d="M22 47 H82 M28 49 V96 M76 49 V96" fill="none" stroke="#795333" stroke-width="6"/><text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="28">'+animal[2]+'</text></svg>'}
for(let stage=0;stage<2;stage++)for(const animal of animals)for(const place of places){
 const tokens=stage?['The '+animal[0],'is',place[0]+' the table.']:['The '+animal[0],'is '+place[0]+' the table.'];
 add('gardenEnglishBuild',stage,{id:'thinking-en-build-'+stage+'-'+animal[0]+'-'+place[0],thinkingKind:'englishBuild',tokens,answer:tokens.join(' '),meaning:animal[1]+'が つくえの '+place[1]+'に いる',visualHTML:scene(animal,place),hint:'だれが → is → どこに、の じゅんに ならべよう。'});
}
function pick(id,stage,seen=[],rng=Math.random){const bank=banks[id][stage];let pool=bank.filter(q=>!seen.includes(q.id));if(!pool.length)pool=bank;const q=JSON.parse(JSON.stringify(pool[Math.floor(rng()*pool.length)]));seen.push(q.id);if(q.choices)q.choices=shuffle(q.choices,rng);return q}
const api={defs,banks,match,hidden,assemble,tile,objectPicture,pick,shuffle,esc,time};
if(typeof module==='object'&&module.exports)module.exports=api;else root.ThinkingContent=api;
})(typeof globalThis==='object'?globalThis:this);
