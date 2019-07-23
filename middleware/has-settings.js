/**
 * Has Settings Middleware
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 * 
 * Checks if the app has valid settings.
 * if not show setup wizard.
 */

const Settings = require('../models/settings');

module.exports = async (req, res, next) => {
    try {
        const settings = await Settings.getSettings();
        if (!settings) {
            // res.render('error', { error: "Datenbank Error"})
            
            return res.redirect('/teacher/new');
        } else {
            next();
        }
    } catch (error) {
        return res.render('error', { error: error })
    }

}

