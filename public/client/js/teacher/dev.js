/**
 * SocketIO Client for connected teachers
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 * WARNING: You need to run "npm run buildClients" to 
 * trigger Browserify generation in order to see 
 * changes in production!
 */

const socketIO = require('socket.io-client');
const Vue = require("vue");
const Swal = require('sweetalert2');

// Join the teacher namespace
const socket = socketIO('/tclient');

const vue = new Vue({
    el: '#teacher',
    data: {
        session: null,
        isRunning: false,
        isActive: true,
        isError: false,
        errorText: "",
        zoomLevel: 50,

        students: [],
        // VUE DOM
        presenterUrl: "",

        // Brainstorming 
        brainstorming: {},
        cloudWords: [],

        // Quizzing
        quizzing: {},
        receivedAnswers: 0,
        currentQuestionId: 0,
        quizConclusion: false,
        quizStatistics: {},

    },
    mounted() {
        socketListen();
        window.addEventListener('beforeunload', beforeUnload);
    },
    computed: {
        
    },
    watch: {
        session: function (newSession) {
            if (newSession) {
                this.session = newSession;
                this.presenterUrl = `http://${socket.io.engine.hostname}:${socket.io.engine.port}/client/presenter/${this.session.id}`;
            }

        },
        isRunning: (newV) => {
            if (newV == false) {
                this.session = null;
                Swal.fire({
                    type: 'warning',
                    title: 'Session Beendet',
                    text: 'Der Lehrende hat diese Session beendet',
                    footer: 'Vielen Dank für das Nutzen von Node ICT!'
                })
            } else {
                Swal.fire({
                    type: 'info',
                    title: 'Gestartet!',
                    text: 'Der Lehrende hat die Session gestartet!',
                    timer: 2000
                })
            }
        },
        brainstorming: (newValue) => {
            console.log("Brainstorm data updated!", newValue);
            this.cloudWords = [...newValue.answers]
            console.log(this.cloudWords);
        },
        quizzing: (newValue) => {
            console.log("Quizzing data updated!", newValue);
            this.quizzing = newValue;
            console.log(this.quizzing);
        }
    },
    methods: {
        displayInfo: function (info) {
            Swal.fire({
                position: 'top-end',
                type: 'success',
                title: info,
                showConfirmButton: false,
                timer: 1500,
                backdrop: 'rgba(0,0,0,0)'
            })
        },
        endSession: function () {
            Swal.fire({
                title: 'Beenden?',
                text: "Möchten Sie die Lehrsession beenden?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, beenden'
            }).then((result) => {
                if (result.value) {
                    socket.emit("endSession", this.session.userId);
                    vue.session = null;
                    Swal.fire(
                        'Beendet',
                        'Ihre Lehrsession wurde beendet!',
                        'success'
                    )
                }
            })
            window.removeEventListener('beforeunload', beforeUnload);
        },
        startSession: function () {
            Swal.fire({
                title: 'Starten?',
                text: "Möchten Sie die Lehrsession starten? Weitere Schülerinnen und Schüler können nicht mehr beitreten!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, starten!'
            }).then((result) => {
                if (result.value) {
                    socket.emit("startSession", this.session.userId);
                }
            })
        },
        sendTest: function () {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        kickStudent: function (studentId, studentName) {
            Swal.fire({
                title: `Spieler ${studentName} rauswerfen?`,
                text: `Spieler ${studentName} wird aus der Session entfernt.`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, entfernen!'
            }).then((result) => {
                if (result.value) {
                    console.log(`Kicking Student with ID: ${studentId}`);
                    socket.emit("kickStudent", { sessionId: this.session.id, studentId: studentId, studentName: studentName })
                    Swal.fire(
                        `Spieler ${studentName} rausgeworfen!`,
                        'Der Spieler ist nicht mehr Teil der Lehrsession.',
                        'success'
                    )
                }
            })
        },
        zoom: function(mode) {
            mode == 1 ? this.zoomLevel += 2 : this.zoomLevel -= 2;
            socket.emit("changePzoomLevel", this.zoomLevel);
         },

        // Brainstorming
        removeAnswer: function (answer, clientId) {
            console.log(`Removing answer '${answer}' by sId ${clientId}`);
            socket.emit("removeAnswer", { answer, clientId });


            for (let index = 0; index < this.brainstorming.answers.length; index++) {
                const element = this.brainstorming.answers[index];
                if (element.answer == answer && element.id == clientId) {
                    this.brainstorming.answers.splice(index, 1);
                    break;
                }

            }

            socket.emit('updateBrainstorming', this.brainstorming);

        },

        // Quizzing
        nextQuestion: function () {
            Swal.fire({
                title: 'Nächste Frage stellen?',
                text: this.receivedAnswers == this.students.length ? `Schülerinnen und Schüler erhalten die nächste Antwort` : `Es haben noch nicht alle Schülerinnen und Schüler geantwortet!`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, nächste Frage!'
            }).then((result) => {
                if (result.value) {
                    this.receivedAnswers = 0;
                    socket.emit("nextQuestion", true);
                    Swal.fire(
                        'Erfolg!',
                        'Die nächste Frage ist nun in der Befragungsrunde.',
                        'success'
                    )
                }
            })
        },
        endQuiz: function () {
            Swal.fire({
                title: 'Auswertung starten?',
                text: this.receivedAnswers == this.students.length ? `Quiz beenden und Auswertung starten.` : `Es haben noch nicht alle Schülerinnen und Schüler geantwortet!`,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, Quiz beenden.'
            }).then((result) => {
                if (result.value) {
                    this.receivedAnswers = 0;
                    socket.emit("endQuiz", true);
                    
                }
            })
        },


    }


});



function socketListen() {

    socket.on("connect", () => {
        console.log("(re)connected to server!");
    });


    socket.on('disconnect', () => {
        Swal.fire({
            title: 'Error!',
            text: 'Verbindung verloren!',
            type: 'error',
            confirmButtonText: 'OK',
            showCloseButton: false,
            allowOutsideClick: false,
        })
    });

    // Server sent inital session object
    socket.on('initSession', function (data) {
        console.log(data, 'init session object received!');
        vue.session = data.session
        switch (vue.session.type) {
            case "brainstorming":
                console.log(data.brainstorming, "GOT BS data from Server");
                vue.brainstorming = data.brainstorming
                break;
            case "quizzing":
                console.log(data.quizzing, "GOT QZ data from Server");
                vue.quizzing = data.quizzing
                break;
            default:
                vue.errorText = "Fehler! Unbekannter Spiel Typ!"
                vue.isError = true;
                break;
        }
    });

    // Sever tells client to update the session object
    socket.on("updateSession", function (newSession) {
        console.log("getting fresh session from server...", newSession)
        if (newSession && newSession.id == vue.session.id) {
            vue.session = newSession;
        }
    });
    // Server tells the teacher client that the session was started
    socket.on("startSession", function (data) {
        if (data) {
            vue.isRunning = true;
        }
    })
    socket.on('appError', function (error) {

        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: error.errorMsg,
            footer: 'Bitte an den Support wenden!'
        })
        if (error.fatalError) {
            vue.session = null;
            vue.errorText = error.errorMsg;
            vue.isError = true;
            window.removeEventListener('beforeunload', beforeUnload);

        }

    })

    socket.on("updateStudentList", function (studentList) {
        console.log("Server wants us to update the student list!");
        console.log(studentList);
        vue.students = studentList;
        console.log(vue.students);

    })



    socket.on('test', (data) => {
        console.log("Received data from Server: ", data.message)
    });

    // BRAINSTORMING
    socket.on('updateBrainstorming', (data) => {
        console.log("Got new BS Object!");
        if (vue.isRunning) {
            vue.brainstorming = data;
        }
    });

    // QUIZZING
    socket.on('updateQuizzing', (data) => {
        console.log("Got new QZ Object!");
        if (vue.isRunning) {
            vue.quizzing = data;
        }
    });
    socket.on('nextQuestion', (data) => {
        vue.currentQuestionId = data.currentQuestionId;
        vue.receivedAnswers = 0;
    })
    socket.on('endQuiz', (data) => {
        vue.quizzing = data.givenAnswers;
        console.log("Got Quiz Statistics", data.statistics);
        vue.quizStatistics = data.statistics;
        vue.quizConclusion = true;
    })
    socket.on('newAnswer', (answer) => {
        vue.receivedAnswers += 1;
        vue.displayInfo(`${answer.studentName} hat geantwortet.`);
    })
}

// Prevent user from accidently closing the browser window
function beforeUnload(e) {
    // Cancel the event
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = '';

    Swal.fire({
        type: 'warning',
        title: 'Ende?',
        text: "Wenn sie das Fenster schließen, gehen möglicherweise Daten verloren!",
        footer: 'Bitte beenden Sie die Session vorher.'
    })

}




