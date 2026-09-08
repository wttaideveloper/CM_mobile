# Invigorate Health — Mobile Coding Standards

**Source:** Invigorate Healthcare App Platform — Engineering Coding Standards  
**Revision:** 3.2 (Final Consolidated Edition)  
**Scope:** React Native / Expo mobile app only  
**Purpose:** Handoff reference for developers working on this mobile project.  
**Note:** Backend, micro-frontend web, and infra rules are omitted unless they directly affect mobile.

---

## 1. General principles

- Prefer **readability** over cleverness — no obscure hacks or over-engineering.
- **Boy Scout Rule** — leave code cleaner than you found it.
- Use **self-documenting names** — no cryptic abbreviations.
- **Strict TypeScript** — no untyped / loosely typed code.
- **Secure by default** — safe behaviour is structural (guards, default-deny), not optional.
- **Grounded by default** — AI surfaces must not invent clinical meaning; use platform semantic layer / citations when AI is involved.

---

## 2. Frontend & React Native (core)

- Use **functional components + hooks only** — class components prohibited.
- Split files at **~250 lines** into sub-components / custom hooks.
- **Server state:** TanStack React Query for all remote data (fetch, cache, invalidate, retry). Do not dump remote data into Redux.
- **Local state:** `useState` for component state; context only for app-wide theme / language.
- Wearable / device streams live in **localized custom hooks** — avoid tree-wide re-renders.
- Lists: **virtualized** `FlatList` / `SectionList` with stable `keyExtractor`. Large dynamic lists in raw `ScrollView` are prohibited.
- Chat threads: virtualized + cursor-paginated; stream tokens without re-rendering the full thread; citations as tappable chips.
- Images: prefer a **caching image library** (e.g. Expo Image / fast-image) for scrolling content over plain uncached `Image`.
- Native bridges (HealthKit / Health Connect / Fitbit): isolate in modules with **permission-denied fallbacks**.
- Accessibility: **WCAG 2.2 AA**; axe assertions expected in CI where applicable.
- Mobile is a **single binary** — no OTA loading of executable remotes / micro-frontends. Domain modularity via package boundaries + import linting.

---

## 3. Navigation & performance

### 3.1 Navigation

- One sanctioned navigator stack (Expo Router / React Navigation pattern in this repo).
- Route names in a **central typed registry** with typed params — avoid ad-hoc string navigation where possible.
- **Auth flow** and **app flow** are separate groups; protected screens only inside authenticated group (structural guards).
- Deep links: universal links + app scheme; protected deep links must **re-authenticate first**.
- Route params carry **IDs only (UUIDs)** — never PHI, tokens, or personal data in params/query strings. Screens fetch data by ID.
- Android hardware back must match on-screen back; confirm before discarding destructive / multi-step flows; back must not re-submit.
- Navigation state restoration: return to last **safe** screen; never a stale PHI view after session expiry.
- Loading: **skeleton loaders** on navigation — not blank screens or full-screen spinners; lists use cursor infinite scroll + end state.

### 3.2 Mobile performance budgets

| Metric | Budget |
| --- | --- |
| Cold start → first interactive screen | ≤ 2 s |
| Warm start | ≤ 500 ms |
| Screen-to-screen transition | ≤ 300 ms |
| List scrolling | 60 fps, no jank on virtualized lists |

---

## 4. Client-side security (mobile)

- Client validation is **UX only** — every input is re-validated server-side. Client is never the trust boundary.
- Minimize third-party scripts/SDKs; anything touching PHI needs approval + BAA where required.
- **Screen privacy:** PHI and conversation screens should use `FLAG_SECURE` / snapshot blurring so content does not appear in app-switcher screenshots or recordings (re-enable if temporarily disabled for demos).
- Mobile hardening:
  - Store secrets in **Keychain / Keystore** (e.g. SecureStore).
  - SSL pinning to intermediate CA or public key (with backup pin) when required by platform.
  - Jailbreak / root detection where required.
  - **No PHI in plaintext local storage.**

---

## 5. Authentication, tokens & sessions (mobile impact)

