# Local containment candidate, 2026-11-14

Not deployed. No email, database mutation, live queue edit, or workflow edit was performed.

## What this patch does
- Holds all POST sends with HTTP 409 before any DB/provider access. A client `approved:true` and publicly writable state are not trusted approval evidence.
- Removes automatic UI approval and date-file status replacement. Preserves existing edits and receipt/history; server terminal history wins over a stale local draft.
- Uses stable normalized-recipient + introduction-purpose keys for new drafts.
- Requires a private, fresh (<=24h) explicitly reconciled history file before generating. Missing or uncertain history fails before overwriting the existing queue.
- Excludes any previous send attempt (including failed/unknown), suppression and existing queued recipient. Requires current purpose-specific eligibility evidence, not email verification alone.
- Does not retry sends, rewrite existing IDs, migrate history, or authorize follow-ups.

## Intentional deployment blockers
This is containment, NOT a complete authenticated approval/send service. Approval and send controls are disabled. The existing scheduled workflow has not been changed and supplies no private history file, so it will fail safely at generation if this candidate is deployed. Existing daily validators also still require today's exact ten drafts; do not relax this silently or call the scheduled pipeline working.

Before operational release: owner-authorized rollout; authenticated server approval of exact message/recipient/purpose version; trusted send/opt-out/bounce/unknown ledger reconciliation; stable atomic claim and provider idempotency; safe unknown-send reconciliation; eligible-recipient evidence; revised workflow/validators allowing carried-forward drafts and honest shortfalls. Do not use generic writable app state as authorization. Existing public contact data was not changed; private eligibility/history must never be committed into public data.

## Snapshot input contract (local generation only)
OUTREACH_HISTORY_FILE points to an operator-provided private JSON snapshot with `reconciled: true`, ISO `asOf`, and arrays `sends`, `suppressions`, `eligibility`. Send/suppression rows identify `recipient`. Eligibility rows require recipient, purpose `fixaur-fleet-introduction-v1`, eligible true, HTTPS sourceUrl and future ISO validUntil. This is a prerequisite for draft generation, not proof of permission to send. No snapshot was fabricated or exported in this task.

## Verification
Tests were first observed failing, then passing. `npm test`: 7 passed. `npm run build`: passed. `git diff --check`: passed. No browser, authenticated live API or end-to-end delivery test was run. No existing test command existed before this patch.

`npm ci --ignore-scripts` reported two existing high-severity dependency findings (vite and source-map-js); no dependency upgrades were made. Runtime emitted an experimental EnvHttpProxyAgent warning.
