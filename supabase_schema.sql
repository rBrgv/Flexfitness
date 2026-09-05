-- ============================================================
-- Flex Fitness Discovery — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

create table if not exists discovery_responses (
  id uuid primary key default gen_random_uuid(),
  role text not null,               -- 'owner' | 'reception_dedicated' | 'reception_informal' | 'trainer' | 'cleaner' | 'member' | 'parent'
  role_label text not null,         -- human-readable label shown in the form, e.g. "Reception (Dedicated)"
  respondent_name text,             -- required for staff roles, optional for member/parent — nullable since it's skippable
  answers jsonb not null,           -- [{ "question": "...", "answer": "..." }, ...]
  submitted_at timestamptz not null default now(),
  user_agent text                   -- helps you tell iPhone vs Android submissions (voice input worked or not)
);

-- If discovery_responses already exists in your project (schema already ran once),
-- `create table if not exists` above won't add the new column — run this too:
alter table discovery_responses add column if not exists respondent_name text;

-- Index for filtering/sorting the results view by role and date
create index if not exists idx_discovery_role on discovery_responses(role);
create index if not exists idx_discovery_submitted on discovery_responses(submitted_at desc);

-- ============================================================
-- Row Level Security
-- Public (anon key) can INSERT only — cannot read, update, or delete.
-- This keeps responses honest: nobody filling the form can see others' answers,
-- and the anon key embedded in the public HTML file can't be used to read data.
-- ============================================================

alter table discovery_responses enable row level security;

drop policy if exists "Anyone can submit a response" on discovery_responses;
create policy "Anyone can submit a response"
  on discovery_responses
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon = those are blocked by default under RLS.

-- ============================================================
-- Password-gated read access
-- Instead of exposing the powerful service_role key in the results page
-- (which anyone could copy from page source), we use a Postgres function
-- that checks a password server-side and only then returns the data.
-- The results page only ever uses the safe, public anon key.
-- ============================================================

create or replace function get_discovery_responses(input_password text)
returns setof discovery_responses
language plpgsql
security definer
as $$
begin
  -- CHANGE THIS PASSWORD before deploying — see instructions below
  if input_password != 'flexfitness2026' then
    raise exception 'Incorrect password';
  end if;

  return query select * from discovery_responses order by submitted_at desc;
end;
$$;

-- Allow the anon key to call this function (the function itself enforces the password)
grant execute on function get_discovery_responses(text) to anon;

-- ============================================================
-- WhatsApp AI Knowledge & Guardrails — second-stage questionnaire
-- (whatsapp-knowledge.html). One row per owner-approved submission.
-- Draft-in-progress state lives in the browser's localStorage, not here —
-- this table only receives the final, one-time, owner-approved submission,
-- so it can reuse the same insert-only RLS pattern as discovery_responses
-- (no update permission needed for anon).
-- ============================================================

create table if not exists chatbot_knowledge_responses (
  id uuid primary key default gen_random_uuid(),
  gym_name text,
  answers jsonb not null,       -- full raw questionnaire answers, keyed by field id
  outputs jsonb not null,       -- pre-computed structured outputs (FAQ KB, guardrails, escalation matrix, etc.)
  approved boolean not null default false,
  approved_by text,             -- "Who gives final approval" answer
  submitted_at timestamptz not null default now()
);

create index if not exists idx_knowledge_submitted on chatbot_knowledge_responses(submitted_at desc);

alter table chatbot_knowledge_responses enable row level security;

drop policy if exists "Anyone can submit chatbot knowledge" on chatbot_knowledge_responses;
create policy "Anyone can submit chatbot knowledge"
  on chatbot_knowledge_responses
  for insert
  to anon
  with check (true);

-- Same password-gated read pattern as discovery responses.
create or replace function get_knowledge_responses(input_password text)
returns setof chatbot_knowledge_responses
language plpgsql
security definer
as $$
begin
  if input_password != 'flexfitness2026' then
    raise exception 'Incorrect password';
  end if;

  return query select * from chatbot_knowledge_responses order by submitted_at desc;
end;
$$;

grant execute on function get_knowledge_responses(text) to anon;
