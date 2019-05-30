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
const sessionController = require('../controllers/session')
const isAuth = require('../middleware/is-auth');
const hasSettings = require('../middleware/has-settings');

router.get('/', hasSettings, isAuth, teacherController.getMain);
router.get('/new', teacherController.getNew);
router.get('/signup', teacherController.getSignup);
router.post('/signup', teacherController.postSignup);
router.post('/new', teacherController.postNew);
router.post('/login', hasSettings, teacherController.postLogin);
router.post('/logout', teacherController.postLogout);
router.get('/login', teacherController.getLogin);
router.get('/sessions',isAuth,  sessionController.getSessions);
router.get('/settings',isAuth, teacherController.getSettings);
router.post('/reset', isAuth, teacherController.postReset);
router.get('/user-edit/:userId', isAuth, teacherController.getUserEdit);
router.post('/user-edit/:userId', isAuth, teacherController.postUserEdit);
router.post('/user-destroy/:userId', isAuth, teacherController.destroyUser);
module.exports = router;

