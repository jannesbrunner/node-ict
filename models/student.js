/**
 * Student Data Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const db = require('../util/database');
const logger = require("winston");

exports.getStudentsForSession = async (sessionId) => {
    try {
       const foundStudents = await db.Student.findAndCountAll({where: {eduSessionId: sessionId}});
       let result = {
           students: [...foundStudents.rows],
           amount: foundStudents.count
       }
       return result
    } catch (error) {
        throw new Error(error)
    }
}

exports.addStudentToSession = async (sessionId, name) => {
    try {
        const foundSession = await db.EduSession.findByPk(sessionId);
        const newStudent = await db.Student.create({
            name: name,
        });

        await newStudent.setEduSession(foundSession);

        return newStudent;
     } catch (error) {
         throw new Error(error)
     }
}

exports.removeStudentFromSession = async (sessionId, studentId) => {
    try {
        if(sessionId && studentId) {
            logger.log("info", `DB: Try to delete student ${studentId} (ID) from session ${sessionId} (ID)`);
            const student = await db.Student.findOne({where: {id: studentId, eduSessionId: sessionId}});
            if(student) {
                await student.destroy({force: true});
            }
            else {
                throw new Error(`Found no user to delete!`);
            }
           
        }
        return true;
     } catch (error) {
         throw new Error(error)
     }
}

exports.removeStudentsFromSession = async (sessionId) => {
    try {
        if(sessionId) {
            const foundStudents = await db.Student.findAll({where:{eduSessionId: sessionId}});
            if(foundStudents) {
                foundStudents.forEach( (student) => {
                    student.destroy({force: true}).then((result) => {
                        logger.log('verbose', `User destroyed: ${result.id}`)
                    }).catch((err) => {
                        throw new Error("unable to destroy user: " + err);
                    });
                })
                return true;
            } else {
                throw new Error("Could not find users for session id " + sessionId);
            }
        } else {
            throw new Error(`Session Id is not valid: ${sessionId}`)
        }
    } catch (error) {
        throw new Error(`Error removing students from session: ${error}`);
    }
}




