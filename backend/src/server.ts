import 'dotenv/config';
import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';
import app from './app';

async function startServer(): Promise<void> {
  // Connect to the database BEFORE accepting any requests
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info('Server started', {
      port: env.PORT,
      env: env.NODE_ENV,
      apiVersion: env.API_VERSION,
    });
  });

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

startServer().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
