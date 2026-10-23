import app from "./src/app.js";

import config from './src/config/config.js';

/**
 * Start the app listening on the specified port
 */
app.listen(config.application.port, (error) => {
    if (error) {
        console.error(error);
    }

    console.log(`API server listening on port ${config.application.port}`);
});