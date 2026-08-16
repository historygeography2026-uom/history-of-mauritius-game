# Design and Implementation of a Gamified Web Platform for Learning History and Geography at Upper Primary Level in Mauritius

**Authors:** Sameerchand Pudaruth¹, Indranarain Ramlall², Ameeta Jackdao³, Shailendra Ramsaha⁴

¹ ICT Department, Faculty of Information, Communication and Digital Technologies, University of Mauritius  
² Faculty of Social Sciences and Humanities, University of Mauritius  
³ Polytechnics Mauritius  
⁴ Mauritius Institute of Education  

**Funding:** Higher Education Commission (HEC) Mauritius — Inter-disciplinary/Inter-institutional Team-Based Research Fund, 2024/2025 (Award Value: MUR 303,000)

**Correspondence:** s.pudaruth@uom.ac.mu

---

## Abstract

History and Geography (H&G) consistently records the lowest average pass rate among core subjects in the Primary School Achievement Certificate (PSAC) examination in Mauritius — an average of 77.61% over seven years (2017–2024), lower even than Mathematics, English, and Science. Despite the global proliferation of gamified educational platforms for STEM disciplines, no dedicated interactive platform exists for the History and Geography curriculum of Mauritius. This paper presents the design, architecture, and implementation of an open-access, gamified web portal — the *History & Geography Learning Platform* — funded by the Higher Education Commission of Mauritius. Built on Next.js 15 with a PostgreSQL backend, the platform offers five distinct interactive game types (multiple-choice, matching, fill-in-the-blank, chronological reordering, and true/false), covering three subject streams (History, Geography, and Combined) across three progressive difficulty levels. Pedagogical motivators include an adaptive scoring system, a star-and-achievement badge framework, real-time global leaderboards, a Dodo bird mascot providing contextual feedback, text-to-speech accessibility, an interactive SVG map of Mauritius and Rodrigues, and a full-featured administrator portal for curriculum-aligned content management. The system is deployed on a cloud platform with persistent storage, supporting approximately 13,800 PSAC candidates per year along with their teachers and parents. Evaluation is planned through user-satisfaction surveys, in-app analytics, and a longitudinal comparison of PSAC pass rates.

**Keywords:** gamification, e-learning, primary education, History and Geography, Mauritius, PSAC, Next.js, web portal, educational technology

---

## 1. Introduction

The Republic of Mauritius is a small island state in the Indian Ocean with a rich multi-ethnic heritage shaped by successive waves of Dutch, French, British, African, South Asian, and Chinese settlers. History and Geography (H&G), as a unified subject in the Mauritian primary curriculum, is therefore not merely an academic discipline — it is the primary vehicle through which young Mauritians develop a sense of cultural identity, civic responsibility, and environmental stewardship. Yet, as Table 1 reveals, H&G yields the weakest outcomes in the national Primary School Achievement Certificate examination year after year.

**Table 1. PSAC Examination Pass Rates (%) by Subject, 2017–2024**

| Year | History & Geography | English | Mathematics | French | Science | Overall |
|------|--------------------:|--------:|------------:|-------:|--------:|--------:|
| 2017 | 79.66 | 83.20 | 80.86 | 84.68 | 82.29 | 82.14 |
| 2018 | 76.54 | 80.29 | 80.42 | 82.12 | 76.56 | 79.19 |
| 2019 | 74.62 | 78.06 | 79.82 | 82.76 | 74.71 | 77.99 |
| 2020/21 | 74.42 | 80.76 | 78.26 | 83.17 | 77.12 | 78.75 |
| 2021/22 | 81.26 | 85.37 | 83.21 | 87.79 | 79.69 | 83.46 |
| 2023 | 80.49 | 85.40 | 79.28 | 88.14 | 81.87 | 83.04 |
| 2024 | 76.27 | 84.31 | 78.60 | 87.55 | 80.42 | 81.43 |
| **Average** | **77.61** | **82.48** | **80.06** | **85.17** | **78.95** | — |

*Source: Mauritius Examinations Syndicate / HEC Research Proposal (2025)*

Notably, the H&G average (77.61%) falls below Mathematics (80.06%) and Science (78.95%), subjects traditionally perceived as cognitively demanding. The examiner report for 2023 specifically identified recurring student weaknesses: poor map-reading and contour interpretation skills; confusion between historical dates, facts, and key figures; limited knowledge of national symbols (the Flag, the Coat of Arms); scant awareness of museums and their historical significance; inability to apply environmental sustainability concepts in context; and errors in the units relevant to meteorological phenomena such as cyclones.

The primary pedagogical driver of these difficulties is the continued dominance of rote memorisation in classroom practice. When learning is reduced to the passive reproduction of isolated facts, students cannot build the conceptual frameworks needed to interpret maps, contextualise events chronologically, or apply environmental reasoning. Global evidence from cognitive science and educational technology consistently shows that game-based and gamified learning environments promote active engagement, intrinsic motivation, and superior long-term knowledge retention (Deterding et al., 2011; Mayer, 2019; Plass, Homer & Kinzer, 2015).

