/**
 * Learn Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const EduSession = require('../models/eduSession');
const eventEmitter = require('../util/eventEmitter');
const ip = require('ip');


// GET => /teacher/sessions
exports.getSessions = async (req, res) => {

    try {
        // doest the teacher already has a running session? Redirect them
        const activeSession = await EduSession.getActiveSession(req.session.user.id);
        if (activeSession != null) {
            return res.redirect('/teacher/sessions/start');
        }
        let eduSessions;
        // let admin see all and users only there belongings
        if(req.session.user.isSuperAdmin) {
            eduSessions = await EduSession.getAllSessions();
        } else {
            eduSessions = await EduSession.getSessionsByUserId(req.session.user.id);
        }
        
        res.render('teacher/edusessions/index', 
        {
            docTitle: "Sessions | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
            sessions: eduSessions,
        });
    } catch (error) {
        res.render('error', {error: error});
    }
}
// GET => /teacher/sessions/start/
exports.getStartSession = async (req, res) => {
    eventEmitter.get().emit('session_start', req.session.user);
    res.render('teacher/edusessions/running', {
        docTitle: "Laufende Session | Node ICT",
        isLoggedIn: req.session.isLoggedIn,
        loggedUser: req.session.user,
        ipAdd: ip.address()
    });
    
}


// POST => /teacher/sessions/start/:sessionId
exports.postStartSession = async (req, res) => {
    try {
        await EduSession.setActiveSession(req.params.sessionId, req.session.user.id);
        return res.redirect('/teacher/sessions/start');
    } catch (error) {
        res.render('error', {error: error});
    }
    
}





