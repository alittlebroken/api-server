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

};

/**
 * Refreshes a users access token
 * 
 * @param {string} refreshToken - The users refresh token that a new access token is built from
 * @returns {object} A new access token or an error if something went wrong 
 */
export const refreshAccessToken = async (refreshToken) => {

    /** Validate and verify the passed in refresh token */
    if(!refreshToken || refreshToken === undefined || refreshToken === null || typeof refreshToken != 'string') return { token: undefined, error: "You must pass in a valid refresh token" };

    let { token: decodedRefreshToken, error: err } = await verifyToken(refreshToken, config.auth.refresh.secret);
    if(err){
        return { token: undefined, error: err }
    };

    /** generate a new access token for the user */
    const payload = { id: decodedRefreshToken.id, username: decodedRefreshToken.username, roles: decodedRefreshToken.roles };
    let { token, error } = await encodeToken(payload, config.auth.jwt.secret, config.auth.jwt.expires);
    if(error){
        return { token, error }
    }

    return { token, error: undefined };

};