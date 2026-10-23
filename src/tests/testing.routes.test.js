import request, { agent } from "supertest";
import { vi, describe, it, expect, beforeEach, afterEach, assert } from "vitest";

import config from '../config/config.js';
import app from '../app.js';

describe('/api/v1/tests', () => {

    beforeEach(() => {});
    afterEach(() => {});

    it('should return 200 and a list of test data', async () => {

        const res = await request(app)
        .get('/api/v1/tests');

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('data');
        
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(3);
        expect(res.body.data).toEqual(['Test Data 1', 'test Data 2', 'Test data 3']);

    });

})

describe('/api/v1/tests/:id', () => {

    beforeEach(() => {});
    afterEach(() => {});

    it('should return 200 and the desired record', async () => {

        /** Set the ID of the record we wish to get */
        const id = 2;

        /** Execute the request */
        const res = await request(app)
        .get(`/api/v1/tests/${id}`);

        /** Check what is returned is as expected */
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data).toEqual(['Test Data 2']);

    });

    it('should return 404 if ID is missing or incorrect', async () => {

        /** Set the ID of the record we wish to get */
        const id = 9;

        /** Execute the request */
        const res = await request(app)
        .get(`/api/v1/tests/${id}`);

        /** Check what is returned is as expected */
        expect(res.statusCode).toBe(404);
        expect(res.headers['content-type']).toMatch(/json/);

        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toBeTypeOf('string');
        expect(res.body.message).toEqual("Validation failure. ID is missing or invalid.");

    });

})