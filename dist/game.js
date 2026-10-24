let quizOwnsFullscreen=false;
function enterQuizScreen(){document.body.classList.add('quiz-mode');window.scrollTo?.(0,0);if(!document.fullscreenElement&&document.documentElement?.requestFullscreen){document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{if(view==='quiz')quizOwnsFullscreen=true;else document.exitFullscreen?.().catch(()=>{})}).catch(()=>{})}}
function leaveQuizScreen(){document.body.classList.remove('quiz-mode');if(quizOwnsFullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});quizOwnsFullscreen=false}
// Learning rewards are local to each learner. No paid or random items.
const SHOP=[['flower','おはな','🌸','hat',15],['cap','ぼうし','🧢','hat',20],['crown','おうかん','👑','hat',40],['ribbon','リボン','🎀','bow',15],['star','おほしさま','⭐','badge',20],['butterfly','ちょうちょ','🦋','badge',25]].map(([id,name,emoji,slot,cost])=>({id,name,emoji,slot,cost}));
function initGame(p){let g=p.game;if(!g||typeof g!=='object'||Array.isArray(g))g=p.game={};for(let k of ['coins','growth'])if(!Number.isSafeInteger(g[k])||g[k]<0)g[k]=0;if(!Array.isArray(g.owned))g.owned=[];g.owned=g.owned.filter(id=>SHOP.some(i=>i.id===id));if(!g.equipped||typeof g.equipped!=='object')g.equipped={};for(let slot of ['hat','bow','badge'])if(!SHOP.some(i=>i.id===g.equipped[slot]&&i.slot===slot&&g.owned.includes(i.id)))delete g.equipped[slot];if(!g.days||typeof g.days!=='object'||Array.isArray(g.days))g.days={};return g}
function game(){return initGame(person())}
function todayKey(){let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dailyRecord(){let g=game(),k=todayKey();if(!g.days[k]||typeof g.days[k]!=='object')g.days[k]={};return g.days[k]}
const FRIENDS=[{id:'main',name:'にわっち',icon:'🌱',at:1},{id:'momo',name:'ももっち',icon:'🌸',at:10},{id:'sora',name:'そらっち',icon:'☁️',at:25},{id:'hoshi',name:'ほしっち',icon:'⭐',at:50}];
function mainPetLevel(){return 1+Math.floor(game().growth/3)}
function friendState(){
 const g=game();
 if(!g.friends||typeof g.friends!=='object'||Array.isArray(g.friends))g.friends={};
 const available=FRIENDS.filter(f=>mainPetLevel()>=f.at);
 for(const f of available.slice(1)){
  let p=g.friends[f.id];if(!p||typeof p!=='object'||Array.isArray(p))p=g.friends[f.id]={growth:0,equipped:{}};
  if(!Number.isSafeInteger(p.growth)||p.growth<0)p.growth=0;
  if(!p.equipped||typeof p.equipped!=='object')p.equipped={};
  for(const slot of ['hat','bow','badge'])if(!SHOP.some(i=>i.id===p.equipped[slot]&&i.slot===slot&&g.owned.includes(i.id)))delete p.equipped[slot];
 }
 if(!available.some(f=>f.id===g.activeFriend))g.activeFriend='main';
 return g.activeFriend==='main'?g:g.friends[g.activeFriend];
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
function petWish(){return '<aside class="pet-wish"><strong>🌱 にわっちから おねがい</strong><p>いっしょに おはなを そだてよう！<br>すきな ステージを 5もん やると、おはなが ひとつ さくよ。</p><div aria-label="そだてた おはな">'+ '🌷'.repeat(Math.min(12,Math.max(0,Number(person().flowers)||0)))+'</div><small>そだてた おはな：'+(Number(person().flowers)||0)+'こ · いつ あそびに きても だいじょうぶ</small></aside>'}
function petLevelBadge(){const g=friendState(),lv=petLevel();return `<div class="pet-level-badge">${lv>=100?'🌈':'🌱'} レベル <b>${lv}</b></div><div class="pet-growth-track" role="progressbar" aria-label="つぎのレベルまでのせいちょう" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${g.growth%3}"><span style="width:${g.growth%3/3*100}%"></span></div><p>レベル ${lv+1} まで、あと ${3-g.growth%3}かい ごはんを あげよう！</p>`}

function friendSilhouette(){
 const id=selectedFriend().id;if(id==='main')return '';
 const paths={
 momo:'M90 30C114 0 149 19 143 48C183 42 197 80 167 100C197 125 170 164 139 150C131 185 90 192 76 157C42 180 10 151 29 122C-5 110 0 67 36 64C23 31 61 5 90 30Z',
 sora:'M39 144C-8 142-8 84 29 78C25 39 69 21 92 50C119 17 164 42 156 77C197 74 203 139 160 145Z',
 hoshi:'M90 8Q96 8 100 20L119 61L164 65Q180 66 167 80L134 112L143 158Q147 174 132 167L90 144L48 167Q33 174 37 158L46 112L13 80Q0 66 16 65L61 61L80 20Q84 8 90 8Z'
 };
 return '<svg class="friend-silhouette" viewBox="0 0 180 180" aria-hidden="true"><defs><linearGradient id="friend-rainbow-'+id+'" x2="1" y2="1"><stop stop-color="#ffd3e5"/><stop offset=".35" stop-color="#ffe5a3"/><stop offset=".65" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e1caff"/></linearGradient></defs><path d="'+paths[id]+'" fill="'+(petLevel()>=100?'url(#friend-rainbow-'+id+')':'var(--pet-fill)')+'" stroke="'+({momo:'#c883a5',sora:'#83aabc',hoshi:'#d7ac52'}[id])+'" stroke-width="4" stroke-linejoin="round"/></svg>';
}

function petArt(){let g=friendState(),growth=Math.min(12,g.growth),season=Math.floor((petLevel()-1)/5),e=slot=>SHOP.find(i=>i.id===g.equipped[slot]);return `<div class="pet-scene ${petLevel()>=100?'pet-rainbow':''}" role="button" tabindex="0" onclick="petNiwatchi()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();petNiwatchi()}" aria-label="レベル${petLevel()}の ${selectedFriend().name}を なでる"><div class="pet-body friend-${selectedFriend().id}" style="--scale:${.83+growth*.022};--pet-fill:${petLevel()>=100?'linear-gradient(135deg,#ffd3e5,#ffe5a3,#d8f3bc,#bfe9ff,#e1caff)':`hsl(${(42+growth+season*29+FRIENDS.findIndex(f=>f.id===game().activeFriend)*65)%360},78%,${72-growth*.4}%)`};background:var(--pet-fill);">${friendSilhouette()}<span class="pet-leaf" style="transform:scale(${.75+growth*.035})">${selectedFriend().id!=='main'?selectedFriend().icon:growth>=12?['🌸','🌻','🌺','🌼','🌷'][season%5]:growth>=9?'🌷':growth>=6?'🌿':'🌱'}</span><span class="pet-face">• •</span><span class="pet-mouth"></span><span class="cheek left"></span><span class="cheek right"></span>${e('hat')?`<span class="pet-hat">${e('hat').emoji}</span>`:''}${e('bow')?`<span class="pet-bow">${e('bow').emoji}</span>`:''}</div>${e('badge')?`<span class="pet-badge">${e('badge').emoji}</span>`:''}</div>`}
let musicCtx=null,musicTimer=null,musicNodes=[],musicGeneration=0;
if(typeof data.music!=='boolean')data.music=true;
function refreshMusic(){let status=!data.music?'♫ おんがく OFF':musicCtx?.state==='running'?'♫ おんがく ON':'♫ おんがくを はじめる';document.querySelectorAll('[data-music]').forEach(b=>b.textContent=status)}
function stopMusic(){musicGeneration++;if(musicTimer)clearInterval(musicTimer);musicTimer=null;for(let n of musicNodes){try{n.stop()}catch{}}musicNodes=[]}
function musicPhrase(){if(!data.music||document.hidden||musicCtx?.state!=='running')return;musicNodes=[];let notes=[523,659,784,659,587,698,784,0,659,784,880,784,659,587,523,0,523,659,784,1047,880,784,659,0,587,659,698,587,523,0,523,0],t=musicCtx.currentTime+.05;notes.forEach((f,i)=>{if(!f)return;let o=musicCtx.createOscillator(),v=musicCtx.createGain(),at=t+i*.34;o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(0,at);v.gain.linearRampToValueAtTime(.022,at+.02);v.gain.exponentialRampToValueAtTime(.0001,at+.28);o.connect(v);v.connect(musicCtx.destination);o.start(at);o.stop(at+.3);musicNodes.push(o)})}
function startMusic(){if(!data.music||document.hidden)return;try{let C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!musicCtx){musicCtx=new C();musicCtx.onstatechange=()=>{refreshMusic();if(musicCtx.state==='running'&&data.music&&!document.hidden&&!musicTimer){musicPhrase();musicTimer=setInterval(musicPhrase,12000)}}}let gen=musicGeneration;musicCtx.resume().then(()=>{if(gen!==musicGeneration||!data.music||document.hidden)return;if(!musicTimer){musicPhrase();musicTimer=setInterval(musicPhrase,12000)}refreshMusic()}).catch(()=>refreshMusic());refreshMusic()}catch{refreshMusic()}}
function musicControl(){if(data.music&&musicCtx?.state==='running'){data.music=false;stopMusic()}else{data.music=true;startMusic()}save();refreshMusic()}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMusic();if('speechSynthesis'in window)speechSynthesis.cancel()}else startMusic()});
function showWelcome(){leaveQuizScreen();session=null;view='welcome';if('speechSynthesis'in window)speechSynthesis.cancel();document.querySelector('#welcome')?.remove();let modal=document.createElement('div');modal.id='welcome';modal.className='welcome';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','welcomeTitle');modal.innerHTML=`<div class="welcome-box"><div style="font-size:58px">🌸📖</div><h1 id="welcomeTitle">だれが あそぶ？</h1><p>じぶんの なまえを おしてね。</p><button class="sub" data-music onclick="musicControl()">♫ おんがくを はじめる</button><p class="muted">おとが でないときは、うえの ボタンを おしてね。</p><div class="profile-buttons">${data.profiles.map((p,i)=>`<button class="profile-button" onclick="chooseChild(${i})"><span>${i%2?'🐰':'🐱'}</span>${esc(p.name)}</button>`).join('')}</div></div>`;document.body.appendChild(modal);document.querySelector('.wrap').inert=true;modal.addEventListener('keydown',e=>{if(e.key!=='Tab')return;let buttons=[...modal.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});modal.querySelector('button').focus();startMusic();refreshMusic()}
function chooseChild(i){if(!data.profiles[i])return;data.current=i;game();save();document.querySelector('#welcome')?.remove();document.querySelector('.wrap').inert=false;refresh();home();startMusic()}
function recommendationFor(which){let old=subject;subject=which;let i=recommended();subject=old;return i}
function dailyStages(){let old=subject,lo=old==='math'?0:JP_START,hi=old==='math'?JP_START:TOPICS.length,learned=[];for(let i=0;i<TOPICS.length;i++)if(subjectForCourse(i)===old&&stats(i).total>0)learned.push(i);let c=learned.length?learned[(new Date().getDate()-1)%learned.length]:lo;return [{i:recommendationFor('math'),title:'🔢 さんすうの みち'},{i:recommendationFor('jp'),title:'📖 ことばの もり'},{i:c,title:'🌼 もういちどの おか'}]}
home=function(){
 leaveQuizScreen();view='home';session=null;refresh();
 let g=game();
 app.innerHTML=`<section class="panel center subject-home">
 <div class="home-avatar-heading"><button class="sub avatar-home" onclick="avatarRoom()" aria-label="じぶんの アバターを きせかえる">${avatarArt()}<span>きせかえ</span></button><div><p class="eyebrow">${esc(person().name)} の にわ</p><h1>きょうは なにを する？</h1></div></div>
 <p>算数 → 国語 → 英語。ひとつずつ、5もんで おはなが さくよ。</p>
 <button class="primary" onclick="startGuidedPractice()">算数から順番に はじめる →</button>
 <p class="muted">すきな教科からでも、同じ教科をつづけても OK。</p>
 <div class="subject-home-choices">
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
finish=function(){if(!session||session.rewarded)return;session.rewarded=true;leaveQuizScreen();let g=game(),d=dailyRecord(),id=String(session.stageStart??session.i),reward=d[id]?3:10;d[id]=(Number.isSafeInteger(d[id])?d[id]:0)+1;g.coins+=reward;let keys=Object.keys(g.days).sort();for(let k of keys.slice(0,-90))delete g.days[k];save();originalFinish();let box=document.createElement('div');box.className='reward';box.innerHTML=`<strong>🪙 ${reward} コイン もらった！</strong><p>いま ${g.coins} コイン。にわっちに あいに いこう。</p><button class="primary" onclick="petRoom()">🌱 にわっちに あう</button>`;app.querySelector('.panel').appendChild(box)};


function petCompany(){
 const g=game();friendState();const active=g.activeFriend;
 const others=FRIENDS.filter(f=>f.id!==active&&mainPetLevel()>=f.at);
 let html='';
 try{html=others.map(f=>{
  g.activeFriend=f.id;
  const art=petArt().replace(/ role="button"| tabindex="0"| onclick="[^"]*"| onkeydown="[^"]*"/g,'');
  return '<button class="pet-companion" onclick="selectFriend(\''+f.id+'\')" aria-label="'+f.name+'を えらぶ">'+art+'<span>'+f.name+'</span></button>';
 }).join('')}finally{g.activeFriend=active}
 return '<div class="pet-company" aria-label="なかまに なった ともだち">'+html+'</div>';
}


const ROOM_ITEMS=[
 ['garden','おにわ','🌿','wall',0,'#edf5df'],['pinkroom','いちごの おへや','🍓','wall',20,'#fbe1e9'],['skyroom','そらの おへや','☁️','wall',20,'#dcedfa'],['nightroom','ほしの おへや','🌟','wall',30,'#e4ddf5'],
 ['none','かぐを しまう','📦','furniture',0,''],['sofa','ソファ','🛋️','furniture',20,''],['bed','ベッド','🛏️','furniture',25,''],['plant','おはな','🪴','furniture',10,''],['bear','ぬいぐるみ','🧸','furniture',15,'']
].map(([id,name,icon,slot,cost,color])=>({id,name,icon,slot,cost,color}));
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
 if(!data.sound)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  if(!petSoundContext||petSoundContext.state==='closed')petSoundContext=new C();
  const ctx=petSoundContext;
  ctx.resume().then(()=>{
   if(!data.sound||document.hidden)return;
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
.pet-room-cast{display:flex;align-items:center;justify-content:center;width:100%;min-height:240px;gap:4px}.pet-room-cast>.pet-scene{flex:1;min-width:0}.pet-company{display:flex;flex-direction:column;gap:3px;flex-shrink:0}.pet-companion{position:relative;background:#ffffffa8;border:1px solid #d6e2c6;border-radius:14px;width:84px;height:77px;padding:0;overflow:hidden}.pet-room-preview .pet-companion .pet-scene{position:absolute;left:0;top:0;width:84px;height:59px;min-height:0;margin:0;background:transparent;overflow:visible;pointer-events:none}.pet-companion .pet-body{scale:.3}.pet-companion .pet-badge{font-size:15px;bottom:0;right:5px}.pet-companion>span{position:absolute;bottom:3px;left:0;right:0;font-size:11px}.pet-companion:focus-visible{outline:3px solid #739654}.pet-room-preview .pet-company:empty{display:none}@media(max-width:650px){.pet-room-preview .pet-room-cast{position:absolute;left:0;top:0;width:45%;height:205px;min-height:0;display:flex;flex-direction:column;gap:0}.pet-room-preview .pet-room-cast>.pet-scene{position:relative;left:auto;top:auto;width:100%;height:135px;min-height:135px;flex:none;margin:0}.pet-room-cast>.pet-scene>.pet-body{scale:.7}.pet-company{flex-direction:row;justify-content:center;width:100%;gap:1px}.pet-companion{width:32%;max-width:65px;height:65px}.pet-room-preview .pet-companion .pet-scene{width:100%;height:48px;min-height:0;top:0}.pet-companion .pet-body{scale:.23}.pet-companion>span{font-size:9px}}

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
.pet-room-preview .pet-company .pet-companion>span{position:static;display:block;flex:none;width:100%;height:22px;line-height:22px;font-size:12px;text-align:center;white-space:nowrap}
.pet-room-preview .pet-company .pet-companion .pet-badge{right:7px;bottom:4px;font-size:17px}
.pet-room-preview .pet-company .pet-companion .pet-scene:before{display:none}
@media(max-width:650px){
 .pet-room-preview .pet-company .pet-companion{width:32%;max-width:65px;height:65px}
 .pet-room-preview .pet-company .pet-companion .pet-scene{height:47px;min-height:47px}
 .pet-room-preview .pet-company .pet-companion .pet-body{transform:translate(-50%,-50%) scale(calc(var(--scale,1)*.26))}
 .pet-room-preview .pet-company .pet-companion>span{height:18px;line-height:18px;font-size:9px}
 .pet-room-preview .pet-company .pet-companion .pet-badge{font-size:12px;right:2px;bottom:1px}
}
`;
feedingStyle.textContent+=`
.pet-room-cast{position:relative}.room-decor{position:absolute;bottom:0;left:10px;font-size:45px;pointer-events:none;filter:drop-shadow(0 3px 2px #0002)}.pet-room-preview .pet-room-cast>.pet-scene{background:transparent}.room-shop{margin:20px 0}.room-shop summary{padding:15px;border-radius:16px;background:#e7eddc;cursor:pointer;font-weight:bold;min-height:48px}.room-shop .shop-item strong{display:block}.friends-playing>.pet-scene,.friends-playing .pet-companion{animation:friendsBounce .5s ease-in-out 4}.friends-playing .pet-companion:nth-child(2){animation-delay:.1s}.friends-playing .pet-companion:nth-child(3){animation-delay:.2s}@keyframes friendsBounce{50%{translate:0 -8px;rotate:3deg}}@media(max-width:650px){.room-decor{font-size:26px;bottom:65px;left:0}}@media(prefers-reduced-motion:reduce){.friends-playing>.pet-scene,.friends-playing .pet-companion{animation:none}}
`;
document.head.appendChild(feedingStyle);
function shopAction(id){let item=SHOP.find(x=>x.id===id);if(!item)return;let g=game(),pet=friendState();if(g.owned.includes(id)){if(pet.equipped[item.slot]===id)delete pet.equipped[item.slot];else pet.equipped[item.slot]=id;save();petRoom('きせかえ したよ！');return}if(g.coins<item.cost)return;g.coins-=item.cost;g.owned.push(id);pet.equipped[item.slot]=id;save();petRoom(item.name+'を てにいれた！')}

const EN_WORDS=[
 [['cat','🐱','ねこ'],['dog','🐶','いぬ'],['rabbit','🐰','うさぎ'],['bear','🐻','くま'],['elephant','🐘','ぞう'],['fish','🐟','さかな'],['bird','🐦','とり'],['frog','🐸','かえる']],
 [['apple','🍎','りんご'],['banana','🍌','ばなな'],['grapes','🍇','ぶどう'],['strawberry','🍓','いちご'],['bread','🍞','ぱん'],['rice ball','🍙','おにぎり'],['cake','🍰','けーき'],['egg','🥚','たまご']],
 [['car','🚗','くるま'],['train','🚃','でんしゃ'],['airplane','✈️','ひこうき'],['bicycle','🚲','じてんしゃ'],['book','📖','ほん'],['umbrella','☂️','かさ'],['hat','👒','ぼうし'],['ball','⚽','ぼーる']]
];
let englishSession=null;
function englishProgress(){
 const p=person();if(!p.english||typeof p.english!=='object')p.english={};
 const e=p.english;
 if(!Number.isInteger(e.level)||e.level<0||e.level>31)e.level=0;
 for(const k of ['strong','total','correct'])if(!Number.isSafeInteger(e[k])||e[k]<0)e[k]=0;
 return e;
}
function englishSay(text){
 if(!data.sound||!('speechSynthesis'in window))return;
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
 e.curriculumKind=null;e.answerAudio=null;e.readingAlternative=false;
 if(typeof buildCurriculumEnglish==='function'&&buildCurriculumEnglish(e,item))return;
 const bank=EN_WORDS[Math.floor(e.level/4)];
 let pool=bank.filter(w=>!e.seen.includes(w[0]));if(!pool.length)pool=bank;
 e.word=pool[rand(0,pool.length-1)];e.seen.push(e.word[0]);
 const others=bank.filter(w=>w!==e.word).map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,e.count-1).map(x=>x.w);
 e.choices=[e.word,...others].map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.w);
 app.innerHTML=`<section class="quiz"><div class="quiztop"><button class="sub" onclick="home()">⌂ にわへ</button><strong>🔤 えいご</strong><span>${e.n+1} / 5</span></div><div class="board"><h1 class="question">${e.word[3]?'あう へんじを えらぼう！':'えいごを きいて、えを えらぼう！'}</h1><button class="primary" onclick="englishSay(englishSession.word[3]||englishSession.word[0])">🔊 もういちど きく</button><div class="choices">${e.choices.map((w,i)=>`<button class="choice" style="font-size:54px;min-height:85px" aria-label="${esc(w[2])}" onclick="${e.word[3]?`englishOptionPreview(${i})`:`englishAnswer(${i},this)`}">${w[1]}${e.word[3]?`<small style="display:block;font-size:14px">🔊 きく</small>`:''}</button>`).join('')}</div>${e.word[3]?'<button class="primary" id="confirmEnglish" disabled onclick="englishConfirm()">へんじを きいて えらぼう</button>':''}<div id="englishFeedback" class="feedback" role="status"></div><div class="actions"><button class="sub" id="englishHint" onclick="englishHint()">💡 ヒント</button><button class="primary hidden" id="englishNext" onclick="englishAdvance()">つぎへ →</button></div></div></section>`;
 englishSay(e.word[3]||e.word[0]);
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
 app.innerHTML=`<section class="panel center"><div class="big">🌷</div><h1>えいごで あそべたね！</h1><p>おはなが ひとつ さいたよ。</p><div class="reward"><strong>🪙 ${reward} コイン もらった！</strong></div><div class="actions"><button class="primary" onclick="petRoom()">🌱 にわっちに あう</button><button class="sub" onclick="home()">にわに もどる</button></div></section>`;
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
function avatarState(p=person()){
 if(!p.avatar||typeof p.avatar!=='object'||Array.isArray(p.avatar))p.avatar={};
 const avatarLevel=1+Math.floor((Number.isSafeInteger(p.game?.growth)&&p.game.growth>=0?p.game.growth:0)/3);
 for(const [k,opts] of Object.entries(AVATAR_OPTIONS))if(!opts.some(o=>o[0]===p.avatar[k]&&(o[2]||1)<=avatarLevel))p.avatar[k]=k==='outfit'?'everyday':k==='accessory'?'none':opts[0][0];
 return p.avatar;
}
function avatarArt(p=person()){
 const a=avatarState(p),hair={brown:'#634235',black:'#30303c',gold:'#dba947',pink:'#ca7496',blue:'#527ba7',purple:'#9573b2',silver:'#b4b9c8',red:'#aa5744'}[a.color],skin={light:'#ffdabd',warm:'#dfaa7e',deep:'#a66f50'}[a.skin],cloth={driver:'#284b77',conductor:'#457f80',everyday:'#8ac7bd',flower:'#f4a7bd',star:'#819cdd',royal:'#b396de',rainbow:'#efb1d4',sport:'#ec9960',marine:'#6bafd0',berry:'#dd718f',forest:'#78a777',magic:'#7c65b4',space:'#54668e',angel:'#e0d7f0'}[a.outfit];
 const back=a.hair==='pony'?'<ellipse cx="137" cy="95" rx="22" ry="48"/>':a.hair==='bun'?'<circle cx="59" cy="27" r="19"/><circle cx="121" cy="27" r="19"/>':a.hair==='wave'?'<path d="M48 59Q39 22 90 22Q141 22 132 59Q151 80 137 99Q155 124 132 147Q110 157 90 146Q65 159 43 143Q28 124 43 103Q26 82 48 59Z"/>':a.hair==='long'?'<path d="M49 67 Q47 22 90 22 Q133 22 131 67 L140 145 Q90 168 40 145Z"/>':a.hair==='twin'?'<ellipse cx="38" cy="93" rx="20" ry="44"/><ellipse cx="142" cy="93" rx="20" ry="44"/>':'';
 const eyes=a.face==='sleepy'?'<path d="M65 80q7 7 14 0 M101 80q7 7 14 0" fill="none" stroke="#443b43" stroke-width="4" stroke-linecap="round"/>':a.face==='surprise'?'<ellipse cx="72" cy="79" rx="5" ry="7"/><ellipse cx="108" cy="79" rx="5" ry="7"/>':a.face==='spark'?'<path d="M72 70l3 6 7 3-7 3-3 6-3-6-7-3 7-3Z M108 70l3 6 7 3-7 3-3 6-3-6-7-3 7-3Z"/>':a.face==='happy'?'<path d="M65 81q7-10 14 0 M101 81q7-10 14 0" fill="none" stroke="#443b43" stroke-width="4" stroke-linecap="round"/>':a.face==='wink'?'<circle cx="72" cy="79" r="4"/><path d="M102 77l10 4-10 4" fill="none" stroke="#443b43" stroke-width="3"/>':'<circle cx="72" cy="79" r="4"/><circle cx="108" cy="79" r="4"/>';
 const headwear={railcap:'<path d="M48 31Q90 2 132 31L127 46H53Z" fill="#284b77"/><path d="M53 40H127Q90 64 53 40" fill="#182f50"/><circle cx="90" cy="29" r="6" fill="#f5cf69"/>',railbag:'<path d="M62 128L113 177" stroke="#69503d" stroke-width="6"/><rect x="98" y="155" width="30" height="26" rx="5" fill="#aa7750"/>',cat:'<path d="M53 44L49 13L77 31M103 31L131 13L127 44" fill="'+hair+'" stroke="#554653" stroke-width="3"/>',bunny:'<ellipse cx="69" cy="22" rx="9" ry="22" fill="#fff0ed"/><ellipse cx="111" cy="22" rx="9" ry="22" fill="#fff0ed"/><path d="M69 9v22M111 9v22" stroke="#e8a0b0" stroke-width="6"/>',magic:'<path d="M58 36L85 1L119 36Z" fill="#7955ad"/><ellipse cx="89" cy="37" rx="43" ry="7" fill="#7955ad"/><text x="83" y="28" font-size="17">★</text>'}[a.accessory]||'';
 const accessory={railcap:'',railbag:'',none:'',ribbon:'🎀',flower:'🌸',crown:'👑',sparkle:'✨',bowblue:'🦋',cat:'',bunny:'',hat:'👒',magic:'',moon:'🌙',gem:'💎'}[a.accessory];
 return '<svg class="avatar-art" viewBox="0 0 180 210" role="img" aria-label="じぶんの アバター"><ellipse cx="90" cy="196" rx="62" ry="8" fill="#d7dfce"/><g fill="'+hair+'">'+back+'</g><path d="M69 125h42q21 12 25 57H44q4-45 25-57" fill="'+cloth+'" stroke="#ffffff" stroke-width="3"/><path d="M82 119v13q8 9 16 0v-13" fill="'+skin+'"/><ellipse cx="90" cy="78" rx="39" ry="45" fill="'+skin+'"/><path d="'+(a.hair==='crop'?'M50 63Q46 24 90 25Q134 24 130 63L117 46 105 50 91 43 75 49 63 45Z':a.hair==='short'?'M50 78Q39 20 90 25Q140 20 130 74L107 51 94 62 74 50Z':a.hair==='bob'?'M49 97V66Q46 23 90 23Q134 23 131 66V97L120 91V59Q94 68 63 54V95Z':'M50 74Q42 23 90 23Q138 23 130 74L114 53Q91 66 63 50Z')+'" fill="'+hair+'"/><g fill="#443b43">'+eyes+'</g><ellipse cx="62" cy="92" rx="7" ry="4" fill="#e99497"/><ellipse cx="118" cy="92" rx="7" ry="4" fill="#e99497"/><path d="M80 96q10 12 20 0" fill="none" stroke="#a75060" stroke-width="3" stroke-linecap="round"/><text x="90" y="166" text-anchor="middle" font-size="26">'+({driver:'🚆',conductor:'🎫',everyday:'♡',flower:'🌼',star:'⭐',royal:'💎',rainbow:'🌈',sport:'⚽',marine:'⚓',berry:'🍓',forest:'🍀',magic:'⭐',space:'🚀',angel:'🪽'}[a.outfit])+'</text><text x="90" y="36" text-anchor="middle" font-size="34">'+accessory+'</text>'+headwear+'</svg>';
}
function setAvatar(key,id){
 const option=AVATAR_OPTIONS[key]?.find(o=>o[0]===id);if(!option||mainPetLevel()<(option[2]||1))return;
 avatarState()[key]=id;save();avatarRoom('きがえたよ！ じどうで ほぞんしたよ。');
}
function avatarRoom(message=''){
 const scroll=view==='avatar'?(app.querySelector('.avatar-options')?.scrollTop||0):0;
 leaveQuizScreen();view='avatar';session=null;
 const a=avatarState(),labels={hair:'かみがた',face:'おかお',color:'かみの いろ',skin:'はだの いろ',outfit:'おようふく',accessory:'かざり'};
 app.innerHTML='<section class="panel avatar-room"><button class="sub" onclick="home()">← にわへ</button><h1 class="center">じぶんの アバター</h1><div class="avatar-editor"><div class="avatar-preview">'+avatarArt()+'<strong>'+esc(person().name)+'</strong><p>にわっち レベル '+mainPetLevel()+'</p><p class="muted">にわっちが そだつと<br>きせかえが ふえるよ！<br>コインは つかわないよ。</p><p role="status">'+esc(message)+'</p></div><div class="avatar-options" tabindex="0" aria-label="きせかえを えらぶ">'+Object.entries(AVATAR_OPTIONS).map(([k,opts])=>'<fieldset class="avatar-group"><legend>'+labels[k]+'</legend><div>'+opts.map(([id,name,level=1])=>'<button class="sub" aria-pressed="'+(a[k]===id)+'" onclick="setAvatar(\''+k+'\',\''+id+'\')" '+(mainPetLevel()<level?'disabled':'')+'>'+name+(level>1?'<small>'+(mainPetLevel()<level?'🔒 にわっち Lv.'+level:'✨ つかえるよ')+'</small>':'')+'</button>').join('')+'</div></fieldset>').join('')+'</div></div></section>';
 const options=app.querySelector('.avatar-options');if(options)options.scrollTop=scroll;
}
const avatarStyle=document.createElement('style');
avatarStyle.textContent='.home-avatar-heading{display:flex;align-items:center;justify-content:center;gap:20px}.home-avatar-heading h1{margin:4px 0;font-size:clamp(22px,3vw,32px)}.home-avatar-heading .avatar-home{margin:0;padding:6px 12px;flex-direction:column;gap:0;flex-shrink:0}.home-avatar-heading .avatar-art{width:72px}.home-avatar-heading .avatar-home span{font-size:13px}.subject-home{margin:8px auto;padding:18px}.subject-home-choices{margin:16px 0;gap:14px}.subject-home-card{min-height:140px;gap:8px;padding:14px}.subject-home-card span{font-size:44px}.subject-home-card strong{font-size:26px}.subject-home-pet{margin-top:12px;gap:12px}@media(max-width:500px){.home-avatar-heading{gap:10px}.home-avatar-heading .avatar-art{width:58px}.subject-home-choices{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.subject-home-card{min-height:110px;padding:8px 2px}.subject-home-card span{font-size:32px}.subject-home-card strong{font-size:19px}.subject-home{padding:12px}.home-avatar-heading h1{font-size:21px}}.avatar-art{width:180px;max-width:100%;height:auto;display:block;margin:auto}.avatar-home{display:flex;align-items:center;justify-content:center;gap:8px;margin:18px auto 0}.avatar-home .avatar-art{width:58px;margin:0}.avatar-editor{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start}.avatar-preview{text-align:center;position:sticky;top:12px;background:#f1f5e9;border-radius:24px;padding:20px}.avatar-group{border:0;padding:0;margin:0 0 22px;min-width:0}.avatar-group legend{font-weight:bold;margin-bottom:10px}.avatar-group>div{display:flex;flex-wrap:wrap;gap:10px}.avatar-group button{min-height:58px;min-width:100px}.avatar-group small{display:block;font-size:12px;margin-top:5px}.avatar-group [aria-pressed=true]{outline:3px solid #749759;background:#e1edce}.avatar-group button:disabled{opacity:.6}@media(max-width:600px){.avatar-editor{grid-template-columns:1fr}.avatar-preview{position:static;padding:12px}.avatar-preview .avatar-art{width:130px}}';
avatarStyle.textContent+=`
.avatar-room{position:fixed;inset:10px;z-index:50;max-width:none;margin:0;display:flex;flex-direction:column;overflow:hidden;padding:16px}
.avatar-room>button{align-self:flex-start;flex:none;min-height:44px}
.avatar-room>h1{font-size:24px;flex:none;margin:8px 0}
.avatar-room .avatar-editor{flex:1;min-height:0;grid-template-columns:minmax(160px,30%) minmax(0,1fr);overflow:hidden}
.avatar-room .avatar-preview{position:static;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:12px}
.avatar-room .avatar-preview .avatar-art{width:180px;max-height:42vh;flex-shrink:1;min-height:0;margin:0}
.avatar-room .avatar-preview p{margin:6px 0;font-size:13px}
.avatar-room .avatar-options{overflow-y:auto;min-height:0;padding:6px 12px 24px 6px;overscroll-behavior:contain;scrollbar-gutter:stable}
@media(max-width:600px){
 .avatar-room{inset:5px;padding:10px}
 .avatar-room>h1{font-size:20px;margin:4px 0}
 .avatar-room .avatar-editor{grid-template-columns:1fr;grid-template-rows:160px minmax(0,1fr);gap:10px}
 .avatar-room .avatar-preview{position:relative;padding:8px 8px 8px 45%;justify-content:center}
 .avatar-room .avatar-preview .avatar-art{position:absolute;left:2%;top:5px;width:40%;height:150px;max-height:150px}
 .avatar-room .avatar-preview p{font-size:11px;margin:3px 0}
}
`;
document.head.appendChild(avatarStyle);


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
function duoArt(){const old=game().activeFriend;game().activeFriend='main';const pet=petArt().replace(/ role="button"| tabindex="0"| onclick="[^"]*"| onkeydown="[^"]*"/g,'');game().activeFriend=old;return '<div class="garden-duo" aria-label="アバターと にわっちが いっしょに おいわい">'+avatarArt()+'<span class="duo-heart">🙌</span>'+pet+'</div>'}
function celebrateAnswer(target){const box=document.querySelector(target);if(!box)return;const duo=document.createElement('div');duo.className='answer-duo';duo.innerHTML=duoArt();box.appendChild(duo)}
function storyCard(i){const row=GARDEN_STORIES[i];return '<article class="garden-story"><h2>'+row[0]+'</h2><p>'+row[1]+'</p><button class="sub" onclick="speak(GARDEN_STORIES['+i+'][1])">🔊 おはなしを きく</button></article>'}
function storyReward(){
 const n=storyProgress();person().storyClears=n+1;save();
 const box=document.createElement('div');box.className='story-reward';
 box.innerHTML=duoArt()+'<p class="center"><strong>いっしょに がんばったね！</strong></p>'+(n<GARDEN_STORIES.length?'<p>📖 おはなし '+(n+1)+' / '+GARDEN_STORIES.length+'</p>'+storyCard(n):'<p class="center">📖 おはなしを ぜんぶ よんだね！ おきにいりを また よもう。</p>')+'<details><summary>📚 これまでの おはなし</summary>'+GARDEN_STORIES.slice(0,Math.min(n+1,GARDEN_STORIES.length)).map((_,i)=>storyCard(i)).join('')+'</details>';
 app.querySelector('.panel')?.appendChild(box);
}

let autoNextTimer=null;
function cancelAutoNext(){clearTimeout(autoNextTimer);autoNextTimer=null}
function scheduleAutoNext(english){
 cancelAutoNext();
 const active=english?englishSession:session,questionNumber=active.n;
 const button=document.querySelector(english?'#englishNext':'#next');if(button)button.classList.add('hidden');
 autoNextTimer=setTimeout(()=>{
  autoNextTimer=null;
  if(document.hidden||view!=='quiz'||(english?englishSession:session)!==active||active.n!==questionNumber||!active.done)return;
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
answer=function(i,el){const was=session?.done;duoAnswer(i,el);if(!was&&session?.done){celebrateAnswer('#feedback');scheduleAutoNext(false)}};
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
 railTripTimer=setTimeout(()=>{if(view!=='rail')return;train.classList.remove('rail-moving');app.querySelector('.rail-status').textContent='とうちゃく！ おかえりなさい！'},2400);
}
function railRoom(message=''){
 leaveQuizScreen();session=null;view='rail';const r=railState(),g=game();
 const passengerHTML=r.passengers.map(id=>{const f=FRIENDS.find(f=>f.id===id);return '<span title="'+f.name+'">'+f.icon+'</span>'}).join('');
 app.innerHTML='<section class="panel rail-room"><div class="quiztop"><button class="sub" onclick="petRoom()">← にわっちへ</button><span>🪙 '+g.coins+'</span></div><h1>じぶんの でんしゃ</h1><div class="rail-station station-'+r.station+'"><div class="rail-sign">'+RAIL_STATIONS[r.station][1]+' '+RAIL_STATIONS[r.station][0]+'</div><div class="rail-driver">'+avatarArt()+'</div><div class="rail-scroll" tabindex="0" aria-label="でんしゃ。よこに うごかして みられるよ"><div class="rail-train">'+Array.from({length:r.cars},(_,i)=>'<div class="rail-car '+(i===0?r.head:'')+'" style="--train-color:'+RAIL_COLORS[r.color][1]+'"><div class="rail-windows">'+(i===0?passengerHTML:'🪟 🪟')+'</div><div class="rail-pattern">'+({stripe:'━━━━',stars:'★ ★ ★',dots:'● ● ●'}[r.pattern])+'</div></div>').join('')+'</div></div></div><button class="primary" onclick="railDepart()">🚂 しゅっぱつ！</button><p class="rail-status" role="status">'+esc(message||'ともだちを おすと のれるよ。')+'</p><div class="rail-options">'+FRIENDS.filter(f=>mainPetLevel()>=f.at).map(f=>'<button class="sub" aria-pressed="'+r.passengers.includes(f.id)+'" onclick="railPassenger(\''+f.id+'\')">'+f.icon+' '+f.name+(r.passengers.includes(f.id)?' ✓':'')+'</button>').join('')+'</div><h2>いろ・もよう・かたち（レベルで かいほう）</h2>'+[['color',Object.entries(RAIL_COLORS).map(([id,v])=>[id,v[0]])],['pattern',[['stripe','しましま'],['stars','ほし'],['dots','みずたま']]],['head',[['local','でんしゃ'],['express','とっきゅう'],['steam','きかんしゃ']]]].map(([key,opts])=>'<div class="rail-options">'+opts.map(([id,name])=>'<button class="sub" aria-pressed="'+(r[key]===id)+'" onclick="railPick(\''+key+'\',\''+id+'\')">'+name+'</button>').join('')+'</div>').join('')+'<h2>しゃりょう・えき</h2><button class="sub" onclick="railBuy(\'car\')" '+(g.coins<10||r.cars>=8?'disabled':'')+'>'+r.cars+'りょう / 8りょう · '+(r.cars>=8?'いっぱい！':'10🪙で 1りょう ふやす')+'</button><div class="rail-options">'+Object.entries(RAIL_STATIONS).map(([id,v])=>'<button class="sub" aria-pressed="'+(r.station===id)+'" onclick="railBuy(\''+id+'\')" '+(!r.owned.includes(id)&&g.coins<v[2]?'disabled':'')+'>'+v[1]+' '+v[0]+' · '+(r.owned.includes(id)?'えらぶ':v[2]+'🪙')+'</button>').join('')+'</div><button class="sub" onclick="avatarRoom()">🧑‍✈️ せいふくに きがえる</button><p class="muted">おとは「おと ON / OFF」で きりかえられるよ。</p></section>';
}
const railStyle=document.createElement('style');
railStyle.textContent='.rail-room{text-align:center}.rail-room h1{font-size:28px}.rail-station{position:relative;background:linear-gradient(#d9efff 65%,#e5dcc6 65%);border-radius:22px;padding:18px 12px 26px;overflow:hidden}.station-crossing:before{content:"●";position:absolute;right:22px;top:40px;border-left:8px solid #dfbb37;border-bottom:8px solid #dfbb37;height:75px;width:70px;color:#d65b55;font-size:28px}.station-depot{background:linear-gradient(90deg,#b7c8d0 8%,transparent 8%,transparent 92%,#b7c8d0 92%),linear-gradient(#d5e3ea 16%,#f3f0e7 16%,#f3f0e7 80%,#d6c8ad 80%);border-top:14px solid #7a929e}.station-platform .rail-sign{border-bottom:7px solid #e7c65d}.rail-sign{font-size:25px;font-weight:bold}.rail-driver .avatar-art{width:65px}.rail-scroll{overflow-x:auto;padding:8px 0 24px}.rail-train{display:flex;width:max-content;gap:10px;padding:8px 15px}.rail-car{position:relative;width:155px;height:90px;background:var(--train-color);border-radius:15px 15px 8px 8px;border:3px solid #3b5365;flex-shrink:0}.rail-car:after{content:"●　　●";position:absolute;bottom:-22px;left:16px;color:#354450;font-size:25px}.rail-car.express{border-radius:60px 16px 8px 8px}.rail-car.steam:before{content:"";position:absolute;left:12px;top:-20px;width:18px;height:20px;background:#455465}.rail-windows{margin:12px 8px 4px;background:#e6f7ff;border-radius:7px;height:38px;display:flex;justify-content:space-evenly;align-items:center;font-size:23px}.rail-pattern{color:#fff;font-size:18px}.rail-options{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:16px 0}.rail-options button{min-height:48px}.rail-options [aria-pressed=true]{outline:3px solid #679261;background:#e1edce}.rail-moving{animation:railTravel 2.4s ease-in-out}.rail-status{min-height:26px}@keyframes railTravel{0%,100%{translate:0}50%{translate:55px 0}}@media(prefers-reduced-motion:reduce){.rail-moving{animation:none}}';
document.head.appendChild(railStyle);


const UNLOCK_LEVELS={
 rail:{color:{blue:1,red:10,green:25,yellow:50,pink:75},head:{local:1,express:40,steam:100},pattern:{stripe:1,dots:20,stars:60}},
 station:{platform:1,crossing:30,depot:70},
 cars:[1,10,20,35,50,65,80,100],
 pet:{flower:5,cap:15,ribbon:25,star:45,butterfly:70,crown:100},
 room:{garden:1,none:1,plant:10,pinkroom:20,sofa:35,skyroom:45,bear:55,bed:75,nightroom:100}
};
const AVATAR_UNLOCKS={outfit:{everyday:1,driver:5,conductor:15,sport:10,flower:20,marine:30,berry:40,forest:50,royal:60,magic:70,space:80,rainbow:90,angel:100},accessory:{none:1,railcap:5,railbag:15,bowblue:10,ribbon:20,cat:25,flower:30,bunny:40,hat:50,crown:60,magic:70,moon:80,gem:90,sparkle:100}};
for(const [key,levels] of Object.entries(AVATAR_UNLOCKS))for(const option of AVATAR_OPTIONS[key])option[2]=levels[option[0]]||1;
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
