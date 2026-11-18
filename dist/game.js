let quizOwnsFullscreen=false;
function enterQuizScreen(){document.body.classList.add('quiz-mode');window.scrollTo?.(0,0);if(!document.fullscreenElement&&document.documentElement?.requestFullscreen){document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{if(view==='quiz')quizOwnsFullscreen=true;else document.exitFullscreen?.().catch(()=>{})}).catch(()=>{})}}
function leaveQuizScreen(){document.body.classList.remove('quiz-mode');if(quizOwnsFullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});quizOwnsFullscreen=false}
// Learning rewards are local to each learner. No paid or random items.
const SHOP=[['flower','おはな','🌸','hat',15],['cap','ぼうし','🧢','hat',20],['crown','おうかん','👑','hat',40],['ribbon','リボン','🎀','bow',15],['star','おほしさま','⭐','badge',20],['butterfly','ちょうちょ','🦋','badge',25]].map(([id,name,emoji,slot,cost])=>({id,name,emoji,slot,cost}));
SHOP.push(...(window.NiwatchiContent?.clothes||[]));
function initGame(p){let g=p.game;if(!g||typeof g!=='object'||Array.isArray(g))g=p.game={};for(let k of ['coins','growth'])if(!Number.isSafeInteger(g[k])||g[k]<0)g[k]=0;if(!Array.isArray(g.owned))g.owned=[];g.owned=g.owned.filter(id=>SHOP.some(i=>i.id===id));if(!g.equipped||typeof g.equipped!=='object')g.equipped={};for(let slot of ['hat','bow','badge','hand'])if(!SHOP.some(i=>i.id===g.equipped[slot]&&i.slot===slot&&g.owned.includes(i.id)))delete g.equipped[slot];if(!g.days||typeof g.days!=='object'||Array.isArray(g.days))g.days={};return g}
function game(){return initGame(person())}
function todayKey(){let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dailyRecord(){let g=game(),k=todayKey();if(!g.days[k]||typeof g.days[k]!=='object')g.days[k]={};return g.days[k]}
const FRIENDS=[{id:'main',name:'にわっち',icon:'🌱',at:1},{id:'momo',name:'ももっち',icon:'🌸',at:10},{id:'sora',name:'そらっち',icon:'☁️',at:25},{id:'hoshi',name:'ほしっち',icon:'⭐',at:50}];
function mainPetLevel(){return 1+Math.floor(game().growth/3)}
function friendState(id){
 const g=game();
 if(!g.friends||typeof g.friends!=='object'||Array.isArray(g.friends))g.friends={};
 const available=FRIENDS.filter(f=>mainPetLevel()>=f.at);
 for(const f of available.slice(1)){
  let p=g.friends[f.id];if(!p||typeof p!=='object'||Array.isArray(p))p=g.friends[f.id]={growth:0,equipped:{}};
  if(!Number.isSafeInteger(p.growth)||p.growth<0)p.growth=0;
  if(!p.equipped||typeof p.equipped!=='object')p.equipped={};
  for(const slot of ['hat','bow','badge','hand'])if(!SHOP.some(i=>i.id===p.equipped[slot]&&i.slot===slot&&g.owned.includes(i.id)))delete p.equipped[slot];
 }
 if(!available.some(f=>f.id===g.activeFriend))g.activeFriend='main';
 const target=id??g.activeFriend;
 return target==='main'?g:g.friends[target];
}
function selectedFriend(){friendState();return FRIENDS.find(f=>f.id===game().activeFriend)}
function petLevel(){return 1+Math.floor(friendState().growth/3)}
function selectFriend(id){if(!FRIENDS.some(f=>f.id===id&&mainPetLevel()>=f.at))return;game().activeFriend=id;friendState();save();petRoom()}
function friendPicker(){friendState();return '<div class="friend-picker">'+FRIENDS.map(f=>mainPetLevel()>=f.at?`<button class="sub" aria-pressed="${game().activeFriend===f.id}" onclick="selectFriend('${f.id}')">${f.icon} ${f.name}<small>レベル ${f.id==='main'?mainPetLevel():1+Math.floor(game().friends[f.id].growth/3)}</small></button>`:`<div class="friend-locked">🔒 ${f.icon}<small>にわっちが レベル${f.at}で あえるよ</small></div>`).join('')+'</div>'}

const PET_FOODS=[
 {id:'apple',name:'りんご',emoji:'🍎',reaction:'しゃきしゃき！ おいしいね！',motion:'pet-fed'},
 {id:'rice',name:'おにぎり',emoji:'🍙',reaction:'もぐもぐ！ げんき いっぱい！',motion:'pet-hop'},
 {id:'cake',name:'ケーキ',emoji:'🍰',reaction:'ふわふわ！ うれしくて おどっちゃう！',motion:'pet-dance'}
];
PET_FOODS.push(...(window.NiwatchiContent?.foods||[]));
function petWish(){return '<aside class="pet-wish"><strong>🌱 にわっちから おねがい</strong><p>いっしょに おはなを そだてよう！<br>すきな ステージを 5もん やると、おはなが ひとつ さくよ。</p><div aria-label="そだてた おはな">'+ '🌷'.repeat(Math.min(12,Math.max(0,Number(person().flowers)||0)))+'</div><small>そだてた おはな：'+(Number(person().flowers)||0)+'こ · いつ あそびに きても だいじょうぶ</small></aside>'}
function petLevelBadge(){const g=friendState(),lv=petLevel();return `<div class="pet-level-badge">${lv>=100?'🌈':'🌱'} レベル <b>${lv}</b></div><div class="pet-growth-track" role="progressbar" aria-label="つぎのレベルまでのせいちょう" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${g.growth%3}"><span style="width:${g.growth%3/3*100}%"></span></div><p>レベル ${lv+1} まで、あと ${3-g.growth%3}かい ごはんを あげよう！</p>`}

let rainbowSilhouetteNumber=0;
function friendSilhouette(id,level){
 if(id==='main')return '';
 const paths={
 momo:'M90 30C114 0 149 19 143 48C183 42 197 80 167 100C197 125 170 164 139 150C131 185 90 192 76 157C42 180 10 151 29 122C-5 110 0 67 36 64C23 31 61 5 90 30Z',
 sora:'M39 144C-8 142-8 84 29 78C25 39 69 21 92 50C119 17 164 42 156 77C197 74 203 139 160 145Z',
 hoshi:'M90 8Q96 8 100 20L119 61L164 65Q180 66 167 80L134 112L143 158Q147 174 132 167L90 144L48 167Q33 174 37 158L46 112L13 80Q0 66 16 65L61 61L80 20Q84 8 90 8Z'
 };
 const gradient=level>=100?'friend-rainbow-'+ ++rainbowSilhouetteNumber:'';
 const defs=gradient?`<defs><linearGradient id="${gradient}" x2="1" y2="1"><stop stop-color="#ffd3e5"/><stop offset=".35" stop-color="#ffe5a3"/><stop offset=".65" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e1caff"/></linearGradient></defs>`:'';
 const outline={momo:'#c883a5',sora:'#83aabc',hoshi:'#d7ac52'}[id];
 return `<svg class="friend-silhouette" viewBox="0 0 180 180" aria-hidden="true">${defs}<path d="${paths[id]}" fill="${gradient?'url(#'+gradient+')':'var(--pet-fill)'}" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/></svg>`;
}

function petCostume(equipped){
 const parts={hat:'',bow:'',badge:'',hand:'',necklace:''};
 for(const slot of ['hat','bow','badge']){
  const item=SHOP.find(i=>i.id===equipped[slot]);
  if(item)parts[slot]=`<span class="pet-${slot}">${item.emoji}</span>`;
 }
 return parts;
}
function petArt(friend=selectedFriend(),interactive=true){
 const state=friendState(friend.id);
 if(!state)return '';
 const level=1+Math.floor(state.growth/3),growth=Math.min(12,state.growth),season=Math.floor((level-1)/5);
 const hue=(42+growth+season*29+FRIENDS.indexOf(friend)*65)%360;
 const fill=level>=100?'linear-gradient(135deg,#ffd3e5,#ffe5a3,#d8f3bc,#bfe9ff,#e1caff)':`hsl(${hue},78%,${72-growth*.4}%)`;
 const leaf=friend.id!=='main'?friend.icon:growth>=12?['🌸','🌻','🌺','🌼','🌷'][season%5]:growth>=9?'🌷':growth>=6?'🌿':'🌱';
 const costume=petCostume(state.equipped);
 const controls=interactive?`role="button" tabindex="0" onclick="petNiwatchi()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();petNiwatchi()}"`:'role="img"';
 const label=`レベル${level}の ${friend.name}${interactive?'を なでる':''}`;
 return `<span class="pet-scene ${level>=100?'pet-rainbow':''}" ${controls} aria-label="${label}"><span class="pet-body friend-${friend.id}" style="--scale:${.83+growth*.022};--pet-fill:${fill};background:var(--pet-fill);">${friendSilhouette(friend.id,level)}<span class="pet-leaf" style="transform:scale(${.75+growth*.035})">${leaf}</span>${costume.hand}${costume.necklace}<span class="pet-face">• •</span><span class="pet-mouth"></span><span class="cheek left"></span><span class="cheek right"></span>${costume.hat}${costume.bow}</span>${costume.badge}</span>`;
}
let musicCtx=null,musicTimer=null,musicNodes=[],musicGeneration=0;
if(typeof data.music!=='boolean')data.music=true;
function refreshMusic(){let status=data.noListening?'♫ おんがく OFF（リスニングなし）':!data.music?'♫ おんがく OFF':musicCtx?.state==='running'?'♫ おんがく ON':'♫ おんがくを はじめる';document.querySelectorAll('[data-music]').forEach(b=>{b.textContent=status;b.disabled=data.noListening===true})}
function stopMusic(){musicGeneration++;if(musicTimer)clearInterval(musicTimer);musicTimer=null;for(let n of musicNodes){try{n.stop()}catch{}}musicNodes=[]}
function musicPhrase(){if(data.noListening||!data.music||document.hidden||musicCtx?.state!=='running')return;musicNodes=[];let notes=[523,659,784,659,587,698,784,0,659,784,880,784,659,587,523,0,523,659,784,1047,880,784,659,0,587,659,698,587,523,0,523,0],t=musicCtx.currentTime+.05;notes.forEach((f,i)=>{if(!f)return;let o=musicCtx.createOscillator(),v=musicCtx.createGain(),at=t+i*.34;o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(0,at);v.gain.linearRampToValueAtTime(.022,at+.02);v.gain.exponentialRampToValueAtTime(.0001,at+.28);o.connect(v);v.connect(musicCtx.destination);o.start(at);o.stop(at+.3);musicNodes.push(o)})}
function startMusic(){if(data.noListening||!data.music||document.hidden)return;try{let C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!musicCtx){musicCtx=new C();musicCtx.onstatechange=()=>{refreshMusic();if(musicCtx.state==='running'&&!data.noListening&&data.music&&!document.hidden&&!musicTimer){musicPhrase();musicTimer=setInterval(musicPhrase,12000)}}}let gen=musicGeneration;musicCtx.resume().then(()=>{if(gen!==musicGeneration||data.noListening||!data.music||document.hidden)return;if(!musicTimer){musicPhrase();musicTimer=setInterval(musicPhrase,12000)}refreshMusic()}).catch(()=>refreshMusic());refreshMusic()}catch{refreshMusic()}}
function musicControl(){if(data.noListening)return;if(data.music&&musicCtx?.state==='running'){data.music=false;stopMusic()}else{data.music=true;startMusic()}save();refreshMusic()}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMusic();if('speechSynthesis'in window)speechSynthesis.cancel()}else startMusic()});
function showWelcome(){leaveQuizScreen();session=null;view='welcome';if('speechSynthesis'in window)speechSynthesis.cancel();document.querySelector('#welcome')?.remove();let modal=document.createElement('div');modal.id='welcome';modal.className='welcome';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','welcomeTitle');modal.innerHTML=`<div class="welcome-box"><div style="font-size:58px">🌸📖</div><h1 id="welcomeTitle">だれが あそぶ？</h1><p>じぶんの なまえを おしてね。</p><button class="sub" data-listening-mode aria-pressed="${data.noListening===true}" onclick="setNoListening(!data.noListening)">${data.noListening?'🔇 リスニングなし':'🔊 リスニングあり'}</button><p class="muted">音を出せない場所では「リスニングなし」。文字や絵で答えられる問題になります。</p><button class="sub" data-music onclick="musicControl()">♫ おんがくを はじめる</button><p class="muted">おとが でないときは、うえの ボタンを おしてね。</p><div class="profile-buttons">${data.profiles.map((p,i)=>`<button class="profile-button" onclick="chooseChild(${i})"><span>${i%2?'🐰':'🐱'}</span>${esc(p.name)}</button>`).join('')}</div></div>`;document.body.appendChild(modal);document.querySelector('.wrap').inert=true;modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;let buttons=[...modal.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});modal.querySelector('button').focus();startMusic();refreshMusic()}
function chooseChild(i){if(!data.profiles[i])return;data.current=i;game();save();document.querySelector('#welcome')?.remove();document.querySelector('.wrap').inert=false;refresh();home();startMusic()}
function practiceFlow(){
 const p=person();if(!p.practiceFlow||typeof p.practiceFlow!=='object'||Array.isArray(p.practiceFlow))p.practiceFlow={};
 p.practiceFlow.freeChoice=p.practiceFlow.freeChoice===true;
 if(!['math','jp','en'].includes(p.practiceFlow.next))p.practiceFlow.next='math';
 return p.practiceFlow;
}
function freeSubjectChoice(){return practiceFlow().freeChoice}
function guidedStartLabel(){return {math:'算数から はじめる →',jp:'つづきの国語へ →',en:'つづきの英語へ →'}[practiceFlow().next]}
function recommendationFor(which){let old=subject;subject=which;let i=recommended();subject=old;return i}
function dailyStages(){let old=subject,lo=old==='math'?0:JP_START,hi=old==='math'?JP_START:TOPICS.length,learned=[];for(let i=0;i<TOPICS.length;i++)if(subjectForCourse(i)===old&&stats(i).total>0)learned.push(i);let c=learned.length?learned[(new Date().getDate()-1)%learned.length]:lo;return [{i:recommendationFor('math'),title:'🔢 さんすうの みち'},{i:recommendationFor('jp'),title:'📖 ことばの もり'},{i:c,title:'🌼 もういちどの おか'}]}
home=function(){
 leaveQuizScreen();view='home';session=null;refresh();
 let g=game();
 app.innerHTML=`<section class="panel center subject-home">
 <div class="home-avatar-heading"><div class="home-portrait-card">${gardenPortrait()}<button class="avatar-home" onclick="avatarRoom()" aria-label="じぶんの アバターを きせかえる">きせかえ</button></div><div><p class="eyebrow">${esc(person().name)} の にわ</p><h1>きょうは なにを する？</h1></div></div>
 <p>算数 → 国語 → 英語。ひとつずつ、5もんで おはなが さくよ。</p>
 <button class="primary" onclick="startGuidedPractice()">${guidedStartLabel()}</button>
 <p class="muted" ${freeSubjectChoice()?'':'hidden'}>すきな教科・分野から はじめられます。</p>
 <div class="subject-home-choices" ${freeSubjectChoice()?'':'hidden'}>
 <button class="subject-home-card math" onclick="start(recommendationFor('math'),true)"><span aria-hidden="true">🔢</span><strong>さんすう</strong>${homeStageLabel(0)}</button>
 <button class="subject-home-card language" onclick="start(recommendationFor('jp'),true)"><span aria-hidden="true">📖</span><strong>こくご</strong>${homeStageLabel(1)}</button>
 <button class="subject-home-card english" onclick="startEnglish()"><span aria-hidden="true">🔤</span><strong>えいご</strong>${homeStageLabel(2)}</button></div>
 <div class="subject-home-pet"><span class="coin">🪙 ${g.coins} コイン</span><button class="sub" onclick="petRoom()">🌱 にわっちと ともだち · Lv.${mainPetLevel()}</button></div>
 
 <p class="muted">🌷 そだてた おはな：${Number(person().flowers)||0}こ</p>
 </section>`;
 refreshMusic();
};
const originalStart=start;
start=function(i,auto){subject=subjectForCourse(i);let level=auto?adaptiveState().level:i;enterQuizScreen();originalStart(level,auto);session.stageStart=auto?'auto-'+subject:i;session.rewarded=false};
const originalFinish=finish;
finish=function(){if(!session||session.rewarded)return;session.rewarded=true;leaveQuizScreen();let g=game(),d=dailyRecord(),id=String(session.stageStart??session.i),reward=d[id]?3:10;d[id]=(Number.isSafeInteger(d[id])?d[id]:0)+1;g.coins+=reward;let keys=Object.keys(g.days).sort();for(let k of keys.slice(0,-90))delete g.days[k];save();originalFinish();let box=document.createElement('div');box.className='reward';box.innerHTML=`<strong>🪙 ${reward} コイン もらった！</strong><p>いま ${g.coins} コイン。にわっちに あいに いこう。</p><button class="sub result-secondary" onclick="petRoom()">🌱 にわっちに あう</button>`;app.querySelector('.panel').appendChild(box)};


function petCompany(){
 const active=selectedFriend().id,level=mainPetLevel();
 const html=FRIENDS.filter(f=>f.id!==active&&level>=f.at).map(f=>
  `<button class="pet-companion" onclick="selectFriend('${f.id}')" aria-label="${f.name}を えらぶ">${petArt(f,false)}<span class="pet-companion-name">${f.name}</span></button>`
 ).join('');
 return '<div class="pet-company" aria-label="なかまに なった ともだち">'+html+'</div>';
}


const ROOM_ITEMS=[
 ['garden','おにわ','🌿','wall',0,'#edf5df'],['pinkroom','いちごの おへや','🍓','wall',20,'#fbe1e9'],['skyroom','そらの おへや','☁️','wall',20,'#dcedfa'],['nightroom','ほしの おへや','🌟','wall',30,'#e4ddf5'],
 ['none','かぐを しまう','📦','furniture',0,''],['sofa','ソファ','🛋️','furniture',20,''],['bed','ベッド','🛏️','furniture',25,''],['plant','おはな','🪴','furniture',10,''],['bear','ぬいぐるみ','🧸','furniture',15,'']
].map(([id,name,icon,slot,cost,color])=>({id,name,icon,slot,cost,color}));
ROOM_ITEMS.push(...(window.NiwatchiContent?[...NiwatchiContent.furniture,...NiwatchiContent.gifts]:[]));
function roomState(){
 const g=game();if(!g.room||typeof g.room!=='object'||Array.isArray(g.room))g.room={};
 const r=g.room;if(!Array.isArray(r.owned))r.owned=[];
 r.owned=[...new Set(['garden','none',...r.owned.filter(id=>ROOM_ITEMS.some(i=>i.id===id))])];
 for(const [slot,fallback] of [['wall','garden'],['furniture','none']])if(!ROOM_ITEMS.some(i=>i.id===r[slot]&&i.slot===slot&&r.owned.includes(i.id)))r[slot]=fallback;
 return r;
}
function roomColor(){return ROOM_ITEMS.find(i=>i.id===roomState().wall).color}
function roomDecor(){const i=ROOM_ITEMS.find(i=>i.id===roomState().furniture);return '<div class="room-decor" aria-label="'+i.name+'">'+(i.id==='none'?'':i.icon)+'</div>'}
function roomShop(){const r=roomState();return '<details class="room-shop"><summary>🏡 おへやを かざる</summary><p>かべがみと かぐを ひとつずつ えらぼう。かった ものは ずっと つかえるよ。</p><div class="wardrobe">'+ROOM_ITEMS.map(i=>'<div class="shop-item"><span style="font-size:34px">'+i.icon+'</span><strong>'+i.name+'</strong><button onclick="buyRoomItem(\''+i.id+'\')" '+(!r.owned.includes(i.id)&&game().coins<i.cost?'disabled':'')+'>'+(r[i.slot]===i.id?'えらんでいるよ':r.owned.includes(i.id)?'かざる':i.cost+'🪙で かう')+'</button></div>').join('')+'</div></details>'}
function buyRoomItem(id){
 const i=ROOM_ITEMS.find(i=>i.id===id);if(!i)return;const g=game(),r=roomState();
 if(!r.owned.includes(id)){if(g.coins<i.cost)return;g.coins-=i.cost;r.owned.push(id)}
 r[i.slot]=id;save();petRoom('おへやを かざったよ！');const shop=app.querySelector('.room-shop');if(shop)shop.open=true;
}
let togetherTimer=null;
function playTogether(){
 if(view!=='pet')return;const cast=app.querySelector('.pet-room-cast');if(!cast)return;
 clearTimeout(togetherTimer);cast.classList.remove('friends-playing');void cast.offsetWidth;cast.classList.add('friends-playing');
 const status=app.querySelector('.game-status');if(status)status.textContent=mainPetLevel()>=10?'みんなで ぴょん！ なかよし、うれしいね ♥':'いっしょに ぴょん！ うれしいね ♥';
 playFeedSound(true);
 togetherTimer=setTimeout(()=>cast.classList.remove('friends-playing'),2000);
}

function petRoom(message=''){
 const controlsScroll=view==='pet'?(app.querySelector('.pet-room-controls')?.scrollTop||0):0;
 leaveQuizScreen();view='pet';session=null;let g=game(),lv=petLevel();
 app.innerHTML=`<section class="panel pet-room"><div class="quiztop pet-room-top"><button class="sub" onclick="home()">← にわへ</button><span class="coin">🪙 ${g.coins} コイン</span></div>
 <div class="pet-room-layout">
 <div class="pet-room-preview center" style="background:${roomColor()}"><h1>${esc(person().name)}の ${selectedFriend().name}</h1>
 <div class="pet-room-cast">${petArt()}${petCompany()}${roomDecor()}</div><div class="pet-room-level">${petLevelBadge()}</div>
 ${lv>=100?'<div class="rainbow-title">🌈 にじいろの '+selectedFriend().name+' 🌈</div>':''}
 <p class="game-status" role="status">${esc(message)||'タッチして なでなでしてね ♥'}</p></div>
 <div class="pet-room-controls" tabindex="0" aria-label="ごはんと きせかえ"><h2>いっしょに あそぶ こ</h2>${friendPicker()}
 <button class="sub" onclick="playTogether()">💕 みんなで あそぶ</button><button class="sub" onclick="railRoom()">🚂 でんしゃで あそぶ</button><h2>ごはんを あげる</h2><div class="pet-foods">${PET_FOODS.map(f=>`<button class="sub" onclick="feedPet('${f.id}')" ${g.coins<10?'disabled':''}><span>${f.emoji}</span>${f.name}<small>10🪙 · せいちょう ＋1</small></button>`).join('')}</div>
 <h2>きせかえやさん</h2><p class="muted">かった ものは、ずっと つかえるよ。</p><div class="wardrobe">${SHOP.map(item=>{let owned=g.owned.includes(item.id),on=friendState().equipped[item.slot]===item.id;return `<div class="shop-item"><div style="font-size:36px">${item.emoji}</div><strong>${item.name}</strong><button onclick="shopAction('${item.id}')" ${!owned&&g.coins<item.cost?'disabled':''}>${on?'はずす':owned?'つける':item.cost+'🪙で かう'}</button></div>`}).join('')}</div>
 ${roomShop()}<p class="muted">おやすみしても、ちいさく ならないよ。<br>5もん クリアして コインを あつめよう！</p></div></div></section>`;
 const controls=app.querySelector('.pet-room-controls');if(controls)controls.scrollTop=controlsScroll;
}

let petSoundContext=null;
function playFeedSound(levelUp){
 if(data.noListening||!data.sound)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  if(!petSoundContext||petSoundContext.state==='closed')petSoundContext=new C();
  const ctx=petSoundContext;
  ctx.resume().then(()=>{
   if(data.noListening||!data.sound||document.hidden)return;
   const notes=levelUp?[523,659,784,1047]:[659,784,988];
   notes.forEach((hz,i)=>{
    const o=ctx.createOscillator(),v=ctx.createGain(),t=ctx.currentTime+i*.13;
    o.type='sine';o.frequency.setValueAtTime(hz,t);
    v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(.07,t+.015);
    v.gain.exponentialRampToValueAtTime(.0001,t+.22);
    o.connect(v);v.connect(ctx.destination);o.onended=()=>{o.disconnect();v.disconnect()};
    o.start(t);o.stop(t+.24);
   });
  }).catch(()=>{});
 }catch{}
}
let petReactionTimer=null;
function petReaction(motion,emoji){
 const scene=app.querySelector('.pet-room-cast > .pet-scene');if(!scene)return;
 clearTimeout(petReactionTimer);
 scene.classList.remove('pet-fed','pet-hop','pet-dance','pet-petted','pet-evolved');
 scene.querySelector('.feed-hearts')?.remove();
 void scene.offsetWidth;scene.classList.add(motion);
 const face=scene.querySelector('.pet-face');if(face)face.textContent='⌒ ⌒';
 const hearts=document.createElement('span');hearts.className='feed-hearts';hearts.textContent=emoji;hearts.setAttribute('aria-hidden','true');scene.appendChild(hearts);
 petReactionTimer=setTimeout(()=>{scene.classList.remove(motion);hearts.remove();if(face)face.textContent='• •'},1800);
}
function petNiwatchi(){
 if(view!=='pet')return;
 const status=app.querySelector('.game-status');if(status)status.textContent='♥ なでなで、ありがとう！ だいすき！';
 playTogether();petReaction('pet-petted','♥ ♥ ♥');
}
function feedPet(id='apple'){
 const food=PET_FOODS.find(f=>f.id===id);if(!food)return;
 let g=game(),pet=friendState(),before=petLevel(),oldMain=mainPetLevel();
 if(g.coins<10||pet.growth>=Number.MAX_SAFE_INTEGER)return;
 g.coins-=10;pet.growth++;
 friendState();save();let levelUp=petLevel()>before,evolved=before<100&&petLevel()>=100;
 petRoom(evolved?'🌈 おめでとう！ レベル100！ にじいろの '+selectedFriend().name+'に しんかしたよ！':food.emoji+' '+food.reaction+(levelUp?' ✨ レベルアップ！':' せいちょうしたよ！'));
 const joined=FRIENDS.find(f=>f.id!=='main'&&oldMain<f.at&&mainPetLevel()>=f.at);
 if(joined){const status=app.querySelector('.game-status');if(status)status.textContent+=' '+joined.icon+' '+joined.name+'が あそびに きたよ！'}
 playFeedSound(levelUp);petReaction(evolved?'pet-evolved':food.motion,evolved?'🌈 ✨ 🌈':levelUp?'✨ 🌸 ✨':'♥ '+food.emoji+' ♥');
}
const feedingStyle=document.createElement('style');
feedingStyle.textContent=`
.pet-room-cast{display:flex;align-items:center;justify-content:center;width:100%;min-height:240px;gap:4px}.pet-room-cast>.pet-scene{flex:1;min-width:0}.pet-company{display:flex;flex-direction:column;gap:3px;flex-shrink:0}.pet-companion{position:relative;background:#ffffffa8;border:1px solid #d6e2c6;border-radius:14px;width:84px;height:77px;padding:0;overflow:hidden}.pet-room-preview .pet-companion .pet-scene{position:absolute;left:0;top:0;width:84px;height:59px;min-height:0;margin:0;background:transparent;overflow:visible;pointer-events:none}.pet-companion .pet-body{scale:.3}.pet-companion .pet-badge{font-size:15px;bottom:0;right:5px}.pet-companion>.pet-companion-name{position:absolute;bottom:3px;left:0;right:0;font-size:11px}.pet-companion:focus-visible{outline:3px solid #739654}.pet-room-preview .pet-company:empty{display:none}@media(max-width:650px){.pet-room-preview .pet-room-cast{position:absolute;left:0;top:0;width:45%;height:205px;min-height:0;display:flex;flex-direction:column;gap:0}.pet-room-preview .pet-room-cast>.pet-scene{position:relative;left:auto;top:auto;width:100%;height:135px;min-height:135px;flex:none;margin:0}.pet-room-cast>.pet-scene>.pet-body{scale:.7}.pet-company{flex-direction:row;justify-content:center;width:100%;gap:1px}.pet-companion{width:32%;max-width:65px;height:65px}.pet-room-preview .pet-companion .pet-scene{width:100%;height:48px;min-height:0;top:0}.pet-companion .pet-body{scale:.23}.pet-companion>.pet-companion-name{font-size:9px}}

.friend-silhouette{position:absolute;inset:-20px;width:180px;height:180px;overflow:visible;z-index:-1;filter:drop-shadow(0 7px 0 #9cac7d33)}.pet-body.friend-momo,.pet-body.friend-sora,.pet-body.friend-hoshi{isolation:isolate;border-color:transparent;background:transparent!important;box-shadow:none}.friend-momo .pet-leaf,.friend-sora .pet-leaf,.friend-hoshi .pet-leaf{display:none}.friend-sora .friend-silhouette{inset:-10px -28px;width:196px;height:170px}.friend-hoshi .friend-silhouette{inset:-25px;width:190px;height:190px}.friend-hoshi .pet-hat{top:-42px}.pet-rainbow .friend-silhouette{filter:drop-shadow(0 0 12px #e9c3ee)}

.pet-room{position:fixed;inset:10px;z-index:50;max-width:none;height:auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;margin:0;padding:16px}.pet-room-top{flex-shrink:0;margin-bottom:10px}.pet-room-layout{display:grid;grid-template-columns:minmax(230px,42%) minmax(0,1fr);gap:20px;flex:1;min-height:0}.pet-room-preview{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0;background:#f1f5e9;border-radius:24px;padding:12px;overflow:hidden}.pet-room-preview h1{font-size:22px;margin:0 0 4px}.pet-room-preview .pet-scene{flex-shrink:1;min-height:220px;height:240px;width:100%;max-width:300px;margin:4px auto}.pet-room-preview .pet-level-badge{font-size:18px;padding:4px 16px}.pet-room-preview .pet-level-badge b{font-size:27px}.pet-room-preview .pet-growth-track{margin-top:6px;height:9px}.pet-room-level>p{font-size:13px;margin:6px 0}.pet-room-preview .game-status{min-height:2.6em;font-size:15px;margin:6px 0;line-height:1.3}.pet-room-preview .rainbow-title{font-size:16px;margin:0}.pet-room-controls{overflow-y:auto;overscroll-behavior:contain;min-height:0;padding:2px 10px 20px 4px;scrollbar-gutter:stable}.pet-room-controls h2{font-size:20px;margin:12px 0}.pet-room-controls .friend-picker{grid-template-columns:repeat(2,1fr);margin:8px 0}.pet-room-controls .wardrobe{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pet-room-controls .pet-foods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pet-room-controls .pet-foods button{min-width:0;padding:10px 4px;min-height:100px}.pet-room-controls .shop-item{min-width:0}.pet-room-controls .shop-item button{min-height:48px}@media(max-width:650px){.pet-room{padding:10px;inset:5px}.pet-room-layout{grid-template-columns:1fr;grid-template-rows:205px minmax(0,1fr);gap:10px}.pet-room-preview{position:relative;padding:8px 8px 8px 46%;justify-content:center}.pet-room-preview .pet-scene{position:absolute;left:0;top:4px;width:45%;height:195px;min-height:195px;margin:0;overflow:visible}.pet-room-preview h1{font-size:17px}.pet-room-preview .game-status{font-size:13px}.pet-room-level>p{font-size:12px}.pet-room-controls .friend-picker{grid-template-columns:repeat(2,1fr)}}

.friend-picker{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.friend-picker button,.friend-locked{padding:12px 8px;border-radius:16px;min-height:80px}.friend-picker small{display:block;font-size:12px;margin-top:6px}.friend-picker [aria-pressed=true]{outline:3px solid #739654;background:#e1edce}.friend-locked{background:#f1f1e8;color:#666}@media(max-width:600px){.friend-picker{grid-template-columns:repeat(2,1fr)}}
.rainbow-title{color:#77548e;font-size:23px;font-weight:800;margin-top:14px}.rainbow-title p{font-size:15px;font-weight:400}.pet-rainbow{background:radial-gradient(ellipse,#fff8ce,#f8e4ff 55%,#d9efff)}.pet-rainbow:before{content:'✧ ✨ ✧';position:absolute;top:25px;left:0;right:0;text-align:center;font-size:32px;color:#9f78c7;pointer-events:none}.pet-rainbow .pet-body{border-color:#c599d0;box-shadow:0 0 25px 10px #fff9,0 12px 0 #c3a1d644}.pet-evolved .pet-body{animation:petHop .6s ease-in-out 3}
.pet-level-badge{display:inline-flex;align-items:center;gap:10px;background:#fff0b8;color:#67511c;border:2px solid #e5c66e;border-radius:24px;padding:10px 24px;font-size:24px}.pet-level-badge b{font-size:40px}.pet-growth-track{height:14px;border-radius:12px;background:#e4e9d9;max-width:300px;margin:14px auto 0;overflow:hidden}.pet-growth-track span{display:block;height:100%;background:#84b75c;transition:width .4s}.subject-home-card.english{background:#e9efff;border-color:#b9c8e7}.subject-home{max-width:850px;margin:20px auto}.subject-home-choices{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin:28px 0}.subject-home-card{display:grid;place-items:center;gap:14px;min-height:190px;border:3px solid #bad2ad;border-radius:28px;background:#eaf2df}.subject-home-card.language{background:#fff0df;border-color:#e6c99e}.subject-home-card span{font-size:58px}.subject-home-card strong{font-size:32px}.subject-home-pet{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:18px;margin-top:24px}@media(max-width:500px){.subject-home-choices{gap:12px;grid-template-columns:1fr}.subject-home-card{min-height:145px;padding:14px}.subject-home-card strong{font-size:25px}.subject-home-card span{font-size:44px}}
.pet-wish{background:#edf4e5;border:2px solid #d1dfbd;border-radius:22px;padding:18px 22px;margin:16px 0;color:#36513d}.pet-wish p{margin:8px 0}.pet-wish div{font-size:28px;overflow-wrap:anywhere}
.pet-foods{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}.pet-foods button{display:grid;gap:6px;min-width:130px;min-height:110px}.pet-foods span{font-size:36px}.pet-foods small{font-size:12px}
.pet-scene[role=button]{cursor:pointer;touch-action:manipulation}.pet-scene:focus-visible{outline:4px solid #587e51;outline-offset:4px}
.pet-hop .pet-body{animation:petHop .5s ease-in-out 3}.pet-dance .pet-body{animation:petDance .45s ease-in-out 4}.pet-petted .pet-body{animation:petMunch .6s ease-in-out 3}
@keyframes petHop{0%,100%{transform:scale(var(--scale))}50%{transform:translateY(-22px) scale(var(--scale))}}
@keyframes petDance{0%,100%{transform:rotate(-10deg) scale(var(--scale))}50%{transform:rotate(10deg) scale(var(--scale))}}
.pet-body,.pet-leaf{transition:background .4s,transform .4s}
.pet-fed .pet-body{animation:petMunch .35s ease-in-out 4}
.feed-hearts{position:absolute;top:22px;left:0;right:0;font-size:30px;color:#d97887;pointer-events:none;animation:feedFloat 1.8s ease-out forwards}
@keyframes petMunch{0%,100%{transform:scale(var(--scale))}50%{transform:translateY(-8px) scale(calc(var(--scale)*1.06),calc(var(--scale)*.96))}}
@keyframes feedFloat{0%{opacity:0;transform:translateY(30px)}20%,75%{opacity:1}100%{opacity:0;transform:translateY(-15px)}}
@media(prefers-reduced-motion:reduce){.pet-fed .pet-body,.pet-hop .pet-body,.pet-dance .pet-body,.pet-petted .pet-body,.pet-evolved .pet-body,.feed-hearts{animation:none}.pet-body,.pet-leaf{transition:none}}
`;
feedingStyle.textContent+=`
/* Miniatures use an explicit center; shrinking a grid item does not shrink its layout box. */
.pet-room-preview .pet-company .pet-companion{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;width:100px;height:105px;padding:0;position:relative;overflow:hidden}
.pet-room-preview .pet-company .pet-companion .pet-scene{position:relative;inset:auto;display:block;flex:none;width:100%;height:80px;min-height:80px;max-width:none;margin:0;border-radius:0;overflow:hidden}
.pet-room-preview .pet-company .pet-companion .pet-body{position:absolute;left:50%;top:52%;margin:0;scale:1;transform:translate(-50%,-50%) scale(calc(var(--scale,1)*.43));transform-origin:center}
.pet-room-preview .pet-company .pet-companion>.pet-companion-name{position:static;display:block;flex:none;width:100%;height:22px;line-height:22px;font-size:12px;text-align:center;white-space:nowrap}
.pet-room-preview .pet-company .pet-companion .pet-badge{right:7px;bottom:4px;font-size:17px}
.pet-room-preview .pet-company .pet-companion .pet-scene:before{display:none}
@media(max-width:650px){
 .pet-room-preview .pet-company .pet-companion{width:32%;max-width:65px;height:65px}
 .pet-room-preview .pet-company .pet-companion .pet-scene{height:47px;min-height:47px}
 .pet-room-preview .pet-company .pet-companion .pet-body{transform:translate(-50%,-50%) scale(calc(var(--scale,1)*.26))}
 .pet-room-preview .pet-company .pet-companion>.pet-companion-name{height:18px;line-height:18px;font-size:9px}
 .pet-room-preview .pet-company .pet-companion .pet-badge{font-size:12px;right:2px;bottom:1px}
}
`;
feedingStyle.textContent+=`
.pet-room-cast{position:relative}.room-decor{position:absolute;bottom:0;left:10px;font-size:45px;pointer-events:none;filter:drop-shadow(0 3px 2px #0002)}.pet-room-preview .pet-room-cast>.pet-scene{background:transparent}.room-shop{margin:20px 0}.room-shop summary{padding:15px;border-radius:16px;background:#e7eddc;cursor:pointer;font-weight:bold;min-height:48px}.room-shop .shop-item strong{display:block}.friends-playing>.pet-scene,.friends-playing .pet-companion{animation:friendsBounce .5s ease-in-out 4}.friends-playing .pet-companion:nth-child(2){animation-delay:.1s}.friends-playing .pet-companion:nth-child(3){animation-delay:.2s}@keyframes friendsBounce{50%{translate:0 -8px;rotate:3deg}}@media(max-width:650px){.room-decor{font-size:26px;bottom:65px;left:0}}@media(prefers-reduced-motion:reduce){.friends-playing>.pet-scene,.friends-playing .pet-companion{animation:none}}
`;
document.head.appendChild(feedingStyle);
function shopAction(id){let item=SHOP.find(x=>x.id===id);if(!item)return;let g=game(),pet=friendState();if(g.owned.includes(id)){if(pet.equipped[item.slot]===id)delete pet.equipped[item.slot];else pet.equipped[item.slot]=id;save();petRoom('きせかえ したよ！');return}if(g.coins<item.cost)return;g.coins-=item.cost;g.owned.push(id);pet.equipped[item.slot]=id;save();petRoom(item.name+'を てにいれた！')}

