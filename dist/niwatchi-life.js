/* Niwatchi's daily life. Local, per-child saves; play never changes learning scores. */
(function(){
'use strict';
const {furniture,clothes,foods,ingredients,recipes,trips,stories,rewards,tabs,gifts}=window.NiwatchiContent;
for(const i of clothes)UNLOCK_LEVELS.pet[i.id]=i.level;
for(const i of furniture)UNLOCK_LEVELS.room[i.id]=i.level;
// Souvenirs are earned on trips, never bought for zero coins through the old shop.
for(const i of gifts)UNLOCK_LEVELS.room[i.id]=Infinity;
let tab='play',slot=0,renderToken=0,renderProfile=null,chosen=[];
const validObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
const ids=(x,allowed)=>Array.isArray(x)?[...new Set(x.filter(id=>allowed.includes(id)))]:[];
const capacity=()=>mainPetLevel()>=50?5:mainPetLevel()>=20?4:3;
const friendLevel=id=>id==='main'?mainPetLevel():1+Math.floor((game().friends?.[id]?.growth||0)/3);
const storyOpen=s=>mainPetLevel()>=FRIENDS.find(f=>f.id===s.friend).at&&friendLevel(s.friend)>=s.level;
function state(){
 const g=game(),r=roomState();friendState();let l=g.life;if(!validObject(l))l=g.life={};l.version=1;
 if(!Array.isArray(l.placements))l.placements=[r.furniture,'none','none','none','none'];
 l.placements=Array.from({length:5},(_,n)=>ROOM_ITEMS.some(i=>i.id===l.placements[n]&&i.slot==='furniture'&&r.owned.includes(i.id))?l.placements[n]:'none');
 l.completed=ids(l.completed,stories.map(s=>s.id));l.souvenirs=ids(l.souvenirs,gifts.map(i=>i.id));l.cooked=ids(l.cooked,recipes.map(i=>i.id));
 if(!validObject(l.trip)||!trips.some(t=>t.id===l.trip.id)||![0,1,2].includes(l.trip.step)||!Array.isArray(l.trip.picks)||l.trip.picks.length!==l.trip.step||l.trip.picks.some(n=>n!==0&&n!==1))l.trip=null;
 if(!validObject(l.story)||!stories.some(s=>s.id===l.story.id)||![0,1,2].includes(l.story.step)||!Array.isArray(l.story.picks)||l.story.picks.length!==l.story.step||l.story.picks.some(n=>n!==0&&n!==1))l.story=null;
 if(!recipes.some(r=>r.id===l.dish))l.dish=null;
 const allowed=['hello','room',...FRIENDS.map(f=>'friend-'+f.id),...trips.map(t=>'trip-'+t.id),...stories.map(s=>'story-'+s.id),...recipes.map(r=>'cook-'+r.id)];
 const seen=new Set();l.album=(Array.isArray(l.album)?l.album:[]).filter(m=>validObject(m)&&allowed.includes(m.id)&&validObject(m.photo)&&!seen.has(m.id)&&seen.add(m.id)).slice(0,40);
 return l;
}
function snapshot(friend=selectedFriend().id){return {friend,level:friendLevel(friend),mainLevel:mainPetLevel(),wall:roomState().wall,items:[...state().placements],equipped:{...(friend==='main'?game():game().friends[friend]).equipped},avatar:{...avatarState()},avatarStage:avatarGrowthStage(),date:todayKey()};}
function remember(id,title,icon,friend){const l=state();if(l.album.some(m=>m.id===id))return false;const photo=snapshot(friend);l.album.push({id,title,icon,photo});return true;}
function sync(){
 const before=JSON.stringify(game());const l=state();syncFriendKeepsakes();
 remember('hello','にわっちとの まいにち','🌱');
 for(const f of FRIENDS.slice(1))if(mainPetLevel()>=f.at)remember('friend-'+f.id,f.name+'が なかまに！',f.icon,f.id);
 if(l.placements.filter(x=>x!=='none').length>=3)remember('room','はじめての おへやづくり','🏡');
 if(JSON.stringify(game())!==before)save();
}
function btn(action,value,label,disabled=false,extra=''){return `<button class="sub" onclick="NiwatchiLife.act('${action}','${value}',${renderToken})" ${disabled?'disabled':''} ${extra}>${label}</button>`;}
const lock=(level,owned=false)=>!owned&&mainPetLevel()<level;
function priceLabel(i,owned,current){return current?'えらんでいるよ':owned?'えらぶ':lock(i.level)?'🔒 にわっち Lv.'+i.level:i.cost+'🪙で かう';}
function miniRibbon(color){return `<svg viewBox="0 0 100 64" aria-hidden="true"><path d="M44 34L24 60L42 54L51 39L63 59L79 60L59 32M45 28C12-2 0 12 12 35C21 49 38 36 45 28M55 28C88-2 100 12 88 35C79 49 62 36 55 28" fill="${color}" stroke="#42697f" stroke-width="3" stroke-linejoin="round"/><rect x="42" y="20" width="16" height="20" rx="5" fill="${color}" stroke="#42697f" stroke-width="3"/></svg>`;}
function hatArt(id){
 const art={sailorhat:'<path d="M14 42Q8 9 50 10Q92 9 86 42Z" fill="#f8fbff" stroke="#527b9a" stroke-width="3"/><path d="M14 36H86V49H14Z" fill="#597fa3"/><path d="M8 48Q50 60 92 48" fill="none" stroke="#e7edf3" stroke-width="7"/><path d="M50 17V32M42 25Q42 37 50 37Q58 37 58 25M44 22H56" fill="none" stroke="#d6af58" stroke-width="3"/>',snowhat:'<path d="M17 46Q18 12 50 12Q82 12 83 46" fill="#a8d9e6" stroke="#618ca3" stroke-width="3"/><path d="M33 20V43M50 16V43M67 20V43" stroke="#e7f5fa" stroke-width="3"/><rect x="12" y="40" width="76" height="16" rx="7" fill="#f7f9ef" stroke="#618ca3" stroke-width="3"/><circle cx="50" cy="10" r="9" fill="#f7f9ef"/>',rainbowcrown:'<path d="M16 49L9 17L33 31L50 8L67 31L91 17L84 49Z" fill="#ffe290" stroke="#aa8350" stroke-width="3"/><path d="M19 39H81" stroke="#ed9bc3" stroke-width="5"/><path d="M20 44H80" stroke="#9acbdc" stroke-width="5"/><circle cx="50" cy="27" r="6" fill="#aa8bd1"/><circle cx="28" cy="31" r="4" fill="#8abf82"/><circle cx="72" cy="31" r="4" fill="#8abf82"/>'}[id];
 return art?'<svg viewBox="0 0 100 64" aria-hidden="true">'+art+'</svg>':'';
}
function necklaceArt(i){return '<svg viewBox="0 0 100 55" aria-hidden="true"><path d="M12 5Q50 65 88 5" fill="none" stroke="#b99b50" stroke-width="4"/><text x="50" y="48" text-anchor="middle" font-size="28">'+i.emoji+'</text></svg>';}
const baseCostume=petCostume;
petCostume=function(equipped){
 const parts=baseCostume(equipped);
 const hand=SHOP.find(i=>i.id===equipped.hand),bow=clothes.find(i=>i.id===equipped.bow&&i.color);
 const hat=hatArt(equipped.hat),neck=clothes.find(i=>i.id===equipped.badge&&i.id.endsWith('necklace'));
 if(bow)parts.bow='<span class="pet-bow nl-bow">'+miniRibbon(bow.color)+'</span>';
 if(hat)parts.hat='<span class="pet-hat nl-hat">'+hat+'</span>';
 if(hand)parts.hand='<span class="nl-hand" aria-label="'+hand.name+'">'+hand.emoji+'</span>';
 if(neck){
  parts.badge='';
  parts.necklace='<span class="nl-necklace" aria-label="'+neck.name+'">'+necklaceArt(neck)+'</span>';
 }
 return parts;
};
function placed(){return '<div class="nl-furniture" aria-label="かざっている かぐ">'+state().placements.slice(0,capacity()).map((id,n)=>{const i=ROOM_ITEMS.find(x=>x.id===id);return '<span class="nl-place nl-place-'+n+'" title="'+i.name+'">'+(id==='none'?'':i.icon)+'</span>'}).join('')+'</div>';}
function nextReward(){const next=rewards.find(r=>r.level>mainPetLevel());return `<details class="nl-unlocks"><summary>${next?'🎁 つぎは Lv.'+next.level+'：'+next.name:'🌈 Lv.100までの あそびが ぜんぶ かいほう！'}</summary><p>にわっちの レベルで あそびが ふえるよ。おかいものには コインを つかうよ。</p><ol>${rewards.map(r=>'<li class="'+(r.level<=mainPetLevel()?'nl-earned':'')+'">'+(r.level<=mainPetLevel()?'✓ ':'🔒 ')+'Lv.'+r.level+' '+r.name+'</li>').join('')}</ol></details>`;}
function playPanel(){const f=selectedFriend();return `<h2>${f.name}と あそぼう</h2><p>タップでも なでなで できるよ。あそびは いつでも むりょう。</p><div class="nl-grid nl-play">${[['stroke','🤲','なでなで',1],['tickle','💗','こちょこちょ',2],['ball','⚽','ボールあそび',7]].map(([id,icon,name,lv])=>btn('play',id,icon+' '+name+(lock(lv)?'<small>にわっち Lv.'+lv+'</small>':''),lock(lv))).join('')}${btn('play','five','🙌 ハイタッチ'+(petLevel()<3?'<small>'+f.name+' Lv.3</small>':''),petLevel()<3)}${btn('play','dance','🎵 なかよし ダンス'+(petLevel()<5?'<small>'+f.name+' Lv.5</small>':''),petLevel()<5)}</div><h3>いっしょに あそぶ ともだち</h3>${friendPicker()}<p class="nl-note">すきな ともだちを えらんで、ごはんや おはなしを たのしもう。</p>`;}
function roomPanel(){const r=roomState(),l=state();return `<h2>じぶんだけの おへや</h2><p>① ばしょを えらぶ → ② かぐを えらぶ。いま ${capacity()}こ かざれるよ。</p><div class="nl-slots">${Array.from({length:capacity()},(_,n)=>btn('slot',String(n),(n+1)+' '+(ROOM_ITEMS.find(i=>i.id===l.placements[n])?.icon||'📦'),false,'aria-pressed="'+(slot===n)+'"')).join('')}</div><h3>かぐ・おみやげ</h3><div class="nl-grid">${ROOM_ITEMS.filter(i=>i.slot==='furniture').map(i=>{const owned=r.owned.includes(i.id),gift=gifts.some(x=>x.id===i.id),lv=i.level||UNLOCK_LEVELS.room[i.id]||1;return '<div class="nl-card"><span class="nl-icon">'+i.icon+'</span><strong>'+i.name+'</strong>'+btn('furniture',i.id,gift&&!owned?'🚂 おでかけで もらう':priceLabel({...i,level:lv},owned,l.placements[slot]===i.id),gift&&!owned||lock(lv,owned)||!owned&&game().coins<i.cost)+'</div>'}).join('')}</div><h3>かべがみ・テーマ</h3><div class="nl-grid">${ROOM_ITEMS.filter(i=>i.slot==='wall').map(i=>{const owned=r.owned.includes(i.id);return '<div class="nl-card"><span class="nl-icon">'+i.icon+'</span><strong>'+i.name+'</strong>'+btn('wall',i.id,priceLabel({...i,level:i.level||UNLOCK_LEVELS.room[i.id]},owned,r.wall===i.id),lock(i.level||UNLOCK_LEVELS.room[i.id],owned)||!owned&&game().coins<i.cost)+'</div>'}).join('')}</div>${btn('theme','', '✨ もっている かぐで テーマを そろえる')}<p class="nl-note">もり・おかし・うみ・ほしの かぐを まとめて かざれるよ。</p>`;}
const matches=[{id:'marine',name:'マリン',icon:'⚓',level:15,pet:'sailorhat',outfit:'sailor',accessory:'sailorbow'},{id:'berry',name:'いちご',icon:'🍓',level:45,pet:'berryhat',outfit:'berrydress',accessory:'ribbon'},{id:'star',name:'ほしぞら',icon:'⭐',level:35,pet:'starnecklace',outfit:'star',accessory:'starclip'}];
function dressPanel(){return `<h2>${selectedFriend().name}の きせかえ</h2><p>ぼうし・リボン・ネックレスや バッジ・もちもの。ともだちごとに おぼえるよ。</p><div class="nl-grid">${[...SHOP].sort((a,b)=>UNLOCK_LEVELS.pet[a.id]-UNLOCK_LEVELS.pet[b.id]).map(i=>{const own=game().owned.includes(i.id);return '<div class="nl-card"><span class="nl-icon">'+(i.color?miniRibbon(i.color):hatArt(i.id)||i.emoji)+'</span><strong>'+i.name+'</strong>'+btn('dress',i.id,friendState().equipped[i.slot]===i.id?'はずす':priceLabel({...i,level:UNLOCK_LEVELS.pet[i.id]},own,false),lock(UNLOCK_LEVELS.pet[i.id],own)||!own&&game().coins<i.cost)+'</div>'}).join('')}</div><h3>じぶんと おそろい</h3><div class="nl-match-preview">${gardenPortrait(selectedFriend())}</div><div class="nl-grid">${matches.map(m=>{const i=SHOP.find(i=>i.id===m.pet),own=game().owned.includes(m.pet);return '<div class="nl-card"><span class="nl-icon">'+m.icon+'</span><strong>'+m.name+'</strong>'+btn('match',m.id,lock(m.level)?'🔒 Lv.'+m.level:own?'おそろいに きがえる':i.cost+'🪙で おそろい',lock(m.level)||!own&&game().coins<i.cost)+'</div>'}).join('')}</div>`;}
function foodPanel(){const l=state(),f=selectedFriend(),dish=recipes.find(r=>r.id===l.dish);return `<h2>${f.name}の ごはん</h2><p>どれも 10🪙。1かいで せいちょうが ひとつ すすむよ。</p><div class="nl-grid">${PET_FOODS.map(i=>'<div class="nl-card"><span class="nl-icon">'+i.emoji+'</span><strong>'+i.name+'</strong>'+btn('food',i.id,lock(i.level||1)?'🔒 Lv.'+i.level:'10🪙で あげる',lock(i.level||1)||game().coins<10)+'</div>').join('')}</div><h3>ふたつの ざいりょうで おりょうり</h3>${mainPetLevel()<8?'<p>🔒 にわっち Lv.8で キッチンが ひらくよ。</p>':dish?'<div class="nl-recipe"><span class="nl-icon">'+dish.icon+'</span><h3>'+dish.name+'が できたよ！</h3><p>あとで あげても だいじょうぶ。'+FRIENDS.find(f=>f.id===dish.favorite).name+'の だいこうぶつ！</p>'+btn('serve',dish.id,f.name+'に あげる（おかねは いらないよ）')+'</div>':'<p>レシピを みて、ざいりょうを ふたつ えらぼう。</p><div class="nl-ingredients">'+ingredients.map(i=>btn('ingredient',i.id,i.icon+' '+i.name,false,'aria-pressed="'+chosen.includes(i.id)+'"')).join('')+'</div>'+btn('cook','','🍳 10🪙で つくる',chosen.length!==2||game().coins<10)}<div class="nl-grid">${recipes.map(r=>'<div class="nl-card"><strong>'+r.icon+' '+r.name+'</strong><p>'+r.pair.map(id=>{const i=ingredients.find(x=>x.id===id);return i.icon+' '+i.name}).join(' ＋ ')+'</p><small>'+(lock(r.level)?'🔒 にわっち Lv.'+r.level:l.cooked.includes(r.id)?'✓ つくったことが あるよ':'つくれるよ')+'</small></div>').join('')}</div>`;}
function trainPicture(){const r=railState();return `<div class="nl-train-window"><div class="nl-train" style="--train:${RAIL_COLORS[r.color][1]}">${Array.from({length:r.cars},(_,i)=>`<div class="nl-car ${i===0?'nl-engine':''}"><div>${i===0?'<span class="nl-driver">'+avatarArt()+'</span>':''}${i===0?r.passengers.map(id=>FRIENDS.find(f=>f.id===id)?.icon||'').join(''):'🪟 🪟'}</div><small>${i===0?({local:'でんしゃ',express:'とっきゅう',steam:'きかんしゃ'}[r.head]):''} ${{stripe:'━━',stars:'★ ★',dots:'● ●'}[r.pattern]}</small></div>`).join('')}</div></div>`;}
function tripPanel(){const l=state(),p=l.trip,t=trips.find(t=>t.id===p?.id);if(t){return `<h2>${t.icon} ${t.name}</h2><div class="nl-destination" style="background:${t.color}"><div class="nl-landscape">${t.scene}</div>${trainPicture()}</div><p class="nl-step">たびの きろく ${p.step+1} / 3</p><div class="nl-event">${p.step===0?'<p>'+t.intro+'</p><div class="nl-grid">'+t.choices.map((v,n)=>btn('tripChoice',String(n),v)).join('')+'</div>':p.step===1?'<p>'+t.results[p.picks[0]]+'</p><p>'+t.event+'</p><div class="nl-grid">'+t.options.map((v,n)=>btn('tripChoice',String(n),v)).join('')+'</div>':'<p>'+t.end[p.picks[1]]+'</p><span class="nl-icon">'+t.giftIcon+'</span><p>'+t.giftName+'を おへやに かざろう。</p>'+btn('tripFinish',t.id,'🎁 おみやげを もって かえる')}</div>${btn('tripPause','','あとで つづける')}`;}
 return `<h2>じぶんの でんしゃで おでかけ</h2><p>おでかけは むりょう。おみやげと おもいでを あつめよう。</p>${trainPicture()}${btn('train','','🚆 でんしゃ・のる ともだちを えらぶ')}<div class="nl-grid">${trips.map(t=>'<div class="nl-card"><span class="nl-icon">'+t.icon+'</span><strong>'+t.name+'</strong><small>'+t.giftIcon+' '+t.giftName+'</small>'+btn('tripStart',t.id,lock(t.level)?'🔒 にわっち Lv.'+t.level:'しゅっぱつ！',lock(t.level))+'</div>').join('')}</div>`;}
function storyPanel(){const l=state(),p=l.story,s=stories.find(s=>s.id===p?.id),f=selectedFriend();if(s){return `<h2>${s.icon} ${s.name}</h2><p>${FRIENDS.find(f=>f.id===s.friend).name}の おはなし ${p.step+1} / 3</p><div class="nl-event">${p.step===0?'<p>'+s.intro+'</p><div class="nl-grid">'+s.choices.map((v,n)=>btn('storyChoice',String(n),v)).join('')+'</div>':p.step===1?'<p>'+s.results[p.picks[0]]+'</p><p>'+s.event+'</p><div class="nl-grid">'+s.options.map((v,n)=>btn('storyChoice',String(n),v)).join('')+'</div>':'<p>'+s.end+'</p>'+btn('storyFinish',s.id,'📷 おもいでに のこす')}</div>${btn('storyPause','','あとで つづける')}`;}
 return `<h2>${f.name}の おはなし</h2><p>えらびながら いっしょに あそぼう。${f.id==='main'?'にわっちの Lv.1・5・10':'ともだちの Lv.1・3・5'}で おはなしが ふえるよ。</p>${friendPicker()}<div class="nl-grid">${stories.filter(s=>s.friend===f.id).map(s=>'<div class="nl-card"><span class="nl-icon">'+s.icon+'</span><strong>'+s.name+'</strong>'+btn('storyStart',s.id,!storyOpen(s)?'🔒 '+f.name+' Lv.'+s.level:l.completed.includes(s.id)?'もういちど あそぶ':'おはなしを はじめる',!storyOpen(s))+'</div>').join('')}</div>${friendKeepsakeProgress()}`;}
function photo(m){const p=m.photo,f=FRIENDS.find(f=>f.id===p.friend)||FRIENDS[0],wall=ROOM_ITEMS.find(i=>i.id===p.wall&&i.slot==='wall')||ROOM_ITEMS[0],level=Number.isSafeInteger(p.level)&&p.level>0?p.level:1,e=validObject(p.equipped)?p.equipped:{},items=Array.isArray(p.items)?p.items:[];const costume=['hat','bow','badge','hand'].map(slot=>SHOP.find(i=>i.id===e[slot]&&i.slot===slot));
 const shapes={main:'<rect x="32" y="40" width="116" height="110" rx="46"/>',momo:'<path d="M90 34C120 3 145 23 138 49C176 47 188 79 158 94C184 117 156 146 134 134C125 169 88 170 76 144C43 165 19 138 35 115C3 99 17 66 44 65C32 37 60 17 90 34Z"/>',sora:'<path d="M37 140C-2 139 3 83 34 79C30 43 72 27 91 53C116 22 158 47 151 79C190 79 188 140 153 141Z"/>',hoshi:'<path d="M90 18L113 60L162 67L130 104L139 151L90 133L43 153L50 104L18 67L66 60Z"/>'};
 const avatar={avatar:validObject(p.avatar)?{...p.avatar}:{},game:{growth:3*((Number.isSafeInteger(p.mainLevel)&&p.mainLevel>0?Math.min(p.mainLevel,100):1)-1)}};
 return `<div class="nl-photo" style="background:${wall.color}"><span class="nl-photo-avatar">${avatarArt(avatar,p.avatarStage??null)}</span><svg viewBox="0 0 180 180" role="img" aria-label="${f.name}の きねんしゃしん"><g fill="${{main:'#f2d68a',momo:'#efb9d4',sora:'#b8ddec',hoshi:'#f5db87'}[f.id]}" stroke="#98a580" stroke-width="3">${shapes[f.id]}</g><text x="90" y="43" text-anchor="middle" font-size="30">${hatArt(costume[0]?.id)?'':costume[0]?.emoji||f.icon}</text>${hatArt(costume[0]?.id)?'<svg x="47" y="2" width="86" height="55">'+hatArt(costume[0].id)+'</svg>':''}<g fill="#4e553a"><circle cx="70" cy="92" r="4"/><circle cx="110" cy="92" r="4"/></g><path d="M79 107Q90 121 101 107" fill="none" stroke="#4e553a" stroke-width="3"/><text x="90" y="145" text-anchor="middle" font-size="25">${costume[1]?.color?'':costume[1]?.emoji||''} ${costume[2]?.emoji||''}</text>${costume[1]?.color?'<svg x="64" y="120" width="48" height="34">'+miniRibbon(costume[1].color)+'</svg>':''}<text x="140" y="126" font-size="28">${costume[3]?.emoji||''}</text></svg><div>${items.slice(0,5).map(id=>ROOM_ITEMS.find(i=>i.id===id&&i.id!=='none')?.icon||'').join(' ')}</div><small>${f.name} Lv.${level}</small></div>`;
}
function albumPanel(){const l=state();return `<h2>おもいで アルバム <small>${l.album.length}まい</small></h2><p>はじめての おでかけ、おりょうり、おはなしを じどうで のこすよ。しゃしんは そのときの きせかえと おへや。</p><div class="nl-grid">${[...l.album].reverse().map(m=>'<article class="nl-memory">'+photo(m)+'<strong>'+esc(String(m.icon||'📷'))+' '+esc(String(m.title||'おもいで'))+'</strong><small>'+esc(String(m.photo.date||''))+'</small></article>').join('')}</div><h3>おでかけの たからもの</h3><div class="nl-grid">${gifts.map(i=>'<div class="nl-card"><span class="nl-icon">'+(l.souvenirs.includes(i.id)?i.icon:'🔒')+'</span><strong>'+i.name+'</strong><small>'+(l.souvenirs.includes(i.id)?'おへやに かざれるよ':'おでかけで みつけよう')+'</small></div>').join('')}</div>${friendKeepsakeShelf()}`;}
function render(message=''){
 const oldPanel=app.querySelector('.nl-content'),scroll=view==='pet'&&renderProfile===person()?(oldPanel?.scrollTop||0):0;
 if(renderProfile!==person()){tab='play';chosen=[];slot=0;renderProfile=person()}
 renderToken++;leaveQuizScreen();view='pet';session=null;sync();slot=Math.min(slot,capacity()-1);
 const panel={play:playPanel,room:roomPanel,dress:dressPanel,food:foodPanel,trip:tripPanel,story:storyPanel,album:albumPanel}[tab];
 app.innerHTML=`<section class="nl-room"><div class="nl-top"><button class="sub" onclick="home()">← にわへ</button><strong>🌱 にわっちと ともだち</strong><span class="coin">🪙 ${game().coins}</span></div><div class="nl-layout"><aside class="nl-preview" style="background:${roomColor()}"><h1>${esc(person().name)}の ${selectedFriend().name}</h1><div class="nl-stage"><div class="pet-room-cast">${petArt()}</div>${placed()}<span class="nl-ball" aria-hidden="true">⚽</span></div><div class="nl-level"><b>${selectedFriend().icon} Lv.${petLevel()}</b><div class="pet-growth-track"><span style="width:${friendState().growth%3/3*100}%"></span></div><small>つぎの レベルまで ごはん あと${3-friendState().growth%3}かい</small></div><p class="game-status" role="status" aria-live="polite">${esc(message||'きょうは なにして あそぼう？')}</p>${nextReward()}</aside><div class="nl-workspace"><nav class="nl-tabs" aria-label="にわっちの あそび">${tabs.map(([id,icon,name])=>btn('tab',id,icon+'<span>'+name+'</span>',false,'aria-pressed="'+(id===tab)+'"')).join('')}</nav><div class="nl-content pet-room-controls" tabindex="-1">${panel()}</div></div></div></section>`;
 const next=app.querySelector('.nl-content');if(next)next.scrollTop=scroll;
}
function purchase(i,kind='dress'){if(!i)return false;const level=mainPetLevel(),g=game(),r=roomState(),inventory=kind==='room'?r.owned:g.owned;if(!inventory.includes(i.id)){if(level<(i.level||1)||g.coins<i.cost)return false;g.coins-=i.cost;inventory.push(i.id)}return true;}
function react(kind){
 const f=selectedFriend(),lv={stroke:1,tickle:2,ball:7};if(lv[kind]&&lock(lv[kind])||kind==='five'&&petLevel()<3||kind==='dance'&&petLevel()<5)return;
 const words={main:['ほっぺが ゆるんじゃう。だいすき！','くすぐったいよ〜！ えへへ！','ころころ、まてまて！'],momo:['はなびら ふわり。ありがとう！','くすくす！ はなびらが ゆれるよ！','はなびらと いっしょに ボールを ぽん！'],sora:['ふわふわ、きもちいいな。','ふふふっ！ くもが ぷるぷる！','ふわりと とんで、ボールを キャッチ！'],hoshi:['うれしくて きらきら しちゃう！','あはは！ ほしが ぴかぴか！','ぴょーん！ ほしの ジャンプで キャッチ！']};
 const message=kind==='five'?'ぱちん！ '+f.name+'と ハイタッチ！':kind==='dance'?f.name+'と なかよし ダンス！':words[f.id][['stroke','tickle','ball'].indexOf(kind)];
 if(!message)return;const status=app.querySelector('.game-status');if(status)status.textContent=message;
 petReaction(kind==='stroke'?'pet-petted':kind==='tickle'?'pet-dance':kind==='dance'?'pet-dance':'pet-hop',kind==='ball'?'⚽ ✨':kind==='five'?'🙌 ♥':'♥ ♥ ♥');
 if(kind==='ball'){const stage=app.querySelector('.nl-stage');stage?.classList.remove('nl-playing-ball');if(stage){void stage.offsetWidth;stage.classList.add('nl-playing-ball')}}
 playFeedSound(kind==='dance');
}
const originalFeed=feedPet;
feedPet=function(id='apple'){const food=PET_FOODS.find(f=>f.id===id);if(!food||lock(food.level||1))return;const before=friendState().growth;originalFeed(id);if(friendState().growth>before){const favorites={main:'sandwich',momo:'strawberry',sora:'rice',hoshi:'pudding'};if(favorites[selectedFriend().id]===id){const status=app.querySelector('.game-status');if(status)status.textContent+=' だいこうぶつ！ とびきり うれしい！';petReaction('pet-dance','✨ '+food.emoji+' ✨')}}};
petNiwatchi=function(){if(view==='pet')react('stroke')};
function act(action,value,token){
 if(view!=='pet'||renderProfile!==person()||token!==renderToken)return;
 const l=state(),g=game();let message='';
 if(action==='tab'){if(!tabs.some(t=>t[0]===value))return;tab=value;render();const content=app.querySelector('.nl-content');if(content)content.scrollTop=0;return}
 if(action==='play'){react(value);return}
 if(action==='slot'){const n=Number(value);if(!Number.isInteger(n)||n<0||n>=capacity())return;slot=n}
 else if(action==='furniture'||action==='wall'){
  const i=ROOM_ITEMS.find(i=>i.id===value&&i.slot===(action==='wall'?'wall':'furniture'));if(!i)return;
  const r=roomState();if(gifts.some(g=>g.id===value)&&!r.owned.includes(value))return;
  if(!purchase({...i,level:i.level||UNLOCK_LEVELS.room[value]||1},'room'))return;
  if(action==='wall')r.wall=value;else{l.placements[slot]=value;r.furniture=l.placements[0]}
  message='おへやを かざったよ！';
 }
 else if(action==='theme'){
  const r=roomState(),theme=ROOM_ITEMS.find(i=>i.id===r.wall)?.theme||({garden:'forest',pinkroom:'candy',skyroom:'sky',nightroom:'star'}[r.wall]);
  const items=ROOM_ITEMS.filter(i=>i.slot==='furniture'&&i.theme===theme&&r.owned.includes(i.id));
  if(!items.length){render('この テーマの かぐを えらんで かってみよう。');return}
  l.placements=Array.from({length:5},(_,n)=>n<capacity()?items[n]?.id||'none':l.placements[n]);r.furniture=l.placements[0];message='テーマを そろえて かざったよ！';
 }
 else if(action==='dress'){
  const i=SHOP.find(i=>i.id===value);if(!i||!purchase({...i,level:UNLOCK_LEVELS.pet[i.id]}))return;
  const e=friendState().equipped;if(e[i.slot]===value)delete e[i.slot];else e[i.slot]=value;message='きせかえしたよ！';
 }
 else if(action==='match'){
  const m=matches.find(m=>m.id===value);if(!m||lock(m.level))return;const i=SHOP.find(i=>i.id===m.pet);if(!purchase(i))return;
  friendState().equipped[i.slot]=i.id;Object.assign(avatarState(),{outfit:m.outfit,accessory:m.accessory});message='じぶんも '+selectedFriend().name+'も おそろい！';
 }
 else if(action==='food'){feedPet(value);return}
 else if(action==='ingredient'){if(lock(8)||l.dish||!ingredients.some(i=>i.id===value))return;if(chosen.includes(value))chosen=chosen.filter(x=>x!==value);else if(chosen.length<2)chosen.push(value);else{render('ふたつ えらんでいるよ。かえるときは、もういちど タップして はずそう。');return}}
 else if(action==='cook'){
  if(lock(8)||l.dish||chosen.length!==2||g.coins<10)return;
  const r=recipes.find(r=>r.pair.every(x=>chosen.includes(x)));if(!r){render('この くみあわせは レシピに ないみたい。したの レシピを みてみよう。');return}
  if(lock(r.level)){render('この レシピは にわっち Lv.'+r.level+'で つくれるよ。');return}
  g.coins-=10;l.dish=r.id;chosen=[];if(!l.cooked.includes(r.id))l.cooked.push(r.id);remember('cook-'+r.id,r.name+'を つくったよ',r.icon);message='おりょうり できあがり！';
 }
 else if(action==='serve'){
  const r=recipes.find(r=>r.id===value&&l.dish===value);const pet=friendState();if(!r||pet.growth>=Number.MAX_SAFE_INTEGER)return;
  l.dish=null;pet.growth++;friendState();message=r.icon+' '+selectedFriend().name+'が おいしく たべたよ！'+(selectedFriend().id===r.favorite?' だいこうぶつ！ とっても うれしい！':'');
 }
 else if(action==='train'){tab='trip';save();railRoom();return}
 else if(action==='tripStart'){const t=trips.find(t=>t.id===value);if(!t||lock(t.level)||l.trip)return;railState();l.trip={id:value,step:0,picks:[]}}
 else if(action==='tripChoice'){if(!l.trip||l.trip.step>=2||!['0','1'].includes(value))return;l.trip.picks.push(Number(value));l.trip.step++}
 else if(action==='tripFinish'){
  const t=trips.find(t=>t.id===value&&l.trip?.id===value);if(!t||l.trip.step!==2)return;
  if(!l.souvenirs.includes(t.gift))l.souvenirs.push(t.gift);const r=roomState();if(!r.owned.includes(t.gift))r.owned.push(t.gift);
  remember('trip-'+t.id,t.name+'へ はじめての たび',t.icon);l.trip=null;message='おかえり！ おみやげは おへや、しゃしんは アルバムに あるよ。';
 }
 else if(action==='tripPause'){tab='play';message='たびの つづきは「おでかけ」で いつでも あそべるよ。'}
 else if(action==='storyStart'){const s=stories.find(s=>s.id===value);if(!s||!storyOpen(s)||l.story)return;l.story={id:value,step:0,picks:[]}}
 else if(action==='storyChoice'){if(!l.story||l.story.step>=2||!['0','1'].includes(value))return;l.story.picks.push(Number(value));l.story.step++}
 else if(action==='storyFinish'){const s=stories.find(s=>s.id===value&&l.story?.id===value);if(!s||l.story.step!==2)return;if(!l.completed.includes(value))l.completed.push(value);remember('story-'+value,s.name,s.icon,s.friend);l.story=null;message='おはなしの おもいでが アルバムに ふえたよ！'}
 else if(action==='storyPause'){tab='play';message='おはなしの つづきは「おはなし」で また あそぼう。'}
 else return;
 save();render(message);if(['tripStart','tripChoice','tripFinish','storyStart','storyChoice','storyFinish'].includes(action)){const panel=app.querySelector('.nl-content');if(panel)panel.scrollTop=0}if(action==='serve'){petReaction('pet-dance','✨ ♥ ✨');playFeedSound(true)}
}
petRoom=render;
window.NiwatchiLife={act,state,token:()=>renderToken,rewards,trips,stories,recipes,clothes,furniture,capacity,storyOpen,photo};
const oldRailRoom=railRoom;
railRoom=function(message=''){oldRailRoom(message);app.querySelector('.rail-room')?.insertAdjacentHTML('beforeend','<div class="nl-rail-link"><h2>🚂 でんしゃで おでかけ</h2><p>おはなばたけ・うみ・ゆきの まち・ほしの おかへ。</p><button class="primary" onclick="NiwatchiLife.openTrips()">いきさきを えらぶ →</button></div>')};
window.NiwatchiLife.openTrips=function(){if(view!=='rail')return;renderProfile=person();tab='trip';render()};
})();
