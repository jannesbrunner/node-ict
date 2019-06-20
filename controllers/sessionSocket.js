const socket = require('../util/socket')
const EduSession = require('../models/eduSession')
const BrainstormTeacher = require('../controllers/games/brainstorming');
const eventEmitter = require('../util/eventEmitter')
const logger = require('winston');

module.exports = async () => {


    // Set up namespaces
    const teacherIOs = socket.getIO().of('/tclient');
    const studentIOs = socket.getIO().of('/sclient');
    const presenterIOs = socket.getIO().of('/pclient');

    // Holds active games, key: teacher userId
    const availableGames = new Map();



    // TEACHER Connection Manager
    teacherIOs.on('connection', (teacherS) => {
        const teacherUser = teacherS.request.session.user;

        let session;
        let game;

        // check if the teacher has a valid session, if not disconnect 
        if (!teacherUser) {
            teacherS.emit("appError", { errorMsg: "Ihre Session ist abgelaufe. Bitte melden Sie sich erneut an!", fatalError: true })
            logger.log('info', `Teacher connected: SID > ${teacherS.id}, No valid session. Disconnecting.`);
            // socket.disconnect();
        } else {
            logger.log('info', `Teacher connected: SID > ${teacherS.id}, Name > ${teacherUser.name}`);

            EduSession.getActiveSession(teacherUser.id).then(
                (activeSession) => {
                    if (activeSession) {

                        session = activeSession;
                        // old
                        switch (session.type) {
                            case "brainstorming":
                                game = new BrainstormTeacher(session, teacherS);
                                availableGames.set(teacherUser.id, game)
                                updateStudentsGameList()
                                break

                            case "quizzing":
                                // TODO
                                updateStudentsGameList()
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


                }
            );
            // check if the connected teacher already has a running game
            // Teacher disconnects
            teacherS.on("disconnect", function () {
                logger.log('info', `Lost connection to teacher: SID > ${teacherS.id}, Name > ${teacherUser.name}`);
                if (game) {
                    endSession(game, teacherUser.id)

                }

            });


            // Teacher ends the session
            teacherS.on("endSession", function (teacherUserId) {
                if (teacherUserId) {
                    endSession(game, teacherUserId);

                }
            })
            // Clean exit if teacher performs logout
            eventEmitter.get().addListener('session_end', (teacherUserId) => {
                logger.log("info", `Beginn Session End via Logout (for user ${teacherUserId} `)
                if (game) {
                    endSession(game, teacherUserId);

                }

            });
        }
    });

    // Teacher Helpers
    function endSession(game, teacherUserId) {
        game.endSession().then(
            () => {
                logger.log("verbose", `Successfully ended session for teacher with id ${teacherUserId}`)
                availableGames.delete(teacherUserId)
                updateStudentsGameList();
            }
        ).catch(
            (error) => {
                logger.log("error", `Unable to end session for teacher with id ${teacherUserId}: ${error}`);
                throw new Error(error);
            }
        )
    }











    // Presenter
    presenterIOs.on('connection', (presenterS) => {
        logger.log('info', `Presenter connected: SID > ${presenterS.id}`);


        presenterS.on("attachPresenter", function () {
            // TODO
        })

        presenterS.on('disconnect', function () {

        })

    });

    // Student
    studentIOs.on('connection', (studentS) => {
        logger.log('info', `Student connected: SID > ${studentS.id}`);

        // The Student client requests the list of available games
        // We check for data integrity Database vs memory map 
        studentS.on("reqGames", function () {
            updateStudentsGameList(studentS);
        })


        studentS.on("joinGame", function (data) {

            if (data) {
                logger.log("info", `User ${data.clientName} wants to join a game from teacher with id ${data.teacherId}`);
                EduSession.getActiveSession(data.teacherId).then(
                    (game) => {
                        if (availableGames.has(game.userId)) {
                            const session = availableGames.get(game.userId);
                            session.addPlayer({ name: data.clientName, socket: studentS });
                            teacherIOs.emit("updatePlayerlist", data.teacherId);
                        }
                    }
                ).catch(
                    (error) => {
                        logger.log("error", `Unable to add new player to the game of teacher ${data.teacherId} (id): ${error}`);
                        throw new Error(error);
                    }
                )
            }
        });

        studentS.on('gameLeft', function (data) {
            if (data) {
                logger.log("info", `User ${data.clientName} (ID ${data.studentId}) left the game of teacher with id ${data.teacherId}`);
                EduSession.getActiveSession(data.teacherId).then(
                    (game) => {
                        if (availableGames.has(game.userId)) {
                            const session = availableGames.get(game.userId);
                            session.playerLeft(studentS, data.studentId);
                            teacherIOs.emit("updatePlayerlist", data.teacherId);
                        }
                    }
                ).catch(
                    (error) => {
                        logger.log("error", `Unable remove player (reason: left) of teacher ${data.teacherId} (id) game: ${error}`);
                        throw new Error(error);
                    }
                )
            }

        });

    })

    // Students Helpers

    // Broadcast updated game list to all student sockets if 
    // no specific student socket ist given (studentS = null)
    function updateStudentsGameList(studentS = null) {

        let gameList = []
        EduSession.getActiveSessions(false).then(
            (games) => {
                if (games.length === 0) {
                    studentS == null ? studentIOs.emit("updateGameList", {}) : studentS.emit("updateGameList", { value: gameList })
                } else {
                    games.forEach((game) => {
                        if (availableGames.has(game.userId)) {
                            gameList.push(game);
                        }
                    })
                    studentS == null ? studentIOs.emit("updateGameList", {}) : studentS.emit("updateGameList", { value: gameList })
                }

            }
        )

    }


}
