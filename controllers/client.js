/**
 * Client Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// imports
const db = require('../util/database');

// GET => /client/student
exports.getStudent = (req, res, next) => {
    
        return res.render('client/student',
            {
                docTitle: 'Student | Node ICT',
            });
};

// GET => /client/presenter
exports.getPresenter = (req, res, next) => {
    return res.render('client/presenter', 
        {
            docTitle: 'Presenter | Node ICT'
        }
    );
}

// GET => /client/teacher
exports.getTeacher = (req, res, next) => {
    return res.render('client/teacher', 
        {
            docTitle: 'Teacher | Node ICT'
        }
    );
}




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



