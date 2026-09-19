import { getConfig } from './config.js';
import { LeitnerRepository } from './database/repository.js';
import { createApplicationServer } from './http.js';

const config = getConfig();
const repository = new LeitnerRepository(config.dataDir);
const server = createApplicationServer(repository, config);
server.on('error', (error) => {
    console.error(
        error.code === 'EADDRINUSE'
            ? `Port ${config.port} is in use. Close the earlier preview or change LEITNER_PORT.`
            : error
    );
    repository.close();
    process.exitCode = 1;
});
server.listen(config.port, config.host, () => {
    console.log(`Leitner Box: http://${config.host}:${server.address().port}`);
    console.log(`Database: ${repository.filename}`);
});
let closing = false;
function shutdown() {
    if (closing) return;
    closing = true;
    server.close(() => {
        repository.close();
    });
    server.closeIdleConnections();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
