## FC Recommender Backend API – Implementation Guidelines (MVP)

### Scope and principles
- Backend-only MVP. CSVs are the sole data source. No databases.
- Usable via Postman and ready for a future frontend.
- Deterministic and explainable outputs with clear fallbacks when data is missing.
- Keep it simple; avoid premature optimization.

---

### Tech stack
- Runtime: Node.js (LTS) + TypeScript
- Web framework: Fastify
- Parsing: `papaparse` or `csv-parse` (streaming), `strip-bom`
- Validation: `zod`
- File watching: `chokidar` (optional in MVP; `/admin/reload` provided)
- Logging: `pino`
- OpenAI: `openai` SDK (for GPT‑4o JSON conversion; optional)
- Env: `dotenv`

---

### Project structure (suggested)
```
/ src
  / models
    enums.ts           # canonical enums (gradingType, classMode, etc.)
    types.ts           # Course, Section, Ratings, Faculty, Joined models
    requests.ts        # zod schemas for API requests
    responses.ts       # response types
  / services
    dataLoader.ts      # CSV loading and normalization
    indices.ts         # in-memory indices and builders
    normalize.ts       # coercion, trimming, enum normalization
    scoring.ts         # section & course scoring
    facultyBoost.ts    # pedigree/experience heuristics
    assessmentTags.ts  # keyword tagging for assessment alignment
    gptWeights.ts      # formAnswers -> GPT‑4o weights (optional)
  / routes
    health.ts
    courses.ts
    sections.ts
    faculties.ts
    recommendations.ts
    admin.ts           # /admin/reload
  server.ts            # buildServer()
  index.ts             # bootstrap (load CSVs, start server)
/ config
  major_skill_map.json
  templates/           # persona/major weight defaults (JSON)
  keywords.json        # assessment alignment lexicon
  scoring_limits.json  # caps/penalties/curve params
/good-csvs             # data directory (existing)
```

---

### Environment variables
- `PORT` (default: 3000)
- `CSV_DIR` (default: `good-csvs`)
- `OPENAI_API_KEY` (required only if using GPT‑4o for formAnswers)
- `NODE_ENV` (development/production)

---

### CSV loading & normalization
- Files: `ashoka-course-schedule.csv`, `ashoka_courses_selenium.csv`, `ashoka_course_ratings_fixed.csv`, `ashoka_faculty_profiles.csv`.
- Trimming: trim all codes/emails/names; collapse internal whitespace; casefold emails.
- Enums:
  - `grading_type`: map to `absolute | relative | unknown` (normalize variants: "Class" -> unknown; handle typos).
  - `class_mode`: map to `offline | online | hybrid | unknown` (normalize variants; treat blank as unknown).
  - `extra_credit`: boolean or `unknown` (normalize `true/false/Reviews/Extra` → Reviews/Extra -> unknown/false; be conservative).
- Numbers: parse ratings to numbers; clamp rubric fields to [0,5]; `total_reviews` to non-negative int.
- Terms: retain `semester`; prioritize Monsoon 2025 for ratings usage; mark sections without 2025 ratings.
- Titles: backfill missing `course_title` in ratings from `course_title_table`.
- Assessment tags: from `description`/`requirements` via `config/keywords.json` (e.g., projects/exams/assignments/reading_load).

---

### In-memory indices (shapes)
- `courseByCode: Map<string, Course>` where key is `FC-xxxx` from schedule (ACTIVE only).
- `sectionsByCourse: Map<string, string[]>` mapping base `FC-xxxx` → array of `ls_code`.
- `sectionByLsCode: Map<string, Section>` from selenium rows.
- `ratingsBySection: Map<string, Ratings>` keyed by `ls_code` (section id in ratings `course_code`).
- `facultyByEmail: Map<string, FacultyProfile>` primary join; `facultyByName: Map<string, FacultyProfile[]>` normalized name fallback.

Rebuild all indices at startup; expose counts in logs. Provide `/admin/reload` to rebuild on demand.

---

### API endpoints (v1)

- GET `/health`
  - 200: `{ status: "ok", version: "v1" }`

- GET `/courses`
  - Query: `activeOnly` (default true)
  - 200: `[{ code, title, status, numSections, numRatedSections }]`

- GET `/courses/:code`
  - Params: `code` (e.g., `FC-0201`)
  - 200: `{ code, title, status, sections: [ { lsCode, title, hasRatings, gradingType, classMode, extraCredit } ], faculty: { names, emails } }`
  - 404 if unknown or inactive when `activeOnly=true` default.

