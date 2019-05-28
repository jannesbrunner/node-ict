/**
 * User Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */


// the model
module.exports = (sequelize, type) => {
    return sequelize.define('user', {
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
           email: {
             type: type.STRING,
             allowNull: false
           }, 
           password: {
            type: type.STRING,
            allowNull: false
           },
           isSuperAdmin: { 
             type: type.BOOLEAN,
             allowNull: false,
             defaultValue: false,
           },
           canLogIn: {
             type: type.BOOLEAN,
             allowNull: false,
             defaultValue: false,
           } 
        },
      );
}
