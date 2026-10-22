import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/config.js';

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

/** Setup cors */
app.use(cors({
    origin: config.cors.allowed_hosts.split(","),
    credentials: config.cors.credentials,
}))

/** Apply default helmet config */
app.use(helmet());

/**
 * ==== ROUTING ====
 */

/**
 * Export out the app so that other modules/scripts can use it like testing
 * or a startup script
 */
export default app;