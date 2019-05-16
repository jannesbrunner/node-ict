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

module.exports = sequelize;
