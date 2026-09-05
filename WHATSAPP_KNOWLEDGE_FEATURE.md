# WhatsApp AI Knowledge & Guardrails — feature notes

Second-stage questionnaire (`whatsapp-knowledge.html`) that the gym owner fills in after the initial business/technical discovery. Where the discovery form asked "how does the business run today," this one asks "exactly what is the WhatsApp assistant allowed to say" — approved FAQ answers, membership pricing, guardrails, and escalation rules, all structured enough to hand directly to an LLM-based chatbot.

## How it fits with the existing site

Same pattern as `index.html` / `results.html`: a static HTML page, no build step, no framework, Supabase as the only backend, deployed via GitHub Pages. Nothing about the existing discovery form or results page was changed.

## Files

- **`whatsapp-knowledge-schema.js`** — every section and field, as data (id, label, type, required, options, conditional `showIf` rule, and — for tables — columns and starter rows). Adding or changing a question is an edit to this file, not to the page's markup or logic.
- **`whatsapp-knowledge-logic.js`** — pure functions operating on the schema + an `answers` object: visibility (`isFieldVisible`), validation (`validateField` / `validateSection` / `validateAll`), and the three export builders (`toCSV`, `toMarkdown`, `buildOutputs`). No DOM access, so the exact same file runs in the browser (via `<script src>`) and under Node in the test suite — it detects `module.exports` and switches export style accordingly.
- **`whatsapp-knowledge.html`** — the page itself: a generic field/table renderer driven entirely by the schema (one code path handles all 14 sections), a stepper with progress bar, inline validation, and a final review + owner-approval screen.
- **`tests/knowledge-logic.test.js`** — Node test suite (built-in `assert`, no dependencies) covering conditional visibility, required-field validation (including the guardrail-confirm-all rule), CSV/Markdown export shape, and that `buildOutputs` never fabricates a price or FAQ answer that wasn't explicitly entered and approved. Run with `node tests/knowledge-logic.test.js`.

## Data flow

1. **Draft state** lives in the browser's `localStorage` (`wa_knowledge_draft_v1`), autosaved on every change. The owner can close the tab and resume later on the same device/browser.
2. **Submission** is a single, one-time `insert` into a new Supabase table, `chatbot_knowledge_responses` (see `supabase_schema.sql`), gated the same way as `discovery_responses`: the anon key can only insert, never read, and a password-gated Postgres function (`get_knowledge_responses`) is available for building a results/review page later, mirroring `get_discovery_responses`.
3. Each submission stores both the raw `answers` and a pre-computed `outputs` object — the ten structured outputs from the brief (approved FAQ knowledge base, active membership plans, chatbot system-instruction text, guardrail rules, escalation matrix, automation matrix, WhatsApp template list, missing-information report, and the Fit Gym/biometric integration dependency list) — so a future chatbot config step can read `outputs` directly without re-deriving it from raw answers.
4. The review screen also offers client-side **JSON / FAQ CSV / Markdown** downloads at any point, generated from the same `buildOutputs`/`toCSV`/`toMarkdown` functions.

## Guardrails against hallucination

- `buildOutputs.membershipPlanData` only ever includes rows from the plans table marked **Active** — the AI is never handed a price that wasn't explicitly entered and turned on.
- `buildOutputs.approvedFaqKnowledgeBase` only includes FAQ rows with **Status = Approved** — draft/retired answers never reach the knowledge base output.
- The 17 mandatory guardrails (Section 11) must **all** be individually confirmed before the final submit button enables — this is enforced in both the UI (button stays disabled) and in `validateField` for the `guardrail-list` type, so it can't be bypassed by skipping straight to the review screen.
- `missingInformationReport` walks every required field across all 14 sections (skipping any hidden by a `showIf` condition) plus checks for an empty active-plans list or zero approved FAQs, so gaps are visible before submission rather than silently missing from the eventual chatbot config.

## Known scope boundaries (by design, per the brief)

- **No real Fit Gym, biometric, or WhatsApp integration** — Sections 7 and 8 only *collect* what those systems can do; nothing here calls them.
- **File upload is metadata-only** (filename/size/type captured in `answers`, not uploaded anywhere) — there's no file storage backend wired up yet. Swap in Supabase Storage's `upload()` in `onFileInput` when that's ready.
- **No update/edit-after-submit flow** — a submission is final. If the owner needs to revise an already-submitted questionnaire, that's a new submission (or a manual Supabase edit), same as the discovery form's read-only results.

## Extending it

To add a question: add a field object to the relevant section in `whatsapp-knowledge-schema.js` (or a new section to the `SECTIONS` array). The renderer, validator, and every export automatically pick it up — no changes needed in `whatsapp-knowledge.html` or `whatsapp-knowledge-logic.js` unless the new field needs a genuinely new input *type* (the engine currently supports: `text`, `textarea`, `tel`, `email`, `url`, `date`, `number`, `select`, `multiselect`, `boolean`, `file`, `table`, and the guardrails-specific `guardrail-list`).
