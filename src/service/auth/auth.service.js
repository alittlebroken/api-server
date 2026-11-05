import argon2 from 'argon2';

import config from '../../config/config.js';
import logger from '../../config/winston.js';
import { encodeToken } from '../../utils/auth.utils.js';
import { User } from '../../db/database.js';

const service = {

    login: async (username, password) => {

        /** Vars for the tokens */
        let accessToken = undefined;
        let refreshToken = undefined;

        try{

            /** Get the user from the DB */
            const user = await User.findOne({
                attributes: [ 'userId', 'username', 'password', 'roles', 'status'],
                where: {
                    username: username
                }
            });

            if(!user){
                logger.log("info", `The user "${username}" was not found`);
                return {
                    accessToken: undefined,
                    refreshToken: undefined,
                    error: "User not found."
                }
            }

            /** Compare the passwords */
            if(await argon2.verify(user.password, password)){
                
                /** Generate tokens */
                accessToken = await encodeToken({
                        id: parseInt(user.userId),
                        username: user.username,
                        roles: user.roles
                    }, 
                    config.auth.jwt.secret, 
                    config.auth.jwt.expires
                );

                refreshToken = await encodeToken({
                        id: parseInt(user.id),
                        username: user.username,
                        roles: user.roles
                    }, 
                    config.auth.refresh.secret, 
                    config.auth.refresh.expires
                );

                return { accessToken: accessToken.token, refreshToken: refreshToken.token, error: undefined }

            } else {

                logger.log('error', `The supplied password does not match the hashed password in the database for user "${username}"`);
                return {
                    accessToken: undefined,
                    refreshToken: undefined,
                    error: "Password validation failure."
                }

            }

        } catch (err) {
            logger.log('error', err.message);
            return { error: err.message }
        }

    }

};

export default service;