const EN_WORDS=[
 // Familiar picture nouns only. Add breadth inside the existing stages, not
 // sentences, spelling tasks, more answer buttons, or extra course IDs.
 [['cat','🐱','ねこ'],['dog','🐶','いぬ'],['rabbit','🐰','うさぎ'],['bear','🐻','くま'],['elephant','🐘','ぞう'],['fish','🐟','さかな'],['bird','🐦','とり'],['frog','🐸','かえる'],
  ['lion','🦁','らいおん'],['tiger','🐯','とら'],['monkey','🐵','さる'],['panda','🐼','ぱんだ'],['giraffe','🦒','きりん'],['zebra','🦓','しまうま'],['horse','🐴','うま'],['cow','🐮','うし'],
  ['pig','🐷','ぶた'],['sheep','🐑','ひつじ'],['mouse','🐭','ねずみ'],['turtle','🐢','かめ'],['whale','🐳','くじら'],['dolphin','🐬','いるか'],['fox','🦊','きつね'],['koala','🐨','こあら'],
  ['duck','🦆','かも'],['chicken','🐔','にわとり'],['penguin','🐧','ぺんぎん'],['owl','🦉','ふくろう'],['eagle','🦅','わし'],['parrot','🦜','いんこ'],['swan','🦢','はくちょう'],['goat','🐐','やぎ'],
  ['deer','🦌','しか'],['camel','🐪','らくだ'],['kangaroo','🦘','かんがるー'],['gorilla','🦍','ごりら'],['hippo','🦛','かば'],['rhino','🦏','さい'],['crocodile','🐊','わに'],['snake','🐍','へび'],
  ['lizard','🦎','とかげ'],['shark','🦈','さめ'],['octopus','🐙','たこ'],['crab','🦀','かに'],['butterfly','🦋','ちょうちょ'],['bee','🐝','はち'],['ant','🐜','あり'],['snail','🐌','かたつむり']],
 [['apple','🍎','りんご'],['banana','🍌','ばなな'],['grapes','🍇','ぶどう'],['strawberry','🍓','いちご'],['bread','🍞','ぱん'],['rice ball','🍙','おにぎり'],['cake','🍰','けーき'],['egg','🥚','たまご'],
  ['orange','🍊','おれんじ'],['peach','🍑','もも'],['pear','🍐','ようなし'],['melon','🍈','めろん'],['watermelon','🍉','すいか'],['lemon','🍋','れもん'],['pineapple','🍍','ぱいなっぷる'],['cherry','🍒','さくらんぼ'],
  ['carrot','🥕','にんじん'],['tomato','🍅','とまと'],['potato','🥔','じゃがいも'],['corn','🌽','とうもろこし'],['cucumber','🥒','きゅうり'],['cheese','🧀','ちーず'],['cookie','🍪','くっきー'],['milk','🥛','ぎゅうにゅう'],
  ['kiwi','🥝','きうい'],['mango','🥭','まんごー'],['blueberries','🫐','ぶるーべりー'],['coconut','🥥','ここなっつ'],['broccoli','🥦','ぶろっこりー'],['eggplant','🍆','なす'],['sweet potato','🍠','さつまいも'],['peanuts','🥜','ぴーなっつ'],
  ['chestnut','🌰','くり'],['pizza','🍕','ぴざ'],['hamburger','🍔','はんばーがー'],['sandwich','🥪','さんどいっち'],['hot dog','🌭','ほっとどっぐ'],['pancakes','🥞','ぱんけーき'],['croissant','🥐','くろわっさん'],['donut','🍩','どーなつ'],
  ['ice cream','🍦','あいすくりーむ'],['chocolate','🍫','ちょこれーと'],['candy','🍬','あめ'],['lollipop','🍭','ぺろぺろきゃんでぃー'],['popcorn','🍿','ぽっぷこーん'],['honey','🍯','はちみつ'],['juice','🧃','じゅーす'],['tea','🍵','おちゃ']],
 [['car','🚗','くるま'],['train','🚃','でんしゃ'],['airplane','✈️','ひこうき'],['bicycle','🚲','じてんしゃ'],['book','📖','ほん'],['umbrella','☂️','かさ'],['hat','👒','ぼうし'],['ball','⚽','ぼーる'],
  ['bus','🚌','ばす'],['boat','⛵','ふね'],['rocket','🚀','ろけっと'],['truck','🚚','とらっく'],['pencil','✏️','えんぴつ'],['key','🔑','かぎ'],['bed','🛏️','べっど'],['chair','🪑','いす'],
  ['door','🚪','どあ'],['clock','🕒','とけい'],['phone','📱','でんわ'],['bag','🎒','かばん'],['guitar','🎸','ぎたー'],['spoon','🥄','すぷーん'],['drum','🥁','たいこ'],['kite','🪁','たこ'],
  ['watch','⌚','うでどけい'],['camera','📷','かめら'],['television','📺','てれび'],['computer','💻','こんぴゅーたー'],['scissors','✂️','はさみ'],['ruler','📏','ものさし'],['paintbrush','🖌️','えふで'],['magnet','🧲','じしゃく'],
  ['hammer','🔨','かなづち'],['basket','🧺','かご'],['balloon','🎈','ふうせん'],['gift','🎁','ぷれぜんと'],['ring','💍','ゆびわ'],['crown','👑','おうかん'],['glasses','👓','めがね'],['gloves','🧤','てぶくろ'],
  ['scarf','🧣','まふらー'],['shoe','👟','くつ'],['socks','🧦','くつした'],['dress','👗','わんぴーす'],['shirt','👕','しゃつ'],['pants','👖','ずぼん'],['keyboard','🎹','けんばん'],['violin','🎻','ばいおりん']]
];
// Page-local, per-child rotation across five-question sets. It is deliberately
// separate from saved progress/mastery and resets on reload or profile restore.
const englishPictureHistory=new WeakMap();
// Conservative exclusions cover broader meanings, Japanese hints and visually
// similar pictures. They are safeguards for beginning learners, not taxonomy
// lessons or claims that every word in a group means the same thing.
const englishPictureConflicts=[
 ['bear','panda'],['bird','duck','chicken','penguin','owl','eagle','parrot','swan'],
 ['fish','shark','whale','dolphin'],['monkey','gorilla'],['sheep','goat'],
 ['melon','watermelon'],['potato','sweet potato'],
 ['bread','croissant','sandwich','hot dog','hamburger'],
 ['cake','pancakes'],['candy','chocolate','lollipop'],
 ['car','bus','truck'],['clock','watch'],['computer','keyboard']
];
function englishPictureDistractor(target,other){
 return target[0]!==other[0]&&target[1]!==other[1]&&target[2]!==other[2]&&!englishPictureConflicts.some(group=>group.includes(target[0])&&group.includes(other[0]));
}
function pickEnglishPicture(e,bank){
 const p=person();let history=englishPictureHistory.get(p);
 if(!history){history=new Map();englishPictureHistory.set(p,history)}
 let used=history.get(bank);if(!used){used=new Set();history.set(bank,used)}
 let pool=bank.filter(w=>!used.has(w[0])&&!e.seen.includes(w[0]));
 if(!pool.length){used.clear();pool=bank.filter(w=>!e.seen.includes(w[0]))}
 if(!pool.length)pool=bank;
 const word=pool[rand(0,pool.length-1)];used.add(word[0]);return word;
}
let englishSession=null;
function englishProgress(){
 const p=person();if(!p.english||typeof p.english!=='object')p.english={};
 const e=p.english;
 if(!Number.isInteger(e.level)||e.level<0||e.level>31)e.level=0;
 for(const k of ['strong','total','correct'])if(!Number.isSafeInteger(e[k])||e[k]<0)e[k]=0;
 return e;
}
function englishSay(text){
 if(data.noListening||!data.sound||!('speechSynthesis'in window))return;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.75;
 const voices=speechSynthesis.getVoices(),v=voices.find(v=>/^en-US$/i.test(v.lang))||voices.find(v=>/^en[-_]/i.test(v.lang));
 if(v)u.voice=v;speechSynthesis.speak(u);
}
function startEnglish(){
 subject='jp';session=null;view='quiz';
 const p=englishProgress(),bank=EN_WORDS[Math.floor(p.level/4)],count=p.level%4<2?2:3;
 englishSession={n:0,clean:0,help:false,done:false,rewarded:false,level:p.level,count,bank,seen:[]};
 enterQuizScreen();englishNext();
}
function englishNext(){
 const e=englishSession;if(!e||e.rewarded)return;
 if(e.n>=5){englishFinish();return}
 e.help=false;e.done=false;e.selected=null;
 const item=practiceSelection('en');e.level=item.course;e.count=e.level%4<2?2:3;practiceBegin(item);
 e.curriculumKind=null;e.answerAudio=null;e.extensionQuestion=null;e.readingAlternative=false;
 if(typeof buildCurriculumEnglish==='function'&&buildCurriculumEnglish(e,item))return;
 const bank=EN_WORDS[Math.floor(e.level/4)];
 let pool=bank.filter(w=>!e.seen.includes(w[0]));if(!pool.length)pool=bank;
 e.word=e.level<12?pickEnglishPicture(e,bank):pool[rand(0,pool.length-1)];e.seen.push(e.word[0]);
 const others=bank.filter(w=>e.level<12?englishPictureDistractor(e.word,w):w!==e.word).map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,e.count-1).map(x=>x.w);
 e.choices=[e.word,...others].map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.w);
 const reading=data.noListening===true||!data.sound||!('speechSynthesis'in window);
 e.readingAlternative=reading;
 const colorRequest=item.skill==='enDescribe' && item.index<4;
 if(e.n===1 && (item.skill==='enWords'||colorRequest) && typeof GardenWorkshop!=='undefined'){
  const card=item.skill==='enWords' && e.level>=8;
  const title=card?'ことばに あう えカードを わたそう。':e.level<4?'たのまれた どうぶつの カードを わたそう。':'たのまれた ものを わたそう。';
  GardenWorkshop.errand(e,card?'the '+e.word[0]+' card':e.word[0],title);
  return;
 }
 if(reading){
  e.curriculumKind=e.word[3]?'読んで返事をえらぶ':'読んで絵をえらぶ';
  app.innerHTML=`<section class="quiz"><div class="quiztop"><button class="sub" onclick="home()">⌂ にわへ</button><strong>🔤 えいご</strong><span>${e.n+1} / 5</span></div><div class="board"><div class="eyebrow">リスニングなし · 読む練習</div><h1 class="question">${e.word[3]?'ことばを よんで、へんじを えらぼう！':'えいごを よんで、えを えらぼう！'}</h1><p class="english-context">${esc(e.word[3]||e.word[0])}</p><div class="choices">${e.choices.map((w,i)=>`<button class="choice" style="font-size:54px;min-height:85px" aria-label="${esc(e.word[3]?w[0]:w[2])}" onclick="englishAnswer(${i},this)">${w[1]}${e.word[3]?`<span class="quiet-reply">${esc(w[0])}</span>`:''}</button>`).join('')}</div><div id="englishFeedback" class="feedback" role="status"></div><div class="actions"><button class="sub" id="englishHint" onclick="englishHint()">💡 ヒント</button><button class="primary hidden" id="englishNext" onclick="englishAdvance()">つぎへ →</button></div></div></section>`;
 }else{
 app.innerHTML=`<section class="quiz"><div class="quiztop"><button class="sub" onclick="home()">⌂ にわへ</button><strong>🔤 えいご</strong><span>${e.n+1} / 5</span></div><div class="board"><h1 class="question">${e.word[3]?'あう へんじを えらぼう！':'えいごを きいて、えを えらぼう！'}</h1>${e.level<12?`<p class="english-context" lang="en">${esc(e.word[0])}</p>`:''}<button class="primary" onclick="englishSay(englishSession.word[3]||englishSession.word[0])">🔊 もういちど きく</button><div class="choices">${e.choices.map((w,i)=>`<button class="choice" style="font-size:54px;min-height:85px" aria-label="${esc(w[2])}" onclick="${e.word[3]?`englishOptionPreview(${i})`:`englishAnswer(${i},this)`}">${w[1]}${e.word[3]?`<small style="display:block;font-size:14px">🔊 きく</small>`:''}</button>`).join('')}</div>${e.word[3]?'<button class="primary" id="confirmEnglish" disabled onclick="englishConfirm()">へんじを きいて えらぼう</button>':''}<div id="englishFeedback" class="feedback" role="status"></div><div class="actions"><button class="sub" id="englishHint" onclick="englishHint()">💡 ヒント</button><button class="primary hidden" id="englishNext" onclick="englishAdvance()">つぎへ →</button></div></div></section>`;
 englishSay(e.word[3]||e.word[0]);
 }

}
function englishHint(){
 const e=englishSession;if(view!=='quiz'||!e||e.done)return;e.help=true;
 document.querySelector('#englishFeedback').textContent='「'+e.word[2]+'」を さがしてね。';speak(e.word[2]+'という いみだよ');
}
function englishAnswer(i,button){
 const e=englishSession;if(view!=='quiz'||!e||e.done||!e.choices[i])return;
 if(e.choices[i][0]!==e.word[0]){button.disabled=true;englishHint();return}
 e.done=true;if(!e.help)e.clean++;
 const p=englishProgress();p.total++;if(!e.help)p.correct++;save();
 document.querySelectorAll('.choice').forEach(b=>b.disabled=true);button.classList.add('correct');
 document.querySelector('#englishHint').disabled=true;document.querySelector('#englishNext').classList.remove('hidden');
 document.querySelector('#englishFeedback').textContent='✨ '+e.word[0]+' ＝ '+e.word[2]+'！';
 englishSay((e.answerAudio||e.word[0])+'. Great!');
}
function englishAdvance(){if(!englishSession?.done)return;englishSession.n++;englishNext()}
function englishFinish(){
 const e=englishSession;if(!e||e.rewarded)return;e.rewarded=true;
 // Hidden per-skill practice state is updated on first attempts.
 const g=game(),d=dailyRecord(),reward=d['auto-en']?3:10;
 d['auto-en']=(Number.isSafeInteger(d['auto-en'])?d['auto-en']:0)+1;g.coins+=reward;person().flowers++;save();
 leaveQuizScreen();view='result';
 app.innerHTML=`<section class="panel center result-panel"><div class="big">🌷</div><h1>えいごで あそべたね！</h1><p>おはなが ひとつ さいたよ。</p><div class="reward"><strong>🪙 ${reward} コイン もらった！</strong></div><div class="actions"><button class="sub result-secondary" onclick="petRoom()">🌱 にわっちに あう</button><button class="sub result-secondary" onclick="home()">にわに もどる</button></div></section>`;
 speak('よく がんばったね。おはなが ひとつ さいたよ');
}

