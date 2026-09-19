import { LeitnerRepository } from '../src/server/database/repository.js';
import { getConfig } from '../src/server/config.js';
const repository = new LeitnerRepository(getConfig().dataDir);
try {
    console.log('JSON:', repository.createBackup());
    console.log('SQLite:', await repository.databaseBackup());
} finally {
    repository.close();
}
