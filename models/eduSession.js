/**
 * Session Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */



module.exports = (sequelize, type) => {
  return sequelize.define('eduSession', {

    id: {
      type: type.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: type.STRING,
      allowNull: false
    },
    isActive: {
      type: type.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: type.STRING,
      allowNull: false,
      validate: {
        isIn: [['brainstorming', 'quizzing']]
      }
    },
    sessionJSON: {
      type: type.JSON,
      allowNull: true,
      defaultValue: null,
    }
  })
}
