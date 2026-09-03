# My security notes

I keep this file as a map of where security-sensitive things live. This is a reminder for me, not a place to store passwords, API keys, or real secrets.

## Quick map

| What I am changing | File or folder | What I need to remember |
| --- | --- | --- |
| Company name, contact details, page copy | `src/content/site.md` | This is public content. Do not put passwords, private addresses, or internal notes here. |
| Demo staff accounts | `src/data/staff-accounts.json` | This currently contains plaintext demo passwords. Replace this before deployment. |
| Login, sessions, roles, account rules | `src/lib/auth.ts` | This is the main security boundary. Changes here need a build and login smoke test. |
| Which routes require login | `src/middleware.ts` | Protected routes are under `/dashboard` and `/admin`. Check this when adding a private route. |
| Login endpoint | `src/pages/api/login.ts` | Validates credentials, creates the signed cookie, and validates the redirect target. |
| Logout endpoint | `src/pages/api/logout.ts` | Clears the session cookie. Keep this endpoint small and predictable. |
| Owner account management | `src/pages/dashboard/owners.astro` | Owner-only page. Be careful with create, update, and delete actions. |
| Site layout and public links | `src/layouts/MainLayout.astro`, `src/layouts/Layout.astro` | These render public and dashboard UI. Do not expose session details here accidentally. |
| Server configuration | `astro.config.mjs` | The app uses Astro SSR with the Node adapter. Keep origin checks enabled. |
| Type declarations for request locals | `src/env.d.ts` | `Astro.locals.session` is typed here. Update it if the session shape changes. |
| Dependencies and scripts | `package.json` | Review security-sensitive dependency updates and run `npm audit`. |
| Deployment secret | Environment variable `SESSION_SECRET` | Use a long random value. Never commit it or put it in Markdown. |

## Password notes to myself

- The only current password values are in `src/data/staff-accounts.json`, and they are demo credentials.
- I must not use those demo accounts on a real deployment.
- Passwords are currently stored and compared as plaintext. That is acceptable only for a throwaway demo, not for production.
- Before launch, I need a password hashing scheme such as Node `crypto.scrypt` or a maintained password-hashing library.
- I should migrate the account shape from `password` to something like `passwordHash` and never render or return the password field.
- I should not put real passwords in this document, source code, screenshots, issues, or commit messages.

## How the current session works

1. A successful login reads an account from `src/data/staff-accounts.json`.
2. The server puts the user id, name, username, role, and expiry into a signed cookie.
3. The signature uses `SESSION_SECRET` and HMAC-SHA256.
4. `src/middleware.ts` reads and verifies that cookie on every request.
5. The middleware blocks unauthenticated dashboard requests and blocks employees from `/dashboard/owners`.
6. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.

My important rule: changing the cookie payload, role checks, expiry, or signing code can affect every private route. I should test both an owner and an employee after touching `src/lib/auth.ts`.

## Current concerns

### High priority before production

- **Plaintext passwords:** replace the demo account store with hashed passwords.
- **Local JSON storage:** `src/data/staff-accounts.json` is not a good multi-instance production database. Writes can be lost, race, or disappear during redeploys.
- **Secret management:** set `SESSION_SECRET` in the deployment environment. The app intentionally refuses to start in production without it.
- **Demo accounts:** remove or replace every included demo account before the site is public.

### Worth adding for a real service

- Add login rate limiting and temporary lockout after repeated failures.
- Add CSRF protection for state-changing dashboard forms. `SameSite=Lax` helps, but it is not a complete CSRF strategy.
- Add audit logging for owner account creation, role changes, deletion, and login failures. Do not log passwords or session values.
- Use a persistent session store or short-lived signed sessions with a revocation strategy if immediate logout or account disabling matters.
- Keep dependencies updated and review `npm audit` output before releases.
- Put the site behind HTTPS and confirm the production cookie has the `Secure` flag.
- Add backups and access controls for whatever database replaces the JSON file.

## Content and browser safety

- `src/content/site.md` is trusted server-side Markdown. I should treat it as code-adjacent input and avoid allowing untrusted visitors to edit it.
- The app converts Markdown with `marked` and injects some rendered HTML. If content ever becomes user-generated, add sanitization before rendering.
- Do not add secrets to frontmatter. Frontmatter is loaded into the server-rendered site and may appear in HTML.
- Keep `astro.config.mjs` origin checking enabled.
- Keep login redirects limited to local paths. Never accept an arbitrary external URL after login.
- Review external image URLs, links, forms, and analytics snippets before adding them.

## My editing workflow

1. For normal branding or copy changes, edit only `src/content/site.md`.
2. For a private page, add the route under `src/pages/dashboard/` and confirm the middleware path check covers it.
3. For owner-only behavior, enforce the role on the server. Hiding a link in the UI is not security.
4. After auth or form changes, run `npm run build`.
5. Test unauthenticated access, owner access, employee access, logout, and a bad login.
6. Run `npm audit` before deploying.
7. Check `git diff` to make sure no password, token, cookie, or `.env` file was added accidentally.

## Before I deploy

- [ ] `SESSION_SECRET` is set to a strong random value in the hosting environment.
- [ ] Demo accounts are removed or replaced.
- [ ] Passwords are hashed.
- [ ] Account data is in a real protected data store.
- [ ] HTTPS is enabled.
- [ ] Login rate limiting exists.
- [ ] CSRF protection exists for dashboard mutations.
- [ ] No secrets appear in tracked files, Markdown, logs, or build output.
- [ ] `npm run build` passes.
- [ ] `npm audit` has been reviewed.
- [ ] I have tested owner, employee, unauthenticated, invalid-login, and logout flows.
