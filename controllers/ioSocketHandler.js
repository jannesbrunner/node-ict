const socket = require('../util/socket')
const EduSession = require('../models/eduSession')
const BrainstormTeacher = require('./ioGameHandler');
const eventEmitter = require('../util/eventEmitter')
const logger = require('winston');

module.exports = async () => {


    // Set up namespaces
    const teacherIOs = socket.getIO().of('/tclient');
    const studentIOs = socket.getIO().of('/sclient');
    const presenterIOs = socket.getIO().of('/pclient');

    // Holds active games, key: teacher userId
    const availableSessionHandlers = new Map();



    // TEACHER Connection Manager
    teacherIOs.on('connection', (teacherS) => {
        const teacherUser = teacherS.request.session.user;

        let sessionT;
        let sessionHandler;

        // check if the teacher has a valid session, if not disconnect 
        if (!teacherUser) {
            teacherS.emit("appError", { errorMsg: "Ihre Session ist abgelaufe. Bitte melden Sie sich erneut an!", fatalError: true })
            logger.log('info', `Teacher connected: SID > ${teacherS.id}, No valid session. Disconnecting.`);
            // socket.disconnect();
        } else {
            logger.log('info', `Teacher connected: SID > ${teacherS.id}, Name > ${teacherUser.name}`);

            if (availableSessionHandlers.has(teacherUser.id)) {
                teacherS.emit("appError", { errorMsg: "Sie können nur eine Lehrerkonsole gleichzeitig starten!", fatalError: true })
            } else {
                EduSession.getActiveSession(teacherUser.id).then(
                    (activeSession) => {
                        if (activeSession) {

                            sessionT = activeSession;
                            // old
                            switch (sessionT.type) {
                                case "brainstorming":
                                    sessionHandler = new BrainstormTeacher(sessionT, teacherS);
                                    availableSessionHandlers.set(teacherUser.id, sessionHandler)
                                    updateStudentsSessionsList()
                                    break

                                case "quizzing":
                                    // TODO
                                    updateStudentsSessionsList()
                                    break;
                                default:
                                    teacherIOs.emit("appError", { errorMsg: "Unkwnown Session Type!", fatalError: true });
                                    logger.log("error", "Unkwnown Session Type!");
                                    teacherS.disconnect;
                                    throw new Error("Unknown Session Type!");
                            }
                        } else {
                            logger.log("error", "This Teacher has no active session!");
                            teacherS.emit("appError", { errorMsg: "Keine gestartete Lernsession gefunden!", fatalError: true });
                            teacherS.disconnect();
                        }
                    });
            }

            
            
    // check if the connected teacher already has a running game
    // Teacher disconnects
    teacherS.on("disconnect", function () {
        logger.log('info', `Lost connection to teacher: SID > ${teacherS.id}, Name > ${teacherUser.name}`);
        if (sessionHandler) {
            endSession(sessionHandler, teacherUser.id)

        }

    });


    // Teacher ends the session
    teacherS.on("endSession", function (teacherUserId) {
        if (teacherUserId) {
            endSession(sessionHandler, teacherUserId);

        }
    })

    // Teacher starts the session 
    teacherS.on("startSession", function(teacherUserId) {
        if(teacherUserId) {
            startSession(sessionHandler, teacherUserId);
        }
    })

    // Clean exit if teacher performs logout
    eventEmitter.get().addListener('session_end', (teacherUserId) => {
        logger.log("info", `Beginn Session End via Logout (for user ${teacherUserId} `)
        if (sessionHandler) {
            endSession(sessionHandler, teacherUserId);

        }

    });
}
    });

// Teacher Helpers
function endSession(sessionHandler, teacherUserId) {
    sessionHandler.endSession().then(
        () => {
            logger.log("verbose", `Successfully ended session for teacher with id ${teacherUserId}`)
            if(availableSessionHandlers.has(teacherUserId)) {
                availableSessionHandlers.delete(teacherUserId)
            }
            updateStudentsSessionsList();
        }
    ).catch(
        (error) => {
            logger.log("error", `Unable to end session for teacher with id ${teacherUserId}: ${error}`);
            throw new Error(error);
        }
    )
}
function startSession(sessionHandler, teacherUserId) {
    sessionHandler.startSession(sessionHandler, teacherUserId);
    logger.log("info", `Successfully started session for teacher with id ${teacherUserId}`);
    if(availableSessionHandlers.has(teacherUserId)) {
              let handlerToRun = availableSessionHandlers.get(teacherUserId);
              handlerToRun.isRunning = true;
              availableSessionHandlers.set(teacherUserId, handlerToRun);

    }
            updateStudentsSessionsList();
   
}

// Presenter
presenterIOs.on('connection', (presenterS) => {
    logger.log('info', `Presenter connected: SID > ${presenterS.id}`);


    presenterS.on("attachPresenter", function (sessionId) {
        logger.log("info", `New Presenter connected to session with id ${sessionId}`);
        EduSession.getSessionById(sessionId).then(
            (session) => {
                if (availableSessionHandlers.has(session.userId)) {
                    const activeSession = availableSessionHandlers.get(session.userId);
                    activeSession.attachPresenter(presenterS);
                } else {
                    throw new Error(`No session available with id ${sessionId}!`);
                }
            }
        ).catch(
            (error) => {
                logger.log("warn", `Attach Presenter: ${error}`);
                presenterS.emit("appError", { errorMsg: `ERROR: ${error}`, fatalError: true });
            }
        )
    })

    presenterS.on('disconnect', function () {
        logger.log("info", "a presenter left a session");
    })

    presenterS.on("presenterLeft", function (data) {
        if (data) {
            logger.log("info", `a presenter left the session of teacher with id ${null}`);
        }
    });

});

// Student
studentIOs.on('connection', (studentS) => {
    logger.log('info', `Student connected: SID > ${studentS.id}`);

    // The Student client requests the list of available sessions
    // check for data integrity Database vs memory map 
    studentS.on("getSessions", function () {
        updateStudentsSessionsList(studentS);
    })


    studentS.on("joinSession", function (data) {

        if (data) {
            logger.log("info", `User ${data.clientName} wants to join a session of teacher with id ${data.teacherId}`);
            EduSession.getActiveSession(data.teacherId).then(
                (activeSession) => {
                    if (availableSessionHandlers.has(activeSession.userId) && activeSession) {
                        const sessionHandler = availableSessionHandlers.get(activeSession.userId);
                        if(!sessionHandler.isRunning) {
                            sessionHandler.addStudent({ name: data.clientName, socket: studentS });
                            teacherIOs.emit("updateStudentlist", data.teacherId);
                        } else {
                            throw Error("This sessionHandler is already running! Cannot add Student!");
                        }
                       
                    }
                }
            ).catch(
                (error) => {
                    logger.log("error", `Unable to add new student to the game of teacher ${data.teacherId} (id): ${error}`);
                    throw new Error(error);
                }
            )
        }
    });

    studentS.on('sessionLeft', function (data) {
        if (data) {
            logger.log("info", `User ${data.clientName} (ID ${data.studentId}) left the session of teacher with id ${data.teacherId}`);
            EduSession.getActiveSession(data.teacherId).then(
                (activeSession) => {
                    if (availableSessionHandlers.has(activeSession.userId) && activeSession) {
                        const sessionHandler = availableSessionHandlers.get(activeSession.userId);
                        sessionHandler.studentLeft(studentS, data.studentId);
                        teacherIOs.emit("updateStudentlist", data.teacherId);
                    }
                }
            ).catch(
                (error) => {
                    logger.log("error", `Unable remove student (reason: left) of teacher ${data.teacherId} (id) : ${error}`);
                    throw new Error(error);
                }
            )
        }

    });

})

// Students Helpers

// Broadcast updated game list to all student sockets if 
// no specific student socket ist given (studentS = null)
function updateStudentsSessionsList(studentS = null) {

    let sessionsList = []
    EduSession.getActiveSessions(false).then(
        (sessions) => {
            if (sessions.length === 0) {
                studentS == null ? studentIOs.emit("updateSessionsList", {}) : studentS.emit("updateSessionsList", {})
            } else {
                sessions.forEach((session) => {
                    if (availableSessionHandlers.has(session.userId)) {
                        const sessionHandler = availableSessionHandlers.get(session.userId);
                        if(!sessionHandler.isRunning) {
                            sessionsList.push(session);
                        }
                       
                    }
                })
                studentS == null ? studentIOs.emit("updateSessionsList", sessionsList) : studentS.emit("updateSessionsList", sessionsList)
            }

        }
    )

}


}
