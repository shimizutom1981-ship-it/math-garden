/* Original Japanese glosses. One canonical spelling per headword; inflections are not extra entries. */
const VOCABULARY_GROUPS=[
['family','人・家族',`person|人;people|人々;family|家族;parent|親;father|父;mother|母;brother|兄・弟;sister|姉・妹;grandfather|祖父;grandmother|祖母;uncle|おじ;aunt|おば;cousin|いとこ;child|子ども;baby|赤ちゃん;boy|男の子;girl|女の子;man|男性;woman|女性;friend|友だち;neighbor|近所の人;guest|お客さん;adult|大人;team|チーム;member|メンバー`],
['body','体・健康',`body|体;head|頭;face|顔;hair|髪;eye|目;ear|耳;nose|鼻;mouth|口;tooth|歯;tongue|舌;neck|首;shoulder|肩;arm|腕;hand|手;finger|指;leg|脚;knee|ひざ;foot|足;toe|足の指;back|背中;stomach|おなか;heart|心臓;health|健康;medicine|薬;fever|熱（体温）`],
['feelings','気持ち',`happy|うれしい;sad|悲しい;angry|怒っている;scared|こわがっている;excited|わくわくしている;tired|疲れている;sleepy|眠い;hungry|おなかがすいた;thirsty|のどがかわいた;worried|心配している;surprised|驚いている;lonely|さびしい;proud|誇らしい;nervous|緊張している;calm|落ち着いた;kind|親切な;friendly|親しみやすい;brave|勇敢な;shy|恥ずかしがりの;careful|注意深い;honest|正直な;polite|礼儀正しい;patient|がまん強い;glad|うれしく思う;bored|退屈している`],
['animals','動物',`animal|動物;cat|ねこ;dog|犬;rabbit|うさぎ;bear|くま;elephant|ぞう;fish|魚;bird|鳥;frog|かえる;lion|ライオン;tiger|とら;monkey|さる;giraffe|きりん;zebra|しまうま;panda|パンダ;horse|馬;cow|牛;pig|ぶた;sheep|羊;goat|やぎ;duck|あひる;chicken|にわとり;mouse|ねずみ;turtle|かめ;whale|くじら`],
['nature','自然・生き物',`nature|自然;tree|木;flower|花;leaf|葉;grass|草;seed|種;plant|植物;forest|森林;mountain|山;river|川;lake|湖;sea|海;ocean|大洋;beach|浜辺;island|島;sky|空;sun|太陽;moon|月;star|星;cloud|雲;rainbow|虹;butterfly|ちょう;bee|はち;ant|あり;spider|くも（虫）`],
['produce','くだもの・野菜',`apple|りんご;banana|バナナ;grape|ぶどう;strawberry|いちご;orange|オレンジ;peach|もも;pear|洋なし;melon|メロン;watermelon|すいか;lemon|レモン;pineapple|パイナップル;cherry|さくらんぼ;kiwi|キウイ;fruit|くだもの;vegetable|野菜;tomato|トマト;potato|じゃがいも;carrot|にんじん;onion|たまねぎ;cabbage|キャベツ;lettuce|レタス;cucumber|きゅうり;corn|とうもろこし;pumpkin|かぼちゃ;bean|豆`],
['food','食べ物・飲み物',`food|食べ物;rice|米・ごはん;bread|パン;cake|ケーキ;egg|卵;meat|肉;beef|牛肉;pork|豚肉;cheese|チーズ;butter|バター;soup|スープ;salad|サラダ;noodle|めん;pizza|ピザ;sandwich|サンドイッチ;hamburger|ハンバーガー;cookie|クッキー;chocolate|チョコレート;candy|あめ（お菓子）;milk|牛乳;water|水;juice|ジュース;tea|お茶;salt|塩;sugar|砂糖`],
['home','家の中',`home|自宅;house|家（建物）;room|部屋;door|ドア;window|窓;wall|壁;floor|床;roof|屋根;kitchen|台所;bathroom|浴室・トイレ;bedroom|寝室;bed|ベッド;chair|いす;table|テーブル;desk|机;sofa|ソファ;lamp|ランプ;clock|時計;mirror|鏡;refrigerator|冷蔵庫;oven|オーブン;cup|カップ;plate|皿;spoon|スプーン;fork|フォーク`],
['school','学校・文房具',`school|学校;classroom|教室;class|クラス;lesson|授業;teacher|先生;student|生徒;book|本;notebook|ノート;pencil|えんぴつ;pen|ペン;eraser|消しゴム;ruler|定規;paper|紙;scissors|はさみ;glue|のり;crayon|クレヨン;bag|かばん;backpack|背負うかばん;dictionary|辞書;homework|宿題;test|テスト;question|質問;answer|答え;library|図書館;blackboard|黒板`],
['clothes','服・持ち物',`clothes|衣服;shirt|シャツ;skirt|スカート;dress|ワンピース;coat|コート;jacket|上着;sweater|セーター;cap|つばのある帽子;hat|帽子;shoe|くつ;sock|くつ下;boot|ブーツ;glove|手袋;scarf|マフラー;uniform|制服;pocket|ポケット;button|ボタン;belt|ベルト;umbrella|傘;watch|腕時計;wallet|財布;towel|タオル;handkerchief|ハンカチ;glasses|めがね;mask|マスク`],
['colors','色・形',`color|色;red|赤い;blue|青い;green|緑の;yellow|黄色の;pink|ピンクの;purple|紫の;black|黒い;white|白い;brown|茶色の;gray|灰色の;gold|金;silver|銀;shape|形;circle|円;square|正方形;triangle|三角形;rectangle|長方形;line|線;point|点;side|辺;corner|角;round|丸い;straight|まっすぐな;curved|曲がった`],
['numbers','数',`zero|0;one|1;two|2;three|3;four|4;five|5;six|6;seven|7;eight|8;nine|9;ten|10;eleven|11;twelve|12;thirteen|13;fourteen|14;fifteen|15;sixteen|16;seventeen|17;eighteen|18;nineteen|19;twenty|20;thirty|30;fifty|50;hundred|100;thousand|1000`],
['time','時・順番',`time|時・時間;hour|1時間;minute|分（時間）;second|秒;morning|朝;afternoon|午後;evening|夕方;night|夜;noon|正午;today|今日;yesterday|昨日;tomorrow|明日;now|今;later|あとで;early|早い時間に;late|遅い時間に;first|1番目の;third|3番目の;fourth|4番目の;fifth|5番目の;last|最後の;next|次の;before|～より前に;after|～の後に;during|～の間に`],
['calendar','暦・季節',`day|日;week|週;month|月（期間）;year|年;Monday|月曜日;Tuesday|火曜日;Wednesday|水曜日;Thursday|木曜日;Friday|金曜日;Saturday|土曜日;Sunday|日曜日;January|1月;February|2月;March|3月;April|4月;May|5月;June|6月;July|7月;August|8月;September|9月;October|10月;November|11月;December|12月;spring|春;summer|夏`],
['places','町・場所',`place|場所;town|町;city|都市;village|村;country|国;street|通り;road|道路;park|公園;zoo|動物園;shop|店;store|商店;market|市場;supermarket|スーパー;restaurant|レストラン;cafe|カフェ;hospital|病院;station|駅;airport|空港;bank|銀行;museum|博物館;theater|劇場;hotel|ホテル;pool|プール;farm|農場;bridge|橋`],
['travel','乗り物・旅',`car|車;bus|バス;train|電車;bicycle|自転車;airplane|飛行機;boat|ボート;ship|船;taxi|タクシー;truck|トラック;ambulance|救急車;helicopter|ヘリコプター;rocket|ロケット;wheel|車輪;seat|座席;ticket|切符;map|地図;trip|旅行;journey|旅の道のり;travel|旅行する;visit|訪問する;arrive|到着する;leave|出発する;ride|乗る;drive|運転する;fly|飛ぶ`],
['basicverbs','基本の動作',`be|～である;have|持っている;do|する;make|作る;get|手に入れる;give|与える;take|取る;put|置く;bring|持ってくる;buy|買う;sell|売る;use|使う;open|開ける;close|閉める;start|始める;finish|終える;stop|止まる;help|助ける;try|試す;need|必要とする;want|欲しい;like|好きである;love|大好きである;enjoy|楽しむ;choose|選ぶ`],
['daily','毎日の生活',`eat|食べる;drink|飲む;cook|料理する;wash|洗う;clean|掃除する;brush|みがく;sleep|眠る;wake|目を覚ます;wear|着ている;change|変える;work|働く;study|勉強する;learn|学ぶ;teach|教える;read|読む;write|書く;draw|絵をかく;paint|色をぬる;sing|歌う;dance|おどる;play|遊ぶ;practice|練習する;rest|休む;wait|待つ;share|分け合う`],
['motion','動き',`go|行く;come|来る;walk|歩く;run|走る;jump|とぶ（跳躍）;swim|泳ぐ;climb|登る;sit|座る;stand|立つ;turn|曲がる;move|動く;push|押す;pull|引っぱる;throw|投げる;catch|受け止める;kick|ける;hit|打つ;hold|持ち続ける;carry|運ぶ;lift|持ち上げる;drop|落とす;fall|落ちる;touch|さわる;shake|振る;wave|手を振る`],
['communication','考える・伝える',`say|言う;speak|話す;tell|伝える;talk|会話する;ask|たずねる;call|電話する;listen|耳をすます;hear|聞こえる;see|見える;look|目を向ける;idea|考え・アイデア;think|考える;know|知っている;understand|理解する;remember|覚えている;forget|忘れる;find|見つける;guess|推測する;check|確かめる;explain|説明する;spell|つづりを言う;count|数える;mean|意味する;hope|望む;believe|信じる`],
['sports','スポーツ・趣味',`sport|スポーツ;soccer|サッカー;baseball|野球;basketball|バスケットボール;volleyball|バレーボール;tennis|テニス;badminton|バドミントン;golf|ゴルフ;ski|スキーをする;skate|スケートをする;race|競走;game|試合・ゲーム;ball|ボール;bat|バット;racket|ラケット;goal|ゴール;player|選手;winner|勝った人;music|音楽;song|歌;piano|ピアノ;guitar|ギター;drum|たいこ;hobby|趣味;picnic|ピクニック`],
['qualities','様子・性質',`big|大きい;small|小さい;long|長い;short|短い;tall|背が高い;high|高い;low|低い;wide|幅が広い;narrow|幅がせまい;heavy|重い;light|軽い;new|新しい;old|古い;young|若い;hot|熱い;cold|冷たい;warm|暖かい;cool|涼しい;fast|速い;slow|ゆっくりした;easy|簡単な;difficult|難しい;strong|強い;weak|弱い;beautiful|美しい`],
['relations','場所・比べ方',`in|～の中に;on|～の上に接して;under|～の下に;above|～より上方に;below|～より下方に;behind|～の後ろに;between|～の間に;near|～の近くに;far|遠くに;inside|内側に;outside|外側に;up|上へ;down|下へ;left|左;right|右;north|北;south|南;east|東;west|西;here|ここに;there|そこに;together|一緒に;same|同じ;different|違う;other|ほかの`],
['grammar','文をつなぐ語',`I|私;you|あなた;he|彼;she|彼女;it|それ;we|私たち;they|彼ら・それら;my|私の;your|あなたの;his|彼の;her|彼女の;our|私たちの;their|彼らの;this|これ;that|あれ;these|これら;those|あれら;a|1つの（冠詞）;the|その（冠詞）;and|そして;or|または;but|しかし;because|なぜなら;for|～のために;to|～へ`],
['world','世界・ことば',`Japan|日本;Japanese|日本語;America|アメリカ;American|アメリカの;Canada|カナダ;Australia|オーストラリア;China|中国;Chinese|中国語;Korea|韓国;Korean|韓国語;India|インド;France|フランス;French|フランス語;Italy|イタリア;Italian|イタリア語;Spain|スペイン;Spanish|スペイン語;Brazil|ブラジル;Germany|ドイツ;German|ドイツ語;English|英語;language|言語;world|世界;flag|旗;culture|文化`],
['jobs','仕事',`job|仕事;doctor|医師;nurse|看護師;dentist|歯科医師;farmer|農家;driver|運転手;pilot|パイロット;builder|建物を造る仕事の人;baker|パン職人;artist|芸術家;singer|歌手;dancer|ダンサー;actor|俳優;writer|作家;scientist|科学者;engineer|技術者;firefighter|消防士;police|警察;officer|係官;astronaut|宇宙飛行士;vet|獣医;clerk|店員;chef|料理長;coach|指導者;worker|働く人`],
['events','行事・生活の語',`birthday|誕生日;party|パーティー;festival|祭り;holiday|休日;vacation|長期休暇;weekend|週末;Christmas|クリスマス;Halloween|ハロウィーン;gift|贈り物;present|プレゼント;card|カード;letter|手紙;picture|絵;photo|写真;story|物語;dream|夢;wish|願い;name|名前;age|年齢;address|住所;number|番号;telephone|電話機;money|お金;price|値段;sale|販売`],
['weather','天気・地球',`weather|天気;sunny|晴れた;rainy|雨の;cloudy|くもりの;snowy|雪の;windy|風の強い;rain|雨;snow|雪;wind|風;storm|嵐;season|季節;autumn|秋;winter|冬;earth|地球;air|空気;soil|土;stone|石;sand|砂;fire|火;ice|氷;energy|エネルギー;trash|ごみ;recycle|再利用する;protect|守る;save|節約する`],
['conversation','会話で使う語',`hello|こんにちは;hi|やあ;goodbye|さようなら;bye|じゃあね;please|お願いします;thank|感謝する;sorry|すまなく思う;yes|はい;no|いいえ;not|～でない;welcome|ようこそ;excuse|許す;really|本当に;very|とても;too|～も;also|さらに～も;well|上手に;good|よい;great|すばらしい;nice|すてきな;fine|元気な;OK|大丈夫;who|だれ;what|何;how|どのように`],
['useful','質問・量・道具',`when|いつ;where|どこ;why|なぜ;which|どれ;whose|だれの;can|～できる;will|～するつもり;must|～しなければならない;some|いくつかの;any|何かの;many|たくさんの（数）;much|たくさんの（量）;all|すべて;every|どの～も;each|それぞれの;both|両方の;more|もっと;most|最も多い;only|～だけ;again|もう一度;always|いつも;sometimes|ときどき;never|決して～ない;computer|コンピューター;internet|インターネット`]
].map(([id,title,text])=>({id,title,words:text.split(';').map(pair=>{const [word,meaning]=pair.split('|');return {word,meaning}})}));
// Close meanings are not suitable distractors for isolated-word questions.
// These groups are conservative: they prevent ambiguity, not teach equivalence.
const VOCABULARY_DISTRACTOR_GROUPS = [
 ['happy','glad'], ['worried','nervous'], ['shop','store'], ['gift','present'],
 ['hello','hi'], ['goodbye','bye'], ['also','too'], ['picture','photo'],
 ['home','house'], ['sea','ocean'], ['street','road'], ['trip','journey','travel'],
 ['say','speak','tell','talk'], ['see','look','watch'], ['like','love','enjoy'],
 ['good','great','nice','fine','OK'], ['job','work'], ['every','each'],
 ['holiday','vacation'], ['big','large'], ['little','small']
];
for (const group of VOCABULARY_GROUPS) for (const entry of group.words) {
 // person/people are one headword; use a separate school-life word instead.
 if (entry.word === 'people') { entry.word = 'classmate'; entry.meaning = '同級生'; }
 const synonyms = VOCABULARY_DISTRACTOR_GROUPS.find(words => words.includes(entry.word));
 if (synonyms) entry.synonymGroup = synonyms[0];
}
if(typeof module==='object')module.exports=VOCABULARY_GROUPS;
