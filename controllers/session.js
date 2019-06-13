/**
 * Learn Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const EduSession = require('../models/eduSession');
const ip = require('ip');

// GET => /teacher/sessions
exports.getSessions = async (req, res, next) => {

    try {
        const activeSession = await EduSession.getActiveSession();
        if (activeSession != null) {
            return res.redirect('/teacher/sessions/start');
        }
        let eduSessions;
        if(req.session.user.isSuperAdmin) {
            eduSessions = await EduSession.getAllSessions();
        } else {
            eduSessions = await EduSession.getSessionsById(req.session.user.id);
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
exports.getStartSession = async (req, res, next) => {
    res.render('teacher/edusessions/running', {
        docTitle: "Laufende Session | Node ICT",
        isLoggedIn: req.session.isLoggedIn,
        loggedUser: req.session.user,
        ipAdd: ip.address()
    });
    
}


// POST => /teacher/sessions/start/:sessionId
exports.postStartSession = async (req, res, next) => {
    try {
        await EduSession.setActiveSession(req.params.sessionId);
        return res.redirect('/teacher/sessions/start');
    } catch (error) {
        res.render('error', {error: error});
    }
    
}





