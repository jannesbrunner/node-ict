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
const ip = require('ip');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const ios = require('socket.io-express-session');



// App Imports //
const errorController = require('./controllers/error');
const mainRoutes = require('./routes/main');
const teacherRoutes = require('./routes/teacher');
const clientRoutes = require('./routes/client');
const database = require('./util/database');
const dbSetup = require('./util/db_setup');
const isAuth = require('./middleware/is-auth');
const io = require('./util/socket');
const ioSocketHandler = require('./controllers/ioSocketHandler');
const logger = require('./util/loggerSetup');

// ------------------------------------------------ //
const app = express();

const server_ip = "127.0.0.1" // ip.address();


// Set up Event Emitter 
require('./util/eventEmitter').init();
const server = app.listen(3000, server_ip, function () {
  logger.log({ level: 'info', message: `Hello! The Server is running on ${server_ip}!`});
});




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


// set up socket.io for web sockets
io.init(server);


// configure sessions
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionStore = new SequelizeStore({
  db: database.sequelize
})

const sessionConfig = {
  secret: 'my secret',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
  cookie: { maxAge: 7200000 }, // 2 hours in ms
}

const expressSession = session(sessionConfig);
app.use(expressSession)

// Share session with socket IO
io.getIO().use(
  function (socket, next) {
    expressSession(socket.request, socket.request.res, next);
  }
);


// Start IO SocketHandler (handles incoming socket io connections)
ioSocketHandler();



app.get('/error', errorController.getError)
app.use('/teacher', teacherRoutes);
app.use('/client', clientRoutes);
// protecting teacher client
app.use('/tclient', isAuth);
// Clients
// app.get('/client/student', (req, res) => {
//   res.sendFile(__dirname + '/public/client/student.html');
// });
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
    logger.log("error", "App init error!");
    throw new Error("App init error!");
  }
}



process.on('uncaughtException', (err) => {
 console.log(err);
 logger.log('error', "Fatal App Error: " + err);
  //errorController.setError(err);
  // opn('http://localhost:3000/error');
  server.close();
})

init();


