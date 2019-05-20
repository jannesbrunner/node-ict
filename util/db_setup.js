const db = require('./database');

exports.connect = new Promise( (resolve, reject) => {
    db.sequelize
    .authenticate()
    .then(() => {
      /*eslint no-console: "error"*/  
      console.log('Database Connection has been established successfully.');
      resolve(true)
    })
    .catch(err => {
      /*eslint no-console: "error"*/
      console.error('Unable to connect to the database:', err);
      reject(false)
    });
})






exports.sync = new Promise( (resolve, reject) => {
    db.User.sync().then((result) => {
        console.log(result);
        resolve(result)
    
    }).catch((err) => {
        console.err(err);
        reject(err);
    });
}) 
    

