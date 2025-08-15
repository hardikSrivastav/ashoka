## FC Recommender – Monsoon 2025 Specification

### Purpose
A flexible two-level recommender to help incoming students rank the eight Foundation Courses (FC-0102 … FC-0801) from 1–8 and select preferred sections within each course for Monsoon 2025, tailored to each student’s priorities.

- Level 1: Rank base courses (`FC-xxxx`) 1–8.
- Level 2: For each base course, recommend “Preferred” sections (e.g., `FC-0201-2`).
- Scope: Only `Status = ACTIVE` courses, Monsoon 2025. Use ratings if present; otherwise flag the absence of ratings as a downside.

---

### Data Sources (good csvs/)
- `ashoka-course-schedule.csv` (base course schedule)
  - Columns: `LSNo`, `Code` (`FC-xxxx`), `Title`, `Faculty Names`, `Faculty Emails`, `Status` (ACTIVE/INACTIVE)
  - Use: Identify the eight base FCs to rank; filter to ACTIVE.

- `ashoka_courses_selenium.csv` (catalog/details per section)
  - Columns: `course_code` (base), `ls_code` (section, e.g., `FC-0201-3`), `course_title_table`, `description`, `learning_outcomes`, `requirements`, `faculty`/`faculty_table`, `attendance`, `category`, `title`
  - Use: Section-level details; assessment/readings cues; additional faculty info; course titles.

- `ashoka_course_ratings_fixed.csv` (per-section evaluations)
  - Columns: `course_code` (section id), `course_title`, `semester`, `overall_rating`, rubric fields: `transparent_grading`, `assignments_match_content`, `grades_easy`, `grades_fairly`, `good_lecturer_orator`, `course_recommended`, `total_reviews`, `grading_type`, `class_mode`, `extra_credit`
  - Use: Section-level scores and attributes; review counts; grading type; mode; extra credit.
  - Note: Some categorical noise in tail columns; `course_title` often blank. Use only when available for Monsoon 2025; otherwise call out missing ratings.

- `ashoka_faculty_profiles.csv` (faculty enrichment)
  - Columns: `target_name` (name), `email`, `title`, `education`, `department`, `profile_url`, `research_interests`, `found`
  - Use: Faculty pedigree/experience signals for boosts; join by email or name.

---

### Core Joins
- Section-level join: `ratings.course_code` (e.g., `FC-0201-3`) ↔ `selenium.ls_code`.
- Course-level join: `selenium.course_code` (`FC-xxxx`) ↔ `schedule.Code`.
- Faculty enrichment: `schedule.Faculty Emails` or `selenium.faculty_table` ↔ `faculty_profiles.email` (fallback to name match with `target_name`).

---

### User Intake (Short Form)
Keep the form lightweight; responses converted by GPT‑4o into JSON priorities.

- Intended major/area (optional): free text or select
- Career direction (1–2 words)
- Optimize for: GPA / learning depth / balance
- Workload tolerance: low / medium / high
- Assessment preference: projects / exams / assignments / mix
- Teaching quality importance: low / medium / high
- Grading type: prefer absolute / prefer relative / no preference
- Class mode: offline only / no preference
- Extra credit: prefer / avoid / no preference
- Risk tolerance for low reviews: low / medium / high
- Faculty importance: low / medium / high
- Detailed explanations with sources: yes / no

---

### GPT‑4o Expected JSON Schema
```json
{
  "user_profile": {
    "intended_major": "Economics",
    "career_goal": "Policy",
    "optimize_for": "balance",
    "workload_tolerance": "medium",
    "assessment_preference": ["assignments","projects"],
    "teaching_quality_importance": "high",
    "grading_type_preference": "absolute",
    "class_mode_preference": "offline",
    "extra_credit_preference": "prefer",
    "low_reviews_risk_tolerance": "medium",
    "faculty_importance": "medium",
    "need_detailed_explanations": true
  },
  "weights": {
    "overall_rating": 0.35,
    "fairness_transparency": 0.15,
    "grading_ease": 0.10,
    "teaching_quality": 0.15,
    "assessment_alignment": 0.10,
    "grading_type_match": 0.05,
    "class_mode_match": 0.05,
    "extra_credit": 0.03,
    "faculty_pedigree": 0.07,
    "review_count_confidence": 0.10
  },
  "hard_constraints": {
    "active_only": true,
    "term": "Monsoon 2025"
  }
}
```

Notes:
- Weights are defaults; GPT‑4o can set/adjust them from the form answers.
- For missing answers, fall back to sensible defaults (balance, medium risk).

---

### Scoring Model (High-level)
All scores normalized to [0, 1]. Applied at the section level, then rolled up to the base course.

1) Section Base Components (when ratings exist):
- Overall rating (0–5 → 0–1)
- Transparent grading, fairness, assignments match, lecturer quality, recommendation (0–5 each)
- Grading ease (0–5), used cautiously and only if user prioritizes GPA

2) Metadata Matches:
- Grading type match (absolute/relative) → binary/soft match
- Class mode match (offline vs no preference)
- Extra credit presence
- Assessment alignment: infer from `description`/`requirements` tokens (projects/exams/assignments)

3) Confidence Adjustment:
- Review count factor: f(total_reviews) (e.g., log scaling with cap), modulated by user’s low-review risk tolerance
- Recency: prefer Monsoon 2025 when available; otherwise small decay

4) Faculty Boosts:
- Seniority/pedigree signals from `title`/`education`/`department` (e.g., "Professor", "Ph.D. [top institution]", long experience phrases)
- Join by email where possible; fallback to fuzzy name match
- Cap total faculty boost to avoid overpowering ratings

