
const socketIO = require('socket.io-client');
const Vue = require("vue");
const Swal = require('sweetalert2');

// connect to student client namespace
const socket = socketIO('/sclient');

/* eslint-disable no-undef */
const vue = new Vue({
    el: '#student',
    data: {
        session: null,
        isRunning: false,
        isActive: true,
        isError: false,
        errorText: "",
        // Student Client
        newUser: true,
        sessionBrowser: true,
        sessions: null,
        studentId: null,
        username: "",
        // Brainstorming
        bsAnswer: ""
    }, 
    mounted() {
        if(localStorage.username) {
            this.username = localStorage.username;
        } 
       socketListen();
    },
    computed: {  
        
    },
    watch: {
        sessions: (newV) => {
            this.sessions = newV;
        },
        isRunning: (newV) => {
            if(newV == false) {
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
                Swal.fire({
                    title: 'Spieler Name',
                    text: 'Bitte einen gültigen Spieler Name eingeben',
                    type: 'warning'
                })
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
              window.removeEventListener('beforeunload', beforeUnload);
        },

        // Brainstorming 
        studentAnswer: function() {
            if(this.bsAnswer.length > 0) {
                socket.emit("newBSAnswer", {answer: this.bsAnswer, id: this.studentId, clientName: this.username});
                this.bsAnswer = "";
                let timerInterval;
                Swal.fire({
                    title: 'Deine Antwort wurde übermittelt!',
                    timer: 2000,
                    onBeforeOpen: () => {
                      Swal.showLoading()
                      timerInterval = setInterval(() => {
                        Swal.getContent().querySelector('strong')
                          .textContent = Swal.getTimerLeft()
                      }, 100)
                    },
                    onClose: () => {
                      clearInterval(timerInterval)
                    }
                  }).then((result) => {
                    if (
                      // Read more about handling dismissals
                      result.dismiss === Swal.DismissReason.timer
                    ) {
                      console.log('Dialog closed by timer')
                    }
                  })
            }
        },

    }
    
});


function socketListen () {
    socket.on('connect', () => {
        console.log("Connected to server!");
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
             vue.isRunning = false;
             Swal.fire(
                'Achtung!',
                'Sie wurden aus der Sitzung geworfen!',
                'warning'
              )
              window.removeEventListener('beforeunload', beforeUnload);
         }

     })
     
     socket.on('sessionJoined', function(data) {
        if(data) {
            vue.session = data.session;
            vue.studentId = data.studentId;
            window.addEventListener('beforeunload', beforeUnload);

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
        console.log("getting fresh session from server...", newSession)
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
            vue.isRunning = false;
            Swal.fire({
                type: 'warning',
                title: 'Ende',
                text: "Der Lehrende hat die Lehreinheit beendet!",
                footer: 'Danke für das Nutzen von Node ICT!'
              })
              window.removeEventListener('beforeunload', beforeUnload);

        }
     });

     // Server tells the student client that the session was started
    socket.on("startSession", function(data) {
        if(data) {
            vue.isRunning = true;
        }
    })

     socket.on('appError', function(error) {

        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: error.errorMsg,
            footer: 'Bitte an den Support wenden!'
          })
        
          if(error.fatalError) {
            vue.session = null;
            vue.studentId = null;
            vue.sessionBrowser = false;
            vue.errorText = error.errorMsg;
            vue.isError = true;
            window.removeEventListener('beforeunload', beforeUnload);
            
        }
    
        
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
        footer: 'Bitte warten bis der Dozierende die Session beendet hat.'
      })

}








