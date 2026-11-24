/* One hands-on item in an eligible five-question set. The host course owns
 * selection, first-attempt scoring, retries, rewards and automatic advance. */
const GardenWorkshop = (() => {
  'use strict';
  const shuffle = ThinkingContent.shuffle;
  const soundPairs = [
    [['🦏','さい'],['🐟','さかな']], [['🐮','うし'],['🐰','うさぎ']],
    [['🐢','かめ'],['🐌','かたつむり']], [['🐻','くま'],['🚗','くるま']],
    [['🍑','もも'],['🍁','もみじ']], [['🪑','いす'],['🐬','いるか']],
    [['🪁','たこ'],['🥚','たまご']], [['🐜','あり'],['🦆','あひる']]
  ];
  const appleColors = [['red','あかい','🍎'],['green','みどりの','🍏']];
  const appleRequests = appleColors.map(([color,ja],i) => ({
    id:'errand-'+color+'-apple', text:'a '+color+' apple', meaning:ja+' りんご',
    choices:[appleColors[i],appleColors[1-i]].map(([word,label,icon]) => [word,icon,label+' りんご'])
  }));

  function errand(e,target,title){
    const request=target.charAt(0).toUpperCase()+target.slice(1)+', please!';
    e.curriculumKind='にわっちの おつかい';
    e.answerAudio=target;
    renderCurriculumEnglish(e,title,'<span lang="en">'+esc(request)+'</span>',e.curriculumKind,request);
    document.querySelector('.board')?.classList.add('lesson-board','gw-errand-board');
    document.querySelector('.english-context')?.insertAdjacentHTML('beforebegin',
      '<div class="gw-errand">'+gardenPortrait()+'<span class="gw-delivery" aria-hidden="true"></span></div>');
    document.querySelectorAll('.choice').forEach((button,i)=>button.setAttribute('aria-label',e.choices[i][2]));
  }
  const baseEnglishAnswer=englishAnswer;
  englishAnswer=function(index,button){
    const e=englishSession;
    const fresh=view==='quiz' && e && !e.done && !button.disabled && e.curriculumKind==='にわっちの おつかい';
    baseEnglishAnswer(index,button);
    if(fresh && e.done){
      const gift=document.querySelector('.gw-delivery');
      if(gift){gift.innerHTML=e.word[1];gift.classList.add('gw-handed')}
    }
  };

  function sounds(){
    const pair=lowerGradePick('gw-sounds',soundPairs);
    const options=shuffle(pair);
    const names=options.map(row=>row[1]);
    const hear=data.sound && !data.noListening && 'speechSynthesis' in window;
    const lookup=Object.fromEntries(options.map(([icon,name])=>[name,'<span class="gw-icon">'+icon+'</span>'+name]));
    const samples=options.map(([icon,name],i)=>{
      const dots=Array.from(name,(kana,k)=>'<span class="gw-beat" style="--beat:'+k+'">'+kana+'</span>').join('');
      const body='<span class="gw-icon">'+icon+'</span>'+name+'<span class="gw-beats">'+dots+'</span>';
      return hear?'<button class="sub gw-sample" aria-label="'+name+'を きく" onclick="GardenWorkshop.say('+i+',this)">🔊 '+body+'</button>':'<div class="gw-sample">'+body+'</div>';
    });
    return {type:'jp',id:'gw-sounds-'+pair[0][1],names,answer:pair[0][1],choices:names,choicePictures:lookup,
      text:'「'+pair[0][1][0]+'」で はじまるよ。なまえが みじかいのは どっち？',
      hint:'おとを ひとつずつ ゆびで おってみよう。まるが すくないのは どっち？',
      visualHTML:'<div class="gw-samples">'+samples.join('')+'</div>'};
  }
  function acorns(){
    const advanced=Practice.mastered(person(),foundationById('compare'),0);
    const upper=rand(advanced?3:2,4),lower=upper+rand(advanced?-1:0,1);
    const options=advanced?['うえが おおい','したが おおい','おなじ']:['おなじ','したが おおい'];
    const answer=lower===upper?'おなじ':lower>upper?'したが おおい':'うえが おおい';
    const x=(i,spread)=>26+i*(spread?53:25);
    const links=Array.from({length:Math.min(upper,lower)},(_,i)=>'<line class="gw-link" style="--beat:'+i+'" x1="'+x(i,false)+'" y1="37" x2="'+x(i,true)+'" y2="72"/>').join('');
    const nut='<path d="M-10 -2 Q-10 10 0 15 Q10 10 10 -2" fill="#bc8043" stroke="#714923" stroke-width="1.5"/><path d="M-12 -2 Q-11 -12 0 -12 Q11 -12 12 -2 Q0 2 -12 -2Z" fill="#785438"/><path d="M0 -11 Q1 -16 4 -17" fill="none" stroke="#61492c" stroke-width="2.5"/>';
    const row=(n,wide,y)=>Array.from({length:n},(_,i)=>'<g transform="translate('+x(i,wide)+' '+y+')">'+nut+'</g>').join('');
    return {id:'gw-acorns-'+upper+'-'+lower,upper,lower,answer,choices:shuffle(options),
      choicePictures:{'うえが おおい':'⬆ うえが おおい','おなじ':'🟰 おなじ','したが おおい':'⬇ したが おおい'},
      text:advanced?'どんぐりは どっちが おおい？　それとも おなじ？':'したの どんぐりが おおい？　それとも おなじ？',hint:'うえと したを ひとつずつ むすぶと、あまる どんぐりは あるかな？',
      visualHTML:'<svg class="gw-acorns" viewBox="0 0 252 112" role="img" aria-label="うえに '+upper+'こ、したに '+lower+'この どんぐり">'+links+row(upper,false,22)+row(lower,true,91)+'</svg><button class="sub" onclick="GardenWorkshop.pair(this)">ひとつずつ むすぶ</button>'};
  }
  function pencil(stage){
    const length=rand(2,6),start=stage?rand(1,9-length):0;
    const choices=[...new Set([length,start+length,length+1,length-1])].slice(0,3);
    return {id:'gw-pencil-'+start+'-'+length,start,length,answer:length+' cm',choices:shuffle(choices.map(n=>n+' cm')),
      text:'えんぴつの ながさは なん cm？',hint:'えんぴつの はしから はしまで、1 cmの あいだを ひとつずつ かぞえよう。',
      visualHTML:'<div class="gw-ruler">'+LengthExpansion.ruler(start,start+length,true)+'</div>'+
        (start?'<button class="sub" aria-pressed="false" onclick="GardenWorkshop.slide(this)">0に そろえてみる</button>':'')};
  }

  const features=[
    ['🌱','めが でた','🌷','はなが さいた'],['🌻','ひまわりが さいた','🌷','チューリップが さいた'],
    ['🏷️','ふだが ついた','🎀','リボンが ついた'],['🍅','トマトが なった','🍆','なすが なった']
  ];
  function memo(stage){
    const pair=lowerGradePick('gw-pots',features),plants=[[pair[0],pair[1]],[pair[2],pair[3]]];
    const target=rand(0,1),compound=stage===2;
    const order=shuffle(compound?[0,1,2]:[0,1]);
    const plant=plants[target][1],tag=plant+(compound?' あかい はち':' はち');
    const shared='あかい はち',other=compound?plant+' はち':plants[1-target][1]+' はち';
    const matches=compound?{[tag]:[target],[other]:[target,2],[shared]:[0,1]}:null;
    const pots=order.map(i=>{
      const [icon,label]=plants[i===2?target:i],yellow=i===2;
      return '<div class="gw-pot-card" data-pot="'+i+'"><span class="gw-target">'+(i===target?'▼ ここに おみず':'')+'</span><span class="gw-plant" role="img" aria-label="'+label+(yellow?' きいろい':' あかい')+' はち">'+icon+'</span><span class="gw-pot"'+(yellow?' style="--pot:#d6b533"':'')+'></span></div>';
    });
    return {type:'jp',id:'gw-memo-'+stage+'-'+tag,target,matches,answer:tag,choices:shuffle(stage?[tag,other,shared]:[tag,shared]),
      text:stage?'メモの「ここ」を どの ことばに かえると つたわる？':'どの はちに みずを あげる？　にわっちに つたえよう。',
      hint:compound?'しるしの はちを みてね。うえてある ものと、はちの いろは なにかな？':'しるしの はちを みよう。ふたつの はちで ちがう ところは どこかな？',
      visualHTML:'<div class="gw-pots">'+pots.join('')+'</div>'+(stage?'<p class="gw-note">「<mark>ここ</mark>に みずを あげてね。」</p>':''),
      reviewText:'「'+tag+'に みずを あげてね。」'};
  }
  const previousAnswer=answer;
  answer=function(index,button){
    const choice=q?.choices[index];
    const matching=active('memo') && !button.disabled && q.matches?.[choice];
    previousAnswer(index,button);
    if(!matching)return;
    document.querySelectorAll('.gw-pot-card').forEach(card=>{
      card.classList.toggle('gw-match',matching.includes(Number(card.dataset.pot)));
    });
    if(matching.length>1){
      const message='にわっち「'+choice+'は ふたつ あるよ。どっちかな？」';
      document.querySelector('#feedback').textContent=message;
      speak(message);
    }
  };
  function seedlings(stage){
    const per=stage===1?lowerGradePick('gw-factors',[2,5]):rand(2,stage?6:4);
    const rows=rand(1,stage?4:Math.min(3,Math.floor(12/per)-1)),total=(rows+1)*per;
    const line='<div class="gw-seed-row">'+'<span>🌱</span>'.repeat(per)+'</div>';
    return {id:'gw-seeds-'+stage+'-'+rows+'-'+per,rows,per,answer:total,choices:shuffle([total,rows*per,rows*per+1]),
      text:'ひとれつに '+per+'ほんずつ。もう ひとれつ うえると、ぜんぶで なんぼん？',
      hint:'ふえるのは、いまの れつと おなじ '+per+'ほんだよ。',
      visualHTML:'<div class="gw-field" role="group" aria-label="'+rows+'れつに '+per+'ほんずつ">'+line.repeat(rows)+
        (stage<2?'<button class="gw-add-row" onclick="GardenWorkshop.plant(this)">＋ ひとれつ うえる</button>':'')+'</div>',
      reviewText:per+'ほんずつ '+(rows+1)+'れつで、'+total+'ほん。'};
  }

  const activities=new Map();
  function register(skill,stages,kind,build){
    const courses=foundationById(skill)?.courses;
    if(!courses)return;
    for(const stage of stages)activities.set(courses[stage],{kind,stage,build});
  }
  register('letters',[1,2],'sounds',sounds);
  register('compare',[0],'acorns',acorns);
  register('lifeLength',[0,1],'pencil',pencil);
  register('readingConditions',[0,1,2],'memo',memo);
  register('multiply',[0,1,2],'seedlings',seedlings);
  const previousEarly=GardenActivities.early;
  GardenActivities.early=function(course){
    const spec=activities.get(course);
    if(session?.n!==2 || !spec)return previousEarly(course);
    // Rotate with shiritori and kana assembly in their existing touch slot.
    if(spec.kind==='sounds' && (Practice.state(person()).sessions.jp||0)%3!==2)return previousEarly(course);
    const item=spec.build(spec.stage);
    return {type:'mental',objects:0,...item,i:course,activity:'workshop',workshop:spec.kind,variant:spec.kind};
  };
  function active(kind){return view==='quiz' && session && !session.done && q?.workshop===kind}
  function say(i,button){
    if(!active('sounds') || !q.names[i])return;
    speak(q.names[i]);
    button.classList.remove('gw-sounding');void button.offsetWidth;button.classList.add('gw-sounding');
  }
  function pair(button){
    if(!active('acorns'))return;
    session.help=true;
    const links=document.querySelectorAll('.gw-acorns .gw-link');
    const n=q.paired||0;if(n>=links.length)return;
    links[n].classList.add('gw-visible');q.paired=n+1;
    if(q.paired===links.length)button.disabled=true;
  }
  function slide(button){
    if(!active('pencil'))return;
    session.help=true;
    q.aligned=!q.aligned;
    const start=q.aligned?0:q.start;
    document.querySelector('.gw-ruler').innerHTML=LengthExpansion.ruler(start,start+q.length,true);
    button.setAttribute('aria-pressed',String(q.aligned));
    button.textContent=q.aligned?'もとの ばしょへ':'0に そろえてみる';
  }
  function plant(button){
    if(!active('seedlings') || button.disabled)return;
    button.innerHTML='<span class="gw-seed-row">'+'<span>🌱</span>'.repeat(q.per)+'</span>';
    button.setAttribute('aria-label',q.per+'ほん うえたよ');button.disabled=true;
  }
  const baseHint=showHint;
  showHint=function(){
    baseHint();
    if(view!=='quiz' || !session || session.done || !q?.workshop)return;
    document.querySelector('.board')?.classList.add('gw-hinted');
    if(q.workshop==='acorns'){
      const b=document.querySelector('.gw-acorns + button');if(b)b.disabled=true;
    }
  };
  return {appleRequests,errand,say,pair,slide,plant};
})();
