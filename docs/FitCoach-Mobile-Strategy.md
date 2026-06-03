# FitCoach — Mobile Strategy: Capacitor vs Native Decision

**Version:** 1.0
**Last updated:** 23 May 2026
**Status:** Locked for V1
**Related:** FitCoach-PRD.md section 5.3

---

## 1. Decision

**V1 ships as native iOS + Android apps via Capacitor wrapper around the existing Next.js codebase.**

The same code that runs as a web app is packaged into real App Store + Play Store apps. No separate native codebase. No UI rebuild.

React Native rebuild is deferred to V2, conditional on real usage data showing native polish is needed.

---

## 2. Why not stay PWA-only

Early trainer feedback consistently surfaced a request for "an app I can download from the Play Store / App Store" rather than installing via browser. Reasoning:

- Indian users (Android-heavy market) discover apps via Play Store
- App Store presence signals legitimacy for a new product
- "Add to Home Screen" PWA flow is unfamiliar to many users, especially on iOS
- Push notification reliability is better in native apps than PWA on iOS
- For a brand-new product without existing users, the friction of explaining "go to this URL, then tap Add to Home Screen" is higher than "download from Play Store"

PWA install prompt works well on Android Chrome but iOS requires manual instructions — that gap was decisive.

---

## 3. Why Capacitor over React Native or fully native

### Capacitor (chosen)

- Wraps existing Next.js code into iOS + Android apps
- Real App Store and Play Store listings
- Native APIs accessible via plugins (camera, push, biometrics, file system, contacts)
- ~2-3 weeks setup vs 4-6 weeks for React Native rebuild
- Single codebase — same code serves web app, iOS app, Android app
- Used in production by major apps (Instagram parts, Snapchat features, most Indian fintech)

### React Native (deferred to V2)

Would require:
- Rebuilding every UI component (Tailwind → StyleSheet, HTML → React Native components)
- Switching navigation library (Next.js App Router → React Navigation)
- Switching charts library (Recharts → Victory Native)
- Switching all forms, modals, inputs

Estimate: 4-6 weeks of UI rebuild work added to V1 timeline.

### Swift + Kotlin (rejected)

Three codebases (web + iOS + Android), three sets of bugs. Not viable for a solo founder.

---

## 4. Technical limitations of Capacitor (acknowledged)

| Limitation | Impact on FitCoach | Mitigation |
|---|---|---|
| Heavy animations slightly less smooth than native | Negligible — FitCoach UI is mostly forms, lists, chat | Avoid complex animations |
| WebView spinup adds ~1-2 sec on app open | Minor UX cost | Splash screen during load |
| iOS may kill WebView in background more aggressively | Push notifications unaffected | Use native push, not Web Push |
| App Store occasionally rejects "too web-app-like" apps | Real risk | Use native features (push, biometric, camera) so app demonstrates platform integration |
| Native scroll feel and keyboard handling needs tuning | Solvable | Use Capacitor plugins for native scroll behavior |

---

## 5. What we get with Capacitor

- Real App Store + Play Store listings (the trainer's primary request)
- App icon on home screen
- Native push notifications (FCM for Android, APNs for iOS)
- Native camera and photo picker
- Biometric authentication option (Face ID, fingerprint)
- Offline support via service workers
- Native file storage and downloads
- Splash screen and proper app launch behavior
- Indistinguishable from native to end users

---

## 6. Tech stack for V1

| Layer | Technology |
|---|---|
| Frontend framework | Next.js + React + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Mobile wrapper | Capacitor (iOS + Android targets) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| File storage | Supabase Storage (photos), R2 backup later |
| WhatsApp | AiSensy as BSP |
| Payments | Razorpay |
| AI | Claude Haiku (food vision + escalation classifier) + Claude Sonnet (plan generation) |
| Hosting (web) | Vercel |
| App Store | Apple Developer account ($99/year) |
| Play Store | Google Play Console ($25 one-time) |

---

## 7. Migration path to React Native (V2, if needed)

If V1 usage data shows Capacitor performance or native feel is a real problem:

**What we keep:**
- All business logic (Supabase queries, API integrations, state management)
- Database schema and backend
- Brand assets and design system

**What we rebuild:**
- Every screen UI (4-6 weeks)
- Navigation flow
- Styling system

**Trigger conditions for V2 rebuild:**
- 30%+ of trainers complain about performance or feel
- Specific use cases (e.g., heavy animation needs, complex camera flows) require native
- We're past PMF and have engineering capacity to invest

The migration work is the same regardless of when we do it. Doing it later means we know which screens actually need polish.

---

## 8. Apple Developer + Google Play setup

**Apple Developer Program**
- Cost: $99/year
- Approval time: 1-2 days
- Can be enrolled as individual initially, transferred to Pvt Ltd later
- Required for App Store distribution and TestFlight beta

**Google Play Console**
- Cost: $25 one-time
- Approval time: 1-2 days
- Required for Play Store distribution and internal testing

Both should be applied for in week 1 of build, before any Capacitor work begins, since approval can take days.

---

## 9. App Store review considerations

Apple has rejected web-wrapped apps in the past when they appeared to be "just a website." Mitigations:

- Use native push notifications (not Web Push)
- Implement biometric login (Face ID / fingerprint)
- Use native camera plugin, not browser getUserMedia
- Implement deep linking
- App must function fully offline at least for cached content
- Avoid sign-up flows that depend entirely on web

These are good UX practices anyway, not just compliance work.

---

## 10. Change log

| Date | Version | Change | Decided by |
|------|---------|--------|------------|
| 23 May 2026 | 1.0 | Initial decision — Capacitor for V1, React Native deferred to V2 conditional on data | Founder + Claude |

---

*This document supplements the main PRD. Mobile architecture decisions live here for engineering reference.*
