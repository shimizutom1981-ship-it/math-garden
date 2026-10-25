const JuniorSpellingPatterns=(()=>{
 const groups=[
 [
 ['一つの city を複数にすると？','cities','citys','cityes','子音＋y は y を i に変えて es。'],
 ['一つの baby を複数にすると？','babies','babys','babyes','子音＋y の複数形です。'],
 ['一つの bus を複数にすると？','buses','buss','busies','s で終わるので es をつけます。'],
 ['一つの watch を複数にすると？','watches','watchs','watchies','ch で終わるので es をつけます。'],
 ['一つの boy を複数にすると？','boys','boies','boyes','母音＋y は y を残して s。'],
 ['一つの key を複数にすると？','keys','keies','keyes','母音＋y の複数形です。'],
 ['一人の child を複数にすると？','children','childs','childes','child の複数形は不規則です。'],
 ['一枚の leaf を複数にすると？','leaves','leafs','leafes','leaf は f を ves に変えます。']
 ],[
 ['She ___ English every day. study の形は？','studies','studys','studyies','主語が三人称単数。子音＋y は ies。'],
 ['He ___ soccer every Sunday. play の形は？','plays','plaies','playes','母音＋y は s をつけます。'],
 ['She ___ the dishes after dinner. wash の形は？','washes','washs','washies','sh の後は es。'],
 ['He ___ English at our school. teach の形は？','teaches','teachs','teachies','ch の後は es。'],
 ['She ___ to school by bus. go の形は？','goes','gos','goies','go の三人称単数形は goes。'],
 ['He ___ a bike. have の形は？','has','haves','havees','have の三人称単数形は不規則です。'],
 ['She ___ a heavy bag every morning. carry の形は？','carries','carrys','carryes','子音＋y は ies。'],
 ['He ___ the ball carefully. catch の形は？','catches','catchs','cathces','catch に es をつけます。']
 ],[
 ['I ___ the box yesterday. carry の過去形は？','carried','carryed','carrid','子音＋y を i に変えて ed。'],
 ['She ___ the door yesterday. close の過去形は？','closed','closeed','closd','e で終わるので d をつけます。'],
 ['The bus ___ here yesterday. stop の過去形は？','stopped','stoped','stoppped','短い母音＋子音で終わる stop は p を重ねます。'],
 ['We ___ tennis yesterday. play の過去形は？','played','plaied','playd','母音＋y はそのまま ed。'],
 ['He ___ the trip yesterday. plan の過去形は？','planned','planed','plannned','plan は n を重ねて ed。'],
 ['I ___ hard yesterday. try の過去形は？','tried','tryed','tryied','子音＋y を i に変えて ed。'],
 ['She ___ the window yesterday. open の過去形は？','opened','openned','opend','open は最後の音節に強勢がないので n を重ねません。'],
 ['They ___ the room yesterday. clean の過去形は？','cleaned','cleanned','cleand','clean に ed をつけます。']
 ],[
 ['I am ___ a cake. make の ing 形は？','making','makeing','makking','発音しない最後の e を取って ing。'],
 ['She is ___ now. run の ing 形は？','running','runing','runnning','run は n を重ねて ing。'],
 ['He is ___ on a chair. sit の ing 形は？','sitting','siting','sittting','sit は t を重ねます。'],
 ['They are ___ in the pool. swim の ing 形は？','swimming','swiming','swimmming','swim は m を重ねます。'],
 ['I am ___ a letter. write の ing 形は？','writing','writeing','writting','発音しない最後の e を取ります。'],
 ['The baby is ___ in bed. lie の ing 形は？','lying','lieing','liing','lie の ie を y に変えて ing。'],
 ['She is ___ English. study の ing 形は？','studying','studing','studdying','study の y は変えず ing。'],
 ['He is ___ the room. clean の ing 形は？','cleaning','cleanning','cleaneing','clean にそのまま ing。']
 ]
 ];
 return {id:'junior_spellingPatterns',title:'中学英語・綴りの変化と規則',stages:groups.map((rows,s)=>({title:['名詞の複数形','主語に合わせる綴り','過去形の綴り','ing形の綴り'][s],items:rows.map(([prompt,answer,a,b,hint],i)=>({id:`junior-spell-pattern-${s}-${i}`,mode:'reading',prompt,fallbackPrompt:prompt,answer,choices:[answer,a,b],hint,audioText:'Read the question and choose the answer.',answerAudio:answer,topic:'spellingPatterns'}))}))};
})();
if(typeof module!=='undefined')module.exports=JuniorSpellingPatterns;
