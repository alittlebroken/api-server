/**
 * @swagger
 * components:
 * 
 *   schemas:
 *   
 *     ResponseBodyUser:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: The users id
 *         username:
 *           type: string
 *           description: The users username
 *         email:
 *           type: string
 *           description: The users email address
 *         displayName:
 *           type: string
 *           description: The display name of the user
 *         roles:
 *           type: string
 *           description: A comma separated list of roles the user belongs to
 *         status:
 *           type: string
 *           description: The users account status
 * 
 *     ResponseBodyError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The text describing the error message
 * 
 *     ResponseBodyToken:
 *       type: string
 *       description: The access token assigned to the user
 * 
 *     RegistrationResponseBody:
 *       type: object
 *       allOf:
 *         - $ref: "#/components/schemas/ResponseBodyUser"
 *         - $ref: "#/components/schemas/ResponseBodyToken"
 */
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
route.post('/login', controller.login);

/**
 * @swagger
 * /api/v1/auth/register
 *   post:
 *     summary: Register a new user
 *     description: Allows the user to register with the API
 *     responses:
 *       200:
 *        description: Returns the registered details ( with id ) and access tokens to allow them to use the API without having to log in again
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/RegistrationResponseBody"
 *            example:
 *              user: { userid: 1, username: "someUser", displayName: "Some User", email: "someuser@somecompany.co.uk", roles: "user", status: "active" }
 *              token: "dfawef7w8efosdfo47fh.gwegq34t2tbnfgnfgsdfaswf4t31qrgfdafgsdfg4.345q345WSGFHSGFHS56RGB!"
 *       404:
 *         description: Validation failure of one of the required properties to register
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseBodyError"
 *             example:
 *               message: "Validation failure: Username is missing or incorrect"
 *       409:
 *         description: Email address already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseBodyError"
 *             example:
 *               message: "Supplied email address is already being used"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ResponseBodyError"
 *             example:
 *               message: "Internal server error: Please try again later"
 */
route.post('/registration', controller.login);

export default route;