5) No-Ratings Handling:
- If a section lacks ratings for Monsoon 2025: omit rating components, apply small penalty, rely on metadata + faculty
- Clearly label “No recent ratings” in explanations

6) Composite Section Score:
- Weighted sum of components above using user-specific `weights`

7) Course-level Aggregation:
- Use robust aggregate: max of top-k section scores (k=2) or a softmax-weighted average
- Produce the 1–8 ranking from these course scores

8) Tie-breakers:
- Higher review count → newer term → stable code order

---

### Output Format
- Ranked list (1–8) of base courses (`FC-xxxx`) with course titles
- For each base course:
  - Preferred sections (top 2 by section score) and 2 alternates
  - Brief explanation per section (1–2 lines)
  - Optionally, detailed explanation including:
    - Which priorities drove the score
    - Key rating metrics used (with values)
    - Metadata matches (grading type, mode, extra credit)
    - Faculty boost rationale
    - Source references: rows from `ashoka-course-schedule.csv`, `ashoka_courses_selenium.csv`, `ashoka_course_ratings_fixed.csv`, `ashoka_faculty_profiles.csv`

---

### Edge Cases & Data Cleaning
- Status filtering: Only `ACTIVE` from `ashoka-course-schedule.csv`
- Section-term filtering: Target Monsoon 2025 in ratings; if none, mark “no ratings” and proceed
- Mixed categorical noise in `grading_type`, `class_mode`, `extra_credit`: normalize values; coerce known variants; fall back to unknown
- Duplicate/near-duplicate sections: dedupe by `ls_code`
- Missing titles in ratings: backfill from `selenium.course_title_table`
- Faculty mapping: prioritize email matches; for names, normalize (trim, casefold) and allow conservative fuzzy match

---

### Privacy & Transparency
- No personal data stored beyond user’s form answers
- Explanations disclose missing data and assumptions

---

### Implementation Notes (non-code)
- Intake UI: quick form; pass answers to GPT‑4o prompt to emit JSON in the schema above
- Recommender: load CSVs, perform joins, compute scores, generate ranked outputs with explanations and source refs
- Configurable knobs: number of preferred sections (default 2), weight caps, boost caps, review discount curve

---

### Robustness for Different People and Majors

- Persona/major templates (JSON, no DB)
  - Keep `config/templates/*.json` with defaults per major/career archetype (e.g., STEM‑intense, writing‑heavy, policy‑curious, balance).
  - On recommendations: start from a template based on major/career, then apply GPT‑4o adjustments from the short form. If GPT‑4o is unavailable, use the template as‑is.

- Skill taxonomy and alignment
  - Define a small skill schema: `quantitative_reasoning`, `analytic_writing`, `discussion_seminar`, `projects`, `exams`, `labs`, `reading_load`.
  - Tag sections via keyword rules from `description`/`requirements` (with manual overrides in a local JSON). Align user goals to course substance across majors.

- Faculty compatibility and pedigree
  - Map faculty to departments/areas (from `ashoka_faculty_profiles.csv`) and infer compatibility with intended major.
  - Cap pedigree boosts (seniority, top institutions) so they help but don’t dominate; expose the boost in explanations.

- Ratings handling with clear fallbacks
  - Use section ratings when present; if absent, do not invent a rating. Apply a small “no recent ratings” penalty and state it explicitly.
  - Optionally allow weak “historical priors” from older offerings/instructors, clearly labeled as priors (off by default).

- Normalized, bounded scoring
  - Normalize components to [0,1] and keep weights summing to 1.
  - Clamp each component and cap boosts so no single factor overwhelms others.

- Risk handling and confidence
  - Respect risk tolerance: downweight low‑review sections for risk‑averse users; relax for risk‑tolerant users.
  - Deterministic tie‑breakers: score → review count → recency → stable code order.

- Major and career fit without stereotypes
  - Translate major/career to desired skills (e.g., CS → higher `quantitative_reasoning`, `projects`; Literature → `analytic_writing`, `discussion_seminar`).
  - Keep mappings editable in `config/major_skill_map.json` for tuning without code changes.

- Explainability (short vs detailed)
  - Always include a brief “why.”
  - If detailed, add drivers with CSV references and values used.

- Robust input and enums
  - Strict request validation with friendly errors; accept synonyms but emit canonical enums back.
  - Stable IDs (`FC-xxxx`, `FC-xxxx-n`) and versioned responses for frontend stability.

- Graceful degradation
  - If a CSV facet is missing/malformed, surface which facet is unavailable and continue; mark impacted items with a warning in the payload.
  - If GPT‑4o fails, fall back to template + minimal heuristics.

- User control and fairness
  - Allow users to override auto‑weights; echo weights used.
  - Keep pedigree boosts modest; emphasize teaching/fit signals.

- Lightweight quality checks
  - Monotonicity sanity: increasing a weight should not lower that component’s contribution.
  - Schema/enum tests to prevent drift that would break clients.

- Frontend‑readiness
  - Consistent list shapes; compact and verbose explanations; stable sort keys.

- Config‑first, code‑second
  - Place tweakables in `config/*.json` (weights defaults, keywords, boosts, mappings, penalties, tie‑breakers).

- Privacy and transparency
  - Echo the interpreted profile and weights; do not store PII.

- Feedback loop (no DB)
  - Accept optional client feedback for on‑the‑fly re‑ranking within the request; log for manual config tuning later.

- Internationalization (future)
  - Centralize message strings to enable localization without touching logic.
