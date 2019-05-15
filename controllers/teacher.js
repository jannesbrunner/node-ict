exports.getMain = (req, res, next) => {
    res.render('teacher/index',
    {
        docTitle: 'Teacher | Node ICT'
    });
};

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