While platforms such as Kahoot!, Quizlet, Khan Academy, and Duolingo have demonstrated the power of gamification in language, mathematics, and science education internationally, no equivalent resource exists for the specific History and Geography syllabus of Mauritius. This gap is the genesis of the present project.

This paper makes the following contributions:

1. It documents the pedagogical rationale, system architecture, game mechanics, and feature set of a fully deployed gamified H&G learning portal for Mauritian primary students.
2. It presents a replicable technical blueprint for subject-specific educational gamification in a small-island developing state context.
3. It outlines an evaluation framework for measuring the platform's impact on engagement, learning outcomes, and ultimately PSAC pass rates.

The remainder of the paper is organised as follows. Section 2 reviews related work. Section 3 describes the research context and problem. Section 4 covers system design and architecture. Section 5 details the game mechanics and pedagogical framework. Section 6 describes the platform features. Section 7 discusses security architecture. Section 8 presents the evaluation plan. Section 9 concludes.

---

## 2. Related Work

### 2.1 Gamification in Education

Gamification — the application of game-design elements (points, badges, leaderboards, levels, progress bars, narratives) to non-game contexts — has been extensively studied in the context of formal education (Deterding et al., 2011). Meta-analyses (Hamari, Koivisto & Sarsa, 2014; Sailer et al., 2017) consistently report positive effects on student motivation, engagement, and learning outcomes, particularly when gamification is intrinsically aligned with learning objectives rather than grafted superficially onto existing content.

Self-Determination Theory (Ryan & Deci, 2000) provides the principal theoretical underpinning: gamification promotes the three fundamental psychological needs — autonomy (player choice over pathways and difficulty), competence (graduated challenge producing a sense of mastery), and relatedness (social comparison via leaderboards and collaborative play). Each of these constructs is explicitly operationalised in the platform described in this paper.

### 2.2 Game-Based Learning in Primary Education

Young learners (ages 10–12, the PSAC cohort) are particularly amenable to game-based learning because play is the natural cognitive mode of childhood (Vygotsky, 1978; Piaget, 1962). Interaction with digital game environments supports the Zone of Proximal Development by scaffolding increasingly complex challenges; immediate corrective feedback replaces the anxiety of delayed examination grades; and narrative contexts (characters, storylines, quests) attach emotional significance to otherwise abstract content.

Prior work in Mauritius demonstrates both the feasibility and the appetite for ICT-enhanced primary education. Pudaruth and colleagues have previously developed MoLekol (an enhanced learning support system for class-based scenarios), an innovative learning platform for pre-primary students, an e-learning tool for CPE Mathematics self-study, and an interactive English teaching tool for upper primary learners. These systems established institutional knowledge of Mauritian learner needs, curriculum alignment challenges, and deployment constraints that directly inform the present project.

### 2.3 Interactive Map Learning

Geography education research highlights the particular difficulty students have with abstract cartographic representations. Interactive digital maps, where clicking on a region or feature triggers information, questions, or mini-games, have been shown to improve spatial reasoning and geographical knowledge retention (Kerski, Demirci & Milson, 2013). SVG-based web maps, as implemented in the present platform, offer high-quality vector rendering without external API dependencies or data-privacy concerns associated with services like Google Maps.

### 2.4 Identified Gap

A systematic review of online platforms available to Mauritian primary students at the time of project inception found no dedicated resource for H&G learning aligned with the PSAC syllabus. Available international platforms lacked Mauritius-specific content, Kreol Morisien language support, culturally relevant imagery, and curriculum mapping to local competency frameworks. The present work directly addresses this gap.

---

## 3. Research Context and Problem Statement

### 3.1 The PSAC Examination and the H&G Curriculum

The PSAC examination is the terminal assessment for Mauritian primary education. In 2024, approximately 13,800 candidates sat the examination. The H&G syllabus at Grade 6 level spans: the history of human settlement in Mauritius and Rodrigues (Dutch, French, British, indentured labour); physical geography of the Mascarene Islands; civic education (national symbols, government, heritage); maps and cartographic skills; weather, climate, and natural disasters (notably cyclones); and environmental sustainability.

### 3.2 Diagnostic Findings

The 2023 MES examiner report identified six recurring areas of weakness:

- **Map skills**: inability to identify and label physical features; poor contour map interpretation
- **Historical knowledge**: confusion of dates, figures, and causation in settlement narratives
- **National symbols**: limited understanding of the Flag, Coat of Arms, and their significance
- **Heritage and museums**: weak appreciation of cultural institutions and artefacts
- **Environmental sustainability**: surface-level awareness without applied reasoning
- **Scientific measurement**: errors in units (e.g., cyclone wind speed measurements)

