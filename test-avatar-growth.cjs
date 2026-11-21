const fs = require('node:fs');
const assert = require('node:assert/strict');
const setup = fs.readFileSync('test-foundations.cjs', 'utf8').split("if(process.argv.includes('--inspect'))")[0];
const { run, P, c, app } = new Function('require', setup + 'return { run, P, c, app };')(require);

const fresh = () => ({ name: 'テスト', stats: {}, flowers: 0 });
const grade = p => c.avatarGrowthStage(p);
const def = id => P.defs.find(d => d.id === id);
function practiced(p, skill, index) {
  P.skill(p, def(skill)).stages[index] = { attempts: 1, firstCorrect: 0, recent: [], mastered: false };
}

const p = fresh();
p.game = { growth: 297, coins: 200 };
c.PracticePresets.apply(p, 'elementary-6', P);
P.skill(p, def('jp_gradeKanji')).level = 5;
p.english = { level: 32, total: 150 };
assert.equal(grade(p), 0, 'settings, difficulty estimates and pet level are not answered questions');
practiced(p, 'enWords', 11);
assert.equal(grade(p), 0, 'introductory English has no specific school grade');
practiced(p, 'jp_kanjiContext', 2);
assert.equal(grade(p), 5, 'a grade 3–6 band starts at grade 3');
practiced(p, 'jp_gradeKanji', 5);
assert.equal(grade(p), 8);
practiced(p, 'number', 0);
P.configure(p, null, true);
assert.equal(grade(p), 8, 'review and easy restart retain the oldest relevant attempts');
assert.equal(grade(JSON.parse(JSON.stringify(p))), 8);

const legacy = fresh();
const firstNumber = def('number').courses[0];
assert.ok(P.defs.some(d => d.subject === 'en' && d.courses.includes(firstNumber)), 'shared course ID fixture');
legacy.stats[firstNumber] = { total: 1 };
assert.equal(grade(legacy), 0, 'old non-English stats never match a colliding English course ID');
legacy.stats[def('jp_gradeKanji').courses[3]] = { total: 1 };
assert.equal(grade(legacy), 6);
legacy.practice = { version: 1, skills: { jp_gradeKanji: { level: 5, total: 42 } } };
assert.equal(grade(legacy), 6, 'old skill aggregates do not identify the stage played');

const levels = [['number', 0], ['number', 1], ['letters', 2],
  ...Array.from({ length: 6 }, (_, i) => ['jp_gradeKanji', i]),
  [P.defs.find(d => d.id.startsWith('junior_')).id, 0]];
let lastCollarY = Infinity;
for (const [stage, [skill, index]] of levels.entries()) {
  const learner = fresh();
  practiced(learner, skill, index);
  assert.equal(grade(learner), stage);
  const svg = c.avatarArt(learner);
  assert.ok(svg.includes('data-avatar-stage="' + stage + '"'));
  assert.match(svg, /viewBox="0 0 180 210"/);
  const head = svg.match(/<g transform="translate\(90 ([\d.]+)\) scale\([^"]+\) translate\(-90 -120\)"/);
  assert.ok(head && Number(head[1]) < lastCollarY, 'the collar rises with every new grade');
  lastCollarY = Number(head[1]);
  assert.match(svg, /<g transform="translate\(90 198\) scale\([^"]+\) translate\(-90 -198\)"/,
    'the feet stay anchored at the same ground level');
}

run('data.profiles=[{name:"ひとりめ",stats:{},flowers:0},{name:"ふたりめ",stats:{},flowers:0}];data.current=0;home()');
run("Practice.skill(person(),Practice.defs.find(d=>d.id==='number')).level=1;start(recommendationFor('math'),true)");
assert.equal(run('practiceItem.skill'), 'number');
assert.equal(run('practiceItem.index'), 1);
run("practiceClock.start-=2000;answer(q.choices.indexOf(q.answer),document.createElement('button'));home()");
assert.match(app.innerHTML, /data-avatar-stage="1"/);
run('avatarRoom()');
assert.match(app.innerHTML, /data-avatar-stage="1"/);

run('petRoom()');
const memory = c.NiwatchiLife.state().album.find(m => m.id === 'hello');
assert.equal(memory.photo.avatarStage, 1);
const before = c.NiwatchiLife.photo(memory);
practiced(run('person()'), 'jp_gradeKanji', 4);
run("save();data=JSON.parse(localStorage.getItem('kazunoniwa-v1'));home()");
assert.match(app.innerHTML, /data-avatar-stage="7"/);
const restored = c.NiwatchiLife.state().album.find(m => m.id === 'hello');
assert.equal(c.NiwatchiLife.photo(restored), before, 'the saved picture keeps its original proportions');

const oldMemory = JSON.parse(JSON.stringify(restored));
delete oldMemory.photo.avatarStage;
assert.doesNotMatch(c.NiwatchiLife.photo(oldMemory), /data-avatar-stage/);
run('data.current=1;home()');
assert.match(app.innerHTML, /data-avatar-stage="0"/);
console.log('PASS curriculum grade boundaries, actual answers, history, wardrobe, profile switching and album photos');
