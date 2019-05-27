/**
 * User Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const Sequelize = require('sequelize');
const sequelize = require('./../util/database');

// the model

class User extends Sequelize.Model {
    get name() {
        return this.getDataValue('name');
    }

    get password() {
        return this.getDataValue('password');
    }
    set name(val) {
        this.setDataValue('name', val);
    }
    static init(sequelize, DataTypes) {
      return super.init(
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
            },
           name: {  
               type: DataTypes.STRING,
               allowNull: false
           },
           email: {
             type: DataTypes.STRING,
             allowNull: false
           }, 
           password: {
            type: DataTypes.STRING,
            allowNull: false
           },
           isSuperAdmin: { 
             type: DataTypes.BOOLEAN,
             allowNull: false,

           } 
        },
        { sequelize }
      );
      
    }
  }


module.exports = User;



