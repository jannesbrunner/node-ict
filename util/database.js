/**
 * This will handle the sqlite database
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// App Imports 
const path = require('../util/path')
// 3rd Party Imports
const Sequelize = require('sequelize');

// Tables
const tables = require('../data/tables')



const dbPath = `${path}/data/db.sqlite`;
const dbLog = (log) => {
        console.log(` DB Action: ${log}`);
}


const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
              },
        logging: dbLog, // false

})




const User = tables.user(sequelize, Sequelize);
const Student = tables.student(sequelize, Sequelize);
const Settings = tables.settings(sequelize, Sequelize);
// Edu Data
const EduSession = tables.eduSession(sequelize, Sequelize);
// Brainstorming
const Brainstorming = tables.brainstorming(sequelize, Sequelize);
const BrainstormingAnswer = tables.brainstorming_answer(sequelize, Sequelize);

// Relationships App General
User.hasMany(EduSession, { onDelete: 'cascade' });
EduSession.belongsTo(User);
EduSession.hasMany(Student, { onDelete: 'cascade' });
Student.belongsTo(EduSession);

// Relationship Brainstorming
Brainstorming.belongsTo(EduSession, { onDelete: 'cascade' });
Brainstorming.hasMany(BrainstormingAnswer, { onDelete: 'cascade' });
BrainstormingAnswer.belongsTo(Brainstorming);

const db = { sequelize, User, Student, Settings, EduSession, Brainstorming, BrainstormingAnswer }



module.exports = db;