- **Keycloak** is the single IdP — no hand-rolled auth / password storage / token issuance on the client.
- Access tokens: JWT, **TTL ≤ 15 minutes**, validated audience/issuer server-side.
- Refresh tokens: **TTL ≤ 30 days**, rotating; replay detection revokes session family.
- Logout must revoke **server-side** (not only clear local tokens).
- Session inactivity: PHI-viewing apps re-authenticate after **15 minutes** inactivity; after background → foreground beyond window, require biometric/PIN re-entry when enabled.
- Passwords (login UI): NIST 800-63B — min 12 chars, length over composition rules, breached-password checks, no forced periodic rotation, rate-limited attempts.
- Login errors must **not enumerate** whether an account exists.
- MFA: mandatory for staff/coach/admin; offered to end users where applicable.

---

## 6. Data classification (mobile)

Every field / event / log / notification carries one tier:

| Tier | Examples | Mobile handling |
| --- | --- | --- |
| **T1 — PHI** | Health metrics, assessments, wearables, conversation messages | Never in logs, analytics, URLs, push bodies, or plaintext storage |
| **T2 — PII** | Name, email, phone, demographics | Encrypted at rest; redact from logs; minimize in SDKs |
| **T3 — Internal** | Config, metrics, telemetry | Access-controlled |
| **T4 — Public** | Marketing, published articles | No special restriction |

Rules:

- Analytics / crash reports: **T3 only** — no T1/T2 (including message text).
- Production PHI never in non-prod; test fixtures synthetic / de-identified.
- **Push notification payloads:** no T1/T2 content — reference only; app fetches detail after unlock.

---

## 7. Security & compliance (mobile-relevant)

- TLS 1.2+ (1.3 preferred); PHI encrypted in transit.
- Never log PHI, tokens, passwords, raw health metrics, JWTs, patient identifiers, or conversation content.
- Secrets only via approved secret manager / env injection — nothing committed in code/Git/bundles.
- Tenant isolation is server-enforced (JWT + RLS); mobile must not trust client-only checks.
- SOC 2: RBAC + MFA for privileged portals; PR review with audit trail.

---

## 8. AI / chat / conversational surfaces (when building mobile AI)

- Sanitize input; treat retrieved docs / tool output as **untrusted data**, not instructions.
- Answers must be **grounded with citations**; ungrounded generation is a failure.
- PHI redaction before any external model call.
- Conversation content is **T1 PHI** — no logging/analytics of message text.
- Stream AI responses (SSE contract on backend); no silent spinner beyond first-token budget.
- Closed-world retrieval; no inventing metrics/clinical claims in prose.
- “I don’t have that information” is a required path — never fill gaps with plausible text.

---

## 9. Naming, comments & documentation

| Context | Style |
| --- | --- |
| Folders / directories | `kebab-case` |
| Classes / TS interfaces | `PascalCase` |
| React components | `PascalCase` |
| Methods / variables (FE) | `camelCase` |
| Constants / env vars | `UPPER_SNAKE_CASE` |
| Routes / screens | `PascalCase` in registry |
| i18n keys | `dot.notation` namespaces |

- Comments explain **why**, not what.
- TSDoc on exported functions, hooks, and prop interfaces; document units/ranges for non-obvious props.
- `TODO` / `FIXME` must reference a card: `TODO(INV-123):` — untracked TODOs block merge.
- **Dead code is deleted**, never commented out (Git is the archive).

---

## 10. Configuration, environments & feature flags

- Twelve-factor config from environment / secret manager.
- One immutable build artifact promoted across environments (don’t rebuild per env).
- Environments: **local, CI, staging, production** only.
- Feature flags: typed, kill-switch for risky rollouts; flags are **not** authorization.
- Flag hygiene: owner + removal ticket; stale flags audited.

---

## 11. Caching, jobs & file handling (mobile impact)

- Authenticated PHI HTTP responses: treat as private / no-store — don’t cache PHI in shared client caches inappropriately.
- Uploads: respect server limits; don’t trust client MIME alone; strip EXIF/GPS from images when uploading.
- Use short-lived scoped download URLs for private media.

