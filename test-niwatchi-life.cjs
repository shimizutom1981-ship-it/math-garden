// End-to-end state contracts through actual production scripts and action handlers.
const fs=require('node:fs');
const setup=fs.readFileSync('test-foundations.cjs','utf8').split("if(process.argv.includes('--inspect'))")[0];
new Function('require',setup+String.raw`
const life=c.NiwatchiLife,act=(a,v='')=>life.act(a,v,life.token());
const json=s=>JSON.parse(run('JSON.stringify('+s+')'));
function fresh(level=100,coins=1000){run('data.current=0;data.profiles[0]={...person(),game:'+JSON.stringify({coins,growth:3*(level-1),owned:[],equipped:{},days:{},friends:{momo:{growth:12,equipped:{}},sora:{growth:12,equipped:{}},hoshi:{growth:12,equipped:{}}}})+'};home();petRoom()');}
function level(n){run('game().growth='+3*(n-1)+';petRoom()');}
function doneTrip(id){act('tab','trip');act('tripStart',id);act('tripChoice','0');act('tripChoice','1');act('tripFinish',id);}
fresh();run("game().owned=['crown'];game().equipped={hat:'crown'};game().room={owned:['garden','none','sofa'],wall:'garden',furniture:'sofa'};delete game().life;petRoom()");
assert.equal(life.state().placements[0],'sofa');assert.equal(run('game().equipped.hat'),'crown');
run('home();petRoom()');const stable=run('JSON.stringify(data)');for(let n=0;n<15;n++)run('home();petRoom()');assert.equal(run('JSON.stringify(data)'),stable);
assert.equal(life.state().album.length,4);assert.equal(life.state().album.find(m=>m.id==='friend-momo').photo.friend,'momo');
console.log('PASS old inventory, room, all friend levels and render idempotency');
assert.deepEqual(Array.from(life.rewards,r=>r.level),[1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]);
for(const item of life.clothes){fresh(item.level-1);const before=run('game().coins');act('dress',item.id);assert.equal(run('game().owned.length'),0);level(item.level);act('dress',item.id);assert.equal(run('game().coins'),before-item.cost);assert.equal(run('friendState().equipped.'+item.slot),item.id);act('dress',item.id);assert.equal(run('game().coins'),before-item.cost);assert.equal(run('friendState().equipped.'+item.slot),undefined);}
for(const item of life.furniture){fresh(item.level-1);act(item.slot==='wall'?'wall':'furniture',item.id);assert.equal(run('roomState().owned.includes("'+item.id+'")'),false);level(item.level);act(item.slot==='wall'?'wall':'furniture',item.id);assert.equal(run('roomState().owned.includes("'+item.id+'")'),true);}
fresh(1);assert.equal(life.capacity(),3);level(20);assert.equal(life.capacity(),4);level(50);assert.equal(life.capacity(),5);
fresh(100,0);act('dress','basket');act('furniture','bookshelf');assert.equal(run('game().coins'),0);assert.equal(run('game().owned.length'),0);
console.log('PASS all cosmetic unlock boundaries, capacity, costs and insufficient funds');
fresh();act('tab','room');for(const [n,id] of ['bookshelf','aquarium','rug','starlamp','bear'].entries()){act('slot',String(n));act('furniture',id)}
assert.deepEqual(Array.from(life.state().placements),['bookshelf','aquarium','rug','starlamp','bear']);assert.equal(life.state().album.filter(m=>m.id==='room').length,1);
const savedPhoto=JSON.stringify(life.state().album.find(m=>m.id==='room'));act('wall','aurorawall');assert.equal(JSON.stringify(life.state().album.find(m=>m.id==='room')),savedPhoto);
act('wall','forestwall');act('theme');assert.deepEqual(Array.from(life.state().placements).slice(0,2),['bookshelf','rug']);
act('furniture','pressedflower');assert.equal(run('roomState().owned.includes("pressedflower")'),false);
const token=life.token(),before=run('game().coins');act('dress','basket');life.act('dress','basket',token);assert.equal(run('game().coins'),before-15);assert.equal(run('game().equipped.hand'),'basket');
run("selectFriend('momo')");act('dress','wand');assert.equal(run('game().friends.momo.equipped.hand'),'wand');assert.equal(run('game().equipped.hand'),'basket');
console.log('PASS five placements, theme grouping, frozen photos, held-item separation, stale-click guard');
for(const recipe of life.recipes){fresh(recipe.level-1);act('tab','food');for(const i of recipe.pair)act('ingredient',i);act('cook');assert.equal(life.state().dish,null);fresh(recipe.level);act('tab','food');for(const i of recipe.pair)act('ingredient',i);const before=run('game().coins'),growth=run('friendState().growth');act('cook');assert.equal(life.state().dish,recipe.id);assert.equal(run('game().coins'),before-10);assert.equal(run('friendState().growth'),growth);const dish=life.state().dish;run('home();petRoom()');assert.equal(life.state().dish,dish);act('serve',dish);act('serve',dish);assert.equal(run('friendState().growth'),growth+1);assert.equal(run('game().coins'),before-10);assert.equal(life.state().album.filter(m=>m.id==='cook-'+recipe.id).length,1);}
fresh();act('ingredient','bread');act('ingredient','milk');act('cook');assert.equal(run('game().coins'),1000);assert.equal(life.state().dish,null);
console.log('PASS every recipe, level gate, charged once, meal persistence, growth once, invalid pair');
for(const trip of life.trips){fresh(trip.level-1);act('tripStart',trip.id);assert.equal(life.state().trip,null);level(trip.level);act('tripStart',trip.id);act('tripChoice','1');const saved=run('JSON.stringify(data)');run('data=JSON.parse('+JSON.stringify(saved)+');petRoom()');assert.equal(life.state().trip.step,1);act('tripChoice','0');act('tripFinish',trip.id);assert.equal(life.state().souvenirs.includes(trip.gift),true);assert.equal(run('roomState().owned.includes("'+trip.gift+'")'),true);doneTrip(trip.id);assert.equal(life.state().album.filter(m=>m.id==='trip-'+trip.id).length,1);assert.equal(run('game().coins'),1000);act('slot','0');act('furniture',trip.gift);assert.equal(life.state().placements[0],trip.gift);}
console.log('PASS all four journeys, locked departures, resume after reload, souvenir placement, replay deduplication');
fresh();for(const s of life.stories){if(s.friend!=='main')run('game().friends.'+s.friend+'.growth='+3*(s.level-1));run('selectFriend("'+s.friend+'")');assert.equal(life.storyOpen(s),true);act('storyStart',s.id);act('storyChoice','0');act('storyChoice','1');act('storyFinish',s.id);assert.ok(life.state().completed.includes(s.id));assert.equal(life.state().album.find(m=>m.id==='story-'+s.id).photo.friend,s.friend);}
assert.equal(life.state().completed.length,12);assert.equal(run('game().coins'),1000);run('game().friends.momo.growth=0');assert.equal(life.storyOpen(life.stories.find(s=>s.id==='momo-concert')),false);
console.log('PASS all twelve branching stories, individual friend-level gates and matching album photos');
fresh();act('match','marine');assert.equal(run('avatarState().outfit'),'sailor');assert.equal(run('game().equipped.hat'),'sailorhat');act('match','berry');assert.equal(run('avatarState().outfit'),'berrydress');act('match','star');assert.equal(run('avatarState().accessory'),'starclip');
const other=run('JSON.stringify(data.profiles[1])'),snap=run('JSON.stringify(person().stats)');act('play','stroke');act('play','tickle');act('play','ball');assert.equal(run('JSON.stringify(person().stats)'),snap);assert.equal(run('JSON.stringify(data.profiles[1])'),other);const stale=life.token();run('data.current=1;petRoom()');const otherBefore=run('JSON.stringify(person())');life.act('dress','bluebow',stale);assert.equal(run('JSON.stringify(person())'),otherBefore);assert.equal(life.state().album.length,1);
console.log('PASS matching avatar themes, no learning mutations and per-child isolation');
// Execute the complete real startup again, with the persisted new inventory.
fresh();act('dress','bluebow');act('dress','basket');run("selectFriend('momo')");act('dress','wand');act('wall','forestwall');act('slot','2');act('furniture','bookshelf');doneTrip('flowers');run('save()');
const persisted=storage.get('kazunoniwa-v1'),expected=json('person().game');
const d2={...document,body:element(),head:element(),documentElement:element()};const c2={...c,document:d2,localStorage:{getItem:()=>persisted,setItem(){}},window:null};c2.window=c2;vm.createContext(c2);
for(const m of fs.readFileSync('dist/index.html','utf8').matchAll(/<script(?:\s+src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1]?fs.readFileSync('dist/'+m[1].split('?')[0].replace('./',''),'utf8'):m[2],c2);
vm.runInContext('petRoom()',c2);const actual=JSON.parse(vm.runInContext('JSON.stringify(person().game)',c2));assert.deepEqual(actual,expected);
assert.ok(vm.runInContext('petArt()',c2).includes('nl-hand'));vm.runInContext("selectFriend('main')",c2);assert.ok(vm.runInContext('petArt()',c2).includes('nl-bow'));
console.log('PASS full cold-start reload preserves all new possessions, equipped hands, souvenirs and snapshots');
run('data.current=0;person().game.life={placements:["bad"],album:[{id:"hello",photo:null}],trip:{id:"flowers",step:2,picks:[9,9]},story:{id:"main-seed",step:9,picks:[]},cooked:["bad"],souvenirs:["bad"]};petRoom()');assert.equal(life.state().trip,null);assert.equal(life.state().story,null);assert.equal(life.state().cooked.length,0);assert.equal(life.state().placements.length,5);
console.log('PASS malformed restored data safely normalized');
`)(require);
