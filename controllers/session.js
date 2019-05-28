const db = require('../util/database');

exports.getSessions = async (req, res, next) => {
    try {
        const eduSessions = await db.eduSession.findAll();
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
