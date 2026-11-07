/* Additive life-math questions. Existing banks and learning state are never changed here. */
(function(root){
 'use strict';
 const banks={lifeClock:[[],[],[]],lifeShopping:[[],[],[]]};
 const labels=['あ','い','う'];
 const next=h=>h%12+1,previous=h=>(h+10)%12+1;
 const time=(h,m)=>`${h}じ${m===30?' はん':''}`;
 function clock(h,m){
  const hand=(angle,len,color,width)=>`<line x1="80" y1="80" x2="${(80+Math.sin(angle)*len).toFixed(3)}" y2="${(80-Math.cos(angle)*len).toFixed(3)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  const face=Array.from({length:12},(_,i)=>{const a=(i+1)*Math.PI/6;return `<text x="${(80+Math.sin(a)*60).toFixed(3)}" y="${(85-Math.cos(a)*60).toFixed(3)}" text-anchor="middle" font-size="14" fill="#173b2b">${i+1}</text>`}).join('');
  return `<svg viewBox="0 0 160 160" width="140" height="140" style="max-width:100%;display:block;margin:auto" role="img" aria-label="${time(h,m)}の とけい"><circle cx="80" cy="80" r="75" fill="#fff" stroke="#426657"/>${face}${hand((h%12+m/60)*Math.PI/6,35,'#315f4c',5)}${hand(m*Math.PI/30,50,'#a55723',3)}<circle cx="80" cy="80" r="3" fill="#173b2b"/></svg>`;
 }
 function add(id,stage,q){q.expansionId=`life-math-v1-${id}-${stage}-${banks[id][stage].length+1}`;banks[id][stage].push(q)}
 for(let h=1;h<=12;h++)for(const stage of [0,1]){
  const m=stage*30,correctIndex=(h-1)%3,other=[next(h),next(next(h))],shown=labels.map((label,i)=>({label,h:i===correctIndex?h:other.shift(),m}));
  add('lifeClock',stage,{
   type:'mathExtended',text:`${time(h,m)}の とけいは、あ・い・うの どれ？`,answer:labels[correctIndex],choices:labels.slice(),
   hint:m===0?'ながい はりが 12、みじかい はりが なんじを さすか みよう。':'はんの とき、ながい はりは 6。みじかい はりは 2つの すうじの あいだだよ。',
   meta:{op:'clockChoice',h,m,shown},
   visualHTML:`<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">${shown.map(x=>`<div style="width:140px;max-width:100%;text-align:center"><strong>${x.label}</strong>${clock(x.h,x.m)}</div>`).join('')}</div>`
  });
 }
 for(let h=1;h<=12;h++){
  const pair=n=>`${n} と ${next(n)} の あいだ`;
  add('lifeClock',1,{
   type:'mathExtended',text:'みじかい はりは、どの 2つの すうじの あいだ？',answer:pair(h),choices:[pair(h),pair(previous(h)),pair(next(h))],
   hint:'ながい はりが 6を さす はんの とき、みじかい はりは つぎの すうじへ はんぶん すすむよ。',
   meta:{op:'clockHourBetween',h,m:30,before:h,after:next(h)},visualHTML:clock(h,30)
  });
 }
 function moneyChoices(value,max=100){
  const candidates=[value,...[10,-10,20,-20,30,-30,40,-40,50,-50,60,-60,70,-70,80,-80,90,-90].map(d=>value+d)];
  return [...new Set(candidates.filter(n=>n>=0&&n<=max))].slice(0,4).map(n=>`${n}円`);
 }
 function numeric(text,value,hint,meta,visualHTML='',max=100){return {type:'mathExtended',text,answer:`${value}円`,choices:moneyChoices(value,max),hint,meta,visualHTML}}
 function coins(count){
  // Countable ten-yen tokens; labels are text rather than font-dependent emoji.
  return `<div role="img" aria-label="10えんだまが ${count}まい" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">${Array.from({length:count},()=>'<span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:2px solid #8c5429;border-radius:50%;background:#f5d8b5;color:#49301a;font-size:16px;font-weight:bold">10円</span>').join('')}</div>`;
 }
 // A new representation, not new arithmetic facts: count ten-yen coins, then find change.
 // Existing text-only paid/price combinations are left untouched.
 for(let count=3;count<=9;count++)for(let price=10;price<count*10;price+=10){
  const paid=count*10;
  add('lifeShopping',1,numeric(
   `えの 10えんだまを ぜんぶ だして、${price}円の パンを かいます。おつりは？`,paid-price,
   '10えんだまを かぞえて、ぜんぶで いくらか たしかめよう。それから ねだんを ひこう。',
   {op:'coinChange',coinValue:10,coinCount:count,paid,prices:[price]},coins(count),paid
  ));
 }
 // Distinct unordered two-item combinations, with payments other than the existing 100 yen.
 for(let paid=30;paid<=90;paid+=10)for(let a=10;a<paid;a+=10)for(let b=a;b<paid-a;b+=10){
  add('lifeShopping',2,numeric(
   `${paid}円で ${a}円の えんぴつと ${b}円の けしゴムを かいます。おつりは？`,paid-a-b,
   '2つの ねだんを たしてから、だした おかねから ひこう。',
   {op:'change',paid,prices:[a,b]},'',paid
  ));
 }
 // Total-price tasks use the same ten-yen units, with totals no greater than 90 yen.
 for(let a=10;a<=80;a+=10)for(let b=a;a+b<=90;b+=10){
  add('lifeShopping',2,numeric(
   `${a}円の えんぴつと ${b}円の けしゴムを 1つずつ かいます。あわせて いくら？`,a+b,
   '2つの ねだんを、10えんの まとまりで たそう。',
   {op:'shoppingTotal',prices:[a,b]},'',90
  ));
 }
 const items=Object.entries(banks).flatMap(([skill,stages])=>stages.flatMap((bank,stage)=>bank.map(q=>({skill,stage,...q}))));
 const key=q=>q.text+'|'+JSON.stringify(q.meta);
 function install(garden){
  if(!garden||!garden.banks)throw new TypeError('GardenQuestions banks are required');
  for(const item of items){
   const bank=garden.banks[item.skill]?.[item.stage];
   if(!Array.isArray(bank))throw new RangeError('Missing bank '+item.skill+':'+item.stage);
   if(!bank.some(q=>q.expansionId===item.expansionId||key(q)===key(item))){
    const {skill,stage,...q}=item;bank.push({...q,choices:q.choices.slice()});
   }
  }
  return garden;
 }
 const api={version:1,banks,items,clock,install};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.MathLifeExpansion=api;
})(typeof globalThis==='object'?globalThis:this);
