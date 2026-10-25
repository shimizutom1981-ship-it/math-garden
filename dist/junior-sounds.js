/* Original sound/notation tasks. Prosody notation is reading knowledge, not recorded speech. */
const JuniorSounds=(()=>{
 const heard=[
 ['fan','扇風機','van','pan'],['vest','ベスト（衣服）','best','west'],['thin','薄い','sin','fin'],['sink','流し台','think','sing'],['seat','座席','sit','set'],['pool','プール','pull','pole'],['lock','錠前','rock','look'],['glass','ガラス','grass','class']
 ].map(([word,meaning,a,b])=>({prompt:'聞こえた単語をえらぼう。',audioText:word,answer:word,choices:[word,a,b],fallbackPrompt:`読む練習：「${meaning}」を表す単語は？`,hint:`${word} は「${meaning}」。最初・最後の音と母音に注意しよう。`,answerAudio:word}));
 const endings=[['cats','s'],['books','s'],['cups','s'],['dogs','z'],['pens','z'],['bags','z'],['buses','iz'],['watches','iz']].map(([word,ending])=>({prompt:'複数形の語尾を聞こう。最後の s / es はどの音？',audioText:word,answer:{s:'/s/（ス）',z:'/z/（ズ）',iz:'/ɪz/ または /əz/（1音節増える）'}[ending],choices:['/s/（ス）','/z/（ズ）','/ɪz/ または /əz/（1音節増える）'],fallbackPrompt:`読む練習：${word} の複数形の語尾はどの音？`,hint:`${word} の語尾は /${ending==='iz'?'ɪz':ending}/。直前の音によって決まります。`,answerAudio:word}));
 for(const q of endings)q.hint+=' カナは補助の目安で、余分な母音を足すという意味ではありません。';
 const pastEndings=[['walked','t'],['helped','t'],['watched','t'],['called','d'],['played','d'],['lived','d'],['wanted','id'],['needed','id']].map(([word,ending])=>({prompt:'過去形の語尾を聞こう。最後の ed はどの音？',audioText:word,answer:{t:'/t/（無声音）',d:'/d/（有声音）',id:'/ɪd/ または /əd/（1音節増える）'}[ending],choices:['/t/（無声音）','/d/（有声音）','/ɪd/ または /əd/（1音節増える）'],fallbackPrompt:`読む練習：${word} の過去形の語尾はどの音？`,hint:`${word} の語尾は ${ending==='id'?'母音＋d で1音節増えます':'/'+ending+'/ です'}。綴りだけでなく直前の音で決まります。`,answerAudio:word}));
 endings.push(...pastEndings);
 const stress=[
 ['banana','ba','na','na',1],['beautiful','beau','ti','ful',0],['Japanese','Ja','pa','nese',2],['potato','po','ta','to',1],['animal','an','i','mal',0],['volunteer','vol','un','teer',2],['tomato','to','ma','to',1],['elephant','el','e','phant',0],
 ['computer','com','pu','ter',1],['cinema','cin','e','ma',0],['afternoon','af','ter','noon',2],['September','Sep','tem','ber',1],['regular','reg','u','lar',0],['engineer','en','gi','neer',2],['important','im','por','tant',1],['popular','pop','u','lar',0]
 ].map(([word,...parts])=>{const at=parts.pop(),choices=parts.map((_,j)=>parts.map((part,i)=>i===j?part.toUpperCase():part.toLowerCase()).join('・'));return {prompt:'単語を聞こう。いちばん強く読む音節を大文字で表したものは？',audioText:word,answer:choices[at],choices,fallbackPrompt:`読む練習：${word} のいちばん強く読む音節を大文字で表したものは？`,hint:`${word} は${at+1}番目の音節が強い。ここでの区切りは発音を考えるための目安です。`,answerAudio:word}});
 const sounds={id:'junior_soundPatterns',title:'中学英語・音と綴りと語の強勢',stages:[heard,endings,stress.slice(0,8),stress.slice(8)].map((items,s)=>({title:['母音・子音を聞き分ける','複数形・過去形の語尾','語の強勢・身近な語','語の強勢・少し長い語'][s],items:items.map((q,i)=>({...q,id:`junior-sounds-${s}-${i}`,mode:'listen',requiresAudio:true,fallbackSkillId:'junior_soundPatternsReading',topic:['phonemes','endings','stress','stress'][s]}))}))};
 const knowledge=[
 ['「an apple」は自然な会話では語の間を必ず長く空ける？','いいえ。前後の音がつながることがある','はい。常に一秒ずつ空ける','apple の最初の音を必ず消す','語の区切りと、実際に聞こえる音の区切りは一致しないことがあります。'],
 ['「pick it up」を聞くと、語の境目がつながって聞こえた。意味のまとまりは？','それを拾い上げる','それを全部捨てる','上を見つめる','pick / it / up の単語を知っていても、続けて発音した音に慣れる練習が必要です。'],
 ['「want to」の t が弱く聞こえた。意味を確かめるときに大切なのは？','前後の文脈も使って語のまとまりを捉える','t が弱いので必ず別の単語だと決める','to を聞こえない単語として全て無視する','自然な発話では音が弱くなったり変化したりします。文脈と合わせて聞きます。'],
 ['「next day」で t がはっきり聞こえなくても「翌日」の意味になることは？','ある。子音が続くと音が弱くなる場合がある','ない。必ず「今日」の意味になる','ない。文として使えなくなる','音が脱落・弱化しても、元の語と文脈から意味を捉えます。'],
 ['「I can swim.」で can が弱く短く発音された。通常の意味は？','私は泳げる','私は泳げない','私は泳がなければならない','強く発音しない can も肯定の can です。'],
 ['「a cup of tea」の of が弱く聞こえることがある。元のまとまりは？','一杯のお茶','お茶を作る人','お茶を飲む時刻','機能語の of などは文中で弱く発音されることがあります。'],
 ['音声で「turn off」の境目がつながった。電気について言うと、指示は？','電源を切る','電源を入れる','電球を買う','turn off は続けて発音されても「電源を切る」です。'],
 ['同じ単語でも、一語だけの発音と文の中の発音は常に同じ長さ・強さ？','いいえ。文中では弱く短くなる場合がある','はい。どの単語も常に同じ強さ','いいえ。文中では全単語が発音されない','強勢や音のつながりで、文中の聞こえ方が変わります。'],
 ['大文字が対比のために強調された部分です。「I wanted the BLUE bag, not the red one.」何を対比している？','かばんの色','かばんを買う日','かばんの値段','BLUE と red を対比しています。'],
 ['大文字が強調です。「MAY borrowed the book, not Ken.」確かめている違いは？','借りた人','借りた本の長さ','返す時刻','MAY と Ken の違いです。'],
 ['大文字が強調です。「We will meet on FRIDAY, not Thursday.」対比しているのは？','会う曜日','会う場所','会う人の人数','FRIDAY と Thursday を対比しています。'],
 ['大文字が強調です。「She BOUGHT the bike; she did not borrow it.」対比しているのは？','自転車を手に入れた方法','自転車の色','自転車の速さ','BOUGHT（買った）と borrow（借りる）を対比しています。'],
 ['大文字が強調です。「I need TWO tickets, not one.」大切な違いは？','切符の枚数','切符を買う場所','切符の色','TWO と one を対比しています。'],
 ['大文字が強調です。「We met at the STATION, not at school.」伝え直しているのは？','会った場所','会った時刻','会った理由','STATION と school の違いです。'],
 ['大文字が強調です。「This is MY pen, not yours.」強調しているのは？','だれのペンか','ペンの長さ','ペンで書く内容','MY と yours は持ち主を表します。'],
 ['大文字が強調です。「Please CLOSE the door; do not open it.」対比しているのは？','ドアに対する動作','ドアの材料','ドアの持ち主','CLOSE と open を対比しています。'],
 ['相手が「You finished? ↗」と驚きながら確認した。意図は？','本当に終えたのか確かめたい','終えるなと禁止したい','終える方法を説明したい','平叙文の形でも、上がる調子で確認する使い方があります。'],
 ['「Tea ↗ or coffee ↘?」と二つから選ぶように聞かれた。合う返事は？','Tea, please.','Yes, I do.','I am twelve.','選択疑問では、選んだものを答えます。矢印はここで指定した調子です。'],
 ['名前が聞こえず「Who? ↗」と聞き返した。求めているものは？','名前をもう一度言ってもらうこと','帰宅の許可','食べ物の追加','疑問詞でも、聞き返しでは上がる調子を使うことがあります。'],
 ['言い方で確かめる意図を表す場合がある。正しい説明は？','同じ文でも状況や調子で意図が変わることがある','疑問詞の文は常に同じ調子でしか言えない','調子は意味や意図と一切関係がない','イントネーションは状況・意図と合わせて捉えます。'],
 ['相手が時刻を言ったが聞こえず「At five? ↗」と返した。何をしている？','聞いた時刻を確認している','五時に来ることを禁止している','五時より早く来ると約束している','上がる調子で、聞き取った内容を確認しています。'],
 ['「Really? ↗」と驚いて聞き返した。近い意図は？','本当か確かめたい','必ず反対だと断定したい','別れのあいさつをしたい','驚きながらの確認という状況です。'],
 ['「Monday ↗, Tuesday ↗, and Wednesday ↘」と列挙した。最後の曜日は？','Wednesday','Monday','Tuesday','この例では途中で続く調子、最後で終わる調子を示しています。'],
 ['矢印の ↗ / ↘ で調子を読む練習について、正しい説明は？','指定された例の調子を表し、全ての発話を一律には決めない','全ての疑問文は必ず ↗ になる','全ての平叙文は必ず ↘ になる','現実の調子は文脈や話し手の意図で変わります。']
 ];
 const prosody={id:'junior_prosodyKnowledge',title:'中学英語・音のつながりと伝える意図',stages:[0,1,2].map(s=>({title:['音のつながりと弱い音','文で強調する情報','調子と意図を読む'][s],items:knowledge.slice(s*8,s*8+8).map(([prompt,answer,b,c,hint],i)=>({id:`junior-prosody-${s}-${i}`,mode:'reading',topic:['connectedSpeech','sentenceStress','intonation'][s],prompt,fallbackPrompt:prompt,answer,choices:[answer,b,c],hint,audioText:'Read the question and choose the answer.',answerAudio:'Well done.'}))}))};
 return [sounds,prosody];
})();
if(typeof module!=='undefined')module.exports=JuniorSounds;
