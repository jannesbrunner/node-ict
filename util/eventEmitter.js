
let eventsEmitter;

module.exports = {
    init: () => { 
        const events = require('events');
        eventsEmitter = new events.EventEmitter; 
        return eventsEmitter; 
    },
    get: () => { 
        if(!eventsEmitter) {
            throw new Error('Events emitter is not initialized!');
        }    
        return eventsEmitter 
    }
}
