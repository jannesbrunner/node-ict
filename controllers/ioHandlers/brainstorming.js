const logger = require("winston");
const EduSession = require("../../models/eduSession");
const Student = require("../../models/student");


module.exports = class BrainstormTeacher {
    constructor(session, socket) {
        this.session = session;
        this.socketT = socket;
        
        this.teacherId = session.userId;
        this.isRunning = session.isRunning;
        
        this.studentSockets = [];
        this.presenterSockets = [];
        this.ioEventsTC();
        // Send Teacher client init session
        this.socketT.emit("newSession", this.session);
        this.emitStudentList();
    }
    ioEventsTC() {
    // ioEvents emitted by teacher
    
        // TEACHER ::::::::
        // Teacher Client wants to kick a student
        this.socketT.on("kickStudent", (data) => {
            logger.log("info", `Teacher wants to kick student with id ${data.studentId}`)
            if(data.sessionId == this.session.id) {
                this.removeStudent(data.studentId);
            }
        })

        // teacher req updated session
        this.socketT.on("getSession", function() {
           this.updateSessionT();
        });     
        // teacher sends updated session, save and resend updated version from DB
        this.socketT.on("updateSession", function(session) {
            if(session && session.id == this.session.id) {
                this.updateSessionDB.then( (saved) => {
                    if(saved) {
                        EduSession.getActiveSession(this.userId).then( (sessionFromDB) => {
                            this.session = sessionFromDB;
                            this.socket.emit("updateSession", this.session);
                        }).catch( (error) => {
                            this.socket.emit("appError", {errorMsg: `Error while saving: ${error}!`, fatalError: true})
                        })
                    }
                }).catch( (error) => {
                    this.socket.emit("appError", {errorMsg: `Error while saving: ${error}!`, fatalError: true})
                })
            }
        });
    }
    ioEventsSC() {
    // ioEvents emitted by student clients
        this.studentSockets.forEach( (socketS) => {

            // student requests updated session data
            socketS.on("getSession", function() {
                socketS.emit("updateSession", this.session);
            });
            // student sends updated session data
            socketS.on("updateSession", function(session) {
                if(session && session.id == this.session.id) {
                    this.updateSessionDB.then( (saved) => {
                        if(saved) {
                            EduSession.getActiveSession(this.userId).then( (sessionFromDB) => {
                                this.session = sessionFromDB;
                                socketS.emit("updateSession", this.session);
                            }).catch( (error) => {
                                socketS.emit("appError", {errorMsg: `Error while saving: ${error}!`, fatalError: true})
                            })
                        }
                    }).catch( (error) => {
                        socketS.emit("appError", {errorMsg: `Error while saving: ${error}!`, fatalError: true})
                    })
                }
            })
        })
    }

    ioEventsPC() {
    // io Events emitted by presenter clients
       this.presenterSockets.forEach( (socketP) => {
            socketP.on("getSession", function() {
                socketP.emit("updateSession", this.session);
            });
       });
    }

    async updateSessionDB() {
        try {
            const saved = await EduSession.saveActiveSession(this.session)
            if(!saved) {
                return false;
            }
            return true;
        } catch (error) {
            throw new Error(error);
        }
       
    }
    /// TEHACER :::::::
    updateSessionT() {
        this.socketT.emit("updateSession", this.session);
    }

    // PRESENTER :::::: 
    attachPresenter(presenterS) {
        this.presenterSockets.push(presenterS);
        presenterS.emit("newSession", {session: this.session});
        this.ioEventsPC();
    }

    
    // STUDENTS :::::::
    emitStudentList() {
        Student.getStudentsForSession(this.session.id).then(
            (students) => {
                if(students) {
                    this.socketT.emit("updateStudentList", students.students);
                }
            }
        ).catch(
            (error) => {
                this.socketT.emit("appError", 
                {errorMsg:`Unable to emit studentList (id ${this.session.id}): ${error}`, fatalError: false});
            }
        )
    }
    addStudent(student) {
        
        logger.log("debug", `Add student NAME ${student.name}, SOCKET: ${student.socket} 
        to game ${this.session.id}, ${this.session.name}`);

        Student.addStudentToSession(this.session.id, student.name).then( (
            (result) => {
                if(result) {
                    student.socket.studentId = result.id;
                    this.studentSockets.push(student.socket);
                    student.socket.emit("sessionJoined", {session: this.session, studentId: student.socket.studentId});
                    this.studentSockets.push(student.socket);
                    this.emitStudentList();
                    this.ioEventsSC();
                }
            }
        )).catch(
            (error) => {
                student.socket.emit("appError", 
                {errorMsg:`Unable to join session (id ${this.session.id}) (owner ${this.teacherId}): ${error}`, fatalError: false});
                logger.log("warn", `Unable to join session (id ${this.session.id}) (owner ${this.teacherId}): ${error}`);
            }
        )
        
        
        
    }

    studentLeft(studendS, studentId) {
        if(studendS, studentId) {
            logger.log("debug", `Remove student with ID ${studentId}, 
        from game ${this.session.id}, ${this.session.name}`);
        Student.removeStudentFromSession(this.session.id, studentId).then(
            (result) => {
                if(result) {
                    this.cleanUpStudentS();
                    this.emitStudentList();
                }
            }
        )

        }
    }

    removeStudent(studentId) {
        logger.log("debug", `Remove student with ID ${studentId}, 
        from game ${this.session.id}, ${this.session.name}`);

        
            Student.removeStudentFromSession(this.session.id, studentId).then(
                (result) => {
                    if(result) {
                        for( let studentS of this.studentSockets) {
                            if( studentS.studentId == studentId) {
                                this.cleanUpStudent(studentId);
                            }
                            studentS.emit("kicked", studentId);
                        }
                        this.cleanUpStudentS();
                        this.emitStudentList();
                    }
                }
            )
        
        
    }


    // LOGIC FUNCTIONS
    // remove all disconnected student sockets
    cleanUpStudentS() {
        this.studentSockets = this.studentSockets.filter( (studentS) => {
            studentS.disconnected == false;
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
                this.socketT.emit("endSession", true);
                this.emitToStudents("endSession", true);
                this.emitToPresenters("endSession", true);

            }
        } catch (error) {
            this.socketT.emit("AppError", { errorMsg: "Error during disabling session!", fatalError: false });
            logger.log("Error during disabling session! ID: " + this.session.id)
            // TODO Impement error hadnling
        }


    }

    // Emit a Message with title and message to all connected presenters
    emitToPresenters(title, message) {
        this.presenterSockets.forEach( (presenterS) => {
            presenterS.emit(title, message);
        });
    }

     // Emit a Message with title and message to all connected students
     emitToStudents(title, message) {
        this.studentSockets.forEach( (studentS) => {
            studentS.emit(title, message);
        });
     }

}
