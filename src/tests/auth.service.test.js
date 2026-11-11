import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import argon2 from 'argon2';

import config from '@/config/config.js';
import { setupTestDB } from './setup.js';
import { encodeToken } from '@/utils/auth.utils.js';
import service from '@/service/auth/auth.service.js';
import db, { User } from '@/db/database.js';

/** 
 * Vars for tokens
 */
let validToken = undefined;
let invalidToken = undefined;
let validRefreshToken = undefined;
let invalidRefreshToken = undefined;

describe('AUTH Services', () => {

    describe('Login service', () => {

        beforeEach(async () => {

            /**
            * Create a default user
            */
            await User.create({
                email: "testuser1@test.co.uk",
                username: "testUser1",
                password: await argon2.hash("testUser1"),
                displayName: "Test User 1",
                status: "active",
                roles: "user"
            });

            /** generate fresh tokens */
            let payload = { id: 2, username: "tesUser1", roles: ["user"] };
            validToken = await encodeToken(payload, config.auth.jwt.secret, config.auth.jwt.expires);
            validRefreshToken = await encodeToken(payload, config.auth.refresh.secret, config.auth.refresh.expires);
        });

        afterEach(async () => {
             await db.truncate({ restartIdentity: true });

            /** In development we use sqllite so we have to 
             *  restart the identities direct
             */
            await db.query(`DELETE from "sqlite_sequence" WHERE "name" = 'Users' `);
        })

        it('should log a user into the system and return a valid token', async () => {

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "testUser1";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            /** Check we have a token returned */
            expect(result).toBeDefined();

            expect(result.error).not.toBeDefined();

            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBeTypeOf('string');   

            expect(result).toHaveProperty('refreshToken');
            expect(result.refreshToken).toBeTypeOf('string'); 

        });

        it('should return an error if the passwords provided do not match', async () => {

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "D0ntL3tMe1n!!";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            /** Check we have a token returned */
            expect(result).toBeDefined();

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();

            expect(result.error).toBeDefined();
            expect(result.error).toEqual("Password validation failure.");
            

        });

        it('should return an error if the user was not found', async () => {

            /** Setup the desired username and password */
            const user = "testUser";
            const pass = "L3tMe1n!!";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();
            expect(result.error).toBeDefined();

            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("User not found.");

        });

        it('should return an error if there was a database connection error', async () => {

            /** Spy On the User Model and simulate a database connection failure */
            vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Connection refused'));

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "testUser1";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();
            expect(result.error).toBeDefined();

            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("Connection refused");

        });

        it('should return an error if there was a issue verifying the users password', async () => {

            /** Mock the verify function for argon2 */
            vi.spyOn(argon2, 'verify').mockRejectedValue(new Error("There was a problem verifying the passwords hash."));

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "testUser1";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();
            expect(result.error).toBeDefined();

            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("There was a problem verifying the passwords hash.");

        })

    });

    describe('Register service', () => {

        beforeEach(async () => {

            /** Seed the Users table before each test */
            await User.create({
                email: "testuser1@test.co.uk",
                username: "testUser1",
                password: await argon2.hash("testUser1"),
                displayName: "Test User 1",
                status: "active",
                roles: "user"
            });

        });

        afterEach(async () => {

            /** Clear out the Users table for each test */
            await db.truncate({ restartIdentity: true });

            /** In development we use sqlite so we have to 
             *  restart the identities direct
             */
            await db.query(`DELETE from "sqlite_sequence" WHERE "name" = 'Users' `);

        });

        it('should register a new user and return the user object and tokens', async () => {

            /**
             * Setup the vars needed for the registration process
             */
            const username = "testUser9";
            const email = "testuser9@test.co.uk";
            const password = "testUser9";
            const displayName = "Test User 9";
            
            /**
             * Execute the service method we need to test
             */
            const result = await service.register(email, username, password, displayName);

            /** 
             * Test the result is as expected
             */
            expect(result).toBeDefined();

            expect(result).toHaveProperty('error');
            expect(result.error).not.toBeDefined();

            expect(result).toHaveProperty('user');

            expect(result.user).toHaveProperty('userId');
            expect(result.user.userId).toBeTypeOf('number');

            expect(result.user).toHaveProperty('username');
            expect(result.user.username).toBeTypeOf('string');

            expect(result.user).toHaveProperty('email');
            expect(result.user.email).toBeTypeOf('string');

            expect(result.user).toHaveProperty('displayName');
            expect(result.user.displayName).toBeTypeOf('string');

            expect(result.user).toHaveProperty('status');
            expect(result.user.status).toBeTypeOf('string');

            expect(result.user).toHaveProperty('roles');
            expect(result.user.roles).toBeTypeOf('string');

            expect(result).toHaveProperty('tokens');

            expect(result.tokens).toHaveProperty('access');
            expect(result.tokens.access).toBeTypeOf('string');

            expect(result.tokens).toHaveProperty('refresh');
            expect(result.tokens.refresh).toBeTypeOf('string');

        })

        it('should return an error if the email is already in use', async () => {

            /**
             * Setup the vars needed for the registration process
             */
            const username = "testuser9@test.co.uk";
            const email = "testuser1@test.co.uk";
            const password = "testUser9";
            const displayName = "Test User 9";
            
            /**
             * Execute the service method we need to test
             */
            const result = await service.register(email, username, password, displayName);

            /** 
             * Test the result is as expected
             */
            expect(result).toBeDefined();

            expect(result.user).not.toBeDefined();

            expect(result.tokens).toBeDefined();
            expect(result.tokens).toHaveProperty('access');
            expect(result.tokens).toHaveProperty('refresh');
            expect(result.tokens.access).not.toBeDefined();
            expect(result.tokens.refresh).not.toBeDefined();

            expect(result.error).toBeDefined();
            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("Validation failure. Email address is already in use.");

        });

        it('should return an error if the password could not be hashed', async () => {

            /** Spy on the hash function and throw an error */
            vi.spyOn(argon2, 'hash').mockRejectedValueOnce(new Error("Unable to hash password"));

            /** Set the values to be passed to the function being tested */
            const username = "testUser9";
            const email = "testuser9@test.co.uk";
            const password = "testUser9";
            const displayName = "Test User 9";

            /**
             * Execute the service method we need to test
             */
            const result = await service.register(email, username, password, displayName);

            /**
             * Check the result is as we expect it to be
             */
            expect(result).toBeDefined();

            expect(result).toHaveProperty('user');
            expect(result.user).not.toBeDefined();

            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toHaveProperty('access');
            expect(result.tokens.access).not.toBeDefined();
            expect(result.tokens).toHaveProperty('refresh');
            expect(result.tokens.refresh).not.toBeDefined();

            expect(result).toHaveProperty('error');
            expect(result.error).toBeDefined();
            expect(result.error).toBeTypeOf('string');

            
        });

        it('should return an error if there is any other issue', async () => {

            /**
             * Mock the failed Model
             */
            vi.spyOn(User, 'create').mockRejectedValueOnce(new Error("Connection lost"));

            /**
             * Set the values needed to be passed to the function being tested
             */
            const username = "testUser9";
            const email = "testuser9@test.co.uk";
            const password = "testUser9";
            const displayName = "Test User 9";

            /**
             * Execute the service method we need to test
             */
            const result = await service.register(email, username, password, displayName);

            /**
             * Check the result is as we expect
             */
            expect(result).toBeDefined();

            expect(result).toHaveProperty('user');
            expect(result.user).not.toBeDefined();

            expect(result).toHaveProperty('tokens');
            expect(result.tokens).toHaveProperty('access');
            expect(result.tokens.access).not.toBeDefined();
            expect(result.tokens).toHaveProperty('refresh');
            expect(result.tokens.refresh).not.toBeDefined();

            expect(result).toHaveProperty('error');
            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual('Connection lost');

        });

    });

});