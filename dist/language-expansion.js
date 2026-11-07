/* Original early-language additions. Existing stages, bounds and saved records remain intact. */
(function(root){
 'use strict';
 const items=[
 {
  "id": "language-p5-letters-1-01",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🍇",
   "ぶどう",
   "りんご|ばなな|もも",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-02",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🍑",
   "もも",
   "ぶどう|いちご|すいか",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-03",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🍒",
   "さくらんぼ",
   "りんご|ばなな|みかん",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-04",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🍆",
   "なす",
   "にんじん|とまと|きゅうり",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-05",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🍅",
   "とまと",
   "にんじん|なす|きゃべつ",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-06",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🌽",
   "とうもろこし",
   "だいこん|なす|とまと",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-07",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🚲",
   "じてんしゃ",
   "くるま|ふね|ひこうき",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-08",
  "skill": "letters",
  "stage": 1,
  "row": [
   "✂️",
   "はさみ",
   "えんぴつ|のり|かさ",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-09",
  "skill": "letters",
  "stage": 1,
  "row": [
   "✏️",
   "えんぴつ",
   "はさみ|くつ|ぼうし",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-10",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🥚",
   "たまご",
   "りんご|ぶどう|にんじん",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-11",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🐙",
   "たこ",
   "いぬ|ねこ|うま",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-1-12",
  "skill": "letters",
  "stage": 1,
  "row": [
   "🦋",
   "ちょう",
   "かめ|いぬ|うし",
   "えに あう ことばを、ひとつずつ よんで さがそう。"
  ]
 },
 {
  "id": "language-p5-letters-2-01",
  "skill": "letters",
  "stage": 2,
  "row": [
   "ぶど□（つぶが たくさん ついた くだもの）",
   "う",
   "あ|い|え",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-02",
  "skill": "letters",
  "stage": 2,
  "row": [
   "も□（ピンクいろの あまい くだもの）",
   "も",
   "ま|み|む",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-03",
  "skill": "letters",
  "stage": 2,
  "row": [
   "な□（むらさきいろの やさい）",
   "す",
   "さ|し|せ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-04",
  "skill": "letters",
  "stage": 2,
  "row": [
   "とま□（あかくて まるい やさい）",
   "と",
   "た|ち|つ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-05",
  "skill": "letters",
  "stage": 2,
  "row": [
   "はさ□（かみを きる どうぐ）",
   "み",
   "ま|む|め",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-06",
  "skill": "letters",
  "stage": 2,
  "row": [
   "つく□（ものを のせて べんきょうするよ）",
   "え",
   "あ|い|う",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-07",
  "skill": "letters",
  "stage": 2,
  "row": [
   "く□（あしに はいて そとを あるくよ）",
   "つ",
   "た|ち|て",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-08",
  "skill": "letters",
  "stage": 2,
  "row": [
   "かば□（ものを いれて もちあるくよ）",
   "ん",
   "な|に|ぬ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-09",
  "skill": "letters",
  "stage": 2,
  "row": [
   "どんぐ□（かたい きの み。あきに ひろうよ）",
   "り",
   "ら|る|れ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-10",
  "skill": "letters",
  "stage": 2,
  "row": [
   "きり□（くびの ながい どうぶつ）",
   "ん",
   "な|に|ぬ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-11",
  "skill": "letters",
  "stage": 2,
  "row": [
   "みか□（オレンジいろの かわを むく くだもの）",
   "ん",
   "な|に|ぬ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-letters-2-12",
  "skill": "letters",
  "stage": 2,
  "row": [
   "おにぎ□（ごはんを にぎって つくるよ）",
   "り",
   "ら|る|れ",
   "かっこの ことばを てがかりに、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-words-0-01",
  "skill": "words",
  "stage": 0,
  "row": [
   "ほんが あつい",
   "ほんが うすい",
   "ほんが おもい|ほんが あたらしい",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-02",
  "skill": "words",
  "stage": 0,
  "row": [
   "いけが ふかい",
   "いけが あさい",
   "いけが つめたい|いけが きれい",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-03",
  "skill": "words",
  "stage": 0,
  "row": [
   "へやが きれい",
   "へやが きたない",
   "へやが ひろい|へやが あかるい",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-04",
  "skill": "words",
  "stage": 0,
  "row": [
   "しずか",
   "にぎやか",
   "あたらしい|まるい",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-05",
  "skill": "words",
  "stage": 0,
  "row": [
   "すき",
   "きらい",
   "ながい|ひろい",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-06",
  "skill": "words",
  "stage": 0,
  "row": [
   "はいる",
   "でる",
   "よむ|かく",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-07",
  "skill": "words",
  "stage": 0,
  "row": [
   "のぼる",
   "おりる",
   "たべる|のむ",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-08",
  "skill": "words",
  "stage": 0,
  "row": [
   "おす",
   "ひく",
   "きく|みる",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-09",
  "skill": "words",
  "stage": 0,
  "row": [
   "かつ",
   "まける",
   "きる|はく",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-10",
  "skill": "words",
  "stage": 0,
  "row": [
   "おきる",
   "ねる",
   "たべる|はしる",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-11",
  "skill": "words",
  "stage": 0,
  "row": [
   "ふえる",
   "へる",
   "ひかる|ぬれる",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-0-12",
  "skill": "words",
  "stage": 0,
  "row": [
   "あかりを つける",
   "あかりを けす",
   "あかりを みる|あかりを さがす",
   "くらべたときに、はんたいの いみになる ことばを さがそう。"
  ]
 },
 {
  "id": "language-p5-words-1-01",
  "skill": "words",
  "stage": 1,
  "row": [
   "ピアノの けんばんを おして □。",
   "ひく",
   "のむ|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-02",
  "skill": "words",
  "stage": 1,
  "row": [
   "ふえを くちに あてて □。",
   "ふく",
   "かぶる|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-03",
  "skill": "words",
  "stage": 1,
  "row": [
   "うたを こえに だして □。",
   "うたう",
   "ぬぐ|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-04",
  "skill": "words",
  "stage": 1,
  "row": [
   "ボールを あしで □。",
   "ける",
   "のむ|きる",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-05",
  "skill": "words",
  "stage": 1,
  "row": [
   "じてんしゃの ペダルを あしで □。",
   "こぐ",
   "のむ|よむ",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-06",
  "skill": "words",
  "stage": 1,
  "row": [
   "プールで てと あしを うごかして □。",
   "およぐ",
   "かぶる|よむ",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-07",
  "skill": "words",
  "stage": 1,
  "row": [
   "ひもを ちょうちょの かたちに □。",
   "むすぶ",
   "のむ|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-08",
  "skill": "words",
  "stage": 1,
  "row": [
   "ぬれた タオルを ひねって □。",
   "しぼる",
   "かぶる|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-09",
  "skill": "words",
  "stage": 1,
  "row": [
   "ふくを しかくく □。",
   "たたむ",
   "のむ|さす",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-10",
  "skill": "words",
  "stage": 1,
  "row": [
   "あそびおわった つみきを はこに □。",
   "しまう",
   "のむ|きる",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-11",
  "skill": "words",
  "stage": 1,
  "row": [
   "シャボンだまを つくるために、いきを そっと □。",
   "ふく",
   "のむ|よむ",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-12",
  "skill": "words",
  "stage": 1,
  "row": [
   "はなに じょうろで みずを □。",
   "あげる",
   "かぶる|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-13",
  "skill": "words",
  "stage": 1,
  "row": [
   "ボタンを おして、でんきの あかりを □。",
   "つける",
   "たべる|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-words-1-14",
  "skill": "words",
  "stage": 1,
  "row": [
   "てに もった コップを、つくえの うえに □。",
   "おく",
   "かぶる|はく",
   "なにを どうするのか、つなげて よんでみよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-01",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "こっぷ",
   "コップ",
   "コート|コアラ|コマ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-02",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "りぼん",
   "リボン",
   "リンゴ|リス|リズム",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-03",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "ばけつ",
   "バケツ",
   "バナナ|バター|バス",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-04",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "ぼたん",
   "ボタン",
   "ボール|ボート|ボウシ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-05",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "とんねる",
   "トンネル",
   "トマト|トラック|トイレ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-06",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "はんかち",
   "ハンカチ",
   "ハサミ|ハブラシ|ハコ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-07",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "のーと",
   "ノート",
   "ノリ|ネコ|ネクタイ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-08",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "じゅーす",
   "ジュース",
   "ジャム|ジャンプ|ジョウロ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-09",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "みるく",
   "ミルク",
   "ミカン|ミシン|ミズ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-10",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "ぷりん",
   "プリン",
   "パン|プール|ピアノ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-11",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "すかーと",
   "スカート",
   "スプーン|スキー|スイカ",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-katakana-0-12",
  "skill": "katakana",
  "stage": 0,
  "row": [
   "くれよん",
   "クレヨン",
   "クルマ|クツ|クッキー",
   "ひらがなと カタカナを、ひとつずつ くらべよう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-01",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "はし□ ごはんを たべます。",
   "で",
   "を|へ|が",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-02",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "バス□ のって、がっこうへ いきます。",
   "に",
   "を|が|の",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-03",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "ねる まえ□ はを みがきます。",
   "に",
   "を|と|の",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-04",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "とけい□ はりが うごいています。",
   "の",
   "を|へ|で",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-05",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "ふね□ みなとを でました。",
   "が",
   "を|に|の",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-06",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "あさ□ よるまで あめでした。",
   "から",
   "の|を|へ",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-07",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "ともだち□ てがみを もらいました。",
   "から",
   "を|へ|で",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-08",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "つくえ□ ほんだなの あいだに たちます。",
   "と",
   "を|が|へ",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-09",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "かばんは つくえ□ したに あります。",
   "の",
   "を|が|へ",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-10",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "みず□ こおりました。",
   "が",
   "を|へ|の",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-11",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "くつ□ ぬいでから あがります。",
   "を",
   "に|が|と",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-0-12",
  "skill": "sentence",
  "stage": 0,
  "row": [
   "えきから みなと□ バスで いきます。",
   "まで",
   "を|と|の",
   "ことばを つなげて、ぶんに あう ものを えらぼう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-01",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "はるは ゆいに しゃしんを とって もらいました。しゃしんを とったのは？",
   "ゆい",
   "はる|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-02",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "まいが こうを ほめました。ほめられたのは？",
   "こう",
   "まい|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-03",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "りすは うさぎの ために ケーキを やきました。ケーキを やいたのは？",
   "りす",
   "うさぎ|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-04",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "あきは れんに おもちゃを なおして もらいました。おもちゃを なおしたのは？",
   "れん",
   "あき|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-05",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "おとうさんが いもうとの かみを とかしました。かみを とかして もらったのは？",
   "いもうと",
   "おとうさん|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-06",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "そらは はるの こぼした みずを ふきました。みずを ふいたのは？",
   "そら",
   "はる|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-07",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "ねこが いぬに じゃんけんで かちました。じゃんけんに まけたのは？",
   "いぬ",
   "ねこ|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-08",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "くまが りすより さきに ゴールしました。あとに ゴールしたのは？",
   "りす",
   "くま|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-09",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "ゆいが りなの おとした ハンカチを ひろいました。ハンカチを おとしたのは？",
   "りな",
   "ゆい|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-10",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "あきは そらの かいた えに いろを ぬりました。えを かいたのは？",
   "そら",
   "あき|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-11",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "うさぎが くまに おれいを いいました。おれいを いわれたのは？",
   "くま",
   "うさぎ|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-12",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "まいは こうに あやまって、こうは まいを ゆるしました。あやまったのは？",
   "まい",
   "こう|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-13",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "はるが れんの かわりに つくえを はこびました。つくえを はこんだのは？",
   "はる",
   "れん|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-sentence-2-14",
  "skill": "sentence",
  "stage": 2,
  "row": [
   "りなは ゆいの うたに あわせて ピアノを ひきました。うたったのは？",
   "ゆい",
   "りな|ふたりとも",
   "だれが なにを したか、つなげて よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-01",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「。」という きごうの なまえは？",
   "くてん",
   "とうてん|かぎかっこ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-02",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「、」という きごうの なまえは？",
   "とうてん",
   "くてん|かぎかっこ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-03",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "ぶんの おわりに くてんが あるのは？",
   "ほしが ひかる。",
   "ほしが ひかる、|ほしが ひかる「",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-04",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "とうてんを つかって いるのは？",
   "はい、いきます。",
   "いきます。|「いきます」",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-05",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "かぎかっこで かこんで あるのは？",
   "「どうぞ」",
   "どうぞ。|どうぞ、",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-06",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「おひさまが でた。」くてんは いくつ？",
   "ひとつ",
   "ふたつ|みっつ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-07",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「もも、なし、くり」とうてんは いくつ？",
   "ふたつ",
   "ひとつ|みっつ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-08",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「てを あらう。はを みがく。ふくを きる。」くてんは いくつ？",
   "みっつ",
   "ひとつ|ふたつ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-09",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「ゆうがた、うちに かえります。」の「、」は、どこに ある？",
   "ぶんの とちゅう",
   "ぶんの おわり|ぶんの はじめ",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-10",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「くつを そろえます。」の「。」は、どこに ある？",
   "ぶんの おわり",
   "ぶんの はじめ|ぶんの とちゅう",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-11",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「こんにちは」の、はじめと おわりに ある きごうは？",
   "かぎかっこ",
   "くてん|とうてん",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-12",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "はるは「ぼくも いくよ」と いいました。はるが はなした ことばは？",
   "ぼくも いくよ",
   "はるは|と いいました",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-13",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「あか、あお、きいろ。」とうてんと くてんが どちらも ある？",
   "どちらも ある",
   "くてんだけ ある|とうてんだけ ある",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-0-14",
  "skill": "jp_punctuation",
  "stage": 0,
  "row": [
   "「おやすみ」と いいました。とじる かぎかっこの すぐ まえの もじは？",
   "み",
   "と|ま",
   "きごうの かたちと ばしょを、ひとつずつ たしかめよう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-01",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「かみを おる。いろを ぬる。かざる。」ふたつめの ぶんは？",
   "いろを ぬる。",
   "かみを おる。|かざる。",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-02",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「へやに はいる。かばんを おく。てを あらう。」さいごの ぶんは？",
   "てを あらう。",
   "へやに はいる。|かばんを おく。",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-03",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「あめだ。でも、さんぽに いく。」さいしょの くてんまでの ぶんは？",
   "あめだ。",
   "でも、さんぽに いく。|あめだ。でも、",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-04",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「はい、そうです。」くてんで おわる ぶんは いくつ？",
   "ひとつ",
   "ふたつ|みっつ",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-05",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「ほんを よむ、えを かく。」の とうてんを くてんに なおしたものは？",
   "ほんを よむ。えを かく。",
   "ほんを よむ、えを かく。|ほんを よむ えを かく。",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-06",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「えんぴつ、けしゴム、ノートを いれる。」とうてんで くぎって いるのは？",
   "いれる ものの なまえ",
   "いれる ひとの なまえ|いれる ばしょ",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-07",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「どようび、にちようびは やすみです。」とうてんで くぎって いるのは？",
   "やすみの ひ",
   "やすむ ひと|やすむ ばしょ",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-08",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「つめたいので、てを はなした。」とうてんより まえに あるのは？",
   "てを はなした わけ",
   "てを はなした ひと|てを はなした じこく",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-09",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「バスが きたので、ならんだ。」とうてんより あとに あるのは？",
   "した こと",
   "ならんだ わけ|ならんだ ひとの なまえ",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-10",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「さきに てを あらい、それから ごはんを たべた。」とうてんより まえに かかれているのは？",
   "てを あらう",
   "ごはんを たべる|ごはんを つくる",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-11",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "ゆいは「まって」と いい、れんは「いいよ」と いいました。れんの ことばは？",
   "いいよ",
   "まって|まって いいよ",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-12",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「ぼくは さきに かえる」と はるが いいました。はなした ひとは？",
   "はる",
   "ぼくは|さきに",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-13",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "おかあさんは「あとで」と いいました。かぎかっこの そとは？",
   "おかあさんは・と いいました。",
   "あとで|あ・と・で",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 },
 {
  "id": "language-p5-jp_punctuation-1-14",
  "skill": "jp_punctuation",
  "stage": 1,
  "row": [
   "「すきな いろは あかです。あおも すきです。」くてんで ふたつに わけた あとの ふたつめは？",
   "あおも すきです。",
   "すきな いろは あかです。|あかです。あおも",
   "くてん・とうてん・かぎかっこで、どこが くぎられて いるかを よもう。"
  ]
 }
];
 const api={version:1,items};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 root.LanguageExpansion=api;
 for(const item of items){
  const def=Practice.defs.find(d=>d.id===item.skill),bank=JP_BANK[def.courses[item.stage]-JP_START];
  if(!bank.some(row=>row[0]===item.row[0]&&row[1]===item.row[1]))bank.push(item.row.slice());
 }
})(typeof globalThis==='object'?globalThis:this);
