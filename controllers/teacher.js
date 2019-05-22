const db = require('../util/database');

// const checkSettings = new Promise( (resolve, reject) => {
//     db.Settings.findOne({ where: { id: 1 } })
//     .then( (data) => {
//         if (data != null) {
//             resolve(data);
//         }
//         console.log(data);
//         resolve(":(");
//     })
//     .catch(err => {
//         console.err(err);
//         reject(false);
//     })
// })

     

exports.checkSettings = (req, res, next) => {
    db.Settings.findOne({where: {id: 1}})
        .then( 
            data => {
                if (data === null) {
                    // res.render('error', { error: "Datenbank Error"})
                    res.redirect('/teacher/new');
                } else {
                    next();
                }   
            }
            )
        .catch( error => {console.err(error)
            res.render('error', { error: error})
        });
   
}



exports.getMain = (req, res, next) => {
        
        

        res.render('teacher/index',
            {
                docTitle: 'Teacher | Node ICT'
            });
    
};

exports.getLogin = (req, res, next) => {
    res.render('teacher/login',
        {
            docTitle: 'Login | Node ICT'
        });
};

exports.postLogin = (req, res, next) => {
    res.redirect('/teacher');
}

exports.postLogout = (req, res, next) => {
    res.redirect('/teacher');
}

exports.getSettings = (req, res, next) => {
    res.render('teacher/settings',
                {
                    'docTitle': 'Teacher > Settings | Node ICT', 'users': [],
                });
   
    // let users = [];

    // db.User.findAll()
    //     .then(result => {
    //         const foundUsers = [result[0].dataValues];
    //         console.log(foundUsers, 'RESULST');
    //         res.render('teacher/settings',
    //             {
    //                 'docTitle': 'Teacher > Settings | Node ICT', 'users': foundUsers,
    //             });
    //     })
    //     .catch(err => {
    //         res.send(err);
    //     });


};

exports.getSessions = (req, res, next) => {
    res.render('teacher/sessions',
        {
            docTitle: 'Teacher > Sessions | Node ICT'
        });
};

exports.getNew = (req, res, next) => {
    // console.log(checkSettings());
    // if( !checkSettings() ) {
        res.render('teacher/new',
        {
            docTitle: 'Setup | Node ICT'
        });
    // } 
    res.redirect('/teacher');
}

exports.postNew = (req, res, next) => {
    console.log(req.body);
    
    db.Settings.create({
        isSetup: false,
        superAdmin: req.body.name
    }).
    then( result => {
        console.log(result);
        res.redirect('/teacher/login');
    })
    .catch(err => {
        console.err(err);
        res.render('/error', {error: err});
    });
    
}
