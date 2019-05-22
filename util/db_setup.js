const db = require('./database');

exports.connect = async () => {
  try {
    db.sequelize.authenticate();
    console.log('Database Connection has been established successfully.');
    return true;
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    return err;
  }
}

async function syncDB( options = {} ) {
  try {
    console.log(`Sync Databse with Option(s): ${JSON.stringify(options)}`)
    db.sequelize.sync(options);
    // await db.User.sync();  
    // await db.Settings.sync();
  } catch (error) {
    return error;
  }
}
exports.sync = () => syncDB();

exports.forceSync = () => syncDB({ force: true });

