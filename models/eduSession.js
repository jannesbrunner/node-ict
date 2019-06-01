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

// Model
exports.getSessionsById = async (currentUserId) => {
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






  
