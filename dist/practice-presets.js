/* Content-range presets, not age inference or a diagnosis. Unknown skills stay off. */
(function(root){
 const presets=[
  {id:'preschool-younger',label:'年少相当・はじめの一歩',description:'3までの数、同じ絵を選ぶ、英語の最初の絵ことば。',kanji:false,carry:false,limits:{number:0,letters:0,enWords:0}},
  {id:'preschool-middle',label:'年中相当・数とひらがな',description:'10までの数、5までのたし算、絵とひらがな。',kanji:false,carry:false,limits:{number:2,compare:0,addition:1,letters:1,enWords:1}},
  {id:'preschool-older',label:'年長相当・計算の準備',description:'くり上がりのない計算、5・10をつくる、ひらがなとことば。漢字は出しません。',kanji:false,carry:false,limits:{number:2,compare:0,addition:3,subtraction:1,mathDecompose:1,letters:2,words:1,katakana:0,sentence:0,enWords:3}},
  {id:'elementary-one',label:'小学1年相当・基礎の一部',description:'1けた同士のくり上がり・くり下がり、身近な漢字、かなの文と短いお話。',kanji:true,carry:true,limits:{number:2,compare:0,addition:3,subtraction:1,mathDecompose:1,mathCarry:1,mathBorrow:0,lifeShopping:0,lifeClock:1,lifeLength:1,letters:2,words:1,katakana:0,kanji:0,sentence:2,reading:3,enWords:7}},
  {id:'elementary-two',label:'小学2年相当・基礎の一部',description:'2けたのたし算・ひき算、同じ数のまとまりから九九へ、時計と長さ、短いお話。',kanji:true,carry:true,limits:{number:2,compare:0,addition:3,subtraction:1,mathDecompose:1,mathCarry:3,mathBorrow:2,mathHundreds:1,multiply:2,lifeShopping:2,lifeClock:2,lifeLength:2,letters:2,words:1,katakana:0,kanji:0,sentence:2,reading:3,readingKanji:3,enWords:11}}
 ];
 presets.forEach((p,i)=>p.rank=i);
 const mathGrades={mental:[2,2,2,2,2],divide:[3],fraction:[3],mathCarry:[1,1,2,3],mathBorrow:[1,2,3],multiply:[2,2,2],mathProduct:[2,3,3],mathQuotient:[3,3,4],mathOrder:[4,4,4],mathRational:[3,4,5,5],mathDecimal:[3,3,4],mathPercent:[5,5,5],mathHundreds:[2,2],lifeClock:[1,1,2],lifeLength:[2,2,3],lifeShopping:[1,2,2]};
 const japaneseBands={jp_kanjiContext:[3,6],jp_vocabularyContext:[3,6],jp_structure:[3,6],jp_readingAdvanced:[3,6],jp_wordRelations:[3,6],jp_proverbs:[3,6],jp_idioms:[3,6],jp_fourCharacters:[3,6],jp_radicalDictionary:[3,6],jp_polite:[3,6],jp_punctuation:[1,2],jp_passageEvidence:[3,6]};
 const englishPrimary=['enDescribe','enSentence','enReply','enListening','enListeningReading','enSpelling','enSpellingReading','enSocialDialog','enInformationDialog','enConversationDepth','enConversationDepthReading'];
 let catalog=null;
 function build(P){
  if(catalog)return catalog;
  catalog={};
  for(const d of P.defs)catalog[d.id]=d.courses.map((course,index)=>{
   let rank=presets.findIndex(x=>(x.limits[d.id]??-1)>=index),low=rank,high=rank,basis='独自の開始目安（学力判定ではない）';
   if(mathGrades[d.id]){low=high=rank=mathGrades[d.id][index]+2;basis='算数の学習指導要領の内容区分を参照した対応'}
   else if(d.id==='jp_gradeKanji'){low=high=rank=index+3;basis='既存の学年別漢字教材（各学年の一部）・学年別配当表を参照'}
   else if(japaneseBands[d.id]){low=japaneseBands[d.id][0]+2;high=rank=japaneseBands[d.id][1]+2;basis='国語の学年帯を参照した独自の広い目安。個別問題の学年認定ではない'}
   else if(d.id.startsWith('junior_')){low=high=rank=9;basis='中学校外国語の内容範囲。学年内の順序は教科書で異なるため未細分化'}
   else if(d.id.startsWith('vocab_')){low=7;high=rank=9;basis='単語ごとの公的な配当学年は設けず、小学校高学年〜中学の補助語彙という独自目安'}
   else if(englishPrimary.includes(d.id)){low=5;high=rank=8;basis='小学校外国語活動・外国語の範囲を参照した独自の補助練習。学年網羅ではない'}
   const names=['年少','年中','年長','小学1年','小学2年','小学3年','小学4年','小学5年','小学6年','中学1〜3年'];
   const label=rank<0?'学年の目安未設定':d.id==='enWords'?'英語入門（独自目安）':names[low]+(low===high?'':'〜'+names[high])+'相当';
   return {course,index,rank,low,high,label,basis};
  });
  for(let grade=3;grade<=6;grade++)presets.push({id:'elementary-'+grade,label:'小学'+grade+'年相当・実装済みの一部',description:'この学年までの目安に対応する、実装済みの算数・国語・英語の一部。前提の習得は別に確認します。',rank:grade+2,kanji:true,carry:true,limits:{}});
  presets.push({id:'junior-range',label:'中学範囲・英語の一部',description:'実装済みの中学英語を含む範囲。中学の算数・数学や国語を新しく追加する設定ではありません。',rank:9,kanji:true,carry:true,limits:{}});
  // One table drives both bulk limits and displayed ranges. No separate grade cursor exists.
  for(const preset of presets){preset.limits={};for(const d of P.defs){let cap=-1;for(const row of catalog[d.id]){if(row.rank<0||row.rank>preset.rank)break;cap=row.index}if(cap>=0)preset.limits[d.id]=cap}}
  return catalog;
 }
 function matches(p,preset,P){build(P);const a=P.state(p);return !a.rangeCustomized&&a.settings.kanji===preset.kanji&&a.settings.carry===preset.carry&&P.defs.every(d=>a.initialRanges?.[d.id]===Math.min(d.courses.length-1,preset.limits[d.id]??(d.prerequisite?-1:0)))}
 function apply(p,id,P){
  build(P);const preset=presets.find(x=>x.id===id);if(!preset)return false;
  const a=P.state(p);a.configured=true;
  // Set limits without manufacturing attempts, correct answers or mastery.
  for(const d of P.defs)P.setRange(p,d.id,preset.limits[d.id]??(d.prerequisite?-1:0));
  a.initialRanges={...a.rangeLimits};a.autoAdvance=true;a.rangeProgress={};a.rangeCustomized=false;
  a.settings.kanji=preset.kanji;a.settings.carry=preset.carry;a.rangePreset=id;return true;
 }
 function selected(p,P){build(P);const id=P.state(p).rangePreset,preset=presets.find(x=>x.id===id);return preset&&matches(p,preset,P)?id:'custom'}
 // Absolute caps are independent of the starting range and permission switches.
 // Reuse the same content map, while keeping the existing per-skill controls.
 const limitScopes=['all','math','jp','en'];
 function limitDefs(P,scope){return limitScopes.includes(scope)?P.defs.filter(d=>scope==='all'||d.subject===scope):[]}
 function presetLimit(preset,d){return preset.limits[d.id]??(d.prerequisite?-1:0)}
 function applyLimit(p,id,P,scope='all'){
  build(P);const preset=presets.find(x=>x.id===id),defs=limitDefs(P,scope);
  if(!defs.length||id!=='unlimited'&&!preset)return false;
  for(const d of defs)P.setLimit(p,d.id,id==='unlimited'?d.courses.length-1:presetLimit(preset,d));
  return true;
 }
 function selectedLimit(p,P,scope='all'){
  build(P);const defs=limitDefs(P,scope);if(!defs.length)return 'custom';
  if(defs.every(d=>P.absoluteLimit(p,d)===d.courses.length-1))return 'unlimited';
  return presets.find(preset=>defs.every(d=>P.absoluteLimit(p,d)===presetLimit(preset,d)))?.id||'custom';
 }
 function stableStage(p,d,index,P){
  const stage=P.skill(p,d).stages[index],recent=stage?.recent||[],correct=recent.filter(x=>x.ok);
  return !!stage?.mastered&&recent.length===10&&recent.slice(0,5).filter(x=>x.ok).length>=4&&recent.slice(5).filter(x=>x.ok).length>=4&&new Set(correct.map(x=>x.example)).size>=Math.min(4,d.exampleCount||4)&&new Set(correct.map(x=>x.variant)).size>=(d.variantCount||1)&&new Set(correct.map(x=>x.session)).size>=2;
 }
 function advancement(p,d,P){
  const a=P.state(p),rows=build(P)[d.id],cap=P.limit(p,d);
  if(!a.autoAdvance||!rows||cap<0||!P.allowed(p,d)||!Array.from({length:cap-P.floor(p,d)+1},(_,i)=>i+P.floor(p,d)).every(i=>stableStage(p,d,i,P)))return {ready:false};
  const rank=rows[cap].rank,next=rows.findIndex(r=>r.rank===rank+1);
  if(next<0)return {ready:true,reason:'この分野の次の学年帯は未実装です。現在の範囲を復習できます。'};
  let nextCap=next;while(rows[nextCap+1]?.rank===rank+1)nextCap++;
  if(nextCap>P.absoluteLimit(p,d))return {ready:true,reason:'保護者の絶対上限までクリア。次へ進むには上限の変更が必要です。'};
  return {ready:true,nextCap,from:rows[cap].label,to:rows[nextCap].label};
 }
 function advance(p,d,P){
  const result=advancement(p,d,P);if(!result.ready)return false;
  const a=P.state(p);a.rangeProgress??={};
  if(result.nextCap===undefined){a.rangeProgress[d.id]={status:'cleared',reason:result.reason};return false}
  a.rangeLimits[d.id]=result.nextCap;P.skill(p,d).level=Math.min(P.skill(p,d).level+1,P.ceiling(p,d));
  a.rangeProgress[d.id]={status:'advanced',from:result.from,to:result.to};return true;
 }
 function range(p,subject,P){
  const a=P.state(p),recent=Array.isArray(a.recentItems[subject])?a.recentItems[subject]:[];
  let defs=[...new Set(recent.map(x=>x.skill))].map(id=>P.defs.find(d=>d.id===id&&d.subject===subject)).filter(d=>d&&P.available(p,subject).includes(d));
  if(!defs.length)defs=[P.focus(p,subject)];
  const stages=defs.map(d=>({id:d.id,index:Math.max(P.floor(p,d),Math.min(P.skill(p,d).level,P.ceiling(p,d))),atLimit:P.skill(p,d).level>=P.limit(p,d)}));
  const table=build(P),rows=stages.map(s=>table[s.id]?.[s.index]),unknown=rows.some(x=>!x||x.rank<0);
  const labels=['年少','年中','年長','小学1年','小学2年','小学3年','小学4年','小学5年','小学6年','中学1〜3年'];
  const lo=unknown?0:Math.min(...rows.map(x=>x.low)),hi=unknown?0:Math.max(...rows.map(x=>x.high));
  let label=unknown?'学年の目安を設けていない問題':subject==='en'&&stages.every(s=>s.id==='enWords')?'英語入門の問題':labels[lo]+(lo===hi?'':'〜'+labels[hi])+'相当の問題';
  return {label,stages,atLimit:stages.some(x=>x.atLimit),support:defs.filter(d=>P.skill(p,d).support).map(d=>d.id)};
 }
 const api={presets,apply,selected,matches,range,build,advancement,advance,stableStage,applyLimit,selectedLimit};
 if(typeof module==='object')module.exports=api;else root.PracticePresets=api;
})(typeof globalThis==='object'?globalThis:this);

