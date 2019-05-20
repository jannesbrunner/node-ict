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
// App Imports //
const errorController = require('./controllers/error');
const mainRoutes = require('./routes/main');
const teacherRoutes = require('./routes/teacher');
const clientRoutes = require('./routes/client');
const database = require('./util/database');
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
app.get('/error', errorController.getError)
app.use('/teacher', teacherRoutes);
app.use('/client', clientRoutes);
app.use('/', mainRoutes);



database.sequelize
  .authenticate()
  .then(() => {
    /*eslint no-console: "error"*/  
    console.log('Database Connection has been established successfully.');
    // opn('http:localhost:3000');

  })
  .catch(err => {
    /*eslint no-console: "error"*/
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

database.User.sync();


app.use(errorController.get404);



process.on('uncaughtException', (err) => {
  console.log(err);
  errorController.setError(err);
  opn('http://localhost:3000/error');
  server.close();  
})
