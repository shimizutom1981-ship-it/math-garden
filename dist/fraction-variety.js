/* Equal-part fraction practice for the existing mathRational stage 0.
 * No course, generator, profile or curriculum changes are performed here.
 */
(function(root){
 'use strict';
 const items=[],pairs=[];
 for(let d=2;d<=10;d++){
  pairs.push({n:1,d});
  if(d>2)pairs.push({n:d-1,d});
 }
 pairs.push({n:4,d:8});
 const all=[];for(let d=2;d<=10;d++)for(let n=1;n<d;n++)all.push({n,d});
 const equivalent=(a,b)=>a.n*b.d===b.n*a.d;
 const fraction=(f,unit='')=>`${f.n}/${f.d}${unit?' '+unit:''}`;
 function alternatives(f){
  const ordered=[...all.filter(x=>x.d===f.d),...all.filter(x=>x.d!==f.d)];
  const selected=[{n:f.n,d:f.d}];
  for(const x of ordered){if(!selected.some(y=>equivalent(x,y)))selected.push({n:x.n,d:x.d});if(selected.length===3)break;}
  return selected;
 }
 function line(f,label=''){
  const left=22,width=316,y=28;
  return `<svg viewBox="0 0 360 72" width="100%" height="72" style="display:block;width:100%;max-width:420px;margin:auto" role="img" aria-label="${label?label+'：':''}全体が1の線分を${f.d}等分。左から${f.n}つ分に色と太線">`+
   `<line x1="${left}" y1="${y}" x2="${left+width}" y2="${y}" stroke="#79847f" stroke-width="3"/>`+
   `<line x1="${left}" y1="${y}" x2="${left+width*f.n/f.d}" y2="${y}" stroke="#24684e" stroke-width="10"/>`+
   Array.from({length:f.d+1},(_,k)=>`<line x1="${left+width*k/f.d}" y1="${y-12}" x2="${left+width*k/f.d}" y2="${y+12}" stroke="#253c32" stroke-width="2"/>`).join('')+
   `<text x="${left}" y="61" text-anchor="middle" font-size="17">0</text><text x="${left+width}" y="61" text-anchor="middle" font-size="17">1</text></svg>`;
 }
 function tape(f){
  const left=22,width=316;
  return `<svg viewBox="0 0 360 100" width="100%" height="100" style="display:block;width:100%;max-width:420px;margin:auto" role="img" aria-label="全体が1メートルのテープを同じ長さに${f.d}等分。左から${f.n}つに色と丸印">`+
   `<text x="180" y="19" text-anchor="middle" font-size="17">ぜんたいで 1m</text>`+
   Array.from({length:f.d},(_,k)=>`<rect x="${left+width*k/f.d}" y="31" width="${width/f.d}" height="40" fill="${k<f.n?'#cce4d8':'#fff'}" stroke="#253c32" stroke-width="1.5"/>`+(k<f.n?`<circle cx="${left+width*(k+.5)/f.d}" cy="51" r="3.5" fill="#24684e"/>`:'')).join('')+
   `<text x="${left}" y="94" text-anchor="middle" font-size="15">0</text><text x="${left+width}" y="94" text-anchor="middle" font-size="15">1m</text></svg>`;
 }
 function vessel(f){
  const x=96,y=28,width=100,height=180;
  return `<svg viewBox="0 0 300 242" width="100%" height="242" style="display:block;width:100%;max-width:320px;margin:auto" role="img" aria-label="いっぱいで1リットルのうつわ。同じ りょうずつ${f.d}等分する目盛で、下から${f.n}つ分の水。水には丸印">`+
   `<text x="150" y="18" text-anchor="middle" font-size="17">いっぱいで 1L</text>`+
   Array.from({length:f.d},(_,k)=>`<rect x="${x}" y="${y+height*(f.d-k-1)/f.d}" width="${width}" height="${height/f.d}" fill="${k<f.n?'#c6e0ef':'#fff'}" stroke="#253c32" stroke-width="1.5"/>`+(k<f.n?`<circle cx="${x+width/2}" cy="${y+height*(f.d-k-.5)/f.d}" r="3.5" fill="#245f7e"/>`:'')).join('')+
   `<text x="${x+width+10}" y="${y+6}" font-size="15">1L</text><text x="${x+width+10}" y="${y+height+5}" font-size="15">0</text></svg>`;
 }
 function add(mode,f,index){
  const unit=mode==='tapeToFraction'?'m':mode==='vesselToFraction'?'L':'';
  const options=alternatives(f);
  const meta={op:'fractionVariety',mode,n:f.n,d:f.d,unit,whole:1,equalParts:true,options:options.map(x=>({...x}))};
  let text,answer,choices,visualHTML,hint;
  if(mode==='fractionToLine'){
   // Vary the answer position without introducing equivalent distractors.
   const offset=index%3,display=options.map((_,k)=>options[(k+offset)%3]);
   const labels=['あ','い','う'];
   meta.options=display.map((x,k)=>({...x,label:labels[k]}));
   answer=labels[display.findIndex(x=>equivalent(x,f))];choices=labels.slice();meta.correctLabel=answer;
   text=`${fraction(f)} に あう 図は？ どの線も全体は1。めもりは同じ長さに分けてあります。色のついた太い部分を見よう。`;
   visualHTML='<div class="fraction-variety-options">'+display.map((x,k)=>`<div style="margin:8px 0"><strong>${labels[k]}</strong>${line(x,labels[k])}</div>`).join('')+'</div>';
   hint=`下の数${f.d}は分けた数、上の数${f.n}は色のついた部分の数だよ。`;
  }else{
   choices=options.map(x=>fraction(x,unit));answer=fraction(f,unit);
   if(mode==='lineToFraction'){
    text=`全体を1として、線を同じ長さに${f.d}等分しました。色のついた太い部分は、全体のどの分数？`;
    visualHTML=line(f);hint=`同じ長さに分けた数は${f.d}。色のついた区切りを数えよう。`;
   }else if(mode==='tapeToFraction'){
    text=`1mのテープを同じ長さに${f.d}等分しました。色と丸印のついた部分の長さは何m？`;
    visualHTML=tape(f);hint=`1mを${f.d}等分した1つ分は1/${f.d}m。丸印のある部分を数えよう。`;
   }else{
    text=`いっぱいで1Lのうつわです。同じ りょうずつ${f.d}等分するめもりがあります。色と丸印のついた水は何L？`;
    visualHTML=vessel(f);hint=`1Lを${f.d}等分した1つ分は1/${f.d}L。水の入った部分を下から数えよう。`;
   }
   // Rotate number choices too; answer content is unchanged.
   const offset=index%3;choices=choices.slice(offset).concat(choices.slice(0,offset));
  }
  items.push({id:`fraction-variety-${mode}-${f.n}-${f.d}`,type:'mathExtended',skill:'mathRational',stage:0,text,answer,choices,hint,visualHTML,variant:mode,meta});
 }
 for(const mode of ['lineToFraction','tapeToFraction','vesselToFraction','fractionToLine'])pairs.forEach((f,i)=>add(mode,f,i));
 function pick(seen=[],rng=Math.random){
  const random=()=>{const n=rng();return Number.isFinite(n)?Math.min(.999999999,Math.max(0,n)):0;};
  let pool=items.filter(q=>!seen.includes(q.id));
  if(!pool.length){seen.length=0;pool=items;}
  const q=pool[Math.floor(random()*pool.length)];seen.push(q.id);
  const choices=q.choices.slice();
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
  return {...q,choices,meta:{...q.meta,options:q.meta.options.map(x=>({...x}))}};
 }
 const api={items,banks:{mathRational:[items]},pick,diagrams:{line,tape,vessel}};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FractionVariety=api;
})(typeof globalThis==='object'?globalThis:this);
