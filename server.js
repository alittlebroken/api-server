import app from "./src/app.js";

/**
 * Start the app listening on the specified port
 */
app.listen(3000, (error) => {
    if (error) {
        console.error(error);
    }

    console.log(`API server listening on port 3000`);
})