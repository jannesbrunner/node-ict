/**
 * Session Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

// the model

class eduSession extends Sequelize.Model {
  
    get name() {
        return this.getDataValue('name');
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
           isActive: {
             type: DataTypes.BOOLEAN,
             allowNull: false,
             defaultValue: false,
           },
           type: {
             type: DataTypes.STRING,
             allowNull: false,
             validate: {
              isIn: [['brainstorming', 'quizzing']]
             }
           }, 
           sessionJSON: {
             type: DataTypes.JSON,
             allowNull: true,
             defaultValue: null,
           },
           
           
        },
        { sequelize }
      );
      
    }
  }


module.exports = eduSession;



