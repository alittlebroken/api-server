import db from './database.js';

/**
 * MODELS
 * 
 * For each model you wish to setup within the database, include them here
 */

/**
 * Relationships
 * 
 * Set the realtions between the models like one-to-one or one-to-many
 */

/** Sync the models with the database, creating the tables and relationships */
(() => {
   db.sync({ force: true }) // force: true, drops and recreates all tables loosing the data stored in them
   .then(() => {
    console.log("Successfully created models in database");
   })
   .catch((error) => {
    console.error("Unable to create models in database: " + error.message);
   } )
})();