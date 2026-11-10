/* Original, append-only lessons. Loading this file never edits learner records. */
(function(root){
 'use strict';
 const defs=[
  {id:'dataTable',title:'ひょうを よもう',subject:'math',grades:[2,2],stages:['ひょうから みつける','ひょうの かずを くらべる'],prerequisite:'number',stageRequires:{1:['addition','subtraction']}},
  {id:'dataBars',title:'ぼうグラフを よもう',subject:'math',grades:[3,3],stages:['めもりと ぼうグラフ','ぼうグラフで くらべる'],prerequisite:'dataTable'},
  {id:'measureCapacity',title:'かさと たんい',subject:'math',grades:[2,2],stages:['かさの めもり','L・dL・mL'],prerequisite:'number'},
  {id:'measureMass',title:'おもさと たんい',subject:'math',grades:[3,3],stages:['はかりの めもり','g・kg'],prerequisite:'mathHundreds'},
  {id:'readingConditions',title:'じょうけんと おしらせ',subject:'jp',grades:[1,2,3],stages:['じょうけんを よもう','おしらせから さがそう','ふたつの じょうけん'],prerequisite:'sentence'}
 ];
 const banks=Object.fromEntries(defs.map(d=>[d.id,d.stages.map(()=>[])]));
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=(body,label)=>`<svg viewBox="0 0 320 225" class="lesson-svg" role="img" aria-label="${escape(label)}">${body}</svg>`;
 const txt=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${escape(s)}</text>`;
 function add(skill,stage,item){
  const rows=banks[skill][stage];
  rows.push({id:`garden-lessons-1-${skill}-${stage}-${rows.length+1}`,learningExpansion:true,type:skill==='readingConditions'?'jp':'mathExtended',skill,stage,...item});
 }
 function numeric(skill,stage,value,unit,item){
  const values=[value,value+1,Math.max(0,value-1)];
  add(skill,stage,{...item,answer:String(value)+unit,choices:values.map(n=>String(n)+unit)});
 }
 const sets=[
  {title:'にわの くだもの',labels:['いちご','みかん','りんご'],values:[2,4,3],unit:'こ'},
  {title:'みつけた むし',labels:['あり','ちょう','とんぼ'],values:[4,1,3],unit:'ひき'},
  {title:'さいた はな',labels:['あか','しろ','きいろ'],values:[1,5,2],unit:'ほん'},
  {title:'とれた やさい',labels:['なす','トマト','ピーマン'],values:[3,2,4],unit:'こ'}
 ];
 function table(s){return `<table class="lesson-table"><caption>${escape(s.title)}</caption><thead><tr><th scope="col">しゅるい</th><th scope="col">かず（${escape(s.unit)}）</th></tr></thead><tbody>${s.labels.map((label,i)=>`<tr data-evidence="row-${i}"><th scope="row">${escape(label)}</th><td>${s.values[i]}</td></tr>`).join('')}</tbody></table>`;}
 sets.forEach(s=>{
  s.labels.forEach((label,i)=>numeric('dataTable',0,s.values[i],s.unit,{text:`${label}は、いくつ？`,visualHTML:table(s),variant:'table-read',hint:`「${label}」の よこに ある かずを みよう。`,evidenceKeys:[`row-${i}`],meta:{kind:'table-read',...s,target:i}}));
  const max=s.values.indexOf(Math.max(...s.values));
  add('dataTable',1,{text:'いちばん おおいのは、どれ？',visualHTML:table(s),answer:s.labels[max],choices:s.labels.slice(),variant:'table-most',hint:'それぞれの かずを くらべよう。',evidenceKeys:s.labels.map((_,i)=>`row-${i}`),meta:{kind:'table-most',...s}});
  const a=s.values[0]>s.values[1]?0:1,b=1-a;
  numeric('dataTable',1,s.values[a]-s.values[b],s.unit,{text:`${s.labels[a]}は ${s.labels[b]}より、いくつ おおい？`,visualHTML:table(s),variant:'table-difference',hint:`${s.values[b]}から ${s.values[a]}まで、ふえた かずを かぞえよう。`,evidenceKeys:[`row-${a}`,`row-${b}`],meta:{kind:'table-difference',...s,a,b}});
  numeric('dataTable',1,s.values[0]+s.values[1],s.unit,{text:`${s.labels[0]}と ${s.labels[1]}は、あわせて いくつ？`,visualHTML:table(s),variant:'table-total',hint:'ふたつの かずを たそう。',evidenceKeys:['row-0','row-1'],meta:{kind:'table-total',...s,a:0,b:1}});
 });
 const graphs=[
  {title:'すきな くだもの',labels:['いちご','みかん','りんご'],values:[4,8,6],unit:'にん',tick:2},
  {title:'にわで みた とり',labels:['すずめ','はと','からす'],values:[6,2,4],unit:'わ',tick:1},
  {title:'さいた はな',labels:['あか','しろ','きいろ'],values:[10,20,15],unit:'ほん',tick:5},
  {title:'しゅうかくした かず',labels:['げつ','か','すい'],values:[3,5,1],unit:'こ',tick:1}
 ];
 function bars(s){
  const max=Math.max(...s.values)+s.tick,step=150/(max/s.tick);let body='';
  for(let n=0;n<=max/s.tick;n++){const y=185-n*step;body+=`<g data-evidence="axis"><line x1="42" y1="${y}" x2="304" y2="${y}" stroke="#cad9ce"/>${txt(34,y+5,n*s.tick,'text-anchor="end"')}</g>`;}
  body+=txt(12,20,`（${s.unit}）`);
  s.labels.forEach((label,i)=>{const h=s.values[i]/s.tick*step,x=65+i*84;body+=`<g data-evidence="bar-${i}"><rect x="${x}" y="${185-h}" width="42" height="${h}" fill="#43846a" stroke="#254e3e"/>${txt(x+21,210,label,'text-anchor="middle"')}</g>`;});
  // Text descriptions expose source data, just as a reader can inspect the bars.
  return `<div class="lesson-figure"><p class="lesson-caption">${escape(s.title)}</p>${svg(body,`${s.title}。たての 1めもりは ${s.tick}${s.unit}。${s.labels.map((x,i)=>x+' '+s.values[i]+s.unit).join('、')}`)}</div>`;
 }
 graphs.forEach(s=>{
  s.labels.forEach((label,i)=>numeric('dataBars',0,s.values[i],s.unit,{text:`${label}は、いくつ？`,visualHTML:bars(s),variant:'bar-read',hint:`たての 1めもりは ${s.tick}${s.unit}。「${label}」の ぼうの さきから、よこへ たどろう。`,evidenceKeys:['axis',`bar-${i}`],meta:{kind:'bar-read',...s,target:i}}));
  const most=s.values.indexOf(Math.max(...s.values)),least=s.values.indexOf(Math.min(...s.values));
  for(const [kind,index,word] of [['bar-most',most,'おおい'],['bar-least',least,'すくない']])add('dataBars',1,{text:`いちばん ${word}のは、どれ？`,visualHTML:bars(s),answer:s.labels[index],choices:s.labels.slice(),variant:kind,hint:`ぼうの たかさを くらべよう。たかい ぼうほど、かずが おおいよ。`,evidenceKeys:s.labels.map((_,i)=>`bar-${i}`),meta:{kind,...s}});
  const target=1;
  add('dataBars',1,{text:`${s.values[target]}${s.unit}なのは、どれ？`,visualHTML:bars(s),answer:s.labels[target],choices:s.labels.slice(),variant:'bar-reverse',hint:`たての ${s.values[target]}の めもりから よこへ たどって、ぼうを さがそう。`,evidenceKeys:['axis'],meta:{kind:'bar-reverse',...s,target}});
 });
 function cup(value,tick,unit){
  const max=tick*10,y=190-value/max*150;
  let body=`<path d="M85 25 V190 H230 V25" fill="#f3f8f5" stroke="#385b4a" stroke-width="3"/><rect x="87" y="${y}" width="141" height="${190-y}" fill="#a7dce7"/><line data-evidence="measure" x1="87" y1="${y}" x2="228" y2="${y}" stroke="#246b86" stroke-width="3"/>`;
  for(let i=0;i<=10;i++){const py=190-i*15;body+=`<g data-evidence="ticks"><line x1="85" y1="${py}" x2="${i%2?97:105}" y2="${py}" stroke="#294b3c"/>${i%2?'':txt(76,py+5,i*tick,'text-anchor="end"')}</g>`;}
  body+=txt(175,218,unit,'text-anchor="middle"');
  return svg(body,`かさの めもり。0から ${max}${unit}、1めもり ${tick}${unit}。みずの たかさを よみます。`);
 }
 function dial(value,tick){
  const max=tick*10,cx=160,cy=112,r=79;let body='<circle cx="160" cy="112" r="91" fill="#f5f9f6" stroke="#385b4a" stroke-width="3"/>';
  const point=(v,radius)=>{const a=(-210+v/max*240)*Math.PI/180;return [cx+Math.cos(a)*radius,cy+Math.sin(a)*radius];};
  for(let i=0;i<=10;i++){const a=point(i*tick,r-8),b=point(i*tick,r),l=point(i*tick,r-23);body+=`<g data-evidence="ticks"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#294b3c" stroke-width="2"/>${i%2?'':txt(l[0],l[1]+4,i*tick,'text-anchor="middle" font-size="13"')}</g>`;}
  const p=point(value,68);body+=`<line data-evidence="measure" x1="160" y1="112" x2="${p[0]}" y2="${p[1]}" stroke="#245b80" stroke-width="4"/><circle cx="160" cy="112" r="5" fill="#245b80"/>${txt(160,158,'g','text-anchor="middle"')}`;
  return svg(body,`はかり。0から ${max}g、1めもり ${tick}g。はりの さきを よみます。`);
 }
 for(const [tick,unit] of [[100,'mL'],[1,'dL']])for(const n of [1,3,4,5,7,9]){
  const value=tick*n;
  add('measureCapacity',0,{text:'みずは、どれだけ はいっている？',visualHTML:cup(value,tick,unit),answer:value+unit,choices:[value,value+tick,value-tick].map(v=>v+unit),variant:'capacity-scale',hint:`1めもりは ${tick}${unit}。0から みずの たかさまで、めもりを かぞえよう。`,evidenceKeys:['ticks','measure'],meta:{kind:'capacity-scale',value,tick,unit}});
 }
 const capacities=[
  ['1Lは、なんdL？','10dL',['1dL','100dL'],'1Lは 10dL。Lと dLの かんけいを おぼえよう。',1,'L','dL'],
  ['2Lは、なんdL？','20dL',['2dL','200dL'],'1Lが 10dL。2Lなら 10dLが ふたつ。',2,'L','dL'],
  ['3Lは、なんdL？','30dL',['3dL','300dL'],'1Lが 10dL。3Lなら 10dLが みっつ。',3,'L','dL'],
  ['10dLは、なんL？','1L',['10L','100L'],'10dLを ひとまとまりに すると 1Lだよ。',10,'dL','L'],
  ['20dLは、なんL？','2L',['20L','200L'],'10dLずつの まとまりを かぞえよう。',20,'dL','L'],
  ['1Lは、なんmL？','1000mL',['100mL','10mL'],'1Lは 1000mLだよ。',1,'L','mL'],
  ['1dLは、なんmL？','100mL',['10mL','1000mL'],'1dLは 100mLだよ。',1,'dL','mL'],
  ['2dLは、なんmL？','200mL',['20mL','2000mL'],'100mLが ふたつで 2dLだよ。',2,'dL','mL'],
  ['5dLは、なんmL？','500mL',['50mL','5000mL'],'100mLが いつつで 5dLだよ。',5,'dL','mL'],
  ['300mLは、なんdL？','3dL',['30dL','300dL'],'100mLずつの まとまりを かぞえよう。',300,'mL','dL'],
  ['500mLは、なんdL？','5dL',['50dL','500dL'],'100mLが いくつ あるか かんがえよう。',500,'mL','dL'],
  ['1000mLは、なんL？','1L',['10L','100L'],'1000mLを ひとまとまりに すると 1Lだよ。',1000,'mL','L']
 ];
 capacities.forEach(([text,answer,wrong,hint,value,from,to])=>add('measureCapacity',1,{text,answer,choices:[answer,...wrong],hint,variant:'capacity-unit',meta:{kind:'capacity-unit',value,from,to}}));
 for(const tick of [10,100])for(const n of [1,3,4,5,7,9]){
  const value=tick*n;
  add('measureMass',0,{text:'はかりの しめす おもさは？',visualHTML:dial(value,tick),answer:value+'g',choices:[value,value+tick,value-tick].map(v=>v+'g'),variant:'mass-scale',hint:`1めもりは ${tick}g。0から はりの さきまで、めもりを かぞえよう。`,evidenceKeys:['ticks','measure'],meta:{kind:'mass-scale',value,tick,unit:'g'}});
 }
 for(const n of [1,2,3,4]){
  add('measureMass',1,{text:`${n}kgは、なんg？`,answer:n*1000+'g',choices:[n*1000+'g',n*100+'g',n*10+'g'],hint:'1kgは 1000g。1000gの まとまりで かんがえよう。',variant:'mass-unit',meta:{kind:'mass-unit',value:n,from:'kg',to:'g'}});
  add('measureMass',1,{text:`${n*1000}gは、なんkg？`,answer:n+'kg',choices:[n+'kg',n*10+'kg',n*100+'kg'],hint:'1000gずつに わけると、いくつの まとまりに なるかな。',variant:'mass-unit',meta:{kind:'mass-unit',value:n*1000,from:'g',to:'kg'}});
 }
 for(const [item,answer,wrong,hint] of [
  ['りんご 1こ','200g',['200kg','2g'],'りんご 1こを もつ ところを おもいうかべよう。200kgは おとなよりも ずっと おもいよ。'],
  ['えんぴつ 1ほん','5g',['5kg','500g'],'えんぴつは、ゆびで かるく もてるね。'],
  ['こども ひとり','30kg',['30g','3000kg'],'ひとの おもさは kgで あらわすことが おおいよ。'],
  ['からの ランドセル 1こ','1kg',['1g','100kg'],'ランドセルは えんぴつより おもく、ひとより かるいね。']
 ])add('measureMass',1,{text:`${item}の おもさ。いちばん ありそうなのは？`,answer,choices:[answer,...wrong],hint,variant:'mass-estimate',meta:{kind:'mass-estimate',item}});
 // Every reading answer has an explicit source. These are original passages.
 const readings=[
  [
   ['はれなら にわ、あめなら へやで あそびます。\nきょうは あめです。','どこで あそぶ？','へや',['にわ','みち'],'あめなら へや','きょうは あめです。'],
   ['はれなら にわ、あめなら へやで あそびます。\nきょうは はれです。','どこで あそぶ？','にわ',['へや','えき'],'はれなら にわ','きょうは はれです。'],
   ['さむい ひは コートを きます。あつい ひは コートを きません。\nきょうは さむい ひです。','きょうは どうする？','コートを きる',['コートを きない','みずぎを きる'],'さむい ひは コートを きます。','きょうは さむい ひです。'],
   ['あかい はこには つみき、あおい はこには ほんを いれます。','ほんを いれるのは？','あおい はこ',['あかい はこ','しろい はこ'],'あおい はこには ほんを いれます。'],
   ['てを あらってから、おやつを たべます。\nまだ てを あらっていません。','おやつの まえに することは？','てを あらう',['おやつを たべる','ねる'],'てを あらってから、おやつを たべます。'],
   ['ベルが なったら、かたづけます。\nいま ベルが なりました。','いま することは？','かたづける',['あそびつづける','そとへ はしる'],'ベルが なったら、かたづけます。','いま ベルが なりました。'],
   ['みちを わたる ときは、しんごうが あおに なってから、まわりを みます。\nいまは あかです。','いま することは？','わたらずに まつ',['はしって わたる','めを とじて わたる'],'あおに なってから','いまは あかです。'],
   ['くつは げんかん、ぼうしは たなに おきます。','ぼうしを おくのは？','たな',['げんかん','にわ'],'ぼうしは たなに おきます。'],
   ['おなかが すいたら パンを、のどが かわいたら みずを もらいます。\nのどが かわきました。','なにを もらう？','みず',['パン','ほん'],'のどが かわいたら みず','のどが かわきました。'],
   ['あさは はなに みずを やります。よるは ほんを よみます。\nいまは あさです。','いま することは？','はなに みずを やる',['ほんを よむ','ほしを みる'],'あさは はなに みずを やります。','いまは あさです。'],
   ['かえす ほんは みぎの はこ、かりる ほんは ひだりの かごに おきます。','かえす ほんを おくのは？','みぎの はこ',['ひだりの かご','つくえの した'],'かえす ほんは みぎの はこ'],
   ['はなが さいたら しゃしんを とります。\nけさ、はなが さきました。','きょう することは？','しゃしんを とる',['はなを ぬく','はなを しまう'],'はなが さいたら しゃしんを とります。','はなが さきました。']
  ],
  [
   ['【えんそく】\nあつまる じこく：9じ\nあつまる ばしょ：こうてい\nもちもの：すいとう・ぼうし','なんじに あつまる？','9じ',['8じ','10じ'],'あつまる じこく：9じ'],
   ['【はなうえ】\nにちようびの 10じから\nばしょ：にわ\nもちもの：てぶくろ','なにを もっていく？','てぶくろ',['ふえ','まくら'],'もちもの：てぶくろ'],
   ['【ほんの かしだし】\nげつようび・すいようび：ひらきます\nかようび：おやすみ','おやすみは、いつ？','かようび',['げつようび','すいようび'],'かようび：おやすみ'],
   ['【おはなしの かい】\nうけつけ：1じ\nおはなし：1じ30ぷん\nおわり：2じ','おはなしが はじまるのは？','1じ30ぷん',['1じ','2じ'],'おはなし：1じ30ぷん'],
   ['【おとしもの】\nあおい かさを あずかっています。\nしょくいんしつに とりに きてください。','どこに とりにいく？','しょくいんしつ',['たいいくかん','こうてい'],'しょくいんしつに とりに きてください。'],
   ['【プール】\nもちもの：みずぎ・タオル\nおやつは もってきません。','もっていかない ものは？','おやつ',['みずぎ','タオル'],'おやつは もってきません。'],
   ['【えの てんじ】\nばしょ：としょしつ\nじかん：10じから 3じまで\nしゃしんは とれません。','えを みられる ばしょは？','としょしつ',['おんがくしつ','げんかん'],'ばしょ：としょしつ'],
   ['【かいものの メモ】\nパンは 2こ\nりんごは 3こ\nぎゅうにゅうは 1ほん','りんごは、いくつ かう？','3こ',['1こ','2こ'],'りんごは 3こ'],
   ['【たいそう】\nいつもは こうていです。\nきょうは あめなので、たいいくかんに かわります。','きょうの ばしょは？','たいいくかん',['こうてい','としょしつ'],'きょうは あめなので、たいいくかんに かわります。'],
   ['【はなへの みずやり】\nあさ：あきさん\nゆうがた：そらさん','ゆうがたの とうばんは？','そらさん',['あきさん','ふたりとも'],'ゆうがた：そらさん'],
   ['【おりがみの かい】\nもくようび：どうぶつを つくります\nきんようび：はなを つくります','はなを つくるのは？','きんようび',['もくようび','どようび'],'きんようび：はなを つくります'],
   ['【たねまき】\nもちものは スコップです。\nたねは かいじょうで くばります。','じぶんで もっていくのは？','スコップ',['たね','じょうろ'],'もちものは スコップです。']
  ],
  [
   ['あめの ひは へやで、はれの ひは にわで あそびます。\nへやでは、あさは おりがみ、ひるは ほんを よみます。\nきょうは あめで、いまは ひるです。','いま なにを する？','へやで ほんを よむ',['へやで おりがみ','にわで あそぶ'],'あめの ひは へや','ひるは ほんを よみます。','きょうは あめで、いまは ひるです。'],
   ['あかい はこには くだもの、あおい はこには やさいを いれます。\nあかい はこの うえは りんご、したは みかんです。','みかんを おくのは？','あかい はこの した',['あかい はこの うえ','あおい はこの した'],'あかい はこには くだもの','あかい はこの うえは りんご、したは みかんです。'],
   ['げつようびは ほん、かようびは ボールを かります。\nほんは としょしつ、ボールは たいいくかんで かります。','かようびに いくのは？','たいいくかん',['としょしつ','りかしつ'],'かようびは ボール','ボールは たいいくかん'],
   ['バスで いく ひは 8じ、あるいて いく ひは 9じに あつまります。\nあめなら バス、はれなら あるいて いきます。\nきょうは あめです。','なんじに あつまる？','8じ',['9じ','10じ'],'バスで いく ひは 8じ','あめなら バス','きょうは あめです。'],
   ['【おみせ】\nパン：100えん\nおにぎり：120えん\nクッキー：80えん\nあまい おかしは クッキーだけです。','100えん いかで、あまい おかしは？','クッキー',['パン','おにぎり'],'クッキー：80えん','あまい おかしは クッキーだけです。'],
   ['【どうぶつカード】\nうさぎ：しろ・ながい みみ\nねこ：しろ・みじかい みみ\nいぬ：ちゃいろ・ながい みみ','しろくて、みみが ながいのは？','うさぎ',['ねこ','いぬ'],'うさぎ：しろ・ながい みみ'],
   ['【はなの カード】\nあ：あかい・はなびら 5まい\nい：きいろい・はなびら 5まい\nう：あかい・はなびら 6まい','あかくて、はなびらが 5まいなのは？','あ',['い','う'],'あ：あかい・はなびら 5まい'],
   ['【ほんの カード】\nあ：どうぶつの ほん・20ページ\nい：どうぶつの ほん・40ページ\nう：のりものの ほん・20ページ','どうぶつの ほんで、30ページより すくないのは？','あ',['い','う'],'あ：どうぶつの ほん・20ページ'],
   ['たいそうは、はれなら こうてい、あめなら たいいくかんです。\nたいいくかんでは うわぐつを はきます。\nきょうは あめです。','どこで、なにを はく？','たいいくかんで うわぐつ',['こうていで うわぐつ','たいいくかんで ながぐつ'],'あめなら たいいくかん','たいいくかんでは うわぐつ','きょうは あめです。'],
   ['あさの とうばんは あきさん、ゆうがたは そらさんです。\nとうばんは、はれなら みずやり、あめなら どうぐの せいりを します。\nいまは あめの ゆうがたです。','だれが、なにを する？','そらさんが どうぐの せいり',['あきさんが どうぐの せいり','そらさんが みずやり'],'ゆうがたは そらさん','あめなら どうぐの せいり','いまは あめの ゆうがたです。'],
   ['あたらしい ほんは うえの たな、ふるい ほんは したの たなです。\nどうぶつの ほんは ひだり、のりものの ほんは みぎです。','あたらしい のりものの ほんは？','うえの たなの みぎ',['うえの たなの ひだり','したの たなの みぎ'],'あたらしい ほんは うえの たな','のりものの ほんは みぎ'],
   ['【こうさく】\nあさの かい：9じ・かみひこうき\nひるの かい：1じ・かざぐるま\nかざぐるまを つくりたい ひとは、ひるの かいに きてください。','かざぐるまを つくるには、なんじに いく？','1じ',['9じ','3じ'],'ひるの かい：1じ・かざぐるま','ひるの かいに きてください。']
  ]
 ];
 readings.forEach((rows,stage)=>rows.forEach(([passage,text,answer,wrong,...evidence])=>{
  const lines=passage.split('\n');
  add('readingConditions',stage,{text,answer,choices:[answer,...wrong],variant:['condition','notice','two-conditions'][stage],passage,evidence,
   visualHTML:`<div class="lesson-passage">${lines.map((line,i)=>`<p data-evidence="line-${i}">${escape(line)}</p>`).join('')}</div>`,
   evidenceKeys:lines.flatMap((line,i)=>evidence.some(e=>line.includes(e))?[`line-${i}`]:[]),
   hint:stage===2?'しるしの ついた ぶぶんを くらべて、ふたつの じょうけんに あうものを さがそう。':'しるしの ついた ぶぶんを、もういちど よもう。',
   meta:{kind:'reading',stage}
  });
 }));
 function pick(id,stage,history=[],seen=[],rng=Math.random){
  const bank=banks[id]?.[stage];if(!bank?.length)throw new RangeError('Unknown lesson stage');
  let pool=bank.filter(q=>!history.includes(q.id)&&!seen.includes(q.id));
  if(!pool.length)pool=bank.filter(q=>!seen.includes(q.id));
  if(!pool.length){seen.length=0;pool=bank;}
  const q=pool[Math.max(0,Math.min(pool.length-1,Math.floor(rng()*pool.length)))];seen.push(q.id);
  const choices=q.choices.slice();for(let i=choices.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(rng()*(i+1))));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return {...q,choices};
 }
 function remember(p,q){
  if(!q?.learningExpansion||q.rotationRecorded||!banks[q.skill]?.[q.stage]?.some(x=>x.id===q.id))return;
  if(!p.lessonHistory||typeof p.lessonHistory!=='object'||Array.isArray(p.lessonHistory))p.lessonHistory={};
  const key=q.skill+':'+q.stage,valid=new Set(banks[q.skill][q.stage].map(x=>x.id));
  let history=Array.isArray(p.lessonHistory[key])?[...new Set(p.lessonHistory[key].filter(x=>valid.has(x)))]:[];
  if(history.length>=valid.size)history=[];
  if(!history.includes(q.id))history.push(q.id);
  p.lessonHistory[key]=history;
  q.rotationRecorded=true;
 }
 const api={version:1,defs,banks,pick,remember,table,bars,cup,dial};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 if(root.LearningExpansion)return;root.LearningExpansion=api;
 for(const d of defs){
  const courses=d.stages.map((title,stage)=>foundationCourse(title,d.subject,()=>{
   const seen=session?(session.lessonSeen??={}):{},key=d.id+':'+stage;
   const history=person().lessonHistory?.[key];
   return pick(d.id,stage,Array.isArray(history)?history:[],seen[key]??=[]);
  }));
  foundationSkill(d.id,d.title,d.subject,courses,d.prerequisite,{defaultLimit:-1,defaultRange:-1,stageRequires:d.stageRequires||{}});
 }
})(typeof globalThis==='object'?globalThis:this);
