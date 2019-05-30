/**
 * Learn Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const db = require('../util/database');

// GET => /teacher/sessions
exports.getSessions = async (req, res, next) => {
    try {
        const eduSessions = await db.EduSession.findAll();
        console.log(eduSessions, "EDU_SESSIONS")
        res.render('teacher/sessions', 
        {
            docTitle: "Sessions | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            sessions: eduSessions,
        });
    } catch (error) {
        res.render('error', {error: error});
    }
}