import 'dotenv/config';
import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import app from './app';

const server = app.listen(env.PORT, async () => {
  await connectDatabase();
  logger.info(`Server started`, {
    port: env.PORT,
    env: env.NODE_ENV,
    apiVersion: env.API_VERSION,
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    await disconnectDatabase();
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

export default server;
