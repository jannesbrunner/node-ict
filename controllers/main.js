/**
 * App Main Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// GET => /
exports.getIndex = (req, res) => {
    res.render('index',
    {
        docTitle: 'Herzlich Willkommen!'
    });
};
