const db = require('../util/database');



exports.getMain = (req, res, next) => {
    res.render('teacher/index',
    {
        docTitle: 'Teacher | Node ICT'
    });
};

exports.getSettings = (req, res, next) => {
    let users = [];

    db.User.findAll()
    .then( result => {
        const foundUsers = [result[0].dataValues];
        console.log(foundUsers, 'RESULST');
        res.render('teacher/settings',
    {
        'docTitle': 'Teacher > Settings | Node ICT', 'users': foundUsers,
    });
    })
    .catch( err => {
        res.status(500).send(err);
    });

    
};

exports.getSessions = (req, res, next) => {
    res.render('teacher/sessions',
    {
        docTitle: 'Teacher > Sessions | Node ICT'
    });
};
