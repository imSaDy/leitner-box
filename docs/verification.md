# Verification — SQLite refactor

## v2.1.9 quiet daily launch

- The desktop shortcut's VBScript checks local service health and opens the browser directly when the expected version is ready. This routine path starts no new PowerShell process.
- If the service is unavailable or outdated, the existing PowerShell recovery launcher still runs with a hidden window.
- The recovery launcher now accepts the old service having already closed its port during an upgrade; an isolated port test also confirms it rejects an unrelated listener.
- The installed desktop shortcut still targets `wscript.exe`; the scheduled background PowerShell service has no visible main window.
- `cscript` probe, a normal installed VBScript launch, server/browser tests, and an extracted release ZIP smoke test passed.

## v2.1.8 review-save responsiveness

- The supervised service probes `/api/health` every three seconds. On the 4,933-card local library, 30 consecutive health requests took about 199 ms on average before this change, with an earlier 4.8-second outlier.
- Health checks now compare the database revision through a fresh read-only connection without rescanning every SQLite page. Full integrity checks still run on startup, state reads and writes.
- On a synthetic 4,933-card database, a full connection check averaged 17 ms and the lightweight health check averaged 1 ms. The stale-connection unit test covers both paths.
- After updating the installed 4,933-card library, 30 health requests averaged 49 ms (maximum 107 ms). The database remained ready at revision 2,451, with the same 4,933 cards before and after the update.
- `npm run check`, `npm test`, a longer local-library health sample and the extracted release ZIP smoke test passed.

## v2.1.7 unresponsive-service recovery

- A separate scheduled-task fixture bound port 8768 and deliberately blocked the Node event loop. The service watchdog detected failed health checks, killed that process and started a new one. The fixture task and process were stopped after the check.
- The launcher retries an unresponsive running task, restarts only this installation's service, safely handles an empty error log and releases its launch mutex before displaying an error.
- The empty-error-log failure was reproduced in Windows PowerShell and the replacement `ReadAllText` path was checked against an empty file. The migration screen now appears after its file input handler is ready, removing a startup click race found by the browser suite.
- The live installation was upgraded against the existing personal database and checked for a ready health response, preserved revision and card count, and repeatable launches.
- `npm run check`, `npm test`, and an extracted release ZIP smoke test passed.

## v2.1.6 windowless launcher

- The desktop shortcut uses Windows Script Host to start the PowerShell launcher without a console window.
- The scheduled service task passes `-WindowStyle Hidden`; the `.cmd` fallback exits immediately after handing off to the windowless starter.
- The installed shortcut target and task action were inspected on Windows, the VBScript command was syntax-checked with `cscript`, and the local service stayed ready with the existing database after the update.
- `npm run check` and `npm test` pass.

## v2.1.5 service and pending-write recovery

- The Windows launcher registers a per-user scheduled task with logon and recurring triggers; the service wrapper restarts the server after an unexpected exit. A live forced-exit check restored the service and read the unchanged 4,911-card personal database at revision 2,430.
- Before sending a change, the browser commits its exact payload and operation ID to IndexedDB. On reopening, it checks whether that operation already committed, retries it only when the revision still matches, or offers an export when there is a conflict.
- Browser tests cover closing the window during an offline card addition and review answer, then reopening; they also cover an acknowledgement lost after a successful server commit.
- The local data file was checked with SQLite `integrity_check=ok` and the service API was checked for matching revision and card count after startup and restart. No personal data is included in release assets.
- `npm run check` and `npm test` pass on disposable browser profiles and synthetic databases.

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
