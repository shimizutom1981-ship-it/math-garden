# Curriculum release v2026.10.24.5

This extends the existing app and keeps its saved course IDs, local storage key,
rewards, inventory, five-question sessions and selection controls.

## Coverage and counts

Before this release: English 54 cards across eight banks (61 distinct normalized
headwords represented by words and phrases); Japanese 97 questions/13 courses.

- Vocabulary: 750 distinct written headwords in 30 categories, 25 per category.
  Inflected phrases are not added to that count. Each category has four stages
  introducing 7, 13, 19 and 25 words. Categories cover family, body, feelings,
  animals, nature, produce, food, home, school, clothes, colors, numbers, time,
  calendar, places, travel, actions, routines, motion, communication, sports,
  qualities, relations, function words, world, jobs, events, weather,
  conversation and useful words. Existing picture cards remain available.
- English listening, spelling selection, social and information dialogues:
  72 original items across four skills/12 stages. Audio-dependent skills have
  distinct reading alternatives and separate mastery records, not extra counted
  content. A visible reading alternative is offered if sound does not work.
- Japanese: 162 added questions, 259 total. The addition includes 96 questions
  across contextual kanji/vocabulary, homophones/synonyms/antonyms, sentence
  structure and reading reasons/gist/evidence; plus 22 proverbs, idioms and common
  four-character expressions at completion, meaning and scenario stages (66).
- Math: nine new independent skills/28 generated stages: decomposition,
  carrying, borrowing, multiplication, division, operation order, fractions,
  decimals and percentages. No new shape/unit/chart curriculum.

MEXT's English guidance is approximately 600–700 words, not a mandated fixed
list; this inventory is not a verified crosswalk of every textbook. Japanese
content reaches selected upper-elementary reading tasks, but does not claim all
1,026 kanji, handwriting, speaking or complete national curriculum coverage.

Reference guidance supplied and checked during planning:
- https://www.mext.go.jp/component/a_menu/education/micro_detail/__icsFiles/afieldfile/2019/03/18/1387017_011.pdf
- https://www.mext.go.jp/content/20220606-mxt_kyoiku02-100002607_002.pdf

## Routing and preservation

New courses append after existing IDs. The classifier recognizes appended math
courses, without shifting Japanese statistics. Every generator registers its
own skill and actual stage in the existing adaptive engine. The home screen
also offers an optional field chooser, so every skill is directly reachable.
Continuing a selected field retains it and uses its updated mastery. Audio-free
reading never credits the listening skill. Vocabulary distractors exclude equal
glosses and conservative synonym groups. No paid services or tracking added.

## Validation

Run `node test-practice.cjs`, `node test-integration.cjs`,
`node test-math-expansion.cjs`, and `node test-english-expansion.cjs`.
Includes 7,000 generated arithmetic checks, all course metadata, vocabulary
uniqueness, original fractions, all new skill sessions/continuation, reward
idempotence, unchanged inventory, test-toggle isolation, and audio fallback.
Mobile preview checked at 320 and 390 CSS pixels. Test data is synthetic and
local; QA fixtures are never published. Deployment verification downloads the
actual public assets, compares them to the release, and reruns integration tests.
