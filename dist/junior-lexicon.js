/* Selected lexical coverage, not a claim to a complete 1,600–1,800-word list. */
const JuniorLexicon=(()=>{
 const groups=[
 ['学習と情報','information|情報;knowledge|知識;research|調査・研究;evidence|証拠;opinion|意見;fact|事実;explanation|説明;example|例;method|方法;result|結果'],
 ['社会と環境','society|社会;community|地域社会;population|人口;pollution|汚染;resource|資源;energy|エネルギー;electricity|電気;environment|環境;recycling|再利用;climate|気候'],
 ['行動と考え','compare|比べる;consider|よく考える;decide|決める;explain|説明する;describe|描写する;suggest|提案する;improve|改善する;develop|発展させる;protect|守る;reduce|減らす'],
 ['性質と判断','necessary|必要な;possible|可能な;available|利用できる;similar|似ている;different|異なる;important|重要な;useful|役に立つ;common|よくある;local|地域の;international|国際的な'],
 ['生活と経験','experience|経験;opportunity|機会;purpose|目的;reason|理由;choice|選択;decision|決定;promise|約束;invitation|招待;appointment|面会などの予約;instruction|指示'],
 ['伝達と関係','communicate|意思を伝え合う;introduce|紹介する;invite|招待する;accept|受け入れる;refuse|断る;agree|賛成する;disagree|反対する;support|支援する;share|分け合う;respect|尊重する'],
 ['基本の熟語','look for|探す;look after|世話をする;look at|見る;listen to|耳を傾けて聞く;wait for|待つ;get up|起床する;go to bed|寝る;come from|出身である;get on|乗り込む;get off|降りる'],
 ['動作の熟語','turn on|電源を入れる;turn off|電源を切る;put on|身につける;take off|脱ぐ;pick up|拾い上げる;give up|あきらめる;find out|調べて知る;take part in|参加する;take care of|世話をする;run out of|使い果たす'],
 ['気持ちと得意','be interested in|興味がある;be good at|得意である;be proud of|誇りに思う;be afraid of|こわがる;be worried about|心配している;be surprised at|驚いている;be famous for|で有名である;be different from|とは異なる;be full of|でいっぱいである;be ready for|の準備ができている'],
 ['つながりを表す熟語','because of|が理由で;instead of|の代わりに;according to|によると;for example|例えば;such as|のような;in fact|実際は;at first|最初は;at last|とうとう;in the future|将来は;on the other hand|他方では'],
 ['時間と程度','a lot of|たくさんの;a few|少しの（数えられる物）;a little|少しの（量）;more than|より多い;less than|より少ない;at least|少なくとも;at once|すぐに;on time|時間通りに;from now on|これからは;all over the world|世界中で'],
 ['発展の熟語','look forward to|を楽しみに待つ;be able to|することができる;have to|しなければならない;used to|以前はよくした;would like to|したい;in order to|するために;thanks to|のおかげで;as soon as|するとすぐに;as well as|〜に加えて;so far|これまでのところ']
 ];
 return groups.map(([title,text],g)=>{const words=text.split(';').map(x=>x.split('|'));return {id:'junior_lexicon'+g,title:'中学英語・'+title,lexicon:words,stages:[{title,items:words.map(([word,meaning],i)=>({id:`junior-lexicon-${g}-${i}`,mode:'vocabulary',prompt:`「${word}」の意味をえらぼう。`,fallbackPrompt:`「${word}」の意味をえらぼう。`,audioText:word,answerAudio:word,answer:meaning,choices:[meaning,words[(i+3)%words.length][1],words[(i+7)%words.length][1]],hint:`${word}：${meaning}`,topic:'lexicon'}))}]}});
})();
if(typeof module!=='undefined')module.exports=JuniorLexicon;