Each of these weaknesses maps directly onto a specific game type or topic cluster in the platform.

### 3.3 Research Objectives

The project's primary objective is to create an open-access gamified web portal for H&G learning. Specific sub-objectives are:

1. Design game activities that promote problem-solving, decision-making, and analytical skills through historical and geographical scenarios.
2. Implement personalised feedback and adaptive difficulty based on learner progress.
3. Ensure curriculum alignment with PSAC competency outcomes.
4. Ensure accessibility to learners of all socioeconomic backgrounds.
5. Incorporate multilingual support (English, French, Kreol Morisien) — planned for future iterations.
6. Motivate continued engagement through a rich incentive structure (stars, badges, leaderboards, achievement system).

---

## 4. System Design and Architecture

### 4.1 Technology Stack

The platform is implemented as a full-stack web application. The choice of technologies prioritised developer productivity, performance, accessibility, and cost-effective cloud deployment.

**Figure 1** — *[Insert screenshot: System architecture diagram or landing page of the platform]*

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend framework | Next.js 15 (React 19) | Server-side rendering, App Router, file-based routing, built-in API routes |
| UI component library | Radix UI + shadcn/ui + Tailwind CSS | Accessible, unstyled primitives customised for child-friendly aesthetics |
| Authentication | NextAuth v4 (Credentials + Google OAuth) | Flexible provider support; session management via JWT |
| Database | PostgreSQL via `pg` driver | Robust relational storage for users, questions, progress, leaderboard |
| ORM/Query | Raw SQL with parameterised queries | Full control; avoids ORM abstraction overhead and injection risk |
| Audio | Howler.js | Cross-browser sound effects with mute/unmute state persistence |
| Accessibility | Web Speech API (TTS) | Text-to-speech for all question and feedback content |
| Maps | Custom SVG (Mauritius + Rodrigues) | Zero external dependency; full offline capability; precise district rendering |
| Animations | CSS transitions + react-confetti | Lightweight visual rewards without heavy animation libraries |
| Deployment | Docker container on Render.com | Containerised environment; persistent disk storage for uploaded images |
| Package manager | pnpm | Efficient dependency resolution; faster installs |

### 4.2 Application Architecture

The application follows Next.js App Router conventions, with a clear separation of concerns:

```
app/
  page.tsx              — Subject/Level selection dashboard (home)
  game/page.tsx         — Core game engine
  explore-map/page.tsx  — Interactive map of Mauritius & Rodrigues
  leaderboard/page.tsx  — Global leaderboard
  history/page.tsx      — Mauritius history timeline reference
  admin/page.tsx        — Content management portal
  api/                  — REST API endpoints (questions, leaderboard,
                          auth, progress, image upload, admin)
components/             — Reusable UI and game components
lib/                    — Business logic, DB client, config, security utilities
hooks/                  — React hooks (game sounds, achievements, questions, etc.)
public/uploads/         — Persistent user-uploaded images
```

**Figure 2** — *[Insert screenshot: Subject selection screen showing History, Geography, and Combined options with the Dodo mascot]*

### 4.3 Database Schema

The PostgreSQL schema maintains the following core tables:

- **users** — NextAuth user accounts (id, name, email, hashed password, avatar)
- **sessions / accounts** — NextAuth session management
- **questions** — Full question bank (id, type, subject, level, question text, instruction, options/pairs/items, correct answer, image_url, timer, created_by, timestamps)
- **user_progress** — Per-user, per-subject, per-level completion status and stars earned
- **leaderboard** — Game session records (user_id, display_name, total_points, stars_earned, subject, level, played_at)

The `questions` table stores all five question types in a single flexible schema, using JSONB-compatible text fields for options (multiple-choice), pairs (matching), and items (reorder), allowing the admin to manage all types through a unified interface.

### 4.4 API Design

