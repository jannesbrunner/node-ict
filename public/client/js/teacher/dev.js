const socketIO = require('socket.io-client');
const Vue = require("vue");
const Swal = require('sweetalert2');
const socket = socketIO('/tclient');


const vue = new Vue({
    el: '#teacher',
    data: {
        socket: null,
        session: null,
        students: [],
        // VUE DOM
        presenterUrl: "",
        sessionActive: false,
        sessionRunning: false,
        quizzing: false,
        brainstorming: false,
    },
    mounted() {
        this.socketIO();
        window.addEventListener('beforeunload', function (e) {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';

            confirm("Wollen Sie wirklich beenden?");
          });
    },
    computed: {
    },
    watch: {
        session: function () {
            if(this.session) {
                this.presenterUrl = `http://${socket.io.engine.hostname}:${socket.io.engine.port}/client/presenter/${this.session.id}`;
            }
           
        }
    },
    methods: {
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
        },
        startSession: function() {
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
        kickStudent: function(studentId) {
            Swal.fire({
                title: 'Spieler rauswerfen?',
                text: "Der Spieler wird aus der Session entfernt.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, entfernen!'
              }).then((result) => {
                if (result.value) {
                    console.log(`Kicking Student with ID: ${studentId}`);
                    socket.emit("kickStudent", {sessionId: this.session.id, studentId: studentId})
                  Swal.fire(
                    'Spieler rausgeworfen!',
                    'Der Spieler ist nicht mehr Teil der Lehrsession.',
                    'success'
                  )
                }
              })
        },
        socketIO: () => {
            socket.on("connect", () => {
                this.socket = socket;
                console.log("(re)connected to server!");
            });
            

            // register events
            
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

            
            socket.on('newSession', function (data) {
                console.log(data, "Got the Session");
                vue.session = data

            });

            // NEW STUFF //TODO
            // Sever tells client to update the session object
            socket.on("updateSession", function(newSession) {
                if(newSession && newSession.id == vue.session.id) {
                    vue.session = newSession;
                }
             });
            // 
            socket.on('appError', function(error) {

                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: error.errorMsg,
                    footer: 'Bitte an den Support wenden!'
                  })


                
                   
                    vue.errorMsg = error.errorMsg;
                    if(error.fatalError) {
                        vue.session = null;
                    }
                
            })

            socket.on("updateStudentList", function(studentList) {
                console.log("Server wants us to update the student list!");
                console.log(studentList);
                vue.students = studentList;
                console.log(vue.students);
                
            })

            

            socket.on('test', (data) => {
                console.log("Received data from Server: ", data.message)
            });


        }
    }
});



