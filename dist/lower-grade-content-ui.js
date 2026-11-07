/* Extend existing banks in place: no course, skill, stage or save-key changes. */
// More subjects for the same three spatial relations, without harder grammar.
LowerGradeContent.jp.sentence[1]=[['🐻','くま'],['🐸','かえる'],['🐼','ぱんだ']].flatMap(([animal,name])=>[['above','うえ'],['under','した'],['beside','よこ']].map(([position,word])=>[
 '「'+name+'が つくえの '+word+'に います」に あう えは？',positionPicture(position,animal),['above','under','beside'].filter(p=>p!==position).map(p=>positionPicture(p,animal)).join('|'),'つくえと どうぶつの ばしょを くらべよう。'
]));
for(const [id,stages] of Object.entries(LowerGradeContent.jp)){
 const def=Practice.defs.find(d=>d.id===id);
 for(const [stage,rows] of Object.entries(stages)){
  const bank=JP_BANK[def.courses[stage]-JP_START],keys=new Set(bank.map(r=>r[0]+'|'+r[1]));
  for(const row of rows)if(!keys.has(row[0]+'|'+row[1])){bank.push(row);keys.add(row[0]+'|'+row[1])}
 }
}
// Selection exhausts the available facts before repeating, even with a constant RNG.
// This history belongs to the current set only; it never supplies mastery evidence.
function lowerGradePick(key,bank){
 const seen=session?(session.lowerGradeSeen??={}):{};
 let used=seen[key]??=[],pool=bank.filter((_,i)=>!used.includes(i));
 if(!pool.length){used=[];pool=bank}
 const offset=Math.min(pool.length-1,Math.max(0,Math.floor(Math.random()*pool.length)));
 const item=pool[offset];used.push(bank.indexOf(item));seen[key]=used;return item;
}
const lowerGradePictureCourse=foundationById('letters').courses[0];
foundationMakers[lowerGradePictureCourse]=()=>{
 const pictures=LowerGradeContent.pictures,selected=lowerGradePick('pictures',pictures),answer=selected[0];
 const other=lowerGradePick('picture-options:'+answer,pictures.filter(p=>p[0]!==answer))[0];
 return {i:lowerGradePictureCourse,type:'jp',course:0,text:'おなじ えを えらんでね。',visual:answer,answer,choices:Math.random()<.5?[answer,other]:[other,answer],hint:'うえと おなじ えを さがそう。',variant:'match'};
};
// Preserve the tiny numeric ranges instead of claiming cosmetic variants as new facts.
foundationById('number').courses.forEach((course,stage)=>{
 const values=stage===0?[1,2,3]:stage===1?[1,2,3,4,5]:[6,7,8,9,10];
 foundationMakers[course]=()=>{
  const n=lowerGradePick('count:'+course,values);
  return {...foundationNumeric(n,{i:course,type:'count',a:n,text:'いくつ あるかな？',hint:'ひとつずつ さわって かぞえよう。',objects:n,variant:n===1?'one':'many'}),choices:stage===0?[1,2,3]:[n,...values.filter(v=>v!==n)].slice(0,4).sort(()=>Math.random()-.5)};
 };
});
// Still at most twelve objects and four groups: extend the repeated-group facts,
// without introducing written multiplication, carrying, or larger number ranges.
const lowerGradeGroupCourse=foundationById('multiply').courses[0],lowerGradeGroups=[];
for(const a of [2,3,4])for(const b of [1,2,3,4])if(a*b<=12)lowerGradeGroups.push([a,b]);
foundationMakers[lowerGradeGroupCourse]=()=>{
 const [a,b]=lowerGradePick('groups',lowerGradeGroups);
 return foundationNumeric(a*b,{i:lowerGradeGroupCourse,text:`${a}こずつ ${b}くみ。ぜんぶで いくつ？`,hint:`${Array(b).fill(a).join(' ＋ ')} を かんがえよう。`,meta:{op:'equalGroups',a,b},visualHTML:'<div style="display:flex;flex-wrap:wrap;gap:12px">'+Array(b).fill('<span>'+'🍎'.repeat(a)+'</span>').join('')+'</div>'});
};
// Ten-yen arithmetic stays in multiples of ten, with payment at most 100 yen.
const lowerGradeShopping=GardenQuestions.banks.lifeShopping[1];
for(let paid=20;paid<100;paid+=10)for(let price=10;price<paid;price+=10){
 const value=paid-price;
 lowerGradeShopping.push({type:'mathExtended',text:`${paid}円で ${price}円の パンを かいます。おつりは？`,answer:value+'円',choices:[value,...[10,-10,20,-20,30].map(d=>value+d).filter(v=>v>=0)].slice(0,4).map(v=>v+'円'),hint:'10円のまとまりで考えよう。',meta:{op:'change',paid,prices:[price]}});
}
// Tiny number ranges have a natural ceiling. Rotate the same facts fairly.
const lowerGradeAddCourse=foundationById('addition').courses[0],lowerGradeAdds=[[1,1],[1,2],[2,1]];
foundationMakers[lowerGradeAddCourse]=()=>{
 const [a,b]=lowerGradePick('add3',lowerGradeAdds);
 return foundationNumeric(a+b,{i:lowerGradeAddCourse,type:'add',a,b,arithmetic:{op:'add',a,b},text:a+' ＋ '+b+' ＝ ？',hint:a+'から あと'+b+'こ かぞえよう。',objects:a+b,variant:b===1?'one-more':'combine'});
};
const lowerGradeComplementCourse=foundationById('mathDecompose').courses[0];
foundationMakers[lowerGradeComplementCourse]=()=>{
 const a=lowerGradePick('complement5',[1,2,3,4]);
 return foundationNumeric(5-a,{i:lowerGradeComplementCourse,text:a+' に あと いくつで 5？',hint:a+'から 5まで かぞえよう。',variant:a<=2?'small-part':'large-part'});
};
