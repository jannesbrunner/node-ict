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

  
