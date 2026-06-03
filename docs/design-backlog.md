# Design Backlog

Issues found during testing. Fix before Phase 2 ships unless marked Low.

| Issue | Screen | Severity | Notes |
|---|---|---|---|
| Header name flickers "Coach" before real name loads | Header | Low | Auth `getSession()` is async — shows placeholder until it resolves. Fix: SSR the name or use a skeleton. Batch into CP3 when header is refactored. |
| Plan builder: all weeks show same exercises | Plan builder | Med | Phase 1 saves one week template (cycle 1, week 1) that repeats across all weeks. Per-week variation (different exercises in W2 vs W1) requires a separate grid state per week + schema work. Phase 2. |
