/**
 * Brainstorm Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

 const BsSession = require('../models/brainstorming');
 const EduSession = require('../models/eduSession')
const logger = require('winston');

 // GET => /teacher/sessions/brainstorming/new 
 exports.getNew = (req, res, next) => {
   
        res.render('teacher/edusessions/brainstorming/new', 
        {
            docTitle: "Neue Brainstromsession | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
        });
}

// POST => /teacher/sessions/brainstorming/new
exports.postNew = async (req, res) => {
    try {
        const session = await EduSession.saveBrainstormsession({
            name: req.body.name,
            topic: req.body.topic,
            ownerId: req.session.user.id
        });
        
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
    return res.redirect('/teacher/sessions');
   
}

// GET => /teacher/sessions/brainstorming-edit/:id
exports.getEdit = async (req, res) => {
    // permissions
    try {
        const currentSession = await EduSession.getBrainstormsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    'error': `Sie sind nicht berechtigt diese Session anzuzeigen!`,
                    backLink: `teacher/sessions/brainstorming-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    
    try {
        const sessionToEdit = await EduSession.getBrainstormsession(req.params.sessionId);
        return res.render('teacher/edusessions/brainstorming/edit', 
        {
            docTitle: "Brainstormsession Bearbeiten | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
            session: sessionToEdit
        });
        
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
   
}

// POST => /teacher/sessions/brainstorming-edit/:id
exports.postEdit = async (req, res, next) => {

    // permissions
    try {
        const currentSession = await EduSession.getBrainstormsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Session zu ändern!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/brainstorming-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }


    const sessionToSave = { id: parseInt(req.params.sessionId) }
    


    req.body.name ? sessionToSave.name = req.body.name : logger.log('debug', 'No updated Name found');
    req.body.topic ? sessionToSave.topic = req.body.topic : logger.log('debug','No updated topic found');

    try {
        await EduSession.saveBrainstormsession(sessionToSave);
    } catch (error) {
        return res.render('error', { error: error })
    }
    // 



   return res.redirect(`/teacher/sessions/brainstorming-edit/${req.params.sessionId}`);
}

// POST => /teacher/sessions/brainstorming-destroy/:id
exports.destroySession = async (req, res, next) => {
    
    // permissions
    try {
        const currentSession = await EduSession.getBrainstormsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Session zu löschen!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/brainstorming-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
        EduSession.destroyBrainstormsession(req.params.sessionId);
        
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    return res.redirect(`/teacher/sessions`);
}


