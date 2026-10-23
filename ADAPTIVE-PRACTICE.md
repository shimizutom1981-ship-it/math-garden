# Adaptive practice v2026.10.24.1

Source: shimizutom1981-ship-it/math-garden, base 93c1f65.
Existing live origin: https://shimizutom1981-ship-it.github.io/math-garden/
The obsolete Sites publication is not updated.

## Rules

- Hidden profile.practice state lives under the existing kazunoniwa-v1 save key. The engine never writes coins, flowers, growth, purchased items or equipment.
- Optional age converts immediately to a coarse seed (0–3); age itself is not retained. Blank/easy starts at 0. Existing per-course evidence wins. No age/grade ranking or age cap.
- Fifteen skill paths map to existing generator courses, each with course/stage metadata. Math records carry/borrow variants separately; repeated variant mistakes trigger prerequisite practice and retry. This heuristic is not a validated assessment.
- Five-question sessions and existing rewards remain. Two sessions use 7 fluent / 2 challenge / 1 review. At bounds or with sparse history adjacent difficulty can coincide. Prerequisite intervention overrides the mix temporarily.
- Four clean first attempts calibrate upward. Once difficulty is observed, nine of ten clean attempts advance one stage. Easier review is not promotion evidence. Two consecutive mistakes or repeated stage/variant mistakes schedule two prerequisite items then retry. No global player level changes.
- Wrong first attempts are recorded immediately, even if abandoned. Corrections/hints do not become first-attempt successes. Clicks under 450ms cannot advance mastery. No speed rewards.
- Timing is descriptive only in this first release. Slow correct answers never reduce difficulty. Background/blur and over-two-minute pauses are excluded from timing; accuracy remains valid. No external tracking, paid API, dependencies or credentials.
- Difficulty remains bounded by existing question banks. Mid-question reload restarts the existing session; completed attempts, skill state and mix position persist.

## Validation

Run node test-practice.cjs: 10 synthetic tests covering age/fallback, mix, child/adult progress, skills/profiles, support/retry, slow/rapid answers, inventory preservation and save roundtrip.

Run node test-integration.cjs: actual scripts in synthetic DOM; three complete sessions, exactly-once rewards, crown and growth retention, manual gameplay, corrected wrong attempt counted once, every generator course with unique choices and correct answer, existing save persistence.

Browser QA uses localhost synthetic records only. Checked 390x844 home, optional age, version label, math wrong-choice hint and English selection; no console errors. Physical Android/speech quality not verified.

Static build: dist is deployable, with no bundler. node preview.cjs serves http://127.0.0.1:4173.
