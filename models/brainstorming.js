'use strict';

const db = require('../util/database');

exports.new = async (session) => {
    if(!session.name || !session.topic || !session.ownerId) {
        throw new Error ("Please provide a valid brainstormsession object {name, topic, ownerId}");
    }

    try {
        const newSession = await db.EduSession.create(
            {
                name: session.name,
                isActive: false,
                type: "brainstorming",
            }
        );
        const newBrainstorming = await db.Brainstorming.create(
            {
                topic: session.topic
            }
        );
        const setBrainstormRL = await newSession.setBrainstorming([newBrainstorming], true);
        const setSessionRL = await newSession.setUser([session.ownerId], true);   
        
       
    
    } catch (error) {
        throw new Error("DB New Brainstormsession Error: " + error)
    }


}
