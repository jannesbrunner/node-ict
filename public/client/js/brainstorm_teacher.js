/* eslint-disable no-undef */
socket.on('connect', () => {

});


const vue = new Vue({
    el: '#teacher',
    data: {
        socket: null,
        session: null,
        teacherId: null,
        presenterUrl: "",
        sessionActive: true,
        students: [],
        error: false,
        errorMsg: "",
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
            this.presenterUrl = `http://${socket.io.engine.hostname}:${socket.io.engine.port}/client/presenter/${this.session.id}`;
            this.sessionId = this.session.id;
            this.teacherId = this.session.userId;
        }
    },
    methods: {
        connect: function () {
            socket.on('connect', (socket) => {
                console.log("Connected to server!");
                this.socket = socket;
            });
        },
        endSession: function () {
            let wantsToEnd = confirm("Möchten Sie die Lehrsession wirklich beenden?");
            if (wantsToEnd) {
                socket.emit("endSession", this.teacherId);
            }
        },
        sendTest: function () {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        kickPlayer: function(playerId) {

            reallyKick = confirm("Wollen Sie den Spieler wirklich entfernen?");
            if(reallyKick) {
                console.log(`Kicking Player with ID: ${playerId}`);
                socket.emit("kickPlayer", {sessionId: this.session.id, playerId: playerId})
            }
        },
        closeError: function() {
            this.error = false;
            this.errorMsg = "";
        },
        socketIO: () => {
            // register events
            socket.on('session', function (data) {
                console.log(data, "Got Session");
                vue.session = data

            });

            socket.on('endSession', function (data) {
                if (data) {
                   vue.sessionActive = false;
                }
            })

            socket.on('appError', function(error) {

                if (error) {
                    console.error("App Error", error.errorMsg);
                    vue.error = true;
                    vue.errorMsg = error.errorMsg;
                    if(error.fatalError) {
                        vue.sessionActive = false;
                    }
                }
            })

            socket.on("updatePlayerList", function(playerList) {
                console.log("Server wants us to update the player list!");
                console.log(playerList);
                vue.students = playerList;
                console.log(vue.students);
                
            })

            

            socket.on('test', (data) => {
                console.log("Received data from Server: ", data.message)
            });


        }
    }
});



