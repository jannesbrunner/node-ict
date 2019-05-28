/**
 * Applikation Settings Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// the model

module.exports = (sequelize, type) => {
  return sequelize.define('setting',
    {
      id: {
        type: type.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      isSetup: {
        type: type.BOOLEAN
      },
      superAdmin: {
        type: type.STRING
      }
    }

  );


}



