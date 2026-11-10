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

        /**
         * Create the default user
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

    afterAll(async () => {
        await db.close();
    });

};

setupTestDB();