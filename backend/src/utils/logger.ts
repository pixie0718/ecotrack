import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const isProd = process.env.NODE_ENV === 'production';
const logDir = process.env.LOG_DIR || './logs';

const consoleTransport = new winston.transports.Console({
  format: isProd
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), simple()),
});

const fileTransports = isProd
  ? []
  : [
      new DailyRotateFile({
        dirname: logDir,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp(), errors({ stack: true }), json()),
      }),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json()),
      }),
    ];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'carbon-footprint-api' },
  transports: [consoleTransport, ...fileTransports],
});
