# Architecture and persistence contract

## Boundaries

The desktop launcher starts a loopback-only Node process and opens Chrome/Edge in app mode. Static assets and ES modules are served through an explicit allowlist. There is no remote database or cloud account. Runtime code uses Node's built-in SQLite module; dependencies in package.json are development tools only.

The composition root is `src/client/app.js`. Feature installers receive a private application context containing shared session state and named dependencies. They are not exposed on `window`. This preserves the previous review behavior while splitting the former 4,359-line closure into focused modules. UI effects remain independent from scheduling and persistence. Configuration and example catalogs account for most of the remaining text volume.

`services/transactions.js` serializes user mutations. `services/persistence.js` owns the acknowledged snapshot, revision and pending operation. Features await saves before showing success, clearing a form or advancing a review. The last answer and completed-session history are committed in the same transaction. Background pronunciation updates wait for active mutations and recheck card identity/word before writing.

## Storage

SQLite uses a rollback journal in DELETE mode, EXTRA synchronous mode and a busy timeout. The application has one local writer and does not need WAL's persistent main/WAL file pair. Startup checks database integrity before any schema write. An existing WAL database is first read with its WAL, saved as a checksummed `before-journal-change` JSON backup, switched to DELETE mode, and checked again. A failed integrity check stops startup without replacing the database. Each write checks integrity and compares the current connection with a fresh connection before opening a transaction. Versioned SQL migrations run transactionally.

- `cards`: one JSON record per card, indexed box/category and stable display position. Extra historical fields remain intact.
- `app_state`: statistics, categories, deletion markers, extra metadata, preferences and a monotonic revision.
- `operations`: durable idempotency IDs and payload hashes.
- `migration_archive`: exact incoming migration/restore payloads, including legacy backup keys when supplied.

Reads span a single SQLite snapshot. A write starts `BEGIN IMMEDIATE`, checks revision and deletion permission, creates any backup required for an explicit destructive action, updates only changed card rows and metadata, records the operation ID, then commits. Failure rolls back the entire SQL transaction. A stale revision returns 409 and cannot overwrite newer data.

An ambiguous network failure retains the same payload and operation ID. Retrying an already committed operation returns its earlier result without applying it twice. The browser never reports success from a queued write. After two failed attempts it asks for an explicit retry and offers an emergency JSON download. Pending writes survive retries in the running window, not browser termination; the last acknowledged state remains on disk. Ordinary browser storage is never used for new writes.

JSON backups are written to an exclusive temporary file, flushed, and renamed. Checksum verification detects accidental edits, not malicious tampering. Backups are created by an explicit user action or immediately before an explicit destructive operation such as deletion, migration or restore. `npm run backup` also creates a consistent standalone SQLite backup using the online backup API. Do not copy only the live `.sqlite` file while its WAL is active.

Startup and ordinary saves never read backup files and never restore one automatically. If the database is missing, corrupt or inaccessible, the application stops or shows setup/error state so the owner can choose the recovery source.

## Migration and imports

The root file-origin page is a read-only bridge for the original URL. It reads only `leitner_*` keys and can download them without deleting or rewriting anything. Transfer to the loopback page uses a one-time nonce plus exact source/origin checks. File-origin cross-origin API writes are not enabled. The new UI requires preview and a transfer click. Existing raw exports and versioned backups are supported.

No historical cleanup, deduplication, category rewrite or sample synchronization runs during migration or ordinary startup. Invalid data is rejected with an error instead of silently repaired. Sample cards require an explicit fresh-library choice. Full restoration is separate from the legacy additive import operation and requires a concrete confirmation showing incoming card count.

## HTTP boundary

The listener binds only `127.0.0.1`. Exact Host and Origin checks, a random session token, JSON-only writes, request-size limits, CSP and frame denial protect the local HTTP surface from ordinary cross-site requests. The token is an origin-level safeguard, not authentication against other applications running under the same OS account. Server source, configuration, backups and user data directories are not static mounts.

The dictionary endpoint and audio sources retain the original pronunciation behavior. Font/dictionary/audio services may need internet; card CRUD, review, import/export and persistence do not.

## Verification

- Unit tests: exact migration preservation/reopen, revision conflicts, idempotency, unauthorized deletion, invalid input, injected SQL rollback, injected backup failure, JSON restore/checksum and online SQLite backup.
- API tests: origin/token checks, migration replay, exports/backups, body limits and static-file traversal boundaries.
- Browser regression: original application fixture versus the SQLite version across CRUD, duplicate prevention, import/export, flashcard/typing/combined/sentence review, incomplete review, nested editing, themes, filters, keyboard focus and six responsive widths. Generated IDs and metadata timestamps are normalized for cross-version comparison; all card fields, progress and statistics are compared.
- Browser storage tests: onboarding, invalid import, exact state/settings preservation, no legacy cleanup, lost acknowledgement after commit, outage export/retry, stale window, rejected form draft, atomic final-card deletion and backup/restore UI.

All fixtures are synthetic. These checks cannot guarantee protection against every hardware failure; external backups remain useful.

References: [Node SQLite API](https://nodejs.org/api/sqlite.html), [SQLite synchronous pragma](https://www.sqlite.org/pragma.html#pragma_synchronous).
