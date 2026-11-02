import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import { encodeToken, verifyToken, refreshAccessToken } from "../utils/auth.utils.js";

/** Create some valid and invalid tokens */
let validToken = null;
let invalidToken = null;

let validRefresh = null;
let invalidRefresh = null;

describe('AUTH Utils', () => {

    /** Create new tokens before test */
    beforeEach(async () => {

        validToken = jwt.sign({ id: 1, username: "testUser1", roles: ["user"] }, "saltySecret", { expiresIn: config.auth.jwt.expires});
        validRefresh = jwt.sign({ id: 1, username: "testUser1", roles: ["user"] }, "saltyRefreshSecret", { expiresIn: config.auth.refresh.expires});

        invalidToken = jwt.sign({ id: 1, username: "testUser1", roles: ["user"] }, "saltySecret", { expiresIn: "-" + config.auth.jwt.expires });
        invalidRefresh = jwt.sign({ id: 1, username: "testUser1", roles: ["user"] }, "saltyRefreshSecret", { expiresIn: "-" + config.auth.refresh.expires });
    });

    /** Reset the tokens after each test */
    afterEach(() => {

        validToken = null;
        invalidToken = null;

        validRefresh = null;
        invalidRefresh = null;
    });

    describe('encodeToken', () => {

        it('should encode the payload and return the token', async () => {

            /**
             * Set the vars used to encode the data
             */
            const payload = { id: 1, username: "testUser1", roles: ["user"] };
            const salt = "saltySecret";
            const expires = "15m";

            /**
             * Execute the function(s)
             */
            const { token: accessToken, error: accessError } = await encodeToken(payload, salt, expires);
            
            expect(accessError).not.toBeDefined();
            expect(accessToken).toBeDefined();
            expect(accessToken).toEqual(validToken);

        });

        it('should return an error if no payload was passed in to encode', async () => {

           /**
             * Set the vars used to encode the data
             */
            const payload = {};
            const salt = "saltySecret";
            const expires = "15m";

            /**
             * Execute the function(s)
             */
            const { token: accessToken, error: accessError } = await encodeToken(payload, salt, expires);
            
            expect(accessError).toBeDefined();
            expect(accessToken).not.toBeDefined();
            expect(accessError).toEqual("Token validation failure. Payload must be set.");

        });

        it('should return an error if no salt was passed in', async () => {

           /**
             * Set the vars used to encode the data
             */
            const payload = { id: 1, username: "testUser1", roles: ["user"] };
            const salt = "";
            const expires = "15m";

            /**
             * Execute the function(s)
             */
            const { token: accessToken, error: accessError } = await encodeToken(payload, salt, expires);
            
            expect(accessError).toBeDefined();
            expect(accessToken).not.toBeDefined();
            expect(accessError).toEqual("Token validation failure. A salt was expected.");

        });

        it('should return an error if no expiry time was passed in', async () => {

           /**
             * Set the vars used to encode the data
             */
            const payload = { id: 1, username: "testUser1", roles: ["user"] };
            const salt = "saltySecret";
            let expires;

            /**
             * Execute the function(s)
             */
            const { token: accessToken, error: accessError } = await encodeToken(payload, salt, expires);
            
            expect(accessError).toBeDefined();
            expect(accessToken).not.toBeDefined();
            expect(accessError).toEqual("Token validation failure. A expiry time was expected.");

        });

    });

    describe('verifyToken', () => {

        it('should verify the token and return the decoded payload', async () => {

            /** Set the salt to be used for verification */
            const salt = "saltySecret";

            /** Set the token to be decrypted */
            const accessToken = validToken;
            
            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).toBeDefined();
            expect(verifiedError).not.toBeDefined();

            expect(verifiedToken).toHaveProperty('id');
            expect(verifiedToken.id).toBeTypeOf('number');
            expect(verifiedToken.id).toEqual(1);

            expect(verifiedToken).toHaveProperty('username');
            expect(verifiedToken.username).toBeTypeOf('string');
            expect(verifiedToken.username).toEqual("testUser1");

            expect(verifiedToken).toHaveProperty('roles');
            expect(verifiedToken.roles).toBeInstanceOf(Array);
            expect(verifiedToken.roles).toHaveLength(1);
            expect(verifiedToken.roles).toEqual(["user"]);

        });

        it('should return an error if the token is null', async () => {

            /** Set the salt to be used for verification */
            const salt = "saltySecret";

            /** Set the token to be decrypted */
            const accessToken = undefined;

            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).not.toBeDefined();
            expect(verifiedError).toBeDefined();

            expect(verifiedError).toBeTypeOf("string");
            expect(verifiedError).toEqual("Token expected.");


        });

        it('should return an error if the tokens salt is not set', async () => {

            /** Set the salt to be used for verification */
            const salt = undefined;

            /** Set the token to be decrypted */
            const accessToken = validToken;

            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).not.toBeDefined();
            expect(verifiedError).toBeDefined();

            expect(verifiedError).toBeTypeOf("string");
            expect(verifiedError).toEqual("Token salt must be set.");

        });

        it('should return an error if the token has expired', async () => {

            /** Set the salt to be used for verification */
            const salt = "saltySecret";

            /** Set the token to be decrypted */
            const accessToken = invalidToken;

            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).not.toBeDefined();
            expect(verifiedError).toBeDefined();

            expect(verifiedError).toBeTypeOf("string");
            expect(verifiedError).toEqual("jwt expired");


        });

        it('should return an error if the token is malformed', async () => {

            /** Set the salt to be used for verification */
            const salt = "saltySecret";

            /** Set the token to be decrypted */
            const accessToken = "Bearer " + invalidToken;

            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).not.toBeDefined();
            expect(verifiedError).toBeDefined();

            expect(verifiedError).toBeTypeOf("string");
            expect(verifiedError).toEqual("invalid token");

        });

        it('should return an error if the signature is invalid', async () => {

            /** Set the salt to be used for verification */
            const salt = "saltySecretTwelve";

            /** Set the token to be decrypted */
            const accessToken = invalidToken;

            /** Verify the token */
            const { token: verifiedToken, error: verifiedError } = await verifyToken(accessToken, salt);

            /** Check that the returned values are as we expected */
            expect(verifiedToken).not.toBeDefined();
            expect(verifiedError).toBeDefined();

            expect(verifiedError).toBeTypeOf("string");
            expect(verifiedError).toEqual("invalid signature");

        });

    })

    describe('refreshAccessToken', () => {

        it('should return a new access token', async () => {

            config.auth.refresh.secret = 'saltyRefreshSecret';
            config.auth.jwt.secret = 'saltySecret';

            /** generate the payload we wish to recreate a new token for */
            const payload = { id: 1, username: "testUser1", roles: ["user"] };
            
            /** Salt set for refreshing a token */
            const salt = "saltySecret";

            /** Set the expiry time of the token */
            const expires = "15m";

            /** generate a valid token that we expect to see the refresh token give us */
            const { token: expectedToken, error } = await encodeToken(payload, salt, expires);

            /** generate a new access token */
            const { token: refreshedToken, error: refreshedError } = await refreshAccessToken(validRefresh);

            /** Check the function ran as expected */
            expect(refreshedToken).toBeDefined();
            expect(refreshedError).not.toBeDefined();

            expect(refreshedToken).toBeTypeOf('string');
            expect(refreshedToken).toEqual(expectedToken);

        });

        it('should return an error if the refresh token is null', async () => {

            config.auth.refresh.secret = 'saltyRefreshSecret';

            /** generate a new access token */
            const { token: refreshedToken, error: refreshedError } = await refreshAccessToken(undefined);

            /** Check the function ran as expected */
            expect(refreshedToken).not.toBeDefined();
            expect(refreshedError).toBeDefined();

            expect(refreshedError).toBeTypeOf('string');
            expect(refreshedError).toEqual("You must pass in a valid refresh token");

        });

        it('should return an error if the refresh token has expired', async () => {

            config.auth.refresh.secret = 'saltyRefreshSecret';

            /** Generate a new expired refresh token */
            const {token: refreshToken, error: refreshError} = await encodeToken({ id: 1, username: "testUser1", roles: ["user"] }, "saltyRefreshSecret", "-7d");

            /** generate a new access token */
            const { token: refreshedToken, error: refreshedError } = await refreshAccessToken(refreshToken);

            /** Check the function ran as expected */
            expect(refreshedToken).not.toBeDefined();
            expect(refreshedError).toBeDefined();

            expect(refreshedError).toBeTypeOf('string');
            expect(refreshedError).toEqual("jwt expired");

        });

        it('should return an error if the refresh token is malformed', async () => {

            /** Generate a new expired refresh token */
            const {token: refreshToken, error: refreshError} = await encodeToken({ id: 1, username: "testUser1", roles: ["user"] }, "saltyRefreshSecret", "7d");

            /** generate a new access token */
            const { token: refreshedToken, error: refreshedError } = await refreshAccessToken("Bearer " + refreshToken);

            /** Check the function ran as expected */
            expect(refreshedToken).not.toBeDefined();
            expect(refreshedError).toBeDefined();

            expect(refreshedError).toBeTypeOf('string');
            expect(refreshedError).toEqual("invalid token");

        });

        it('should return an error if the refresh tokens signature does not match', async () => {

            config.auth.refresh.secret = "saltyRefreshSecret";

            /** Generate a new expired refresh token */
            const {token: refreshToken, error: refreshError} = await encodeToken({ id: 1, username: "testUser1", roles: ["user"] }, "saltyRefrshSecret", "7d");

            /** generate a new access token */
            const { token: refreshedToken, error: refreshedError } = await refreshAccessToken(refreshToken);

            /** Check the function ran as expected */
            expect(refreshedToken).not.toBeDefined();
            expect(refreshedError).toBeDefined();

            expect(refreshedError).toBeTypeOf('string');
            expect(refreshedError).toEqual("invalid signature");

        });

    });

});