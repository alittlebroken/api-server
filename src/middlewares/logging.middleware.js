import dayjs from "dayjs";
import logger from '../config/winston.js';

const logging = (req, res, next) => {

    /* Set the date and time of the route access */
    const dt = dayjs().format("DD-MM-YYYY hh:mm:ss.sssZ");

    /* Gather the request and response vars we need */
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const address = req.ip;
    const host = req.hostname;

    logger.info(`${host}(${address}) ${status} ${method} ${url}`)

    next();


};

export default logging;
