let quizOwnsFullscreen=false;
function enterQuizScreen(){document.body.classList.add('quiz-mode');window.scrollTo?.(0,0);if(!document.fullscreenElement&&document.documentElement?.requestFullscreen){document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{if(view==='quiz')quizOwnsFullscreen=true;else document.exitFullscreen?.().catch(()=>{})}).catch(()=>{})}}
function leaveQuizScreen(){document.body.classList.remove('quiz-mode');if(quizOwnsFullscreen&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});quizOwnsFullscreen=false}
// Learning rewards are local to each learner. No paid or random items.
const SHOP=[['flower','おはな','🌸','hat',15],['cap','ぼうし','🧢','hat',20],['crown','おうかん','👑','hat',40],['ribbon','リボン','🎀','bow',15],['star','おほしさま','⭐','badge',20],['butterfly','ちょうちょ','🦋','badge',25]].map(([id,name,emoji,slot,cost])=>({id,name,emoji,slot,cost}));
function initGame(p){let g=p.game;if(!g||typeof g!=='object'||Array.isArray(g))g=p.game={};for(let k of ['coins','growth'])if(!Number.isSafeInteger(g[k])||g[k]<0)g[k]=0;if(!Array.isArray(g.owned))g.owned=[];g.owned=g.owned.filter(id=>SHOP.some(i=>i.id===id));if(!g.equipped||typeof g.equipped!=='object')g.equipped={};for(let slot of ['hat','bow','badge'])if(!SHOP.some(i=>i.id===g.equipped[slot]&&i.slot===slot&&g.owned.includes(i.id)))delete g.equipped[slot];if(!g.days||typeof g.days!=='object'||Array.isArray(g.days))g.days={};return g}
function game(){return initGame(person())}
function todayKey(){let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dailyRecord(){let g=game(),k=todayKey();if(!g.days[k]||typeof g.days[k]!=='object')g.days[k]={};return g.days[k]}
function petLevel(){return Math.min(5,1+Math.floor(game().growth/3))}
const PET_FOODS=[
 {id:'apple',name:'りんご',emoji:'🍎',reaction:'しゃきしゃき！ おいしいね！',motion:'pet-fed'},
 {id:'rice',name:'おにぎり',emoji:'🍙',reaction:'もぐもぐ！ げんき いっぱい！',motion:'pet-hop'},
 {id:'cake',name:'ケーキ',emoji:'🍰',reaction:'ふわふわ！ うれしくて おどっちゃう！',motion:'pet-dance'}
];
function petWish(){return '<aside class="pet-wish"><strong>🌱 にわっちから おねがい</strong><p>いっしょに おはなを そだてよう！<br>すきな ステージを 5もん やると、おはなが ひとつ さくよ。</p><div aria-label="そだてた おはな">'+ '🌷'.repeat(Math.min(12,Math.max(0,Number(person().flowers)||0)))+'</div><small>そだてた おはな：'+(Number(person().flowers)||0)+'こ · いつ あそびに きても だいじょうぶ</small></aside>'}
function petArt(){let g=game(),growth=Math.min(12,g.growth),e=slot=>SHOP.find(i=>i.id===g.equipped[slot]);return `<div class="pet-scene" role="button" tabindex="0" onclick="petNiwatchi()" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();petNiwatchi()}" aria-label="レベル${petLevel()}の にわっちを なでる"><div class="pet-body" style="--scale:${.83+growth*.022};background:hsl(${42+growth},78%,${72-growth*.4}%);"><span class="pet-leaf" style="transform:scale(${.75+growth*.035})">${growth>=12?'🌸':growth>=9?'🌷':growth>=6?'🌿':'🌱'}</span><span class="pet-face">• •</span><span class="pet-mouth"></span><span class="cheek left"></span><span class="cheek right"></span>${e('hat')?`<span class="pet-hat">${e('hat').emoji}</span>`:''}${e('bow')?`<span class="pet-bow">${e('bow').emoji}</span>`:''}</div>${e('badge')?`<span class="pet-badge">${e('badge').emoji}</span>`:''}</div>`}
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
const originalHome=home;
home=function(){leaveQuizScreen();originalHome();let g=game(),done=dailyRecord(),section=document.createElement('section');section.innerHTML=`<div class="gamebar"><span><strong>${esc(person().name)}</strong> の にわ　<span class="coin">🪙 ${g.coins} コイン</span></span><button class="sub" onclick="petRoom()">🌱 にわっち・きせかえ</button></div>${petWish()}<h2>きょうは どこへ いく？</h2><p class="muted">1ステージ 5もん。ヒントを つかっても コインが もらえるよ。</p><div class="daily-grid">${dailyStages().map(t=>`<button class="daily-card" onclick="start(${t.i},true)"><strong>${t.title}</strong><span>きょうの じぶんに ぴったりの 5もん</span><small>${done['auto-'+(t.i<JP_START?'math':'jp')]?'✓ きょう クリア！ もういちど ＋3🪙':'クリアで ＋10🪙'}</small></button>`).join('')}</div>`;app.prepend(section);refreshMusic()};
const originalStart=start;
start=function(i,auto){subject=i<JP_START?'math':'jp';let level=auto?adaptiveState().level:i;enterQuizScreen();originalStart(level,auto);session.stageStart=auto?'auto-'+subject:i;session.rewarded=false};
const originalFinish=finish;
finish=function(){if(!session||session.rewarded)return;session.rewarded=true;leaveQuizScreen();let g=game(),d=dailyRecord(),id=String(session.stageStart??session.i),reward=d[id]?3:10;d[id]=(Number.isSafeInteger(d[id])?d[id]:0)+1;g.coins+=reward;let keys=Object.keys(g.days).sort();for(let k of keys.slice(0,-90))delete g.days[k];save();originalFinish();let box=document.createElement('div');box.className='reward';box.innerHTML=`<strong>🪙 ${reward} コイン もらった！</strong><p>いま ${g.coins} コイン。にわっちに あいに いこう。</p><button class="primary" onclick="petRoom()">🌱 にわっちに あう</button>`;app.querySelector('.panel').appendChild(box)};
function petRoom(message=''){leaveQuizScreen();view='pet';session=null;let g=game(),lv=petLevel();app.innerHTML=`<section class="panel"><div class="quiztop"><button class="sub" onclick="home()">← ステージへ</button><span class="coin">🪙 ${g.coins} コイン</span></div><div class="center"><h1 style="font-size:30px">${esc(person().name)}の にわっち</h1><strong>レベル ${lv} · ${['','ちいさな め','すくすく','げんきいっぱい','おおきく なった','にわの ともだち'][lv]}</strong>${petArt()}<p class="muted">にわっちを タッチして なでてね。コインは つかわないよ。</p><p class="game-status" role="status">${esc(message)}</p><p>${lv===5?'おおきく そだったね！':`あと ${3-g.growth%3}かいの おやつで レベルアップ！`}</p><div class="pet-foods">${PET_FOODS.map(f=>`<button class="sub" onclick="feedPet('${f.id}')" ${lv<5&&g.coins<10?'disabled':''}><span>${f.emoji}</span>${f.name}<small>${lv===5?'むりょう': '10🪙 · せいちょう ＋1'}</small></button>`).join('')}</div><p class="muted">おやすみしても、ちいさく ならないよ。</p></div><h2>きせかえやさん</h2><p class="muted">かった ものは、ずっと つかえるよ。</p><div class="wardrobe">${SHOP.map(item=>{let owned=g.owned.includes(item.id),on=g.equipped[item.slot]===item.id;return `<div class="shop-item"><div style="font-size:42px">${item.emoji}</div><strong>${item.name}</strong><button onclick="shopAction('${item.id}')" ${!owned&&g.coins<item.cost?'disabled':''}>${on?'はずす':owned?'つける':item.cost+'🪙で かう'}</button></div>`}).join('')}</div><p class="muted">自動ステージは教科ごと、自由練習はコースごとに、その日最初の5問クリアで10コイン、2回目から3コイン。正答数にかかわらず、最後まで取り組むともらえます。課金はありません。</p></section>`}
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
 scene.classList.remove('pet-fed','pet-hop','pet-dance','pet-petted');
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
 let g=game(),before=petLevel(),grown=before===5;
 if(!grown&&g.coins<10)return;
 if(!grown){g.coins-=10;g.growth++}
 save();let levelUp=petLevel()>before;
 petRoom(food.emoji+' '+food.reaction+(levelUp?' ✨ レベルアップ！':grown?'':' すこし おおきく なったよ！'));
 playFeedSound(levelUp);petReaction(food.motion,levelUp?'✨ 🌸 ✨':'♥ '+food.emoji+' ♥');
}
const feedingStyle=document.createElement('style');
feedingStyle.textContent=`
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
@media(prefers-reduced-motion:reduce){.pet-fed .pet-body,.pet-hop .pet-body,.pet-dance .pet-body,.pet-petted .pet-body,.feed-hearts{animation:none}.pet-body,.pet-leaf{transition:none}}
`;
document.head.appendChild(feedingStyle);
function shopAction(id){let item=SHOP.find(x=>x.id===id);if(!item)return;let g=game();if(g.owned.includes(id)){if(g.equipped[item.slot]===id)delete g.equipped[item.slot];else g.equipped[item.slot]=id;save();petRoom('きせかえ したよ！');return}if(g.coins<item.cost)return;g.coins-=item.cost;g.owned.push(id);g.equipped[item.slot]=id;save();petRoom(item.name+'を てにいれた！')}
for(let p of data.profiles)initGame(p);save();
let toolsBar=document.querySelector('.tools');let musicButton=document.createElement('button');musicButton.setAttribute('data-music','');musicButton.onclick=musicControl;toolsBar.appendChild(musicButton);let switchButton=document.createElement('button');switchButton.textContent='ひとを かえる';switchButton.onclick=showWelcome;toolsBar.appendChild(switchButton);
document.querySelector('#profile').onchange=e=>chooseChild(Number(e.target.value));
refresh();home();showWelcome();
