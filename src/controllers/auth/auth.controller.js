import config from "../../config/config";
import { encodeToken } from "../../utils/auth.utils";

import service from '../../service/auth/auth.service.js';
import logger from "../../config/winston.js";

const controller = {

    /**
     * Allows the user to login
     * 
     * Username and password are passed via the request body as a
     * json object
     * 
     * @param {object} req - The request
     * @param {object} res - The response
     * @param {object} req.body - The json payload
     * @param {string} req.body.username - The users username
     * @param {string} req.body.password - The users password
     * @returns {string} The access token for a successful login
     */
    login: async (req, res) => {

        /** Validation of required request parameters */
        if(!req.body.username || req.body.username === undefined || req.body.username === null || typeof req.body.username != "string"){
            logger.log('error', 'Username was not found in the request body for login or is invalid.')
            return res.status(404).json({ message: "Validation failure. Username is missing or invalid."});
        }

        if(!req.body.password || req.body.password === undefined || req.body.password === null || typeof req.body.password != "string"){
            logger.log('error', 'Password was not found in the request body for login or is invalid.')
            return res.status(404).json({ message: "Validation failure. Password is missing or invalid."});
        }

        try {

            /** Attempt the login process */
            const { accessToken, refreshToken, error } = await service.login(req.body.username, req.body.password);

            if(error){
                logger.log('error', error);

                if(error === "User not found.") return res.status(404).json({ message: "No user found with supplied name"});
                if(error === "Password validation failure.") return res.status(404).json({ message: "The supplied password is incorrect"});
            }

            // Return the accessToken and set the refreshToken in a http only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: config.application.mode === 'production' ? true : false,
            });
            res.status(200).json({ token: accessToken });

        } catch(err) {
            logger.log('error', err.message);
            return res.status(500).json( { message: "Internal server error. Please try again later." })
        }

    },

    /**
     * Registers a user into the system
     * 
     * @param {object} req - The request
     * @param {object} res - The response
     * @param {object} req.body - The json payload
     * @param {string} req.body.username - The desired username
     * @param {string} req.body.password - The desired password
     * @param {string} req.body.displayName - The desired displayName
     * @param {string} req.body.email - The desired email address for the user
     * @returns {string} The access token for a successful login
     */
    register: async (req, res) => {

        /** Validation */
        if(!req.body.username || req.body.username === undefined || req.body.username === null || typeof req.body.username != 'string'){
            return res.status(404).json({ message: "Validation failure. Username is missing or incorrect" });
        }

        if(!req.body.password || req.body.password === undefined || req.body.password === null || typeof req.body.password != 'string'){
            return res.status(404).json({ message: "Validation failure. Password is missing or incorrect" });
        }

        if(!req.body.displayName || req.body.displayName === undefined || req.body.displayName === null || typeof req.body.displayName != 'string'){
            return res.status(404).json({ message: "Validation failure. Display Name is missing or incorrect" });
        }

        if(!req.body.email || req.body.email === undefined || req.body.email === null || typeof req.body.email != 'string'){
            return res.status(404).json({ message: "Validation failure. Email is missing or incorrect" });
        }
    
        try{

            /** Register the user with the service */
            const result = await service.register(
                req.body.email,
                req.body.username,
                req.body.password,
                req.body.displayName
            );

            /** Check for any error messages */
            if(result.error){

                /** Check the type of error */
                if(result.error === "Validation failure. Email address is already in use.") {
                    return res.status(409).json({ message: "Email address is already in use" });
                } else {
                    throw new Error(err.message);
                }

            }

            /** Set the refresh token */
            res.cookie('refreshToken', result.tokens.refresh, {
                httpOnly: true,
                secure: config.application.mode === 'production' ? true : false,
            } );

            /** Send the result back with the user object and access token */
            res.status(200).json({
                user: { 
                    id: result.user.userId, 
                    username: result.user.username, 
                    displayName: result.user.displayName,
                    email: result.user.email,
                    roles: result.user.roles,
                    status: result.user.status 
                },
                token: result.tokens.access
            })

        } catch(err) {
            logger.log('error', err.message);
            return res.status(500).json({ message: "Internal Server Issue. Please try again later." });
        }

    },
}

export default controller;