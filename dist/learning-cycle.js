// Three completed five-question subjects unlock exactly one embedded tile stage.
// Stored inside each learner profile, so existing backups include the cycle.
(function(){
 const subjects=['math','jp','en'];
 function cycle(){const p=person();if(!p.tileCycle||p.tileCycle.version!==1)p.tileCycle={version:1,done:[],pending:false,level:1,rounds:0,board:null};return p.tileCycle}
 window.learningCycle=cycle;
 const oldComplete=completePracticeSubject;
 completePracticeSubject=function(kind){oldComplete(kind);const c=cycle();if(!c.pending&&subjects.includes(kind)&&!c.done.includes(kind))c.done.push(kind);if(subjects.every(s=>c.done.includes(s)))c.pending=true;save()};
 function markup(){const c=cycle();return '<section class="panel center" id="learningCycle"><h2>🌷 まなぶ → あそぶ</h2><p>'+subjects.map((s,i)=>(c.done.includes(s)?'✅ ':'○ ')+['さんすう','こくご','えいご'][i]).join(' → ')+' → 🧩</p><p>それぞれ5もん おわったら、タイルを1ステージ！</p>'+(c.pending?'<button class="primary" onclick="openTileReward()">🧩 '+(c.board?'つづきから あそぶ':'こもれびタイルで あそぶ')+' →</button>':'<p class="muted">あと '+(3-c.done.length)+'きょうか。じぶんの ペースで。</p>')+'</section>'}
 const oldHome=home;
 home=function(){oldHome();app.insertAdjacentHTML('afterbegin',markup());if(cycle().pending){const b=app.querySelector('[onclick="startGuidedPractice()"]');if(b)b.textContent='🧩 ごほうびの タイルへ →';const choices=app.querySelector('.subject-home-choices');if(choices)choices.hidden=true}};
 const oldContinuation=renderSubjectContinuation;
 renderSubjectContinuation=function(){if(cycle().pending){app.querySelector('.actions')?.insertAdjacentHTML('afterbegin','<button class="primary" onclick="openTileReward()">🧩 3きょうか できた！ タイルで あそぶ →</button>')}else oldContinuation()};
 const oldNext=nextSubjectPractice;
 nextSubjectPractice=function(){if(cycle().pending)return openTileReward();oldNext()};
 const oldStart=start,oldEnglish=startEnglish;
 start=function(...args){if(cycle().pending)return openTileReward();return oldStart(...args)};
 startEnglish=function(...args){if(cycle().pending)return openTileReward();return oldEnglish(...args)};
 let active=null;
 window.openTileReward=function(){const c=cycle();if(!c.pending)return;cancelAutoNext();leaveQuizScreen();if('speechSynthesis' in window)speechSynthesis.cancel();session=null;englishSession=null;practiceContinuation=null;view='tileReward';
 app.innerHTML='<section class="center"><p>🧩 ごほうびの1ステージ · クリアしたら がくしゅうへ</p><button class="sub" onclick="home()">⌂ にわに もどる（つづきは ほぞん）</button><iframe title="ごほうびの こもれびタイル" id="tileRewardFrame" src="./komorebi-reward.html?v=2" style="display:block;width:100%;height:850px;border:0;border-radius:24px;margin:14px auto;max-width:520px" allow="autoplay"></iframe></section>';
 active={profile:person(),frame:document.querySelector('#tileRewardFrame'),token:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};
 };
 window.refreshTileAudio=function(){if(active&&view==='tileReward'&&person()===active.profile)active.frame.contentWindow.postMessage({type:'komorebi:audio',token:active.token,noListening:data.noListening===true},location.origin)};
 function validBoard(s,c){if(!s||s.level!==c.level||!Number.isInteger(s.groups)||s.groups!==Math.min(30,6+(c.level-1)*2)||!Number.isInteger(s.done)||s.done<0||s.done>s.groups||!Array.isArray(s.stacks)||s.stacks.length>24||!s.stacks.every(a=>Array.isArray(a)&&a.length<=4)||!Array.isArray(s.tray)||s.tray.length>7)return false;const tiles=s.stacks.flat().concat(s.tray);return tiles.every(t=>Number.isInteger(t)&&t>=0&&t<12)&&tiles.length===3*(s.groups-s.done)}
 addEventListener('message',e=>{if(!active||view!=='tileReward'||person()!==active.profile||e.origin!==location.origin||e.source!==active.frame.contentWindow)return;const c=cycle();if(!c.pending)return;
 if(e.data?.type==='komorebi:ready'){active.frame.contentWindow.postMessage({type:'komorebi:init',token:active.token,level:c.level,state:c.board,noListening:data.noListening===true},location.origin);return}
 if(e.data?.token!==active.token)return;
 if(e.data.type==='komorebi:save'&&validBoard(e.data.state,c)){c.board=JSON.parse(JSON.stringify(e.data.state));save()}
 if(e.data.type==='komorebi:complete'&&c.board&&c.board.done===c.board.groups){c.pending=false;c.done=[];c.board=null;c.level++;c.rounds++;active=null;practiceFlow().next='math';save();home()}
 });
 const oldParents=parents;
 parents=function(){oldParents();app.insertAdjacentHTML('beforeend','<section class="panel"><h2>学習とタイルの1クール</h2><p>算数・国語・英語を各5問終えると、こもれびタイルを1ステージ遊べます。正答率やヒント利用に関係なく、最後まで取り組むと数えます。同じ教科を繰り返しても他教科の代わりにはなりません。クリア後は算数から次のクールへ進みます。ゲームのステージと途中経過は利用者別に保存します。単独版こもれびタイルの進行とは別です。</p></section>')};
 document.querySelector('#parent').onclick=parents;
 if(view==='home')home();
})();

