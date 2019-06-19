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

             socket.on('updateGameList', function(games) {
                 console.log("Got new Game list");
                 vue.games = games.value;
             })
             
             socket.on('gameJoined', function(game) {
                if(game) {
                    vue.game = {type: game.type, teacherId: game.teacherId};
                    
                    // START THE GAME
                    switch (vue.game.type) {
                        case "brainstorming":
                            vue.gameBrowser = false;
                            brainstorming.$mount('#game');
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



const brainstorming = new Vue({
    template: `<h1>Hello Brainstorming</h1>`,
    data: {
        socket: null,
    },
    computed: {},
    watch: {},
    methods: {},
})

const quizzing = new Vue({
    template: `<h1>Hello Quizzing</h1>`,
    data: {
        socket: null,
    },
    computed: {},
    watch: {},
    methods: {},
})




