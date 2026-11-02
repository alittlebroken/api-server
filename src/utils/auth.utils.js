import jwt from 'jsonwebtoken';

import config from '../config/config';
import logger from '../config/winston';

/**
 * Encode a payload inside JWT tokens
 * 
 * @param {object} payload - An object representing the payload to encode
 * @param {string} salt - The salt to use to help encrypt the token
 * @returns {string} The encoded payload as a json web token
 */
export const encodeToken = async (payload, salt, expires, type="access") => {

    /** validate the passed in arguments */
    if(!payload || payload === undefined || payload === null || Object.keys(payload).length <=0 ) return { token: undefined, error: "Token validation failure. Payload must be set." };
    if(!salt || salt === undefined || salt === null || salt?.length <= 0 ) return { token: undefined, error: "Token validation failure. A salt was expected." };
    if(!expires || expires === undefined || expires === null ) return { token: undefined, error: "Token validation failure. A expiry time was expected." };

    try {

        /** Attempt to encode the payload and generate the tokens */
        const accessToken = jwt.sign(payload, salt, { expiresIn: expires });

        return { token: accessToken, error: undefined};

    } catch(err) {
        console.log(err.message);
        logger.log("error", err.message);
        return { token: undefined, error: "Unable to generate token." };
    }

};

/**
 * Verifies the passed in token
 * 
 * @param {string} token - The token you wish to be verified
 * @param {string} salt - The salt used to sign the token
 * @returns {object} The verified and decoded token
 */
export const verifyToken = async (token, salt) => {

    /** Perform some verification on the passed in arguments */
    if(!token || token === undefined || token === null || typeof token != "string" ) return { token: undefined, error: "Token expected." };
    if(!salt || token === undefined || token === null || typeof salt != "string") return { token: undefined, error: "Token salt must be set." };

    try {

        const verifiedToken = await jwt.verify(token, salt);

        return { token: verifiedToken, error: undefined };

    } catch (err) {

        logger.log("error", err.message);
        return { token: undefined, error: err.message };

    }

}