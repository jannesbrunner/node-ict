/**
 * Session Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */
const db = require('../util/database');
const User = require('../models/user');
const Student = require('../models/student');
const logger = require("winston");

// Model
exports.getSessionById = async (sessionId) => {
    try {
        const session = await db.EduSession.findByPk(sessionId);

        return constructSession(session);

    } catch (error) {
        throw new Error(`DB get Session by Id error: ${error}`);
    }
}


exports.getSessionsByUserId = async (currentUserId) => {
    const userSessions = await db.EduSession.findAll({where: { userId: currentUserId }});

    return constructSessions(userSessions);
}

exports.getAllSessions = async () => {
    const allSessions = await db.EduSession.findAll();
    return constructSessions(allSessions);
}

exports.getActiveSessions = async(running = false) =>{
    try {
        const activeSessions = await db.EduSession.findAll({where: {isActive: true, isRunning: running}});
        if(activeSessions) {
            return activeSessions
        }
            return null;
    } catch (error) {
        throw new Error("DB Find Active Sessions: " + error);
    }
}

exports.getActiveSession = async (userId) => {
    try {
        const activeSession = await db.EduSession.findOne({where: {isActive: true, userId: userId}});
        if(activeSession) {
            return constructSession(activeSession);
        }
            return null;
    } catch (error) {
        throw new Error("DB Find Active Session: " + error);
    }
}

exports.setActiveSession = async (sessionId, userId) => {
    try {
        const activeSession = await db.EduSession.findOne({where: {isActive: true, userId: userId}});
        // Found no active session for this user, so we can set one
        if(!activeSession) {
            const newActiveSession = await db.EduSession.findByPk(sessionId);
            newActiveSession.isActive = true;
            await newActiveSession.save();
        } else { 
            throw new Error("DB Set Active Session: There is already an active session!");
        }
    } catch (error) {
        throw new Error("DB Set Active Session: " + error);
    }
}

exports.unsetActiveSession = async (userId) => {
    try {
        const activeSession = await db.EduSession.findOne({where: {isActive: true, userId: userId}});
        // Found active session for the user, so we can unset it
        if(activeSession) {
            
            activeSession.isActive = false;
            await activeSession.save();
            return true
        } else {  
            logger.log("info", `No active edu Session for user with ID ${userId} . Skip.`)
            return true
        }
    } catch (error) {
        throw new Error("DB Set Active Session: " + error);
    }
}

exports.saveActiveSession = async (updatedSession) => {
    try {
        const activeSession = await db.EduSession.findOne({where: {isActive: true, userId: updatedSession.userId}});
        if(activeSession) {
            activeSession.isActive = updatedSession.isActive;
            activeSession.isRunning = updatedSession.isRunning;
            activeSession.sessionJSON = updatedSession.sessionJSON;
            if( activeSession.type == "brainstorming") {
                const associatedLecture = await db.Brainstorming.findOne({where: {eduSessionId: activeSession.id}});
                associatedLecture.brainstormingJSON = updatedSession.lecture.brainstormingJSON;
                await associatedLecture.save();
            }
            if( activeSession.type == "quizzing") {
                const associatedLecture = await db.Quizzing.findOne({where: {eduSessionId: activeSession.id}});
                associatedLecture.quizzingJSON = updatedSession.lecture.quizzingJSON;
                await associatedLecture.save();
            }
            

            await activeSession.save();
            return true;
        }
    } catch (error) {
        logger.log("error", `Error while trying to save active session with id ${updatedSession.id}! > ${error}`);
        return false;
    }
}

// helpers

async function constructSessions(foundSessions) {
    const constructSessions = [];
    for( let session of foundSessions) {
        try {
            constructSessions.push(await constructSession(session))
        } catch (error) {
            throw new Error(error)
        }
    }
    return constructSessions;
}

async function constructSession(session) {
    try {
        const owner = await User.getUser({id: session.dataValues.userId})
        let lecture
            if (session.type == "brainstorming") {
                lecture = await db.Brainstorming.findOne({where: {eduSessionId: session.dataValues.id}});
                lecture = lecture.dataValues;
            }
            if (session.type == "quizzing") {
                lecture = await db.Quizzing.findOne({where: {eduSessionId: session.dataValues.id}});
                let questions = await db.QuizzingQuestion.findAll({where: {quizzingId: lecture.id}})
                lecture = lecture.dataValues;
                lecture.questions = questions;
            }
            const students = await Student.getStudentsForSession(session.id);
            const constructedSession = { ...session.dataValues, owner, lecture, students }
            
            return constructedSession;
    } catch (error) {
        throw new Error(error)
    }
}


// BRAINSTORMING CRUD

exports.saveBrainstormsession = async (session) => {
    try {
        // Got Id, so update existing one
        if (session.id) {
            const foundSession = await db.EduSession.findByPk(session.id)

            foundSession.name = session.name;
            

            const associatedBrainstorming = await db.Brainstorming.findOne({ where: { eduSessionId: session.id } });

            associatedBrainstorming.topic = session.topic;

            await foundSession.save();
            await associatedBrainstorming.save();

            return true;
            // No id, create new session
        } else {
            if (!session.name || !session.topic || !session.ownerId) {
                throw new Error("Please provide a valid brainstormsession object {name, topic, ownerId}");
            } else {
                const currentUser = await db.User.findByPk(session.ownerId);
                const newSession = await db.EduSession.create(
                    {
                        name: session.name,
                        isActive: false,
                        type: "brainstorming",
                    }
                );

                await newSession.setUser(currentUser);
                const newBrainstorming = await db.Brainstorming.create(
                    {
                        topic: session.topic
                    }
                );
                await newBrainstorming.setEduSession(newSession);
            }

        }
    }

    catch (error) {
        throw new Error(`DB Save Brainstormsession Error: ${error}`);
    }
}

