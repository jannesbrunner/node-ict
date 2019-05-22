/**
 * Applikation Settings Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const Sequelize = require('sequelize');
const sequelize = require('./../util/database');

// the model

class Settings extends Sequelize.Model {
    get isSetup() {
        return this.getDataValue('isSetup');
    }
    set isSetup(val) {
        this.setDataValue('name', val);
    }
    get superAdmin() {
        return this.getDataValue('superAdmin');
    }
    set superAdmin(val) {
        this.setDataValue('superAdmin', val);
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
           isSetup: {  
               type: DataTypes.BOOLEAN
           },
           superAdmin: {
             type: DataTypes.STRING
           } 
        },
        { sequelize }
      );
      
    }
  }


module.exports = Settings;



