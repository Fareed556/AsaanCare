# KNOWN_ISSUES.md

## Active Issues

---

### 1. Subscriptions Routes Use Mock Data
**Severity:** Medium  
**Files:** `artifacts/api-server/src/routes/subscriptions.ts`

The `/subscriptions/plans`, `/subscriptions/stats`, and `/subscriptions` routes return hardcoded mock arrays. There is no `subscriptions` table in the database schema.

**Fix needed:** Design a subscriptions table, add to Drizzle schema, migrate DB, connect routes to real DB.

---

### 2. Seed Script Does Not Guard Against Duplicate Runs
**Severity:** Low  
**Files:** `artifacts/api-server/src/seed.ts`

Running the seed script multiple times inserts duplicate records. There is no `ON CONFLICT DO NOTHING` or existence check before inserting.

**Fix needed:** Wrap seed inserts in `onConflictDoNothing()` or check for existing records first.

---

### 3. TypeScript Lib Build Order
**Severity:** Low (dev experience)  
**Files:** `lib/db`, `lib/api-zod`, `lib/api-client-react`

Shared libraries must emit `.d.ts` declaration files (`tsc --build`) before dependent packages (api-server, sahatghar-admin) can typecheck. If typechecking fails after a clean install, build the libs first:

```bash
cd Supabase-Gateway
pnpm --filter @workspace/db run build
pnpm --filter @workspace/api-zod run build
pnpm --filter @workspace/api-client-react run build
```

---

### 4. bcrypt Cannot Be Used on Replit/Linux
**Severity:** Resolved  
**Files:** All previously using `bcrypt`

`bcrypt@6` requires native compilation via node-gyp. Replit/Linux does not have the required build toolchain in a usable form. **Replaced with `bcryptjs`** which is a pure JavaScript implementation with identical API.

**Do not reinstall `bcrypt`.** If you see `bcrypt` anywhere in the codebase, it must be `bcryptjs`.

---

### 5. JWT_SECRET Falls Back to Hardcoded String in Dev
**Severity:** Medium (production risk)  
**Files:** `artifacts/api-server/src/lib/jwt.ts`

If `JWT_SECRET` is not set, the server uses `"sahatghar-dev-secret-2025-change-in-production"`. This is fine for development but is a critical security issue if deployed without setting the env var.

**Fix needed before production:** Set `JWT_SECRET` in Replit Secrets to a random 64-character string.

---

### 6. Doctor App Cannot Run on Replit
**Severity:** Low (by design)  
**Files:** `artifacts/doctor-app/`

The Expo / React Native doctor app cannot be previewed in a browser. It requires a physical device, emulator, or Expo Go app. This is expected behavior for React Native.

---

### 7. No Email/SMS Notifications
**Severity:** Low  
**Status:** Not implemented

The `notifications` table and routes exist, but there is no email or SMS delivery. The notification system only stores records in the database. No SMTP, Twilio, or similar integration exists yet.

---

### 8. Ticket Reply `is_internal` Is Stored as Text
**Severity:** Low  
**Files:** `lib/db/src/schema/support.ts`

The `ticket_replies.is_internal` column is defined as `text` type storing `"true"` or `"false"` strings instead of a proper `boolean`. This works but is non-idiomatic.

**Fix needed:** Change to `boolean` type in schema and run migration.

---

### 9. Document Upload URLs Are Placeholders
**Severity:** Medium  
**Files:** `lib/db/src/schema/doctors.ts` (`doctor_verifications`)

The `cnic_front_url`, `cnic_back_url`, `degree_url`, `certificate_url` columns exist but no file upload system is implemented. The seed script uses placeholder strings.

**Fix needed:** Implement file upload (Replit Object Storage or similar) for doctor verification documents.

---

## Resolved Issues

| Issue | Resolution |
|---|---|
| `bcrypt` native build failure | Replaced with `bcryptjs` |
| `node_modules` missing on Replit | `pnpm install` completed |
| `vite: not found` on workflow start | Fixed by installing dependencies |
| `esbuild: not found` on workflow start | Fixed by installing dependencies |
