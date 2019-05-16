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
// App Imports //
const errorController = require('./controllers/error');
const mainRoutes = require('./routes/main');
const teacherRoutes = require('./routes/teacher');
const database = require('./util/database');
// ------------------------------------------------ //
const app = express();

app.listen(3000);
// Set static content folder
app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/teacher', teacherRoutes);
app.use('/', mainRoutes);

database.sequelize
  .authenticate()
  .then(() => {
    /*eslint no-console: "error"*/  
    console.log('Database Connection has been established successfully.');
  })
  .catch(err => {
    /*eslint no-console: "error"*/
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

database.User.sync();



app.use(errorController.get404);
