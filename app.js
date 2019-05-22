/**
 * Node interactive course teaching
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Node Imports 
const path = require('path');
// 3rd Party Imports
const express = require('express');
const bodyParser = require('body-parser')
const opn = require('opn');
const session = require('express-session');
// App Imports //
const errorController = require('./controllers/error');
const mainRoutes = require('./routes/main');
const teacherRoutes = require('./routes/teacher');
const clientRoutes = require('./routes/client');
const database = require('./util/database');
const dbSetup = require('./util/db_setup');
// ------------------------------------------------ //
const app = express();

const server = app.listen(3000);
// Set static content folder
app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// configure sessions
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
  db: database.sequelize
})

app.use(session({
  secret: 'my secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
}))

app.get('/error', errorController.getError)
app.use('/teacher', teacherRoutes);
app.use('/client', clientRoutes);
app.use('/', mainRoutes);

// dbSetup.forceSync.then( res => console.log(res)).catch( err => console.log(err));

app.use(errorController.get404);

async function init() {
  try {
    await sessionStore.sync();
    await dbSetup.connect();
    await dbSetup.sync();

  } catch (error) {
    console.log(err, "App init error");
    server.close();
  }
}


process.on('uncaughtException', (err) => {
  console.log(err);
  //errorController.setError(err);
  // opn('http://localhost:3000/error');
  server.close();
})

init();
