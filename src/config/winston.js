import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'node:path';

import config from './config.js';

/** Set the base path for logs */
const logPath = path.join('.', config.logging.path);

/** Create a custom log format */
const customLogFormat = winston.format.printf(({ level, message, label, timestamp}) => {
    return `${timestamp} [${label}]: ${level} - ${message}`;
});

/** Create custom transports for each log type */
const errorTransport = new winston.transports.DailyRotateFile({
    level: 'error',
    dirname: logPath,
    filename: 'errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.keepForDays
});

const appTransport = new winston.transports.DailyRotateFile({
    dirname: logPath,
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.keepForDays
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.label({ label: `[${config.application.name}]`}),
        winston.format.timestamp({ format: 'DD-MM-YY HH:mm:ss' }),
        customLogFormat
    ),
    transports: [
        errorTransport,
        appTransport
    ]
});

/**
 * If not in production then add a logger for the console
 */
if(config.application.mode != 'production'){
    logger.add(new winston.transports.Console());
}

export default logger;