/* Familiar everyday words appended to existing introductory courses 8–11. */
(function(root){
 'use strict';
 const items=[
 {
  "word": "eye",
  "picture": "👁️",
  "ja": "め",
  "category": "body"
 },
 {
  "word": "ear",
  "picture": "👂",
  "ja": "みみ",
  "category": "body"
 },
 {
  "word": "nose",
  "picture": "👃",
  "ja": "はな",
  "category": "body"
 },
 {
  "word": "mouth",
  "picture": "👄",
  "ja": "くち",
  "category": "body"
 },
 {
  "word": "tooth",
  "picture": "🦷",
  "ja": "は",
  "category": "body"
 },
 {
  "word": "hand",
  "picture": "✋",
  "ja": "て",
  "category": "body"
 },
 {
  "word": "arm",
  "picture": "💪",
  "ja": "うで",
  "category": "body"
 },
 {
  "word": "foot",
  "picture": "🦶",
  "ja": "あし",
  "category": "body"
 },
 {
  "word": "coat",
  "picture": "🧥",
  "ja": "こーと",
  "category": "clothes"
 },
 {
  "word": "tie",
  "picture": "👔",
  "ja": "ねくたい",
  "category": "clothes"
 },
 {
  "word": "shorts",
  "picture": "🩳",
  "ja": "はんずぼん",
  "category": "clothes"
 },
 {
  "word": "pen",
  "picture": "🖊️",
  "ja": "ぺん",
  "category": "school"
 },
 {
  "word": "crayon",
  "picture": "🖍️",
  "ja": "くれよん",
  "category": "school"
 },
 {
  "word": "notebook",
  "picture": "📓",
  "ja": "のーと",
  "category": "school"
 },
 {
  "word": "school",
  "picture": "🏫",
  "ja": "がっこう",
  "category": "school"
 },
 {
  "word": "paper",
  "picture": "📄",
  "ja": "かみ",
  "category": "school"
 },
 {
  "word": "bell",
  "picture": "🔔",
  "ja": "かね",
  "category": "school"
 },
 {
  "word": "map",
  "picture": "🗺️",
  "ja": "ちず",
  "category": "school"
 },
 {
  "word": "house",
  "picture": "🏠",
  "ja": "いえ",
  "category": "home"
 },
 {
  "word": "window",
  "picture": "🪟",
  "ja": "まど",
  "category": "home"
 },
 {
  "word": "sofa",
  "picture": "🛋️",
  "ja": "そふぁ",
  "category": "home"
 },
 {
  "word": "toilet",
  "picture": "🚽",
  "ja": "といれ",
  "category": "home"
 },
 {
  "word": "shower",
  "picture": "🚿",
  "ja": "しゃわー",
  "category": "home"
 },
 {
  "word": "bathtub",
  "picture": "🛁",
  "ja": "よくそう",
  "category": "home"
 },
 {
  "word": "mirror",
  "picture": "🪞",
  "ja": "かがみ",
  "category": "home"
 },
 {
  "word": "soap",
  "picture": "🧼",
  "ja": "せっけん",
  "category": "home"
 },
 {
  "word": "toothbrush",
  "picture": "🪥",
  "ja": "はぶらし",
  "category": "home"
 },
 {
  "word": "broom",
  "picture": "🧹",
  "ja": "ほうき",
  "category": "home"
 },
 {
  "word": "bucket",
  "picture": "🪣",
  "ja": "ばけつ",
  "category": "home"
 },
 {
  "word": "sponge",
  "picture": "🧽",
  "ja": "すぽんじ",
  "category": "home"
 },
 {
  "word": "candle",
  "picture": "🕯️",
  "ja": "ろうそく",
  "category": "home"
 },
 {
  "word": "run",
  "picture": "🏃",
  "ja": "はしる",
  "category": "action"
 },
 {
  "word": "walk",
  "picture": "🚶",
  "ja": "あるく",
  "category": "action"
 },
 {
  "word": "swim",
  "picture": "🏊",
  "ja": "およぐ",
  "category": "action"
 },
 {
  "word": "sleep",
  "picture": "😴",
  "ja": "ねむる",
  "category": "action"
 },
 {
  "word": "dance",
  "picture": "💃",
  "ja": "おどる",
  "category": "action"
 },
 {
  "word": "write",
  "picture": "✍️",
  "ja": "かく",
  "category": "action"
 },
 {
  "word": "clap",
  "picture": "👏",
  "ja": "はくしゅする",
  "category": "action"
 },
 {
  "word": "wave",
  "picture": "👋",
  "ja": "てを ふる",
  "category": "action"
 }
];
 const conflicts=[["hand", "arm"], ["book", "notebook"], ["shirt", "tie"], ["pants", "shorts"], ["pencil", "pen", "crayon", "paintbrush"], ["house", "school"], ["chair", "sofa"]];
 const api={items,conflicts};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 root.EverydayEnglish=api;
 for(const x of items)if(!EN_WORDS[2].some(w=>w[0]===x.word))EN_WORDS[2].push([x.word,x.picture,x.ja]);
 for(const group of conflicts)if(!englishPictureConflicts.some(g=>JSON.stringify(g)===JSON.stringify(group)))englishPictureConflicts.push(group);
 const actions=new Set(items.filter(x=>x.category==='action').map(x=>x.word));
 const previous=englishPictureDistractor;
 // Verb scenes only compete with other verb scenes, never the nouns they contain.
 englishPictureDistractor=function(target,other){return actions.has(target[0])===actions.has(other[0])&&previous(target,other)};
})(typeof globalThis==='object'?globalThis:this);
