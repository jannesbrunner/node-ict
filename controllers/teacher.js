const db = require('../util/database');
const dbSetup = require('../util/db_setup');
const bcrypt = require('bcryptjs')


async function getSettings() {
    try {
        const settings = await db.Settings.findOne({ where: { id: 1 } });
        return settings;
    } catch (error) {
        return error;
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

exports.postLogin = async (req, res, next) => {
    const email = req.body.mail;
    const password = req.body.password;
    try {
        
        const user = await db.User.findOne({where: {email: email}});
        
        if (!user) {
            res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': "Dieser Nutzer existiert nicht!",
                backLink: "teacher/login",
                
            })
        } else {
           const pwCheck = await bcrypt.compare(password, user.password);
           if(pwCheck) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            await req.session.save();
            res.redirect('/teacher');
            
           } else {
            res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': "Falsche Zugangsdaten!",
                backLink: "teacher/login",
                
            })   
           }
        }

    } catch (error) {
        res.render('error', { error: error })
    }
    
    
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
        if (settings) {
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
        await req.session.destroy();
        res.render('reset');
    } catch (error) {
        res.render('error', { error: error })
    }
}

exports.postNew = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        await db.Settings.create({
            isSetup: false,
            superAdmin: email
        });
        const cryptedPw = await bcrypt.hash(password, 12);
        await db.User.create({
            name: name,
            email: email,
            password: cryptedPw,
            isSuperAdmin: true,
        });
        res.redirect('/teacher/login');
    } catch (error) {
        console.err(error);
        res.render('/error', { error: error })
    }

}

exports.getSignup = (req, res, next) => {
    res.render('teacher/signup',
        {
            docTitle: 'Neuer Lehrender | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
}

exports.postSignup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.mail;
    const password = req.body.password;
    const passwordConfirmed = req.body.passwordConfirm;

    if (password != passwordConfirmed) {
        return res.render('teacher/error', {
            'docTitle': "Error! | Node ICT",
            'error': `Die eingebenen Passwörter stimmen nicht überein!`,
            backLink: "teacher/signup",
        })   
    }

    try {
        const foundUser = await db.User.findOne({where: {email: email}})
        if(foundUser) {
            res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Ein Benutzer mit der E-Mail Addresse ${email} existiert bereits!`,
                backLink: "teacher/signup",
            })   
        } else {
            const cryptedPw = await bcrypt.hash(password, 12);
            await db.User.create({
                name: name,
                email: email,
                password: cryptedPw,
                isSuperAdmin: false,
            });
            res.redirect('/teacher/login');
        }

    } catch (error) {
        res.render('error', { error: error })
    }
    
}
