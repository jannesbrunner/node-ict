const hotspot = require('node-hotspot');
const passwordGenerator = require('generate-password');
const logger = require('winston');

const password = passwordGenerator.generate({
    length: 12,
    numbers: true,
    excludeSimilarCharacters: true,
});

const opts = {
    ssid: 'node ict', 
    password: password, 
    force: true, // (optional)  if hosting a network already turn it off and run ours.
};

const isOnWindows = process.platform === "win32"; 


exports.enableHotspot = async () => {
    if(!isOnWindows) {
        logger.log("warn", "WiFi Hotspot support only on MS Windows!")
        return false;
    }

    try {
        await hotspot.enable(opts)
        return true;
        
    } catch (error) {
        logger.log("error", "Unable to activate Wifi Hotspot: " + error)
        throw new Error("Unable to activate Wifi Hotspot: " + error);    
    } 
}

exports.disableHotspot = async () => {
    if(!isOnWindows) {
        logger.log("warn", "WiFi Hotspot support only on MS Windows!")
        return false;
    }

    try {
        await hotspot.disable(opts)
        return true;
        
    } catch (error) {
        logger.log("error", "Unable to disable Wifi Hotspot: " + error)
        throw new Error("Unable to disable Wifi Hotspot: " + error);    
    } 

}

exports.getStats = async () => {
    if(!isOnWindows) {
        logger.log("warn", "WiFi Hotspot support only on MS Windows!")
        return false;
    }

    try {
        const stats = await hotspot.stats(opts)
        return stats;
        
    } catch (error) {
        logger.log("error", "Unable to get Wifi Hotspot stats: " + error)
        throw new Error("Unable to get Wifi Hotspot stats: " + error);    
    } 

}

