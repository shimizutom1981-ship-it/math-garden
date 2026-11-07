/* Browser-local picture-word scheduling. This is practice, not a vocabulary test. */
(function(root){
 'use strict';
 const bankIds=['animals','food','things'],modes=['listening','reading'];
 const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const count=(n,max=1e9)=>Number.isSafeInteger(n)&&n>=0?Math.min(n,max):0;
 const stable=r=>r.streak>=4&&r.multipleSets;
 function state(profile){
  if(!object(profile.englishWordPractice)||profile.englishWordPractice.version!==1)profile.englishWordPractice={version:1,banks:{}};
  const s=profile.englishWordPractice;if(!object(s.banks))s.banks={};return s;
 }
 function bankState(profile,bankIndex,mode,bank){
  if(!bankIds[bankIndex]||!modes.includes(mode))return null;
  const s=state(profile),key=bankIds[bankIndex]+':'+mode;
  let b=s.banks[key];if(!object(b))b=s.banks[key]={};
  b.turn=count(b.turn);const words=object(b.words)?b.words:{};b.words={};
  for(const [word] of bank){
   const old=Object.hasOwn(words,word)?words[word]:null;if(!object(old))continue;
   const r={};for(const k of ['shown','lastShown','total','correct','wrong','hinted','rapid','streak','lastCleanTurn','lastCleanSet','lastAnswerTurn','due'])r[k]=count(old[k]);
   r.lastShown=Math.min(r.lastShown,b.turn);r.lastAnswerTurn=Math.min(r.lastAnswerTurn,b.turn);r.lastCleanTurn=Math.min(r.lastCleanTurn,b.turn);
   r.correct=Math.min(r.correct,r.total);r.wrong=r.total-r.correct;r.hinted=Math.min(r.hinted,r.total);r.rapid=Math.min(r.rapid,r.total);
   r.streak=Math.min(6,r.streak,r.correct);r.multipleSets=old.multipleSets===true&&r.streak>1;
   b.words[word]=r;
  }
  b.recent=Array.isArray(b.recent)?b.recent.filter(w=>bank.some(row=>row[0]===w)).slice(-2):[];
  return b;
 }
 function empty(){return {shown:0,lastShown:0,total:0,correct:0,wrong:0,hinted:0,rapid:0,streak:0,multipleSets:false,lastCleanTurn:0,lastCleanSet:0,lastAnswerTurn:0,due:0}}
 function pick(profile,bankIndex,mode,bank,seen=[],random=Math.random){
  const b=bankState(profile,bankIndex,mode,bank);if(!b||!bank.length)return null;
  b.turn++;
  let pool=bank.filter(w=>!seen.includes(w[0])&&!b.recent.includes(w[0]));
  if(!pool.length)pool=bank.filter(w=>w[0]!==b.recent.at(-1));
  if(!pool.length)pool=bank;
  const record=w=>b.words[w[0]]||empty();
  const fresh=pool.filter(w=>!record(w).total);
  const due=pool.filter(w=>record(w).total&&record(w).due<=b.turn);
  const practice=due.filter(w=>!stable(record(w))),review=due.filter(w=>stable(record(w)));
  // Two of five opportunities favor new words, two favor practice, one favors
  // due reviews. Empty lanes lend their turn; no word is permanently removed.
  const lane=b.turn%5,groups=lane===0?[review,practice,fresh]:lane===1||lane===4?[fresh,practice,review]:[practice,fresh,review];
  const candidates=groups.find(xs=>xs.length)||pool;
  const ordered=candidates.map(w=>({w,r:record(w),tie:random()})).sort((a,c)=>
   (candidates===fresh?0:a.r.due-c.r.due)||a.r.lastShown-c.r.lastShown||a.tie-c.tie);
  const word=ordered[0].w,r=b.words[word[0]]||(b.words[word[0]]=empty());
  r.shown++;r.lastShown=b.turn;b.recent=[...b.recent,word[0]].slice(-2);
  return {word,turn:b.turn};
 }
 function record(profile,bankIndex,mode,bank,word,turn,set,correct,hinted,elapsed){
  const b=bankState(profile,bankIndex,mode,bank),r=b&&Object.hasOwn(b.words,word)?b.words[word]:null;
  if(!r||!Number.isSafeInteger(turn)||turn<1||turn>b.turn||turn!==r.lastShown||r.lastAnswerTurn>=turn)return false;
  r.lastAnswerTurn=turn;r.total++;if(correct)r.correct++;else r.wrong++;
  const rapid=Number.isFinite(elapsed)&&elapsed<450;
  if(hinted)r.hinted++;if(rapid)r.rapid++;
  const clean=correct&&!hinted&&!rapid;
  if(!clean){r.streak=0;r.multipleSets=false;r.lastCleanTurn=0}
  else if(!r.lastCleanTurn||turn-r.lastCleanTurn>=5){
   if(r.streak&&r.lastCleanSet!==count(set))r.multipleSets=true;
   r.streak=Math.min(6,r.streak+1);r.lastCleanTurn=turn;r.lastCleanSet=count(set);
  }
  // A lucky two-choice answer does not establish familiarity. Require four
  // spaced, unaided first answers across at least two completed-set IDs.
  const gap=!clean?6:stable(r)?bank.length*[2,3,4][r.streak-4]:8+Math.min(3,r.streak)*2;
  r.due=turn+gap;return true;
 }
 const api={state,bankState,pick,record,stable};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 root.EnglishWordPractice=api;
 // Keep the existing curriculum, bounds, distractors, speech and rewards.
 pickEnglishPicture=function(e,bank){
  const bankIndex=EN_WORDS.indexOf(bank),mode=data.noListening||!data.sound||!('speechSynthesis'in window)?'reading':'listening';
  const chosen=pick(person(),bankIndex,mode,bank,e.seen);
  e.wordPractice={profile:person(),bankIndex,mode,word:chosen.word[0],turn:chosen.turn,set:Practice.state(person()).sessions.en||0,recorded:false};
  save();return chosen.word;
 };
 const previousAnswer=englishAnswer;
 englishAnswer=function(i,el){
  const e=englishSession,x=e?.wordPractice;
  if(view!=='quiz'||!e||e.done||!el||el.disabled||!e.choices[i])return;
  if(x&&!x.recorded&&x.profile===person()&&e.level<12&&x.word===e.word[0]){
   x.recorded=true;
   record(person(),x.bankIndex,x.mode,EN_WORDS[x.bankIndex],x.word,x.turn,x.set,e.choices[i][0]===e.word[0],e.help===true,practiceClock?Date.now()-practiceClock.start:null);
   save();
  }
  previousAnswer(i,el);
 };
 const previousParents=parents;
 parents=function(){previousParents();app.insertAdjacentHTML('beforeend','<section class="panel"><h2>初級英単語のくり返し</h2><p>動物・食べ物・身の回り・動作の183項目を、お子さんごと・単語ごとに調整します。何回か間を空けて自力正解できた語は回数を減らし、ときどき復習します。間違えた語は少し出やすくしますが、すぐ同じ語を続けず、新しい語も出します。</p><p class="muted">2択の偶然の正解もあるため、1回の正解では覚えたとみなしません。最初の回答・ヒントを記録し、音声あり（英単語の文字表示つき）と無音の練習は別に扱います。現在の出題範囲の中だけで調整し、上限・下限を変えません。このブラウザに保存され、バックアップにも含まれます。過去の集計から単語別の成績は推測しません。</p></section>')};
 document.querySelector('#parent').onclick=parents;
})(typeof globalThis==='object'?globalThis:this);
