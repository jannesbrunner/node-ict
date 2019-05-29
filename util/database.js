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

const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
              }
})



const User = tables.user(sequelize, Sequelize);
const Settings = tables.settings(sequelize, Sequelize);
const EduSession = tables.eduSession(sequelize, Sequelize);

const db = { sequelize, User, Settings, EduSession }



module.exports = db;