const AVATAR_OPTIONS={
 hair:[['bob','ボブ'],['short','ショート'],['long','ロング'],['twin','ツインテール'],['pony','ポニーテール'],['bun','おだんご'],['wave','ふわふわ'],['crop','ベリーショート']],
 face:[['smile','にっこり'],['happy','にこにこ'],['wink','ウインク'],['surprise','びっくり'],['sleepy','のんびり'],['spark','きらきら']],
 color:[['brown','ちゃいろ'],['black','くろ'],['gold','きんいろ'],['pink','ピンク'],['blue','あお'],['purple','むらさき'],['silver','ぎんいろ'],['red','あかちゃ']],
 skin:[['light','はだいろ 1'],['warm','はだいろ 2'],['deep','はだいろ 3']],
 outfit:[['driver','うんてんし',5],['conductor','しゃしょう',1],['everyday','おさんぽ',1],['flower','おはな',5],['star','ほしぞら',10],['royal','プリンセス',25],['rainbow','にじいろ',50],['sport','スポーツ',1],['marine','マリン',5],['berry','いちご',10],['forest','もりの たんけん',15],['magic','まほうつかい',30],['space','うちゅう',75],['angel','てんし',100]],
 accessory:[['railcap','せいぼう',5],['railbag','えきいんバッグ',1],['none','なし',1],['ribbon','リボン',5],['flower','おはなかざり',10],['crown','おうかん',25],['sparkle','きらきら',100],['bowblue','あおい リボン',1],['cat','ねこみみ',5],['bunny','うさみみ',10],['hat','むぎわら',15],['magic','まほうの ぼうし',30],['moon','おつきさま',50],['gem','ほうせき',75]]
};

