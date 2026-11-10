/* More practice inside established stages. No new course IDs or learner migration. */
(function(root){
 'use strict';
 const hiragana=[
  ['🐱','ねこ'],['🐶','いぬ'],['🐢','かめ'],['🐻','くま'],['🐴','うま'],['🐮','うし'],
  ['🐙','たこ'],['🦑','いか'],['🦀','かに'],['🐵','さる'],['🐯','とら'],['🐿️','りす'],
  ['🐷','ぶた'],['🐦','とり'],['🐟','さかな'],['🐰','うさぎ'],['🦊','きつね'],['🐑','ひつじ'],
  ['🦒','きりん'],['🐼','ぱんだ'],['🍎','りんご'],['🍌','ばなな'],['🍇','ぶどう'],['🍓','いちご'],
  ['🍉','すいか'],['🍊','みかん'],['🍑','もも'],['🍆','なす'],['🚗','くるま'],['☂️','かさ']
 ];
 const katakana=[
  ['🐱','ネコ'],['🐶','イヌ'],['🐼','パンダ'],['🦒','キリン'],['🦁','ライオン'],['🐯','トラ'],
  ['🐧','ペンギン'],['🍌','バナナ'],['🍎','リンゴ'],['🍊','ミカン'],['🍋','レモン'],['🍈','メロン'],
  ['🍅','トマト'],['🍞','パン'],['🖊️','ペン'],['🚌','バス'],['📺','テレビ'],['📷','カメラ'],
  ['🎹','ピアノ'],['🎸','ギター'],['🍰','ケーキ'],['⚽','ボール'],['🎻','バイオリン'],['🪣','バケツ'],
  ['🚕','タクシー'],['🧀','チーズ'],['🚀','ロケット'],['🍩','ドーナツ'],['🍮','プリン'],['🐨','コアラ']
 ];
 const letters='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ';
 const toKatakana=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));
 function holes(words,script){
  const alphabet=Array.from(script==='hiragana'?letters:toKatakana(letters));
  return words.flatMap(([icon,word],n)=>[0,Array.from(word).length-1].map((at,part)=>{
   const chars=Array.from(word),answer=chars[at];chars[at]='□';const masked=chars.join('');
   const start=alphabet.indexOf(answer),others=[1,4].map(offset=>alphabet[(start+offset)%alphabet.length]);
   return {id:script+'-picture-'+(n+1)+'-'+part,script,word,icon,masked,at,
    row:[icon+' '+masked,answer,others.join('|'),'えの なまえは「'+word+'」だよ。□の おとを かんがえよう。']};
  }));
 }
 function facts(op,max){
  const out=[];for(let a=1;a<=max;a++)for(let b=1;b<=max;b++)if(op==='add'?a+b<=max:b<=a)out.push([a,b]);return out;
 }
 const items=[...holes(hiragana,'hiragana'),...holes(katakana,'katakana')];
 const api={hiragana,katakana,items,facts,addedByCourse:{}};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 if(root.EarlyPractice)return;
 root.EarlyPractice=api;
 const hiraCourse=foundationById('letters').courses[2],kataCourse=foundationById('katakana').courses[0];
 const courseOf=item=>item.script==='hiragana'?hiraCourse:kataCourse;
 const lookup=new Map();
 for(const item of items){
  const course=courseOf(item),bank=JP_BANK[course-JP_START];
  lookup.set(course+'|'+item.row[0]+'|'+item.row[1],item);
  if(!bank.some(row=>row[0]===item.row[0]&&row[1]===item.row[1])){bank.push(item.row.slice());api.addedByCourse[course]=(api.addedByCourse[course]||0)+1}
 }
 const before=makeQuestion;
 makeQuestion=function(i){
  const result=before(i);
  const prompt=result.i===hiraCourse?result.visual:result.i===kataCourse?result.text.replace(/ を カタカナで かくと？$/,''):'';
  const item=lookup.get(result.i+'|'+prompt+'|'+result.answer);
  if(item){
   result.text='□に はいる '+(item.script==='hiragana'?'ひらがな':'カタカナ')+'は？';
   // Keep the unique prompt for existing evidence/rotation; the renderer shows its picture and blank.
   result.visual=item.row[0];result.pictureClue={icon:item.icon,word:item.word,masked:item.masked};
   result.earlyPracticeId=item.id;result.readingTask='kana-blank';
   result.instructionSpeech='えを みて、しかくに はいる '+(item.script==='hiragana'?'ひらがな':'カタカナ')+'を えらぼう。';
  }
  return result;
 };
 const symbols=['🍎','🍓','🌼'];
 function counters(n,icon,removed=0){
  return '<span class="basic-counter-group">'+Array.from({length:n},(_,k)=>'<button class="object basic-counter'+(k>=n-removed?' removed':'')+'" aria-label="'+(k+1)+'こめ'+(k>=n-removed?' とるもの':'')+'" onclick="this.classList.toggle(\'counted\')">'+icon+'</button>').join('')+'</span>';
 }
 function arithmetic(course,op,max){
  const bank=facts(op,max);
  foundationMakers[course]=()=>{
   const [a,b]=lowerGradePick('basic-facts:'+course,bank),plus=op==='add',answer=plus?a+b:a-b;
   const turns=session?(session.basicForms??={}):{},turn=turns[course]||0;turns[course]=turn+1;
   const form=turn%3,icon=symbols[form],symbol=plus?'＋':'−';
   const text=form===0?`${a} ${symbol} ${b} ＝ ？`:plus?(form===1?`${a}こ と ${b}こ。\nあわせて いくつ？`:`${a}こ あります。\n${b}こ もらうと、ぜんぶで いくつ？`):(form===1?`${a}こ あります。\n${b}こ とると、のこりは いくつ？`:`${a}この うち ${b}こ つかったよ。\nのこりは いくつ？`);
   const low=plus?1:0,values=Array.from({length:max-low+1},(_,n)=>n+low);
   const choices=[answer,...values.filter(n=>n!==answer).sort((x,y)=>Math.abs(x-answer)-Math.abs(y-answer))].slice(0,3).sort(()=>Math.random()-.5);
   const diagram=plus?counters(a,icon)+'<span class="basic-plus" aria-hidden="true">＋</span>'+counters(b,icon):counters(a,icon,b);
   return {i:course,type:plus?'add':'sub',a,b,answer,choices,objects:0,text,
    arithmetic:{op:plus?'add':'subtract',a,b},variant:plus?(b===1?'one-more':'combine'):'take-away',
    hint:plus?'ふたつの まとまりを、あわせて かぞえよう。':'せんの ついた ものを のぞいて、のこりを かぞえよう。',
    visualHTML:'<div class="basic-arithmetic" role="group" aria-label="'+a+'こ'+(plus?'と '+b+'こを あわせる': 'から '+b+'こを とる')+'">'+diagram+'</div>',basicPractice:{op,max,form}};
  };
 }
 [3,5,9].forEach((max,stage)=>arithmetic(foundationById('addition').courses[stage],'add',max));
 [5,9].forEach((max,stage)=>arithmetic(foundationById('subtraction').courses[stage],'subtract',max));
})(typeof globalThis==='object'?globalThis:this);
