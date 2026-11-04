import express from 'express';

/** Setup the router we will export */
const route = express.Router();

/** Import the controller */
import controller from '../../../../controllers/auth/auth.controller.js';

/**
 * @swagger
 * /api/v1/auth/login
 *   post:
 *     summary: Authentication login
 *     description: Authenticates a user against the system and returns an access token
 *     responses:
 *      200: 
 *       description: Returns an access token for the user
 *       content:
 *         application/json:
 *           schema:
 *            type: string
 *            example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
 *       
 */
route.post('/', controller.login);

export default route;