// Wardrobe rewards use the existing growth level and never spend coins.
const AVATAR_EXTRA_OUTFITS=[
 ['sprout','わかば',1,'#9acb81','🌱','collar'],
 ['sunny','おひさま',2,'#f3c85e','☀','stripe'],
 ['cloud','あおぞら',3,'#9ecde5','☁','collar'],
 ['heart','ハート',4,'#e899ae','♡','dress'],
 ['railholiday','でんしゃの たび',5,'#6e94bc','🚂','jacket'],
 ['runner','かけっこ',10,'#edaa64','★','stripe'],
 ['sailor','みならい セーラー',15,'#e5f1fa','⚓','sailor'],
 ['flowerdress','はなびら ドレス',20,'#e9acc9','🌸','dress'],
 ['catshirt','ねこの パーカー',25,'#c6ac8f','🐱','collar'],
 ['ocean','うみの セーラー',30,'#67b9bc','🐬','sailor'],
 ['baker','パンやさん',35,'#e9c78c','🥐','apron'],
 ['berrydress','いちご ドレス',40,'#d67c93','🍓','dress'],
 ['raincoat','あめの おさんぽ',45,'#e6c85c','☂','jacket'],
 ['explorer','ぼうけん ジャケット',50,'#98af73','🧭','jacket'],
 ['sunflower','ひまわり ドレス',55,'#e8b74d','🌻','dress'],
 ['prince','おうじさま',60,'#7497cd','♛','royal'],
 ['mermaid','うみの たからもの',65,'#7ec7c3','🐚','dress'],
 ['wizardrobe','ほしの ローブ',70,'#8b78bd','★','royal'],
 ['festival','おまつり',75,'#7f9bc8','🌸','kimono'],
 ['moonpilot','つきの パイロット',80,'#b2bfd9','🌙','jacket'],
 ['snowdress','ゆきの ドレス',85,'#c4e4ed','❄','dress'],
 ['jeweldress','ほうせき ドレス',90,'#b29cd9','💎','royal'],
 ['auroradress','オーロラ ドレス',95,'#a6c6db','✦','aurora'],
 ['gardenroyal','にわの ロイヤル',100,'#e8d48d','🌼','royal']
].map(([id,name,level,color,motif,style])=>({id,name,level,color,motif,style}));
const AVATAR_EXTRA_ACCESSORIES=[
 ['leafpin','わかばピン',1,'leaf','#79af68'],
 ['bowyellow','きいろい リボン',2,'bow','#f3c653'],
 ['bowmint','ミントの リボン',3,'bow','#7acdb5'],
 ['heartpin','ハートピン',4,'heart','#e68da9'],
 ['railbow','でんしゃ リボン',5,'bow','#719bc9'],
 ['starclip','ほしの ヘアピン',10,'star','#e5bb53'],
 ['sailorbow','セーラー リボン',15,'bow','#587bad'],
 ['flowerband','おはなの カチューシャ',20,'flowers','#e99cb6'],
 ['pawpin','にくきゅう ピン',25,'paw','#caa282'],
 ['shellpin','かいがら ピン',30,'shell','#93d1cd'],
 ['chefhat','コックさん',35,'chef','#fff8e9'],
 ['berrybow','いちご リボン',40,'bow','#e1839b'],
 ['raindrop','しずくの ヘアピン',45,'drop','#7fbee4'],
 ['leafcrown','はっぱの かんむり',50,'laurel','#84b56d'],
 ['sunflowerpin','ひまわり ピン',55,'sunflower','#f0c45b'],
 ['tiara','きらめく ティアラ',60,'tiara','#bac9ed'],
 ['pearls','しんじゅの カチューシャ',65,'pearls','#fff2db'],
 ['witchbow','まほうの リボン',70,'bow','#ac88cd'],
 ['festivalflower','おまつりの はな',75,'flowers','#b6a4db'],
 ['planetpin','わくせい ピン',80,'planet','#ad9bd8'],
 ['snowcrown','ゆきの かんむり',85,'snow','#a9dce9'],
 ['jewelbow','ほうせき リボン',90,'bow','#88aedb'],
 ['auroracrown','オーロラの かんむり',95,'aurora','#a4d8d3'],
 ['royalcrown','にわの かんむり',100,'royal','#e2bd62']
].map(([id,name,level,kind,color])=>({id,name,level,kind,color}));
AVATAR_OPTIONS.outfit.push(...AVATAR_EXTRA_OUTFITS.map(o=>[o.id,o.name,o.level]));
AVATAR_OPTIONS.accessory.push(...AVATAR_EXTRA_ACCESSORIES.map(o=>[o.id,o.name,o.level]));
function avatarStar(x, y, size, color) {
 return `<path transform="translate(${x} ${y}) scale(${size/10})" d="M0-10 3-3 10-2 5 3 6 10 0 6-6 10-5 3-10-2-3-3Z" fill="${color}" stroke="#917453" stroke-width="1" stroke-linejoin="round"/>`;
}

function avatarJewel(x, y, size, color) {
 return `<g transform="translate(${x} ${y}) scale(${size/10})" stroke-linejoin="round">
  <path d="M-11-3-6-9H6L11-3 0 10Z" fill="${color}" stroke="#676582" stroke-width="1.5"/>
  <path d="M-11-3 0 10-4-3ZM4-3 0 10 11-3Z" fill="#3c567c" opacity=".28"/>
  <path d="M-4-3 0-8 4-3ZM-9-3-5-7H-2L-5-3Z" fill="#fff" opacity=".85"/>
 </g>`;
}

function avatarRibbon(color, id) {
 // The two notched tails hang below the loops. The accessory sits against the hair at the temple.
 const accent = {
  railbow:'<path d="M-27-8-22-7M15-10 22-13M4 16 10 16" fill="none" stroke="#ffe29b" stroke-width="3"/>',
  sailorbow:'<path d="M-27-7Q-16-5-9 1M11-5Q15-10 22-11M8 16 14 13" fill="none" stroke="#fff9e9" stroke-width="2.7"/>',
  berrybow:'<g fill="#ffe4aa"><ellipse cx="-20" cy="1" rx="1.2" ry="2"/><ellipse cx="-13" cy="-4" rx="1.2" ry="2"/><ellipse cx="15" cy="-2" rx="1.2" ry="2"/><ellipse cx="20" cy="-9" rx="1.2" ry="2"/></g>',
  witchbow:avatarStar(17,-7,4,'#ffd878'),
  jewelbow:avatarJewel(0,0,6,'#a3dff3')
 }[id] || '';
 return `<g data-decoration="ribbon" transform="translate(112 36) rotate(10)" stroke="#514758" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
  <path d="M-4 0Q-10 12-19 21L-12 20-11 26Q-2 18 3 4M1 3Q10 12 13 27L16 21 23 22Q20 8 6-2Z" fill="${color}"/>
  <path d="M-4 1Q-8 11-16 21M4 2Q14 9 18 20" fill="none" stroke="#364564" stroke-opacity=".35" stroke-width="2.6"/>
  <path d="M-2-4C-10-7-18-15-26-13Q-32-10-30 5Q-29 15-19 12L-2 4ZM3-4Q13-16 22-17Q29-16 30-2Q31 9 23 10Q12 8 3 4Z" fill="${color}"/>
  <path d="M-28 6Q-25 12-16 8L-3 2Q-17 4-24 3ZM5 1Q16-4 25-5Q30 4 23 6Q14 5 5 1Z" fill="#344866" opacity=".28" stroke="none"/>
  <path d="M-26-8Q-18-9-10-3M13-8Q18-13 22-13" fill="none" stroke="#fff" stroke-opacity=".78" stroke-width="2.4"/>
  <path d="M-4-6Q0-8 4-6L6 3Q4 8-3 7L-6 1Z" fill="${color}"/><path d="M-2-4 0 2" fill="none" stroke="#fff" stroke-opacity=".7"/>
  ${accent}
 </g>`;
}

function avatarFlower(x, y, radius, color, center, petals = 5) {
 const petal = Array.from({length:petals}, (_,i) =>
  `<ellipse cy="-6.8" rx="${petals > 5 ? 3.3 : 5.4}" ry="7.6" transform="rotate(${i*360/petals})"/>`).join('');
 return `<g transform="translate(${x} ${y}) scale(${radius/14.4})" fill="${color}" stroke="#926b66" stroke-width="1">
  ${petal}<circle r="4.7" fill="${center}"/><circle cx="-1.4" cy="-1.5" r="1.3" fill="#fff7d5" stroke="none"/>
 </g>`;
}

function avatarHeadband(color) {
 const arc='M48 63C48 8 130 1 132 62';
 return `<path d="${arc}" fill="none" stroke="#68594e" stroke-width="7" stroke-linecap="round"/><path d="${arc}" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round"/>`;
}

