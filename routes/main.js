/**
 * This will handle all main "/" related routes
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Node Imports 

// 3rd Party Imports
const express = require('express');
const router = express.Router();
// App Imports
const mainController = require('../controllers/main.js')


router.get('/', mainController.getIndex);


module.exports = router;
