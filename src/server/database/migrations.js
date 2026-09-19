/** Migrations are append-only and run in a transaction before serving requests. */
export const migrations = [
    {
        version: 1,
        sql: `
            CREATE TABLE app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                revision INTEGER NOT NULL DEFAULT 0,
                initialized INTEGER NOT NULL DEFAULT 0 CHECK (initialized IN (0, 1)),
                payload TEXT NOT NULL CHECK (json_valid(payload)),
                preferences TEXT NOT NULL CHECK (json_valid(preferences))
            ) STRICT;
            CREATE TABLE cards (
                id TEXT PRIMARY KEY,
                position INTEGER NOT NULL,
                box INTEGER NOT NULL CHECK (box BETWEEN 1 AND 5),
                category TEXT NOT NULL,
                payload TEXT NOT NULL CHECK (json_valid(payload))
            ) STRICT;
            CREATE INDEX cards_box ON cards(box);
            CREATE INDEX cards_category ON cards(category);
            CREATE TABLE operations (
                id TEXT PRIMARY KEY,
                request_hash TEXT NOT NULL,
                revision INTEGER NOT NULL,
                created_at TEXT NOT NULL
            ) STRICT;
            CREATE TABLE migration_archive (
                checksum TEXT PRIMARY KEY,
                imported_at TEXT NOT NULL,
                card_count INTEGER NOT NULL,
                payload TEXT NOT NULL CHECK (json_valid(payload))
            ) STRICT;
        `,
    },
    {
        version: 2,
        sql: `
            CREATE TABLE recovery_events (
                id INTEGER PRIMARY KEY,
                recovered_at TEXT NOT NULL,
                source_backup TEXT NOT NULL,
                source_revision INTEGER NOT NULL,
                card_count INTEGER NOT NULL
            ) STRICT;
        `,
    },
];

export function migrateDatabase(db) {
    const version = Number(db.prepare('PRAGMA user_version').get().user_version);
    if (version > migrations.at(-1).version) throw new Error('Database version is newer than this application.');
    for (const migration of migrations.filter((item) => item.version > version)) {
        db.exec('BEGIN IMMEDIATE');
        try {
            db.exec(migration.sql);
            db.exec(`PRAGMA user_version = ${migration.version}`);
            db.exec('COMMIT');
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
}
