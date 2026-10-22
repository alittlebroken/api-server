import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import config from './config/config.js';
import logger from './config/winston.js';
import logging from './middlewares/logging.middleware.js';

/**
 *  ==== SETUP & Configuration ====
 */

/** 
 * Create the main express app and set up the use of having JSON attached via the 
 * request body
 */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/** Apply cookie settings */
app.use(cookieParser());

/** Setup cors */
app.use(cors({
    origin: config.cors.allowed_hosts.split(","),
    credentials: config.cors.credentials,
}))

/** Apply default helmet config */
app.use(helmet());

/** Apply rate limits - only in production */
if(config.application.mode === 'production'){

    app.use(rateLimit({
        windowMs: parseInt(config.ratelimit.window),
        limit: parseInt(config.ratelimit.requests),
        standardHeaders: 'draft-8',
        legacyHeaders: false
    }));

};

/** Apply logging to routes */
app.use(logging);

/**
 * ==== ROUTING ====
 */

/** Create a catch all error route. This must appear after all other routes */
app.use((err, req, res, next) => {
  logger.error(`${err.stack}`);
  res.status(500).send('There was an internal problem with the server.');
});

/**
 * Export out the app so that other modules/scripts can use it like testing
 * or a startup script
 */
export default app;