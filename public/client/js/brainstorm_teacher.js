/* eslint-disable no-undef */
socket.on('connect', () => {

});


const vue = new Vue({
    el: '#teacher',
    data: {
        socket: null,
        session: null,
        teacherId: null,
        sessionType: "",
        presenterUrl: "",
        sessionActive: true,
        sessionName: "",
        students: [],
        error: false,
        errorMsg: "",

    },
    mounted() {
        this.socketIO();
    },
    computed: {
    },
    watch: {
        session: function () {
            this.presenterUrl = `http://${socket.io.engine.hostname}:${socket.io.engine.port}/client/presenter/${this.session.id}`;
            this.sessionName = this.session.name;
            this.sessionType = this.session.type;
            this.sessionId = this.session.id;
            this.teacherId = this.session.userId;
        }
    },
    methods: {
        connect: function () {
            socket.on('connect', () => {
                console.log("Connected to server!");
                console.log(document.cookie)
                socket.emit("sessionTime", )
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

            socket.on("updatePlayerlist", function(teacherId) {
                console.log("Server wants us to update the player list!");
                if(teacherId) {
                    if(vue.teacherId == teacherId) {
                        socket.emit("getPlayers")
                    }
                }
            })

            socket.on("updatePlayers", function(data) {
                if(data) {
                    console.log("Got new Playerlist: " + data);
                    vue.students = data;
                }
            })

            socket.on('test', (data) => {
                console.log("Received data from Server: ", data.message)
            });


        }
    }
});



