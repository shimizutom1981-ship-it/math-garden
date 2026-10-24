// Permanent, per-profile cosmetic milestones. No currency, equipment or mastery changes.
const FRIEND_KEEPSAKES = [
 ['momo','ももっち','🌸',['はなのかざり','はなのなかよし','はなのはた']],
 ['sora','そらっち','☁️',['くものかざり','そらのなかよし','そらのはた']],
 ['hoshi','ほしっち','⭐',['ほしのかざり','ほしのなかよし','ほしのはた']]
].flatMap(([friend,name,icon,titles])=>[3,5,10].map((level,i)=>({
 id:friend+'-'+level,friend,name,level,title:titles[i],icon:i===2?'🚩':icon,kind:i===1?'しょうごう':'かざり'
})));

function syncFriendKeepsakes(){
 const g=game(),old=g.friendKeepsakes;
 const existing=new Set(Array.isArray(old?.earned)?old.earned:[]);
 const earned=FRIEND_KEEPSAKES.filter(r=>existing.has(r.id)||(
  Number.isSafeInteger(g.friends?.[r.friend]?.growth)&&g.friends[r.friend].growth>=3*(r.level-1)
 )).map(r=>r.id);
 const added=earned.filter(id=>!existing.has(id));
 const next={version:1,earned};
 if(JSON.stringify(old)!==JSON.stringify(next)){g.friendKeepsakes=next;save()}
 return added;
}
function friendKeepsakeShelf(){
 const earned=new Set(game().friendKeepsakes?.earned||[]);
 const items=FRIEND_KEEPSAKES.filter(r=>earned.has(r.id));
 return items.length?'<section class="friend-keepsakes"><h2>ともだちの たからもの</h2><p>そだてた しるし。だれと いても、ずっと のこるよ。</p><ul>'+items.map(r=>'<li><span aria-hidden="true">'+r.icon+'</span><strong>'+r.title+'</strong><small>'+r.name+' Lv.'+r.level+' · '+r.kind+'</small></li>').join('')+'</ul></section>':'';
}
function friendKeepsakeProgress(){
 const earned=new Set(game().friendKeepsakes?.earned||[]),f=selectedFriend();
 const rewards=FRIEND_KEEPSAKES.filter(r=>r.friend===f.id);
 const next=rewards.find(r=>!earned.has(r.id));
 const lead=f.id==='main'?'ももっち・そらっち・ほしっちを そだてると、たからものが ふえるよ。':next?'つぎは Lv.'+next.level+' で「'+next.title+'」！':'この ともだちの たからものは、ぜんぶ そろったよ！';
 return '<section class="friend-keepsakes friend-keepsake-progress"><h2>そだてて あつめよう</h2><p>'+lead+'</p><p>Lv.3：かざり ／ Lv.5：しょうごう ／ Lv.10：はた<br>たからものに 追加の コインは いらないよ。</p>'+(rewards.length?'<ul>'+rewards.map(r=>'<li><span aria-hidden="true">'+r.icon+'</span><strong>'+r.title+'</strong><small>Lv.'+r.level+' · '+(earned.has(r.id)?'もっている':'これから')+'</small></li>').join('')+'</ul>':'')+'</section>';
}
const keepsakeHome=home;
home=function(){syncFriendKeepsakes();keepsakeHome();app.insertAdjacentHTML('beforeend',friendKeepsakeShelf())};
const keepsakePetRoom=petRoom;
petRoom=function(message=''){
 const added=syncFriendKeepsakes();
 if(added.length)message+=(message?' ':'')+'たからものが '+added.length+'こ ふえたよ！';
 keepsakePetRoom(message);
 app.querySelector('.pet-room-controls')?.insertAdjacentHTML('afterbegin',friendKeepsakeProgress());
 app.insertAdjacentHTML('beforeend',friendKeepsakeShelf());
};
const keepsakeStyle=document.createElement('style');
keepsakeStyle.textContent='.friend-keepsakes{max-width:900px;margin:16px auto;padding:14px;background:#fff9e9;border:1px solid #ead9ae;border-radius:18px;box-sizing:border-box;overflow-wrap:anywhere}.friend-keepsakes h2{font-size:20px;margin:0 0 8px}.friend-keepsakes p{font-size:14px;line-height:1.7}.friend-keepsakes ul{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:0;padding:0}.friend-keepsakes li{display:flex;flex-direction:column;align-items:center;text-align:center;gap:5px;padding:10px 6px;background:#fff;border-radius:12px;min-width:0}.friend-keepsakes li>span{font-size:28px}.friend-keepsakes strong{font-size:14px}.friend-keepsakes small{font-size:12px;color:#56604e}.friend-keepsake-progress{margin:0 0 14px}';
document.head.appendChild(keepsakeStyle);
// The original entry point runs before extension scripts load.
if(view==='home')home();
