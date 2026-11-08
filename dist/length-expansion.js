/* Three additional representations within existing length stages. */
(function(root){
 'use strict';
 const banks=[[],[],[]];
 function ruler(start,end){
  const x=n=>28+n*30;
  return `<svg viewBox="0 0 340 115" width="340" height="115" style="display:block;max-width:100%;margin:auto" role="img" aria-label="1めもりが1センチの ものさし。ぼうの はじめは${start}、おわりは${end}の めもり。">`+
   `<rect x="18" y="55" width="300" height="50" rx="3" fill="#fff5d8" stroke="#586655"/>`+
   Array.from({length:10},(_,n)=>`<line x1="${x(n)}" y1="55" x2="${x(n)}" y2="73" stroke="#263b31"/><text x="${x(n)}" y="95" text-anchor="middle" font-size="15" fill="#263b31">${n}</text>`).join('')+
   `<line x1="${x(start)}" y1="30" x2="${x(end)}" y2="30" stroke="#277057" stroke-width="10"/>`+
   [start,end].map(n=>`<line x1="${x(n)}" y1="17" x2="${x(n)}" y2="55" stroke="#263b31" stroke-width="2" stroke-dasharray="3 2"/>`).join('')+'</svg>';
 }
 function add(stage,text,answer,choices,hint,meta,visualHTML=''){
  banks[stage].push({type:'mathExtended',expansionId:`length-v1-${stage}-${banks[stage].length+1}`,text,answer,choices,hint,meta,visualHTML});
 }
 function lengthOptions(n){return [n,...Array.from({length:9},(_,i)=>i+1).filter(x=>x!==n)].slice(0,3).map(x=>x+'cm');}
 for(let end=1;end<=9;end++)add(0,'1めもりは 1cm。ぼうの ながさは なんcm？',end+'cm',lengthOptions(end),'0から ぼうの おわりまでの めもりを よもう。',{op:'rulerFromZero',start:0,end,unit:'cm',tickValue:1},ruler(0,end));
 for(let start=1;start<=8;start++)for(let end=start+1;end<=9;end++){
  const n=end-start,values=[n,end,start,end+start,...Array.from({length:9},(_,i)=>i+1)];
  const choices=[...new Set(values.filter(x=>x>=1&&x<=9))].slice(0,3).map(x=>x+'cm');
  add(1,'1めもりは 1cm。0より みぎから はじまる ぼうの ながさは？',n+'cm',choices,'はじめの めもりから おわりまでの あいだを かぞえよう。おわりの かずだけでは ながさに ならないよ。',{op:'rulerOffset',start,end,unit:'cm',tickValue:1},ruler(start,end));
 }
 for(let m=1;m<=9;m++)for(let cm=5;cm<=95;cm+=5){
  const value=m*100+cm,format=(a,b)=>`${a}m ${b}cm`;
  add(2,`${value}cmは、なんm なんcm？`,format(m,cm),[format(m,cm),format(m-1,cm),format(m,cm===95?90:cm+5)],'100cmで 1m。100cmの まとまりと、のこりに わけよう。',{op:'lengthReverseUnits',value,m,cm});
 }
 function install(garden){
  banks.forEach((items,stage)=>{const target=garden.banks.lifeLength[stage];for(const item of items)if(!target.some(q=>q.expansionId===item.expansionId))target.push({...item,choices:item.choices.slice()});});
 }
 const api={version:1,banks,ruler,install};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 if(root.LengthExpansion)return;root.LengthExpansion=api;install(GardenQuestions);
})(typeof globalThis==='object'?globalThis:this);
