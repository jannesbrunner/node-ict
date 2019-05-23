const db = require('../util/database');


exports.getNew = (req, res, next) => {
    
    res.render('client/new',
        {
            docTitle: 'Student | Node ICT'
        });
};

exports.postNew = (req, res, next) => {
    console.log(req.body, 'REQ BODY');
    res.setHeader('Set-cookie', `ict_username=${req.body.name}`)
    res.redirect('/client')
};

function userCookie(cookies) {
    
    console.log(cookies);

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

exports.getMain = (req, res, next) => {
    
    let username = userCookie(req.cookies);

    if (username != false) {
        res.render('client/index',
            {
                docTitle: 'Student | Node ICT',
                name: username
            });
    } else {
        
        res.redirect('/client/new');
    }
};

