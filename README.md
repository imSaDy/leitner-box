# Leitner Box

A Persian-first desktop app for learning words, phrases, and sentences with spaced repetition. It runs locally on Windows and stores all study data in a transactional SQLite database.

## Install on Windows

**Requirement:** [Node.js 24.11 or later](https://nodejs.org/)

1. Download the ZIP file from the [latest release](https://github.com/imSaDy/leitner-box/releases/latest).
2. Extract it to a permanent folder.
3. Double-click `Install Leitner.cmd`.
4. Open the app from the **Leitner Box** shortcut on your desktop.

You can also run `Start Leitner.cmd` directly without installing the shortcut.

The app works offline for daily study. An internet connection is only needed for online pronunciation and web fonts.

## Privacy and data storage

Every fresh installation starts with an empty database. The repository and release files contain no personal cards, study history, logs, databases, or backups.

Your data stays under your own Windows account:

```text
%LOCALAPPDATA%\LeitnerBox\data\leitner.sqlite
%LOCALAPPDATA%\LeitnerBox\data\backups\
```

Clearing browser storage or moving the application folder does not remove the database. The app does not upload study data to a server or cloud service.

To move your collection to another computer, create a backup from the **Backups** section and restore that file in the new installation.

## Features

- Leitner boxes and scheduled reviews
- Card library, search, topics, notes, and custom examples
- Persian right-to-left interface
- Light and dark themes with responsive layouts
- Transactional SQLite persistence
- Protection against stale writes from multiple open windows
- Manual backup, download, and restore tools
- Standalone app window using Chrome or Microsoft Edge

The app never restores a backup automatically or on a timer. A restore only happens after an explicit user action, and a new safety backup is created before current data is replaced.

## Development

```text
npm ci
npm start
npm run check
npm test
```

Run `npm run dev` to start development mode on port 8766 with an isolated database under `.local-data/development`. Automated tests use temporary databases and temporary browser profiles.

Optional environment variables:

- `LEITNER_DATA_DIR`: changes the local data directory.
- `LEITNER_PORT`: changes the local server port.

See [`.env.example`](.env.example) for examples and [the architecture documentation](docs/architecture.md) for storage guarantees and project structure.

## Project structure

```text
public/                Application page, styles, icons, and public learning content
src/client/            Browser application, features, services, and UI modules
src/server/            Local HTTP service and application configuration
src/server/database/   SQLite schema, transactions, backups, and repository layer
src/shared/            Validation shared by the client and server
scripts/               Desktop launcher, shortcut installer, and developer tools
tests/                 Unit, integration, and browser tests
docs/                  Architecture and verification notes
```

## License

Released under the [ISC License](LICENSE).

