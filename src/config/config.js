import 'dotenv/config';

/**
 * Create a config object to mapp environment vars to and set defaults
 * and then export this
 */
const config = {
    application: {
        port: process.env.APP_PORT || 3000,
    },
    cors: {
        allowed_hosts: process.env.CORS_ALLOWED_HOSTS || 'http://localhost:5173',
        credentials: process.env.CORS_CREDENTIALS || true
    }
};

export default config;