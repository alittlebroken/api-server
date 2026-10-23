/**
 * ==== TEST ROUTES ====
 * 
 * Remove when you are ready to add your own routes
 */
import express from 'express';

/** Setup the router we will export */
const route = express.Router();

/**
 * @swagger
 * /api/v1/tests:
 *   get:
 *     summary: Retrieve a list of test data
 *     description: Returns test data. Used to test the basic functionality of the API works ok
 *     responses:
 *       200:
 *         description: A list of test data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Test Data 1
 */
route.get('/', (req, res, next) => {
    res.status(200).json({ data: ['Test Data 1', 'test Data 2', 'Test data 3'] })
});

/**
 * @swagger
 * /api/v1/tests/{id}:
 *   get:
 *     summary: Return a single piece of test data
 *     description: Return one singular test data identified by the passed in id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the piece of test data to return
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single piece of test data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: Test Data 1
 *       404:
 *         description: Validation failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                message:
 *                  type: string
 *                  example: Validation failure. ID is missing or invalid.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
route.get('/:id', (req, res, next) => {

    const testData = ['test Data 1', 'Test Data 2', 'Test Data 3'];

    /** Validation */
    if(!req.params.id || req.params.id === null || req.params.id === undefined || isNaN(parseInt(req.params.id)) || parseInt(req.params.id) > testData?.length){
        return res.status(404).json({ message: "Validation failure. ID is missing or invalid." });
    }

    /** Get the parameters passed in to the path*/
    const id = parseInt(req.params.id) - 1;

    if(id < 0) id = 0;

    res.status(200).json({ data: [testData[id]] });

});

export default route;