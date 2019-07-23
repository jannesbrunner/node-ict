/**
 * Socket IO Singleton Util
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

let io;

module.exports = {
    init: httpServer => {
       io = require('socket.io')(httpServer)
       return io;
    },
    getIO: () => {
        if(!io) {
            throw new Error('Socket.io is not initialized!');
        }
        return io;
    }
}
