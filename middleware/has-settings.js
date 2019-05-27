const db = require('../util/database');

module.exports = async (req, res, next) => {

    try {
        const settings = await getSettings();
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

async function getSettings() {
    try {
        const settings = await db.Settings.findOne({ where: { id: 1 } });
        return settings;
    } catch (error) {
        return error;
    }
}
