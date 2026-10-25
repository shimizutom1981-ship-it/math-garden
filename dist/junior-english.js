/* Original examples. Every grammar example has a cloze and a complete-sentence task. */
const JuniorEnglish=(()=>{
 const grammarData=[
 ['be','be動詞',`I ___ a student.|am|is|are
 She ___ my sister.|is|am|are
 We ___ friends.|are|am|is
 He ___ tired yesterday.|was|were|are
 They ___ at home last night.|were|was|is
 This book ___ interesting.|is|are|am`],
 ['present','現在形・三単現',`Ken ___ soccer every day.|plays|play|playing
 I ___ breakfast at seven.|eat|eats|eating
 My mother ___ English.|teaches|teach|teaching
 They ___ to school by bus.|go|goes|going
 She ___ two brothers.|has|have|having
 The store ___ at nine every morning.|opens|open|opening`],
 ['past','過去形・不規則変化',`I ___ the park yesterday.|visited|visit|visiting
 She ___ to Kyoto last week.|went|go|goes
 We ___ lunch at noon yesterday.|ate|eat|eating
 He ___ a new bag last Sunday.|bought|buy|buys
 They ___ a movie last night.|saw|see|seeing
 I ___ this letter yesterday.|wrote|write|written`],
 ['future','未来・予定',`I will ___ you tomorrow.|call|called|calling
 She is going to ___ dinner.|cook|cooks|cooked
 They ___ going to visit us tomorrow.|are|is|am
 We will ___ here next week.|be|are|were
 He ___ going to study tonight.|is|are|am
 Will you ___ at home tomorrow?|be|are|were`],
 ['progressive','現在・過去進行形',`I am ___ a book now.|reading|read|reads
 She ___ cooking now.|is|are|am
 They are ___ in the park.|running|run|runs
 He was ___ TV at eight last night.|watching|watch|watched
 We ___ playing when it began to rain.|were|was|is
 Were you ___ at nine last night?|studying|study|studied`],
 ['question','疑問文・疑問詞',`___ you like music?|Do|Does|Are
 ___ she play tennis?|Does|Do|Is
 ___ did you go yesterday?|Where|Who|Whose
 How ___ books do you have?|many|much|long
 ___ bag is this? It is mine.|Whose|Who|Where
 Who ___ this window yesterday?|broke|did broke|break`],
 ['negative','否定文',`I ___ not like coffee. 私はコーヒーが好きではない。|do|does|am
 She does not ___ meat.|eat|eats|ate
 We did not ___ there yesterday.|go|went|gone
 He ___ not at home last night.|was|were|does
 They are not ___ now.|sleeping|sleep|slept
 I have not ___ the book yet.|finished|finish|finishing`],
 ['modal','助動詞・義務と許可',`She can ___ very well.|swim|swims|swam
 You must ___ a helmet here.|wear|wears|wore
 We should ___ the rules.|follow|follows|followed
 He has to ___ early.|leave|leaves|left
 You do not have to come. 来ることは？|義務ではない|禁止されている|必ず必要だ
 You must not run here. 走ることは？|禁止されている|義務ではない|必ず必要だ
May I ___ your pen?|use|uses|used
You should not ___ late.|be|are|were`],
 ['comparison','比較・最上級・同等',`This bag is ___ than mine.|bigger|biggest|big
 She is the ___ runner in our class.|fastest|faster|fast
 This book is as ___ as that one.|interesting|more interesting|most interesting
 Today is ___ than yesterday.|better|best|good
 This is the ___ beautiful flower here.|most|more|much
 My bike is not as ___ as yours.|new|newer|newest`],
 ['infinitive','不定詞・目的・疑問詞＋to',`I want ___ a teacher.|to be|be|being to
 She went to the library ___ books.|to borrow|borrow|borrowed
 I have homework ___ tonight.|to do|do|did
 He knows how ___ this machine.|to use|use|used
 It is important ___ breakfast.|to eat|eat|ate
 Please tell me what ___ next.|to do|do|did`],
 ['gerund','動名詞',`I enjoy ___ pictures.|drawing|draw|to drawing
 She finished ___ the room.|cleaning|clean|to cleaning
 Thank you for ___ me.|helping|help|helped
 ___ books is fun.|Reading|Read|Reads
 He is good at ___ English.|speaking|speak|spoke
 We stopped ___ and listened.|talking|talk|talked`],
 ['passive','受け身',`This room is ___ every day. この部屋は毎日掃除される。|cleaned|clean|cleaning
 The book was ___ by my uncle.|written|wrote|write
 English is ___ in many countries.|spoken|spoke|speak
 These pictures were ___ yesterday.|taken|took|take
 The window was ___ by the ball.|broken|broke|break
 This cake was ___ by Ken.|made|make|making`],
 ['perfect','現在完了・経験・継続・完了',`I have ___ Kyoto twice.|visited|visit|visiting
 She has ___ here for three years.|lived|live|living
 Have you ever ___ this movie?|seen|saw|see
 He has just ___ home.|come|came|coming
 We have already ___ lunch.|finished|finish|finishing
 I have known her ___ 2020.|since|for|during`],
 ['perfectProgressive','現在完了進行形',`I have been ___ for two hours.|studying|study|studied
 She has ___ waiting since noon.|been|be|being
 They have been ___ soccer for an hour.|playing|play|played
 He ___ been reading since ten.|has|have|is
 How long have you been ___ here?|working|work|worked
 It has been ___ all morning.|raining|rain|rained`],
 ['relative','関係代名詞・省略',`The boy ___ lives next door is Ken.|who|which|what
 This is a book ___ has many pictures.|which|who|what
 The cake ___ I made is on the table.|that|who|what
 I know the girl ___ you met yesterday.|that|which|what
 This is the bag I ___ yesterday.|bought|buying|buys
 The dog ___ is sleeping is mine.|that|what|whom`],
 ['participle','分詞による名詞修飾',`The girl ___ under the tree is May.|standing|stood|stand
 Look at the boy ___ soccer.|playing|played|plays
 The language ___ in Brazil is Portuguese.|spoken|speaking|spoke
 This is a picture ___ by my sister.|painted|painting|paint
 The man ___ a red cap is my father.|wearing|worn|wears
 I like the cake ___ by my mother.|made|making|make`],
 ['hypothetical','基本的な仮定法',`If I ___ a bird, I could fly.|were|am|will be
 I wish I ___ more free time.|had|have|will have
 If I had a bike, I ___ ride to school.|could|can|am
 I wish I ___ speak French.|could|can|will
 If I were you, I ___ ask the teacher.|would|will|am
 If it were sunny, we ___ play outside.|could|can|are`],
 ['indirect','間接疑問',`Do you know where ___?|she lives|does she live|is she live
 Please tell me what time ___.|it is|is it|does it
 I do not know who ___.|he is|is he|does he
 Can you tell me how old ___?|you are|are you|do you
 I know why ___ yesterday.|he was absent|was he absent|did he absent
 Do you know when ___?|the train leaves|does the train leave|is the train leave`],
 ['conjunction','接続詞・理由・条件',`I stayed home ___ I was sick. 病気だったことを理由として述べる。|because|but|or
 I like tea, ___ my brother likes coffee. 二人の好みを対比する。|but|because|or
 Please call me ___ you arrive.|when|because of|during
 I will go out ___ it is sunny tomorrow.|if|because of|during
 I was tired, ___ I went to bed early. 疲れた結果を述べる。|so|or|but
 ___ it was raining, we went for a walk.|Although|Because of|During`],
 ['pronoun','代名詞・所有',`This is my book. That one is ___.|yours|your|you
 Please help ___.|me|my|I
 She loves ___ dog.|her|hers|she
 We made this cake by ___.|ourselves|our|us
 These shoes are ___.|mine|my|I
 Tom and I are friends. ___ play together.|We|Us|Our`],
 ['quantity','冠詞・数えられる名詞',`I have ___ umbrella.|an|a|many
 There are three ___ on the desk.|boxes|box|boxs
 How ___ water do you need?|much|many|long
 I do not have ___ money.|any|many|a
 There are a few ___ in the park.|children|child|childs
 There is a little ___ in the cup.|milk|apples|books`],
 ['preposition','前置詞・時間と場所',`We have music ___ Monday.|on|at|in
 I get up ___ seven.|at|on|in
 My birthday is ___ July.|in|at|on
 The cat is ___ the box. 箱の中にいる。|in|on|under
 The ball is ___ the table. テーブルの下にある。|under|on|above
 This letter is ___ my aunt. おばからの手紙。|from|to|by`],
 ['there','存在文・主語と動詞',`There ___ a park near my house.|is|are|am
 There ___ two books on the desk.|are|is|am
 ___ there any milk in the fridge?|Is|Are|Does
 There ___ many people here yesterday.|were|was|is
 There was ___ apple on the table.|an|a|many
 There will ___ a concert tomorrow.|be|is|are`],
 ['svoo','文型・人に物を渡す',`My father gave ___ a book.|me|my|I
 Please show me ___.|your picture|you picture|yours picture
 She made a cake ___ me.|for|to|at
 I sent a letter ___ my uncle. おじ宛てに手紙を送った。|to|for|at
 He taught ___ English.|us|our|we
 Please tell ___ the story.|them|their|they`],
 ['svoc','文型・状態・人にしてもらう',`The news made me ___.|happy|happily|happiness
 We call our dog ___.|Pochi|is Pochi|to Pochi
 Please keep the door ___.|open|openly|to open
 I want you ___ this book.|to read|read|reading
 She asked me ___ her.|to help|help|helped
 The teacher told us ___ quiet.|to be|be|are`],
 ['complement','補語・原形不定詞・that節',`She looks ___.|happy|happily|happiness
 My mother let me ___ the computer.|use|to use|used
 The story made us ___.|laugh|to laugh|laughed
 I am glad ___ you are here.|that|what|which
 I think ___ English is useful.|that|what|who
 Do you want tea ___ coffee?|or|but|so`],
 ['imperative','命令・感嘆・誘い',`___ quiet, please.|Be|Are|Is
 Do not ___ here.|run|runs|ran
 Let us ___ a song.|sing|sings|sang
 ___ a beautiful flower this is!|What|How|Which
 ___ beautiful this flower is!|How|What|Which
 Please ___ the window.|open|opens|opened`]
 ];
 const grammar=grammarData.map(([id,title,text])=>{
  const examples=text.split('\n').map(line=>line.trim().split('|'));
  return {id:'junior_'+id,title:'中学英語・'+title,examples,stages:[0,1].map(stage=>({title:title+(stage?'・文全体':'・形と意味'),items:examples.map(([stem,a,b,c],i)=>({row:[stem,a,b,c],i})).filter(x=>!stage||x.row[0].includes('___')).map(({row:[stem,a,b,c],i})=>{
   const isGap=stem.includes('___'),full=x=>stem.replace('___',x);
   const answer=stage&&isGap?full(a):a,choices=stage&&isGap?[a,b,c].map(full):[a,b,c];
   const prompt=stage&&isGap?'正しい形・指定された意味に合う文をえらぼう。':'文に合う形・意味をえらぼう。\n'+stem;
   return {id:`junior-${id}-${stage}-${i}`,mode:'grammar',prompt:stage&&!isGap?'文の意味をたしかめよう。\n'+stem:prompt,answer,choices,audioText:'Choose the correct answer.',answerAudio:(isGap?full(a):stem).replace(/[^\x00-\x7F].*$/s,'').trim(),fallbackPrompt:stage&&isGap?prompt:'読む練習：'+stem,hint:isGap?'正しい文：'+full(a):stem+' → '+a,topic:id,example:i};
  })}))};
 });
 return {grammar,skills:grammar};
})();
if(typeof module!=='undefined')module.exports=JuniorEnglish;
