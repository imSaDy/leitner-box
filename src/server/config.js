import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const publicRoot = path.join(projectRoot, 'public');
const userDataRoot =
    process.platform === 'win32'
        ? process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
        : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');

export function getConfig(env = process.env) {
    const port = Number(env.LEITNER_PORT || 8765);
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid LEITNER_PORT');
    return {
        host: '127.0.0.1',
        port,
        dataDir: path.resolve(env.LEITNER_DATA_DIR || path.join(userDataRoot, 'LeitnerBox', 'data')),
        maxBodyBytes: 64 * 1024 * 1024,
    };
}
