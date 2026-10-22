# API Template  

This repository contains code to setup a simple API server. I set this up to stop me from typing out lots of boilerplate
each time I needed a new API server created.

It contains all the satndard packages and config I use across all projects.

I can then just add any extra packages and config based on the needs of the project at the time.

## Packages

| Name | Development Only |
| ---- | ---------------- |
| express | |
| express-rate-limit | |
| cors | |
| cookie-parser | |
| dayjs | |
| helmet | |
| joi | |
| jsonwebtoken | |
| multer | |
| sequelize | |
| pg | |
| pg-hstore | |
| swagger-jsdoc | |
| swagger-ui-express  | |
| winston | |
| winston-daily-rotate-file | |
| nodemon | Yes |
| supertest | Yes |
| vitest | Yes |
| dotenv | Yes |

## Environment files

Here is a list of the environmental files that are needed for the API server to run. In development they should be stored in a .env file and in production added to the ennvironment, obviously.

| Name | Description | Example Value(s) |
| ---- | ----------- | ---------------- |
| APP_HOST | The host server the app is served from | http://localhost |
| APP_PORT | The port the app listens to on the server | 3000 |
| APP_MODE | Is the server running in production or development | production |
| APP_NAME | The name of the application | API Server Template |
| CORS_ALLOWED_HOSTS | Which servers are allowed to access | http://localhost:5174|
| CORS_CREDENTIALS | Allow sensitive data like auth headers etc | include |
| RATE_LIMIT_TIME | Set a window for how long a rate limit lasts for in milliseconds| 15 * 60 * 1000 |
| RATE_LIMIT_REQUESTS | How many requests are allowed in a specified window| 200 |
| LOG_LOCATION | Where the server logs are stored | logs |
| LOG_MIN_LEVEL | What is the minimum level of alerts to record | info |
| LOG_ROTATION | How often to rotate log files | 1d |
| LOG_SIZE | Sets a size of a log file before it is rotated into a new file | 20m |
| LOG_KEEP_FOR_DAYS | How long to keep server log files for | 14d |
| SWAGGER_TITLE | Set a title for the Swagger docs |  API Template Server|
| SWAGGER_VERSION | Set the version of the swagger docs | 0.0.1 |
| SWAGGER_DESCRIPTION | Set a description to be shown in the docs | A simple template for a API Server |
| SWAGGER_CONTACT_NAME | Who is responsible for the docs | Admin |
| SWAGGER_CONTACT_URL | What is the url for the contacts website | http://localhost:3000 |
| SWAGGER_CONTACT_EMAIL | Email address for the swagger administrator | admin@localhost |