/**
 * Applikation Settings Model
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

const db = require('../util/database');
const logger = require('winston');

// Model 
exports.getSettings = async () => {
    try {
        const settings = await db.Settings.findOne({ where: { id: 1 } });
        if (settings) {
            return settings.dataValues;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("DB Get Settings " + error);
    }
}

exports.updateSettings = async (updatedSettings) => {
    try {
        // check if there are settings present
        const currentSettings = await db.Settings.findByPk(1);

        // no settings found? Then create them
        if (!currentSettings) {
        
           
            const settingsToCreate = await db.Settings.create(updatedSettings)
            if (settingsToCreate) {
                return true;
            } else {
                logger.log("error", "DB Create Settings: Error creating settings")
                throw new Error("DB Create Settings: Error creating settings")
            }
        // found settings, update them
        } else {
            for (let prop in updatedSettings) {
                currentSettings[prop] = updatedSettings[prop]
            }
            return await currentSettings.save();
        }

    }
    catch (error) {
        return error;
    }
}




