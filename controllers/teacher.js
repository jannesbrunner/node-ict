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
const eventEmitter = require('../util/eventEmitter');
const logger = require('winston');
const winHotspot = require('../util/winHotspot');





// GET => /teacher
exports.getMain = (req, res) => {
    

    res.render('teacher/index',
        {
            docTitle: 'Teacher | Node ICT',
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user

        });
};

// GET => /teacher/login
exports.getLogin = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/teacher');
    }
    return res.render('teacher/login',
        {
            docTitle: 'Login | Node ICT',
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user
        });
};

// POST => /teacher/login
exports.postLogin = async (req, res) => {
    const email = req.body.mail;
    const password = req.body.password;
    try {
        const user = await User.getUser({ email: email })
        if (!user) {
            logger.log("warn", `Security alert: ${email} tried to login but does not exists.`)
            return res.render('teacher/error', {
                'docTitle': "Error! | Node ICT",
                'error': "Dieser Nutzer existiert nicht!",
                backLink: "teacher/login",
            })
        } else {
            if (!user.canLogIn) {
                logger.log("warn", `Security alert: ${user.email} tried to login but is not allowed to.`)
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
exports.postLogout = async (req, res) => {
    try {
        // end teachers session if one running
        eventEmitter.get().emit('session_end', req.session.user.id);
        await req.session.destroy();
        logger.log("warn", `Security alert: teacher.id ${req.session.user.id} did logout.`)
        return res.redirect('/teacher');
        
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// GET => /teacher/settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.getSettings();
        let users = await User.getUsers();
        let hotspotStatus = "";
        if(process.platform === "win32") {
            try {
                hotspotStatus = await winHotspot.getStats();
            } catch (error) {
                hotspotStatus = "Der Status konnte nicht ermittelt werden.\nEin WLAN Netzwerkadapter ist installiert?";
            }
           
        }
        
        return res.render('teacher/settings',
            {
                'docTitle': 'Teacher > Settings | Node ICT',
                'settings': settings,
                'isLoggedIn': req.session.isLoggedIn,
                'loggedUser': req.session.user,
                'users': users,
                'canHotspot': process.platform === "win32",
                'hotspotStatus': hotspotStatus

            });
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// POST => /teacher/wifion
exports.postEnableWifi = async (req, res) => {
    try {
        await winHotspot.enableHotspot();
        logger.log("info", "Enabling Wifi Hotspot")
        res.redirect('/teacher/settings');
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// POST => /teacher/wifioff
exports.postDisableWifi = async (req, res) => {
    try {
        await winHotspot.disableHotspot()
        logger.log("info", "Disabling Wifi Hotspot")
        res.redirect('/teacher/settings');
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// GET => /teacher/new
exports.getNew = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        if (settings) {
            logger.log("warn", `Security alert: App init trial without app reset!.`)
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
exports.postNew = async (req, res) => {
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
exports.postReset = async (req, res) => {
    try {
        await req.session.destroy();
        await dbSetup.forceSync();
        logger.log("warn", "App Reset executed!")
        res.render('reset');
    } catch (error) {
        return res.render('error', { error: error })
    }
}

// POST => /teacher/shutdown
exports.postShutdown = async (req, res) => {
    try {

        logger.log("warn", "App Shutdown executed!")
        console.log( "\nGracefully shutting down from Admin interface\nThanks for using Node ICT! Good bye..." );
        logger.log("info", "Server shutdown initiated. Reason: Teacher Client")
        process.exit( );
    } catch (error) {
        return res.render('error', { error: error })
    }
}


// GET => /teacher/user-edit/:userId
exports.getUserEdit = async (req, res) => {
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
exports.postUserEdit = async (req, res) => {

    if(req.session.user.id != req.params.userId) {
        if(!req.session.user.isSuperAdmin) {
            logger.log("warn", `Security alert: User ${req.session.user.id} tried to alter a user without permission to!`)
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
exports.destroyUser = async (req, res) => {
    if(req.session.user.id == req.params.userId || !req.session.user.isSuperAdmin) {
        logger.log("warn", `Security alert: User ${req.session.user.id} tried to delete a user without permission to!`)
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
exports.getSignup = (req, res) => {
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
        logger.log("info", "Security Alert: Someone tried to signup with an already existing eMail!");
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
