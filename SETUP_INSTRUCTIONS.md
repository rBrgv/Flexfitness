# Flex Fitness Discovery — Setup Guide

Three files, three steps. Do them in this order.

---

## Step 1 — Create the Supabase project

1. Go to supabase.com → Sign up / log in → **New Project**
2. Name: `flex-fitness-discovery` (or anything) · Region: Singapore (closest to India) · set a DB password and save it
3. Wait ~2 minutes for it to finish provisioning

## Step 2 — Run the database setup

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New Query**
2. Open `supabase_schema.sql` (provided alongside this guide), copy all of it, paste into the SQL editor
3. **Before running it**, find this line near the bottom and change the password:
   ```sql
   if input_password != 'flexfitness2026' then
   ```
   Replace `'flexfitness2026'` with whatever password you want to use to view results. Keep the quotes.
4. Click **Run**. You should see "Success. No rows returned."

## Step 3 — Get your API keys

1. In Supabase: **Project Settings** (gear icon) → **API**
2. Copy the **Project URL** (`https://xxxxx.supabase.co`)
3. Copy the **anon public** key (long string — NOT the `service_role` one)

## Step 4 — Connect the two HTML files

Open `Flex_Fitness_Discovery_Form.html` in a text editor. Near the top of the `<script>` section, find:
```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
```
Replace both with your actual values from Step 3.

Do the exact same thing in `Flex_Fitness_Discovery_Results.html`.

Both files need the same two values — they're using the same database, just one writes (the form) and one reads (the results page, password-protected).

## Step 5 — Put both files on GitHub Pages

1. Create a new GitHub repo (e.g. `flex-fitness-discovery`) — can be public, no sensitive data is exposed (see "Is this safe?" below)
2. Upload both HTML files to the repo — rename them if you like, e.g.:
   - `index.html` ← the discovery form (this becomes your main link)
   - `results.html` ← the password-protected results page
3. Go to repo **Settings → Pages** → under "Build and deployment," set **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)` → Save
4. Wait 1-2 minutes. Your links will be:
   - Form: `https://yourusername.github.io/flex-fitness-discovery/index.html`
   - Results: `https://yourusername.github.io/flex-fitness-discovery/results.html`

Send the **form** link to everyone. Only you open the **results** link.

---

## Is this safe? (worth understanding, not just trusting)

- The **anon key** is safe to expose publicly — it's designed to be embedded in browser-facing apps. On its own it can only INSERT new responses, nothing else. It cannot read, edit, or delete anything, because of the Row Level Security policy in the schema.
- The **results password** is checked inside the database itself (a Postgres function), not in the HTML/JavaScript. Someone viewing the page source of the results page cannot find or bypass the password — the check happens server-side in Supabase, every time.
- Never paste your `service_role` key into either HTML file. That key bypasses all security and must never appear in anything public.

## Changing the results password later

Go back to Supabase → SQL Editor → run:
```sql
create or replace function get_discovery_responses(input_password text)
returns setof discovery_responses
language plpgsql
security definer
as $$
begin
  if input_password != 'YOUR_NEW_PASSWORD_HERE' then
    raise exception 'Incorrect password';
  end if;
  return query select * from discovery_responses order by submitted_at desc;
end;
$$;
```

## Checking data directly in Supabase (alternative to the results page)

Supabase Dashboard → **Table Editor** → `discovery_responses` shows every row directly, including the `answers` column as JSON. Useful for exporting to Excel: click **Export** in the table editor toolbar.

## If something breaks

- Form submits but results page shows nothing → double check both files have the exact same SUPABASE_URL and SUPABASE_ANON_KEY.
- "Incorrect password" even though it's right → make sure you ran the SQL again after changing the password (Step in "Changing the results password later"), and that you're not including extra spaces.
- Form shows "Couldn't save automatically" → check the browser has internet access; the person's answers are still shown on screen and can be copied to WhatsApp as a fallback either way.
