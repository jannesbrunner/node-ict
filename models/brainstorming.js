'use strict';

const db = require('../util/database');


exports.save = async (brainstorming) => {
    

}


exports.get = async (request) => {
    try {
        const brainstormingData = await db.Brainstorming.findOne({ where: { ...request } })
        
        if (brainstormingData) {
            return brainstormingData.dataValues;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("DB Get Brainstorming Error " + error)
    }
}