function avatarDecoration(o) {
 const c=o.color;
 let shape;
 switch(o.kind) {
 case 'bow': return avatarRibbon(c, o.id);
 case 'leaf':
  shape=`<path d="M104 43Q108 34 119 28M104 43 126 37" fill="none" stroke="#a07a52" stroke-width="4"/><path d="M108 37Q100 11 131 15Q130 36 108 37Z" fill="${c}" stroke="#48794d" stroke-width="2"/><path d="M109 36 126 20M116 29V23M120 25 125 25" fill="none" stroke="#edf3c8" stroke-width="2"/>`;break;
 case 'heart':
  shape=`<path d="m107 43 24-10" stroke="#ae854c" stroke-width="5"/><path d="M119 40Q96 29 100 18Q105 7 116 17Q124 5 133 12Q144 20 119 40Z" fill="${c}" stroke="#a85672" stroke-width="2"/><path d="M104 21Q104 16 109 16" fill="none" stroke="#ffebdd" stroke-width="3.2"/>`;break;
 case 'star':
  shape='<path d="m101 43 28-8" stroke="#927b63" stroke-width="5"/>'+avatarStar(120,28,16,c)+'<path d="m119 18-2 7-6 2" fill="none" stroke="#fff6bd" stroke-width="2"/>';break;
 case 'flowers':
  shape=avatarHeadband('#90ae80');
  if(o.id==='festivalflower') {
   shape+='<path d="M124 31q6 16 9 24m-14-24q2 17 4 24" fill="none" stroke="#bf895e" stroke-width="2"/><circle cx="133" cy="55" r="3" fill="#eecc8c"/><circle cx="123" cy="55" r="3" fill="#eecc8c"/>'+avatarFlower(125,32,12,'#e9b8cd','#f6d576')+avatarFlower(114,24,15,c,'#f3ce79');
  } else {
   shape+=avatarFlower(64,32,11,c,'#f3ce79')+avatarFlower(88,21,12,'#fff4da','#eab657')+avatarFlower(114,27,11,c,'#f3ce79');
  }
  break;
 case 'sunflower':
  shape='<path d="M110 43q-13-1-14-12 13 0 16 8m9-2q10 0 14-10-12-1-16 7" fill="#83a565" stroke="#678052"/>'
   +avatarFlower(118,29,19,c,'#835538',10);break;
 case 'paw':
  shape=`<g fill="${c}" stroke="#815f52" stroke-width="1.8" transform="rotate(-12 120 29)"><path d="M117 25Q121 20 125 25L132 34Q134 42 125 39Q121 37 117 39Q107 42 109 34Z"/><ellipse cx="107" cy="22" rx="4" ry="6"/><ellipse cx="116" cy="15" rx="4" ry="6"/><ellipse cx="126" cy="15" rx="4" ry="6"/><ellipse cx="135" cy="22" rx="4" ry="6"/></g>`;break;
 case 'shell':
  shape=`<path d="M114 41Q88 23 100 17Q100 9 110 12Q117 2 123 10Q135 5 134 16Q147 19 124 40Z" fill="${c}" stroke="#527d85" stroke-width="2"/><path d="M116 36 103 20M118 35 113 15M121 35 122 13M123 36 132 20" fill="none" stroke="#eaffeb" stroke-width="2"/><path d="M112 39Q119 36 126 39L124 43H114Z" fill="#e2ede2" stroke="#527d85"/>`;break;
 case 'chef':
  shape=`<path d="M59 30C38 26 44 6 62 9Q71-2 84 7Q103-4 113 9Q136 3 137 19Q136 28 124 31L121 45Q90 40 61 46Z" fill="${c}" stroke="#a39489" stroke-width="2.4"/><path d="M60 32Q91 26 124 31M69 13q-4 5-2 9m45-9q6 3 5 9" fill="none" stroke="#dbd0b9" stroke-width="2.7"/>`;break;
 case 'drop':
  shape=`<path d="m104 42 25-7" stroke="#968273" stroke-width="4"/><path d="M120 8Q94 36 115 43Q133 49 136 32Q137 23 120 8Z" fill="${c}" stroke="#537eaa" stroke-width="2"/><path d="M114 22Q106 34 115 37" fill="none" stroke="#edfcff" stroke-width="3"/>`;break;
 case 'laurel':
  shape=avatarHeadband('#b3c682')+[[54,44,-42],[62,32,-32],[74,23,-17],[103,22,17],[115,30,32],[126,43,42]].map(([x,y,angle])=>
   `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 9Q-12-2-4-14Q6-10 0 9Z" fill="${c}" stroke="#55774d" stroke-width="1.5"/><path d="M0 6-3-7" stroke="#cee8a8"/></g>`).join('');break;
 case 'pearls':
  shape=avatarHeadband('#e2d4c3')+[[51,48],[58,36],[71,26],[87,21],[103,22],[117,29],[127,40]].map(([x,y])=>
   `<g transform="translate(${x} ${y})"><circle r="6.5" fill="${c}" stroke="#a69a96" stroke-width="1.5"/><circle cx="-2" cy="-2" r="2.1" fill="#fff"/></g>`).join('');break;
 case 'planet':
  shape=`<circle cx="119" cy="28" r="15" fill="${c}" stroke="#76659d" stroke-width="2"/><path d="M113 19q5-4 10-2" fill="none" stroke="#e9d5f2" stroke-width="3"/><path d="M130 20q13-7 13-3c3 6-33 25-45 24q-8-1 6-12" fill="none" stroke="#936c52" stroke-width="5"/><path d="M130 20q13-7 13-3c3 6-33 25-45 24q-8-1 6-12" fill="none" stroke="#f4d790" stroke-width="2.5"/>`;break;
 case 'snow':
  shape=avatarHeadband(c)+[[65,32,9],[90,20,12],[115,29,9]].map(([x,y,r])=>`<g transform="translate(${x} ${y}) scale(${r/11})" fill="none" stroke="#678ea3" stroke-width="2.7">${[0,60,120].map(angle=>`<path transform="rotate(${angle})" d="M0-11V11M-4-7 0-4 4-7M-4 7 0 4 4 7"/>`).join('')}<circle r="2" fill="#f6fbff"/></g>`).join('');break;
 case 'tiara':
  shape=`<path d="M53 40Q48 20 64 25Q74 35 79 23Q90-4 100 23Q106 35 116 25Q132 17 127 40Q90 32 53 40Z" fill="none" stroke="#79748f" stroke-width="4.5"/><path d="M53 40Q48 20 64 25Q74 35 79 23Q90-4 100 23Q106 35 116 25Q132 17 127 40Q90 32 53 40Z" fill="none" stroke="${c}" stroke-width="2.6"/>`+avatarJewel(90,23,7,'#d5bcf0');break;
 case 'aurora':
  shape=`<path d="M54 44 51 15 70 30 83 8 94 25 114 5 111 27 132 17 125 43Q91 36 54 44Z" fill="${c}" stroke="#688d9c" stroke-width="2"/><path d="m54 20 15 12-8 7Zm30-8-7 21 12-6Zm26 0-13 17 9-1Z" fill="#c4b8ed"/><path d="M57 39Q92 31 123 38" fill="none" stroke="#f8e1b5" stroke-width="3"/>`+avatarJewel(93,34,5,'#dfb7e4');break;
 case 'royal':
  shape=`<path d="M54 40 50 16 72 28 90 5 107 28 130 16 125 40Q90 32 54 40Z" fill="${c}" stroke="#9c794c" stroke-width="2"/><path d="M58 35Q90 29 123 35" fill="none" stroke="#fff1c1" stroke-width="2.8"/>`+avatarFlower(90,25,8,'#fff0c6','#cf925b')+avatarJewel(65,32,3,'#b5d8a9')+avatarJewel(115,32,3,'#b5d8a9');break;
 }
 return `<g data-decoration="${o.kind}" stroke-linejoin="round" stroke-linecap="round">${shape}</g>`;
}
const AVATAR_BASE_OUTFITS={
 everyday:['#80b9a9','overalls'], driver:['#284b77','uniform'], conductor:['#478184','uniform'],
 flower:['#e9a8b7','dress'], star:['#809bcd','stripe'], royal:['#ae97d2','royal'],
 rainbow:['#e9adc8','aurora'], sport:['#e79b64','stripe'], marine:['#78afc6','sailor'],
 berry:['#d38394','dress'], forest:['#86a578','jacket'], magic:['#8f7ab6','royal'],
 space:['#788ca9','jacket'], angel:['#d3cbe9','dress']
};
const AVATAR_OUTFIT_TRIMS={
 collar:'<path d="M77 122q-6 9 5 13l8-7 8 7q11-4 5-13l-13 3Z" fill="#fff2d9"/>',
 stripe:'<path d="M67 142h46m-47 8h48" stroke="#fff4d7" stroke-width="4"/><path d="M74 122q16 15 32 0" stroke="#fff0d0" stroke-width="3" fill="none"/>',
 dress:'<path d="M75 122q2 11 15 12 13-1 15-12l-15 4Z" fill="#fff5e2"/><path d="M67 149q23 4 46 0" fill="none" stroke="#fff0d9" stroke-width="3"/><path d="m75 154-5 13m35-13 5 13" fill="none" stroke="#714d64" opacity=".25" stroke-width="1.6"/>',
 sailor:'<path d="M72 122l18 13 18-13 5 6-23 16-23-16Z" fill="#fff6df"/><path d="m73 128 17 12 17-12" fill="none" stroke="#577f95" stroke-width="1.7"/><path d="m87 138 5-1 4 10-6 6-4-5Z" fill="#bc7476"/>',
 jacket:'<path d="m77 122 13 7-10 10-6-10Zm26 0-13 7 10 10 6-10Z" fill="#fff1cb"/><path d="M90 132v37m-21-21h12v7q-7 5-12 0Zm30 0h12v7q-6 5-12 0Z" fill="none" stroke="#faf1d4" stroke-width="2"/>',
 uniform:'<path d="m76 122 14 6 14-6-3 12-11 7-12-7Z" fill="#fff1d5"/><path d="m88 127 4 0 2 9-4 5-4-5Z" fill="#c87d69"/><path d="m72 125 13 17-7-1-9-12m39-4-13 17 7-1 9-12" fill="#fff" opacity=".23"/><path d="M104 145h8" stroke="#f7ce78" stroke-width="3"/><g fill="#f7ce78"><circle cx="87" cy="151" r="1.8"/><circle cx="94" cy="151" r="1.8"/><circle cx="87" cy="161" r="1.8"/><circle cx="94" cy="161" r="1.8"/></g>',
 apron:'<path d="m76 122 5 1 2 12h14l2-12 5-1-1 13 9 36q-22 6-44 0l9-36Z" fill="#fff5df"/><path d="M81 150h18v7q-9 8-18 0Z" fill="#e7c9a6" stroke="#ba967d" stroke-width="1.4"/>',
 overalls:'<path d="m73 122 6 0 2 15h18l2-15h6l-2 22 7 24q-22 6-44 0l7-24Z" fill="#568e80"/><path d="M82 145h16v8q-8 7-16 0Z" fill="#82b5a0" stroke="#427568" stroke-width="1.4"/><path d="m79 165 1-5m20 5-1-5" stroke="#a3c8b0" stroke-width="1.5"/><g fill="#f7da9d"><circle cx="78" cy="138" r="2.4"/><circle cx="102" cy="138" r="2.4"/></g>',
 royal:'<path d="m73 123 17 9 17-9-2 7-15 12-15-12Z" fill="#f8dfa1"/><path d="m88 135 3-2 3 3-3 4Z" fill="#bd879a"/><path d="M66 168q24 7 48 0" fill="none" stroke="#fbe4ad" stroke-width="3"/>',
 kimono:'<path d="m74 123 28 27m5-27-29 29" fill="none" stroke="#fcf0d1" stroke-width="5"/><path d="M67 150q23 4 46 0v10q-23 4-46 0Z" fill="#d5899e"/><path d="M68 155q22 4 44 0" stroke="#f4ce9e" fill="none" stroke-width="2"/>',
 aurora:'<path d="M74 123q16 10 32 0l-4 9q-12 7-24 0Z" fill="#fff4db"/><path d="m76 153-7 15m15-16-3 19m15-19 3 19m5-18 7 15" fill="none" stroke-width="5" stroke="#f7dbca"/><path d="m81 154-5 16m23-16 5 16" fill="none" stroke-width="4" stroke="#ade0cb"/>'
};
function avatarOutfitDetails(style,id){
 let embroidery='';
 if(['sprout','forest','gardenroyal'].includes(id))embroidery='<g transform="translate(90 155)"><path d="M0 7V0q-7 0-8-7Q0-7 0 0q2-8 9-7Q8-1 1 1" fill="#476f59" stroke="#f9e9bd" stroke-width="1.4"/></g>';
 if(['flower','flowerdress','sunflower','berrydress','berry'].includes(id))embroidery='<g transform="translate(91 160)" fill="#fff3dc"><circle cy="-3" r="3.4"/><circle cx="3" cy="-1" r="3.4"/><circle cx="2" cy="3" r="3.4"/><circle cx="-2" cy="3" r="3.4"/><circle cx="-3" cy="-1" r="3.4"/><circle r="2.3" fill="#d89b58"/></g>';
 if(['star','magic','wizardrobe','moonpilot','space','jeweldress','snowdress'].includes(id))embroidery='<path d="m91 151 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff1b7"/>';
 if(id==='heart')embroidery='<path d="M90 165q-13-8-7-12 4-3 7 2 4-5 7-2 6 5-7 12Z" fill="#b96781"/>';
 return AVATAR_OUTFIT_TRIMS[style]+embroidery;
}
function avatarGarment(id){
 const extra=AVATAR_EXTRA_OUTFITS.find(o=>o.id===id);
 const [color,style]=extra?[extra.color,extra.style]:AVATAR_BASE_OUTFITS[id];
 const flared=['dress','royal','aurora','kimono'].includes(style);
 const hem=flared?'M75 121q15 6 30 0 4 10 5 19l13 31q-33 12-66 0l13-31q1-9 5-19Z':'M75 121q15 6 30 0l7 18 4 30q-26 8-52 0l4-30Z';
 return `<g data-outfit="${id}" stroke-linejoin="round" stroke-linecap="round">
 <path d="M74 122q-12 1-17 13l-7 13 13 7 14-23Zm32 0q12 1 17 13l7 13-13 7-14-23Z" fill="${color}" stroke="#635952" stroke-width="1.8"/>
 <path d="m53 146 12 6m50 0 12-6" fill="none" stroke="#fff3da" stroke-width="3"/>
 <path d="${hem}" fill="${color}" stroke="#635952" stroke-width="1.9"/>
 <path d="M67 167q23 6 46 0" fill="none" stroke="#574c4c" stroke-opacity=".18" stroke-width="2"/>
 ${avatarOutfitDetails(style,id)}</g>`;
}
function avatarAccessoryArt(id, hair = '#634235') {
 if(id==='none')return '';
 if(id==='bowblue')return avatarRibbon('#68afe8',id);
 if(id==='ribbon')return avatarRibbon('#e58ba8',id);
 const extra=AVATAR_EXTRA_ACCESSORIES.find(o=>o.id===id);
 if(extra)return avatarDecoration(extra);

 let art;
 switch(id) {
 case 'railcap':
  art='<path d="M48 33Q48 18 60 16L80 9Q90 4 101 10L123 15Q137 18 132 34L124 40H57Z" fill="#436386" stroke="#35455e" stroke-width="2.3"/><path d="M51 30Q90 19 130 30L127 38Q90 29 54 39Z" fill="#253c5a"/><path d="M55 36Q90 27 126 36Q114 51 92 48Q75 44 55 41Z" fill="#283d53" stroke="#273347" stroke-width="2"/><path d="M54 33Q90 23 128 33" fill="none" stroke="#f0c876" stroke-width="2"/><path d="M85 18 90 15 95 18 94 24 90 27 86 24Z" fill="#f9d786" stroke="#a67c42"/>';break;
 case 'railbag':
  art='<path d="M65 125Q85 148 115 165" fill="none" stroke="#614b43" stroke-width="7"/><path d="M65 125Q85 148 115 165" fill="none" stroke="#b98860" stroke-width="3.5"/><g transform="rotate(-7 121 170)"><path d="M108 158v-3q8-10 17-1v4" fill="none" stroke="#805b49" stroke-width="3.5"/><rect x="100" y="156" width="34" height="27" rx="5" fill="#aa7853" stroke="#715143" stroke-width="2"/><path d="M100 158q16-4 34 0v7q-16 8-34 0Z" fill="#c99967" stroke="#795747" stroke-width="1.7"/><rect x="115" y="163" width="6" height="8" rx="1.4" fill="#f8d582" stroke="#866b47"/><path d="M104 177q13 3 25 0" fill="none" stroke="#ebc794" stroke-width="1.5" stroke-dasharray="2 3"/></g>';break;
 case 'cat':
  art=avatarHeadband('#876a7c')+`<path d="M51 43Q45 27 50 7Q64 14 76 29M103 29Q117 13 130 7Q136 28 127 43" fill="${hair}" stroke="#564951" stroke-width="2.6"/><path d="M54 33Q52 25 54 17L66 29ZM114 28 126 16Q129 27 125 33Z" fill="#e8a5a3"/>`;break;
 case 'bunny':
  art=avatarHeadband('#ebc0c1')+'<path d="M61 34C45 22 45 4 53 3Q66 2 76 27ZM104 26C106 8 116 0 123 3Q138 10 117 34Z" fill="#fff2e8" stroke="#967f84" stroke-width="2.2"/><path d="M55 10Q56 20 67 29M121 10Q116 14 111 27" fill="none" stroke="#eaa8b7" stroke-width="4.8"/>';break;
 case 'magic':
  art='<path d="M56 37Q71 25 79 12Q88-2 101 4L110 9 100 12Q104 23 119 35Z" fill="#8b78ae" stroke="#5a547d" stroke-width="2.5"/><path d="M68 30Q88 35 109 26L117 34Q91 43 61 35Z" fill="#ecc47c"/><path d="M46 34Q67 37 90 32Q111 25 135 31Q141 35 123 41Q99 48 75 45Q48 44 45 38Z" fill="#796795" stroke="#564e72" stroke-width="2"/>'
   +avatarStar(90,18,5,'#f9db91');break;
 case 'hat':
  art='<path d="M57 37Q59 9 77 8Q89 13 104 8Q122 9 125 36Z" fill="#ebc584" stroke="#a67e57" stroke-width="2.4"/><path d="M57 29Q88 36 124 27L126 36Q91 47 56 38Z" fill="#bf7e78"/><path d="M39 36Q54 37 71 35Q103 29 136 31Q148 32 139 39Q121 49 86 48Q50 49 38 42Q34 40 39 36Z" fill="#edce91" stroke="#a67e57" stroke-width="2.4"/><path d="M43 40Q72 46 108 41M66 17q11-3 17 0" fill="none" stroke="#fff1bc" stroke-width="2.5"/>'
   +avatarFlower(119,31,7,'#f6e1b3','#b17f55');break;
 case 'flower':
  art='<path d="M110 41q-12-2-14-12 12-1 18 8m5-8q3-12 15-14-1 13-11 17" fill="#85ad7c" stroke="#627d57" stroke-width="1.6"/>'+avatarFlower(118,30,16,'#e9a2b7','#f9d077');break;
 case 'moon':
  art='<path d="M125 11C110 10 99 22 103 34C109 51 129 49 137 35C126 39 115 34 115 25Q116 16 125 11Z" fill="#f6d17c" stroke="#a57b4d" stroke-width="2.2"/><path d="M106 31q1 8 8 10" fill="none" stroke="#fff0b3" stroke-width="2.2"/>'
   +avatarStar(132,22,6,'#fff0aa');break;
 case 'gem':
  art='<path d="m103 43 30-10" fill="none" stroke="#9a7e70" stroke-width="4"/>'+avatarJewel(119,29,16,'#86cbe4');break;
 case 'crown':
  art='<path d="m54 18 19 10L90 7l17 21 19-12-6 25q-30-5-60 0Z" fill="#eabc62" stroke="#9b744c" stroke-width="2.5"/><g fill="#fff0ac" stroke="#a78353"><circle cx="54" cy="17" r="3.2"/><circle cx="90" cy="7" r="3.2"/><circle cx="126" cy="16" r="3.2"/></g><path d="M62 36q28-5 56 0" fill="none" stroke="#fff0bf" stroke-width="2.5"/>'
   +avatarJewel(90,28,6,'#d9899c');break;
 case 'sparkle':
  art='<g fill="#f4cd77" stroke="#a7805c" stroke-width="1.6"><path d="M121 12q2 12 13 15-11 3-13 16-2-13-14-16 12-3 14-15Z"/><path d="M103 18q1 6 7 8-6 2-7 8-1-6-7-8 6-2 7-8Z" fill="#ebbfce"/><path d="M136 31q1 5 6 6-5 2-6 7-1-5-6-7 5-1 6-6Z" fill="#e3d8f1"/></g>';break;
 default: return '';
 }
 return `<g data-decoration="${id}" stroke-linejoin="round" stroke-linecap="round">${art}</g>`;
}

function avatarOptionIcon(key, id, a = avatarState()) {
 let frame, art;
 const hair=AVATAR_HAIR_COLORS[a.color], skin=AVATAR_SKIN_COLORS[a.skin];
 switch(key) {
 case 'accessory': {
  const kind=AVATAR_EXTRA_ACCESSORIES.find(o=>o.id===id)?.kind || id;
  const smallPins=['leaf','heart','star','sunflower','paw','shell','drop','planet','flower','moon','gem','sparkle'];
  frame=smallPins.includes(kind)?'90 3 58 52':'32 -3 116 69';
  if(['ribbon','bowblue','bow'].includes(kind))frame='74 11 78 59';
  if(id==='railbag')frame='58 119 82 71';
  art=avatarAccessoryArt(id,hair);
  if(id==='none'){
   frame='0 0 70 50';
   art='<circle cx="35" cy="25" r="15" fill="#faf6e9" stroke="#abac91" stroke-width="1.8" stroke-dasharray="3 3"/><path d="M28 25H42" stroke="#7c826c" stroke-width="2.5" stroke-linecap="round"/>';
  }
  break;
 }
 case 'outfit': frame='44 115 92 68';art=avatarGarment(id);break;
 case 'hair': frame='13 5 154 144';art=avatarHead(id,a.face,hair,skin);break;
 case 'face': frame='42 48 96 81';art=avatarHead(a.hair,id,hair,skin);break;
 case 'color':
  frame='0 0 66 46';
  art=`<path d="M14 31C14 12 33 7 53 8Q44 13 44 21Q43 36 21 39L25 31Q21 33 14 33Z" fill="${AVATAR_HAIR_COLORS[id]}" stroke="#64534f" stroke-width="1.7"/><path d="M21 29Q26 17 41 13" fill="none" stroke="#fff" opacity=".4" stroke-width="2" stroke-linecap="round"/>`;break;
 case 'skin':
  frame='0 0 66 46';
  art=`<circle cx="33" cy="23" r="15.5" fill="${AVATAR_SKIN_COLORS[id]}" stroke="#956d58" stroke-width="1.5"/>`;break;
 default:return '';
 }
 return `<svg class="avatar-option-icon" viewBox="${frame}" aria-hidden="true" focusable="false">${art}</svg>`;
}
function avatarNextUnlock(a){
 const level=mainPetLevel(),all=['outfit','accessory'].flatMap(key=>AVATAR_OPTIONS[key].map(([id,name,at=1])=>({key,id,name,at})));
 const next=Math.min(...all.filter(o=>o.at>level).map(o=>o.at)),items=all.filter(o=>o.at===next),count=all.filter(o=>o.at<=level&&o.id!=='none').length;
 if(!items.length)return '<p class="avatar-unlocks">すべての きせかえが つかえるよ！</p>';
 return `<details class="avatar-unlocks"><summary>つぎは <b>Lv.${next}</b> で きせかえが ${items.length}こ ふえるよ</summary><p>いま つかえる きせかえは ${count}こ。コインは つかわないよ。</p><div class="avatar-next-items">${items.map(o=>'<span>'+avatarOptionIcon(o.key,o.id,a)+esc(o.name)+'</span>').join('')}</div></details>`;
}

