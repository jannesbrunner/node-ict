const logger = require("winston");
const EduSession = require("../models/eduSession");
const Student = require("../models/student");


module.exports = class IoQuizHandler {
    constructor(session, socket) {
        this.session = session;
        this.socketT = socket;

        this.teacherId = session.userId;
        this.isRunning = false;

        logger.log('info', `New Quiz Session started!`);

        // Quizzing
        // Check if there is at least one question!
        if (this.session.lecture.questions.length > 0) {

           
            this.quizzingData = {
                givenAnswers: []
            };

            this.currentQuestionId = 0;
        } else {
            this.socketT.emit("appError", { errorMsg: `Dieses Quiz hat noch keine Fragen!`, fatalError: true });
            EduSession.unsetActiveSession(this.teacherId).then(() => {
                logger.log('info', 'Disabling session due to no questions present');
            }).catch(error => {
                logger.log('error', `Error Disabling session due to no questions present: ${error}`);
            });
        }





        this.studentSockets = new Map();
        this.presenterSockets = [];
        this.ioEventsTC();
        // Send Teacher client init session
        this.socketT.emit("initSession",
            {
                session: this.session,
                quizzing: this.quizzingData,
                currentQuestionId: this.currentQuestionId,
                receivedAnswers: this.receivedAnswers,
            });
        this.emitStudentList();




    }
    ioEventsTC() {
        // ioEvents emitted by teacher

        // TEACHER ::::::::
        // Teacher Client wants to kick a student
        this.socketT.on("kickStudent", (data) => {
            logger.log("info", `Teacher wants to kick student with id ${data.studentId}`)
            this.emitToPresenters("showInfo", `Spieler ${data.studentName} wurde aus der Sitzung entfernt`);
            if (data.sessionId == this.session.id) {
                this.removeStudent(data.studentId);
            }
        })

        // teacher req updated session
        this.socketT.on("getSession", () => {
            this.updateSessionT();
        });
        // teacher sends updated session, save and resend updated version from DB
        this.socketT.on("updateSession", (session) => {
            if (session && session.id == this.session.id) {
                this.updateSessionDB.then((saved) => {
                    if (saved) {
                        EduSession.getActiveSession(this.userId).then((sessionFromDB) => {
                            this.session = sessionFromDB;
                            this.socketT.emit("updateSession", this.session);
                        }).catch((error) => {
                            this.socketT.emit("appError", { errorMsg: `Error while saving: ${error}!`, fatalError: true })
                        })
                    }
                }).catch((error) => {
                    this.socketT.emit("appError", { errorMsg: `Error while saving: ${error}!`, fatalError: true })
                })
            }
        });

        // The specific quizzing object

        this.socketT.on("updateQuizzing", (quizzing) => {
            if (quizzing) {
                this.quizzingData = quizzing;
                this.emitToPresenters("updateQuizzing", this.quizzingData);
            }


        });

        this.socketT.on("getQuizzing", () => {
            this.socketT.emit("updateQuizzing", this.quizzingData);
        });

        // the teacher wants to ask the next question of the quiz
        this.socketT.on("nextQuestion", () => {
            if (this.session.lecture.questions.length != this.currentQuestionId) {
               this.currentQuestionId += 1;
               this.socketT.emit("nextQuestion", {currentQuestionId: this.currentQuestionId});
               this.emitToPresenters("nextQuestion", {currentQuestionId: this.currentQuestionId});
               this.emitToStudents("nextQuestion", {currentQuestionId: this.currentQuestionId});
            }
        });
        // the teacher wants to end the quiz and start the conclusion
        this.socketT.on("endQuiz", () => {
            this.socketT.emit("endQuiz", this.quizzingData);
            this.emitToPresenters("endQuiz", this.quizzingData);
            this.emitToStudents("endQuiz", this.quizzingData);
        });
    }
    ioEventsSC(socketS) {
        // ioEvents emitted by student clients
        // student requests updated session data
        socketS.on("getSession", () => {
            socketS.emit("updateSession", this.session);
        });
        // student sends updated session data
        socketS.on("updateSession", (session) => {
            if (session && session.id == this.session.id) {
                this.updateSessionDB.then((saved) => {
                    if (saved) {
                        EduSession.getActiveSession(this.userId).then((sessionFromDB) => {
                            this.session = sessionFromDB;
                            socketS.emit("updateSession", this.session);
                        }).catch((error) => {
                            socketS.emit("appError", { errorMsg: `Error while saving: ${error}!`, fatalError: true })
                        })
                    }
                }).catch((error) => {
                    socketS.emit("appError", { errorMsg: `Error while saving: ${error}!`, fatalError: true })
                })
            }
        })

        socketS.on("disconnect", () => {
            this.cleanUpStudents();
        });
        // QUIZZING 

        socketS.on("newAnswer", (answer) => {
            this.quizzingData.receivedAnswers += 1;
            this.quizzingData.givenAnswers.push(answer);
            this.emitToPresenters("newAnswer", answer.studentName)
            this.socketT.emit("newAnswer", answer);
            this.socketT.emit("updateQuizzing", this.quizzingData)
        })

        socketS.on("endQuiz", () => {
            this.emitToPresenters("endQuiz", this.quizzingData);
            this.emitToStudents("endQuiz", this.quizzingData);
            this.socketT.emit("endQuiz", this.quizzingData);
        });


    }

    ioEventsPC(socketP) {
        // io Events emitted by presenter clients

        socketP.on("getSession", () => {
            socketP.emit("updateSession", this.session);
        });

    }

    async updateSessionDB() {
        try {
            const saved = await EduSession.saveActiveSession(this.session)
            if (!saved) {
                return false;
            }
            return true;
        } catch (error) {
            throw new Error(error);
        }

    }

    async updateMemorySession() {
        try {
            const newSession = await EduSession.getActiveSession(this.teacherId);
            if (newSession) {
                this.session = newSession;
                return true
            }
            return false;

        } catch (error) {
            throw new Error(error);
        }

    }
    /// TEACHER :::::::
    updateSessionT() {
        this.socketT.emit("updateSession", this.session);
    }

    emitStudentList() {
        Student.getStudentsForSession(this.session.id).then(
            (students) => {
                if (students) {
                    this.socketT.emit("updateStudentList", students.students);
                    this.emitToPresenters("updateStudentList", students.students);
                }
            }
        ).catch(
            (error) => {
                this.socketT.emit("appError",
                    { errorMsg: `Unable to emit studentList (id ${this.session.id}): ${error}`, fatalError: false });
            }
        )
    }

    // PRESENTER :::::: 
    attachPresenter(presenterS) {
        this.presenterSockets.push(presenterS);
        presenterS.emit("initSession", { session: this.session, isRunning: this.isRunning, quizzing: this.quizzingData });
        this.emitStudentList();
        this.ioEventsPC(presenterS);
    }


    // STUDENTS :::::::
    addStudent(student) {

        logger.log("debug", `Add student NAME ${student.name}, SOCKET: ${student.socket} 
        to game ${this.session.id}, ${this.session.name}`);

        Student.addStudentToSession(this.session.id, student.name).then((
            (result) => {
                if (result) {
                    // associate student socket with student id
                    this.studentSockets.set(result.id, student.socket);
                    student.socket.emit("sessionJoined", { session: this.session, studentId: result.id, quizzing: this.quizzingData });
                    this.emitToPresenters("showInfo", `${student.name} ist beigetreten!`);
                    this.emitStudentList();
                    this.ioEventsSC(student.socket);
                }
            }
        )).catch(
            (error) => {
                student.socket.emit("appError",
                    { errorMsg: `Unable to join session (id ${this.session.id}) (owner ${this.teacherId}): ${error}`, fatalError: false });
                logger.log("warn", `Unable to join session (id ${this.session.id}) (owner ${this.teacherId}): ${error}`);
            }
        )



    }

    studentLeft(studendS, studentId) {
        if (studendS, studentId) {
            logger.log("debug", `Remove student with ID ${studentId}, 
        from game ${this.session.id}, ${this.session.name}`);
            Student.removeStudentFromSession(this.session.id, studentId).then(
                (result) => {
                    if (result) {
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
                if (result) {

                    let studentS = this.studentSockets.get(studentId);
                    if (studentS) studentS.emit("kicked", studentId);
                    this.cleanUpStudent(studentId);
                    this.cleanUpStudentS();
                    this.emitStudentList();
                }
            }
        )


    }
    // Delete all disconnected students 
    cleanUpStudents() {
        logger.log('info', `Clean up Students`);


        this.studentSockets.forEach((studentS, studentId) => {
            if (studentS.disconnected) {
                Student.removeStudentFromSession(this.session.id, studentId).then(
                    (result) => {
                        if (result) {
                            this.emitStudentList();
                        }
                    }).catch(
                        (error) => { logger.log('error', `Student with id ${studentId} is no longer connected. Error during deletion: ${error}`); }
                    )
            }
        })


    }


    // LOGIC FUNCTIONS
    // remove all disconnected student sockets
    cleanUpStudentS() {
        this.studentSockets.forEach((studendS, studentId) => {
            if (studendS.disconnected == true) {
                this.studentSockets.delete(studentId);
            }
        })
    }

    cleanUpStudent(studentId) {
        if (this.studentSockets.has(studentId)) {
            this.studentSockets.delete(studentId);
        }

    }

    // start the session
    startSession() {
        this.isRunning = true;
        this.socketT.emit("startSession", true);
        this.emitToStudents("startSession", true);
        this.emitToPresenters("startSession", true);
    }

    async endSession() {
        try {

            logger.log("info", `Saving BS... ID:${this.session.id}`);
            if (this.quizzingData && this.session) {
                this.session.lecture.quizzingJSON = JSON.stringify(this.quizzingData);
                const save = await EduSession.saveActiveSession(this.session);

                if (save == false) {
                    throw new Error("Error saving QSS!");
                }
            }

            const deleteUsers = await Student.removeStudentsFromSession(this.session.id);
            const answer = await EduSession.unsetActiveSession(this.teacherId);
            if (answer && deleteUsers) {



                this.socketT.emit("endSession", true);
                this.emitToStudents("endSession", true);
                this.emitToPresenters("endSession", true);

            }
        } catch (error) {
            this.socketT.emit("AppError", { errorMsg: "Error during disabling session!", fatalError: false });
            logger.log("error", `Error during disabling session! ID: ${this.session.id}: ${error}`);
            // TODO Impement error hadnling
        }


    }

    // Emit a Message with title and message to all connected presenters
    emitToPresenters(title, message) {
        this.presenterSockets.forEach((presenterS) => {

            presenterS.emit(title, message);
        });
    }

    // Emit a Message with title and message to all connected students
    emitToStudents(title, message) {
        this.studentSockets.forEach((studentS, studentId) => {
            console.log(`Emitting: ${title} to student ${studentId}`)
            studentS.emit(title, message);
        });
    }

}
