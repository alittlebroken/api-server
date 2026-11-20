import jwt from 'jsonwebtoken';

import logger from "../config/winston";
import config from '../config/config';

/**
 * validateTokens
 * 
 * Checks if the request has valid access and refresh tokens set
 * if it does then adds a user object to the request.
 * 
 * Used for securing routes and should ideally be the first 
 * middleware applied to routes
 */
export const validateToken = async (req, res, next) => {

    try{

        /** Extract the bearer token */
        const token = req.headers['authorization'];

        if(!token){
            logger.log('error', 'Auth failure - missing access token');
            res.headers.set("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Missing access token"');
            return res.status(401).json({ message: 'Auth failure - missing access token' });
        }

        const accessToken = token.split(' ')[1];
        const decodedToken = await jwt.verify(accessToken, config.auth.jwt.secret);
        
        req.user = {
            id: decodedToken.id,
            email: decodedToken.email,
            username: decodedToken.username,
            roles: decodedToken.roles,
            status: decodedToken.status
        }
        next();

    } catch (err) {
        
        logger.log('error', err.message);

        /** Check the error message */
        if(err.name === "TokenExpiredError"){
            res.headers.set("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Access token expired"');
            return res.status(401).json({ message: 'Auth failure - Access token expired' });
        }
        else if (err.name === "JsonWebTokenError"){
             res.headers.set("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Access token malformed"');
            return res.status(401).json({ message: 'Auth failure - Access token malformed' });
        } else {
            return res.status(500).json({ message: 'Internal Server Failure. Please try again later.'})
        }

        
    }

};