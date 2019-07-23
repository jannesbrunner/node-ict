/**
 * Easy app path access util
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const path = require('path');

module.exports = path.dirname(process.mainModule.filename);
