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
const cookieParser = require('cookie-parser');
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
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// parse cookies
app.use(cookieParser())
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
  cookie: {maxAge:600000},
}))

app.get('/error', errorController.getError)
app.use('/teacher', teacherRoutes);
app.use('/client', clientRoutes);
app.use('/', mainRoutes);

// dbSetup.forceSync();

app.use(errorController.get404);

async function init() {
  try {
    await dbSetup.connect();
    await sessionStore.sync();
    await dbSetup.sync();

  } catch (error) {
    server.close();
    throw new Error("App init error!");
  }
}



process.on('uncaughtException', (err) => {
  console.log(err);
  //errorController.setError(err);
  // opn('http://localhost:3000/error');
  server.close();
})

init();
