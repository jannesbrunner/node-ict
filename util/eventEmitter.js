/**
 * Event Emitter. Send messages across the whole App
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */
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
