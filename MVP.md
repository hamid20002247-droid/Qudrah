# قُدرة (Qudrah) — Qudurat Quant MVP — Full Build Spec (v2.0, standalone)

> **Read this first.** This is a **complete, self-contained specification** for a brand-new product. It assumes **no prior code, no prior project, and no prior context**. Everything needed to understand and build the MVP is explained here from scratch. If you are an AI assistant or a developer opening this for the first time: this document is your single source of truth.

---

## 0. What we are building, in one breath

A **free, Arabic-first, mobile web app** that helps Saudi high-school students prepare for the **quantitative (math) section of the Qudurat exam** — not by memorizing, but by **seeing a concept move (interactive visual) → learning a fast trick → drilling timed practice questions.**

The whole point of this first version (the **MVP**) is **not to make money**. It is to **cheaply test three things**:
1. Do short videos of our interactive visuals **spread** among Saudi teenagers on TikTok/Snapchat?
2. Once students arrive, do they **actually use it** (finish practice, come back, ask for more)?
3. Is there any sign they would **pay later**?

There is **no login, no signup, no payment** in this version. On purpose.

---

## 1. Background: what is the Qudurat exam? (explained from zero)

**Qudurat** (Arabic: اختبار القدرات العامة, also called **GAT** — General Aptitude Test) is a standardized test in **Saudi Arabia**, run by a government body (ETEC / Qiyas). It is used for **university admission** and is extremely high-stakes: a student's score heavily influences which university and major they can enter. Families care about it intensely, and exam anxiety is high.

**Structure (facts that shape our product):**
- The full test is **~120 multiple-choice questions** (paper version) or **~96** (computer version), split into **5 sections of 24 questions**, **25 minutes per section**, ~2 hours 5 minutes total.
- It has **two parts that alternate**: **verbal (لفظي)** and **quantitative (كمي)**. **We only care about the quantitative (math) part.**
- **Quantitative size depends on the student's track:**
  - **Science track (علمي):** ~**52** quantitative questions. **← our primary audience.**
  - **Theoretical/literary track (نظري/أدبي):** ~**30** quantitative questions, and **algebra is not tested** for them.
- **Quantitative topics and rough weights (science track):**
  - **Arithmetic (الحساب) ~40%** — percentages, ratios, rates, averages, buying/selling. **← the ONLY topic we build in the MVP.**
  - Geometry (الهندسة) ~24%.
  - Algebra (الجبر) ~23%.
  - Data analysis & statistics (تحليل البيانات) ~13%.
  - "Comparison" (المقارنات) questions appear across all topics.
- **Critical insight about the exam's nature:** it is a **speed + pattern-recognition test, not a knowledge test.** Students get **~63 seconds per question**. Questions in each section go from **easy → hard**. Successful students use **shortcuts and tricks** (e.g. plugging answer choices back in, estimating) rather than full formal math, and they **drill lots of practice questions** until patterns become automatic.

**Why this matters for design:** students do **not** primarily want deep understanding — they want to **answer correctly and fast**. So our product must lead with **speed and tricks**, and use the interactive "understanding" visual as the *reason the trick works*, not as the headline.

---

## 2. The core idea and why it can work

### 2.1 The gap in the market
Existing Saudi exam-prep apps (large, well-funded ones) mostly teach with **videos + question banks** — passive watching and repetitive drilling. **Nobody teaches with interactive, manipulable visuals** where the student drags a slider and *sees why* something is true. Global leaders (Khan Academy, Duolingo) have shown this interactive style is the future of learning — but not in Arabic, not for this exam.

### 2.2 Our wedge (the one thing we do better)
> **"Understand the trick by seeing it, then solve faster."**

For each math pattern we show:
1. **A 10–15 second interactive visual** — the student drags something and watches the idea change. This is also our **marketing**: each visual becomes a short vertical video.
2. **The trick / shortcut** — stated plainly, with a target time (e.g. "solve this in 20 seconds").
3. **Timed practice** — 5–8 real-style questions of exactly that pattern, with instant feedback explaining *why the wrong answers are traps*.

