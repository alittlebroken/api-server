import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import { encodeToken } from "../utils/auth.utils.js";
import db, { User } from '@/db/database.js';
import { validateToken } from "../middlewares/auth.middleware.js";

describe('Auth Middleware', () => {

    describe('validateTokens', () => {

        beforeEach(async () => {

        });

        afterEach(async () => {

        });

        it('should validate the tokens add a user to the request and call the next function', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, config.auth.jwt.secret, { expiresIn: config.auth.jwt.expires } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

            /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { user: {}, cookies: {}, headers: { "authorization": `Bearer ${bearerToken}`, "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { cookies: { set: vi.fn() }};
            const next = vi.fn();

            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(req.user).toEqual({ id: 1, username: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" });
            expect(next).toHaveBeenCalled();

        });

        it('should return 401 if the authorization header is missing', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, config.auth.jwt.secret, { expiresIn: config.auth.jwt.expires } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

            /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { cookies: {}, headers: { "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { headers: { set: vi.fn() }, cookies: { set: vi.fn() }, status: vi.fn().mockReturnThis(), json: vi.fn() };
            const next = vi.fn();

            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(req.user).not.toBeDefined();
            expect(next).not.toHaveBeenCalled();
            expect(res.headers.set).toHaveBeenCalledWith("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Missing access token"');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Auth failure - missing access token" });

        });

        it('should return 401 if the token is missing from the Authorization header', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, config.auth.jwt.secret, { expiresIn: config.auth.jwt.expires } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

           /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { cookies: {}, headers: { "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { headers: { set: vi.fn() }, cookies: { set: vi.fn() }, status: vi.fn().mockReturnThis(), json: vi.fn() };
            const next = vi.fn();


            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(req.user).not.toBeDefined();
            expect(next).not.toHaveBeenCalled();
            expect(res.headers.set).toHaveBeenCalledWith("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Missing access token"');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Auth failure - missing access token" });

        });

        it('should return 401 if the token has expired', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, config.auth.jwt.secret, { expiresIn: -1 } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

            /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { cookies: {}, headers: { "authorization": `Bearer ${bearerToken}`, "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { headers: { set: vi.fn()} , cookies: { set: vi.fn() }, status: vi.fn().mockReturnThis(), json: vi.fn() };
            const next = vi.fn();

            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(res.user).not.toBeDefined();
            expect(next).not.toHaveBeenCalled();
            expect(res.headers.set).toHaveBeenCalledWith("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Access token expired"');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Auth failure - Access token expired" });

        });

        it('should return 401 if the token is malformed', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, "pineappleRum", { expiresIn: config.auth.jwt.expires } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

            /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { cookies: {}, headers: { "authorization": `Bearer ${bearerToken}`, "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { headers: { set: vi.fn()} , cookies: { set: vi.fn() }, status: vi.fn().mockReturnThis(), json: vi.fn() };
            const next = vi.fn();

            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(res.user).not.toBeDefined();
            expect(next).not.toHaveBeenCalled();
            expect(res.headers.set).toHaveBeenCalledWith("WWW-Authentication", 'Bearer, error="invalid_token", error_description="Access token malformed"');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Auth failure - Access token malformed" });

        });

        it('should return 500 for any other type of error encountered', async () => {

            /**
             * Generate the variables used to pass to the middleware for testing
             */
            const userPayload = { id: 1, username: "testuser1", password: "testuser1", email: "testuser1@test.co.uk", roles: "user", status: "active" };
            const bearerToken = jwt.sign(userPayload, config.auth.jwt.secret, { expiresIn: config.auth.jwt.expires } );
            const refreshToken = jwt.sign(userPayload, config.auth.refresh.secret, { expiresIn: config.auth.refresh.expires });

            /**
             * Generate the req, res and next objects to pass to the middleware 
             */
            const req = { cookies: {}, headers: { "authorization": `Bearer ${bearerToken}`, "Set-Cookie": `refreshToken=${refreshToken}; HttpOnly;Secure=false`}};
            const res = { cookies: { set: vi.fn() }, status: vi.fn().mockReturnThis(), json: vi.fn() };
            const next = vi.fn();

            /** Spy on the JWT Verification method so we can set a error to trigger the test */
            vi.spyOn(jwt, 'verify').mockRejectedValue(() => {
                new Error("Some random error has occurred");
            });

            /** 
             * Execute the middleware
             */
            await validateToken(req, res, next);

            /** 
             * Check the middleware was executed and ran as expected
             */
            expect(res.user).not.toBeDefined();
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Failure. Please try again later.'});
            

        });

    });

});