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


