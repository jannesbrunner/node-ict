const socket = require('../util/socket')
const EduSession = require('../models/eduSession')
const Brainstorming = require('../controllers/games/brainstorming');
const eventEmitter = require('../util/eventEmitter')

module.exports = async () => {



    // Set up namespaces
    const teacher = socket.getIO().of('/tclient');
    const student = socket.getIO().of('/sclient');
    const presenter = socket.getIO().of('/pclient');

    // TEACHER
    teacher.on('connection', (socket) => {
        const teacherUser = socket.request.session.user;
        console.log(`Teacher connected: SID > ${socket.id}, Name > ${teacherUser.name}`);
        // check if the connected teacher already has a running game

        EduSession.getActiveSession(teacherUser.id).then(
            (activeSession) => {
                if (activeSession) {
                    switch (activeSession.type) {
                        case "brainstorming":
                            // TODO Wie geht es ab hier weiter? wirklich Klasse? Denk an DB!
                            return new Brainstorming(socket, activeSession);
                        case "quizzing":
                            // TODO
                            break;
                        default:
                            teacher.emit("error", "Unkwnown Session Type!");
                            throw new Error("Unknown Session Type!");
                    }
                } else {
                    throw new Error("This Teacher has no active session!");
                }
            }
        );

        // Teacher disconnects
        socket.on("disconnect", function () {
            console.log("Lost connection to teacher >", socket.id)
            // TODO Implement game pause     
        });


        // Teacher ends the session
        socket.on("endSession", function (data) {
            if (data) {
                endSession(socket, teacherUser.id).then(() => {
                    // TODO Save the game before deletion
                    // eduGame.save();
                }).catch(error => { console.log(error); })

            }

        })

        // Clean exit if teacher performs logout
        eventEmitter.get().addListener('session_end', () => {
            console.log("End Session via Logout");
            endSession(socket, teacherUser.id).then(() => {
                // TODO Save the game before deletion
                // eduGame.save();
            }).catch(error => { console.log(error); })


        });

    });

    // Presenter
    presenter.on('connection', (socket) => {
        console.log("Hello Presenter with ID > " + socket.id)

        let sessionId;

        socket.on("attachPresenter", function (recSessionId) {
            sessionId = recSessionId;
            if (runningGames.size == 0) {
                console.error("Error, no running Games!");
                socket.emit("error", "Error, no running Games!")
            } else {
                runningGames.forEach((value, key) => {
                    if (value.session == sessionId) {
                        value.addPresenter(socket);
                    }
                })
            }
        })

        socket.on('disconnect', function () {

        })

    });



    async function endSession(socket, teacherId) {
        try {
            const answer = await EduSession.unsetActiveSession(teacherId);
            if (answer) {
                runningGames.delete(teacherId)
                socket.emit("endSession", true);
            }
        } catch (error) {
            socket.emit("error", "Error during disabling session!");
            console.log(error);
            // TODO Impement error hadnling
        }


    }


}


