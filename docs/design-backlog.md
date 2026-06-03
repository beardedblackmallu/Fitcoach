# Design Backlog

Issues found during testing. Fix before Phase 2 ships unless marked Low.

| Issue | Screen | Severity | Notes |
|---|---|---|---|
| Header name flickers "Coach" before real name loads | Header | Low | Auth `getSession()` is async — shows placeholder until it resolves. Fix: SSR the name or use a skeleton. Batch into CP3 when header is refactored. |
