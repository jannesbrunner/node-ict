const socket = require('../util/socket')
const EduSession = require('../models/eduSession')

module.exports = async () => {
    
    
const connectedClients = [];

    // TEAHCER
    var teacher = socket.getIO()
    .of('/tclient')
    teacher.on('connection',  (socket) => {
        console.log("Teacher has connected!");
        getActiveSession().then( (data) => {
            if(data) {
                socket.emit('session', data);
            } else {
               socket.emit('session', null);
            }
        }).catch( () => {
            socket.emit('session', null);
        });

        socket.on('endSession', () => {
            console.log("Teacher init end edu-session...");
            EduSession.unsetActiveSession().then( (result) => {
                if(result) {
                    socket.emit("endSession", true);
                }
            }).catch( error => {
                console.log(error);
            })
        })
    });


    // STUDENT
    var student = socket.getIO()
    .of('/sclient')
    student.on('connection',  (socket) => {
        console.log("Student has connected!");
    });

    // PRESENTER
    var presenter = socket.getIO()
    .of('/pclient')
    presenter.on('connection',  (socket) => {
        console.log("Presenter has connected!");
    });

    

}

async function getActiveSession() {
    try {
        const as = await EduSession.getActiveSession();
        return as;
    } catch (error) {
        console.error(error);
        return null;
    }
}
