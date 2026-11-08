/* Same-picture targets and reverse spatial questions. No new course or save keys. */
(function(root){
 'use strict';
 const pictures=[['🍇','ぶどう'],['🍊','みかん'],['🍍','ぱいなっぷる'],['🍒','さくらんぼ'],['🌽','とうもろこし'],['🍄','きのこ'],['🚲','じてんしゃ'],['🚂','きかんしゃ'],['✈️','ひこうき'],['🚢','ふね'],['🎩','ぼうし'],['👟','くつ'],['🧸','ぬいぐるみ'],['🎁','ぷれぜんと']];
 const animals=[['🐱','ねこ'],['🐶','いぬ'],['🐰','うさぎ'],['🐻','くま'],['🐸','かえる'],['🐼','ぱんだ']];
 const relations=[['above','うえ'],['under','した'],['beside','よこ']];
 const items=animals.flatMap(([animal,name],a)=>relations.map(([position,word],p)=>({
  id:`picture-position-v1-${a+1}-${p+1}`,animal,name,position,
  row:[`えを みてね。${name}は つくえの どこに いますか？`,word,relations.filter(([key])=>key!==position).map(([,label])=>label).join('|'),'つくえと どうぶつの ばしょを くらべよう。']
 })));
 const api={version:1,pictures,items};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 // Loading twice must neither duplicate rows nor stack generator adapters.
 if(root.PicturePositionExpansion)return;
 root.PicturePositionExpansion=api;
 for(const picture of pictures)if(!LowerGradeContent.pictures.some(p=>p[0]===picture[0]))LowerGradeContent.pictures.push(picture.slice());
 const course=Practice.defs.find(d=>d.id==='sentence').courses[1];
 const bank=JP_BANK[course-JP_START],byKey=new Map(items.map(item=>[item.row[0]+'|'+item.row[1],item]));
 for(const item of items)if(!bank.some(row=>row[0]===item.row[0]&&row[1]===item.row[1]))bank.push(item.row.slice());
 const make=makeQuestion;
 makeQuestion=function(i){
  const q=make(i),item=q.i===course?byKey.get(q.text+'|'+q.answer):null;
  if(item){
   q.visualHTML='<div class="spatial-question" style="display:flex;justify-content:center">'+positionPicture(item.position,item.animal)+'</div>';
   q.expansionId=item.id;
   q.spatialMeta={position:item.position,animal:item.animal,direction:'picture-to-word'};
  }
  return q;
 };
})(typeof globalThis==='object'?globalThis:this);
