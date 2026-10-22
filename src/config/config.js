import 'dotenv/config';

/**
 * Create a config object to mapp environment vars to and set defaults
 * and then export this
 */
const config = {
    application: {
        port: process.env.APP_PORT || 3000,
    }
};

export default config;