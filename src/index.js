import 'dotenv/config';
import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    logger.info(`Viverse AI Agent Server is running on http://${HOST}:${PORT}`);
    if (HOST === '0.0.0.0') {
        logger.info('External access is enabled. Access via your network IP.');
    }
});
