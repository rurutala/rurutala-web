# Dependency Security Maintenance

Last reviewed: 2026-10-26.

## Runtime

- Local Node.js: 24.22.1, including the October 2026 security fixes.
- Vercel Node.js setting: 24.x, confirmed by the project owner. Vercel manages
  patch versions; the exact deployed patch was not independently verified.

## Dependency Updates

- firebase-admin: 13.10.0 -> 14.5.0 (requires Node.js 22 or newer).
- @vercel/functions: 3.10.1 -> 3.10.3.
- Vite: 8.0.10 -> 8.3.5.
- Sharp: 0.34.5 -> 0.35.5.
- Vulnerable transitive dependencies were updated within their allowed ranges.

## Remaining Upstream Advisory

`npm audit` reports four High package findings for one advisory:
[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).

The chain is `@vercel/functions@3.10.3 -> @vercel/oidc@4.0.3 ->
@vercel/cli-config@0.3.3 -> zod@4.1.11`. The current SDK pins Zod and also
bundles version 4.1.11 into `@vercel/cli-config/dist/index.js`; a dependency-only
override would not fix that embedded copy. No override or audit suppression is
applied. Recheck the upstream SDK release and audit before the next deployment.

The site uses `getCache`, not CLI configuration parsing of untrusted input.
An exploitable request path has not been demonstrated; this is not a claim
that the vulnerable dependency is fixed. Do not use `npm audit fix --force` to
downgrade the SDK without verifying compatibility and upstream fixes.

## Checks

Run `npm audit --omit=dev`, `npm audit`, `npm run lint`, `node --test`, and
`npm run build`. API regression tests use in-memory stores and synthetic
requests; they do not write to production Firestore or Vercel Runtime Cache.

On the review date, the production build and lockfile consistency dry run
passed. All three API tests and nine SEO tests passed. The full suite had
26 passing tests and the same two pre-existing business-card test failures
seen before the dependency updates. Full lint also found an unused `arc`
import in the unchanged business-card `graphics-b.js` file.

Before publication, an isolated copy of the tracked site plus only this
security update passed a fresh `npm ci`, all 12 API/SEO tests, full lint, and
the production build. Its audit reported only the same four Zod-derived High
findings. Uncommitted business-card code, assets, and dependencies were not
included in that release check or the security commit.
