import { Sequelize } from 'sequelize';

import config from '../config/config.js';
import logger from '../config/winston.js';

/** Setup the sequalize connection */
let db = new Sequelize(config.database.name, config.database.user, config.database.pass, {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    timezone: config.database.timezone
});

/** Open the connection and assign it to a local var called db
 *  which we then use to export
*/
try {
    await db.authenticate();
    logger.log('info', "Connected to the database.")
} catch(error) {
    db = null;
    logger.log('error', "Issue connecting to the database: " + error.message);
}

export default db;