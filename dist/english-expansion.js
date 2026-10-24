/* Original choice-based practice. Audio availability must be checked by the caller.
 * When falling back, use fallbackPrompt AND record fallbackSkillId, never audio mastery.
 * Do not display target/audioText before an audio question has been answered.
 */
const ENGLISH_EXTENSION_SKILLS = (() => {
  const listen = (word, meaning, other1, other2) => ({
    prompt: '音声を聞いて、聞こえたことばの意味をえらぼう。',
    target: word, audioText: word, answer: meaning, choices: [meaning, other1, other2],
    fallbackPrompt: `読む練習：${word} の意味をえらぼう。`,
    hint: `${word} は「${meaning}」という意味です。`
  });
  const spell = (word, meaning, other1, other2) => ({
    prompt: `音声を聞いて、「${meaning}」の正しいつづりをえらぼう。`,
    target: word, audioText: word, answer: word, choices: [word, other1, other2],
    fallbackPrompt: `読む練習（意味からつづり）：「${meaning}」の正しい英語をえらぼう。`,
    hint: `「${meaning}」は ${word} と書きます。`
  });
  const dialog = (context, question, answer, other1, other2, hint) => ({
    prompt: `${context}\n相手のことばに合う返事をえらぼう：${question}`,
    context, target: question, audioText: question, answer, choices: [answer, other1, other2],
    fallbackPrompt: `読む練習：${context}\n${question} に合う返事をえらぼう。`, hint
  });
  const stage = (title, rows, make) => ({title, items: rows.map(row => make(...row))});
  const skills = [
    {id: 'enListening', title: '英語・音と意味', mode: 'listen', stages: [
      stage('はじめとおわりの音', [
        ['cat','ねこ','帽子','ねずみ'], ['hat','帽子','ねこ','コウモリ'],
        ['pig','ぶた','大きい','かばん'], ['pen','ペン','めんどり','十'],
        ['rice','米','ねずみ','氷'], ['coat','コート','やぎ','船']
      ], listen),
      stage('母音と子音のちがい', [
        ['ship','船','ひつじ','店'], ['sheep','ひつじ','船','眠る'],
        ['bed','ベッド','悪い','鳥'], ['bag','かばん','虫','背中'],
        ['light','光','右','夜'], ['night','夜','九','光']
      ], listen),
      stage('短いまとまりを聞く', [
        ['a red cap','赤いぼうし','赤いねこ','赤いカップ'],
        ['three trees','三本の木','三つの列車','三つのチーズ'],
        ['a small boat','小さな船','小さなコート','小さなやぎ'],
        ['four feet','四つの足','四つの魚','四つの食べ物'],
        ['a long road','長い道','長い列','長いロープ'],
        ['a blue chair','青いいす','青いチーズ','青いシャツ']
      ], listen)
    ]},
    {id: 'enSpelling', title: '英語・つづり', mode: 'spell', stages: [
      stage('短い単語', [
        ['dog','犬','dgo','doog'], ['sun','太陽','snu','sunn'],
        ['fish','魚','fihs','fissh'], ['book','本','bok','boook'],
        ['milk','牛乳','mikl','miilk'], ['desk','机','desck','deks']
      ], spell),
      stage('身近な単語のつづり', [
        ['apple','りんご','aple','appel'], ['school','学校','scool','shcool'],
        ['friend','友だち','freind','frend'], ['yellow','黄色','yelow','yellwo'],
        ['mother','母','mothre','motther'], ['window','窓','windwo','windoow']
      ], spell),
      stage('少し長い単語', [
        ['beautiful','美しい','beautifull','beutiful'], ['Wednesday','水曜日','Wendesday','Wensday'],
        ['vegetable','野菜','vegtable','vegetabel'], ['breakfast','朝食','brekfast','breakfest'],
        ['library','図書館','libary','libraly'], ['favorite','お気に入りの','favrite','faverite']
      ], spell)
    ]},
    {id: 'enSocialDialog', title: '英語・あいさつとやりとり', mode: 'dialog', stages: [
      stage('あいさつとお礼', [
        ['朝、友だちと会いました。','Good morning!','Good morning!','Good night!','You are welcome.','朝のあいさつには Good morning! と返します。'],
        ['寝る前に家族に声をかけられました。','Good night!','Good night!','Good morning!','Nice to meet you.','寝る前のあいさつは Good night! です。'],
        ['貸したえんぴつを返してもらい、お礼を言われました。','Thank you.','You are welcome.','I am ten.','It is blue.','お礼への返事は You are welcome. です。'],
        ['初めて会う相手とあいさつしています。','Nice to meet you.','Nice to meet you, too.','It is Monday.','I want milk.','初対面のあいさつに too を付けて返せます。'],
        ['帰り道で友だちと別れます。','See you tomorrow!','See you!','I like apples.','It is on the desk.','See you! は別れるときのあいさつです。'],
        ['友だちが元気かたずねました。元気だと答えましょう。','How are you?','I am fine, thank you.','I am eleven.','It is sunny.','How are you? は元気かどうかをたずねます。']
      ], dialog),
      stage('好きなものとほしいもの', [
        ['好きな果物はりんごです。','What fruit do you like?','I like apples.','I am an apple.','I play soccer.','好きな果物を I like ... で答えます。'],
        ['サッカーが好きです。','Do you like soccer?','Yes, I do.','Yes, it is.','Yes, I am.','Do you ...? には Yes, I do. と答えます。'],
        ['コーヒーは好きではありません。','Do you like coffee?','No, I do not.','No, I am not.','No, it is not.','好きではないので No, I do not. と答えます。'],
        ['飲みたいものは水です。','What do you want to drink?','I want water.','I want a pencil.','I like running.','drink は飲むこと。水をほしいと伝えます。'],
        ['青が好きです。','What color do you like?','I like blue.','I like bread.','It is Tuesday.','color は色なので blue を選びます。'],
        ['誕生日には本がほしいです。','What do you want for your birthday?','I want a book.','I am a book.','It is a library.','ほしいものを I want ... で伝えます。']
      ], dialog),
      stage('たのむ・すすめる', [
        ['消しゴムを借りたいと頼まれました。貸すことにします。','May I use your eraser?','Sure. Here you are.','I am seven.','It is rainy.','貸すときは Sure. Here you are. と言えます。'],
        ['ジュースをすすめられました。飲みたいので受け取ります。','Would you like some juice?','Yes, please.','No, thank you.','I am from Japan.','すすめられたものを受け取るときは Yes, please. です。'],
        ['ケーキをすすめられました。おなかがいっぱいなので断ります。','Would you like some cake?','No, thank you.','Yes, please.','It is my cake.','ていねいに断るときは No, thank you. です。'],
        ['相手のことばが聞こえませんでした。もう一度お願いしましょう。','Please open your book.','One more time, please.','I am a book.','It is eight o’clock.','One more time, please. で繰り返しをお願いできます。'],
        ['友だちが遊びにさそいました。いっしょに遊びたいです。','Let’s play outside.','Yes, let’s!','It is under the chair.','I have two brothers.','さそいに賛成するときは Yes, let’s! と答えます。'],
        ['買い物でほしいものをたずねられました。パンを一つ買います。','Can I help you?','One bread roll, please.','I can swim.','I am at school.','買い物ではほしい品物と please を伝えられます。']
      ], dialog)
    ]},
    {id: 'enInformationDialog', title: '英語・たずねるやりとり', mode: 'dialog', stages: [
      stage('名前・数・ようす', [
        ['名前はアキです。','What is your name?','My name is Aki.','I am ten.','It is a pen.','名前を My name is ... で伝えます。'],
        ['年齢は十歳です。','How old are you?','I am ten.','I have ten pencils.','It is ten o’clock.','How old は年齢をたずねます。'],
        ['えんぴつを三本持っています。','How many pencils do you have?','I have three.','I am three.','It is three o’clock.','How many は個数をたずねます。'],
        ['今日の天気は晴れです。','How is the weather?','It is sunny.','It is Sunday.','It is summer.','天気をたずねているので sunny と答えます。'],
        ['相手が指したものは自分のかばんです。','Whose bag is this?','It is my bag.','It is a big bag.','It is in the bag.','Whose はだれのものかをたずねます。'],
        ['泳ぐことができます。','Can you swim?','Yes, I can.','Yes, I do.','Yes, it is.','Can you ...? には Yes, I can. と答えます。']
      ], dialog),
      stage('場所を伝える', [
        ['本は机の上にあります。','Where is the book?','It is on the desk.','It is a red book.','It is my book.','Where は場所をたずねます。on は上です。'],
        ['ねこはいすの下にいます。','Where is the cat?','It is under the chair.','It is a small cat.','It is white.','under は下です。'],
        ['駅へ行きたいです。','Where do you want to go?','I want to go to the station.','I want to eat lunch.','I want a new pen.','行きたい場所を go to ... で伝えます。'],
        ['出身は日本です。','Where are you from?','I am from Japan.','I am in the park.','I am twelve.','Where are you from? は出身をたずねます。'],
        ['図書館は公園のとなりにあります。','Where is the library?','It is next to the park.','It is a quiet library.','I like reading.','next to はとなりです。'],
        ['教室への道を案内します。まっすぐ進むと着きます。','How can I get to the classroom?','Go straight.','It is my classroom.','I study English.','道順をたずねられたので Go straight. と案内します。']
      ], dialog),
      stage('時刻・予定・理由', [
        ['時計は七時を指しています。','What time is it?','It is seven o’clock.','It is Saturday.','I am seven.','What time は時刻をたずねます。'],
        ['六時に起きます。','What time do you get up?','I get up at six.','I have six books.','I am six.','起きる時刻を at six で伝えます。'],
        ['誕生日は五月です。','When is your birthday?','It is in May.','It is on the table.','I want a cake.','When はいつかをたずねます。月には in を使います。'],
        ['日曜日にはテニスをします。','What do you do on Sundays?','I play tennis.','It is Sunday.','I have a tennis ball.','日曜日にすることを答えます。'],
        ['冬が好きなのは雪で遊べるからです。','Why do you like winter?','Because I can play in the snow.','It is in December.','I like summer, too.','Why は理由をたずねるので Because ... で答えます。'],
        ['明日は祖母に会いに行く予定です。','What are you going to do tomorrow?','I am going to visit my grandmother.','I visited her yesterday.','I am visiting her now.','tomorrow は明日。これからの予定を答えます。']
      ], dialog)
    ]}
  ];
  for (const skill of skills) {
    skill.fallbackSkillId = `${skill.id}Reading`;
    skill.stages.forEach((s, stageIndex) => s.items.forEach((item, index) => {
      item.id = `${skill.id}-${stageIndex + 1}-${index + 1}`;
      item.mode = skill.mode;
      item.fallbackMode = 'reading';
      item.requiresAudio = skill.mode !== 'dialog';
      item.fallbackSkillId = skill.fallbackSkillId;
    }));
  }
  return skills;
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ENGLISH_EXTENSION_SKILLS;
