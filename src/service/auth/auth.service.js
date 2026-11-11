import argon2 from 'argon2';

import config from '@/config/config.js';
import logger from '@/config/winston.js';
import { encodeToken } from '@/utils/auth.utils.js';
import { User } from '@/db/database.js';

const service = {

    login: async (username, password) => {

        /** Vars for the tokens */
        let accessToken = undefined;
        let refreshToken = undefined;

        try{

            /** Get the user from the DB */
            
            const user = await User.findOne({
                attributes: [ 'userId', 'email', 'username', 'password', 'displayName', 'roles', 'status'],
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
                        id: parseInt(user.userId),
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

    },

    register: async (email, username, password, displayName) => {

        try {

            /** Check if the email specified is not already in use */
            const emailCheck = await User.findOne({ where: {
                email: email
            } });

            if(emailCheck?.dataValues){
                if(Object.keys(emailCheck?.dataValues).length > 0){
                    return { error: "Validation failure. Email address is already in use.", user: undefined, tokens: { access: undefined, refresh: undefined } };
                }
            }

            /**
             * Create the new user
             */
            const hashedPassword = await argon2.hash(password);
            
            const result = await User.create({
                username: username,
                email: email,
                password: hashedPassword,
                displayName: displayName,
                status: 'active',
                roles: "user"
            });

            const users = await User.findAll({ where: { email: email }, raw: true});

            /** Extract out the user data from the result */
            let user = result?.dataValues;

            if(user){

                /**
                 *  Generate some tokens
                 */
                let accessToken = await encodeToken({
                        id: parseInt(user.userId),
                        username: user.username,
                        roles: user.roles
                    }, 
                    config.auth.jwt.secret, 
                    config.auth.jwt.expires
                );
                

                let refreshToken = await encodeToken({
                        id: parseInt(user.userId),
                        username: user.username,
                        roles: user.roles
                    }, 
                    config.auth.refresh.secret, 
                    config.auth.refresh.expires
                );

                return {
                    error: undefined,
                    user: user,
                    tokens: {
                        access: accessToken.token,
                        refresh: refreshToken.token
                    }
                }

            }


        } catch(err) {
            logger.log('error', err.message);
            return {
                user: undefined,
                tokens: {
                    access: undefined,
                    refresh: undefined
                },
                error: err.message
            }
        }

    },

};

export default service;