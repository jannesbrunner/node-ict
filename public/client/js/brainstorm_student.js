// eslint-disable-next-line no-undef


/* eslint-disable no-undef */
const vue = new Vue({
    el: '#student',
    data: {
        newUser: true,
        gameBrowser: true,
        username: "",
        socket: null,
        games: null,
        game: null,
        gameStarted: false,
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
        games: (oldV, newV) => {
            this.games = newV;
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
                    this.reqRunningGames()
                } else {
                    this.getGameForUser() 
                }
            } else {
                alert("Bitte einen gültigen Username eingeben");
            }
        },
        reqRunningGames: function() {
            socket.emit("reqGames", {} )
        },
        
        joinGame: function(teacherId) {
            console.log("Try to join game of teacher id: " + teacherId);
            socket.emit('joinGame', {clientName: this.username, teacherId: teacherId})
        },
        socketIO: () => {
            socket.on('connect', () => {
                console.log("Connected to server!");

                this.socket = socket;
             });

             socket.on('disconnect', () => {
                alert("Verbindung verloren!");
             });

             socket.on('updateGameList', function(games) {
                 console.log(games);
                 vue.games = games.value;
             })

             socket.on('kicked', function(studentId) {
                 if(vue.game.studentId == studentId) {
                     vue.game = null;
                     vue.gameBrowser = true;
                     alert("Sie wurden aus der Sitzung geworfen!");
                 }
             })
             
             socket.on('gameJoined', function(game) {
                if(game) {
                    vue.game = {type: game.type, teacherId: game.teacherId, studentId: game.studentId};
                    window.addEventListener('beforeunload', function (e) {
                        //Cancel the event
                        e.preventDefault();
                        // Chrome requires returnValue to be set
                        e.returnValue = 'HALLO';
                        
                      });

                    window.onunload = (e) => {
                        socket.emit("gameLeft", {clientName: vue.username, teacherId: game.teacherId, studentId: game.studentId});
                    }
                    
                    // START THE GAME
                    switch (vue.game.type) {
                        case "brainstorming":
                            vue.gameBrowser = false;
                            break;
                        case "quizzing":
                            vue.gameBrowser = false;
                            break;
                        default:
                            // ERROR ?
                            break;
                    }
                }
             });
        }
    },
    
});