- GET `/sections/:lsCode`
  - Params: `lsCode` (e.g., `FC-0201-3`)
  - 200: `{ lsCode, baseCode, title, semester, ratings?: { overall, rubric..., totalReviews }, metadata: { gradingType, classMode, extraCredit }, assessment: { tags: [] }, faculty: [{ name, email, profile?: { title, education, department, profileUrl } }], notes: ["No recent ratings"] }`
  - 404 if not found.

- GET `/faculties/:emailOrName`
  - Resolve by email first; fallback to normalized name match (may return multiple).
  - 200: `{ matches: [{ confidence, source: "email|name", profile }] }`

- POST `/recommendations`
  - Request (one of):
    - `{ formAnswers, options? }` → server calls GPT‑4o to get weights JSON.
    - `{ weights, hardConstraints?, options? }` → weights already provided by client.
  - `options`: `{ numPreferredSections?: number (default 2), detailedExplanations?: boolean (default false) }`
  - 200: `{ rankedCourses: [ { code, title, score, preferredSections: [ { lsCode, score, explanation, sources:[{ file, key }] } ], alternates: [...] } ], weightsUsed: {...}, profile?: {...}, warnings?: [...] }`
  - 400: if neither `formAnswers` nor `weights` supplied; or if GPT‑4o requested without API key.

- POST `/admin/reload`
  - 200: `{ reloaded: true, counts: { courses, sections, ratings, faculties } }`

All responses are JSON; include `X-API-Version: v1` header.

---

### Scoring & ranking (server-side)
- Normalize each component to [0,1].
- Components (if ratings exist): overall, transparency/fairness/lecturer/recommendation, grading ease (weighted only if GPA prioritized).
- Metadata matches: grading_type, class_mode, extra_credit; assessment alignment via tags.
- Confidence: review-count factor (log curve; cap), modulated by risk tolerance; small recency boost for Monsoon 2025.
- Faculty boost: parse title/education for seniority/pedigree keywords; cap total boost.
- No-ratings penalty: subtract small penalty; rely on metadata + faculty.
- Course score: max-of-top-2 section scores (or softmax average) per course.
- Tie-breakers: score → higher review count → recency → stable code order.

Return explanations and `sources` referencing CSV + key (`lsCode` or `Code`).

---

### Validation & errors
- `zod` schemas for requests; coerce synonyms to canonical enums.
- 400 shape: `{ error: "Bad Request", details: [...] }`
- 404 shape: `{ error: "Not Found", message: "Course FC-XXXX not found" }`
- Always include `warnings` array for partial data (e.g., missing ratings CSV).

---

### GPT‑4o integration (optional path)
- If `formAnswers` provided and `OPENAI_API_KEY` present:
  - Call GPT‑4o with a strict JSON output instruction and our schema.
  - Validate returned JSON with `zod`. If invalid, return 502 with guidance or fall back to template.
- If key missing or call fails: respond 400 with message, or fall back to template if one is selected via major.

---

### Config-first knobs (JSON files)
- `config/templates/*.json`: default weight sets per persona/major.
- `config/major_skill_map.json`: major → skills emphasis.
- `config/keywords.json`: tokens → assessment tags.
- `config/scoring_limits.json`: caps, penalties, and curve parameters (e.g., reviewCount cap, noRatingsPenalty).

These allow tuning without code changes.

---

### Logging & observability
- Use `pino` with request logging (method, path, status, duration).
- On startup/reload, log counts and a hash of loaded files (mtime + size) for sanity.
- In recommendations, log timing and which components dominated (at debug level).

---

### CORS & frontend readiness
- Enable CORS for `GET` and `POST` (origin `*` acceptable for MVP).
- Stable response shapes and version header.
- Include both compact (`explanation`) and verbose (`details` only when requested) fields.

---

### Local development & Postman
- `npm run dev` with ts-node/tsx; auto-reload on code changes.
- Sample `.env`:
```
PORT=3000
CSV_DIR=good-csvs
OPENAI_API_KEY=sk-...
```
- Create a Postman collection with the above endpoints and example bodies.

---

### Minimal testing (MVP)
- Smoke: server boots, `/health` 200.
- Data: counts after load match expectations; enums normalized.
- Routes: `/courses` returns 8 active codes; one `/sections/:lsCode` with ratings and one without.
- Scoring: deterministic tie-breakers; no crash on missing fields.

---

### Security (MVP)
- No auth; no PII stored.
- Rate limiting optional; document that `/admin/reload` is unauthenticated in MVP and should be restricted later.

---

### Future
- Add timetable data for clash avoidance.
- Persist feedback and anonymized telemetry when a DB is introduced.
- Versioned `/v1` path prefix once the frontend is attached.
