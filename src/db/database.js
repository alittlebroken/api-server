import { Sequelize } from 'sequelize';

import config from '../config/config.js';
import logger from '../config/winston.js';
import UserConfig from '../models/auth/User.model.js';

/** Database vars */
let db = undefined;
let conn = undefined;

/** Model vars for exporting */
let User = undefined;

/** If we are in development we need to 
 *  use the in memory sqlite DB and in 
 *  production use a different dialect
 * like postgres
 */
if(config.application.mode === "development"){
    cnn = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    })
} else {
    /** Setup the sequalize connection */
    conn = new Sequelize(config.database.name, config.database.user, config.database.pass, {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect,
        timezone: config.database.timezone
    });
}


/** Open the connection and assign it to a local var called db
 *  which we then use to export
*/
try {
    await conn.authenticate();
    logger.log('info', "Connected to the database.")
    /** Import the models config and define them here */
    
    db = conn;
    User = conn.define("User", UserConfig);

    /** If we are in development then we need to synch the Models with the database
     * so we can then perform crud operations on them.
     */
    if(config.application.mode === "development"){
        await conn.sync({ force: true });
    }

} catch(error) {
    conn = null;
    logger.log('error', "Issue connecting to the database: " + error.message);
}

export { db, User};