# Verification — SQLite refactor

## v2.1.4 storage hardening

- A legacy WAL fixture with an unclosed WAL upgrades to DELETE journaling and EXTRA synchronous mode. Its latest revision and every card are preserved in a checksummed `before-journal-change` backup.
- A malformed fixture is rejected at startup without replacing its database file.
- A stale SQLite connection rejects writes; simulated corrupt and unreadable HTTP 500 responses leave the pending review answer exportable instead of retrying indefinitely.
- `npm run check`, `npm run test:server`, and `npm run test:browser` passed on the updated code.

Completed using synthetic fixtures and disposable browser contexts:

- `npm run check`: passed.
- `npm test`: passed (9 database/API tests and the browser suites).
- Legacy comparison: 143 browser assertions passed.
- Final expanded storage suite: 31 checks passed, including explicit empty/sample initialization and logo loading.
- Desktop launcher: started the real local service successfully with `-NoBrowser`.
- Desktop shortcut: target, launcher and icon verified; previous shortcut retained.
- New client source contains no browser-storage writes or removals.
- Original source files were hash-checked against the pre-database archive before removing duplicate active files from the project root.

The database/API tests cover injected SQL failure, injected backup failure, rollback, integrity, revision conflict, idempotency, exact migration preservation, restore/checksum and private-file access boundaries. Browser tests include lost acknowledgements, network outage/retry, pending export, rejected form drafts and atomic review completion.

Personal data migration is a separate user-visible step. The test results do not imply that the user's existing Chrome data has already been imported.