if(typeof document!=='undefined'){
 PracticePresets.build(Practice);
 Practice.onMastered=(p,d)=>PracticePresets.advance(p,d,Practice);
 const detailedPracticeSettings=practiceSettings;
 const practiceLimitNames={all:'算数・国語・英語すべて',math:'算数',jp:'国語',en:'英語'};
 function practiceLimitLabel(id){if(id==='unlimited')return '全段階（上限なし）';const preset=PracticePresets.presets.find(x=>x.id===id);return preset?preset.label.split('・')[0]+'まで':'個別設定（分野ごとに異なります）'}
 function practiceBulkLimitMarkup(){
  const selected=PracticePresets.selectedLimit(person(),Practice);
  return `<section class="practice-bulk-limit" aria-labelledby="practiceBulkLimitTitle"><h3 id="practiceBulkLimitTitle">難易度の上限を一括設定</h3><p>自動で進級しても、この上限を超える問題は出しません。</p><label class="preset-label" for="practiceLimitScope">変更する教科</label><select id="practiceLimitScope" onchange="refreshPracticeLimitSelection()">${Object.entries(practiceLimitNames).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select><label class="preset-label" for="practiceBulkLimit">ここまでの難しさにする</label><select id="practiceBulkLimit" aria-describedby="practiceBulkLimitHelp" onchange="refreshPracticeLimitButton()"><option value="custom" ${selected==='custom'?'selected':''}>個別設定（変更しない）</option>${PracticePresets.presets.map(x=>`<option value="${x.id}" ${selected===x.id?'selected':''}>${esc(practiceLimitLabel(x.id))}</option>`).join('')}<option value="unlimited" ${selected==='unlimited'?'selected':''}>全段階（上限なし）</option></select><p id="practiceBulkLimitCurrent">現在の上限：${esc(practiceLimitLabel(selected))}</p><p id="practiceBulkLimitHelp" class="muted">「上限をまとめて適用」を押すと、選んだ教科の分野別上限を置き換えます。開始範囲・漢字とくり上がりの許可・過去の回答・コインは変わりません。上限を下げると難易度の推定も上限内に戻します。学年は実装済み内容の目安です。上限を上げても開始範囲は広がらず、習得前の問題へ飛ばしません。あとから分野ごとに調整できます。</p><button id="practiceBulkLimitApply" class="primary" ${selected==='custom'?'disabled':''} onclick="applyPracticeBulkLimit()">上限をまとめて適用</button><p id="practiceBulkLimitStatus" role="status"></p></section>`;
 }
 function refreshPracticeLimitButton(){const control=document.querySelector('#practiceBulkLimit'),button=document.querySelector('#practiceBulkLimitApply');if(control&&button)button.disabled=control.value==='custom'}
 function refreshPracticeLimitSelection(scope){
  const scopeControl=document.querySelector('#practiceLimitScope');if(!scopeControl)return;
  if(scope)scopeControl.value=scope;
  const selected=PracticePresets.selectedLimit(person(),Practice,scopeControl.value);
  const control=document.querySelector('#practiceBulkLimit');if(control)control.value=selected;
  const summary=document.querySelector('#practiceBulkLimitCurrent');if(summary)summary.textContent='現在の上限：'+practiceLimitLabel(selected);
  const status=document.querySelector('#practiceBulkLimitStatus');if(status)status.textContent='';
  refreshPracticeLimitButton();
 }
 function applyPracticeBulkLimit(){
  if(view!=='parent')return;
  const scope=document.querySelector('#practiceLimitScope')?.value,id=document.querySelector('#practiceBulkLimit')?.value;
  if(!PracticePresets.applyLimit(person(),id,Practice,scope))return;
  curriculumRequestedFocus=null;practiceItem=null;practiceContinuation=null;save();parents();refreshPracticeLimitSelection(scope);
  const status=document.querySelector('#practiceBulkLimitStatus');if(status)status.textContent=person().name+'さんの'+practiceLimitNames[scope]+'の上限を「'+practiceLimitLabel(id)+'」で保存しました。';
 }
 function practiceProgressMarkup(){
  const a=Practice.state(person());
  return Object.entries(a.rangeProgress||{}).map(([id,status])=>{const d=Practice.defs.find(x=>x.id===id);if(!d)return '';const title=curriculumTitles[id]||practiceTestNames[id]||id;
   if(status.status==='cleared'){const current=PracticePresets.advancement(person(),d,Practice);return current.ready&&current.nextCap===undefined?'<p><strong>'+esc(title)+'：範囲クリア</strong><br>'+esc(current.reason)+'</p>':''}
   return '<p>'+esc(title)+'：前回 '+esc(status.from)+' → '+esc(status.to)+'へ進級</p>';
  }).join('');
 }
 function practiceRangeMarkup(){return '<section class="practice-range"><h3>いまの練習の目安</h3>'+['math','jp','en'].map(subject=>{const r=PracticePresets.range(person(),subject,Practice);return '<p><strong>'+{math:'算数',jp:'国語',en:'英語'}[subject]+'：</strong>'+esc(r.label)+'を練習中'+(r.support.length?'（つまずいた単元を復習中）':'')+'</p>'}).join('')+'<p class="muted">最近練習した単元の現在の段階から表示します。学力診断ではありません。苦手な単元だけ戻り、他の単元の習得は保ちます。この分野の実装済み必須段階を、異なる問題で複数セット安定して解けたら、その分野だけ次の学年帯へ進みます。</p></section>'}
 practiceSettings=function(){
  const selected=PracticePresets.selected(person(),Practice),preset=PracticePresets.presets.find(x=>x.id===selected);
  const details=detailedPracticeSettings().replace('class="panel practice-settings"','class="practice-details"').replace('<h2>分野ごとの出題範囲</h2>','<h3>保護者が決める絶対上限</h3>');
  return `<section class="panel practice-settings"><h2>まとめて むずかしさを調整</h2><p><strong>${esc(person().name)}さんだけの設定</strong>です。他の子の設定・記録・コインは変わりません。</p>${practiceBulkLimitMarkup()}<h3>開始範囲の設定</h3><label class="preset-label" for="practicePreset">何学年相当の範囲から始める？</label><select id="practicePreset" aria-describedby="practicePresetHelp" onchange="applyPracticePreset(this.value)"><option value="custom" ${selected==='custom'?'selected':''}>個別設定（現在の範囲）</option>${PracticePresets.presets.map(x=>`<option value="${x.id}" ${selected===x.id?'selected':''}>${esc(x.label)}</option>`).join('')}</select><p id="practicePresetSummary">${preset?esc(preset.description):'現在の設定を保っています。目安を選ぶと開始範囲をまとめて変更します。親が指定した絶対上限は残ります。'}</p><p id="practicePresetHelp" class="muted">実年齢・学力の判定ではなく、このアプリにある内容の目安です。学年の全範囲を網羅しません。英語入門は絵ことばの量の目安です。中学英語は学年を細分化しません。上げても、まだ習得していない前提は飛ばしません。</p><p id="practicePresetStatus" role="status"></p>${practiceRangeMarkup()}${practiceProgressMarkup()}<p class="muted">開始範囲は自動進級で広がります。詳細設定の絶対上限と漢字OFF・くり上がりOFFは、自動では解除しません。範囲クリア後に次の学年帯がない場合や上限に達した場合は、復習を続けられます。</p><details class="practice-advanced"><summary>必要なときだけ：分野ごとの絶対上限</summary>${details}</details></section>`;
 };
 function refreshPresetSummary(message){
  const selected=PracticePresets.selected(person(),Practice),preset=PracticePresets.presets.find(x=>x.id===selected);
  const control=document.querySelector('#practicePreset');if(control)control.value=selected;
  const summary=document.querySelector('#practicePresetSummary');if(summary)summary.textContent=preset?preset.description:'個別設定です。まとめて変更した内容に、分野ごとの調整を加えています。';
  const status=document.querySelector('#practicePresetStatus');if(status)status.textContent=message;
  const rangePanel=document.querySelector('.practice-range');if(rangePanel)rangePanel.outerHTML=practiceRangeMarkup();
 }
 function applyPracticePreset(id){
  if(view!=='parent')return;
  if(id==='custom'){delete Practice.state(person()).rangePreset;save();refreshPresetSummary('現在の範囲をそのまま個別設定として保存しました。');return}
  if(!PracticePresets.apply(person(),id,Practice))return;
  // Parent settings are outside an active quiz; invalidate any stale requested focus.
  curriculumRequestedFocus=null;practiceItem=null;practiceContinuation=null;save();parents();
  refreshPresetSummary(person().name+'さんの出題範囲を保存しました。記録・コイン・育成データはそのままです。');
 }
 const presetPermission=setPracticePermission,presetLimit=setPracticeLimit;
 setPracticePermission=function(key,value){presetPermission(key,value);if(view==='parent')refreshPresetSummary('この子の詳細設定を保存しました。')};
 setPracticeLimit=function(id,value){presetLimit(id,value);if(view==='parent'){refreshPresetSummary('この子の詳細設定を保存しました。');refreshPracticeLimitSelection()}};
 document.head.insertAdjacentHTML('beforeend','<style>.preset-label{display:block;font-weight:700;margin:14px 0 8px}.practice-settings select{display:block;width:100%;max-width:100%;min-width:0;min-height:48px;padding:10px;font-size:16px;border:1px solid #c8d5c8;border-radius:12px;background:white;color:#234638}.practice-bulk-limit{margin:16px 0 24px;padding:16px;border:1px solid #c8d5c8;border-radius:14px;background:#f2f7ef}.practice-bulk-limit h3{margin-top:0}.practice-settings #practiceBulkLimitStatus:empty{display:none}.practice-details{padding:4px}.practice-advanced{border-top:1px solid #dce3d6;padding-top:8px}.practice-settings #practicePresetStatus:empty{display:none}</style>');
}


