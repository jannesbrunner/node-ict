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

// Models
const UserModel = require("../models/user");
const SettingsModel = require("../models/settings");
const eduSessionModel = require("../models/eduSession");



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

const User = UserModel(sequelize, Sequelize);
const Settings = SettingsModel(sequelize, Sequelize);
const eduSession = eduSessionModel(sequelize, Sequelize);

const models = { 
        User,
        Settings,
        eduSession
}


const db = {
        ...models,
        sequelize
};

module.exports = db;
