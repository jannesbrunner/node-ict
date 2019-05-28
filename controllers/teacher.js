/**
 * Teacher Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Imports
const db = require('../util/database');
const User = require("../models/user");
const Setting = require("../models/settings");
const dbSetup = require('../util/db_setup');
const bcrypt = require('bcryptjs')

// Helpers
async function getSettings() {
    try {
        const settings = await db.Settings.findOne({ where: { id: 1 } });
        return settings;
    } catch (error) {
        return error;
    }
}



// GET => /teacher
exports.getMain = (req, res, next) => {
    res.render('teacher/index',
        {
            docTitle: 'Teacher | Node ICT',
            isLoggedIn: req.session.isLoggedIn

        });
};

// GET => /teacher/login
exports.getLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/teacher');
    }
    return res.render('teacher/login',
        {
            docTitle: 'Login | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
};

// POST => /teacher/login
exports.postLogin = async (req, res, next) => {
    const email = req.body.mail;
    const password = req.body.password;
    try {
        const user = await User.getUser({ email: email })
        if (!user) {
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': "Dieser Nutzer existiert nicht!",
                backLink: "teacher/login",
            })
        } else {
            if (!user.canLogIn) {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': "Dieser Nutzer ist nicht freigeschaltet.",
                    backLink: "teacher/login",
                });
            }
            const pwCheck = await user.checkPassword(password);
            if (pwCheck) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                await req.session.save();
                return res.redirect('/teacher');

            } else {
                return res.render('teacher/error', {
                    'docTitle': "Error! | Node ICT",
                    'error': "Falsche Zugangsdaten!",
                    backLink: "teacher/login",
                })
            }
        }
    } catch (error) {
        res.render('error', { error: error})
    }
}

// POST => /teacher/logout
exports.postLogout = async (req, res, next) => {
    try {
        await req.session.destroy();
        return res.redirect('/teacher');
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// GET => /teacher/settings
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await getSettings();
        let users = await User.getUsers();
        return res.render('teacher/settings',
            {
                'docTitle': 'Teacher > Settings | Node ICT',
                'settings': settings.dataValues,
                'isLoggedIn': req.session.isLoggedIn,
                'loggedUser': req.session.user,
                'users': users

            });
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// GET => /teacher/new
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

// POST => /teacher/new
exports.postNew = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        await db.Settings.create({
            isSetup: false,
            superAdmin: email
        });
        const user = new User(name, email, password, true, true)
        await user.save();
        return res.redirect('/teacher/login');
    } catch (error) {
       return res.render('error', { error: error })
    }
}

// POST => /teacher/reset
exports.postReset = async (req, res, next) => {
    try {
        await dbSetup.forceSync()
        await req.session.destroy();
        res.render('reset');
    } catch (error) {
        res.render('error', { error: error })
    }
}


// GET => /teacher/user-edit/:userId
exports.getUserEdit = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const foundUser = await User.getUser({ id: userId })
        const settings = await getSettings();
        if(foundUser) {
            return res.render('teacher/user-edit', {
                docTitle: `Benutzer Bearbeiten: ${foundUser.name} | Node ICT`,
                isLoggedIn: req.session.isLoggedIn,
                isSuperAdmin: req.session.user.isSuperAdmin,
                user: foundUser,
                loggedUser: req.session.user,
                settings: settings,
            });
        } else {
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Ein Benutzer mit der ID ${req.params.userId} existiert nicht!`,
                backLink: "teacher/settings",
            })
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// GET => /teacher/signup
exports.getSignup = (req, res, next) => {
    res.render('teacher/signup',
        {
            docTitle: 'Neuer Lehrender | Node ICT',
            isLoggedIn: req.session.isLoggedIn
        });
}

// POST => /teacher/signup
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
        const foundUser = await User.getUser({email: email})
        if (foundUser) {
            res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Ein Benutzer mit der E-Mail Addresse ${email} existiert bereits!`,
                backLink: "teacher/signup",
            })
        } else {
            
            const newUser = new User(name, email, password)
            await newUser.save();
            res.redirect('/teacher/login');
        }
    } catch (error) {
        res.render('error', { error: error })
    }
}
