//var cloud = require("vue-d3-cloud");
const Vue = require('vue');
const zingchart = require('zingchart');
const socketIO = require('socket.io-client');
const Swal = require('sweetalert2');

// connect to presenter namespace
const socket = socketIO('/pclient');

const vue = new Vue({
    el: '#presenter',
    data: {
        session: null,
        isRunning: false,
        isActive: true,
        isError: false,
        errorText: "",
        studentList: [],
        // Brainstorming 
        brainstorming: {},
        cloudWordWeight: 200,
        cloudWords: [],
    },
    mounted() {
        socketListen();
    },
    computed: {
        cloudText: function() {
            return this.cloudWords.join(" ");
        },
        students: function() {
            if (this.studentList.length > 0) {
                return this.studentList;
            } else {
                return [{name: "Noch keine Spieler verbunden!"}];
            }
        }

    },
    watch: {
        isActive: (newVal) => {
            if(newVal == true) {
                this.session = null;
                this.isRunning = false;

            }
        },
        isRunning: (newValue) => {
            if(newValue == false) {
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
        studentList: (newValue) => {
            console.log("got new studentList", newValue);
            if(newValue.length > 0) {
                this.studentList = newValue;
            } else {
                this.studentList = [];
            }
        },
        brainstorming: (newValue) => {
            console.log("Brainstorm data updated!", newValue);
            vue.cloudWords = [{"text": vue.session.lecture.topic, "count": 400, "name": "Das heutige Thema!"}];
            newValue.answers.forEach( 
                (answer) => {
                    vue.cloudWords.push({"text": answer.answer, "count": vue.cloudWordWeight, "name": answer.clientName});
                    }
                );
            renderCloud();
        },
     },
    
    methods: {
        sendTest: function() {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        
    },
    filters: {
        capitalize: (value) => {
          if (!value) return ''
          value = value.toString()
          return value.charAt(0).toUpperCase() + value.slice(1)
        }
      },
});

// Brainstorming render Cloud
function renderCloud() {
    zingchart.render({
        id: 'cloud',
        data: {
            type: 'wordcloud',
            options: {
                words: vue.cloudWords,
                aspect: "spiral",
                minFontSize: 30,
                maxFontSize: 60,
                tooltip: {
                    text: '%text: %name',
                    visible: true,
                    
                    alpha: 0.9,
                    backgroundColor: '#1976D2',
                    borderRadius: 2,
                    borderColor: 'none',
                    fontColor: 'white',
                    fontFamily: 'Georgia',
                    textAlpha: 1
                  }
            }
        },
        height: 700,
        width: 700,

    });
}


function socketListen () {
    // Socket connected to server
    socket.on('connect', () => {
        console.log("Connected to server!");
        let sessionId = document.getElementById("presenterId").innerHTML;
        console.log(`Attach myself as Presenter for Session with id ${sessionId}`)
        socket.emit("attachPresenter", sessionId);
        // window.addEventListener('beforeunload', function (e) {
        //     //Cancel the event
        //     e.preventDefault();
        //     // Chrome requires returnValue to be set
        //     e.returnValue = 'HALLO';

        // });

        // Clean exit on closed window
        window.addEventListener('unload', function (event) {
            event.preventDefault();
            socket.emit("presenterLeft", true);
        })
    });

    // Server sends init session data
    socket.on("newSession", (data) => {
        console.log(data);
        vue.session = data.session;
        vue.isRunning = data.isRunning;
        switch (vue.session.type) {
            case "brainstorming":
                
                break;
            case "quizzing":
                
                break;
        
            default:
                break;
        }
    });

    // Server tells the presenter client that the session was started
    socket.on("startSession", (data) => {
        if(data) {
            vue.isRunning = true;
            switch (vue.session.type) {
                case "brainstorming":

                    break;
                case "quizzing":
                    
                    break;
            
                default:
                    break;
            }

        }
    })


    // Sever tells client to update the session object
    socket.on("updateSession", (newSession) => {
        console.log("getting fresh session from server...")
        if(newSession && newSession.id == vue.session.id) {
            vue.session = newSession;
        }
        switch (vue.session.type) {
            case "brainstorming":
                    vue.cloudWords = [];
                for(let answer in JSON.parse(vue.session.lecture.brainstormingJSON)) {
                    vue.cloudWords.push(answer.answer);
                }
                break;
            case "quizzing":
                
                break;
        
            default:
                break;
        }
     });

     socket.on("updateStudentList", (newList) => {
        vue.studentList = newList;
     });

    socket.on('disconnect', () => {
        Swal.fire({
            title: 'Error!',
            text: 'Verbindung verloren!',
            type: 'error',
            confirmButtonText: 'OK'
        })
    });

    socket.on('endSession',(data) => {
        if(data) {
            console.log("Teacher has ended the session!");
            vue.isRunning = false;
            vue.errorText = "Diese Session wurde vom Dozierenden beendet.";
            vue.isError = true;
        }
    });

    socket.on('appError', (error) => {

        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: error.errorMsg,
            footer: 'Bitte an den Support wenden!'
        })

            if(error.fatalError) {
                vue.session = null;
                vue.errorText = error.errorMsg;
                vue.isError = true;
                
            }
        

    })


    /// -------- BRAINSTORMING --------- ///
    socket.on("updateBrainstorm", (data) => {
        vue.brainstorming = data;
    });


}









