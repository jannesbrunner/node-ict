
const socketIO = require('socket.io-client');
const socket = socketIO('/sclient');
const Vue = require("vue");
const Swal = require('sweetalert2');

/* eslint-disable no-undef */
const vue = new Vue({
    el: '#student',
    data: {
        newUser: true,
        sessionBrowser: true,
        username: "",
        socket: null,
        sessions: null,
        session: null,
        studentId: null,
        gameIsRunning: false,
        fatalAppError: false,
    }, 
    mounted() {
        if(localStorage.username) {
            this.username = localStorage.username;
        } 
       this.socketIO();
    },
    computed: {  
        
    },
    watch: {
        sessions: (oldV, newV) => {
            this.sessions = newV;
        }
    },
    methods: { 
        signup: function() {
            if(this.username != "") {
                localStorage.username = this.username;
                if(!localStorage.userToken) {
                    socket.emit("registerUser", {
                        name: this.username
                    })
                }
                this.newUser = false;
                if(!localStorage.sessionToken) {
                    this.reqRunningSessions()
                } else {
                    this.getSessionForUser() 
                }
            } else {
                wal.fire(
                    'Spieler Name',
                    'Bitte einen gültigen Spieler Name eingeben',
                    'warning'
                  )
            }
        },
        reqRunningSessions: function() {
            socket.emit("getSessions", {} )
        },
        
        joinSession: function(teacherId) {
            console.log("Try to join session of teacher id: " + teacherId);
            socket.emit('joinSession', {clientName: this.username, teacherId: teacherId})
        },

        leaveSession: function() {
            Swal.fire({
                title: 'Wirklich verlassen?',
                text: "Du bist dann kein Teilnehmer dieser Lehreinheit mehr.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, verlassen'
              }).then((result) => {
                if (result.value) {
                    socket.emit("sessionLeft", {clientName: this.username, teacherId: this.session.userId, studentId: this.studentId});
                    this.session = null;
                    this.studentId = null;
                    this.sessionBrowser = true;
                    Swal.fire(
                    'Erfolg',
                    'Du hast die Lehreinheit verlassen!',
                    'success'
                  )
                }
              })
        },

        socketIO: () => {
            socket.on('connect', () => {
                console.log("Connected to server!");

                this.socket = socket;
             });

             socket.on('disconnect', () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Verbindung verloren!',
                    type: 'error',
                    confirmButtonText: 'OK'
                  })
             });

             socket.on('updateSessionsList', function(sessions) {
                 console.log(sessions);
                 vue.sessions = sessions;
             })

             socket.on('kicked', function(studentId) {
                 if(vue.studentId == studentId) {
                     vue.session = null;
                     vue.studentId = null;
                     vue.sessionBrowser = true;
                     Swal.fire(
                        'Achtung!',
                        'Sie wurden aus der Sitzung geworfen!',
                        'warning'
                      )
                 }
             })
             
             socket.on('sessionJoined', function(data) {
                if(data) {
                    vue.session = data.session;
                    vue.studentId = data.studentId;
                    window.addEventListener('beforeunload', function (e) {
                        //Cancel the event
                        e.preventDefault();
                        // Chrome requires returnValue to be set
                        e.returnValue = 'HALLO';
                        
                      });

                    window.onunload = (e) => {
                        socket.emit("sessionLeft", {clientName: vue.username, teacherId: session.teacherId, studentId: vue.studentId});
                    }
                    
                    // START THE GAME
                    switch (vue.session.type) {
                        case "brainstorming":
                            vue.sessionBrowser = false;
                           
                            break;
                        case "quizzing":
                            vue.sessionBrowser = false;
            
                            break;
                        default:
                            // ERROR ?
                            break;
                    }
                }
             });
            // Sever tells client to update the session object
             socket.on("updateSession", function(newSession) {
                if(newSession && newSession.id == vue.session.id) {
                    vue.session = newSession;
                }
             });
             // teacher ends session
             socket.on("endSession", function(data) {
                if(data == true) {
                    vue.session = null;
                    vue.studentId = null;
                    vue.sessionBrowser = true;
                    Swal.fire({
                        type: 'warn',
                        title: 'Ende',
                        text: "Der Lehrende hat die Lehreinheit beendet!",
                        footer: 'Danke für das Nutzen von Node ICT!'
                      })
    
                }
             });

             socket.on('appError', function(error) {

                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: error.errorMsg,
                    footer: 'Bitte an den Support wenden!'
                  })


                
                
                    if(error.fatalError) {
                       //  vue.sessionActive = false;
                    }
                
            })
        }
    },
    
});








