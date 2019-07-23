/**
 * Error Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */
let error = "";

// Render 404 Page on unknwon route
exports.get404 = (req, res) => {
    res.status(404).render("404");
  };

// Render Error Page with given App error
exports.getError = (req, res) => {
    res.status(500).render("error", 
    {error: error})
}

// set global error
exports.setError = (err) => {
  error = err;
}
