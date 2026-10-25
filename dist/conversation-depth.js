/* Original dialogues; a single English utterance preserves turn order and cancellation. */
const ConversationDepth=(()=>{
 const stages=[
  [
   ['Hi, Tom. What time is lunch?\nAt twelve.\nTwelve? OK.\nSee you!','おひるごはんは なんじ？','🕛 12じ','🕚 11じ','🕐 1じ','At twelve.','Twelve'],
   ['Hello, Amy. What time is the game?\nAt three.\nGreat! See you at three.\nSee you!','しあいは なんじ？','🕒 3じ','🕑 2じ','🕓 4じ','At three.','Three'],
   ['Hi! Where is my bag?\nOn the chair.\nOh, here it is!\nGreat!','かばんは どこ？','🪑 いすの うえ','🛏️ ベッドの うえ','📦 はこの なか','On the chair.','On the chair'],
   ['Where is Ken?\nIn the park.\nIn the park?\nYes. He is playing.','ケンは どこ？','🌳 こうえん','🏫 がっこう','🏠 いえ','In the park.','In the park'],
   ['What do you have, May?\nI have a pencil.\nA pencil?\nYes. It is red.','メイが もっている ものは？','✏️ えんぴつ','📕 ほん','⚽ ボール','I have a pencil.','A pencil'],
   ['What is in your bag, Ben?\nAn apple.\nIs it for lunch?\nYes, it is.','ベンの かばんに ある ものは？','🍎 りんご','🍌 バナナ','🍊 オレンジ','An apple.','An apple'],
   ['Let us draw a cat.\nGood idea!\nDo you have paper?\nYes. Here you are.','ふたりは なにを する？','🖍️ ねこの えを かく','🎵 うたを うたう','📕 ほんを よむ','Let us draw a cat.','Draw a cat'],
   ['Let us play soccer.\nOK!\nDo you have a ball?\nYes, I do.','ふたりは なにを する？','⚽ サッカー','📕 どくしょ','🎵 うた','Let us play soccer.','Play soccer']
  ],
  [
   ['Can you come to my house on Saturday?\nYes. What time?\nAt ten in the morning.\nOK. See you at ten.','土曜日、家に行く時間は？','午前10時','午前9時','午後2時','At ten in the morning.','Ten in the morning'],
   ['When is your music lesson?\nOn Monday, at four.\nDo you play the piano?\nYes. I like it.','月曜日の音楽のレッスンは何時？','4時','3時','5時','On Monday, at four.','Four'],
   ['Where can we read this book?\nLet us go to the library.\nIs it near the school?\nYes. Let us walk there.','本を読むために行く場所は？','📚 図書館','🏊 プール','🏪 お店','Let us go to the library.','The library'],
   ['Where is the blue ball?\nIt is under the table.\nCan I use it?\nSure. Have fun!','青いボールがある場所は？','テーブルの下','テーブルの上','いすの上','It is under the table.','Under the table'],
   ['We have art today.\nWhat do I need?\nPlease bring your crayons.\nOK. They are in my bag.','図工のために持ってくる物は？','🖍️ クレヨン','⚽ ボール','🥄 スプーン','Please bring your crayons.','Crayons'],
   ['We are going to the park.\nIt is hot today.\nPlease bring water.\nOK. I have a bottle.','公園に持ってくるように言われた物は？','💧 水','📕 本','🎸 ギター','Please bring water.','Water'],
   ['What do you want to do after school?\nI want to read a book.\nCan I read with you?\nSure. Let us read together.','放課後、ふたりでする予定は？','本を読む','泳ぐ','料理する','Let us read together.','Read together'],
   ['What do you do on Sunday?\nI visit my grandma.\nDo you go by bus?\nYes. She lives near a park.','日曜日の予定は？','おばあさんを訪ねる','映画を見る','学校へ行く','I visit my grandma.','Visit my grandma']
  ],
  [
   ['Let us meet for tennis tomorrow.\nAt two?\nI have lunch with my family then. How about three?\nThree is good.\nLet us meet at the park.\nOK. See you there.','明日テニスのために会うと決めた時間は？','3時','2時','12時','Three is good.','Three'],
   ['What time does the movie start?\nAt eleven.\nLet us meet at ten thirty.\nGood idea. We can buy tickets.\nI will bring some money.\nGreat. See you tomorrow.','映画が始まる時間は？','11時','10時30分','12時','At eleven.','Eleven'],
   ['Let us play outside after lunch.\nBut it is raining.\nThen let us go to the gym.\nGood idea. We can play basketball there.\nDo you have a ball?\nYes, I do.','雨なので遊ぶことにした場所は？','体育館','校庭','図書館','Then let us go to the gym.','The gym'],
   ['Are we meeting at the station?\nNo. Let us meet at the school gate.\nOK. What time?\nAt nine.\nI will bring my camera.\nGreat. We can take pictures at the park.','集合する場所は？','学校の門','駅','公園の中','Let us meet at the school gate.','The school gate'],
   ['We are going swimming tomorrow.\nDo I need a ball?\nNo. Please bring a towel.\nOK. A big towel?\nYes. Put it in your bag.\nAll right.','明日の水泳に持ってくるように言われた物は？','タオル','ボール','絵の具','Please bring a towel.','A towel'],
   ['We will draw flowers in the park.\nDo I need a notebook?\nNo. I have paper for everyone. Bring a pencil.\nOK. Can I bring an eraser too?\nYes, of course.\nGreat. I am ready.','みんなに用意されている紙のほかに、持ってくるように言われた物は？','えんぴつ','ノート','ボール','Bring a pencil.','A pencil'],
   ['Do you want to play a game after lunch?\nI want to make a card for my sister first.\nCan I help?\nYes. Please draw a flower.\nOK. Then we can play.\nThank you.','ゲームより先にふたりですることは？','カードを作る','昼ごはんを作る','花を買う','I want to make a card for my sister first.','Make a card'],
   ['What will you do on Saturday?\nI will clean the park with my friends.\nWill you play soccer there?\nNot this Saturday. We will pick up trash.\nCan I come too?\nYes. Thank you!','今度の土曜日に公園ですることは？','ごみを拾う','サッカーをする','木を植える','We will pick up trash.','Pick up trash']
  ],
  [
   ['We need to plan our trip on Sunday.\nThe bus leaves at nine thirty.\nThen let us meet at nine.\nIs that too early?\nNo. We need time to buy tickets.\nOK. Nine at the station.\nI will bring the map.\nThank you. I will bring water.','日曜日の集合時間は？','9時','9時30分','10時','OK. Nine at the station.','Nine'],
   ['When is the school concert?\nIt starts at two on Friday.\nWhat time should we come?\nPlease come at one thirty.\nCan my brother come too?\nYes. Everyone is welcome.\nGreat. He likes music.\nSee you on Friday.','コンサートを見に来るように言われた時間は？','1時30分','2時','2時30分','Please come at one thirty.','One thirty'],
   ['Let us have a picnic on Saturday.\nThe park near the station is very busy.\nHow about the park by the river?\nGood idea. It has big trees.\nLet us meet there at eleven.\nOK. I will bring sandwiches.\nI will bring juice.\nGreat. See you by the river.','ピクニックをすることにした場所は？','川のそばの公園','駅のそばの公園','学校の教室','How about the park by the river?','The park by the river'],
   ['Where is our art club today?\nWe usually use the art room.\nYes, but they are cleaning it today.\nThen where should we go?\nRoom five, next to the library.\nOK. Do we need paint?\nNo. We will make paper animals.\nThat sounds fun.','今日の図工クラブの場所は？','5番の教室','図工室','図書館の中','Room five, next to the library.','Room five'],
   ['Are you ready for our lunch in the park?\nI have the sandwiches. What do you have?\nI have cups and juice.\nDo we need anything else?\nYes. Please bring a bag for our trash.\nOK. I will put one in my backpack.\nThank you. We should keep the park clean.\nYes, we should.','会話の最後に追加で持ってくると決めた物は？','ごみを入れる袋','ジュース','サンドイッチ','Please bring a bag for our trash.','A bag for our trash'],
   ['We will watch birds tomorrow morning.\nCan I bring my camera?\nYes, but please turn off the sound.\nOK. What else do I need?\nBring a notebook to write the names of the birds.\nDo I need food for the birds?\nNo. We will just watch them.\nAll right. I will bring my notebook.','鳥の名前を書くために必要な物は？','ノート','鳥のえさ','タオル','Bring a notebook to write the names of the birds.','A notebook'],
   ['What will we do for the class party?\nWe can sing and play games.\nWhich will we do first?\nLet us sing first. Then we can play games.\nWhen will we give the cards to our teacher?\nAfter the games.\nOK. I will get the cards ready.\nThank you. It will be fun.','ゲームの後にする予定は？','先生にカードを渡す','最初の歌を歌う','カードを買いに行く','After the games.','Give the cards to our teacher'],
   ['Are we going to the zoo on Sunday?\nYes, if it is sunny.\nWhat will we do if it rains?\nWe will visit the museum.\nThe weather report says rain for Sunday.\nThen let us plan for the museum.\nI want to see the old toys there.\nMe too. Let us take the bus.','天気予報を聞いて決めた日曜日の予定は？','博物館に行く','動物園に行く','家で寝る','Then let us plan for the museum.','Visit the museum']
  ]
 ];
 return {id:'enConversationDepth',title:'会話から情報を聞き取る',stages:stages.map((rows,s)=>({title:['みじかい会話と絵','時間・場所・持ち物','会話の中で決めたこと','予定と理由を聞き分ける'][s],items:rows.map(([audioText,question,answer,o1,o2,evidence,answerAudio],i)=>({id:`conversation-depth-${s}-${i}`,mode:'listen',requiresAudio:true,fallbackSkillId:'enConversationDepthReading',prompt:'会話をきいて えらぼう。\n'+question,audioText,answer,answerAudio,choices:[answer,o1,o2],evidence,fallbackPrompt:audioText+'\n\n'+question,hint:'会話の「'+evidence+'」が手がかりです。'}))}))};
})();
if(typeof module!=='undefined')module.exports=ConversationDepth;
