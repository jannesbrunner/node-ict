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
                    socket.emit("endSession", this.teacherId);
                    Swal.fire(
                    'Beendet',
                    'Ihre Lehrsession wurde beendet!',
                    'success'
                  )
                }
              })
        },
        sendTest: function () {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        kickPlayer: function(playerId) {
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
                    console.log(`Kicking Player with ID: ${playerId}`);
                    socket.emit("kickPlayer", {sessionId: this.session.id, playerId: playerId})
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

                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: error.errorMsg,
                    footer: 'Bitte an den Support wenden!'
                  })


                
                   
                    vue.errorMsg = error.errorMsg;
                    if(error.fatalError) {
                        vue.sessionActive = false;
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



