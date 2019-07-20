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
        logging: false, // false

})




const User = tables.user(sequelize, Sequelize);
const Student = tables.student(sequelize, Sequelize);
const Settings = tables.settings(sequelize, Sequelize);
// Edu Data
const EduSession = tables.eduSession(sequelize, Sequelize);
// Brainstorming
const Brainstorming = tables.brainstorming(sequelize, Sequelize);
// Quizzing
const Quizzing = tables.quizzing(sequelize, Sequelize);
const QuizzingQuestion = tables.quizzingquestion(sequelize, Sequelize);

// Relationships App General
User.hasMany(EduSession, { onDelete: 'cascade' });
EduSession.belongsTo(User);
EduSession.hasMany(Student, { onDelete: 'cascade' });
Student.belongsTo(EduSession);

// Relationship Brainstorming
Brainstorming.belongsTo(EduSession, { onDelete: 'cascade' });
// Relationship Quizzing
Quizzing.belongsTo(EduSession, { onDelete: 'cascade'});
Quizzing.hasMany(QuizzingQuestion, { onDelete: 'cascade'});
QuizzingQuestion.belongsTo(Quizzing);

const db = { sequelize, User, Student, Settings, EduSession, Brainstorming, Quizzing, QuizzingQuestion };



module.exports = db;