### 2.3 The honest tension (and our answer)
The exam rewards **cramming and speed**; our strength is **understanding**. If we lead with "understand deeply," students leave for faster free options. So we **lead with speed and tricks**, and quietly deliver understanding underneath as the thing that makes the trick stick and raises the score.

### 2.4 Positioning line (Arabic)
> *"قدرات كمي: افهم الحيلة بالتصوّر، وحُلّ أسرع — مو بالحفظ."*
> *(Qudurat quant: understand the trick by seeing it, and solve faster — not by memorizing.)*

---

## 3. Scope of the MVP

### 3.1 What this MVP MUST do (and nothing more)
- Cover **one topic only: Arithmetic (الحساب)** — percentages, ratios, rates, averages, buy/sell.
- Present **6–8 "skills"** (one math pattern each), each with: interactive visual + trick + timed practice.
- Provide **one timed mini-mock exam** (~12 questions, ~12 minutes) that *feels like the real test*, then show a **score + weak-spot breakdown**.
- Be **Arabic, right-to-left (RTL), mobile-first**, and fast — including inside the in-app browsers of TikTok/Snapchat.
- **Measure everything** (analytics) so behavior — not opinions — tells us if it works.
- Have **no login, no signup, no payment.**

### 3.2 What this MVP MUST NOT include (cut ruthlessly)
- ❌ Accounts / login / signup.
- ❌ Payments, paywalls, pricing.
- ❌ Native mobile app (iOS/Android). **Web only** for now.
- ❌ Other topics (geometry, algebra, data) or the verbal section.
- ❌ The full syllabus. Just 6–8 arithmetic patterns.
- ❌ Leaderboards, friends, chat, social features.
- ❌ A content management system (CMS). Content is written directly in code files.
- ❌ A truly "adaptive" engine. The mock is a fixed pool with light shuffling.

### 3.3 "Done" definition
4 screens live on a public URL (Arabic RTL, mobile-first) + 6–8 arithmetic skills + 1 timed mini-mock with results + analytics firing on every step + 5–8 promo video clips posted.

---

## 4. Who the user is

