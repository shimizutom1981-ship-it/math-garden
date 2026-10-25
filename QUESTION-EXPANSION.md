# Question expansion v2026.10.25.1

Extends the established selection-based curriculum without changing the save key,
existing course IDs, five-question rewards, automatic next question, adaptive mix,
avatars, purchased items, coins, or parent information.

## Added content

- Mental arithmetic: 846 numeric variations across the existing three decomposition
  stages. Make ten (36), bridge tens (288), and round then compensate (522).
  Existing decomposition forms remain available.
- Everyday math: 585 numeric/visual variations in three skills and nine stages.
  Shopping/change (90), clocks/elapsed time (216), lengths/units (279).
  Begins with pictures and small numbers; progresses to two-item change,
  hour-crossing time calculations and metres/centimetres.
- Reading: 32 original short questions added to the four existing reading stages.
  Reasons, order, explicitly stated feelings and time/condition distinctions.
  Early content uses spaced hiragana and the existing Japanese narration.
- English social dialogue: 18 short scene-based items added to three existing stages.
  Greetings, food and handing over objects; existing English audio and text fallback.
  Dialogue practice does not claim separate listening mastery.

Counts include parameter variations, not distinct learning concepts.
New math banks select unseen items until exhausted within a session. Reading and
English use the existing unseen-item selection. Legacy mental generators retain
existing behavior. No independent inverse-arithmetic skill or new adaptive/hint/story
flow is introduced.

## Verification

Run from the repository root:

```
node test-practice.cjs
node test-integration.cjs
node test-math-expansion.cjs
node test-english-expansion.cjs
node test-written-hints.cjs
node test-garden-questions.cjs
```

Tests independently recalculate all 1,431 new math answers, verify unique choices
and one correct answer, exhaust every bank at both RNG boundaries, exercise all new
stages through normal/adaptive routes, check Japanese narration and English fallback,
and preserve previous course IDs, saves, inventory and rewards.

Local browser smoke checks cover shopping display, correct answer, automatic next
question, and the clock diagram/options. Physical-device speech quality and exhaustive
viewport coverage remain unverified. Use `node preview.cjs` for local preview.
Deployment uses the established GitHub Pages flow.
