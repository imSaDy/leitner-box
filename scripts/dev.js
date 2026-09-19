import path from 'node:path';
import { spawn } from 'node:child_process';
import { projectRoot } from '../src/server/config.js';

// Development never opens the desktop user's production database by default.
const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', '--watch', 'src/server/index.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    windowsHide: true,
    env: {
        ...process.env,
        LEITNER_PORT: process.env.LEITNER_PORT || '8766',
        LEITNER_DATA_DIR: process.env.LEITNER_DATA_DIR || path.join(projectRoot, '.local-data/development'),
    },
});
child.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
});
child.on('exit', (code) => {
    process.exitCode = code || 0;
});
