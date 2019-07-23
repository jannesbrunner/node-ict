/**
 * Sequelize Node ICT Table Configuration
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

 // User aka Teachers
exports.user = (sequelize, Sequelize) => {
    return sequelize.define('user', {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              allowNull: false,
              primaryKey: true
              },
             name: {  
                 type: Sequelize.STRING,
                 allowNull: false
             },
             email: {
               type: Sequelize.STRING,
               allowNull: false
             }, 
             password: {
              type: Sequelize.STRING,
              allowNull: false
             },
             isSuperAdmin: { 
               type: Sequelize.BOOLEAN,
               allowNull: false,
               defaultValue: false,
             },
             canLogIn: {
               type: Sequelize.BOOLEAN,
               allowNull: false,
               defaultValue: false,
             } 
  }) };
  


 // App settings
exports.settings = (sequelize, Sequelize) => {
    return sequelize.define('setting', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      isSetup: {
        type: Sequelize.BOOLEAN
      },
      superAdmin: {
        type: Sequelize.STRING
      }
    }
    )
  };

   // Students
  exports.student = (sequelize, Sequelize) => {
    return sequelize.define('student', {
  
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
    })
  };

  // An interactive learning session
  exports.eduSession = (sequelize, Sequelize) => {
    return sequelize.define('eduSession', {
  
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isRunning: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['brainstorming', 'quizzing']]
        }
      },
    })
  };

  
  // An interactive learning session type brainstorming
  exports.brainstorming = (sequelize, Sequelize) => {
    return sequelize.define('brainstorming', {
  
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brainstormingJSON: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      }
    })
  };

  // An interactive learning session type quizzing
  exports.quizzing = (sequelize, Sequelize) => {
    return sequelize.define('quizzing', {
  
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      topic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quizzingJSON: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      }
    })
  };

  // Quiz questions belonging to session type quizzing
  exports.quizzingquestion = (sequelize, Sequelize) => {
    return sequelize.define('quizzingQuestion', {
  
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      question: {
        type: Sequelize.STRING,
        allowNull: false
      },
      answer1: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      answer2: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      answer3: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      answer4: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      validAnswer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
          max: 4
        }
      }
    })
  };

  
