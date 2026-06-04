---
name: SahatGhar admin auth
description: Auth bypass credentials and known benign warnings.
---

## Admin login bypass
- Email: `admin@sahatghar.pk`
- Password: `SahatGhar@2025!`
- Hardcoded bypass in AuthContext; Supabase Auth is configured but the hardcoded check runs first.

## Known benign warnings
- Browser console: "Realtime send() is automatically falling back to REST API" — Supabase Realtime heartbeat, not an error.
- TypeScript errors in `button-group.tsx`, `calendar.tsx`, and api-client-react dist — pre-existing before this work, not caused by new pages.

**Why:** These crop up repeatedly; documenting prevents wasted investigation time.
