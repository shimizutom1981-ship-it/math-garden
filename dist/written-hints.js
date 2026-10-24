(function(root){
 'use strict';
 function model(question){
  const m=question?.arithmetic||question?.meta;
  if(!m||typeof m.op!=='string')return null;
  const ops={add:'add',subtract:'subtract',multiply:'multiply',divide:'divide',decimalAdd:'add',decimalSubtract:'subtract',decimalMultiply:'multiply',decimalDivide:'divide'};
  const op=ops[m.op],decimal=m.op.startsWith('decimal'),scale=decimal?m.scale:1;
  if(!op||![1,10,100].includes(scale)||![m.a,m.b].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=999999))return null;
  if(op==='divide'&&!m.b||op==='subtract'&&m.a<m.b)return null;
  const places=scale===100?2:scale===10?1:0;
  const format=(n,p)=>p?(n/10**p).toFixed(p):String(n);
  const a=format(m.a,places),b=format(m.b,op==='add'||op==='subtract'?places:0);
  const width=Math.max(a.length,b.length)+1;
  const pad=s=>s.padStart(width,' ');
  const symbol={add:'+',subtract:'−',multiply:'×',divide:'÷'}[op];
  let rows,detail,marks=[];
  if(op==='divide'){
   rows=[' '.repeat(String(m.b).length+3)+'□',' '.repeat(String(m.b).length+3)+'─'.repeat(a.length),String(m.b)+' ) '+a];
   detail='左の位から、わる数がいくつ入るか考えよう。「たてる → かける → ひく → おろす」をくり返すよ。あまりは、わる数より小さくしよう。';
   if(places)detail+=' 小数点をこえたら、答えにも同じ位置に小数点を打つよ。整数部分でわる数が入らないときは、答えの一の位に0を書くよ。';
  }else{
   rows=[pad(a),symbol+pad(b).slice(1),'─'.repeat(width),pad('□')];
   const aa=String(m.a).split('').reverse().map(Number),bb=String(m.b).split('').reverse().map(Number);
   const n=Math.max(aa.length,bb.length);
   const position=i=>places?(i<places?'小数第'+(places-i)+'位':10**(i-places)+'の位'):10**i+'の位';
   if(op==='add'){
    let carry=0;
    for(let i=0;i<n;i++){const sum=(aa[i]||0)+(bb[i]||0)+carry;carry=Math.floor(sum/10);if(carry)marks.push(position(i)+'から '+position(i+1)+'へ 1 くり上げる');}
    detail='右の位からたそう。10になったまとまりは、左の位へくり上げるよ。';
   }else if(op==='subtract'){
    while(aa.length<n)aa.push(0);
    for(let i=0;i<n;i++)if(aa[i]<(bb[i]||0)){
     let j=i+1;while(j<n&&aa[j]===0)j++;
     if(j===n)return null;
     aa[j]--;for(let k=j-1;k>i;k--)aa[k]=9;aa[i]+=10;
    }
    for(let i=n-1;i>=0;i--)if(aa[i]!==Number(String(m.a).padStart(n,'0')[n-1-i]))marks.push(position(i)+'は '+aa[i]+' として考える');
    detail='右の位からひこう。ひけない位は左から借りるよ。間に0があるときは、そのさらに左から順にくり下げよう。';
   }else{
    detail='下の数の一の位から、上の数の各位にかけよう。10以上のまとまりは左へくり上げるよ。';
    if(m.b>=10)detail+=' 下の十の位をかけた行は、一つ左へずらして書き、最後に各行をたそう。';
    if(places)detail+=' 上の数の小数は'+places+'けた。いったん整数としてかけて、答えの右から'+places+'けたの位置に小数点をもどそう。';
   }
   if(places&&(op==='add'||op==='subtract'))detail+=' 小数点の位置をそろえたまま計算しよう。';
  }
  return {op,rows,marks,detail,instruction:op==='divide'?'わられる数を中に、わる数を左に書いたよ。答えは自分で考えよう。':(places?(op==='multiply'?'小数点はいったん気にせず、右端の数字をそろえたよ。':'小数点と同じ位をそろえたよ。'):'一の位を右にそろえたよ。')+'答えは自分で考えよう。'};
 }
 const api={model};
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.WrittenHints=api;
})(typeof globalThis==='object'?globalThis:this);

if(typeof document!=='undefined'){
 const previousHint=showHint;
 const stages=new WeakMap();
 showHint=function(){
  if(!session||session.done||view!=='quiz')return;
  const m=WrittenHints.model(q);
  if(!m){previousHint();return}
  session.help=true;
  const stage=Math.min(2,(stages.get(q)||0)+1);stages.set(q,stage);
  const h=document.querySelector('#hint');h.classList.remove('hidden');
  h.innerHTML='<div class="written-hint"><strong>筆算のヒント '+stage+' / 2</strong><pre aria-label="答えを空欄にした筆算">'+esc(m.rows.join('\n'))+'</pre><p>'+esc(stage===1?m.instruction:m.detail)+'</p>'+(stage===2&&m.marks.length?'<ul>'+m.marks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+'</div>';
  const button=document.querySelector('#hintButton');button.textContent=stage===1?'💡 計算の手がかり':'💡 ヒントをもう一度';
  // Never read the original hint here: older subtraction hints contain the answer.
  speak(stage===1?m.instruction:m.detail);
 };
 const style=document.createElement('style');
 style.textContent='.written-hint{text-align:left;max-width:100%;overflow-wrap:anywhere}.written-hint pre{font-family:ui-monospace,Consolas,monospace;font-size:clamp(22px,6vw,30px);line-height:1.5;white-space:pre;width:max-content;max-width:100%;margin:12px auto;letter-spacing:.12em}.written-hint p,.written-hint li{font-size:15px;line-height:1.7}.written-hint ul{padding-left:22px}.written-hint pre{font-variant-numeric:tabular-nums}';document.head.appendChild(style);
}
