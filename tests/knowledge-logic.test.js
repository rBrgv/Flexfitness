const assert = require('assert');
const { SECTIONS } = require('../whatsapp-knowledge-schema.js');
const Logic = require('../whatsapp-knowledge-logic.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// --- conditional visibility ---
test('showIf hides field when condition not met', () => {
  const field = { id: 'trialPrice', showIf: { fieldId: 'trialType', equals: 'Paid' } };
  assert.strictEqual(Logic.isFieldVisible(field, { trialType: 'Free' }), false);
});

test('showIf shows field when condition met', () => {
  const field = { id: 'trialPrice', showIf: { fieldId: 'trialType', equals: 'Paid' } };
  assert.strictEqual(Logic.isFieldVisible(field, { trialType: 'Paid' }), true);
});

test('field with no showIf is always visible', () => {
  assert.strictEqual(Logic.isFieldVisible({ id: 'x' }, {}), true);
});

// --- validation ---
test('required text field fails when empty', () => {
  const field = { id: 'gymName', type: 'text', required: true };
  assert.strictEqual(Logic.validateField(field, ''), 'This field is required.');
  assert.strictEqual(Logic.validateField(field, '   '), 'This field is required.');
});

test('required text field passes when filled', () => {
  const field = { id: 'gymName', type: 'text', required: true };
  assert.strictEqual(Logic.validateField(field, 'Flex Fitness'), null);
});

test('required boolean field accepts explicit false', () => {
  const field = { id: 'x', type: 'boolean', required: true };
  assert.strictEqual(Logic.validateField(field, false), null);
  assert.strictEqual(Logic.validateField(field, undefined), 'This field is required.');
});

test('non-required field never errors', () => {
  const field = { id: 'x', type: 'text' };
  assert.strictEqual(Logic.validateField(field, ''), null);
});

test('guardrail-list requires every item confirmed', () => {
  const field = { id: 'mandatoryGuardrails', type: 'guardrail-list', required: true, items: ['a', 'b', 'c'] };
  assert.strictEqual(Logic.validateField(field, [true, true, false]), 'Please confirm every mandatory guardrail.');
  assert.strictEqual(Logic.validateField(field, [true, true, true]), null);
  assert.strictEqual(Logic.validateField(field, []), 'Please confirm every mandatory guardrail.');
});

test('validateSection skips hidden conditional fields', () => {
  const section = {
    id: 'trials_leads',
    fields: [
      { id: 'trialType', type: 'select', required: true },
      { id: 'trialPrice', type: 'number', required: true, showIf: { fieldId: 'trialType', equals: 'Paid' } },
    ],
  };
  const errors = Logic.validateSection(section, { trialType: 'Free' });
  assert.strictEqual('trialPrice' in errors, false, 'hidden required field should not error');
  assert.strictEqual('trialType' in errors, false);
});

test('validateSection catches required field left blank', () => {
  const section = { id: 'gym_info', fields: [{ id: 'gymName', type: 'text', required: true }] };
  const errors = Logic.validateSection(section, {});
  assert.strictEqual(errors.gymName, 'This field is required.');
});

test('validateAll aggregates errors across full real schema with empty answers', () => {
  const result = Logic.validateAll(SECTIONS, {});
  assert.strictEqual(result.hasErrors, true);
  assert.ok(result.errors.gym_info, 'gym_info should have errors (gymName, address, etc. required)');
  assert.ok(result.errors.guardrails, 'guardrails should require confirmation');
});

test('validateAll passes with all required fields answered', () => {
  const answers = {
    gymName: 'Flex Fitness', address: '123 Main St', contactNumbers: '999', whatsappNumber: '999',
    assistantName: 'Flexi',
    mandatoryGuardrails: SECTIONS.find((s) => s.id === 'guardrails').fields[0].items.map(() => true),
    finalApprover: 'Nithish S',
  };
  const result = Logic.validateAll(SECTIONS, answers);
  assert.strictEqual(result.hasErrors, false, JSON.stringify(result.errors));
});

// --- CSV export ---
test('toCSV escapes commas and quotes', () => {
  const columns = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
  const rows = [{ a: 'hello, world', b: 'say "hi"' }];
  const csv = Logic.toCSV(rows, columns);
  assert.strictEqual(csv, 'A,B\n"hello, world","say ""hi"""');
});

test('toCSV handles empty rows', () => {
  const columns = [{ id: 'a', label: 'A' }];
  assert.strictEqual(Logic.toCSV([], columns), 'A');
});

// --- Markdown export ---
test('toMarkdown produces a heading per section', () => {
  const md = Logic.toMarkdown(SECTIONS, {});
  SECTIONS.forEach((s) => assert.ok(md.includes(`## ${s.title}`), `missing heading for ${s.title}`));
});

test('toMarkdown renders guardrail checkboxes', () => {
  const guardrailsSection = SECTIONS.find((s) => s.id === 'guardrails');
  const items = guardrailsSection.fields[0].items;
  const md = Logic.toMarkdown(SECTIONS, { mandatoryGuardrails: [true, ...items.slice(1).map(() => false)] });
  assert.ok(md.includes(`- [x] ${items[0]}`));
  assert.ok(md.includes(`- [ ] ${items[1]}`));
});

// --- buildOutputs ---
test('buildOutputs filters FAQ to Approved rows only', () => {
  const answers = { faqTable: [{ question: 'Q1', status: 'Approved' }, { question: 'Q2', status: 'Draft' }] };
  const out = Logic.buildOutputs(SECTIONS, answers);
  assert.strictEqual(out.approvedFaqKnowledgeBase.length, 1);
  assert.strictEqual(out.approvedFaqKnowledgeBase[0].question, 'Q1');
});

test('buildOutputs filters membership plans to active only', () => {
  const answers = { plansTable: [{ name: 'Gold', active: true }, { name: 'Old Plan', active: false }] };
  const out = Logic.buildOutputs(SECTIONS, answers);
  assert.strictEqual(out.membershipPlanData.length, 1);
  assert.strictEqual(out.membershipPlanData[0].name, 'Gold');
});

test('buildOutputs flags missing info for unanswered required fields', () => {
  const out = Logic.buildOutputs(SECTIONS, {});
  assert.ok(out.missingInformationReport.some((m) => m.includes('Official gym name')));
});

test('buildOutputs never invents a price — membershipPlanData only reflects entered rows', () => {
  const out = Logic.buildOutputs(SECTIONS, {});
  assert.deepStrictEqual(out.membershipPlanData, []);
});

test('buildOutputs system instructions include assistant name and gym name when provided', () => {
  const out = Logic.buildOutputs(SECTIONS, { assistantName: 'Flexi', gymName: 'Flex Fitness' });
  assert.ok(out.chatbotSystemInstructions.includes('Flexi'));
  assert.ok(out.chatbotSystemInstructions.includes('Flex Fitness'));
});

console.log(`\n${passed} test(s) passed.`);
