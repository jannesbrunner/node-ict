const logger = require("winston");
const EduSession = require("../../models/eduSession");

module.exports = class BrainstormTeacher {
    constructor(connectedStudents, session, socket, teacherId) {
        this.connectedStudents = new Set()
        this.session = session;
        this.socket = socket;
        this.teacherId = teacherId;
        this.isRunning = false;
        this.emitSession();
        this.emitPlayerList();
    }
    emitSession() {
        this.socket.emit("session", this.session);
    }
    emitPlayerList() {
        const playerList = [];
        this.connectedStudents.forEach(  
            (player) => {
                playerList.push({name: player.name});
            })
            this.socket.emit("updatePlayerList", playerList);
    }
    // TODO ALLES MIT INS SESSION OBJEKT?
    addPlayer(player) {
        logger.log("debug", `Add Player NAME ${player.name}, SOCKET: ${player.socket} 
        to game ${this.session.id}, ${this.session.name}`);
        this.connectedStudents.add({name: player.name, socket: player.socket});
        this.emitPlayerList();
        player.socket.emit("gameJoined", {type: "brainstorming", teacherId: this.teacherId});
    }
    async endSession() {
        try {
            const answer = await EduSession.unsetActiveSession(this.teacherId);
            if (answer) {
                this.socket.emit("endSession", true);
            }
        } catch (error) {
            this.socket.emit("AppError", { errorMsg: "Error during disabling session!", fatalError: false });
            logger.log("Error during disabling session! ID: " + this.session.id)
            // TODO Impement error hadnling
        }


    }
}
