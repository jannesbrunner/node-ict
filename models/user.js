/**
 * User Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const Sequelize = require('sequelize');
const database = require('./../util/database');

// the model

class User extends Sequelize.Model {
    constructor(...args) {
        super(...args);
      }
    get name() {
        return this.getDataValue('name');
    }
    set name(val) {
        this.setDataValue('name', val);
    }
}

const attributes = {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
    }
}

const options = {};

User.init(attributes, { ...options,database });

database.User = User.init(attributes, { ...options,database });



module.exports = database.User;



