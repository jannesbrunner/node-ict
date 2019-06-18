const db = require('./database');
const logger = require('winston');


exports.connect = async () => {
  try {
    db.sequelize.authenticate();
    logger.log('debug', 'Database Connection has been established successfully.');
    return true;
  } catch (err) {
    logger.log('error', `Unable to connect to the database: ${err}`);
    return err;
  }
}

async function syncDB( options = {} ) {
  try {
    
    logger.log('debug', `Sync Databse with Option(s): ${JSON.stringify(options)}`);
    db.sequelize.sync(options);
    // await db.User.sync();  
    // await db.Settings.sync();
  } catch (error) {
    logger.log('error', `DB Sync Error: ${error}`);
    throw new Error(`DB Sync Error: ${error}`);
  }
}
exports.sync = () => syncDB();

exports.forceSync = () => syncDB({ force: true });