All data access is mediated through Next.js API route handlers. Key endpoints include:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/questions` | GET | Fetch questions filtered by subject and level |
| `/api/attempts` | POST | Record a completed game attempt |
| `/api/leaderboard` | GET | Paginated, sortable leaderboard with search |
| `/api/user/progress` | GET/POST | Read/write user progress per subject |
| `/api/user/profile/:id` | GET | Fetch user profile and cumulative stats |
| `/api/admin/questions` | GET/POST/PUT/DELETE | Admin CRUD for questions |
| `/api/upload-image` | POST | Multipart image upload to persistent disk |
| `/api/import-excel` | POST | Bulk question import via Excel spreadsheet |
| `/api/auth/[...nextauth]` | * | NextAuth authentication handler |

All mutation endpoints implement CSRF token validation, rate limiting, and input sanitisation (see Section 7).

---

## 5. Game Mechanics and Pedagogical Framework

### 5.1 Subject and Level Structure

The platform is organised into three subject streams:

- **History**: Focuses on Mauritian settlement history, colonial periods, key historical figures, national heritage, and cultural identity.
- **Geography**: Focuses on the physical and human geography of Mauritius and Rodrigues — districts, rivers, mountains, climate, demographics, environmental issues.
- **Combined (History & Geography)**: A mixed stream drawing questions from both disciplines, replicating the integrated nature of the PSAC examination.

Within each subject, three difficulty levels are arranged in a progressive, locked sequence:

| Level | Label | Description | Unlock Condition |
|-------|-------|-------------|-----------------|
| 1 | Easy (🌟) | Foundational knowledge; recall and recognition | Available immediately |
| 2 | Medium (⭐⭐) | Conceptual application; cause-and-effect | Level 1 completed |
| 3 | Hard (⭐⭐⭐) | Analysis, interpretation, and synthesis | Level 2 completed |

This structure implements *scaffolded learning* (Vygotsky, 1978) — each level builds on the conceptual foundation established by the previous, and access is gated to prevent students from encountering material they are not yet prepared for.

**Figure 3** — *[Insert screenshot: Progress map showing Level 1 (unlocked), Level 2 (locked), Level 3 (locked) for History subject]*

### 5.2 The Five Game Types

Each level presents 20 questions (configurable via `GAME_CONFIG.QUESTIONS_PER_LEVEL`), drawn randomly from the question bank to ensure replay variability. Questions are distributed across five interactive formats:

#### 5.2.1 Multiple-Choice Questions (MCQ)

The most familiar format: a question stem with four shuffled answer options. Options are randomised per session using a Fisher-Yates shuffle on the original option set, preserving the correct answer mapping. A 30-second countdown timer (configurable per question) creates gentle time pressure consistent with the timed PSAC examination. Correct responses earn stars; incorrect responses trigger the Dodo mascot to offer an encouraging message, and a fun fact is displayed to anchor the correct answer in the student's memory.

*Example question: "What is the capital city of Mauritius?" / Options: Port Louis, Curepipe, Vacoas, Rose Hill*

**Figure 4** — *[Insert screenshot: Multiple-choice question interface with Dodo mascot, timer, and answer options]*

#### 5.2.2 Matching Game

Students match items in the left column (terms, images, or historical figures) to items in the right column (definitions, locations, or descriptions). Right-column items are shuffled at session start. A colour-coded feedback system (green flash for correct, red flash with subtle shake for incorrect) provides immediate reinforcement. This format directly addresses the PSAC competency of associating geographical features with their names and historical events with their contexts.

*Example pair: "Le Morne" ↔ "UNESCO World Heritage mountain"*

**Figure 5** — *[Insert screenshot: Matching game with left and right columns, a successful match highlighted in green]*

#### 5.2.3 Fill-in-the-Blank

A sentence with a key term replaced by a blank (`_____`) is presented, along with a hint. The student types the answer. Case-insensitive matching with normalised whitespace allows for minor spelling variations. This format builds active recall — the most durable form of memory encoding (Roediger & Butler, 2011) — and directly targets the map labelling and term-identification weaknesses identified in the PSAC examiner report.

*Example sentence: "Mauritius is an island in the _____ Ocean." (Hint: "It starts with I")*

**Figure 6** — *[Insert screenshot: Fill-in-the-blank game showing sentence with blank, hint button, and text input field]*

#### 5.2.4 Chronological Reordering (Timeline Game)

Students drag and drop historical events into their correct chronological order. Touch interaction is fully supported for tablet and smartphone users. The correct order is compared against the student's arrangement on submission. This format directly targets the recurring PSAC weakness of confusing historical dates and sequences — for instance, the Dutch arrival (1598/1638), French takeover (1715), British rule (1810), and independence (1968).

**Figure 7** — *[Insert screenshot: Reorder game showing draggable event cards: "Dutch arrive in Mauritius", "French take control", "British rule begins", "Mauritius becomes independent"]*

#### 5.2.5 True/False

A statement about a historical or geographical fact is presented; the student must identify it as true or false. This format is particularly effective for addressing misconceptions about national symbols, cyclone science, and environmental facts — areas where students often hold plausible but incorrect beliefs.

**Figure 8** — *[Insert screenshot: True/False question interface with large True and False buttons]*

### 5.3 Scoring and Star System

Each question contributes to a level-wide star tally (maximum 5 stars per level, per subject). Stars are calculated as a function of:

- **Accuracy**: proportion of correct responses
- **Timeliness**: time remaining on the level-wide countdown at completion
- **Attempt number**: repeat attempts at the same level yield a normalised score to reward persistence

This multi-dimensional scoring formula goes beyond simple percentage accuracy, rewarding efficient learning and discouraging rote grinding. The formula aligns with the HEC proposal's specification that "the time taken to complete specific tasks and the number of times the student has attempted a specific level will also be considered."

A level-wide timer (distinct from the per-question timer displayed in the `DodoTimer` component) creates a sense of urgency and mirrors examination conditions. If the timer expires, a timeout screen appears and the student may reattempt the level.

**Figure 9** — *[Insert screenshot: End-of-level results screen showing 4 out of 5 stars earned with confetti animation]*

### 5.4 The Dodo Bird Mascot

The Dodo bird (*Raphus cucullatus*) — Mauritius's most iconic extinct species and a symbol of the island's natural heritage — serves as the platform's animated mascot. This choice is pedagogically and culturally deliberate: the Dodo is universally known to Mauritian children, immediately signals cultural relevance, and provides a non-threatening, warm presence.

The Dodo mascot has six emotional states — `idle`, `happy`, `sad`, `thinking`, `celebrating`, and `encouraging` — which transition dynamically based on game events. Contextual messages accompany each state, selected randomly from a library of motivational, corrective, and celebratory phrases. This adaptive feedback mechanism operationalises the "positive feedback and tips as they play to help them feel supported" strategy described in the project proposal.

**Figure 10** — *[Insert screenshot: Dodo mascot in "celebrating" state after a correct answer, with a speech bubble reading "Amazing! You really know your Mauritian history!"]*

### 5.5 Achievement Badge System

The platform implements a comprehensive achievement system with 20+ defined badges organised into four categories and four rarity tiers:

**Categories:**
- *Progress* — milestones based on total questions answered (First Steps, Getting Started, Knowledge Seeker, Mauritius Scholar, History Master, Geography Champion)
- *Performance* — quality of responses (Perfect Score, Speed Demon, Star Collector)
- *Streak* — consecutive correct answers (Hot Streak, On Fire, Unstoppable)
- *Special* — hidden achievements for exceptional performance

**Rarity Tiers:** Common → Rare → Epic → Legendary (with corresponding visual styling: bronze, silver, gold, animated gradient borders)

Locked badges display a circular progress ring showing how close the student is to unlocking them — a well-established motivational technique that leverages the *endowed progress effect* (Nunes & Drèze, 2006), where people are more motivated to complete a goal when they can see partial progress toward it.

**Figure 11** — *[Insert screenshot: Achievement badges panel showing unlocked badges (coloured) and locked badges (greyed out) with progress rings]*

---

## 6. Platform Features

### 6.1 User Authentication and Profiles

The platform supports three authentication modes:

1. **Guest play**: unauthenticated users may play with progress stored in `localStorage`; no leaderboard submission
2. **Credential authentication**: email/password registration with bcrypt hashing; progress persisted to PostgreSQL
3. **Google OAuth**: single-click sign-in via Google; the callback URI is registered in Google Cloud Console

On successful authentication, the user's profile is loaded, displaying cumulative stars, completed levels, and active streaks. Progress is synchronised to the database on level completion; a `localStorage` fallback ensures continuity if the API call fails.

**Figure 12** — *[Insert screenshot: Login/Sign-up screen with "Continue with Google" button and credential form]*

### 6.2 Interactive Map Explorer

The *Explore Map* feature provides a fully interactive SVG cartographic experience — a direct implementation of the "Interactive Map Exploration" game level concept from the HEC proposal. The map is rendered from auto-generated SVG path data for Mauritius's nine administrative districts:

- Port Louis, Pamplemousses, Rivière du Rempart, Flacq, Grand Port, Savanne, Black River, Plaines Wilhems, Moka

Each district is rendered in a distinct colour. Students can click on districts to view geographic, demographic, and historical information. A feature filter system allows exploration by category: rivers, mountains, heritage sites, beaches, wetlands, cultural landmarks, and more.

A second tab provides an equivalent interactive map for **Rodrigues Island**, loaded lazily (dynamically imported only when the tab is selected) to preserve initial page performance. This dual-island coverage directly addresses PSAC content on the Mascarene Islands group.

A *visited locations* tracker marks sites the student has explored, gamifying the discovery process and encouraging comprehensive exploration.

**Figure 13** — *[Insert screenshot: Interactive SVG map of Mauritius with coloured districts and a clicked location popup showing "Le Morne Brabant – UNESCO World Heritage Site"]*

**Figure 14** — *[Insert screenshot: Rodrigues Island map view with location markers]*

### 6.3 Global Leaderboard

The leaderboard provides a transparent, motivating view of the student community's performance. Key features:

- **Sorting**: by total points, stars earned, date played, player name, or level
- **Filtering**: by subject (History, Geography, Combined, or All)
- **Search**: real-time name search with 400ms debounce to minimise database load
- **Pagination**: 20 rows per page with first/previous/next/last navigation
- **Highlighting**: the authenticated user's own rows are highlighted for self-comparison
- **Encouragement banners**: rotating motivational messages (e.g., "🔥 Champions never stop! Beat your best score today!")

The leaderboard implements SWR (stale-while-revalidate) data fetching for automatic background refresh, ensuring near-real-time rankings without full page reloads.

**Figure 15** — *[Insert screenshot: Leaderboard page showing ranked table with trophy icons, player names, stars, points, and subject columns]*

### 6.4 Sound and Accessibility

Audio feedback is implemented via Howler.js, with three sound events: correct answer (celebratory chime), incorrect answer (gentle buzz), and click (soft click for interface interactions). Sound can be globally muted/unmuted via a persistent toggle (state stored in `localStorage`).

Text-to-speech (TTS) is implemented via the Web Speech API, reading question text and feedback aloud at a natural pace (rate 0.9, pitch 1.0, English). This feature provides a critical accessibility layer for students with reading difficulties or lower literacy levels — a non-trivial consideration in a multilingual society where home languages include Kreol Morisien, Bhojpuri, Hindi, Tamil, Urdu, and others.

A `StreakCounter` component visually tracks and displays consecutive correct answers, activating a "fire" animation at milestones to provide heightened positive reinforcement.

### 6.5 Content Administration Portal

The administrator portal is accessible only after two-factor authentication:

1. **Platform session**: NextAuth Google OAuth (admin-whitelisted email)
2. **Admin PIN**: an additional session-scoped PIN to prevent privilege escalation by a logged-in non-admin user

The admin portal provides:

- **Question CRUD**: create, read, update, and delete questions across all five types, all subjects, and all levels through a rich modal form
- **Image management**: per-question image upload with in-browser preview, stored on Render persistent disk and served via `/api/images/` with path traversal protection
- **Bulk import**: Excel (`.xlsx`) spreadsheet import via the `ExcelImportSection` component, allowing curriculum specialists and teachers to prepare large question sets offline and upload them in one operation
- **Filtering and search**: filter the question table by subject, level, question type, and free-text search
- **Bulk operations**: checkbox-based multi-select for bulk deletion

**Figure 16** — *[Insert screenshot: Admin portal question table with type badges, subject tags, edit and delete action buttons]*

**Figure 17** — *[Insert screenshot: Question edit modal for a matching game question with pairs editor]*

---

## 7. Security Architecture

Given that the primary user base includes minors (primary school students), security was treated as a non-negotiable first-class concern throughout development.

### 7.1 Authentication Security

- Passwords are hashed with bcrypt (cost factor 12) before storage; plaintext passwords never touch the database
- NextAuth JWTs are signed with a `NEXTAUTH_SECRET` (minimum 32 random bytes)
- Google OAuth tokens are never stored; only the NextAuth session identifier is persisted

### 7.2 CSRF Protection

All mutating API endpoints validate a CSRF token (`lib/csrf-protection.ts`). The token is embedded in the HTML for form submissions and sent as a request header for AJAX calls. Requests missing or carrying an invalid CSRF token are rejected with HTTP 403.

### 7.3 Rate Limiting

API endpoints that are potentially subject to brute-force or denial-of-service attacks (authentication, leaderboard submission, question fetching) are protected by an in-memory sliding window rate limiter (`lib/rate-limit.ts`). Excessive requests from a single IP within a defined window receive HTTP 429.

### 7.4 Input Sanitisation and XSS Prevention

All user-supplied content (question text, option text, display names) is sanitised through the `lib/xss-protection.ts` utility before storage and before rendering. HTML entity encoding prevents stored XSS; CSP headers prevent reflective XSS from unknown sources.

### 7.5 File Upload Security

Image uploads are validated for MIME type, file extension whitelist (JPEG, PNG, WebP, GIF), and maximum file size. Files are renamed to a UUID-based filename on disk, preventing path traversal and filename injection attacks.

### 7.6 SQL Injection Prevention

All database queries use parameterised statements via the `pg` driver. No string interpolation of user data into query strings occurs anywhere in the codebase.

### 7.7 Admin Authentication Hardening

The admin portal employs the two-layer authentication described in Section 6.5, with session invalidation on page unload. All admin session state is stored in `sessionStorage` (not `localStorage`), limiting its lifetime to the browser tab.

---

## 8. Evaluation Plan

### 8.1 Usability and User Experience

A structured usability evaluation is planned at the end of the project period (April 2026), involving:

- Students from 2–3 participating primary schools across different socioeconomic contexts
- Teachers who will use the platform as a classroom supplement
- Parents who access the platform at home with their children

Evaluation instruments will include:
- **System Usability Scale (SUS)** for overall usability assessment
- **Intrinsic Motivation Inventory (IMI)** subscales: Interest/Enjoyment and Perceived Competence
- **Semi-structured focus groups** to elicit qualitative feedback on game mechanics, content relevance, and accessibility

### 8.2 Learning Effectiveness

Pre- and post-test designs will be used to measure knowledge gains among participating students. Test items will be drawn from MES past examination papers and mapped to the specific competencies targeted by each game type.

### 8.3 Engagement Metrics

The platform captures the following in-app analytics:

- Total users registered and daily/monthly active users
- Time on platform (session duration)
- Levels completed per user per subject
- Average stars earned per level (as a proxy for learning quality)
- Achievement unlock rates (tracking which competencies are mastered)
- Leaderboard participation rate

### 8.4 Long-Term Impact

The most meaningful but distal metric is PSAC H&G pass rates in subsequent examination cohorts. While a causal attribution to any single intervention is methodologically challenging, a year-on-year comparison of the schools using the platform with a control group (matched by school type, socioeconomic index, and prior performance) will provide indicative evidence of impact.

A research paper documenting findings will be submitted to an international peer-reviewed journal (planned: *Computers & Education*, *Educational Technology & Society*, or *British Journal of Educational Technology*) and presented at a national dissemination workshop (targeted: January 2026).

---

## 9. Discussion

### 9.1 Alignment with the HEC Proposal

The implemented platform closely follows the vision articulated in the HEC funding proposal. The three proposed games — *Who wants to be a History Star?*, *Who wants to be a Geography Champion?*, and *Who wants to be a History and Geography Expert?* — are realised through the subject/level architecture and the combined stream respectively. The five question types cover all proposed activity formats: interactive map exploration (the SVG explorer), historical quiz challenges (MCQ, true/false), interactive timelines (reorder), matching exercises, and fill-in-the-blank activities.

The proposal's technology stack suggestion (React.js + Node.js + MySQL) has been refined in implementation: React is delivered through Next.js 15 for built-in SSR and routing, MySQL has been replaced by PostgreSQL (offering superior JSONB support and a stronger open-source ecosystem for cloud deployment), and the proposed Phaser.js game engine has been superseded by custom React components — a decision that reduces bundle size, improves accessibility, and simplifies the integration of real-time data from the database.

### 9.2 Pedagogical Contribution

The platform's most significant pedagogical contribution is the integration of formative assessment with immediate, game-native feedback. Unlike a traditional quiz that marks answers after submission, every interactive element in the platform responds within milliseconds — correct answers trigger sound, animation, and mascot celebration; incorrect answers provide a fun fact or explanatory hint without penalising the student or interrupting flow. This loop implements the *Corrective Immediate Feedback* principle (Hattie & Timperley, 2007), which has one of the largest measured effect sizes on learning outcomes of any pedagogical intervention.

The leaderboard introduces a layer of social comparison that can be double-edged: for high-performing students, it fuels healthy competition; for lower-performing students, it can reduce motivation. This is mitigated by the personal progress emphasis (star tracking per level, achievement badges for personal milestones) and the locked achievement visibility (partial progress rings keep lower-performing students motivated by showing their path to the next badge rather than their distance from the top of the leaderboard).

### 9.3 Limitations and Future Work

Several planned features remain as future work:

1. **Multilingual support**: The proposal envisages English, French, and Kreol Morisien interfaces. The current implementation is English-only. Kreol Morisien support would be especially impactful for students from lower-literacy households.
2. **Phaser.js integration**: More immersive narrative game levels (e.g., a virtual field trip to Vieux Grand Port, a simulation of Dutch settlement decision-making) are planned as Level 4+ extensions.
3. **Teacher dashboard**: A dedicated analytics view for teachers to track class progress, identify struggling students, and correlate platform activity with school assessments.
4. **Mobile application**: A React Native or Progressive Web App (PWA) packaging for offline play, addressing connectivity limitations in rural and low-income households.
5. **Adaptive difficulty engine**: Currently difficulty is level-gated; a future version will dynamically adjust the question mix within a level based on per-student error patterns, implementing a rudimentary Intelligent Tutoring System.
6. **National competition infrastructure**: The proposal mentions organising national competitions. The leaderboard infrastructure is already in place; a tournament bracket and submission deadline system would complete this feature.

---

## 10. Conclusion

The History & Geography Learning Platform described in this paper directly addresses a well-documented and persistent gap in Mauritian primary education: the consistently low pass rate in H&G at the PSAC level, driven by rote-learning practices that leave students ill-equipped for map reading, chronological reasoning, and applied environmental thinking.

By combining five distinct interactive game types — multiple-choice, matching, fill-in-the-blank, chronological reordering, and true/false — with an adaptive scoring system, achievement badges, a culturally meaningful Dodo mascot, an interactive SVG map of Mauritius and Rodrigues, real-time leaderboards, and a full-featured content administration portal, the platform delivers a holistic, curriculum-aligned, and engaging learning experience for all 13,800 annual PSAC candidates.

Built on modern, maintainable, and secure web technologies (Next.js 15, PostgreSQL, NextAuth), the platform is deployed in a scalable cloud environment with persistent storage and is accessible from any device with a web browser — no installation required. Security is treated with the seriousness appropriate to a system used by minors, with CSRF protection, rate limiting, XSS sanitisation, parameterised SQL, and layered admin authentication implemented throughout.

This project demonstrates that a small-island developing state can — with targeted research funding, cross-institutional collaboration, and thoughtful software design — build world-class educational technology tailored precisely to its students' cultural heritage, curricular needs, and language context. It is hoped that the platform will not only raise PSAC performance in H&G but will cultivate in the next generation of Mauritians a genuine love for their island's remarkable history and its fragile, extraordinary geography.

---

## References

Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining gamification. *Proceedings of the 15th International Academic MindTrek Conference*, 9–15.

Hamari, J., Koivisto, J., & Sarsa, H. (2014). Does gamification work? A literature review of empirical studies on gamification. *Proceedings of the 47th Hawaii International Conference on System Sciences*, 3025–3034.

Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1), 81–112.

Kerski, J., Demirci, A., & Milson, A. (2013). The emergence of Web 2.0 tools in online learning, collaboration, and professional development. *Journal of Geography*, 112(3), 127–137.

Mayer, R. E. (2019). Computer games in education. *Annual Review of Psychology*, 70, 531–549.

Mauritius Examinations Syndicate (MES). (2023). *Examiner's Report: History and Geography, PSAC 2023*. MES, Mauritius.

Nunes, J. C., & Drèze, X. (2006). The endowed progress effect: How artificial advancement increases effort. *Journal of Consumer Research*, 32(4), 504–512.

Piaget, J. (1962). *Play, Dreams and Imitation in Childhood*. Norton.

Plass, J. L., Homer, B. D., & Kinzer, C. K. (2015). Foundations of game-based learning. *Educational Psychologist*, 50(4), 258–283.

Pudaruth, S. (2020). *PhD Thesis: Artificial Intelligence Applications in Education and Law*. University of Mauritius.

Pudaruth, S., et al. (2021). MoLekol: An enhanced learning support system for class-based scenarios. *Proceedings of [International Education Conference]*.

Roediger, H. L., & Butler, A. C. (2011). The critical role of retrieval practice in long-term retention. *Trends in Cognitive Sciences*, 15(1), 20–27.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist*, 55(1), 68–78.

Sailer, M., Hense, J. U., Mayr, S. K., & Mandl, H. (2017). How gamification motivates: An experimental study of the effects of specific game design elements on psychological need satisfaction. *Computers in Human Behavior*, 69, 371–380.

Vygotsky, L. S. (1978). *Mind in Society: The Development of Higher Psychological Processes*. Harvard University Press.

---

## Appendix A: Game Configuration Parameters

```typescript
// lib/game-config.ts
export const GAME_CONFIG = {
  QUESTIONS_PER_LEVEL: 20,        // Questions randomly sampled per session
  DEFAULT_QUESTION_TIMER: 30,     // Seconds per question (configurable per question)
  POINTS_PER_STAR: 100,           // Score value of each star earned
}
```

## Appendix B: Achievement Definitions (Selected)

| ID | Title | Description | Category | Rarity |
|----|-------|-------------|----------|--------|
| `first_question` | First Steps | Answer your first question | Progress | Common |
| `fifty_questions` | Knowledge Seeker | Answer 50 questions | Progress | Rare |
| `hundred_questions` | Mauritius Scholar | Answer 100 questions | Progress | Epic |
| `all_levels_history` | History Master | Complete all History levels | Progress | Epic |
| `all_levels_geo` | Geography Champion | Complete all Geography levels | Progress | Epic |
| `perfect_level` | Perfect Score | Complete a level without any mistakes | Performance | Legendary |
| `speed_demon` | Speed Demon | Complete a level with 50%+ time remaining | Performance | Rare |
| `hot_streak` | Hot Streak | Answer 5 questions in a row correctly | Streak | Rare |
| `unstoppable` | Unstoppable | Answer 15 questions in a row correctly | Streak | Legendary |

## Appendix C: Deployment Configuration (render.yaml summary)

The production deployment uses a Docker container built from the repository's `Dockerfile`, served as a Render Web Service. A Render PostgreSQL database instance is connected via the `DATABASE_URL` environment variable. A Render Persistent Disk mounted at `RENDER_DISK_PATH` stores uploaded images, served through the `/api/images/` route handler. The production start command runs `scripts/start.sh`, which applies any pending database migrations before launching `next start`.

---

*Manuscript prepared: May 2026*  
*Funded by: Higher Education Commission Mauritius — Inter-disciplinary/Inter-institutional Team-Based Research Fund 2024/2025*  
*Project Duration: May 2025 – April 2026*  
*Total Grant Value: MUR 303,000*
