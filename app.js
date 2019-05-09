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
// App Imports
const errorController = require('./controllers/error');

const app = express();

app.listen(3000);
// Set static content folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(errorController.get404);