function avatarState(p=person()){
 if(!p.avatar||typeof p.avatar!=='object'||Array.isArray(p.avatar))p.avatar={};
 const avatarLevel=1+Math.floor((Number.isSafeInteger(p.game?.growth)&&p.game.growth>=0?p.game.growth:0)/3);
 for(const [k,opts] of Object.entries(AVATAR_OPTIONS))if(!opts.some(o=>o[0]===p.avatar[k]&&(o[2]||1)<=avatarLevel))p.avatar[k]=k==='outfit'?'everyday':k==='accessory'?'none':opts[0][0];
 return p.avatar;
}
const AVATAR_HAIR_COLORS={brown:'#735141',black:'#45414b',gold:'#d4a75b',pink:'#c78399',blue:'#6687a6',purple:'#9981aa',silver:'#a7a9b4',red:'#a96651'};
const AVATAR_SKIN_COLORS={light:'#ffddbc',warm:'#dfaa80',deep:'#ae795d'};
const AVATAR_HAIR_BACK={
 bob:'M48 64q0-39 43-41 40 0 44 40l1 37q1 9 5 14-16 13-32 5H68q-15 5-27-6 6-10 7-49Z',
 long:'M47 62q0-39 43-40 42 0 44 40-1 42 10 76-12 12-27 7l-6-6q-23 12-45 1l-7 6q-16 4-25-7 13-41 13-77Z',
 twin:'M53 56q-23-12-29 14-1 12 1 23 2 14-8 25 16 4 26-11 8-14 8-30Zm74 0q23-12 29 14 1 12-1 23-2 14 8 25-16 4-26-11-8-14-8-30Z',
 pony:'M111 49q7-26 29-19 19 6 13 34-7 32 6 45-26 1-31-23-3-15-2-24Z',
 bun:'M53 55c-18-1-24-17-16-31 7-13 23-16 34-7 12 11 7 29-2 35Zm74 0c18-1 24-17 16-31-7-13-23-16-34-7-12 11-7 29 2 35Z',
 wave:'M46 63q-2-41 44-42 44-1 46 42 15 16 4 32 16 16 1 31 4 15-11 19-12 5-22-3-15 10-36 0-14 8-24-1-17 2-18-15-12-16 2-29-10-15 14-34Z'
};
const AVATAR_HAIR_FRINGE={
 bob:'M46 77q-1-51 34-55 33-9 47 15 13 18 7 51l-7 14-5-40q-21 4-33-7l1 6q-15-1-25-10-7 14-8 48l-9-11Z',
 short:'M48 79Q36 49 53 33q14-14 32-14l-1-5q12 0 21 8 24-2 31 25 3 13-5 31l-8-19-13-12q-5 10-22 15l5-12q-9 11-25 13l3-9q-10 7-17 29Z',
 crop:'M47 71q-6-21 10-36l-7 2q11-19 31-17l-2-6q12-1 21 7 19-1 26 13l5-4q9 20 1 41l-8-13-6-12-8 7-11-10-13 9-4-7-13 10-3-5Z',
 long:'M47 78q-4-28 11-45 13-14 34-13 39-1 43 40l-1 39-10-9-4-38q-8 12-22 13l4-10q-12 8-28 6l6-10q-17 4-24 30l-5 14Z',
 twin:'M47 78q-4-28 12-45 13-14 34-13 38 0 42 40l-4 26-10-32q-15 7-29 3l2 5q-12 0-23-13-6 12-15 18l-5 17Z',
 pony:'M48 80q-4-32 14-49 16-14 39-9 36 7 34 46l-5 15-10-36q-10 13-26 17l7-12q-16 13-33 13l5-11q-12 7-19 29Z',
 bun:'M48 79q-4-33 15-49 15-13 37-8 34 4 35 45l-6 17-9-32q-11 7-23 7l-11-11-5 10q-7 1-16-4l-9 27-4 6Z',
 wave:'M46 79q-7-30 9-45 9-9 22-10 13-11 33-2 29 4 28 36l-5 25-11-13q3-12-6-18-3 11-17 13l2-8q-13 8-25 0-15-10-17 8l-6 16Z'
};
function avatarHairBack(style,color){
 const shape=AVATAR_HAIR_BACK[style];
 if(!shape)return '';
 const lines={
  bob:'M52 82q0 18-4 28m79-25q1 16 6 24',long:'M51 88q-1 30-7 47m87-41q1 25 6 40',
  twin:'M40 66q-8 4-7 18t-4 18m111-36q8 4 7 18t4 18',pony:'M135 40q13 1 10 17t0 33',
  bun:'M42 37q-1-13 12-16m73 0q10 3 11 13',wave:'M44 84q-4 7 1 14t-4 16m98-33q3 10-2 16t3 15'
 };
 return `<g stroke-linecap="round" stroke-linejoin="round"><path d="${shape}" fill="${color}" stroke="#584c4b" stroke-width="1.9"/><path d="${lines[style]}" fill="none" stroke="#fff2cf" stroke-opacity=".28" stroke-width="3"/></g>`;
}
function avatarExpression(face){
 const openEye=x=>`<ellipse cx="${x}" cy="81" rx="4.6" ry="6.1"/><circle cx="${x-1.1}" cy="78.7" r="1.65" fill="#fff7df"/>`;
 const wink='<path d="M102 81q5-5 11-1" fill="none" stroke="#4c4041" stroke-width="3.3" stroke-linecap="round"/>';
 const smiles={happy:'M82 97q8 3 16 0-2 13-11 9-4-2-5-9Z',surprise:'M95 100q0 5-5 5t-5-5q0-4 5-4t5 4Z'};
 let eyes;
 switch(face){
 case 'happy':eyes='<path d="M66 82q6-9 12 0m24 0q6-9 12 0" fill="none" stroke="#4c4041" stroke-width="3.7"/>';break;
 case 'sleepy':eyes='<path d="M66 81q6 6 12 0m24 0q6 6 12 0" fill="none" stroke="#4c4041" stroke-width="3.2"/>';break;
 case 'wink':eyes=openEye(72)+wink;break;
 case 'spark':eyes=[72,108].map(x=>`<ellipse cx="${x}" cy="81" rx="5.7" ry="7"/><path d="m${x} 75 1.2 3.8 3.4 1.3-3.4 1.3-1.2 3.7-1.1-3.7-3.4-1.3 3.4-1.3Z" fill="#ffedb4"/>`).join('');break;
 case 'surprise':eyes='<g stroke="#594846" stroke-width="1.4" fill="#fff7e7"><ellipse cx="72" cy="80" rx="6.7" ry="8"/><ellipse cx="108" cy="80" rx="6.7" ry="8"/></g>'+openEye(72)+openEye(108);break;
 default:eyes=openEye(72)+openEye(108);
 }
 const mouth=smiles[face]?`<path d="${smiles[face]}" fill="#ae706e" stroke="#956563" stroke-width="1.5"/>`:'<path d="M82 98q8 8 16-1" fill="none" stroke="#a66b68" stroke-width="2.7"/>';
 return `<g fill="#4c4041" stroke-linecap="round">${eyes}<path d="M66 71q4-3 9-2m30 0q5-1 9 2" stroke="#705447" stroke-opacity=".6" stroke-width="1.8" fill="none"/><path d="M89 88q-1 2 2 2" fill="none" stroke="#ac785f" stroke-width="1.5"/>${mouth}</g>`;
}
function avatarHead(hairId,faceId,hairColor,skinColor,includeBack=true){
 return `${includeBack?avatarHairBack(hairId,hairColor):''}<g stroke-linejoin="round" stroke-linecap="round">
 <path d="M56 75q-12-6-12 5 0 10 13 13m66-18q12-6 12 5 0 10-13 13" fill="${skinColor}" stroke="#a77b68" stroke-width="1.8"/>
 <path d="M90 33c23 0 39 15 40 41 1 22-11 40-29 46q-11 4-22 0c-18-6-31-23-30-44 1-26 16-43 41-43Z" fill="${skinColor}" stroke="#9c7766" stroke-width="2"/>
 <path d="M54 75q-2 15 7 27 4 8 17 14-17-4-23-17-4-8-4-18Z" fill="#a86d5c" opacity=".13"/>
 <path d="${AVATAR_HAIR_FRINGE[hairId]}" fill="${hairColor}" stroke="#584c4b" stroke-width="2.1"/>
 <path d="M59 47q7-12 22-16m6-1 5-1" fill="none" stroke="#fff0cf" stroke-opacity=".36" stroke-width="3.2"/>
 <g fill="#d98584" opacity=".57"><ellipse cx="63" cy="92" rx="7" ry="3.6"/><ellipse cx="117" cy="92" rx="7" ry="3.6"/></g>
 ${avatarExpression(faceId)}</g>`;
}
function avatarArt(p=person()){
 const a=avatarState(p),hair=AVATAR_HAIR_COLORS[a.color],skin=AVATAR_SKIN_COLORS[a.skin];
 return `<svg class="avatar-art" viewBox="0 0 180 210" role="img" aria-label="じぶんの アバター">
 <ellipse cx="90" cy="197" rx="42" ry="4.5" fill="#5d7054" opacity=".16"/>
 ${avatarHairBack(a.hair,hair)}
 <g stroke-linecap="round" stroke-linejoin="round">
 <path d="M72 164h17l-3 24H73Zm20 0h16l-1 24H94Z" fill="${skin}" stroke="#956e60" stroke-width="1.8"/>
 <path d="M69 164h42l-2 14-16 1-3-7-3 7-16-1Z" fill="#657d81" stroke="#53696c" stroke-width="1.8"/>
 <path d="M73 183h14l-1 8H72Zm20 0h14l1 8H94Z" fill="#fff1d6" stroke="#a8957f" stroke-width="1.3"/>
 <path d="M74 188q5 3 12 0l1 7q-1 4-18 3-7 0-6-4 3-5 11-6Zm32 0q-5 3-12 0l-1 7q1 4 18 3 7 0 6-4-3-5-11-6Z" fill="#ac7558" stroke="#755747" stroke-width="1.8"/>
 <path d="m68 194 5-2m39 2-5-2" stroke="#e8b58a" stroke-width="2.2"/>
 <path d="m59 140-9 14q-6 7-1 11 3 2 6 0 4-1 7-10l6-9Zm62 0 9 14q6 7 1 11-3 2-6 0-4-1-7-10l-6-9Z" fill="${skin}" stroke="#9c7766" stroke-width="1.7"/>
 <path d="M82 113v11q8 7 16 0v-11Z" fill="${skin}" stroke="#9c7766" stroke-width="1.7"/></g>
 ${avatarGarment(a.outfit)}${avatarHead(a.hair,a.face,hair,skin,false)}${avatarAccessoryArt(a.accessory,hair)}</svg>`;
}
function gardenPortrait(friend=FRIENDS[0]){
 const name=esc(person().name);
 return `<div class="garden-portrait" role="img" aria-label="${name}と ${friend.name}が おにわに ならんでいるよ">
  <div class="portrait-cast" aria-hidden="true">${avatarArt()}<div class="portrait-pal">${petArt(friend,false)}</div></div>
  <i class="portrait-flower" aria-hidden="true"></i><i class="portrait-flower" aria-hidden="true"></i>
 </div>`;
}
const AVATAR_GROUPS={accessory:'かざり',outfit:'おようふく',hair:'かみがた',face:'おかお',color:'かみの いろ',skin:'はだの いろ'};
function setAvatar(key,id){
 const option=AVATAR_OPTIONS[key]?.find(o=>o[0]===id);if(!option||mainPetLevel()<(option[2]||1))return;
 avatarState()[key]=id;save();avatarRoom('きがえたよ！',key);
 app.querySelector(`[data-avatar-item="${id}"]`)?.focus?.({preventScroll:true});
}
function showAvatarGroup(key){
 if(view!=='avatar'||!Object.hasOwn(AVATAR_GROUPS,key))return;
 avatarRoom('',key);
 app.querySelector(`[data-avatar-group="${key}"]`)?.focus?.({preventScroll:true});
}
function avatarRoom(message='',key='accessory'){
 const options=app.querySelector('.avatar-options');
 const sameGroup=view==='avatar'&&options?.dataset?.group===key;
 const scroll=sameGroup?options.scrollTop:0;
 const showUnlocks=sameGroup&&app.querySelector('.avatar-unlocks')?.open;
 leaveQuizScreen();view='avatar';session=null;
 const a=avatarState(),level=mainPetLevel();
 const groupButtons=Object.entries(AVATAR_GROUPS).map(([id,label])=>
  `<button class="sub" data-avatar-group="${id}" aria-pressed="${id===key}" onclick="showAvatarGroup('${id}')">${label}</button>`
 ).join('');
 const choices=[...AVATAR_OPTIONS[key]].sort((first,second)=>(first[2]||1)-(second[2]||1)).map(([id,name,at=1])=>{
  const locked=at>level;
  return `<button class="sub" data-avatar-item="${id}" aria-pressed="${a[key]===id}" onclick="setAvatar('${key}','${id}')" ${locked?'disabled':''}>
   ${avatarOptionIcon(key,id,a)}<span>${esc(name)}</span>${locked?'<small>🔒 Lv.'+at+'</small>':''}</button>`;
 }).join('');
 app.innerHTML=`<section class="panel avatar-room">
  <header class="avatar-room-header"><button class="sub" onclick="home()">← にわへ</button><h1>じぶんの アバター</h1></header>
  <div class="avatar-editor"><figure class="avatar-preview">
   ${gardenPortrait()}<figcaption><strong>${esc(person().name)} <span>と</span> にわっち</strong><small>にわっち Lv.${level}</small><p role="status">${esc(message)}</p></figcaption>
  </figure><div class="avatar-wardrobe"><nav class="avatar-categories" aria-label="きせかえの しゅるい">${groupButtons}</nav>
   <div class="avatar-options" data-group="${key}" tabindex="0" aria-label="${AVATAR_GROUPS[key]}を えらぶ">
    ${avatarNextUnlock(a)}<fieldset class="avatar-group"><legend>${AVATAR_GROUPS[key]}</legend><div>${choices}</div></fieldset>
   </div></div></div></section>`;
 const nextOptions=app.querySelector('.avatar-options');
 if(showUnlocks){const unlocks=app.querySelector('details.avatar-unlocks');if(unlocks)unlocks.open=true}
 if(nextOptions)nextOptions.scrollTop=scroll;
}

const GARDEN_STORIES=[
 ['⭐ まいごの おほしさま','にわの すみで、ちいさな ほしが ないていたよ。「おうちが わからないの」 にわっちと いっしょに、たすけて あげよう。'],
 ['🍃 はっぱの ふね','おほしさまを はっぱの ふねに のせたよ。ふたりで そっと おすと、ふねは きらきらの かわを すすんだよ。'],
 ['🌈 にじの はし','かわの むこうに にじの はし！ にわっちと てを つないで、おほしさまを そらまで おくったよ。'],
 ['🌟 ありがとうの ひかり','「ありがとう！」 おほしさまが ぴかり。にわに ほしの はなが さいたよ。ふたりは にっこり ハイタッチ！'],
 ['🌱 ふしぎな たね','あさの にわに、しましまの たねが おちていたよ。にわっちと やわらかい つちに うえてみたよ。'],
 ['💧 ひとしずくの みず','たねに おみずを あげたよ。「あわてなくて いいよ」 にわっちが いうと、ちいさな めが ぴょこん！'],
 ['🎵 おはなの うた','めが のびて、つぼみが できたよ。ふたりで うたうと、つぼみも ゆらゆら。なんの はなが さくのかな？'],
 ['🌻 えがおの おはな','おおきな ひまわりが さいたよ！ はなの まんなかは にこにこ。まいにちの ちいさな おせわが、はなに なったんだね。'],
 ['☁️ くもの おきゃくさま','ふわふわの くもが にわに おりてきたよ。「おさんぽに いこう」 ふたりは くもの せなかに のったよ。'],
 ['🐦 ことりの おとしもの','そらで ことりの あかい リボンを みつけたよ。にわっちが やさしく つかまえて、ことりに かえしたよ。'],
 ['🏰 そらの おしろ','ことりが そらの おしろへ あんないしてくれたよ。くもの テーブルで、おほしさまたちと おちゃかい！'],
 ['🏡 だいすきな にわ','「また あそぼうね」 くもに のって にわへ かえったよ。ぼうけんの おもいでを はなそう。つぎは どんな ゆめを みようかな？']
];
function storyProgress(){const p=person();if(!Number.isSafeInteger(p.storyClears)||p.storyClears<0)p.storyClears=0;return p.storyClears}
function duoArt(){return '<div class="garden-duo" aria-label="アバターと にわっちが いっしょに おいわい">'+avatarArt()+'<span class="duo-heart">🙌</span>'+petArt(FRIENDS[0],false)+'</div>'}
function celebrateAnswer(target){const box=document.querySelector(target);if(!box)return;const duo=document.createElement('div');duo.className='answer-duo';duo.innerHTML=duoArt();box.appendChild(duo)}
function storyCard(i){const row=GARDEN_STORIES[i];return '<article class="garden-story"><h2>'+row[0]+'</h2><p>'+row[1]+'</p><button class="sub" onclick="speak(GARDEN_STORIES['+i+'][1])">🔊 おはなしを きく</button></article>'}
function storyReward(){
 const n=storyProgress();person().storyClears=n+1;save();
 const box=document.createElement('div');box.className='story-reward';
 box.innerHTML=duoArt()+'<p class="center"><strong>いっしょに がんばったね！</strong></p>'+(n<GARDEN_STORIES.length?'<p>📖 おはなし '+(n+1)+' / '+GARDEN_STORIES.length+'</p>'+storyCard(n):'<p class="center">📖 おはなしを ぜんぶ よんだね！ おきにいりを また よもう。</p>')+'<details><summary>📚 これまでの おはなし</summary>'+GARDEN_STORIES.slice(0,Math.min(n+1,GARDEN_STORIES.length)).map((_,i)=>storyCard(i)).join('')+'</details>';
 app.querySelector('.panel')?.appendChild(box);
}

