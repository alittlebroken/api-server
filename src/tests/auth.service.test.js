import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import argon2 from 'argon2';

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

vi.mock('../models/auth/User.model.js', () => {
    return {
        default: mockUser
    }
});

import config from '../config/config.js';
import { encodeToken } from '../utils/auth.utils.js';
import service from '../service/auth/auth.service.js';

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
            /** generate fresh tokens */
            let payload = { id: 2, username: "tesUser1", roles: ["user"] };
            validToken = await encodeToken(payload, config.auth.jwt.secret, config.auth.jwt.expires);
            validRefreshToken = await encodeToken(payload, config.auth.refresh.secret, config.auth.refresh.expires);
        });

        it('should log a user into the system and return a valid token', async () => {

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("L3tMe1n!!"), roles: ["user"], status: "active" });

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "L3tMe1n!!";
            
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

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("L3tMe1n!!"), roles: ["user"], status: "active" });

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

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue(null);

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

            /** Mock the return value for the model functions */
            mockUser.findOne.mockRejectedValue(new Error("There was an internal database issue."));

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "L3tMe1n!!";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();
            expect(result.error).toBeDefined();

            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("There was an internal database issue.");

        });

        it('should return an error if there was a issue verifying the users password', async () => {

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("L3tMe1n!!"), roles: ["user"], status: "active" });

            /** Mock the verify function for argon2 */
            vi.spyOn(argon2, 'verify').mockRejectedValue(new Error("There was a problem verifying the passwords hash."));

            /** Setup the desired username and password */
            const user = "testUser1";
            const pass = "L3tMe1n!!";
            
            /** Call the service being tested */
            const result = await service.login(user, pass);

            expect(result.accessToken).not.toBeDefined();
            expect(result.refreshToken).not.toBeDefined();
            expect(result.error).toBeDefined();

            expect(result.error).toBeTypeOf('string');
            expect(result.error).toEqual("There was a problem verifying the passwords hash.");

        })

    });

});