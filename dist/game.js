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
function petArt(){let g=friendState(),growth=Math.min(12,g.growth),season=Math.floor((petLevel()-1)/5),e=slot=>SHOP.find(i=>i.id===g.equipped[slot]);return `<div class="pet-scene ${petLevel()>=100?'pet-rainbow':''}" role="button" tabindex="0" onclick="petNiwatchi()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();petNiwatchi()}" aria-label="レベル${petLevel()}の ${selectedFriend().name}を なでる"><div class="pet-body" style="--scale:${.83+growth*.022};background:${petLevel()>=100?'linear-gradient(135deg,#ffd3e5,#ffe5a3,#d8f3bc,#bfe9ff,#e1caff)':`hsl(${(42+growth+season*29+FRIENDS.findIndex(f=>f.id===game().activeFriend)*65)%360},78%,${72-growth*.4}%)`};"><span class="pet-leaf" style="transform:scale(${.75+growth*.035})">${selectedFriend().id!=='main'?selectedFriend().icon:growth>=12?['🌸','🌻','🌺','🌼','🌷'][season%5]:growth>=9?'🌷':growth>=6?'🌿':'🌱'}</span><span class="pet-face">• •</span><span class="pet-mouth"></span><span class="cheek left"></span><span class="cheek right"></span>${e('hat')?`<span class="pet-hat">${e('hat').emoji}</span>`:''}${e('bow')?`<span class="pet-bow">${e('bow').emoji}</span>`:''}</div>${e('badge')?`<span class="pet-badge">${e('badge').emoji}</span>`:''}</div>`}
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
function dailyStages(){let old=subject,lo=old==='math'?0:JP_START,hi=old==='math'?JP_START:TOPICS.length,learned=[];for(let i=lo;i<hi;i++)if(stats(i).total>0)learned.push(i);let c=learned.length?learned[(new Date().getDate()-1)%learned.length]:lo;return [{i:recommendationFor('math'),title:'🔢 さんすうの みち'},{i:recommendationFor('jp'),title:'📖 ことばの もり'},{i:c,title:'🌼 もういちどの おか'}]}
home=function(){
 leaveQuizScreen();view='home';session=null;refresh();
 let g=game();
 app.innerHTML=`<section class="panel center subject-home">
 <div class="home-avatar-heading"><button class="sub avatar-home" onclick="avatarRoom()" aria-label="じぶんの アバターを きせかえる">${avatarArt()}<span>きせかえ</span></button><div><p class="eyebrow">${esc(person().name)} の にわ</p><h1>きょうは なにを する？</h1></div></div>
 <p>すきな ほうを おしてね。5もんで おはなが さくよ。</p>
 <div class="subject-home-choices">
 <button class="subject-home-card math" onclick="start(recommendationFor('math'),true)"><span aria-hidden="true">🔢</span><strong>さんすう</strong></button>
 <button class="subject-home-card language" onclick="start(recommendationFor('jp'),true)"><span aria-hidden="true">📖</span><strong>こくご</strong></button>
 <button class="subject-home-card english" onclick="startEnglish()"><span aria-hidden="true">🔤</span><strong>えいご</strong></button></div>
 <div class="subject-home-pet"><span class="coin">🪙 ${g.coins} コイン</span><button class="sub" onclick="petRoom()">🌱 にわっちと ともだち · Lv.${mainPetLevel()}</button></div>
 
 <p class="muted">🌷 そだてた おはな：${Number(person().flowers)||0}こ</p>
 </section>`;
 refreshMusic();
};
const originalStart=start;
start=function(i,auto){subject=i<JP_START?'math':'jp';let level=auto?adaptiveState().level:i;enterQuizScreen();originalStart(level,auto);session.stageStart=auto?'auto-'+subject:i;session.rewarded=false};
const originalFinish=finish;
finish=function(){if(!session||session.rewarded)return;session.rewarded=true;leaveQuizScreen();let g=game(),d=dailyRecord(),id=String(session.stageStart??session.i),reward=d[id]?3:10;d[id]=(Number.isSafeInteger(d[id])?d[id]:0)+1;g.coins+=reward;let keys=Object.keys(g.days).sort();for(let k of keys.slice(0,-90))delete g.days[k];save();originalFinish();let box=document.createElement('div');box.className='reward';box.innerHTML=`<strong>🪙 ${reward} コイン もらった！</strong><p>いま ${g.coins} コイン。にわっちに あいに いこう。</p><button class="primary" onclick="petRoom()">🌱 にわっちに あう</button>`;app.querySelector('.panel').appendChild(box)};