let autoNextTimer=null,autoNextEpoch=0;
function cancelAutoNext(){clearTimeout(autoNextTimer);autoNextTimer=null;autoNextEpoch++}
function scheduleAutoNext(english){
 cancelAutoNext();
 const active=english?englishSession:session;
 if(document.hidden||view!=='quiz'||!active?.done||active.rewarded)return;
 const questionNumber=active.n,question=english?active.word:q,profile=person(),epoch=autoNextEpoch;
 const button=document.querySelector(english?'#englishNext':'#next');if(button)button.classList.add('hidden');
 // All completed answers advance after the same short feedback pause.
 autoNextTimer=setTimeout(()=>{
  if(epoch!==autoNextEpoch)return;
  autoNextTimer=null;
  if(document.hidden||view!=='quiz'||person()!==profile||(english?englishSession:session)!==active||active.n!==questionNumber||(english?active.word:q)!==question||!active.done||active.rewarded)return;
  autoNextEpoch++;
  if(english)englishAdvance();else advance();
 },2200);
}
const autoNextLeave=leaveQuizScreen;
leaveQuizScreen=function(){cancelAutoNext();autoNextLeave()};
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){cancelAutoNext();return}
 if(view!=='quiz')return;
 if(session?.done)scheduleAutoNext(false);
 else if(englishSession?.done&&!englishSession.rewarded)scheduleAutoNext(true);
});

const duoAnswer=answer;
answer=function(i,el){const was=session?.done;duoAnswer(i,el);if(!was&&session?.done){celebrateAnswer('#feedback');if(q.activity)GardenActivities.showReview(q);scheduleAutoNext(false)}};
const duoEnglishAnswer=englishAnswer;
englishAnswer=function(i,el){const was=englishSession?.done;duoEnglishAnswer(i,el);if(!was&&englishSession?.done){celebrateAnswer('#englishFeedback');scheduleAutoNext(true)}};
const storyFinish=finish;
finish=function(){const eligible=session&&!session.rewarded;storyFinish();if(eligible)storyReward()};
const storyEnglishFinish=englishFinish;
englishFinish=function(){const eligible=englishSession&&!englishSession.rewarded;storyEnglishFinish();if(eligible)storyReward()};
const storyStyle=document.createElement('style');
storyStyle.textContent='.garden-duo{display:flex;align-items:center;justify-content:center;gap:14px;pointer-events:none}.garden-duo>.avatar-art{width:100px;margin:0}.garden-duo>.pet-scene{width:160px;min-height:180px;height:180px;margin:0;background:transparent;overflow:visible}.garden-duo .pet-body{scale:.7}.garden-duo .pet-badge{font-size:22px}.duo-heart{font-size:30px}.garden-story{background:#fff5df;border:2px solid #eddbb0;border-radius:20px;padding:18px;margin:16px 0}.garden-story p{font-size:19px;line-height:1.9}.garden-story h2{font-size:22px}.story-reward details{margin:18px 0}.story-reward summary{cursor:pointer;padding:14px;min-height:48px}.answer-duo{position:fixed;left:50%;top:45%;translate:-50% -50%;width:max-content;max-width:90vw;z-index:60;pointer-events:none;background:#fffaf0ee;border-radius:18px;animation:duo-cheer .7s ease-in-out 2}.answer-duo .garden-duo{gap:0;height:74px;padding:5px}.answer-duo .avatar-art{width:42px}.answer-duo .pet-scene{width:66px;min-height:65px;height:65px;overflow:hidden}.answer-duo .pet-body{scale:.3}.answer-duo .duo-heart{font-size:18px}.answer-duo .pet-badge{display:none}@keyframes duo-cheer{50%{transform:translateY(6px) rotate(3deg)}}@media(prefers-reduced-motion:reduce){.answer-duo{animation:none}}';
document.head.appendChild(storyStyle);


let quietTiming=null,quietTimingTimer=null;
function timingRows(){const p=person();if(!Array.isArray(p.answerTimes))p.answerTimes=[];return p.answerTimes}
function timingMedian(xs){const a=xs.slice().sort((a,b)=>a-b);return a.length?a[Math.floor(a.length/2)]:0}
function timingStop(){clearInterval(quietTimingTimer);quietTimingTimer=null;quietTiming=null}
function timingBegin(english){
 timingStop();if(view!=='quiz')return;
 const active=english?englishSession:session;if(!active||active.done||active.rewarded)return;
 const key=english?'en:'+active.level:(subject+':'+q.i+':'+(active.auto&&adaptiveState().prepStep<3?'prep'+adaptiveState().prepStep:'regular'));
 quietTiming={profile:person(),active,english,key,ms:0,last:Date.now(),ready:!data.sound,excluded:false};
 quietTimingTimer=setInterval(timingTick,100);
}
function timingTick(){
 const t=quietTiming;if(!t)return;const now=Date.now(),delta=now-t.last;t.last=now;
 if(view!=='quiz'||person()!==t.profile){timingStop();return}
 if(document.hidden)return;
 const talking=data.sound&&window.speechSynthesis&&(window.speechSynthesis.speaking||window.speechSynthesis.pending);
 if(talking)return;
 if(!t.ready){t.ready=true;return}
 if(delta>10000){t.excluded=true;return}
 t.ms+=Math.max(0,delta);if(t.ms>120000)t.excluded=true;
}
function timingRecord(clean){
 const t=quietTiming;if(!t)return;timingTick();if(!quietTiming)return;
 const talking=data.sound&&window.speechSynthesis&&(window.speechSynthesis.speaking||window.speechSynthesis.pending);
 const valid=t.ready&&!t.excluded&&!document.hidden&&!talking&&t.ms>=300&&t.ms<=120000;
 const rows=timingRows(),previous=rows.filter(r=>r.key===t.key&&r.valid&&r.clean&&Number.isFinite(r.ms)).slice(-30);
 const baseline=previous.length>=15?timingMedian(previous.map(r=>r.ms)):0;
 const slow=!!(valid&&baseline&&t.ms>Math.max(10000,baseline*2.5));
 rows.push({at:new Date().toISOString(),key:t.key,ms:Math.round(t.ms),valid,clean,slow});
 if(rows.length>500)rows.splice(0,rows.length-500);
 // Timing is descriptive only; mastery never depends on slow correct answers.
 timingStop();save();
}
const timedNext=nextQuestion;
nextQuestion=function(){timingStop();timedNext();if(view==='quiz')timingBegin(false)};
const timedEnglishNext=englishNext;
englishNext=function(){timingStop();timedEnglishNext();if(view==='quiz')timingBegin(true)};
const timedAnswer=answer;
answer=function(i,el){
 if(session&&!session.done&&q.choices[i]===q.answer)timingRecord(!session.help&&!session.wrong);
 timedAnswer(i,el);
};
const timedEnglishAnswer=englishAnswer;
englishAnswer=function(i,el){
 const e=englishSession;if(view==='quiz'&&e&&!e.done&&e.choices[i]?.[0]===e.word[0])timingRecord(!e.help);
 timedEnglishAnswer(i,el);
};
const timedLeave=leaveQuizScreen;
leaveQuizScreen=function(){timingStop();timedLeave()};
document.addEventListener('visibilitychange',()=>{if(quietTiming)quietTiming.last=Date.now()});
function timingReport(){
 const rows=timingRows(),keys=[...new Set(rows.map(r=>r.key))];
 const label=key=>{const parts=key.split(':');return parts[0]==='en'?'英語 ステップ '+(Number(parts[1])+1):(TOPICS[Number(parts[1])]?.[1]||'学習')+(parts[2]?.startsWith('prep')?'（やさしい準備 '+(Number(parts[2].slice(4))+1)+'）':'')};
 return '<section class="panel"><h2>解答時間（保護者用）</h2><p>時間は子供の画面に表示しません。読み上げ中・別画面の時間は除きます。2分を超える解答などは判定対象外です。端末の音声状態による誤差や、画面を開いたままの離席は区別できません。</p><p>時間は同じ技能の本人の記録としてのみ参照し、難易度や報酬を変えません。直近500問をこのブラウザに保存し、バックアップにも含めます。</p>'+(!rows.length?'<p>まだ記録はありません。</p>':keys.map(key=>{const rs=rows.filter(r=>r.key===key&&r.valid),clean=rs.filter(r=>r.clean);return '<div class="row"><span>'+esc(label(key))+'</span><span>有効 '+rs.length+'問 ／ 中央値 '+(rs.length?(timingMedian(rs.map(r=>r.ms))/1000).toFixed(1)+'秒':'—')+' ／ '+(clean.length>=15?'本人のペースを参照中':'基準収集中 '+clean.length+'/15')+'</span></div>'}).join(''))+'<details><summary>直近20問の記録</summary>'+rows.slice(-20).reverse().map(r=>'<p>'+esc(new Date(r.at).toLocaleString('ja-JP'))+' · '+esc(label(r.key))+' · '+(r.valid?(r.ms/1000).toFixed(1)+'秒':'判定対象外')+' · '+(r.clean?'自力正解':'ヒント・再回答あり')+'</p>').join('')+'</details></section>';
}

function learningStageRows(){
 const p=person();
 return ['math','jp','en'].map(kind=>{
  if(kind==='en'){
   const e=p.english||{},level=Number.isInteger(e.level)&&e.level>=0&&e.level<=31?e.level:0;
   return {name:'英語',grade:'小3〜4の外国語活動の導入に関連',stage:'ステップ '+(level+1)+' / 32',topic:['動物の単語','食べ物の単語','身の回りの単語','色と物','数と動物','動物の動作','位置を表す文','短い会話の返事'][Math.floor(level/4)]+'を聞いて絵を選ぶ',note:e.total?'音声の意味や返事を選ぶ練習です。発話・読み書きの習得判定ではありません。':'まだ未学習です。表示は開始位置です。'};
  }
  const lo=kind==='math'?0:JP_START,hi=kind==='math'?JP_START:TOPICS.length,a=p.adaptive?.[kind]||{};
  let level=Number.isInteger(a.level)&&a.level>=lo&&a.level<hi?a.level:lo;
  if(a.level===undefined)while(level<hi-1&&p.stats[level]?.mastered)level++;
  const prep=Number.isInteger(a.prepStep)&&a.prepStep<3?a.prepStep:((p.name.includes('芽依')||data.current===1)&&a.easyVersion!==1?0:null);
  const learned=Object.entries(p.stats).some(([i,v])=>Number(i)>=lo&&Number(i)<hi&&v.total>0);
  if(prep!==null)return {name:kind==='math'?'算数':'国語',grade:'就学前の準備段階',stage:'準備 '+(prep+1)+' / 3',topic:kind==='math'?['1〜3を数える','1〜5を数える','少ない数を比べる'][prep]:['同じ絵を選ぶ（2択）','同じ絵を選ぶ（3択）','同じ絵を選ぶ（4択）'][prep],note:learned?'読み・計算に入る前の準備です。':'まだ未学習です。表示は開始位置です。'};
  const index=level-lo;
  const grade=kind==='math'?(index<3?'就学前〜小1の導入':index<9?'小1相当の内容':index<11?'小2相当の内容':index===11?'小3相当の内容':index===12?'小2〜3の分数の導入':'小1〜3の数・計算を使う暗算練習'):(index<2?'就学前〜小1の導入':index<6?'小1相当の基礎内容':'小1〜2相当の短文読解');
  return {name:kind==='math'?'算数':'国語',grade,stage:'段階 '+(index+1)+' / '+(hi-lo),topic:TOPICS[level][1]+'：'+TOPICS[level][2],note:learned?(a.newCount<5?'新しい範囲を少しずつ混ぜて練習中です。':'現在の自動出題の位置です。'):'まだ未学習です。表示は開始位置です。'};
 });
}
function learningStageReport(){
 return '<section class="panel"><h2>教科ごとの段階・学年の目安</h2><p>出題内容に基づく参考表示です。学年全体の習得度や学力を判定するものではありません。教科によって扱う範囲が異なります。</p>'+learningStageRows().map(r=>'<article style="border:1px solid #dce2d1;border-radius:16px;padding:16px;margin:12px 0"><h3>'+r.name+' · '+r.grade+'</h3><strong>'+r.stage+'</strong><p>'+esc(r.topic)+'</p><p class="muted">'+r.note+'</p></article>').join('')+'<p class="muted">算数は数・計算・分数と、まとまりを使う暗算、国語は文字・語句・短文、英語は単語・短文の聞き取りと返事選びを扱います。学年の目安が同じでも、内容の段階は進みます。</p></section>';
}

const timedParents=parents;
parents=function(){timingStop();cancelAutoNext();leaveQuizScreen();timedParents();app.insertAdjacentHTML('beforeend',learningStageReport()+timingReport())};
document.querySelector('#parent').onclick=parents;


function homeStageLabel(i){
 const r=learningStageRows()[i];
 const name=i===0?r.topic.split('：')[0]:i===1?r.topic.split('：')[0]:r.topic.replace('を聞いて絵を選ぶ','');
 return '<small class="home-stage"><b>'+esc(r.stage.replace('段階','ステップ').replace('準備','じゅんび'))+'</b><small>'+esc(name)+'</small></small>';
}
const homeStageStyle=document.createElement('style');
homeStageStyle.textContent='.home-stage{display:block;font-size:15px;line-height:1.4;font-weight:normal}.home-stage b{font-size:16px}.home-stage>small{display:block;font-size:12px;margin-top:3px}.subject-home-card{gap:6px}@media(max-width:500px){.home-stage b{font-size:12px}.home-stage>small{font-size:10px}.home-stage{overflow-wrap:anywhere}}';
document.head.appendChild(homeStageStyle);


