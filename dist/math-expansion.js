(function (root) {
  'use strict';
  const defs = [
    {id:'mathDecompose',title:'数の分け方・まとめ方',stages:['10をつくる','100をつくる','まとめて暗算']},
    {id:'mathCarry',title:'くり上がりのたし算',stages:['一の位のくり上がり','2けたのたし算','3けたのたし算'],prerequisite:'mathDecompose'},
    {id:'mathBorrow',title:'くり下がりのひき算',stages:['十からくり下げる','2けたのひき算','3けたのひき算'],prerequisite:'mathDecompose'},
    {id:'mathProduct',title:'かけ算の広がり',stages:['九九','2けた × 1けた','2けた × 2けた']},
    {id:'mathQuotient',title:'わり算の広がり',stages:['わり切れるわり算','あまりのあるわり算','2けたでわる'],prerequisite:'mathProduct'},
    {id:'mathOrder',title:'計算の順序',stages:['かけ算を先に','かっこの中を先に','かっことわり算'],prerequisite:'mathProduct'},
    {id:'mathRational',title:'分数の比べ方・同じ大きさ',stages:['図と分数','分数の大小','等しい分数','分数のたし算']},
    {id:'mathDecimal',title:'小数の比べ方・計算',stages:['小数の大小','小数のたし算・ひき算','小数のかけ算・わり算']},
    {id:'mathPercent',title:'割合・百分率',stages:['図と百分率','割合を比べる','割合を使う'],prerequisite:'mathRational'}
  ];
  function gcd(a,b){while(b){const t=a%b;a=b;b=t;}return a;}
  function fraction(n,d){const g=gcd(n,d);return `${n/g}/${d/g}`;}
  function decimal(n,scale){return String(n/scale);}
  function make(id,stage,rng){
    const def=defs.find(d=>d.id===id);
    if(!def || !Number.isInteger(stage) || stage<0 || stage>=def.stages.length)throw new RangeError('Unknown math skill or stage');
    const random=typeof rng==='function'?rng:Math.random;
    const r=(lo,hi)=>lo+Math.floor(Math.min(.999999999,Math.max(0,random()))*(hi-lo+1));
    const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=r(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
    let text,answer,choices,hint,visualHTML,meta;
    const numeric=(value,step=1,format=String)=>{
      answer=format(value); const values=[value];
      for(const offset of [step,-step,step*2,-step*2,step*3,step*4])if(value+offset>=0 && !values.includes(value+offset))values.push(value+offset);
      choices=values.slice(0,4).map(format);
    };
    const diagram=(n,d)=>`<svg viewBox="0 0 400 64" width="100%" height="64" style="display:block;width:100%;max-width:420px;margin:auto" role="img" aria-label="同じ大きさの${d}つの部分のうち${n}つが色つき">${Array.from({length:d},(_,i)=>`<rect x="${2+i*396/d}" y="8" width="${396/d-2}" height="48" rx="2" fill="${i<n?'#357f65':'#eef1ee'}" stroke="#446457"/>`).join('')}</svg>`;
    if(id==='mathDecompose'){
      if(stage<2){const total=stage===0?10:100,a=r(1,total-1);text=`${a} ＋ □ ＝ ${total}　□は？`;numeric(total-a);meta={op:'missing',a,total};hint=`${total}から${a}をひくと、あといくつか分かるよ。`;}
      else{const total=r(1,9)*10,a=r(1,total-1),b=total-a,c=r(11,89);text=`${a} ＋ ${c} ＋ ${b} ＝ ？`;numeric(total+c);meta={op:'sum3',a,b,c};hint=`${a}と${b}を先にまとめると${total}になるよ。`;}
    }else if(id==='mathCarry'){
      const u=r(2,9),v=r(10-u,9),a=stage===0?u:stage===1?r(1,7)*10+u:r(1,7)*100+r(1,8)*10+u,b=stage===0?v:stage===1?r(1,7)*10+v:r(1,7)*100+r(1,8)*10+v;
      text=`${a} ＋ ${b} ＝ ？`;numeric(a+b,stage===0?1:10);meta={op:'add',a,b};hint='一の位をたして10以上なら、十の位に1くり上げよう。';
    }else if(id==='mathBorrow'){
      const u=r(0,7),v=r(u+1,9),a=stage===0?10+u:stage===1?r(4,9)*10+u:r(4,9)*100+r(1,8)*10+u,b=stage===0?v:stage===1?r(1,3)*10+v:r(1,3)*100+r(1,8)*10+v;
      text=`${a} − ${b} ＝ ？`;numeric(a-b,stage===0?1:10);meta={op:'subtract',a,b};hint='一の位がひけないときは、十の位から1を借りて10にしよう。';
    }else if(id==='mathProduct'){
      const a=stage===0?r(2,9):r(12,49),b=stage<2?r(2,9):r(12,39);text=`${a} × ${b} ＝ ？`;numeric(a*b,b);meta={op:'multiply',a,b};hint=stage===0?'同じ数をいくつ分集めるか考えよう。':`${a}を十の位と一の位に分けてかけ、最後にたそう。`;
    }else if(id==='mathQuotient'){
      const b=stage===2?r(12,29):r(2,9),q=stage===2?r(11,29):r(2,9),remainder=stage===1?r(1,b-1):0,a=b*q+remainder;
      text=`${a} ÷ ${b} ＝ ？${stage===1?'（あまりも答えよう）':''}`;meta={op:'divide',a,b,remainder};hint=`${b} × 答え ＋ あまり が ${a} になるよ。あまりは${b}より小さくしよう。`;
      if(stage===1){answer=`${q} あまり ${remainder}`;choices=[answer,`${q-1} あまり ${remainder}`,`${q+1} あまり ${remainder}`,`${q} あまり ${(remainder+1)%b}`];}else numeric(q);
    }else if(id==='mathOrder'){
      const a=r(2,12),b=r(2,9),c=r(2,9);meta={op:'order',a,b,c,variant:stage};
      if(stage===0){text=`${a} ＋ ${b} × ${c} ＝ ？`;numeric(a+b*c);hint='たし算より、かけ算を先に計算しよう。';}
      else if(stage===1){text=`（${a} ＋ ${b}）× ${c} ＝ ？`;numeric((a+b)*c,c);hint='かっこの中を先に計算しよう。';}
      else{text=`（${a*c} ＋ ${b*c}）÷ ${c} ＝ ？`;numeric(a+b);hint='かっこの中をたしてから、わり算をしよう。';}
    }else if(id==='mathRational'){
      const d=r(3,10),n=r(1,d-1);
      if(stage===0){text='全体を1とすると、色のついた部分はどの分数？';answer=`${n}/${d}`;choices=[answer,`${n+1}/${d}`,`${n}/${d+1}`,`${n}/${d+2}`];visualHTML=diagram(n,d);meta={op:'fractionDiagram',n,d};hint=`全体を${d}等分したうち、色つきは${n}つだよ。`;}
      else if(stage===1){const b=d+r(1,5),reverse=r(0,1)===1;text=`${n}/${reverse?b:d} と ${n}/${reverse?d:b}。大きいのは？`;answer=`${n}/${d}`;choices=[answer,`${n}/${b}`,'同じ大きさ'];meta={op:'fractionCompare',n,d,b};hint='分子が同じなら、分ける数が少ない方が1つ分が大きいよ。';}
      else if(stage===2){const k=r(2,5);text=`${n}/${d} と同じ大きさの分数は？`;answer=`${n*k}/${d*k}`;choices=[answer,`${n*k+1}/${d*k}`,`${n*k-1}/${d*k}`,`${n*k+2}/${d*k}`];meta={op:'equivalent',n,d,k};hint='分子と分母の両方に同じ数をかけても、大きさは変わらないよ。';}
      else{const b=r(1,d-1),e=d*2;const total=n*2+b;answer=fraction(total,e);choices=[answer,fraction(total+1,e),fraction(total+2,e),fraction(total+3,e)];text=`${n}/${d} ＋ ${b}/${e} ＝ ？（約分した分数）`;meta={op:'fractionAdd',n,d,b,e};hint=`分母を${e}にそろえてから、分子をたそう。`;}
    }else if(id==='mathDecimal'){
      if(stage===0){const a=r(1,98),b=a+r(1,9),reverse=r(0,1)===1;text=`${decimal(reverse?b:a,10)} と ${decimal(reverse?a:b,10)}。大きいのは？`;answer=decimal(b,10);choices=[decimal(a,10),answer,'同じ大きさ'];meta={op:'decimalCompare',a,b,scale:10};hint='整数の部分から順に、同じ位の数字を比べよう。';}
      else if(stage===1){const a=r(20,99),b=r(1,19),subtract=r(0,1)===1;const value=subtract?a-b:a+b;text=`${decimal(a,10)} ${subtract?'−':'＋'} ${decimal(b,10)} ＝ ？`;numeric(value,1,x=>decimal(x,10));meta={op:subtract?'decimalSubtract':'decimalAdd',a,b,scale:10};hint='小数点の位置をそろえて、同じ位どうしで計算しよう。';}
      else{const a=r(11,89),b=r(2,9),divide=r(0,1)===1;text=divide?`${decimal(a*b,100)} ÷ ${b} ＝ ？`:`${decimal(a,100)} × ${b} ＝ ？`;numeric(divide?a:a*b,1,x=>decimal(x,100));meta={op:divide?'decimalDivide':'decimalMultiply',a:divide?a*b:a,b,scale:100};hint='100倍した整数で計算してから、答えを100でわろう。';}
    }else if(id==='mathPercent'){
      if(stage===0){const n=r(1,9);text='全体を100%とすると、色のついた部分は何%？';answer=`${n*10}%`;choices=[n,(n+1)%11,(n+2)%11,(n+3)%11].map(x=>`${x*10}%`);visualHTML=diagram(n,10);meta={op:'percentDiagram',n};hint='10等分した1つ分は10%だよ。';}
      else if(stage===1){const p=r(2,8)*10,q=p+(r(0,1)?10:-10);const a=`${p}%`,b=`${decimal(q,100)}倍`;text=`もとにする量が同じとき、${a} と ${b} ではどちらが大きい？`;answer=p>q?a:b;choices=[a,b,'同じ大きさ'];meta={op:'percentCompare',p,q};hint='百分率を100でわると、何倍かを表す小数になるよ。';}
      else{const price=r(2,20)*100,p=r(1,8)*10,discount=r(0,1)===1;const value=price*(discount?100-p:p)/100;text=discount?`${price}円の本を${p}%引きで買います。代金は何円？`:`${price}円の${p}%は何円？`;numeric(value,10,x=>`${x}円`);meta={op:'percentPractical',price,p,discount};hint=discount?`もとの値段の${100-p}%を払うよ。`:'もとの量 × 割合 ÷ 100 で計算しよう。';}
    }
    return {type:'mathExtended',skill:id,stage,text,answer,choices:shuffle(choices),hint,...(visualHTML?{visualHTML}:{}),meta};
  }
  const api={defs,make};
  if(typeof module==='object' && module.exports)module.exports=api;
  root.MathExpansion=api;
})(typeof globalThis==='object'?globalThis:this);
