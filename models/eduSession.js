/**
 * Session Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */
const db = require('../util/database');
const User = require('../models/user');
const Student = require('../models/student');
const Brainstorming = require('../models/brainstorming');
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
        throw new Error(`DB Save Brainstormsession Error: " + error: ${error}`);
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
    throw new Error("DB Get Brainstormsession: " + error);
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
      throw new Error("DB Destroy Brainstormsession: " + error);
    }
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
            // TODO if type = quiz;
            

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
            lecture = await Brainstorming.get({eduSessionId: session.dataValues.id})
            }
            if (session.type == "quizzing") {
                // TODO: implement get quiz
            }
            const students = await Student.getStudentsForSession(session.id);
            const constructedSession = { ...session.dataValues, owner, lecture, students }
            
            return constructedSession;
    } catch (error) {
        throw new Error(error)
    }
}






  
