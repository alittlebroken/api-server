import { Sequelize } from 'sequelize';

import config from '@/config/config.js';
import logger from '@/config/winston.js';

/** Database vars */
let db;
let dbConfig;

/** Model vars for exporting */
let User = undefined;

/** Import config files for models */
import userConfig from '@/models/auth/User.model.js';

/** If we are in development we need to 
 *  use the in memory sqlite DB and in 
 *  production use a different dialect
 * like postgres
 */
if(config.application.mode === "development"){

    dbConfig = {
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: false,
        pool: { max: 1, idle: Infinity, maxUses: Infinity },
    }

} else {

    dbConfig = {
        database: config.database.name,
        username: config.database.user,
        password: config.database.pass,
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        timezone: config.database.timezone
    }

}

/** Open the connection and assign it to a local var called db
 *  which we then use to export
*/
try {

    db = new Sequelize(dbConfig);
    
    /** Open the connection to the database */
    await db.authenticate();
    logger.log('info', "Connected to the database.")

    /**
     * Define the models
     */
    User = db.define('User', userConfig, { tableName: 'Users' });

} catch(error) {
    logger.log('error', "Issue connecting to the database: " + error.message);
}

export { User };
export default db;