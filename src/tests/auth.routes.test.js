import request, { agent } from "supertest";
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
import service from '../service/auth/auth.service.js';
import app from '../app.js';

describe('AUTH Routes', () => {

    describe('/auth/login', () => {

        it('should return status 200, an access token and set the refresh cookie', async () => {

                /** Mock the return value for the model functions */
                mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("supersecure"), roles: ["user"], status: "active" });

                /** Set the payload to send */
                const payload = {
                    username: "testUser1",
                    password: "supersecure"
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

                /** Mock the return value for the model functions */
                mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("supersecure"), roles: ["user"], status: "active" });

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

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue({ id: 1, username: "testUser1", password: await argon2.hash("supersecure"), roles: ["user"], status: "active" });


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

            /** Mock the return value for the model functions */
            mockUser.findOne.mockResolvedValue(() => { new Error("Undefined database connection error.") });

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

            console.log(res.text);

            /** Check everything is as expected */
            expect(res.statusCode).toBe(500);
            expect(res.headers['content-type']).toMatch(/json/);

            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toBeTypeOf('string');
            expect(res.body.message).toEqual("Internal server error. Please try again later.");

        });

    });

});