/**
 * Brainstorm Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const EduSession = require('../models/eduSession')
const logger = require('winston');

 // GET => /teacher/sessions/quizzing/new 
 exports.getNew = (req, res, next) => {
   
        res.render('teacher/edusessions/quizzing/new', 
        {
            docTitle: "Neue Quizsession | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
        });
}

// POST => /teacher/sessions/quizzing/new
exports.postNew = async (req, res) => {
    try {
        await EduSession.saveQuizzingsession({
            name: req.body.name,
            topic: req.body.topic,
            ownerId: req.session.user.id
        });
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
    return res.redirect('/teacher/sessions');
   
}

// GET => /teacher/sessions/quizzing-edit/:id
exports.getEdit = async (req, res) => {
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    'error': `Sie sind nicht berechtigt diese Session anzuzeigen!`,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    
    try {
        const sessionToEdit = await EduSession.getQuizzingsession(req.params.sessionId);
        const questions = await EduSession.getQuizzingQuestionsForQuizzing(req.params.sessionId);
        return res.render('teacher/edusessions/quizzing/edit', 
        {
            docTitle: "Quiz Session Bearbeiten | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
            session: sessionToEdit,
            questions: questions,
        });
        
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
   
}

// POST => /teacher/sessions/quizzing-edit/:id
exports.postEdit = async (req, res, next) => {

    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Session zu ändern!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }


    const sessionToSave = { id: parseInt(req.params.sessionId) }
    


    req.body.name ? sessionToSave.name = req.body.name : logger.log('debug', 'No updated Name found');
    req.body.topic ? sessionToSave.topic = req.body.topic : logger.log('debug','No updated topic found');

    // TODO List all quiz questions, save them if altered

    try {
        await EduSession.saveQuizzingsession(sessionToSave);
    } catch (error) {
        return res.render('error', { error: error })
    }
    // 



   return res.redirect(`/teacher/sessions/quizzing-edit/${req.params.sessionId}`);
}

// POST => /teacher/sessions/quizzing-destroy/:id
exports.destroySession = async (req, res, next) => {
    
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Session zu löschen!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
        EduSession.destroyQuizzingsession(req.params.sessionId);
        
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    return res.redirect(`/teacher/sessions`);
}

// GET => /teacher/sessions/quizzing-addquestion/:sessionId
exports.getNewQuizzingQuestion = async (req, res, next) => {
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt dieser Quiz Session Fragen hinzuzufügen!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
        const sessionToEdit = await EduSession.getQuizzingsession(req.params.sessionId) 
        return res.render('teacher/edusessions/quizzing/new-question', 
        {
            docTitle: "Neue Quiz Frage | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
            session: sessionToEdit
        });
    } catch (error) {
        return res.render('error', { error: error })
    }
    

}

// POST => /teacher/sessions/quizzing-addquestion/:sessionId
exports.postNewQuizzingQuestion = async (req, res, next) => {
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt dieser Quiz Session Fragen hinzuzufügen!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
       const questionToSave = { 
           question: req.body.question,
           answer1: req.body.answer1,
           answer2: req.body.answer2,
           answer3: req.body.answer3,
           answer4: req.body.answer4,
           validAnswer: req.body.validAnswer
       } 
       await EduSession.addQuizzingQuestion(req.params.sessionId, questionToSave )
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    return res.redirect(`/teacher/sessions/quizzing-edit/${req.params.sessionId}`)
}

// GET => /sessions/quizzing-editquestion/:sessionId/:questionId
exports.getEditQuestion = async (req, res) => {
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    'error': `Sie sind nicht berechtigt diese Quiz Frage anzuzeigen!`,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    
    try {
        const session = await EduSession.getQuizzingsession(req.params.sessionId);
        const questionToEdit = await EduSession.getQuizzingQuestion(req.params.sessionId, req.params.questionId)
        return res.render('teacher/edusessions/quizzing/edit-question', 
        {
            docTitle: "Quiz Frage bearbeiten | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
            session: session,
            question: questionToEdit
        });
        
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
   
}
// POST => /sessions/quizzing-editquestion/:sessionId/:questionId
exports.postEditQuestion = async (req, res, next) => {
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Quiz Frage zu bearbeiten!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
       const questionToSave = { 
           question: req.body.question,
           answer1: req.body.answer1,
           answer2: req.body.answer2,
           answer3: req.body.answer3,
           answer4: req.body.answer4,
           validAnswer: req.body.validAnswer
       } 
       await EduSession.editQuizzingQuestion(req.params.questionId, questionToSave);
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    return res.redirect(`/teacher/sessions/quizzing-edit/${req.params.sessionId}`)
}

// POST => /sessions/quizzing-destroyquestion/:sessionId/:questionId
exports.postDestroyQuestion = async (req, res, next) => {
    
    // permissions
    try {
        const currentSession = await EduSession.getQuizzingsession(req.params.sessionId)
        const sessionsUserId = currentSession.userId
        if(req.session.user.id != sessionsUserId) {
            if(!req.session.user.isSuperAdmin) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': `Sie sind nicht berechtigt diese Quiz Frage zu löschen!`,
                    isLoggedIn: req.session.isLoggedIn,
                    loggedUser: req.session.user,
                    backLink: `teacher/sessions/quizzing-edit/${req.params.sessionId}`,
                })
            }
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

    try {
        EduSession.destroyQuizzingQuestion(req.params.questionId);
        
    } catch (error) {
        return res.render('error', { error: error })
    }
    
    return res.redirect(`/teacher/sessions/quizzing-edit/${req.params.sessionId}`);
}
