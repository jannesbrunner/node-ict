/**
 * This will handle all teacher related routes
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Node Imports 

// 3rd Party Imports
const express = require('express');
const router = express.Router();
// App Imports
const teacherController = require('../controllers/teacher');

router.get('/', teacherController.getMain);
router.get('/sessions', teacherController.getSessions);
router.get('/settings', teacherController.getSettings);
module.exports = router;

