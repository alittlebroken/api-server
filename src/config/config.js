import 'dotenv/config';

/**
 * Create a config object to mapp environment vars to and set defaults
 * and then export this
 */
const config = {
    application: {
        host: process.env.APP_HOST || 'http://localhost',
        port: process.env.APP_PORT || 3000,
        mode: process.env.APP_MODE || 'development',
        name: process.env.APP_NAME || 'Template API Server'
    },
    cors: {
        allowed_hosts: process.env.CORS_ALLOWED_HOSTS || 'http://localhost:5173',
        credentials: process.env.CORS_CREDENTIALS || true
    },
    ratelimit: {
        window: process.env.RATE_LIMIT_TIME || 15 * 60 * 1000,
        requests: process.env.RATE_LIMIT_REQUESTS || 200
    },
    logging: {
        path: process.env.LOG_LOCATION || logs,
        minLevel: process.env.LOG_MIN_LEVEL || 'info',
        rotation: process.env.LOG_ROTATION || '1d',
        maxSize: process.env.LOG_SIZE || '20m',
        keepForDays: process.env.LOG_KEEP_FOR_DAYS || '14d'
    },
    swagger: {
        title: process.env.SWAGGER_TITLE || 'Template API Server',
        version: process.env.SWAGGER_VERSION || '0.0.1',
        description: process.env.SWAGGER_DESCRIPTION || 'Template API server in Node.JS/Express',
        contact: {
            name: process.env.SWAGGER_CONTACT_NAME || 'Administrator',
            url: process.env.SWAGGER_CONTACT_URL || 'http://localhost:3000',
            email: process.env.SWAGGER_CONTACT_EMAIL || 'admin@localhost'
        }
    }
};

export default config;