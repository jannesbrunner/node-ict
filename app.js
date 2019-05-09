/**
 * Node interactive course teaching
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Node Imports 
const http = require('http');
// 3rd Party Imports
const express = require('express');
// App Imports


const server = http.createServer( (req, res, next) => {
    res.write("<h1> Hello World! </h1>");
    res.end();
});
server.listen(3000);
