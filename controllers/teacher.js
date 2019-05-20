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

exports.getSettings = (req, res, next) => {
    res.render('teacher/settings',
    {
        docTitle: 'Teacher > Settings | Node ICT'
    });
};

exports.getSessions = (req, res, next) => {
    res.render('teacher/sessions',
    {
        docTitle: 'Teacher > Sessions| Node ICT'
    });
};
