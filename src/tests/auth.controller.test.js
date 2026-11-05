import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";

/**
 * Mock the user model
 */
const { mockUser } = vi.hoisted(() => ({
    mockUser: {
        findOne: vi.fn(),
        create: vi.fn(),
        findAll: vi.fn(),
    }
}));

vi.mock('../db/database.js', () => {
    return {
        default: mockUser
    }
});

import config from '../config/config.js';
import service from '../service/auth/auth.service.js';
import controller from '../controllers/auth/auth.controller.js';
import { encodeToken } from "../utils/auth.utils.js";

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

});