function petRoom(message=''){
 const controlsScroll=view==='pet'?(app.querySelector('.pet-room-controls')?.scrollTop||0):0;
 leaveQuizScreen();view='pet';session=null;let g=game(),lv=petLevel();
 app.innerHTML=`<section class="panel pet-room"><div class="quiztop pet-room-top"><button class="sub" onclick="home()">← にわへ</button><span class="coin">🪙 ${g.coins} コイン</span></div>
 <div class="pet-room-layout">
 <div class="pet-room-preview center"><h1>${esc(person().name)}の ${selectedFriend().name}</h1>
 ${petArt()}<div class="pet-room-level">${petLevelBadge()}</div>
 ${lv>=100?'<div class="rainbow-title">🌈 にじいろの '+selectedFriend().name+' 🌈</div>':''}
 <p class="game-status" role="status">${esc(message)||'タッチして なでなでしてね ♥'}</p></div>
 <div class="pet-room-controls" tabindex="0" aria-label="ごはんと きせかえ"><h2>いっしょに あそぶ こ</h2>${friendPicker()}
 <h2>ごはんを あげる</h2><div class="pet-foods">${PET_FOODS.map(f=>`<button class="sub" onclick="feedPet('${f.id}')" ${g.coins<10?'disabled':''}><span>${f.emoji}</span>${f.name}<small>10🪙 · せいちょう ＋1</small></button>`).join('')}</div>
 <h2>きせかえやさん</h2><p class="muted">かった ものは、ずっと つかえるよ。</p><div class="wardrobe">${SHOP.map(item=>{let owned=g.owned.includes(item.id),on=friendState().equipped[item.slot]===item.id;return `<div class="shop-item"><div style="font-size:36px">${item.emoji}</div><strong>${item.name}</strong><button onclick="shopAction('${item.id}')" ${!owned&&g.coins<item.cost?'disabled':''}>${on?'はずす':owned?'つける':item.cost+'🪙で かう'}</button></div>`}).join('')}</div>
 <p class="muted">おやすみしても、ちいさく ならないよ。<br>5もん クリアして コインを あつめよう！</p></div></div></section>`;
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
 const scene=app.querySelector('.pet-scene');if(!scene)return;
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
 playFeedSound(false);petReaction('pet-petted','♥ ♥ ♥');
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
 if(!Number.isInteger(e.level)||e.level<0||e.level>11)e.level=0;
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
 e.help=false;e.done=false;
 const pool=e.bank.filter(w=>!e.seen.includes(w[0]));
 e.word=pool[rand(0,pool.length-1)];e.seen.push(e.word[0]);
 const others=e.bank.filter(w=>w!==e.word).map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,e.count-1).map(x=>x.w);
 e.choices=[e.word,...others].map(w=>({w,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.w);
 app.innerHTML=`<section class="quiz"><div class="quiztop"><button class="sub" onclick="home()">⌂ にわへ</button><strong>🔤 えいご</strong><span>${e.n+1} / 5</span></div><div class="board"><h1 class="question">えいごを きいて、えを えらぼう！</h1><button class="primary" onclick="englishSay(englishSession.word[0])">🔊 もういちど きく</button><div class="choices">${e.choices.map((w,i)=>`<button class="choice" style="font-size:54px;min-height:85px" aria-label="${esc(w[2])}" onclick="englishAnswer(${i},this)">${w[1]}</button>`).join('')}</div><div id="englishFeedback" class="feedback" role="status"></div><div class="actions"><button class="sub" id="englishHint" onclick="englishHint()">💡 ヒント</button><button class="primary hidden" id="englishNext" onclick="englishAdvance()">つぎへ →</button></div></div></section>`;
 englishSay(e.word[0]);
}
function englishHint(){
 const e=englishSession;if(view!=='quiz'||!e||e.done)return;e.help=true;
 document.querySelector('#englishFeedback').textContent='「'+e.word[2]+'」を さがしてね。';speak(e.word[2]+'を さがしてね');
}
function englishAnswer(i,button){
 const e=englishSession;if(view!=='quiz'||!e||e.done||!e.choices[i])return;
 if(e.choices[i][0]!==e.word[0]){button.disabled=true;englishHint();return}
 e.done=true;if(!e.help)e.clean++;
 const p=englishProgress();p.total++;if(!e.help)p.correct++;save();
 document.querySelectorAll('.choice').forEach(b=>b.disabled=true);button.classList.add('correct');
 document.querySelector('#englishHint').disabled=true;document.querySelector('#englishNext').classList.remove('hidden');
 document.querySelector('#englishFeedback').textContent='✨ '+e.word[0]+' ＝ '+e.word[2]+'！';
 englishSay(e.word[0]+'. Great!');
}
function englishAdvance(){if(!englishSession?.done)return;englishSession.n++;englishNext()}
function englishFinish(){
 const e=englishSession;if(!e||e.rewarded)return;e.rewarded=true;
 const p=englishProgress();p.strong=e.clean>=4?p.strong+1:0;
 // Repeat each small step for five confident sets; ease after difficulty.
 if(p.strong>=5&&p.level<11){p.level++;p.strong=0}
 else if(e.clean<=2&&p.level>0){p.level--;p.strong=0}
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
 outfit:[['everyday','おさんぽ',1],['flower','おはな',5],['star','ほしぞら',10],['royal','プリンセス',25],['rainbow','にじいろ',50],['sport','スポーツ',1],['marine','マリン',5],['berry','いちご',10],['forest','もりの たんけん',15],['magic','まほうつかい',30],['space','うちゅう',75],['angel','てんし',100]],
 accessory:[['none','なし',1],['ribbon','リボン',5],['flower','おはなかざり',10],['crown','おうかん',25],['sparkle','きらきら',100],['bowblue','あおい リボン',1],['cat','ねこみみ',5],['bunny','うさみみ',10],['hat','むぎわら',15],['magic','まほうの ぼうし',30],['moon','おつきさま',50],['gem','ほうせき',75]]
};
function avatarState(p=person()){
 if(!p.avatar||typeof p.avatar!=='object'||Array.isArray(p.avatar))p.avatar={};
 for(const [k,opts] of Object.entries(AVATAR_OPTIONS))if(!opts.some(o=>o[0]===p.avatar[k]))p.avatar[k]=opts[0][0];
 return p.avatar;
}
function avatarArt(p=person()){
 const a=avatarState(p),hair={brown:'#634235',black:'#30303c',gold:'#dba947',pink:'#ca7496',blue:'#527ba7',purple:'#9573b2',silver:'#b4b9c8',red:'#aa5744'}[a.color],skin={light:'#ffdabd',warm:'#dfaa7e',deep:'#a66f50'}[a.skin],cloth={everyday:'#8ac7bd',flower:'#f4a7bd',star:'#819cdd',royal:'#b396de',rainbow:'#efb1d4',sport:'#ec9960',marine:'#6bafd0',berry:'#dd718f',forest:'#78a777',magic:'#7c65b4',space:'#54668e',angel:'#e0d7f0'}[a.outfit];
 const back=a.hair==='pony'?'<ellipse cx="137" cy="95" rx="22" ry="48"/>':a.hair==='bun'?'<circle cx="59" cy="27" r="19"/><circle cx="121" cy="27" r="19"/>':a.hair==='wave'?'<path d="M48 59Q39 22 90 22Q141 22 132 59Q151 80 137 99Q155 124 132 147Q110 157 90 146Q65 159 43 143Q28 124 43 103Q26 82 48 59Z"/>':a.hair==='long'?'<path d="M49 67 Q47 22 90 22 Q133 22 131 67 L140 145 Q90 168 40 145Z"/>':a.hair==='twin'?'<ellipse cx="38" cy="93" rx="20" ry="44"/><ellipse cx="142" cy="93" rx="20" ry="44"/>':'';
 const eyes=a.face==='sleepy'?'<path d="M65 80q7 7 14 0 M101 80q7 7 14 0" fill="none" stroke="#443b43" stroke-width="4" stroke-linecap="round"/>':a.face==='surprise'?'<ellipse cx="72" cy="79" rx="5" ry="7"/><ellipse cx="108" cy="79" rx="5" ry="7"/>':a.face==='spark'?'<path d="M72 70l3 6 7 3-7 3-3 6-3-6-7-3 7-3Z M108 70l3 6 7 3-7 3-3 6-3-6-7-3 7-3Z"/>':a.face==='happy'?'<path d="M65 81q7-10 14 0 M101 81q7-10 14 0" fill="none" stroke="#443b43" stroke-width="4" stroke-linecap="round"/>':a.face==='wink'?'<circle cx="72" cy="79" r="4"/><path d="M102 77l10 4-10 4" fill="none" stroke="#443b43" stroke-width="3"/>':'<circle cx="72" cy="79" r="4"/><circle cx="108" cy="79" r="4"/>';
 const headwear={cat:'<path d="M53 44L49 13L77 31M103 31L131 13L127 44" fill="'+hair+'" stroke="#554653" stroke-width="3"/>',bunny:'<ellipse cx="69" cy="22" rx="9" ry="22" fill="#fff0ed"/><ellipse cx="111" cy="22" rx="9" ry="22" fill="#fff0ed"/><path d="M69 9v22M111 9v22" stroke="#e8a0b0" stroke-width="6"/>',magic:'<path d="M58 36L85 1L119 36Z" fill="#7955ad"/><ellipse cx="89" cy="37" rx="43" ry="7" fill="#7955ad"/><text x="83" y="28" font-size="17">★</text>'}[a.accessory]||'';
 const accessory={none:'',ribbon:'🎀',flower:'🌸',crown:'👑',sparkle:'✨',bowblue:'🦋',cat:'',bunny:'',hat:'👒',magic:'',moon:'🌙',gem:'💎'}[a.accessory];
 return '<svg class="avatar-art" viewBox="0 0 180 210" role="img" aria-label="じぶんの アバター"><ellipse cx="90" cy="196" rx="62" ry="8" fill="#d7dfce"/><g fill="'+hair+'">'+back+'</g><path d="M69 125h42q21 12 25 57H44q4-45 25-57" fill="'+cloth+'" stroke="#ffffff" stroke-width="3"/><path d="M82 119v13q8 9 16 0v-13" fill="'+skin+'"/><ellipse cx="90" cy="78" rx="39" ry="45" fill="'+skin+'"/><path d="'+(a.hair==='crop'?'M50 63Q46 24 90 25Q134 24 130 63L117 46 105 50 91 43 75 49 63 45Z':a.hair==='short'?'M50 78Q39 20 90 25Q140 20 130 74L107 51 94 62 74 50Z':a.hair==='bob'?'M49 97V66Q46 23 90 23Q134 23 131 66V97L120 91V59Q94 68 63 54V95Z':'M50 74Q42 23 90 23Q138 23 130 74L114 53Q91 66 63 50Z')+'" fill="'+hair+'"/><g fill="#443b43">'+eyes+'</g><ellipse cx="62" cy="92" rx="7" ry="4" fill="#e99497"/><ellipse cx="118" cy="92" rx="7" ry="4" fill="#e99497"/><path d="M80 96q10 12 20 0" fill="none" stroke="#a75060" stroke-width="3" stroke-linecap="round"/><text x="90" y="166" text-anchor="middle" font-size="26">'+({everyday:'♡',flower:'🌼',star:'⭐',royal:'💎',rainbow:'🌈',sport:'⚽',marine:'⚓',berry:'🍓',forest:'🍀',magic:'⭐',space:'🚀',angel:'🪽'}[a.outfit])+'</text><text x="90" y="36" text-anchor="middle" font-size="34">'+accessory+'</text>'+headwear+'</svg>';
}
function setAvatar(key,id){
 const option=AVATAR_OPTIONS[key]?.find(o=>o[0]===id);if(!option||mainPetLevel()<(option[2]||1))return;
 avatarState()[key]=id;save();avatarRoom('きがえたよ！ じどうで ほぞんしたよ。');
}
function avatarRoom(message=''){
 leaveQuizScreen();view='avatar';session=null;
 const a=avatarState(),labels={hair:'かみがた',face:'おかお',color:'かみの いろ',skin:'はだの いろ',outfit:'おようふく',accessory:'かざり'};
 app.innerHTML='<section class="panel"><button class="sub" onclick="home()">← にわへ</button><h1 class="center">じぶんの アバター</h1><div class="avatar-editor"><div class="avatar-preview">'+avatarArt()+'<strong>'+esc(person().name)+'</strong><p>にわっち レベル '+mainPetLevel()+'</p><p class="muted">にわっちが そだつと<br>きせかえが ふえるよ！<br>コインは つかわないよ。</p><p role="status">'+esc(message)+'</p></div><div>'+Object.entries(AVATAR_OPTIONS).map(([k,opts])=>'<fieldset class="avatar-group"><legend>'+labels[k]+'</legend><div>'+opts.map(([id,name,level=1])=>'<button class="sub" aria-pressed="'+(a[k]===id)+'" onclick="setAvatar(\''+k+'\',\''+id+'\')" '+(mainPetLevel()<level?'disabled':'')+'>'+name+(level>1?'<small>'+(mainPetLevel()<level?'🔒 にわっち Lv.'+level:'✨ つかえるよ')+'</small>':'')+'</button>').join('')+'</div></fieldset>').join('')+'</div></div></section>';
}
const avatarStyle=document.createElement('style');
avatarStyle.textContent='.home-avatar-heading{display:flex;align-items:center;justify-content:center;gap:20px}.home-avatar-heading h1{margin:4px 0;font-size:clamp(22px,3vw,32px)}.home-avatar-heading .avatar-home{margin:0;padding:6px 12px;flex-direction:column;gap:0;flex-shrink:0}.home-avatar-heading .avatar-art{width:72px}.home-avatar-heading .avatar-home span{font-size:13px}.subject-home{margin:8px auto;padding:18px}.subject-home-choices{margin:16px 0;gap:14px}.subject-home-card{min-height:140px;gap:8px;padding:14px}.subject-home-card span{font-size:44px}.subject-home-card strong{font-size:26px}.subject-home-pet{margin-top:12px;gap:12px}@media(max-width:500px){.home-avatar-heading{gap:10px}.home-avatar-heading .avatar-art{width:58px}.subject-home-choices{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.subject-home-card{min-height:110px;padding:8px 2px}.subject-home-card span{font-size:32px}.subject-home-card strong{font-size:19px}.subject-home{padding:12px}.home-avatar-heading h1{font-size:21px}}.avatar-art{width:180px;max-width:100%;height:auto;display:block;margin:auto}.avatar-home{display:flex;align-items:center;justify-content:center;gap:8px;margin:18px auto 0}.avatar-home .avatar-art{width:58px;margin:0}.avatar-editor{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start}.avatar-preview{text-align:center;position:sticky;top:12px;background:#f1f5e9;border-radius:24px;padding:20px}.avatar-group{border:0;padding:0;margin:0 0 22px;min-width:0}.avatar-group legend{font-weight:bold;margin-bottom:10px}.avatar-group>div{display:flex;flex-wrap:wrap;gap:10px}.avatar-group button{min-height:58px;min-width:100px}.avatar-group small{display:block;font-size:12px;margin-top:5px}.avatar-group [aria-pressed=true]{outline:3px solid #749759;background:#e1edce}.avatar-group button:disabled{opacity:.6}@media(max-width:600px){.avatar-editor{grid-template-columns:1fr}.avatar-preview{position:static;padding:12px}.avatar-preview .avatar-art{width:130px}}';
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
const duoAnswer=answer;
answer=function(i,el){const was=session?.done;duoAnswer(i,el);if(!was&&session?.done)celebrateAnswer('#feedback')};
const duoEnglishAnswer=englishAnswer;
englishAnswer=function(i,el){const was=englishSession?.done;duoEnglishAnswer(i,el);if(!was&&englishSession?.done)celebrateAnswer('#englishFeedback')};
const storyFinish=finish;
finish=function(){const eligible=session&&!session.rewarded;storyFinish();if(eligible)storyReward()};
const storyEnglishFinish=englishFinish;
englishFinish=function(){const eligible=englishSession&&!englishSession.rewarded;storyEnglishFinish();if(eligible)storyReward()};
const storyStyle=document.createElement('style');
storyStyle.textContent='.garden-duo{display:flex;align-items:center;justify-content:center;gap:14px;pointer-events:none}.garden-duo>.avatar-art{width:100px;margin:0}.garden-duo>.pet-scene{width:160px;min-height:180px;height:180px;margin:0;background:transparent;overflow:visible}.garden-duo .pet-body{scale:.7}.garden-duo .pet-badge{font-size:22px}.duo-heart{font-size:30px}.garden-story{background:#fff5df;border:2px solid #eddbb0;border-radius:20px;padding:18px;margin:16px 0}.garden-story p{font-size:19px;line-height:1.9}.garden-story h2{font-size:22px}.story-reward details{margin:18px 0}.story-reward summary{cursor:pointer;padding:14px;min-height:48px}.answer-duo{position:fixed;right:12px;top:10px;z-index:60;pointer-events:none;background:#fffaf0ee;border-radius:18px;animation:duo-cheer .7s ease-in-out 2}.answer-duo .garden-duo{gap:0;height:74px;padding:5px}.answer-duo .avatar-art{width:42px}.answer-duo .pet-scene{width:66px;min-height:65px;height:65px;overflow:hidden}.answer-duo .pet-body{scale:.3}.answer-duo .duo-heart{font-size:18px}.answer-duo .pet-badge{display:none}@keyframes duo-cheer{50%{transform:translateY(6px) rotate(3deg)}}@media(prefers-reduced-motion:reduce){.answer-duo{animation:none}}';
document.head.appendChild(storyStyle);

for(let p of data.profiles)initGame(p);save();
let toolsBar=document.querySelector('.tools');let musicButton=document.createElement('button');musicButton.setAttribute('data-music','');musicButton.onclick=musicControl;toolsBar.appendChild(musicButton);let switchButton=document.createElement('button');switchButton.textContent='ひとを かえる';switchButton.onclick=showWelcome;toolsBar.appendChild(switchButton);
document.querySelector('#profile').onchange=e=>chooseChild(Number(e.target.value));
refresh();home();showWelcome();
