import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";
import argon2 from 'argon2';

import config from '../config/config.js';
import service from '../service/auth/auth.service.js';
import app from '../app.js';
import db, { User } from '@/db/database.js';

describe('AUTH Routes', () => {

    describe('/auth/login', () => {

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

        it('should return status 200, an access token and set the refresh cookie', async () => {

                /** Set the payload to send */
                const payload = {
                    username: "testUser1",
                    password: "testUser1"
                };

                /** Execute the request */
                const res = await request(app)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(payload);

                /** Check everything is as expected */
                expect(res.statusCode).toBe(200);
                expect(res.headers['content-type']).toMatch(/json/);

                expect(res.body).toBeDefined();
                expect(res.body).toHaveProperty('token');
                expect(res.body.token).toBeTypeOf('string');

                expect(res.headers['set-cookie'][0]).toBeDefined();
                expect(res.headers['set-cookie'][0]).toContain("refreshToken=");
                expect(res.headers['set-cookie'][0]).toContain("HttpOnly");

        });

        it('should return status 404 if username is missing or invalid', async () => {

                /** Set the payload to send */
                const payload = {
                    password: "supersecure"
                };

                /** Execute the request */
                const res = await request(app)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(payload);

                /** Check everything is as expected */
                expect(res.statusCode).toBe(404);
                expect(res.headers['content-type']).toMatch(/json/);

                expect(res.body).toBeDefined();
                expect(res.body).toHaveProperty('message');
                expect(res.body.message).toBeTypeOf('string');
                expect(res.body.message).toEqual("Validation failure. Username is missing or invalid.");

        });

        it('should return status 404 if password is missing or invalid', async () => {

            /** Set the payload to send */
                const payload = {
                    username: "testUser1"
                };

                /** Execute the request */
                const res = await request(app)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(payload);

                /** Check everything is as expected */
                expect(res.statusCode).toBe(404);
                expect(res.headers['content-type']).toMatch(/json/);

                expect(res.body).toBeDefined();
                expect(res.body).toHaveProperty('message');
                expect(res.body.message).toBeTypeOf('string');
                expect(res.body.message).toEqual("Validation failure. Password is missing or invalid.");

        });

        it('should return status 500 if password is missing or invalid', async () => {

            /** Spy on the service and throw a mock error */
            vi.spyOn(service, 'login').mockRejectedValue(() => { new Error("Undefined error.") });

            /** Set the payload to send */
            const payload = {
                password: "supersecretpassword",
                username: "testUser1"
            };

            /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/login')
            .set('Content-Type', 'application/json')
            .send(payload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(500);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBeTypeOf('string');
            expect(res.body.message).toEqual("Internal server error. Please try again later.");

        });

    });

    describe('/auth/registration', () => {

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

        it('should return status 200, an access token and the user details registered (minus password)', async () => {

           /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": "testUser13",
            "displayName": "Test User 13",
            "email": "testuser13@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();

            expect(res.body).toHaveProperty('user');

            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user.id).toBeTypeOf("number");

            expect(res.body.user).toHaveProperty("username");
            expect(res.body.user.username).toBeTypeOf("string");

            expect(res.body.user).toHaveProperty("email");
            expect(res.body.user.email).toBeTypeOf("string");

            expect(res.body.user).toHaveProperty("displayName");
            expect(res.body.user.displayName).toBeTypeOf("string");

            expect(res.body.user).toHaveProperty("roles");
            expect(res.body.user.roles).toBeTypeOf("string");

            expect(res.body.user).toHaveProperty("status");
            expect(res.body.user.status).toBeTypeOf("string");

            expect(res.body).toHaveProperty("token");
            expect(res.body.token).toBeTypeOf("string");

            expect(res.headers['set-cookie'][0]).toBeDefined();
            expect(res.headers['set-cookie'][0]).toContain("refreshToken=");
            expect(res.headers['set-cookie'][0]).toContain("HttpOnly");

        });

        it('should return 404 if the required property username is missing or incorrect', async () => {

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": undefined,
            "password": "testUser13",
            "displayName": "Test User 13",
            "email": "testuser13@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Validation failure. Username is missing or incorrect");

        });

        it('should return 404 if the required property password is missing or incorrect', async () => {

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": undefined,
            "displayName": "Test User 13",
            "email": "testuser13@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Validation failure. Password is missing or incorrect");

        });

        it('should return 404 if the required property displayname is missing or incorrect', async () => {

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": "testUser13",
            "displayName": undefined,
            "email": "testuser13@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Validation failure. Display Name is missing or incorrect");

        });

        it('should return 404 if the required property email is missing or incorrect', async () => {

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": "testUser13",
            "displayName": "Test User 13",
            "email": undefined
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Validation failure. Email is missing or incorrect");

        });

        it('should return 409 if then required property email is missing or incorrect', async () => {

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": "testUser13",
            "displayName": "Test User 13",
            "email": "testuser1@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(409);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Email address is already in use");

        });

        it('should return 500 for any other issue', async () => {

            /** Simulate database connection failure */
            vi.spyOn(User, 'create').mockRejectedValue(() => {
                return new Error("Database connection failure");
            })

            /** Set up the payload that needs to be sent */
           const bodyPayload = {
            "username": "testUser13",
            "password": "testUser13",
            "displayName": "Test User 13",
            "email": "testuser13@test.co.uk"
           };

           /** Execute the request */
            const res = await request(app)
            .post('/api/v1/auth/registration')
            .set('Content-Type', 'application/json')
            .send(bodyPayload);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(500);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual("Internal Server Issue. Please try again later.");

        });

    });

});