const RAIL_COLORS={blue:['あお','#559bd2'],red:['あか','#df7273'],green:['みどり','#78b58b'],yellow:['きいろ','#edc658'],pink:['ピンク','#df91bb']};
const RAIL_STATIONS={platform:['えき','🚉',0],crossing:['ふみきり','🚦',15],depot:['しゃこ','🏠',20]};
function railState(){
 const g=game();if(!g.rail||typeof g.rail!=='object'||Array.isArray(g.rail))g.rail={};
 const r=g.rail;
 if(!RAIL_COLORS[r.color])r.color='blue';
 if(!['local','express','steam'].includes(r.head))r.head='local';
 if(!['stripe','stars','dots'].includes(r.pattern))r.pattern='stripe';
 if(!Number.isInteger(r.cars)||r.cars<1||r.cars>8)r.cars=1;
 if(!Array.isArray(r.owned))r.owned=['platform'];
 r.owned=[...new Set(['platform',...r.owned.filter(id=>RAIL_STATIONS[id])])];
 if(!r.owned.includes(r.station))r.station='platform';
 if(!Array.isArray(r.passengers))r.passengers=[];
 r.passengers=r.passengers.filter(id=>FRIENDS.some(f=>f.id===id&&mainPetLevel()>=f.at));
 return r;
}
function railPick(key,id){
 const r=railState();
 if(key==='color'&&RAIL_COLORS[id]||key==='head'&&['local','express','steam'].includes(id)||key==='pattern'&&['stripe','stars','dots'].includes(id))r[key]=id;else return;
 save();railRoom();
}
function railBuy(id){
 const g=game(),r=railState();
 if(id==='car'){if(r.cars>=8||g.coins<10)return;g.coins-=10;r.cars++}
 else{if(!RAIL_STATIONS[id])return;if(!r.owned.includes(id)){const cost=RAIL_STATIONS[id][2];if(g.coins<cost)return;g.coins-=cost;r.owned.push(id)}r.station=id}
 save();railRoom('かざったよ！');
}
function railPassenger(id){
 const r=railState();if(!FRIENDS.some(f=>f.id===id&&mainPetLevel()>=f.at))return;
 if(r.passengers.includes(id))r.passengers=r.passengers.filter(x=>x!==id);else r.passengers.push(id);
 save();railRoom();
}
let railTripTimer=null;
function railDepart(){
 if(view!=='rail')return;
 const train=app.querySelector('.rail-train');if(!train)return;clearTimeout(railTripTimer);
 train.classList.remove('rail-moving');void train.offsetWidth;train.classList.add('rail-moving');
 app.querySelector('.rail-status').textContent='しゅっぱつ！ みんなで おでかけ！';
 playFeedSound(false);
 railTripTimer=setTimeout(()=>{if(view!=='rail'||app.querySelector('.rail-train')!==train)return;train.classList.remove('rail-moving');app.querySelector('.rail-status').textContent='とうちゃく！ おかえりなさい！'},2400);
}
function railRoom(message=''){
 clearTimeout(railTripTimer);leaveQuizScreen();session=null;view='rail';const r=railState(),g=game();
 const passengerHTML=r.passengers.map(id=>{const f=FRIENDS.find(f=>f.id===id);return '<span title="'+f.name+'">'+f.icon+'</span>'}).join('');
 app.innerHTML='<section class="panel rail-room"><div class="quiztop"><button class="sub" onclick="petRoom()">← にわっちへ</button><span>🪙 '+g.coins+'</span></div><h1>じぶんの でんしゃ</h1><div class="rail-station station-'+r.station+'"><div class="rail-sign">'+RAIL_STATIONS[r.station][1]+' '+RAIL_STATIONS[r.station][0]+'</div><div class="rail-scroll" tabindex="0" aria-label="でんしゃ。よこに うごかして みられるよ"><div class="rail-train">'+Array.from({length:r.cars},(_,i)=>'<div class="rail-car '+(i===0?r.head:'')+'" style="--train-color:'+RAIL_COLORS[r.color][1]+'"><div class="rail-windows">'+(i===0?'<span class="rail-driver" title="'+esc(person().name)+'も のっているよ">'+avatarArt()+'</span><span class="rail-friends">'+passengerHTML+'</span>':'🪟 🪟')+'</div><div class="rail-pattern">'+({stripe:'━━━━',stars:'★ ★ ★',dots:'● ● ●'}[r.pattern])+'</div></div>').join('')+'</div></div></div><button class="primary" onclick="railDepart()">🚂 しゅっぱつ！</button><p class="rail-status" role="status">'+esc(message||'じぶんも のっているよ！ ともだちを おすと のれるよ。')+'</p><div class="rail-options">'+FRIENDS.filter(f=>mainPetLevel()>=f.at).map(f=>'<button class="sub" aria-pressed="'+r.passengers.includes(f.id)+'" onclick="railPassenger(\''+f.id+'\')">'+f.icon+' '+f.name+(r.passengers.includes(f.id)?' ✓':'')+'</button>').join('')+'</div><h2>いろ・もよう・かたち（レベルで かいほう）</h2>'+[['color',Object.entries(RAIL_COLORS).map(([id,v])=>[id,v[0]])],['pattern',[['stripe','しましま'],['stars','ほし'],['dots','みずたま']]],['head',[['local','でんしゃ'],['express','とっきゅう'],['steam','きかんしゃ']]]].map(([key,opts])=>'<div class="rail-options">'+opts.map(([id,name])=>'<button class="sub" aria-pressed="'+(r[key]===id)+'" onclick="railPick(\''+key+'\',\''+id+'\')">'+name+'</button>').join('')+'</div>').join('')+'<h2>しゃりょう・えき</h2><button class="sub" onclick="railBuy(\'car\')" '+(g.coins<10||r.cars>=8?'disabled':'')+'>'+r.cars+'りょう / 8りょう · '+(r.cars>=8?'いっぱい！':'10🪙で 1りょう ふやす')+'</button><div class="rail-options">'+Object.entries(RAIL_STATIONS).map(([id,v])=>'<button class="sub" aria-pressed="'+(r.station===id)+'" onclick="railBuy(\''+id+'\')" '+(!r.owned.includes(id)&&g.coins<v[2]?'disabled':'')+'>'+v[1]+' '+v[0]+' · '+(r.owned.includes(id)?'えらぶ':v[2]+'🪙')+'</button>').join('')+'</div><button class="sub" onclick="avatarRoom()">🧑‍✈️ せいふくに きがえる</button><p class="muted">おとは「おと ON / OFF」で きりかえられるよ。</p></section>';
}
const railStyle=document.createElement('style');
railStyle.textContent='.rail-room{text-align:center}.rail-room h1{font-size:28px}.rail-station{position:relative;background:linear-gradient(#d9efff 65%,#e5dcc6 65%);border-radius:22px;padding:18px 12px 26px;overflow:hidden}.station-crossing:before{content:"●";position:absolute;right:22px;top:40px;border-left:8px solid #dfbb37;border-bottom:8px solid #dfbb37;height:75px;width:70px;color:#d65b55;font-size:28px}.station-depot{background:linear-gradient(90deg,#b7c8d0 8%,transparent 8%,transparent 92%,#b7c8d0 92%),linear-gradient(#d5e3ea 16%,#f3f0e7 16%,#f3f0e7 80%,#d6c8ad 80%);border-top:14px solid #7a929e}.station-platform .rail-sign{border-bottom:7px solid #e7c65d}.rail-sign{font-size:25px;font-weight:bold}.rail-car:first-child{width:155px;height:110px}.rail-car:first-child .rail-windows{height:60px;margin-top:8px;gap:4px;padding:0 4px}.rail-driver{display:flex;flex:0 0 48px;align-items:center;justify-content:center;border-right:2px solid #a5ccd9;padding-right:4px}.rail-driver .avatar-art{display:block;width:44px;height:54px;flex-shrink:0}.rail-friends{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));flex:1;min-width:0;align-items:center;justify-items:center;gap:2px}.rail-friends>span{font-size:21px;line-height:1.2}.rail-scroll{overflow-x:auto;padding:8px 0 24px}.rail-train{display:flex;width:max-content;gap:10px;padding:8px 15px}.rail-car{position:relative;width:155px;height:90px;background:var(--train-color);border-radius:15px 15px 8px 8px;border:3px solid #3b5365;flex-shrink:0}.rail-car:after{content:"●　　●";position:absolute;bottom:-22px;left:16px;color:#354450;font-size:25px}.rail-car.express{border-radius:60px 16px 8px 8px}.rail-car.steam:before{content:"";position:absolute;left:12px;top:-20px;width:18px;height:20px;background:#455465}.rail-windows{margin:12px 8px 4px;background:#e6f7ff;border-radius:7px;height:38px;display:flex;justify-content:space-evenly;align-items:center;font-size:23px}.rail-pattern{color:#fff;font-size:18px}.rail-options{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:16px 0}.rail-options button{min-height:48px}.rail-options [aria-pressed=true]{outline:3px solid #679261;background:#e1edce}.rail-moving{animation:railTravel 2.4s ease-in-out}.rail-status{min-height:26px}@keyframes railTravel{0%,100%{translate:0}50%{translate:55px 0}}@media(prefers-reduced-motion:reduce){.rail-moving{animation:none}}';
document.head.appendChild(railStyle);


const UNLOCK_LEVELS={
 rail:{color:{blue:1,red:10,green:25,yellow:50,pink:75},head:{local:1,express:40,steam:100},pattern:{stripe:1,dots:20,stars:60}},
 station:{platform:1,crossing:30,depot:70},
 cars:[1,10,20,35,50,65,80,100],
 pet:{flower:5,cap:15,ribbon:25,star:45,butterfly:70,crown:100},
 room:{garden:1,none:1,plant:10,pinkroom:20,sofa:35,skyroom:45,bear:55,bed:75,nightroom:100}
};
const AVATAR_UNLOCKS={outfit:{everyday:1,star:1,driver:5,conductor:15,sport:10,flower:20,marine:30,berry:40,forest:50,royal:60,magic:70,space:80,rainbow:90,angel:100},accessory:{none:1,railcap:5,railbag:15,bowblue:10,ribbon:20,cat:25,flower:30,bunny:40,hat:50,crown:60,magic:70,moon:80,gem:90,sparkle:100}};
for(const [key,levels] of Object.entries(AVATAR_UNLOCKS))for(const option of AVATAR_OPTIONS[key])option[2]=levels[option[0]]??option[2]??1;
for(const key of ['outfit','accessory'])AVATAR_OPTIONS[key].sort((a,b)=>(a[2]||1)-(b[2]||1));
function requiredUnlock(action,a,b){
 const g=game();
 if(action==='railPick')return UNLOCK_LEVELS.rail[a]?.[b]??Infinity;
 if(action==='railBuy')return a==='car'?(UNLOCK_LEVELS.cars[railState().cars]??Infinity):(railState().owned.includes(a)?1:UNLOCK_LEVELS.station[a]??Infinity);
 if(action==='shopAction')return g.owned.includes(a)?1:UNLOCK_LEVELS.pet[a]??Infinity;
 if(action==='buyRoomItem')return roomState().owned.includes(a)?1:UNLOCK_LEVELS.room[a]??Infinity;
 return 1;
}
function decorateUnlocks(){
 app.querySelectorAll('button[onclick]').forEach(button=>{
  const match=button.getAttribute('onclick').match(/^(railPick|railBuy|shopAction|buyRoomItem)\('([^']+)'(?:,'([^']+)')?\)/);
  if(!match)return;const required=requiredUnlock(match[1],match[2],match[3]);
  if(Number.isFinite(required)&&mainPetLevel()<required){
   button.disabled=true;button.textContent+=' 🔒 にわっち Lv.'+required;
  }
 });
}
const unlockedRailPick=railPick;
railPick=function(key,id){if(mainPetLevel()<requiredUnlock('railPick',key,id))return;unlockedRailPick(key,id)};
const unlockedRailBuy=railBuy;
railBuy=function(id){if(mainPetLevel()<requiredUnlock('railBuy',id))return;unlockedRailBuy(id)};
const unlockedPetBuy=shopAction;
shopAction=function(id){if(mainPetLevel()<requiredUnlock('shopAction',id))return;unlockedPetBuy(id)};
const unlockedRoomBuy=buyRoomItem;
buyRoomItem=function(id){if(mainPetLevel()<requiredUnlock('buyRoomItem',id))return;unlockedRoomBuy(id)};
const unlockRailRoom=railRoom;
railRoom=function(message=''){unlockRailRoom(message);decorateUnlocks();const note=document.createElement('p');note.className='muted';note.textContent='にわっち レベル '+mainPetLevel()+' · レベル100で ぜんぶの しゅるいが えらべるよ。かうものには コインも いるよ。';app.querySelector('.rail-room')?.appendChild(note)};
const unlockPetRoom=petRoom;
petRoom=function(message=''){unlockPetRoom(message);decorateUnlocks()};


function positionPicture(place,animal='🐱'){
 const y={above:35,under:110,beside:92}[place],x=place==='beside'?135:75;
 return '<svg viewBox="0 0 180 150" width="130" height="108" role="img" aria-label="'+animal+' つくえの '+({above:'うえ',under:'した',beside:'よこ'}[place])+'"><path d="M40 70H110V80H40ZM45 80V135M105 80V135" fill="none" stroke="#85664d" stroke-width="7"/><text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="30">'+animal+'</text></svg>';
}
const jpNewBanks=[[],[],[],[],[]];
for(const animal of ['🐱','🐶','🐰'])for(const [position,word] of [['above','うえ'],['under','した'],['beside','よこ']]){
 const others=['above','under','beside'].filter(x=>x!==position);
 jpNewBanks[0].push(['「'+({'🐱':'ねこ','🐶':'いぬ','🐰':'うさぎ'}[animal])+'が つくえの '+word+'に います」に あう えは？',positionPicture(position,animal),others.map(p=>positionPicture(p,animal)).join('|'),'つくえと どうぶつの ばしょを くらべよう。']);
}
jpNewBanks[1]=[
 ['ぼうしを □。','かぶる','はく|はめる'],['くつを □。','はく','かぶる|さす'],['かさを □。','さす','はく|のむ'],['みずを □。','のむ','きる|かぶる'],['ふくを □。','きる','はく|さす'],['てぶくろを □。','はめる','かぶる|のむ']
].map(r=>[...r,'なにを どうするのか、つなげて よんでみよう。']);
for(const [a,b] of [['ねこ','いぬ'],['うさぎ','くま'],['りす','きつね']]){
 jpNewBanks[2].push([a+'が '+b+'を おいかけました。おいかけたのは？',a,b+'|とり','「が」の まえに いるのは だれかな。']);
 jpNewBanks[2].push([b+'が '+a+'を よびました。よばれたのは？',a,b+'|とり','よんだ ひとと、よばれた ひとを わけよう。']);
}
jpNewBanks[3]=[
 ['なくした くまの ぬいぐるみが みつかり、にっこり わらいました。どんな きもち？','うれしい','くやしい|かなしい'],
 ['つくった とうが くずれて、「もうすこし だったのに」と いいました。どんな きもち？','くやしい','うれしい|ほっとした'],
 ['くらい へやで おおきな おとが して、こわくて ふるえました。どんな きもち？','こわい','たのしい|うれしい'],
 ['ともだちが ひっこして、「あえなくて さびしいな」と いいました。どんな きもち？','さびしい','たのしい|ほこらしい'],
 ['まいごに なったけれど、おかあさんに あえて「よかった」と あんしんしました。どんな きもち？','ほっとした','くやしい|おこっている'],
 ['あしたの えんそくが まちどおしくて、わくわくしています。どんな きもち？','たのしみ','かなしい|くやしい']
].map(r=>[...r,'ことばや ようすを てがかりに しよう。']);
jpNewBanks[4]=[
 ['たねを まきました。まいにち みずを あげました。はなが さきました。あう だいめいは？','はなを そだてたよ','でんしゃに のったよ|おやつを つくったよ'],
 ['こむぎこを まぜました。まるくして やきました。クッキーが できました。あう だいめいは？','クッキーづくり','はなを そだてたよ|うみで あそんだよ'],
 ['えきで でんしゃを まちました。まどから やまが みえました。おばあちゃんの まちに つきました。あう だいめいは？','でんしゃの たび','おへやの そうじ|おはなの おせわ'],
 ['すなを あつめました。たかい やまに しました。トンネルも ほりました。あう だいめいは？','すなあそび','クッキーづくり|ゆきの あさ'],
 ['ほんが ゆかに ありました。ほんだなに もどしました。へやが きれいに なりました。あう だいめいは？','おかたづけ','でんしゃの たび|はなを そだてたよ'],
 ['あさ、ゆきが つもりました。そとで ゆきを まるめました。ゆきだるまが できました。あう だいめいは？','ゆきだるまづくり','うみで あそんだよ|おへやの そうじ']
].map(r=>[...r,'おはなし ぜんたいで なにを したか、かんがえよう。']);
const LANG_JP_START=TOPICS.length;
['ぶんと え','ことばの つかいかた','だれが なにを','きもちを よもう','だいめいを えらぼう'].forEach((name,k)=>{TOPICS.push(['📖',name,'意味を考えて選ぶ','jp',JP_BANK.length]);JP_BANK.push(jpNewBanks[k])});
const richerMakeQuestion=makeQuestion;
makeQuestion=function(i){
 const result=richerMakeQuestion(i);
 if(i>=LANG_JP_START&&result.type==='jp'){
  const count=session?.auto&&(adaptiveState().newCount||5)<3?2:3;
  result.choices=[result.answer,...result.choices.filter(v=>v!==result.answer).slice(0,count-1)].sort(()=>Math.random()-.5);
 }
 return result;
};
const englishExtension=[[],[],[],[],[]];
const colorBall=(color)=>'<svg viewBox="0 0 100 85" width="95" height="80"><circle cx="50" cy="42" r="30" fill="'+color+'" stroke="#52616a" stroke-width="3"/></svg>';
for(const [name,color,jp] of [['red','#df5757','あか'],['blue','#589ad6','あお'],['green','#72af76','みどり'],['yellow','#e9c849','きいろ'],['pink','#e59bc2','ピンク'],['purple','#9e80c2','むらさき']]){
 englishExtension[0].push(['a '+name+' ball',colorBall(color),jp+'いろの ボール']);
}
for(const [name,emoji,jp] of [['cats','🐱','ねこ'],['dogs','🐶','いぬ'],['rabbits','🐰','うさぎ']])for(const n of [2,3]){
 englishExtension[1].push([['zero','one','two','three'][n]+' '+name,emoji.repeat(n),jp+n+'ひき']);
}
function runningPicture(emoji){return '<svg data-action="running" viewBox="0 0 120 104" width="120" height="104" style="max-width:100%;height:auto;vertical-align:middle" aria-hidden="true"><path d="M12 44h19M8 55h17" stroke="#7b949d" stroke-width="3" stroke-linecap="round"/><path d="M17 96h88" stroke="#b7c4bb" stroke-width="2"/><g fill="none" stroke="#355665" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M59 45L43 46L34 57M62 45L78 54L88 40"/><path d="M49 66L68 77L60 91L70 91M49 66L33 78L19 67L14 71"/></g><path d="M63 40L48 65" stroke="#438ca4" stroke-width="13" stroke-linecap="round"/><text x="70" y="35" text-anchor="middle" font-size="33">'+emoji+'</text></svg>'}
for(const [animal,emoji,jp] of [['cat','🐱','ねこ'],['dog','🐶','いぬ']])for(const [act,icon,ja] of [['running','💨','はしっている'],['sleeping','💤','ねている'],['eating','🍽️','たべている']]){
 englishExtension[2].push(['The '+animal+' is '+act+'.',act==='running'?runningPicture(emoji):emoji+icon,jp+'が '+ja]);
}
for(const [animal,emoji,jp] of [['cat','🐱','ねこ'],['dog','🐶','いぬ']])for(const [pos,en,ja] of [['above','on','うえ'],['under','under','した'],['beside','next to','よこ']]){
 englishExtension[3].push(['The '+animal+' is '+en+' the table.',positionPicture(pos,emoji),jp+'が つくえの '+ja+'に いる']);
}
englishExtension[4]=[
 ["I'm happy.",'😊','げんきだよ',"How are you?"],
 ["I'm five.",'🖐️','5さいだよ',"How old are you?"],
 ["It's red.",'🔴','あかだよ',"What color is it?"],
 ["I like cats.",'🐱','ねこが すきだよ',"What animal do you like?"],
 ["Thank you.",'🎁','ありがとう',"Here is a present for you."],
 ["Good morning.",'🌅','おはよう',"Good morning."]
];
EN_WORDS.push(...englishExtension);
function englishOptionPreview(i){
 const e=englishSession;if(!e||e.done||!e.choices[i])return;
 e.selected=i;englishSay(e.choices[i][0]);
 const button=document.querySelector('#confirmEnglish');if(button){button.disabled=false;button.textContent='これにする';}
 document.querySelectorAll('.choice').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
}
function englishConfirm(){const e=englishSession;if(e?.selected==null||e.done)return;englishAnswer(e.selected,document.querySelectorAll('.choice')[e.selected])}

for(let p of data.profiles)initGame(p);save();
let toolsBar=document.querySelector('.tools');let musicButton=document.createElement('button');musicButton.setAttribute('data-music','');musicButton.onclick=musicControl;toolsBar.appendChild(musicButton);let switchButton=document.createElement('button');switchButton.textContent='ひとを かえる';switchButton.onclick=showWelcome;toolsBar.appendChild(switchButton);
document.querySelector('#profile').onchange=e=>chooseChild(Number(e.target.value));
refresh();home();showWelcome();

