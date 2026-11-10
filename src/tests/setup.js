import { beforeAll, afterAll, afterEach } from 'vitest';
import db, { User } from '@/db/database.js';

import argon2 from 'argon2';

export const setupTestDB = async () => {

    beforeAll(async () => {

        db.sync()
        .then(async () => {

            /** Seed the tables if needed */
            console.log('Seeding database tables');

            await User.create({
                email: "testuser1@test.co.uk",
                username: "testUser1",
                password: await argon2.hash("testUser1"),
                displayName: "Test User 1",
                status: "active",
                roles: "user"
            });

        })
        .catch((err) => {
            console.log('=== DEBUG ===');
            console.log("setupTestDB > beforeAll > Catch Error");
            console.log(err.message);
            console.log('=== DEBUG ===');
        });

    });

    beforeEach(async () => {

        

    });

    afterEach(async () => {
       
    });

    afterAll(async () => {
        await db.close();
    });

};

setupTestDB();