---

## 12. Internationalization (mobile)

- All user-facing strings in locale files (`i18next` / `react-i18next`) — hardcoded UI strings lint-blocked.
- ICU MessageFormat for plurals / interpolation — no concatenating translated fragments.
- Dates/numbers/units via `Intl` APIs; store SI units, convert at display.
- RTL: use logical properties (`start`/`end`), verify layouts.
- Missing translations fall back to default locale and are reported — never show raw keys.

---

## 13. Delivery, testing & releases (mobile)

- GitHub Flow: `feature/INV-###` → PR → `main` → CI.
- Conventional Commits: `type(scope): summary [INV-###]`.
- PR size target ≤ **400 changed lines** (justify / split if larger).
- PHI / auth / tenancy changes: stricter review (two reviewers / senior).
- CI gates: lint → typecheck → tests + security scans → merge.
- Lockfiles committed; `npm ci` / frozen installs.
- Mobile releases: **staged rollouts** with crash-rate gates; keep server compatibility for **two previous app versions**.
- UI coverage gate: **≥ 80%** + accessibility assertions where CI supports it.

---

## 14. Incident & ops (mobile-aware)

| Severity | Meaning (examples) | Response |
| --- | --- | --- |
| SEV1 | PHI exposure, tenant breach, unsafe clinical output at scale, platform down | Ack ≤ 15 min |
| SEV2 | Major feature down / SLO hard breach | Ack ≤ 30 min |
| SEV3 | Degraded with workaround | Ack ≤ 4 business hours |
| SEV4 | Cosmetic / low impact | Normal backlog |

- On-call ownership + runbooks for production services the app depends on.
- Blameless postmortems for SEV1/SEV2 within 5 business days.

---

## 15. Third-party dependencies & SDKs (mobile)

- License allowlist: MIT, BSD, Apache-2.0, ISC OK; GPL/AGPL prohibited in shipped code.
- New runtime deps need reviewer sign-off (maintenance, security, footprint).
- Analytics / crash SDKs: minimize collection; **verify no T1/T2 leakage**.
- Any SaaS touching PHI needs security review + BAA.

---

## 16. API contract expectations (what mobile must assume)

- Success: resource under `data`, metadata under `meta` (correlation ID, pagination).
- Errors: Problem Details style — no PHI/stack/SQL in error bodies.
- Pagination: **cursor-based** (`limit` + `cursor`; `next_cursor` / `has_more`).
- JSON: `snake_case`, ISO-8601 UTC, UUID string IDs.
- Mutable updates may require ETag / If-Match; state-changing calls should send Idempotency-Key when supported.
- Rate limit: handle **429** + `Retry-After`.

### Response-time targets (gateway) — design UX around these

| Class | p95 | p99 |
| --- | --- | --- |
| Single-resource GET | ≤ 300 ms | ≤ 800 ms |
| Collection / search | ≤ 500 ms | ≤ 1.2 s |
| Writes | ≤ 500 ms | ≤ 1.5 s |
| Conversation history | ≤ 400 ms | ≤ 1 s |
| AI first token | ≤ 1.5 s | complete ≤ 10 s |

---

## 17. Enforcement (handoff reminder)

- Non-compliance can mean PR rejection or mandatory remediation.
- Performance, security, coverage, and grounding gates are **non-functional requirements**, same weight as features.
- Exceptions need a written, time-boxed ADR — silent exceptions do not exist.

---

## 18. This repo (practical notes for Invigorate mobile)

- Expo SDK: follow versioned docs in `AGENTS.md` (currently Expo v56).
- Prefer existing patterns: feature folders under `src/components/` + `src/screens/`, React Query hooks, Zustand for true local/session UI state.
- New green UI modules are largely UI-complete; many still use static data — when wiring APIs, keep static fallbacks for missing fields and never put PHI in route params.
- Temporary demo bypasses (e.g. screen privacy off for recordings) must be restored before production builds.

---

*Extracted for mobile developers from Invigorate Health Coding Standards Rev 3.2. For full platform rules (backend, semantic layer, micro-frontends, infra), refer to the complete client document.*
