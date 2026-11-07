/* Explicit parent placement is separate from observed mastery and absolute caps. */
(function(){
 const P=Practice,R=PracticePresets,subjects=['math','jp','en'];
 const names={all:'算数・国語・英語すべて',math:'算数',jp:'国語',en:'英語'};
 const grades=['年少','年中','年長','小学1年','小学2年','小学3年','小学4年','小学5年','小学6年','中学1〜3年'];
 const table=R.build(P),presets=new Map(R.presets.map(x=>[x.id,x])),highest=Object.fromEntries(Object.entries(table).map(([id,rows])=>[id,Math.max(...rows.map(row=>row.high))]));
 function preset(p,subject){return presets.get(p.practice?.lowerPresets?.[subject])}
 P.hasLower=(p,subject)=>!!preset(p,subject);
 function rank(p,subject){return preset(p,subject)?.rank??0}
 // A parent can place the learner beyond earlier content, without awarding mastery.
 P.placementReady=(p,d)=>!!preset(p,d.subject)&&highest[d.id]>=0&&highest[d.id]<rank(p,d.subject);
 function bounds(p,subject,defs=P.baseAvailable(p,subject)){
  const requested=rank(p,subject);
  const highest=Math.max(0,...defs.flatMap(d=>(table[d.id]||[]).slice(0,P.ceiling(p,d)+1).map(row=>row.low)));
  return {requested,effective:Math.min(requested,highest)};
 }
 P.lowerAllowed=(p,d)=>!preset(p,d.subject)||(table[d.id]||[]).some(row=>row.index<=P.ceiling(p,d)&&row.low>=bounds(p,d.subject).effective);
 P.filterAvailable=(p,subject,defs)=>{
  if(!preset(p,subject))return defs;
  const {effective}=bounds(p,subject,defs);
  const first=d=>(table[d.id]||[]).find(row=>row.index<=P.ceiling(p,d)&&row.low>=effective);
  return defs.filter(d=>first(d)).sort((a,b)=>first(a).low-first(b).low);
 };
 P.minimum=(p,d,defs)=>{
  if(!preset(p,d.subject))return 0;
  const {effective}=bounds(p,d.subject,defs),cap=P.ceiling(p,d);
  const first=(table[d.id]||[]).find(row=>row.index<=cap&&row.low>=effective);
  return first?.index??0;
 };
 function selected(p,scope='all'){
  const kinds=scope==='all'?subjects:subjects.includes(scope)?[scope]:[];
  if(!kinds.length)return 'custom';
  const ids=kinds.map(kind=>preset(p,kind)?.id||'none');
  return ids.every(id=>id===ids[0])?ids[0]:'custom';
 }
 function apply(p,id,scope='all'){
  const kinds=scope==='all'?subjects:subjects.includes(scope)?[scope]:[],choice=R.presets.find(x=>x.id===id);
  if(!kinds.length||id!=='none'&&!choice)return false;
  const a=P.state(p);
  for(const kind of kinds){
   if(id==='none')delete a.lowerPresets[kind];
   else{
    a.lowerPresets[kind]=id;
    // The old starting range was only a ceiling. Widen it enough for placement,
    // but never widen the independent absolute caps or permission switches.
    for(const d of P.defs.filter(d=>d.subject===kind)){
     const current=a.rangeLimits[d.id];
     if(Number.isInteger(current))a.rangeLimits[d.id]=Math.max(current,choice.limits[d.id]??(d.prerequisite?-1:0));
    }
   }
   const available=P.available(p,kind);
   for(const d of available){
    const s=P.skill(p,d),minimum=P.floor(p,d,available);
    if(s.level<minimum){s.level=minimum;s.misses=0;s.support=0}
   }
  }
  if(a.rangePreset)a.rangeCustomized=true;
  a.configured=true;return true;
 }
 function description(p,subject){
  const choice=preset(p,subject);if(!choice)return names[subject]+'：下限なし';
  const b=bounds(p,subject);
  return names[subject]+'：'+grades[b.requested]+'相当から'+(b.effective<b.requested?'。上限・許可・前提条件・実装範囲により、現在は'+grades[b.effective]+'相当から出題します。':'');
 }
 const label=id=>id==='none'?'下限なし（自動調整）':R.presets.find(x=>x.id===id)?.label.split('・')[0]+'から';
 function markup(){
  const id=selected(person());
  return `<section class="practice-bulk-limit" aria-labelledby="practiceLowerTitle"><h3 id="practiceLowerTitle">難易度の下限を一括設定</h3><p>簡単すぎる問題を省き、指定した学年帯の最初の段階から練習します。</p><label class="preset-label" for="practiceLowerScope">変更する教科</label><select id="practiceLowerScope" onchange="refreshPracticeLowerSelection()">${Object.entries(names).map(([key,name])=>`<option value="${key}">${name}</option>`).join('')}</select><label class="preset-label" for="practiceLowerPreset">この難しさから始める</label><select id="practiceLowerPreset" aria-describedby="practiceLowerHelp" onchange="refreshPracticeLowerButton()"><option value="custom" ${id==='custom'?'selected':''}>教科ごとの設定（変更しない）</option><option value="none" ${id==='none'?'selected':''}>下限なし（自動調整）</option>${R.presets.map(x=>`<option value="${x.id}" ${id===x.id?'selected':''}>${esc(label(x.id))}</option>`).join('')}</select><p id="practiceLowerHelp" class="muted">保護者が開始位置を指定します。それより前の前提練習は省きますが、習得済みにはしません。復習・つまずき時も有効な下限より下へは戻りません。上限と漢字・くり上がりの許可を優先します。指定範囲の問題がない場合は、出題可能な最も高い学年帯を使い、下に表示します。学年帯が広い教材は、最も低い学年を基準に下限を判定します。</p><button id="practiceLowerApply" class="primary" ${id==='custom'?'disabled':''} onclick="applyPracticeLowerLimit()">下限をまとめて適用</button><div id="practiceLowerCurrent">${subjects.map(kind=>'<p>'+esc(description(person(),kind))+'</p>').join('')}</div><p id="practiceLowerStatus" role="status"></p></section>`;
 }
 window.PracticeLowerLimits={apply,selected,bounds,description};
 window.refreshPracticeLowerButton=function(){const control=document.querySelector('#practiceLowerPreset'),button=document.querySelector('#practiceLowerApply');if(control&&button)button.disabled=control.value==='custom'};
 window.refreshPracticeLowerSelection=function(scope){
  const scopeControl=document.querySelector('#practiceLowerScope'),control=document.querySelector('#practiceLowerPreset');if(!scopeControl||!control)return;
  if(scope)scopeControl.value=scope;control.value=selected(person(),scopeControl.value);
  const current=document.querySelector('#practiceLowerCurrent');if(current)current.innerHTML=subjects.map(kind=>'<p>'+esc(description(person(),kind))+'</p>').join('');
  const status=document.querySelector('#practiceLowerStatus');if(status)status.textContent='';refreshPracticeLowerButton();
 };
 window.applyPracticeLowerLimit=function(){
  if(view!=='parent')return;
  const scope=document.querySelector('#practiceLowerScope')?.value,id=document.querySelector('#practiceLowerPreset')?.value;
  if(!apply(person(),id,scope))return;
  curriculumRequestedFocus=null;practiceItem=null;practiceContinuation=null;save();parents();refreshPracticeLowerSelection(scope);
  const status=document.querySelector('#practiceLowerStatus');if(status)status.textContent=person().name+'さんの'+names[scope]+'の下限を保存しました。過去の回答・コイン・育成データはそのままです。';
 };
 const settings=practiceSettings;
 practiceSettings=function(){return settings().replace('<h3>開始範囲の設定</h3>',markup()+'<h3>開始範囲の設定（出題範囲の上端）</h3>').replace('何学年相当の範囲から始める？','開始時にどこまでの範囲を練習する？').replace('目安を選ぶと開始範囲をまとめて変更します。','この設定だけでは開始位置は上がりません。開始位置は上の下限で指定してください。目安を選ぶと開始範囲をまとめて変更します。')};
 const limit=setPracticeLimit,permission=setPracticePermission;
 setPracticeLimit=function(id,value){limit(id,value);if(view==='parent')refreshPracticeLowerSelection()};
 setPracticePermission=function(key,value){permission(key,value);if(view==='parent')refreshPracticeLowerSelection()};
})();
