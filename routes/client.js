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

router.get('/', clientController.getMain);
router.get('/new', clientController.getNew);
router.post('/new', clientController.postNew);

module.exports = router;

