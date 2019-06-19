const db = require('../util/database');

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


