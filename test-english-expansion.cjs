const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const skills = require('./dist/english-expansion.js');
const browser = vm.createContext({});
vm.runInContext(fs.readFileSync(require.resolve('./dist/english-expansion.js'), 'utf8'), browser);
assert.equal(vm.runInContext('ENGLISH_EXTENSION_SKILLS.length', browser), 4);
assert.equal(skills.length, 4);
assert.deepEqual([...new Set(skills.map(s => s.mode))].sort(), ['dialog','listen','spell']);
const ids = new Set();
let count = 0;
for (const skill of skills) {
  assert.equal(skill.stages.length, 3);
  assert.notEqual(skill.fallbackSkillId, skill.id, 'Reading fallback must not earn listening mastery');
  for (const stage of skill.stages) {
    assert.equal(stage.items.length, 6);
    const targets = new Set();
    for (const item of stage.items) {
      count++;
      assert(!ids.has(item.id), `Duplicate item ID: ${item.id}`); ids.add(item.id);
      assert(!targets.has(item.target), `Repeated target in ${stage.title}`); targets.add(item.target);
      for (const key of ['prompt','target','audioText','fallbackPrompt','answer','hint']) {
        assert.equal(typeof item[key], 'string'); assert(item[key].trim(), `${item.id}: empty ${key}`);
        assert(!item[key].includes('\uFFFD'), `${item.id}: invalid Unicode`);
      }
      assert.equal(item.audioText, item.target);
      assert.equal(item.choices.length, 3);
      assert.equal(new Set(item.choices).size, 3, `${item.id}: ambiguous duplicate choices`);
      assert.equal(item.choices.filter(c => c === item.answer).length, 1);
      assert.match(item.fallbackPrompt, /^読む練習/);
      assert.equal(item.fallbackMode, 'reading');
      assert.equal(item.fallbackSkillId, skill.fallbackSkillId);
      assert.equal(item.mode, skill.mode);
      assert.equal(item.requiresAudio, skill.mode !== 'dialog');
      if (item.requiresAudio) {
        assert(!item.prompt.toLowerCase().includes(item.target.toLowerCase()), `${item.id}: audio target leaked into prompt`);
      } else {
        assert(item.context && item.prompt.includes(item.context));
        assert(item.prompt.includes(item.target));
      }
      if (skill.mode === 'spell') {
        assert.equal(item.answer, item.target);
        assert(!item.fallbackPrompt.toLowerCase().includes(item.target.toLowerCase()), `${item.id}: spelling fallback reveals answer`);
      }
    }
  }
}
assert.equal(count, 72);
// Content checkpoints cover distinct reply intents and intentional sound contrasts.
const listening = skills.find(s => s.id === 'enListening');
const soundPairs = listening.stages.flatMap(s => s.items).map(q => q.target);
for (const word of ['cat','hat','ship','sheep','light','night']) assert(soundPairs.includes(word));
const dialogs = skills.filter(s => s.mode === 'dialog').flatMap(s => s.stages.flatMap(st => st.items));
for (const phrase of ['Good morning!','What fruit do you like?','What do you want to drink?','Where is the library?','What time is it?','Why do you like winter?']) {
  assert(dialogs.some(q => q.target === phrase), `Missing reply intent ${phrase}`);
}
assert.equal(dialogs.find(q => q.target === 'Would you like some cake?').answer, 'No, thank you.');
assert.equal(dialogs.find(q => q.target === 'Would you like some juice?').answer, 'Yes, please.');
console.log(`English extension: ${skills.length} skills / 12 stages / ${count} items; browser + CommonJS exports and content checks passed.`);
