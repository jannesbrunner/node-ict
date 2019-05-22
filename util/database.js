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


const dbPath = `${path}/data/db.sqlite`;

const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath
})

const User = require("../models/user");
const Settings = require("../models/settings");
const models = {
        User: User.init(sequelize, Sequelize),
        Settings: Settings.init(sequelize, Sequelize)
};

Object.values(models)
        .filter(model => typeof model.associate === "function")
        .forEach(model => model.associate(models));

const db = {
        ...models,
        sequelize
};

module.exports = db;
