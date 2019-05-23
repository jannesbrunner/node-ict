const db = require('../util/database');
const dbSetup = require('../util/db_setup');


async function getSettings() {
    try {
        const settings = await db.Settings.findOne({ where: { id: 1 } });
        return settings;
    } catch (error) {
        return error;
    }
}


exports.checkSettings = async (req, res, next) => {

    try {
        const settings = await getSettings();
        if (settings === null) {
            // res.render('error', { error: "Datenbank Error"})
            res.redirect('/teacher/new');
        } else {
            next();
        }
    } catch (error) {
        res.render('error', { error: error })
    }

}



exports.getMain = (req, res, next) => {



    res.render('teacher/index',
        {
            docTitle: 'Teacher | Node ICT',
            isLoggedIn: req.session.isLoggedIn
            
        });

};

exports.getLogin = (req, res, next) => {
    res.render('teacher/login',
        {
            docTitle: 'Login | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
};

exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect('/teacher');
}

exports.postLogout = async (req, res, next) => {
    try {
        await req.session.destroy();
        res.redirect('/teacher');
    } catch (error) {
        res.render('error', { error: error })
    }
   
}

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await getSettings();
        res.render('teacher/settings',
            {
                'docTitle': 'Teacher > Settings | Node ICT',
                'settings': settings.dataValues,
                'isLoggedIn': req.session.isLoggedIn
                
            });
    } catch (error) {
        res.render('error', { error: error })
    }
}


exports.getSessions = async (req, res, next) => {

    res.render('teacher/sessions',
        {
            docTitle: 'Teacher > Sessions | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
};

exports.getNew = async (req, res, next) => {
    try {
        const settings = await getSettings();
        if (settings !== null) {
            res.status(403).render('error', { error: 'Forbidden' });
        } else {
            res.render('teacher/new',
                {
                    docTitle: 'Setup | Node ICT',
                });
        }
    } catch (error) {
        res.render('error', { error: error })
    }
}

exports.postReset = async (req, res, next) => {
    try {
        await dbSetup.forceSync()
        res.render('reset');
    } catch (error) {
        res.render('error', { error: error })
    }
}

exports.postNew = (req, res, next) => {
    console.log(req.body);

    db.Settings.create({
        isSetup: false,
        superAdmin: req.body.name
    }).
        then(result => {
            console.log(result);
            res.redirect('/teacher/login');
        })
        .catch(err => {
            console.err(err);
            res.render('/error', { error: err });
        });

}

exports.getSignup = (req, res, next) => {
    res.render('teacher/signup',
        {
            docTitle: 'Neuer Lehrender | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
}
