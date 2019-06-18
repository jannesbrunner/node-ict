const logger = require("winston");
const EduSession = require("../../models/eduSession");

module.exports = class BrainstormTeacher {
    constructor(connectedStudents, session, socket, teacherId) {
        this.connectedStudents = connectedStudents;
        this.session = session;
        this.socket = socket;
        this.teacherId = teacherId;
        this.isRunning = false;
        this.emitSession();
       
    }
    emitSession() {
        this.socket.emit("session", this.session);
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
