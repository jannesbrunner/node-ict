const logger = require("winston");
const EduSession = require("../../models/eduSession");
const Student = require("../../models/student");


module.exports = class BrainstormTeacher {
    constructor(session, socket) {
        this.session = session;
        this.socket = socket;
        
        this.teacherId = session.userId;
        this.isRunning = session.isRunning;
        
        this.studentSockets = [];
        this.presenterSockets = [];
        this.ioEvents();
        this.emitSessionToTeacher();
        this.emitPlayerList();
    }
    ioEvents() {
        // TEACHER ::::::::
        // Teacher Client wants to kick a player
        this.socket.on("kickPlayer", (data) => {
            logger.log("info", `Teacher wants to kick player with id ${data.playerId}`)
            if(data.sessionId == this.session.id) {
                this.removePlayer(data.playerId);
            }
        })

    }
    emitSessionToTeacher() {
        this.socket.emit("session", this.session);
    }
    // PRESENTER :::::: 
    attachPresenter(presenterS) {
        this.presenterSockets.push(presenterS);
        presenterS.emit("game", {id: this.session.id, type: this.session.type, teacherId: this.session.userId, isRunning: this.isRunning});
    }
    // STUDENTS :::::::
    emitPlayerList() {
        Student.getStudentsForSession(this.session.id).then(
            (players) => {
                if(players) {
                    this.socket.emit("updatePlayerList", players.students);
                }
            }
        ).catch(
            (error) => {
                this.socket.emit("appError", 
                {errorMsg:`Unable to emit playerList (id ${this.session.id}): ${error}`, fatalError: false});
            }
        )
    }
    addPlayer(player) {
        
        logger.log("debug", `Add Player NAME ${player.name}, SOCKET: ${player.socket} 
        to game ${this.session.id}, ${this.session.name}`);

        Student.addStudentToSession(this.session.id, player.name).then( (
            (result) => {
                if(result) {
                    player.socket.studentId = result.id;
                    this.studentSockets.push(player.socket);
                    player.socket.emit("gameJoined", {type: "brainstorming", teacherId: this.teacherId, studentId: result.id});
                    this.studentSockets.push(player.socket);
                    this.emitPlayerList();
                }
            }
        )).catch(
            (error) => {
                player.socket.emit("appError", 
                {errorMsg:`Unable to join game (id ${this.session.id}) (owner ${this.teacherId}): ${error}`, fatalError: false});
                logger.log("warn", `Unable to join game (id ${this.session.id}) (owner ${this.teacherId}): ${error}`);
            }
        )
        
        
        
    }

    playerLeft(studendS, playerId) {
        if(studendS, playerId) {
            logger.log("debug", `Remove Player with ID ${playerId}, 
        from game ${this.session.id}, ${this.session.name}`);
        Student.removeStudentFromSession(this.session.id, playerId).then(
            (result) => {
                if(result) {
                    this.cleanUpStudentS();
                    this.emitPlayerList();
                }
            }
        )

        }
    }

    removePlayer(playerId) {
        logger.log("debug", `Remove Player with ID ${playerId}, 
        from game ${this.session.id}, ${this.session.name}`);

        
            Student.removeStudentFromSession(this.session.id, playerId).then(
                (result) => {
                    if(result) {
                        for( let studentS of this.studentSockets) {
                            if( studentS.studentId == playerId) {
                                this.cleanUpStudent(playerId);
                            }
                            studentS.emit("kicked", playerId);
                        }
                        this.cleanUpStudentS();
                        this.emitPlayerList();
                    }
                }
            )
        
        
    }
    // remove all disconnected student sockets
    cleanUpStudentS() {
        this.studentSockets = this.studentSockets.filter( (studentS) => {
            studentS.disconnected == true;
        })
    }

    cleanUpStudent(studentId) {
       let toRemove = this.studentSockets.findIndex( (studentS) => studentS.studentId == studentId);
       this.studentSockets = this.studentSockets.splice(toRemove, 1);

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
