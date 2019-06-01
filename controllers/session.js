/**
 * Learn Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const EduSession = require('../models/eduSession');

// GET => /teacher/sessions
exports.getSessions = async (req, res, next) => {

    try {
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




