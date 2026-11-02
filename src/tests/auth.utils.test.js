import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import jwt from 'jsonwebtoken';

import config from '../config/config.js';
import { encodeToken } from "../utils/auth.utils.js";

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


});