| Attribute | Detail | What it means for us |
|---|---|---|
| Who | Saudi Grade 11–12 students (+ people retaking the exam), **science track first** | Teenage tone, casual **Saudi dialect** Arabic — not formal/classical Arabic |
| Device | Mostly **mobile phones**; often opened from inside **TikTok/Snapchat** in-app browsers | Must be light, fast, and work in restrictive in-app browsers |
| Language | **Arabic, right-to-left (RTL)** | Entire UI mirrored; use **Western digits 0-9** (that's what the real exam uses) |
| Mood | Anxious, time-pressured, wants a quick win | Deliver value in <10 seconds; show urgency (countdown to their test) |
| Money | The **student** uses it; a **parent** would pay later | MVP is student-only; no payment yet |
| Habits | Trades practice questions, drills a lot, lives on TikTok/Snap | Use their words (الكمي، الحيلة، اختصار); make practice feel native |

**Important honesty:** the founder is **not** Saudi. That creates two real risks — (1) our Arabic phrasing might sound "foreign" and flop on social media, and (2) we might get exam details subtly wrong. **Both are mitigated by a human reviewer** (see §10) who checks all content and copy before it goes public.

---

## 5. What to build — components & concepts explained from scratch

This section explains every non-obvious piece so a fresh developer/AI can build it with no outside references.

### 5.1 A "Skill" (مهارة) — the core content unit
A **Skill** is one arithmetic pattern (e.g. "percent change"). It bundles a visual, a trick, and practice questions. Represent it as a typed object in a content file:

```ts
type Skill = {
  id: string;                 // "percent-change"
  title_ar: string;           // "التغير المئوي"
  domain: "arithmetic";
  hook_ar: string;            // one-line promise, e.g. "بدون آلة حاسبة، احسبها في ثواني"
  visual: VisualSpec;         // the interactive visual (see 5.2)
  intuition_ar: string[];     // 1–2 short lines explaining the "why"
  trick_ar: {                 // the shortcut
    statement: string;
    steps: string[];
    time_target_sec: number;  // e.g. 20
  };
  drill: Question[];          // 5–8 practice questions, ordered easy→hard
};
```

### 5.2 An "interactive visual" — what it is and how to build it
This is our differentiator. It is **a small interactive widget where the student drags a slider (or handle) and watches numbers/shapes update live.** It is NOT a video and NOT a static image.

**How to build it (simple, no special library needed):**
- A React client component (`"use client"`).
- One or more `<input type="range">` sliders (or draggable SVG handles) held in React state.
- An **SVG** (or `<canvas>`) that re-renders from that state — e.g. a bar whose fill width = a percentage, or two quantities being compared.
- Text that updates live (e.g. "زيادة 25% → ×1.25").

Define a small spec so visuals are data-driven and easy to add:
```ts
type VisualSpec =
  | { kind: "percent_bar"; base: number; min: number; max: number }
  | { kind: "ratio_split"; parts: number[] }
  | { kind: "number_line"; from: number; to: number }
  | { kind: "custom"; component: string };  // name of a bespoke React component
```
Start with **2–3 simple kinds** (`percent_bar`, `ratio_split`) and add more as needed. **Every visual must fit a 9:16 vertical "safe area"** so it can be screen-recorded into a TikTok/Snap clip.

### 5.3 A "Question" — practice / mock item
For the MVP, all questions are **multiple choice (MCQ)** — this keeps grading trivial (compare the chosen index to the correct index). No fancy math parsing needed yet.

```ts
type Question = {
  id: string;
  prompt_ar: string;                 // the question text (may contain math)
  choices_ar: string[];              // 4 options
  correct_index: number;             // 0–3
  trap_explanations_ar: Record<number, string>; // why each WRONG choice is tempting/wrong
  trick_ref?: string;                // which shortcut applies
  difficulty: "easy" | "mid" | "hard";
  sub_pattern: string;               // e.g. "percent", "ratio" — used for weak-spot breakdown
  source: string;                    // provenance note (see 6.4), e.g. "practice-book-2024-p88"
  review_status: "draft" | "approved";
  reviewed_by?: string;
  reviewed_at?: string;              // ISO timestamp
};
```
**Grading logic (MVP):** `chosenIndex === correct_index`. That's it. (Advanced "typed-answer" grading with a math engine is a *future* option, not needed now.)

### 5.4 Rendering math text
Some prompts contain math (fractions, exponents). Render them with **KaTeX** (a fast, lightweight math-typesetting library). Wrap math in a small helper component that takes a LaTeX string and outputs KaTeX HTML. For simple arithmetic you can often just use normal Arabic text + Western digits; use KaTeX only where needed.

### 5.5 Local state & "progress" without accounts
Because there is no login, we store the student's progress **on their own device** using the browser's `localStorage`, managed via **Zustand** (a tiny React state library). Store:
- which skills are started/completed and best time,
- last mock score,
- optional "test date" for a countdown,
- a simple daily "did you practice today?" streak counter,
- an anonymous random `device_id` (a UUID) used only for analytics.

> ⚠️ **Caveat:** TikTok/Snapchat in-app browsers sometimes **wipe `localStorage`**. So treat on-device progress as best-effort, and rely on **analytics (PostHog) person tracking** to measure returning users. Do not build anything critical that depends on localStorage surviving.

### 5.6 The reviewer preview gate (built from scratch — see §10)
A simple password (PIN) wall that lets a trusted reviewer see **draft** (not-yet-approved) content before it goes public. Explained fully in §10.

---

## 6. Content model & how content is authored

### 6.1 Where content lives
As **typed TypeScript files in the repo**, e.g. `content/arithmetic/percent-change.ts` exporting a `Skill`. A separate file exports the **mock question pool**. No database or CMS for content in the MVP.

### 6.2 The arithmetic skills to build (priority order)
1. **Percentages & percent change** (النسبة المئوية، التغير المئوي) — most frequent.
2. **Ratios & proportions** (النسب والتناسب).
3. **Averages / weighted average** (المتوسط الحسابي والمرجح).
4. **Speed / rate / work** (السرعة والمعدل والعمل).
5. **Buy/sell, profit/loss, discount** (البيع والشراء، الربح والخسارة، الخصم).
6. **Fractions & benchmark comparisons** (الكسور والمقارنات).
7. *(stretch)* Successive percentages (زيادة ثم خصم — a classic trap).
8. *(stretch)* Number-sense / divisibility tricks.

### 6.3 The mini-mock pool
~20–30 approved MCQs spanning the sub-patterns above, tagged by `sub_pattern` and `difficulty`, so the mock can pick ~12, order them easy→hard, and compute a weak-spot breakdown.

### 6.4 Accuracy pipeline (mandatory — this is high-stakes)
One wrong answer in an exam-prep app destroys trust instantly. So, before ANY question is shown publicly:
1. **Study real material:** gather 20–30 real arithmetic questions from **publicly available practice books / prep websites** (2026). **Never use leaked or official ETEC exam items** — that is a copyright and reputational risk.
2. **Write original questions** modeled on that *style* and those *trap patterns*.
3. **Solve each question twice** (independently) to confirm the answer.
4. **Human review & approval** (see §10) sets `review_status: "approved"`. Only approved content is public.
5. **Record provenance** (`source`) on every item for traceability.

> **Naming/legal note:** the exam is called "قدرات/Qudurat" (an ETEC term). We use it **descriptively** (to say which exam we help with) but our **brand is قُدرة (Qudrah)** — the singular word for "ability" — and we **never imply official affiliation** with ETEC/Qiyas.

---

## 7. Screens & navigation (information architecture)

```
/                     Landing (hook + 1 live interactive + 1 real tappable question + button)
/skills               List of arithmetic skills — the "map"
/skill/[id]           One skill: visual → trick → timed practice
/mock                 Timed mini-mock (~12 questions, ~12 minutes, countdown)
/result               Score + weak-spot breakdown + optional "notify me"
/about                One line about + the Snap/TikTok handle
/review               PIN-gated: reviewer sees drafts and approves them
```
- **Top bar:** قُدرة logo on the **right** (RTL), optional "days until your test" chip on the left.
- **Main flow is linear:** Landing → Skill → (repeat) → Mock → Result.
- **Sticky bottom button** on mobile always shows the best next action.
- **Nothing is locked** (this is a free validation MVP).

---

## 8. Screen-by-screen UI/UX (detailed)

> Global rules: **RTL** layout; design mobile-first at ~390px width; **Arabic** copy; **Western numerals (0-9)**; font **Tajawal** (fallback: IBM Plex Sans Arabic); tap targets ≥44px; no layout shift; the interactive loads instantly.

### 8.1 Landing (`/`)
**Goal:** in under 10 seconds, prove "this is for MY exam and it's different," get a tap, and capture an early engagement signal.
- Top bar: **قُدرة** wordmark (right); optional "أيام على اختبارك" chip (left).
- **Headline (H1):** *"قدرات كمي: افهم الحيلة، وحُلّ أسرع."*
- **Subline:** *"من غير حفظ. شوف الفكرة تتحرك، وامسك الاختصار."*
- **One live interactive** (the real widget, e.g. a draggable percent bar). It subtly idle-animates to invite a drag.
- **One real, tappable multiple-choice question** right on the landing. Answering it fires an analytics event (early proof of engagement, before they go deeper).
- **Primary button:** `ابدأ الآن — بدون تسجيل` → `/skills`.
- **Secondary link:** `جرّب محاكاة الاختبار` → `/mock`.
- Small trust line: *"أسئلة على نمط الاختبار الحقيقي."*
- Below the fold: 3 value props (بالتصوّر / موقوت مثل الاختبار / حِيَل توفّر وقتك) + a few skill teaser chips.
- Must work inside TikTok/Snapchat in-app browsers (test this explicitly).

### 8.2 Skills list (`/skills`)
- Title *"المهارات — الحساب"* + a small progress ring (e.g. "٢/٦ خلصت").
- Vertical **skill cards**: icon + title + one-line hook + a state chip (`جديد` / `بدأت` / `متقن ✓`) + estimated time ("٣ دقائق").
- Sticky bottom button: `ابدأ المحاكاة الموقوتة`.
- Order by exam frequency (not alphabetical). Nothing locked.

### 8.3 Skill screen (`/skill/[id]`) — the core loop
Three phases on one scrollable screen (or a 3-step stepper):
- **Phase A — See it (التصوّر):** the interactive visual is front and center; caption *"حرّك وشوف وش يصير."* One or two intuition lines appear as they interact.
- **Phase B — The trick (الحيلة):** a highlighted box *"الاختصار:"* with the shortcut in 1–3 steps, a **time-target badge** *"الهدف: ٢٠ ثانية للسؤال،"* and one quick worked example.
- **Phase C — Practice (تدرّب):** 5–8 MCQs, one at a time, easy→hard, with a subtle per-question timer.
  - **Correct:** turn green, show *"ممتاز — بالاختصار كان أسرع"* + time taken.
  - **Wrong:** mark the chosen answer red, the correct one green, and show the **trap explanation** *"ليش ذا خطأ: …"* (this is where understanding sneaks in).
  - Progress dots at top; end summary (X/Y correct, avg time) + `المهارة التالية` button.
- Never block on a wrong answer. Save skill progress + best time to localStorage. A `شارك اللي فهمته` button copies a link (a fancy share-image is a *stretch* goal).

### 8.4 Timed mini-mock (`/mock`)
- **Intro card:** *"١٢ سؤال — ١٢ دقيقة — مثل جو الاختبار. جاهز؟"* + `ابدأ`. (≈63 seconds/question, matching the real exam.)
- **During:** a large **countdown timer**; one question at a time; 4 choices; `التالي` / `تخطّي` buttons; a question counter (`٤ / ١٢`) and thin progress bar; **no feedback shown during the mock** (like the real test).
- **Auto-submit** when time runs out or the last question is answered.
- Pick ~12 questions across sub-patterns, order easy→hard, lightly shuffle each attempt. Store the attempt (score, per-sub-pattern breakdown, total time) in localStorage.

### 8.5 Result / weak-spots (`/result`)
- **Big score:** `٩ / ١٢` + a friendly message band (e.g. *"قريب — ركّز على نقطتين وترتفع"*).
- **Weak-spot bars** per sub-pattern (النسب ✓ / المتوسط ✗ / السرعة ⚠) with "تدرّب على ذا" links back to the relevant skill.
- **Time insight:** average time per question vs the 63-second target.
- **Comeback hooks:** `أعد المحاولة`, and optional *"حدد تاريخ اختبارك"* to set the days-to-test countdown.
- **Soft "notify me" (NOT a paywall):** *"تبي باقي المهارات والمحاكاة الكاملة أول ما تنزل؟ سجّل إيميلك/جوالك."* → saves the contact (see §12) and fires an analytics event. This is our gentle way to gauge interest without asking for money.

---

## 9. Retention mechanics (without accounts)
- **Streak-lite:** a "practiced today?" day counter in localStorage.
- **Days-to-test countdown:** the strongest urgency lever; set on the result screen.
- **"Continue where you left off"** chip on the landing if saved progress exists.
- **Best-score memory** to enable "beat your score."

(Remember the localStorage caveat in §5.5 — measure real return with analytics, not just device data.)

---

## 10. Content review workflow (built from scratch)

**Who reviews:** the **founder**, or **a delegate the founder trusts** and gives the review PIN to.

**Why:** because the founder isn't Saudi, every question and every piece of Arabic copy must be checked for **math correctness, natural Saudi dialect, exam-style fidelity, and clear trap explanations** before the public sees it.

**How to build the gate (simple, no accounts):**
1. Each `Skill`/`Question` has a `review_status` of `"draft"` or `"approved"`.
2. **Public routes render only `"approved"` content.** Draft content is filtered out.
3. Build a **`/review` page protected by a PIN**:
   - A secret PIN is stored in an environment variable (e.g. `REVIEW_PIN`), **never committed to the repo**.
   - The reviewer visits `/review`, enters the PIN; on success set a signed **HTTP-only cookie** (e.g. `review_session`).
   - Middleware (or a server check) allows viewing drafts only when that cookie is valid.
4. On `/review`, the reviewer sees each draft item, checks it, and marks it approved. In the MVP, "approving" can simply mean flipping `review_status` to `"approved"` in the content file (a small dev step) or, if you prefer, writing the approval to the `questions_audit` table (see §12) so approvals persist.
5. Record `reviewed_by` and `reviewed_at` for traceability.

> This gives a real accuracy gate **without building any login system** — a shared PIN is enough for a trusted reviewer.

---

## 11. Technology stack (with reasons)

**Guiding rule:** ship a web MVP in days, but choose tools so that **adding accounts, payments, and native apps later requires no rewrite.**

### 11.1 Frontend (web)
| Layer | Choice | Why (and alternatives rejected) |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19** | Best for **Arabic RTL + SEO** (Google must index pages for searches like "قدرات", "الكمي") and for mixing static pages with interactive client "islands". Rejected: plain Vite SPA (poor SEO), Astro (less React interactivity). |
| Language | **TypeScript** (strict mode) | Safer as the codebase grows toward web + native. |
| Styling | **Tailwind CSS v4**, using **logical properties** (`ps-`, `pe-`, `text-start`/`text-end`) | Utility CSS is fast to build with; logical properties make **RTL** work automatically. |
| Math rendering | **KaTeX** | Fast, lightweight math typesetting for prompts that need it. |
| Client state | **Zustand** (persisted to `localStorage`) | Tiny, simple. Rejected: Redux (too heavy for this). |
| Analytics | **PostHog** | Free-tier friendly; funnels, session replay, and merging anonymous → known users. Central to measuring success. |
| PWA | Web app manifest + a minimal service worker | Makes the site installable and fast; sets up for a native wrapper later. |

### 11.2 Backend & database (start the "seam" now, use it minimally)
| Layer | Choice | Why (and alternatives rejected) |
|---|---|---|
| Backend + DB | **Supabase** (managed **PostgreSQL** + Auth + storage + edge functions) | A relational DB fits our future data (users, attempts, questions, subscriptions). Supabase has built-in **phone/OTP login** (how Gulf users authenticate), **row-level security**, and works from both web and native with one client. Rejected: **Firebase** (NoSQL is a poor fit for our relational/analytical data; more lock-in); self-hosted DB (too much ops for a solo founder). |
| MVP usage | Only two tables: **`notify_leads`** and **`questions_audit`** (see §12) | The MVP mostly runs on localStorage + PostHog; we create the DB now only so the future path is ready. |
| Hosting | **Vercel** (web) + **Supabase** (data) | Vercel is the smoothest host for Next.js (instant preview URLs help sharing test builds). |

### 11.3 The native app, later (decide the philosophy now)
| Option | What it is | When to choose |
|---|---|---|
| **A — Capacitor** *(preferred first)* | A tool that wraps the **same web app** into installable iOS/Android apps with minimal changes | Default: reuses everything we build; can ship to app stores in days |
| **B — React Native / Expo** | A separate, truly-native codebase (shares logic but not UI with the website) | Only if data later proves we need a more polished native feel |

### 11.4 Payments, later (not in MVP)
- **RevenueCat** to manage Apple/Google in-app subscriptions.
- **Moyasar** or **Tap** for Saudi web payments (Mada / STC Pay).

### 11.5 One-line summary
**Next.js 15 + React 19 + TypeScript + Tailwind v4 (RTL) + KaTeX + Zustand/localStorage + PostHog** for the MVP → **Supabase (Postgres + phone auth)** as the ready-but-minimal backend → **Capacitor** to ship a native app later (Expo only if needed) → **RevenueCat + Moyasar/Tap** when we add payments. Hosted on **Vercel + Supabase**.

---

## 12. Data model (minimal now, future-proofed)

**MVP tables (Supabase / Postgres):**
```sql
-- captured from the optional "notify me" box (no account)
notify_leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null,          -- email or phone
  contact_type text,              -- 'email' | 'phone'
  device_id text,                 -- the anonymous analytics id
  test_date date,                 -- if they set a "days to test" date
  created_at timestamptz default now()
);

-- optional: persist question review approvals + provenance
questions_audit (
  id text primary key,            -- question id
  sub_pattern text,
  source text,                    -- provenance
  review_status text,             -- 'draft' | 'approved'
  reviewed_by text,
  reviewed_at timestamptz,
  updated_at timestamptz default now()
);
```

**Future tables (design them mentally now, build later):** `users` (via Supabase auth), `attempts` (mock/practice results), `skill_progress`, `subscriptions`, `score_history` — all keyed by `user_id`, so converting an anonymous device into a logged-in user is a **data backfill, not a rewrite**.

---

## 13. Analytics — the whole point of the MVP

Wire **PostHog** from the very first commit. Give each visitor an anonymous `device_id`, and capture where they came from (`utm_source` / referrer) so we can tell **organic traffic (from our clips)** apart from **people the founder personally messaged**.

**Events to fire:**
`landing_view {traffic_source}` · `interactive_engaged` (dragged the landing widget) · `landing_question_answered {correct}` · `cta_start_clicked` · `skill_opened {skill_id}` · `visual_interacted {skill_id}` · `trick_viewed {skill_id}` · `drill_question_answered {skill_id, q_id, correct, time_ms}` · `skill_completed {skill_id, score, avg_time}` · `mock_started` · `mock_completed {score, per_sub_pattern, total_time}` · `result_view` · `share_clicked {surface}` · `notify_me_submitted {contact_type}` · `returned_session {days_since_last}`

**Three dashboards to watch:**
1. **Distribution:** organic vs. messaged traffic; visits per clip; how many landing visitors tap "start".
2. **Engagement/return:** % who finish a skill, % who finish the mock, how many come back on day 1/3/7, % who submit "notify me".
3. **Content quality:** each question's correct-rate and average time (flags a broken or confusing question).

---

## 14. Distribution — how students will find it

The visuals are also the marketing.
- Make **5–8 vertical (9:16) video clips**, each a screen-recording of one arithmetic trick made obvious by dragging the visual. Hooks in Saudi dialect: *"لا تحفظها — شوفها"*, *"وفّر ٤٠ ثانية بالسؤال ذا"*.
- Post to **TikTok, Snapchat Spotlight, Instagram Reels, YouTube Shorts**. Target search words: قدرات، الكمي، اختصارات قدرات، القسم الكمي.
- **Every clip ends with the website link** (no signup barrier → high click-through).
- **The reviewer checks the dialect/copy of every clip before posting.**
- Seed a few Saudi student "study" accounts with the free link.

---

## 15. Success criteria & stop conditions (decide before launch)

| Test | What we measure | Pass | Fail → what we do |
|---|---|---|---|
| **1. Distribution (make-or-break)** | Organic (non-messaged) visits from clips | Clips get real Saudi views/shares; visitors arrive on their own | Only people we messaged show up → the outsider-distribution problem is real → **consider pivoting to the French-speaking North-African (Maghreb) exam market**, where the founder is a native and the same product idea applies |
| **2. Engagement/fit** | Mock completion + day-3/7 return + students asking "متى الباقي؟" | Students finish the mock, return, and ask for more | One-and-done, no return, or they only want raw question dumps → the "understanding" wedge doesn't match what they want |
| **3. Intent** | "notify me" submissions | A meaningful share leave contact info | Almost nobody does → value/positioning is off |

> Give it about **2 weeks** after the clips go live. Let **behavior**, not compliments, decide.

---

## 16. Build order (by risk, not by feature)

**Build the cheapest test of the most dangerous assumption first.**

### Phase 0 — Distribution test (Days 1–2): *does it spread?*
- Set up the Next.js RTL project + PostHog (with traffic-source tracking).
- Build the **Landing** (one live interactive + one real tappable question + the button).
- Build **2 full skills** (percent-change + ratios): visual → trick → practice.
- Record **5–8 clips**, get them dialect-checked, and post them.
- **Decision gate:** are real Saudi visitors arriving on their own? If **no**, stop and reconsider the market **before** building anything else.

### Phase 1 — Engagement test (Days 3–4): *do they use it & return?* (only if Phase 0 passed)
- Author + review **4–6 more arithmetic skills**.
- Build the **timed mini-mock** (~12 questions / ~12 minutes).
- Build the **result screen** (score + weak-spots + "notify me" + copy-link).
- Add Zustand + localStorage progress.
- Create the Supabase `notify_leads` table and wire the "notify me" box.
- **Decision gate:** mock completion, day-3/7 return, and "notify me" signal.

### Phase 2 — Polish & measure (Day 5)
- Test thoroughly on real phones and inside TikTok/Snapchat browsers; fix RTL bugs; tune performance.
- Confirm every analytics event fires; set up the 3 dashboards.
- Keep posting clips; read behavior for ~2 weeks.

### Phase 3+ — Only if validated (later)
- Add accounts (Supabase phone login) → real streaks & retention.
- Add the rest of the quant syllabus → geometry, algebra, data → then the verbal section.
- Ship a native app (Capacitor first).
- Add payments (RevenueCat + Moyasar/Tap): a free tier + a paid "exam sprint" bundle.

---

## 17. Risks & how we defuse them

| Risk | Why it's real | How we handle it |
|---|---|---|
| **A wrong math answer** | Destroys trust instantly in a high-stakes exam app | Model on published practice questions, solve twice, human-review gate, keep provenance |
| **Using leaked/official exam content** | Copyright + reputational danger | Only original questions modeled on *style*; never store official/leaked items; brand ≠ exam name |
| **Foreign-sounding Arabic** | Non-native phrasing flops on Saudi social media | A Saudi-fluent reviewer checks all copy and clips before publishing |
| **Clips don't spread** | This is the make-or-break assumption | Phase 0 tests it cheaply; if it fails, pivot markets instead of building more |
| **"Understanding" isn't what they want** | The exam rewards speed/cramming | Lead with speed + tricks + timed practice; understanding is the backing, not the pitch |
| **In-app browsers wipe local data** | TikTok/Snap browsers are restrictive | Treat local progress as best-effort; measure return via PostHog |
| **Doing too much** | A solo founder can't build everything | Hard freeze: arithmetic only until Tests 1 & 2 are answered |

---

## 18. Locked decisions (no open questions)

1. **First topic:** Arithmetic only. **First audience:** Science track (علمي); clips use inclusive wording *"للقسم الكمي."*
2. **Question sources:** original questions written in-house, modeled on **publicly available** practice material. **Never** leaked/official ETEC items. Provenance recorded per question.
3. **"Notify me" storage:** Supabase `notify_leads` table + a PostHog event. No account.
4. **Brand & look:**
   - **Name/wordmark:** **قُدرة (Qudrah)** — "ability," deliberately distinct from the exam name "قدرات."
   - **Colors:** primary teal **#0D9488**; ink **#0F172A**; surfaces **#FFFFFF / #F8FAFC**; success **#16A34A**, error **#DC2626**, warning **#D97706**; "trick" highlight amber **#F59E0B**.
   - **Font:** **Tajawal** (fallback IBM Plex Sans Arabic). **Western numerals 0-9.**
   - **Tone:** calm, confident, teenage-modern, anti-anxiety.
5. **Domain:** aim for **`qudrah.app`** (fallbacks `getqudrah.com`, `qudrah.io`) — check availability when purchasing. Name the Vercel and Supabase projects `qudrah`.
6. **Reviewer:** the **founder** or a **delegate given the review PIN** (§10). Public pages show **approved-only** content; drafts live behind the PIN at `/review`.

---

## 19. One-paragraph summary (pin this above your desk)

Build **قُدرة (Qudrah)**: a **free, no-login, Arabic (right-to-left), mobile web app** that teaches the **arithmetic part of Saudi Qudurat quant** (science track first) through a simple loop — **see the trick move (interactive visual) → grab the ~20-second shortcut → drill timed practice** — plus an **exam-like mini-mock (~12 questions / ~12 minutes)** and a **weak-spot result** that ends with an optional "notify me." Write **original questions modeled on publicly available practice material** (never leaked items), and have a **reviewer approve everything via a PIN-gated page** before it goes public. Use **Next.js + React + TypeScript + Tailwind (RTL) + KaTeX + Zustand/localStorage + PostHog**, with **Supabase** as a minimal-but-ready backend and **Capacitor** for a native app later. **Build by risk:** Phase 0 (landing + 2 skills + clips) tests whether Saudi teenagers actually **share** it before building anything else. Watch behavior for two weeks: if the clips spread and students finish the mock and ask for more, expand to the rest of the exam; if the clips don't spread, don't build more — **take the same idea to the French-speaking North-African market, where the founder is a native.**
