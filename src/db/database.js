import { Sequelize } from 'sequelize';

import config from '../config/config.js';
import logger from '../config/winston.js';
import UserConfig from '../models/auth/User.model.js';

/** Setup the sequalize connection */
let conn = new Sequelize(config.database.name, config.database.user, config.database.pass, {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone
});

/** Open the connection and assign it to a local var called db
 *  which we then use to export
*/
let db;
let User;

try {
    await conn.authenticate();
    logger.log('info', "Connected to the database.")
    /** Import the models config and define them here */
    
    db = conn;
    User = conn.define("User", UserConfig);
} catch(error) {
    conn = null;
    logger.log('error', "Issue connecting to the database: " + error.message);
}

export { db, User};