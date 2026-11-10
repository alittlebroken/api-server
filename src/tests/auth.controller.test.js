import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

import config from '../config/config.js';
import service from '../service/auth/auth.service.js';
import controller from '../controllers/auth/auth.controller.js';
import { encodeToken } from "../utils/auth.utils.js";
import db, { User } from '@/db/database.js';

/** Vars for mocking the tokens */
let accToken = undefined;
let refToken = undefined;
let invalidAccessToken = undefined;
let invalidRefreshToken = undefined;

describe('Auth controller', () => {

    describe('Login', () => {

        beforeEach(async () => {

            /** Set some tokens */
            accToken = await encodeToken({ userId: 1, username: "testUser1", roles: ["user"]}, config.auth.jwt.secret, config.auth.jwt.expires);
            refToken = await encodeToken({ userId: 1, username: "testUser1", roles: ["user"]}, config.auth.refresh.secret, config.auth.refresh.expires);

        });

        afterEach(async () => { 

            accToken = undefined;
            refToken = undefined;

        });

        it('should return status 200 and a valid access token', async () => {

            vi.spyOn(service, 'login').mockReturnValue({
                accessToken: accToken.token,
                refreshToken: refToken.token,
                error: undefined
            });

            /** Mock the request and response objects */
            const req = { body: { username: "testUser1", password: "letM3!n" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Set the token we expected to get back */
            const expectedToken = { token: accToken.token };
            const expectedCookieToken = refToken.token;

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(200); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith(expectedToken);

            expect(res.cookie).toHaveBeenCalledOnce();
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', expectedCookieToken, {
                httpOnly: true,
                secure: false
            });

        });

        it('should return status 404 if no user found matching passed in username', async () => {

            /** Mock the service login functionality */
           vi.spyOn(service, 'login').mockReturnValue({
                accessToken: undefined,
                refreshToken: undefined,
                error: "User not found."
            });

            /** Mock the request and response objects  */
            const req = { body: { username: "doIExist", password: "letM3!n" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({ message: "No user found with supplied name"});

            expect(res.cookie).not.toHaveBeenCalledOnce();

        });

        it('should return status 404 if the users password does not match what is stored in the database', async () => {

            /** Mock the service login functionality */
           vi.spyOn(service, 'login').mockReturnValue({
                accessToken: undefined,
                refreshToken: undefined,
                error: "Password validation failure."
            });

            /** Mock the request and response objects  */
            const req = { body: { username: "testUser1", password: "Gosh Darn It" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({ message: "The supplied password is incorrect"});

            expect(res.cookie).not.toHaveBeenCalledOnce();

        });

        it('should return status 404 if the username is missing or invalid', async () => {

            vi.spyOn(service, 'login').mockReturnValue({
                accessToken: accToken.token,
                refreshToken: refToken.token,
                error: undefined
            });

            /** Mock the request and response objects */
            const req = { body: { password: "letM3!n" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Set the token we expected to get back */
            const expectedToken = { token: accToken.token };
            const expectedCookieToken = refToken.token;

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({ message: "Validation failure. Username is missing or invalid."});

            expect(res.cookie).not.toHaveBeenCalledOnce();

        });

         it('should return status 404 if the password is missing or invalid', async () => {

            vi.spyOn(service, 'login').mockReturnValue({
                accessToken: accToken.token,
                refreshToken: refToken.token,
                error: undefined
            });

            /** Mock the request and response objects */
            const req = { body: { username: "testUser1" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Set the token we expected to get back */
            const expectedToken = { token: accToken.token };
            const expectedCookieToken = refToken.token;

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({ message: "Validation failure. Password is missing or invalid."});

            expect(res.cookie).not.toHaveBeenCalledOnce();

        });

        it('should return status 500 for any other error', async () => {

            /**
             * Mock the services method we are using 
             */
            vi.spyOn(service, 'login').mockRejectedValue(() => {
                new Error("Some random error has occurred");
            });

            /** Mock the request and response objects */
            const req = { body: { username: "testUser1", password: "L3tM3In!!" } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Set the token we expected to get back */
            const expectedToken = { token: accToken.token };
            const expectedCookieToken = refToken.token;

            /**
             * Execute the controller method we wish to test
             */
            await controller.login(req, res);

            /**
             * Check that the response was called with the right values
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(500); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error. Please try again later."});

            expect(res.cookie).not.toHaveBeenCalledOnce();

        });

    });

    describe('Register', () => {

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

        });

        afterEach(async () => {
            await db.truncate({ restartIdentity: true });

            /** In development we use sqllite so we have to 
             *  restart the identities direct
             */
            await db.query(`DELETE from "sqlite_sequence" WHERE "name" = 'Users' `);
        });

        it('should return status 200, the user created and an access and refresh tokens', async () => {

            /**
             * Set the request body properties
             */
            let username = "testUser10";
            let password = "testUser10";
            let displayName = "Test User 10";
            let email = "testuser10@test.co.uk";

            /** Generate some tokens */
            let payload = { id: 3, username: "testUser10", email: "testuser10@test.co.uk", roles: "user", status: "active" };
            let accessToken = await encodeToken(payload, config.auth.jwt.secret, config.auth.jwt.expires);
            
            /**
             * As the tokens include an iat, the signature of a token
             * changes each second and it is not good practice to remove
             * it as it can cause issues when verifying the tokens later
             * on.
             * 
             * So we mock the JWT library just for the tests to ensure 
             * that the test does not fail due to the tokens being 
             * created a second or two apart.
             */
            vi.spyOn(jwt, 'sign').mockReturnValue(accessToken.token);

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Set the expected values to be used by the controller */
            const expectedPayload = {
                user: {
                    id: 3,
                    username: "testUser10",
                    displayName: "Test User 10",
                    email: "testuser10@test.co.uk",
                    roles: "user",
                    status: "active"
                },
                token: accessToken.token
            }

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(200); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith(expectedPayload);

            expect(res.cookie).toHaveBeenCalledOnce();
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', accessToken.token, {
                httpOnly: true,
                secure: false
            });

        });

        it('should return status 404 if username is missing or invalid', async () => {

            /**
             * Set the request body properties
             */
            let username = undefined;
            let password = "testUser10";
            let displayName = "Test User 10";
            let email = "testuser10@test.co.uk";

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({
                message: "Validation failure. Username is missing or incorrect"
            });

        });

        it('should return status 404 if password is missing or invalid', async () => {

            /**
             * Set the request body properties
             */
            let username = "testUser10";
            let password = undefined;
            let displayName = "Test User 10";
            let email = "testuser10@test.co.uk";

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({
                message: "Validation failure. Password is missing or incorrect"
            });

        });

        it('should return status 404 if displayName is missing or invalid', async () => {

            /**
             * Set the request body properties
             */
            let username = "testUser10";
            let password = "testUser10";
            let displayName = undefined;
            let email = "testuser10@test.co.uk";

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({
                message: "Validation failure. Display Name is missing or incorrect"
            });

        });

        it('should return status 404 if email is missing or invalid', async () => {

            /**
             * Set the request body properties
             */
            let username = "testUser10";
            let password = "testUser10";
            let displayName = "Test User 10";
            let email = undefined;

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(404); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({
                message: "Validation failure. Email is missing or incorrect"
            });

        });

        it('should return status 409 if email address is already in use', async () => {

            /** 
             * Set the variables used to pass to the request body
             */
            let username = "testUser11";
            let email = "testuser1@test.co.uk";
            let password = "testUser11";
            let displayName = "Test User 11";

            /** Create the request and response objects for the controller */
            const req = { body: { username, email, password, displayName } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Execute the request */
            await controller.register(req, res);

            /** Check that what is run/returned is what we expect */
            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(409);

            expect(res.json).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: "Email address is already in use" });

        });

        it('should return status 500 for any other error', async () => {

            /**
             * Spy on the User model so we can mock a database connection
             * issue
             */
            vi.spyOn(service, 'register').mockRejectedValue(() => {
                new Error("Some random error has occurred");
            });

            /**
             * Set the request body properties
             */
            let username = "testUser10";
            let password = "testUser10";
            let displayName = "Test User 10";
            let email = "testuser10@test.co.uk";

            /**
             * Mock the request and response objects
             */
            const req = {  body: { username, password, displayName, email } };
            const res = { cookie: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };

            /** Call the controllers method we wish to test */
            await controller.register(req, res);

            /**
             * Test whether the result is as we expect it to be
             */
            expect(res.status).toHaveBeenCalledOnce();
            expect(res.status).toHaveBeenCalledWith(500); 

            expect(res.json).toHaveBeenCalledOnce();
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal Server Issue. Please try again later."
            });

        });

    });

});