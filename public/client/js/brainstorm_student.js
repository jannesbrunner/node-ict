// eslint-disable-next-line no-undef


/* eslint-disable no-undef */
const vue = new Vue({
    el: '#student',
    data: {
        newUser: true,
        username: "",
        socket: null,
        games: null,
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
            console.log(this.games);
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
                    this.getRunningGames()
                } else {
                    this.getGameForUser() 
                }
            } else {
                alert("Bitte einen gültigen Username eingeben");
            }
        },
        getRunningGames: function() {
            socket.emit("getGames", {} )
        },
        getGameForUser: function() {
            // TODO
        },
        joinGame: function(teacherId) {
            console.log("Try to join of teacher id: " + teacherId);
            socket.emit('joinGame', {clientName: this.username, teacherId: teacherId})
        },
        socketIO: () => {
            socket.on('connect', () => {
                console.log("Connected to server!");

                this.socket = socket;
             });

             socket.on('gameList', function(games) {
                 console.log(games);
                 vue.games = games.value;
             })
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




