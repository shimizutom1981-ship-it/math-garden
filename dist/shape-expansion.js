/* Append-only elementary geometry. No persisted state is changed on load. */
(function(root){
 'use strict';
 const banks={shapeFamily:[],shapeEdges:[],circleParts:[]};
 const defs=[{id:'shapeFamily',title:'かたちの なかま',grade:1,prerequisite:'number'},{id:'shapeEdges',title:'へんと ちょうてん',grade:2,prerequisite:'shapeFamily'},{id:'circleParts',title:'えんの ぶぶん',grade:3,prerequisite:'shapeEdges'}];
 const svg=(body,label)=>`<svg viewBox="0 0 160 150" width="150" height="140" style="max-width:100%;display:block;margin:auto" role="img" aria-label="${label}">${body}</svg>`;
 const points={triangle:[[30,115],[125,105],[65,25]],quadrilateral:[[30,35],[120,35],[120,110],[30,110]]};
 const polygon=(vertices)=>`<polygon points="${vertices.map(p=>p.join(',')).join(' ')}" fill="#e5f1e9" stroke="#285b45" stroke-width="4" stroke-linejoin="round"/>`;
 function shape(kind,rotation=0,scale=1){
  const body=kind==='circle'?'<circle cx="80" cy="75" r="43" fill="#e5f1e9" stroke="#285b45" stroke-width="4"/>':polygon(points[kind]);
  return svg(`<g transform="translate(80 75) rotate(${rotation}) scale(${scale}) translate(-80 -75)">${body}</g>`,'かたちの ず');
 }
 const labels=['あ','い','う'],kinds=['circle','triangle','quadrilateral'];
 function add(skill,q){q.id=`shape-v1-${skill}-${banks[skill].length+1}`;q.type='mathExtended';banks[skill].push(q)}
 for(let k=0;k<3;k++)for(let v=0;v<4;v++){
  const target=kinds[k],correct=(k+v)%3,others=kinds.filter(x=>x!==target),options=labels.map((label,i)=>({label,kind:i===correct?target:others.shift(),rotation:v*45,scale:.8+v*.05}));
  add('shapeFamily',{text:'おてほんと おなじ かたちの なかまは、どれ？',answer:labels[correct],choices:labels.slice(),hint:'いろや おおきさ、むきが かわっても、かたちを みよう。',meta:{target,options,rotation:v*30},visualHTML:'<div style="text-align:center">おてほん'+shape(target,v*30,.9)+'</div><div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">'+options.map(o=>'<div style="width:150px;text-align:center">'+o.label+shape(o.kind,o.rotation,o.scale)+'</div>').join('')+'</div>'});
 }
 const polygons=[[[35,110],[125,110],[80,25]],[[30,40],[130,75],[35,115]],[[25,40],[120,40],[120,115]],[[35,35],[120,35],[120,115],[35,115]],[[80,20],[135,75],[80,130],[25,75]],[[25,110],[45,35],[120,35],[135,110]]];
 polygons.forEach((vertices,index)=>{for(const part of ['edge','vertex']){
  const count=vertices.length,marks=part==='vertex'?vertices.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#173d2b"/>`).join(''):'';
  add('shapeEdges',{text:part==='edge'?'この ずけいの へん（まっすぐな せん）は、いくつ？':'この ずけいの ちょうてん（かど）は、いくつ？',answer:String(count),choices:['3','4','5'],hint:part==='edge'?'かどから つぎの かどまでを 1つの へんとして かぞえよう。':'へんと へんが あつまる かどを、ひとつずつ かぞえよう。',meta:{part,vertices,index},visualHTML:svg(polygon(vertices)+marks,'へんと かどを かぞえる ずけい')});
 }});
 const names={center:'ちゅうしん',radius:'はんけい',diameter:'ちょっけい'};
 function circleDiagram(part,angle){
  const cx=80,cy=75,r=48,x=cx+r*Math.cos(angle),y=cy+r*Math.sin(angle),ox=cx-r*Math.cos(angle),oy=cy-r*Math.sin(angle);
  let body='<circle cx="80" cy="75" r="48" fill="#fff" stroke="#53665b" stroke-width="3"/>';
  if(part==='center')body+='<circle cx="80" cy="75" r="9" fill="#277057" stroke="#143b29" stroke-width="3"/>';
  else body+=`<line x1="${part==='radius'?cx:ox}" y1="${part==='radius'?cy:oy}" x2="${x}" y2="${y}" stroke="#277057" stroke-width="7"/><circle cx="80" cy="75" r="4" fill="#172f21"/>`;
  return {html:svg(body,part==='center'?'えんの まんなかに しるしが あります。':part==='radius'?'えんの まんなかから、まわりまで ふとい せんが あります。':'えんの まんなかを とおり、まわりから まわりまで ふとい せんが あります。'),cx,cy,r,x,y,ox,oy};
 }
 for(const part of ['center','radius','diameter'])for(let v=0;v<(part==='center'?1:4);v++){
  const a=v*Math.PI/4,diagram=circleDiagram(part,a);
  add('circleParts',{text:part==='center'?'えんの、しるしを つけた てんの なまえは？':'えんの、ふとい せんの なまえは？',answer:names[part],choices:Object.values(names),hint:part==='center'?'えんの まわりの どこからも、ながさが おなじになる まんなかの てんだよ。':part==='radius'?'まんなかの てんから、えんの まわりまでの せんだよ。':'まんなかの てんを とおって、えんの まわりから まわりまで むすんでいるよ。',meta:{part,angle:a,...Object.fromEntries(Object.entries(diagram).filter(([key])=>key!=='html'))},visualHTML:diagram.html});
 }
 function pick(skill,seen=[],rng=Math.random){const bank=banks[skill];if(!bank)throw new RangeError('Unknown shape skill');let pool=bank.filter(q=>!seen.includes(q.id));if(!pool.length){seen.length=0;pool=bank}const q=pool[Math.max(0,Math.min(pool.length-1,Math.floor(rng()*pool.length)))];seen.push(q.id);const choices=q.choices.slice();for(let i=choices.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(rng()*(i+1))));[choices[i],choices[j]]=[choices[j],choices[i]]}return {...q,choices,skill,stage:0};}
 const api={version:1,defs,banks,pick,shape,circleDiagram};
 if(typeof module==='object'&&module.exports){module.exports=api;return;}
 if(root.ShapeExpansion)return;root.ShapeExpansion=api;
 for(const d of defs){const i=TOPICS.length;TOPICS.push(['🔷',d.title,'かたちを みて かんがえよう','math']);curriculumMathCourses[i]={id:d.id,stage:0};curriculumCourseMeta[i]={title:d.title,stage:0,subject:'math'};Practice.defs.push({id:d.id,subject:'math',courses:[i],prerequisite:d.prerequisite,defaultLimit:-1,defaultRange:-1});curriculumTitles[d.id]=d.title;practiceTestNames[d.id]=d.title;}
 const previousMake=makeCurriculumMath;
 makeCurriculumMath=function(i){const m=curriculumMathCourses[i];if(!m||!banks[m.id])return previousMake(i);const state=session?(session.shapeSeen??={}):{};return {...pick(m.id,state[m.id]??=[]),i};};
})(typeof globalThis==='object'?globalThis:this);
