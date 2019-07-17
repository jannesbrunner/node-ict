/**
 * This will handle all client related routes
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Node Imports 

// 3rd Party Imports
const express = require('express');
const router = express.Router();
// App Imports
const clientController = require('../controllers/client');
const isAuth = require('../middleware/is-auth');


// Presenter & Student Clients
router.get('/presenter/:sessionId', isAuth, clientController.getPresenter);
router.get('/student', clientController.getStudent);
router.get('/', clientController.getStudent);

module.exports = router;

