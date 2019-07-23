/**
 * This will handle all teacher related routes "/teacher"
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
const brainstormingController = require('../controllers/brainstorming');
const quizzingController = require('../controllers/quizzing');
const isAuth = require('../middleware/is-auth');
const hasSettings = require('../middleware/has-settings');

router.get('/', hasSettings, isAuth, teacherController.getMain);
// New App init
router.get('/new', teacherController.getNew);
router.post('/new', teacherController.postNew);
router.post('/reset', isAuth, teacherController.postReset);
router.post('/shutdown', isAuth, teacherController.postShutdown);
router.post('/wifion', isAuth, teacherController.postEnableWifi);
router.post('/wifioff', isAuth, teacherController.postDisableWifi);
// Create/Signup new user
router.get('/signup', teacherController.getSignup);
router.post('/signup', teacherController.postSignup);
// login teacher
router.get('/login', teacherController.getLogin);
router.post('/login', hasSettings, teacherController.postLogin);
router.post('/logout', teacherController.postLogout);
// Settings
router.get('/settings',isAuth, teacherController.getSettings);
// User Model
router.get('/user-edit/:userId', isAuth, teacherController.getUserEdit);
router.post('/user-edit/:userId', isAuth, teacherController.postUserEdit);
router.post('/user-destroy/:userId', isAuth, teacherController.destroyUser);
// Sessions
router.get('/sessions',isAuth,  sessionController.getSessions);
router.get('/sessions/start/', isAuth, sessionController.getStartSession);
router.post('/sessions/start/:sessionId', isAuth, sessionController.postStartSession);
// Brainstorming
router.get('/sessions/brainstorming/new', isAuth, brainstormingController.getNew)
router.post('/sessions/brainstorming/new', isAuth, brainstormingController.postNew)
router.get('/sessions/brainstorming-edit/:sessionId', isAuth, brainstormingController.getEdit)
router.post('/sessions/brainstorming-edit/:sessionId', isAuth, brainstormingController.postEdit)
router.post('/sessions/brainstorming-destroy/:sessionId', isAuth, brainstormingController.destroySession)
// Quizzing
router.get('/sessions/quizzing/new', isAuth, quizzingController.getNew)
router.post('/sessions/quizzing/new', isAuth, quizzingController.postNew)
router.get('/sessions/quizzing-edit/:sessionId', isAuth, quizzingController.getEdit)
router.post('/sessions/quizzing-edit/:sessionId', isAuth, quizzingController.postEdit)
router.post('/sessions/quizzing-destroy/:sessionId', isAuth, quizzingController.destroySession)
router.get('/sessions/quizzing-addquestion/:sessionId', isAuth, quizzingController.getNewQuizzingQuestion)
router.post('/sessions/quizzing-addquestion/:sessionId', isAuth, quizzingController.postNewQuizzingQuestion)
router.get('/sessions/quizzing-editquestion/:sessionId/:questionId', isAuth, quizzingController.getEditQuestion)
router.post('/sessions/quizzing-editquestion/:sessionId/:questionId', isAuth, quizzingController.postEditQuestion)
router.post('/sessions/quizzing-destroyquestion/:sessionId/:questionId', isAuth, quizzingController.postDestroyQuestion)
module.exports = router;

