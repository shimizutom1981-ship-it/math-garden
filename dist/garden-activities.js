/* Activities share the ordinary quiz, first-attempt scoring, and five-item cycle. */
const GardenActivities = (() => {
  const lessons = [
    {id:'storyEquation', title:'おはなしに あう しき', subject:'math', prerequisite:'multiply', grades:[3]},
    {id:'paperPuzzle', title:'かみを きって くみあわせよう', subject:'math', prerequisite:'number', grades:[3]},
    {id:'englishPictureSentence', title:'えいぶんに あう え', subject:'en', prerequisite:'enWords', grades:[3]}
  ];
  const fruits = [['🍎','りんご'],['🍐','なし'],['🍊','みかん']];
  const chainPairs = [
    ['🐻','くま','🫘','まめ'],['🐢','かめ','👓','めがね'],['🦑','いか','☂️','かさ'],
    ['🐮','うし','🦌','しか'],['🐯','とら','🦦','らっこ'],['🐿️','りす','🍉','すいか'],
    ['🐙','たこ','🐨','こあら'],['🐦','とり','🍎','りんご'],
    ['🪁','たこ','🧊','こおり'],['👞','くつ','🌙','つき'],['🐊','わに','🐔','にわとり'],
    ['🍉','すいか','🐢','かめ'],['🪑','いす','🍣','すし'],['⌚','とけい','🐕','いぬ']
  ];
  const choicesInOrder = n => Array.from({length:n+1}, (_,i) => i);
  function shuffle(list) {
    const items = [...list];
    for (let i=items.length-1;i>0;i--) {
      const j=rand(0,i);
      [items[i],items[j]]=[items[j],items[i]];
    }
    return items;
  }
  function picking(stage) {
    const max = stage===0 ? 3 : 5;
    const [icon,name] = lowerGradePick('basket-fruit',fruits);
    const target = lowerGradePick('basket-count-'+max, choicesInOrder(max).slice(1));
    return {activity:'basket', text:`にわっちに ${name}を ${target}こ あげて。`,
      hint:'いれたい くだものを さわろう。かごの くだものを さわると もどせるよ。',
      icon, name, slots:Array(max).fill(false), answer:target, choices:choicesInOrder(max)};
  }
  function sharing(stage) {
    const total = lowerGradePick('give-count-'+stage,stage===0?[2,3]:[3,4,5]);
    return {activity:'give', text:'うさぎに にんじんを ひとつずつ あげて。',
      hint:'にんじんを もっていない うさぎを さわろう。', slots:Array(total).fill(false),
      answer:total,choices:choicesInOrder(total)};
  }
  function remaining() {
    const [total,given]=lowerGradePick('missing-carrots',[[3,2],[3,1],[4,1],[4,2],[4,3],[5,2],[5,3],[5,4]]);
    return {activity:'missing',text:'みんなに ひとつずつ。にんじんは あと なんぼん いる？',
      hint:'まだ にんじんを もっていない うさぎを みつけよう。',
      choices:shuffle([1,2,3]),answer:total-given,
      visualHTML:'<div class="ga-rabbits">'+Array.from({length:total},(_,i)=>rabbit(i<given)).join('')+'</div>'};
  }
  function rabbit(fed) {
    return `<span class="ga-rabbit" role="img" aria-label="うさぎ、にんじん${fed?'あり':'なし'}">🐰<small>${fed?'🥕':'　'}</small></span>`;
  }
  function chain(stage) {
    const [icon,word,nextIcon,correct]=lowerGradePick('word-chain',chainPairs);
    const other=lowerGradePick('word-chain-other-'+word,chainPairs.filter(p=>p[3][0]!==word.at(-1) && p[3]!==word));
    const options=shuffle([[nextIcon,correct],[other[2],other[3]]]);
    const marked=stage===1 ? word.slice(0,-1)+'<mark>'+word.at(-1)+'</mark>' : word;
    const hear = data.sound && !data.noListening && 'speechSynthesis' in window;
    return {activity:'chain',type:'jp',text:'しりとり。つぎに つながるのは どっち？',
      hint:'はじめの ことばの さいごの おとを、つぎの ことばの あたまに つなげよう。',
      visualHTML:`<div class="ga-chain">${icon} ${marked} → □</div>`,
      choices:options.map(x=>x[1]),answer:correct,chainWord:word,
      choicePictures:Object.fromEntries(options.map(([icon,label])=>[label,`<span class="ga-word-icon">${icon}</span>${label}`])),
      audioOptions:hear ? options.map(([,label],i)=>`<button type="button" class="sub" onclick="GardenActivities.sayOption(${i})">🔊 ${label}</button>`).join('') : '',
      reviewText:`${icon} ${word} → ${nextIcon} ${correct}`};
  }
  function early(course) {
    const n=session?.n;
    if(n!==2 && (n!==4 || Practice.gentle(person()))) return null;
    const count=foundationById('number').courses.indexOf(course);
    let item;
    if(count===0 || count===1){
      const set=Practice.state(person()).sessions.math||0;
      item=(set+(n===4?1:0))%2===0?picking(count):sharing(count);
    } else if(course===foundationById('subtraction').courses[0]) {
      item=remaining();
    } else {
      const stage=foundationById('letters').courses.indexOf(course);
      if(stage<1)return null;
      item=chain(stage);
    }
    return {...item,i:course,type:item.type||'mental',variant:item.activity,objects:0};
  }
  function responseMarkup(item) {
    if(item.slots){
      return '<div id="ga-work">'+workMarkup(item)+'</div><button class="primary ga-confirm" onclick="GardenActivities.submit(this)">どうぞ</button>';
    }
    return '<div class="choices">'+item.choices.map((value,i)=>
      `<button class="choice ${item.type==='jp'?'jp-choice':''}" onclick="answer(${i},this)">${item.choicePictures?.[value]??value}</button>`).join('')+'</div>'+
      (item.audioOptions?'<div class="ga-audio">'+item.audioOptions+'</div>':'');
  }
  function workMarkup(item) {
    const button=(i,inner,label)=>`<button class="ga-token" id="ga-token-${i}" aria-label="${label}" onclick="GardenActivities.toggle(${i})">${inner}</button>`;
    if(item.activity==='give')return '<div class="ga-tray"><span class="ga-tray-label">にんじん</span><span class="ga-supply">'+item.slots.map(fed=>fed?'':'🥕').join('')+'</span></div><div class="ga-rabbits">'+
      item.slots.map((fed,i)=>button(i,rabbit(fed),`${i+1}ひきめ、にんじんを ${fed?'もどす':'あげる'}`)).join('')+'</div>';
    return ['🌳 き','🧺 かご'].map((label,tray)=>'<div class="ga-tray"><span class="ga-tray-label">'+label+'</span>'+
      item.slots.map((selected,i)=>selected===Boolean(tray)?button(i,item.icon,item.name+'を '+(tray?'もどす':'かごに いれる')):'').join('')+'</div>').join('');
  }
  function toggle(i) {
    if(view!=='quiz'||!session||session.done||!q?.slots||typeof q.slots[i]!=='boolean')return;
    q.slots[i]=!q.slots[i];
    document.querySelector('#ga-work').innerHTML=workMarkup(q);
    document.querySelector('.ga-confirm').disabled=false;
    document.querySelector('#ga-token-'+i)?.focus({preventScroll:true});
  }
  function submit(button) {
    if(view!=='quiz'||!session||session.done||!q?.slots||button.disabled)return;
    answer(q.choices.indexOf(q.slots.filter(Boolean).length),button);
    if(session.done){
      button.disabled=true;
      document.querySelectorAll('.ga-token').forEach(el=>el.disabled=true);
    }
  }
  function showReview(item) {
    if(!item.reviewText)return;
    const review=document.querySelector('#ga-review');
    review.innerHTML=(item.reviewHTML||'')+'<p>'+esc(item.reviewText)+'</p>';
    review.hidden=false;
  }
  function sayOption(i) {
    if(view==='quiz'&&session&&!session.done&&q?.activity==='chain'&&q.choices[i])speak(q.choices[i]);
  }
  const stories=[];
  function addStory(id,text,a,op,b,resultText,groups,hint,picture,change=0){
    const expression=symbol=>a+' '+symbol+' '+b;
    const wrong=op==='÷'?['−','×']:op==='×'?['＋','−']:op==='＋'?['−','×']:['＋','×'];
    const diagram=groups.map(n=>'<span class="ga-group">'+Array.from({length:n},()=>picture).join('')+'</span>').join('');
    const added=change?'<span class="ga-change">'+picture.repeat(change)+'</span>':'';
    stories.push({id,activity:'story',type:'mathExtended',text:text+'\nあう しきは どれ？',
      choices:[expression(op),...wrong.map(expression)],answer:expression(op),hint,
      reviewHTML:'<div class="ga-groups" aria-hidden="true">'+diagram+added+'</div>',reviewText:resultText,waitForNext:true});
  }
  for(const [total,each] of [[24,6],[12,3],[15,5],[18,3],[20,5],[16,4]]){
    const count=total/each;
    addStory('boxes-'+total+'-'+each,`${total}この いちごを、1はこに ${each}こずつ いれます。はこは いくつ いる？`,
      total,'÷',each,`${each}こずつ かこむと ${count}はこ。しきの こたえは「はこの かず」だよ。`,
      Array(count).fill(each),'ひとはこに はいる かずが きまっているよ。','🍓');
    addStory('share-'+total+'-'+each,`${total}この いちごを、${each}にんで おなじ かずずつ わけます。ひとり なんこ？`,
      total,'÷',each,`${each}にんで わけると、ひとり ${count}こ。しきの こたえは「ひとりぶん」だよ。`,
      Array(each).fill(count),'みんなに おなじ かずずつ わけるよ。','🍓');
    addStory('product-'+total+'-'+each,`1はこに みかんが ${each}こ。おなじ はこが ${count}こ あります。ぜんぶで なんこ？`,
      each,'×',count,`${each}こずつ ${count}はこで、ぜんぶで ${total}こ。`,
      Array(count).fill(each),'ひとはこぶんが、いくつぶん あるかな。','🍊');
  }
  for(const [a,b] of [[5,2],[6,3],[8,4],[9,3],[7,2],[8,3]]){
    addStory('add-'+a+'-'+b,`にわに はなが ${a}ほん。さらに ${b}ほん さきました。ぜんぶで なんぼん？`,
      a,'＋',b,`もとの ${a}ほんと あたらしい ${b}ほんで、${a+b}ほん。`,[a,b],'はなは ふえたかな、へったかな。','🌷');
    addStory('sub-'+a+'-'+b,`にわに はなが ${a}ほん。${b}ほん つみました。のこりは なんぼん？`,
      a,'−',b,`${b}ほん つんだので、のこりは ${a-b}ほん。`,[a-b],'つんだ はなは、のこりに はいるかな。','🌷',b);
  }

  // Both halves use the very same coordinates before and after the cut.
  const cuts=[
    {id:'diagonal',outline:'しかく',pieces:'さんかく 2まい',polys:['30,16 90,16 30,76','90,16 90,76 30,76'],seam:'90,16 30,76',shift:[6,6]},
    {id:'other-diagonal',outline:'しかく',pieces:'さんかく 2まい',polys:['30,16 90,76 30,76','30,16 90,16 90,76'],seam:'30,16 90,76',shift:[6,-6]},
    {id:'square-across',outline:'しかく',pieces:'ながしかく 2まい',polys:['30,16 90,16 90,46 30,46','30,46 90,46 90,76 30,76'],seam:'30,46 90,46',shift:[0,7]},
    {id:'rectangle',outline:'ながしかく',pieces:'ましかく 2まい',polys:['16,25 60,25 60,69 16,69','60,25 104,25 104,69 60,69'],seam:'60,25 60,69',shift:[7,0]},
    {id:'triangle',outline:'さんかく',pieces:'さんかく 2まい',polys:['60,12 60,76 14,76','60,12 106,76 60,76'],seam:'60,12 60,76',shift:[7,0]},
    {id:'corner',outline:'しかく',pieces:'さんかくと ごかくけい',polys:['30,16 90,16 90,46 60,76 30,76','90,46 90,76 60,76'],seam:'90,46 60,76',shift:[6,6]}
  ];
  function paper(cut,mode){
    const split=mode==='split'||mode==='join',showSeam=mode==='cut'||mode==='join'||mode==='split';
    const animated=mode==='split'||mode==='close';
    const [dx,dy]=cut.shift;
    const shapes=cut.polys.map((points,i)=>{
      const sign=i?1:-1,x=dx*sign,y=dy*sign;
      return `<g class="${animated?(mode==='split'?'ga-open':'ga-close'):''}" style="--dx:${x}px;--dy:${y}px" transform="translate(${split?x:0} ${split?y:0})"><polygon points="${points}" fill="#f0ca74" stroke="#694e21" stroke-width="1.8"/>${showSeam?`<polyline points="${cut.seam}" stroke="#fff5da" stroke-width="3.4"/><polyline points="${cut.seam}" fill="none" stroke="#80541b" stroke-width="2" stroke-dasharray="4 3"/>`:''}</g>`;
    }).join('');
    return `<svg class="ga-paper" viewBox="0 0 120 92" role="img" aria-label="${mode==='join'?cut.pieces+'、てんせんを むかいあわせた かみ':cut.outline+'の かみ、きりせんの むきに ちゅうもく'}">${shapes}</svg>`;
  }
  const outlinePoints={'ましかく':'36,15 84,15 84,63 36,63','ながしかく':'16,20 104,20 104,60 16,60','さんかく':'60,10 103,65 17,65'};
  const piecePoints={'さんかく':'0,2 40,2 0,42','ながしかく':'0,12 40,12 40,32 0,32','ましかく':'4,6 38,6 38,40 4,40','ごかくけい':'0,2 40,2 40,22 20,42 0,42'};
  const pairs={'さんかく 2まい':['さんかく','さんかく'],'ながしかく 2まい':['ながしかく','ながしかく'],'ましかく 2まい':['ましかく','ましかく'],'さんかくと ごかくけい':['さんかく','ごかくけい']};
  function cutAnswer(cut){
    const halves=cut.polys.map(poly=>poly.split(' ').map(pair=>pair.split(',').map(Number)));
    const boxes=halves.map(pts=>{
      const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
      return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
    });
    const scale=47/Math.max(...boxes.flatMap(b=>[b.w,b.h]));
    const shapes=halves.map((pts,i)=>{
      const b=boxes[i];
      const points=pts.map(([x,y])=>[(i?90:30)+(x-b.x-b.w/2)*scale,40+(y-b.y-b.h/2)*scale].join(',')).join(' ');
      return `<polygon points="${points}" fill="#f0ca74" stroke="#694e21" stroke-width="2"/>`;
    });
    return `<svg class="ga-option" viewBox="0 0 120 80" role="img" aria-label="${cut.pieces}">${shapes.join('')}</svg>`;
  }
  function paperOption(label){
    const polygon=(points,offset)=>`<polygon points="${points}" transform="translate(${offset})" fill="#f0ca74" stroke="#694e21" stroke-width="2"/>`;
    const two=pairs[label];
    const shapes=two?two.map((shape,i)=>polygon(piecePoints[shape],i?'67 18':'10 18')).join(''):polygon(outlinePoints[label],'0');
    return `<svg class="ga-option" viewBox="0 0 120 80" role="img" aria-label="${label}">${shapes}</svg>`;
  }
  const puzzles=cuts.flatMap(cut=>[false,true].map(join=>{
    const result=cut.outline==='しかく'?'ましかく':cut.outline;
    const answer=join?result:cut.pieces;
    const options=join?Object.keys(outlinePoints):[answer,...Object.keys(pairs).filter(p=>p!==answer).slice(0,2)];
    return {id:'paper-'+cut.id+'-'+(join?'join':'cut'),activity:'paper',type:'mathExtended',text:join?'むきは そのまま。てんせん どうしを あわせると、どの かたち？':'てんせんで きると、どの 2まいに なる？',
      visualHTML:paper(cut,join?'join':'cut'), choices:options,answer,choicePictures:Object.fromEntries(options.map(x=>[x,x===answer&&!join?cutAnswer(cut):paperOption(x)])),
      hint:join?'てんせんを くっつけた あとの、そとの せんを たどろう。':'てんせんの りょうがわを、ゆびで なぞってみよう。',
      reviewText:join?`ぴったり あわせると ${result}。`:`${cut.pieces}に わかれたね。`,
      reviewHTML:paper(cut,join?'close':'split'),waitForNext:true};
  }));

  const animals=[['cat','ねこ','🐱'],['dog','いぬ','🐶'],['rabbit','うさぎ','🐰']];
  const furniture=[['chair','いす'],['table','つくえ']];
  const places=[['on','うえ'],['under','した'],['next to','よこ']];
  function scene(animal,furn,place) {
    const [x,y]={'on':[54,44],'under':[54,83],'next to':[105,83]}[place[0]];
    const back=furn[0]==='chair'?'<path d="M28 13 V47" stroke="#704d33" stroke-width="6"/><path d="M29 16 H44 V31 H29" fill="#bc926d"/>':'';
    return `<svg class="ga-scene" viewBox="0 0 132 102" role="img" aria-label="${animal[1]}が ${furn[1]}の ${place[1]}"><path d="M29 49 H80 M32 51 V92 M77 51 V92" stroke="#704d33" stroke-width="6" fill="none"/>${back}<text x="${x}" y="${y}" font-size="26" text-anchor="middle">${animal[2]}</text></svg>`;
  }
  const sentences=animals.flatMap(animal=>furniture.flatMap(furn=>places.map(place=>({
    id:[animal[0],furn[0],place[0]].join('-'), animal,furn,place,
    text:`The ${animal[0]} is ${place[0]} the ${furn[0]}.`,
    meaning:`${animal[1]}が ${furn[1]}の ${place[1]}に いる`
  }))));
  function buildEnglish(e) {
    let pool=sentences.filter(s=>!e.seen.includes(s.id));
    if(!pool.length)pool=sentences;
    const s=pool[rand(0,pool.length-1)];e.seen.push(s.id);
    const foil=shuffle(places.filter(p=>p!==s.place))[0];
    const option=p=>[`The ${s.animal[0]} is ${p[0]} the ${s.furn[0]}.`,scene(s.animal,s.furn,p),`${s.animal[1]}が ${s.furn[1]}の ${p[1]}に いる`];
    e.word=option(s.place);e.choices=shuffle([e.word,option(foil)]);
    e.curriculumKind='えいぶんと ばしょ';e.answerAudio=s.text;
    e.extensionQuestion={id:'picture-sentence-'+s.id};
    e.readingAlternative=data.noListening||!data.sound||!('speechSynthesis'in window);
    renderCurriculumEnglish(e,'えいぶんに あう えは どっち？','<span lang="en">'+s.text+'</span>','えいぶんと ばしょ',s.text);
    return true;
  }
  function schoolQuestion(id) {
    const bank=id==='storyEquation'?stories:puzzles;
    const seen=session?(session.activityExamples??=[]):[];
    let pool=bank.filter(item=>!seen.includes(item.id));
    if(id==='storyEquation') {
      // Two different division stories can share an equation; give them separate sets.
      const fresh=pool.filter(item=>!seen.some(key=>bank.find(x=>x.id===key)?.answer===item.answer));
      if(fresh.length)pool=fresh;
    }
    if(!pool.length)pool=bank;
    const item=pool[rand(0,pool.length-1)];seen.push(item.id);
    return {...item,choices:shuffle(item.choices),variant:item.id.split('-')[0],objects:0};
  }
  return {lessons,early,responseMarkup,toggle,submit,sayOption,showReview,schoolQuestion,buildEnglish};
})();

for(const lesson of GardenActivities.lessons){
  let course;
  if(lesson.subject==='en'){
    course=EN_WORDS.length*4;
    EN_WORDS.push([]);
    curriculumCourseMeta['en:'+course]={title:lesson.title,stage:0,subject:'en'};
  }else{
    course=foundationCourse(lesson.title,lesson.subject,()=>GardenActivities.schoolQuestion(lesson.id));
  }
  foundationSkill(lesson.id,lesson.title,lesson.subject,[course],lesson.prerequisite);
}
const priorActivityEnglish=buildCurriculumEnglish;
buildCurriculumEnglish=function(e,item){
  if(item.skill==='englishPictureSentence')return GardenActivities.buildEnglish(e);
  return priorActivityEnglish(e,item);
};
