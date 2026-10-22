import config from "./config.js";
import swaggerJSDoc from "swagger-jsdoc";

/**
 * Generate the various options for swagger
 */
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: config.swagger.title,
            version: config.swagger.version,
            description: config.swagger.description,
            contact: {
                name: config.swagger.contact.name,
                url: config.swagger.contact.url,
                email: config.swagger.contact.email
            }
        },
        servers: {
            url: config.swagger.contact.url,
            description: config.swagger.description,
        }
    },
    apis: ['./src/routes/api/v1/*routes.js']
};

/** Extract the config from jsdoc */
const swaggerConfig = swaggerJSDoc(options);
export default swaggerConfig;