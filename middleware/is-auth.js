/**
 * Is Auth Middleware
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 * 
 * Checks if user is logged in
 */

module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn) return res.redirect('/teacher/login');
    next();
}
