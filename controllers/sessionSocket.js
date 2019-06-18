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

    const connectedTeachers = new Map()

    // TEACHER Connection Manager
    teacherIOs.on('connection', (socket) => {
        const teacherUser = socket.request.session.user;
  
        // check if the teacher has a valid session, if not disconnect 
        if (!teacherUser) {
            socket.emit("appError", { errorMsg: "Ihre Session ist abgelaufe. Bitte melden Sie sich erneut an!", fatalError: true })
            logger.log('info', `Teacher connected: SID > ${socket.id}, No valid session. Disconnecting.`);
            // socket.disconnect();
        } else {
            logger.log('info', `Teacher connected: SID > ${socket.id}, Name > ${teacherUser.name}`);

            EduSession.getActiveSession(teacherUser.id).then(
                (activeSession) => {
                    if (activeSession) {
                        switch (activeSession.type) {
                            case "brainstorming":
                                connectedTeachers.set(teacherUser.id, 
                                    new BrainstormTeacher([], activeSession, socket, teacherUser.id)
                                )
                              break

                            case "quizzing":
                                // TODO
                               
                                break;
                            default:
                                teacherIOs.emit("appError", { errorMsg: "Unkwnown Session Type!", fatalError: true });
                                logger.log("error", "Unkwnown Session Type!");
                                throw new Error("Unknown Session Type!");
                        }
                    } else {
                        logger.log("error", "This Teacher has no active session!");
                        return null;
                    }


                }
            );
            // check if the connected teacher already has a running game
            // Teacher disconnects
            socket.on("disconnect", function () {
                logger.log('info', `Lost connection to teacher: SID > ${socket.id}, Name > ${teacherUser.name}`);
                const sessionToEnd = connectedTeachers.get(teacherUser.id);
                sessionToEnd.endSession();
        
            });


            // Teacher ends the session
            socket.on("endSession", function (teacherUserId) {
                if (teacherUserId) {
                    logger.log("info", `Beginn Session End via Teacher Client (for user ${teacherUserId}) `)
                    if(connectedTeachers.has(teacherUserId)) {
                        let sessionToEnd =  connectedTeachers.get(teacherUserId) 
                        sessionToEnd.endSession();
                    } else {
                        logger.log("warn", `Seems like the Teacher with id ${teacherUserId} has no active session to end!`);
                    }
                }
            })
            // Clean exit if teacher performs logout
            eventEmitter.get().addListener('session_end', (teacherUserId) => {
                logger.log("info", `Beginn Session End via Logout (for user ${teacherUserId} `)
                if(connectedTeachers.has(teacherUserId)) {
                    let sessionToEnd =  connectedTeachers.get(teacherUserId) 
                    sessionToEnd.endSession();
                } else {
                    logger.log("warn", `Seems like the Teacher with id ${teacherUserId} has no active session to end!`);
                }
                               
            });
        }
    });

    
    

    
    





    // Presenter
    presenterIOs.on('connection', (socket) => {
        logger.log('info', `Presenter connected: SID > ${socket.id}`);


        socket.on("attachPresenter", function () {
            // TODO
        })

        socket.on('disconnect', function () {

        })

    });

    // Student
    studentIOs.on('connection', (socket) => {
        logger.log('info', `Student connected: SID > ${socket.id}`);


        socket.on("getGames", function () {
           
        })

        socket.on("joinGame", function (data) {

            if (data) {
                // logger.log("info", `User ${data.clientName} wants to join a game from teacher with id ${data.teacherId}`);
                // const sessionData = connectedTeachers.get(data.teacherId);
                // currentStudents.players(push({});
                // console.log(currentStudents);
                // connectedTeachers.set(data.teacherId, currentStudents);
                // teacherIOs.emit("updatePlayerlist", data.teacherId);
            }


        });

        socket.on('disconnect', function () {

        })

    });



  


}


