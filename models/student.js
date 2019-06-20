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

exports.removeStudentFromSession = async (sessionId, playerId) => {
    try {
        if(sessionId && playerId) {
            logger.log("info", `DB: Try to delete student ${playerId} (ID) from session ${sessionId} (ID)`);
            const student = await db.Student.findOne({where: {id: playerId, eduSessionId: sessionId}});
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




