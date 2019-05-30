/**
 * Teacher Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

// Imports
const User = require("../models/user");
const Settings = require("../models/settings");
const dbSetup = require('../util/db_setup');


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
            const pwCheck = await User.checkPassword(password, user.password);
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
        return res.render('error', { error: error })
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
        let settings = await Settings.getSettings();
        let users = await User.getUsers();
        return res.render('teacher/settings',
            {
                'docTitle': 'Teacher > Settings | Node ICT',
                'settings': settings,
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
        const settings = await Settings.getSettings();
        if (settings) {
            res.status(403).render('error', { error: 'Forbidden' });
        } else {
            res.render('teacher/new',
                {
                    docTitle: 'Setup | Node ICT',
                });
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// POST => /teacher/new
exports.postNew = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        await Settings.updateSettings({
            isSetup: false,
            superAdmin: email
        });
        await User.save({
            name: name,
            email: email,
            password: password,
            isSuperAdmin: true,
            canLogIn: true,
        });
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
        return res.render('error', { error: error })
    }
}


// GET => /teacher/user-edit/:userId
exports.getUserEdit = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const foundUser = await User.getUser({ id: userId })
        const settings = await Settings.getSettings();
        if (foundUser) {
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

// POST => /teacher/user-edit 
exports.postUserEdit = async (req, res, next) => {

    if(req.session.user.id != req.params.userId) {
        if(!req.session.user.isSuperAdmin) {
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Sie sind nicht berechtigt diesen Benutzer zu ändern!`,
                backLink: `teacher/user-edit/${req.params.userId}`,
            })
        }
    }


    const userToSave = { id: parseInt(req.params.userId) }
    if (req.body.password != "" || req.body.passwordConfirm != "") {
        if (req.body.password !== req.body.passwordConfirm) {
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Die eingebenen Passwörter stimmen nicht überein!`,
                backLink: `teacher/user-edit/${req.params.userId}`,
            })

        } else {
            userToSave.password = req.body.password;
        }
    }


    req.body.name ? userToSave.name = req.body.name : console.log('No updated Name found');
    req.body.email ? userToSave.email = req.body.email : console.log('No updated eMail found');
    req.body.canLogIn == 'true' && req.session.user.isSuperAdmin ? userToSave.canLogIn = true : console.log('No updated canLogin permission found');
    req.body.isSuperAdmin == 'true' && req.session.user.isSuperAdmin ? userToSave.isSuperAdmin = true : console.log('No updated isSuperAdmin setting found');

    console.log(userToSave);
    await User.save(userToSave);



    res.redirect(`/teacher/user-edit/${req.params.userId}`);
}
// POST => /teacher/user-destroy/:userId
exports.destroyUser = async (req, res, next) => {
    if(req.session.user.id == req.params.userId || !req.session.user.isSuperAdmin) {
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Sie sind nicht berechtigt diesen Benutzer zu löschen!`,
                backLink: `teacher/user-edit/${req.params.userId}`,
            })
    }
    try {
        await User.destroy(req.params.userId);
        return res.redirect('/teacher/settings');
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
        const foundUser = await User.getUser({ email: email })
        if (foundUser) {
            res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': `Ein Benutzer mit der E-Mail Addresse ${email} existiert bereits!`,
                backLink: "teacher/signup",
            })
        } else {
            await User.save({ name: name, email: email, password: password });
            res.redirect('/teacher/settings');
        }
    } catch (error) {
        return res.render('error', { error: error })
    }
}
