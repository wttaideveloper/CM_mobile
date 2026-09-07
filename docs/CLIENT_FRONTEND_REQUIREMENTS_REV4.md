# Invigorate Health — Client Frontend Requirements (Rev 4.0 Mobile)

**App:** Expo React Native mobile app  
**Basis:** Coding Standards Revision 4.0 (mobile-relevant rules)  
**Purpose:** Client requirements for frontend / mobile

---

## §5 Frontend & Mobile

1. Functional components + hooks only (no class components)
2. Split files at **250 lines** into sub-components / hooks
3. **React Query** for all remote data (not Redux for server state)
4. `useState` for local UI; context only for theme / language
5. Wearable streams in localized custom hooks
6. Virtualized `FlatList` / `SectionList` with stable `keyExtractor`
7. Chat: virtualized + cursor-paginated; streamed tokens without full-thread re-render; citations as tappable chips
8. Cached image lib (`expo-image` / fast-image) over raw `<Image>` for scrolling
9. HealthKit / Health Connect / Fitbit in isolated modules with permission-denied fallbacks
10. WCAG 2.2 AA + **axe assertions in CI**

---

## §6 Navigation & Frontend Performance

11. Single sanctioned navigator (React Navigation / stack); one root
12. Central typed route registry (PascalCase names + typed params)
13. Auth flow vs app flow as separate groups; **structural** guards (not per-screen `if`s)
14. Deep links: universal links + app scheme; protected deep links re-auth first
15. Route params = **IDs only** — never PHI, tokens, or personal data in params
16. Android back matches UI back; confirm before discarding destructive flows
17. Navigation state restoration; never show stale PHI after session expiry
18. Skeleton loaders on navigation; cursor infinite scroll with end state
19. Performance budgets: cold start ≤2s, warm ≤500ms, nav ≤300ms, 60fps lists (asserted in CI)

---

## §7 Client-Side Security (Mobile)

20. No `eval` / dynamic `Function` / unsafe HTML rendering of LLM/rich text
21. Sanitize any rendered rich text / markdown / LLM output
22. No PHI, tokens, or secrets in plaintext web storage (mobile: Keychain/Keystore, not AsyncStorage for secrets)
23. Access tokens in memory where possible; refresh handled securely
24. Client validation is UX-only; server re-validates
25. **FLAG_SECURE / snapshot blurring** on PHI and conversation screens

---

## §8 Auth, Tokens & Sessions (Mobile)

26. Keycloak as IdP (no hand-rolled auth)
27. Access token TTL ≤ 15 min; audience/issuer validated
28. Rotating refresh + reuse detection; server-side logout revocation
29. **15-minute HIPAA idle logoff**; background → foreground beyond window needs biometric/PIN
30. NIST 800-63B passwords (min 12, length over composition rules, breached-password check)
31. MFA for staff/coach/admin (offer to end users)
32. No user-enumeration in login errors

---

## §9 / §10 Data & Mobile Hardening

33. T1–T4 classification applied to fields the app handles
34. Push payloads: **no T1/T2 content** — IDs/references only; app fetches after unlock
35. SecureStore / Keychain / Keystore for secrets
36. SSL pinning to intermediate CA or public key **with backup pin**
37. Jailbreak / root detection
38. No PHI in plaintext local storage
39. TLS only (no cleartext for PHI traffic)

---

## §13 / §15 / §16 / §17 Naming, Uploads, i18n, Quality & Releases

40. Naming: PascalCase components, camelCase vars, kebab-case folders
41. Uploads: client MIME never trusted alone (server magic-byte); size limits
42. i18n: resource files, ICU MessageFormat, Intl formatting, SI units, RTL
43. UI test coverage ≥ 80% + axe
44. Mobile releases: staged rollouts with crash-rate gates; server compatibility for 2 previous app versions
45. Lockfile committed (`package-lock.json` / frozen installs)

---

## §3 / §4 / §12 / §20 AI & Chat Client Contracts

46. AI/chat streaming via defined SSE events (`token`, `citation`, `tool`, `done`, `error`)
47. Cursor pagination for conversation history
48. Citations, grounding UI, crisis/refusal UX where assistant surfaces exist
49. Mobile KPIs: crash-free ≥99.5%, cold start ≤2s (instrumented)

---

## Tenant Rule (Client Contract)

Tenant identity must come from the verified token only. The app must not rely on client-supplied `tenant_id` query params for authorization or data scoping.
