/**
 * Client Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const db = require('../util/database');

// GET => /client
exports.getMain = (req, res, next) => {
    let username = userCookie(req.cookies);
    if (username != false) {
        return res.render('client/index',
            {
                docTitle: 'Student | Node ICT',
                name: username
            });
    } else {
        return res.redirect('/client/new');
    }
};


// GET => /client/new
exports.getNew = (req, res, next) => {
    return res.render('client/new',
        {
            docTitle: 'Student | Node ICT'
        });
};

// POST => /client/new
exports.postNew = (req, res, next) => {
    res.setHeader('Set-cookie', `ict_username=${req.body.name}`)
    res.redirect('/client')
};


// Helpers
function userCookie(cookies) {
    if (cookies.ict_username) {
        return cookies.ict_username;
    } else return false;

    // if( cookie == undefined || !cookie.includes('ict_username')  ) {
    //     return false;
    // } 
    // if ( cookie.includes(';') ) {
    //     const cookieData = cookie.split(';');
    //     let cookieValue = "";
    //     for (let data in cookieData) {
    //         if (data.includes('ict_username=')) {
    //             cookieValue = data;
    //             return cookieValue.split('=')[1].trim();
    //         }
    //     }
    // } else {
    //     return cookie.split('=')[1].trim();
    // }
}