exports.getBrainstormsession = async (bsId) => {
  try {
      if(!bsId) {
          throw new Error("bsId is undefined!");
      }
      const foundBbss = await db.EduSession.findByPk(bsId);
      return await constructSession(foundBbss);
  } catch (error) {
    throw new Error("DB Get Brainstormsession error: " + error);
  }
}

exports.destroyBrainstormsession = async (bsId) => {
    try {
        if(!bsId) {
            throw new Error("bsId is undefined!");
        }
        
        const foundBbss = await db.EduSession.findByPk(bsId);
        return await foundBbss.destroy({ force: true });
    } catch (error) {
      throw new Error("DB Destroy Brainstormsession error: " + error);
    }
}

// QUIZZING CRUD

exports.saveQuizzingsession = async (session, json = null) => {
    try {
        // Got Id, so update existing one
        if (session.id) {
            const foundSession = await db.EduSession.findByPk(session.id)

            foundSession.name = session.name;

            

            const associatedQuizzing = await db.Quizzing.findOne({ where: { eduSessionId: session.id } });


            associatedQuizzing.topic = session.topic;
            if( json ) { // if updated quizzing JSON is provided:
                associatedQuizzing.quizzingJSON = json;
            }  

            await foundSession.save();
            await associatedQuizzing.save();

            return true;
            // No id, create new session
        } else {
            if (!session.name || !session.topic || !session.ownerId) {
                throw new Error("Please provide a valid quizzingsession object {name, topic, ownerId}");
            } else {
                const currentUser = await db.User.findByPk(session.ownerId);
                const newSession = await db.EduSession.create(
                    {
                        name: session.name,
                        isActive: false,
                        type: "quizzing",
                    }
                );

                await newSession.setUser(currentUser);
                const newQuizzing = await db.Quizzing.create(
                    {
                        topic: session.topic,
                    }
                );
                await newQuizzing.setEduSession(newSession);
            }

        }
    }

    catch (error) {
        throw new Error(`DB Save Quizzing Error: ${error}`);
    }
}

exports.getQuizzingsession = async (qsId) => {
  try {
      if(!qsId) {
          throw new Error("qsId is undefined!");
      }
      const foundqzs = await db.EduSession.findByPk(qsId);
      return await constructSession(foundqzs);
  } catch (error) {
    throw new Error("DB Get Quizzing: " + error);
  }
}

exports.destroyQuizzingsession = async (qsId) => {
    try {
        if(!qsId) {
            throw new Error("qsId is undefined!");
        }
        
        const foundQzs = await db.EduSession.findByPk(foundQzs);
        return await foundQzs.destroy({ force: true });
    } catch (error) {
      throw new Error("DB Destroy Quizzingsession: " + error);
    }
}

// QUIZZING QUESTION CRUD
exports.addQuizzingQuestion = async (qsId, question) => {
    try {
        if(!qsId || !question) {
            throw new Error("qsId or question is undefined!");
        }
        const foundQzs = await db.Quizzing.findOne({where: {eduSessionId: qsId}})
        if(!question.question || !question.answer1 || !question.answer2 || !question.answer3 || !question.answer4 || !question.validAnswer) {
            throw new Error("Question object is not valid!");
        } 
        const newQuestion = await db.QuizzingQuestion.create({
            question: question.question,
            answer1: question.answer1,
            answer2: question.answer2,
            answer3: question.answer3,
            answer4: question.answer4,
            validAnswer: question.validAnswer,
        });
        
        await newQuestion.setQuizzing(foundQzs);

        return newQuestion


    } catch (error) {
        throw new Error(error)
    }
}

exports.editQuizzingQuestion = async(questionId, question) =>{
    try {
        if(!questionId || !questionId) {
            throw new Error("questionId or question object is undefined!");
        } 

        const questionToSave = await db.QuizzingQuestion.findByPk(questionId);
        questionToSave.question = question.question;
        questionToSave.answer1 = question.answer1;
        questionToSave.answer2 = question.answer2;
        questionToSave.answer3 = question.answer3;
        questionToSave.answer4 = question.answer4;
        questionToSave.validAnswer = question.validAnswer;
        await questionToSave.save();

    } catch (error) {
        throw new Error(error)
    }
}

exports.getQuizzingQuestion = async(qsId, qId) => {
    try {
        if(qsId && qId) {
            const quizzingQuestion = db.QuizzingQuestion.findOne({where: {quizzingId: qsId, id: qId}})
            return quizzingQuestion;
        } else {
            throw new Error("Can't get Quiz Question without Quizsession and Question Id provided!");
        }
        

    } catch (error) {
        throw error;
    }
}

exports.getQuizzingQuestionsForQuizzing = async(qsId) => {
    try {
        if(qsId) {
            const quizzing = await db.Quizzing.findOne({where: {eduSessionId: qsId}})
            const quizzingQuestions = db.QuizzingQuestion.findAll({where: {quizzingId: quizzing.id}})
            return quizzingQuestions;
        } else {
            throw new Error("Can't get Quiz Questions without Quizzing Id provided!");
        }
        

    } catch (error) {
        throw error;
    }
}

exports.destroyQuizzingQuestion = async(questionId) => {
    try {
        if(questionId) {
            const questionToDestroy = await db.QuizzingQuestion.findByPk(questionId);
            return await questionToDestroy.destroy({ force: true });
        } else {
            throw new Error("DB Destroy Quiz Session: Id must be provided!");
        }
    } catch (error) {
        throw error;
    }
}










  
