//var cloud = require("vue-d3-cloud");
const Vue = require('vue');
const zingchart = require('zingchart');
/* eslint-disable no-undef */

// Vue.component('vue-word-cloud', VueWordCloud);


const vue = new Vue({
    el: '#presenter',
    data: {
        session: null,
        renderBS: false,
        renderQZ: false,
        cloudWords: [],
    },
    mounted() {
        this.socketIO();
        // Clean exit on closed window
        window.addEventListener('unload', function (event) {
            event.preventDefault();
            socket.emit("presenterLeft", true);
        })
    },
    computed: {
        cloudText: function () {
            return this.cloudWords.join(" ");
        }
    },
    watch: {
    },
    methods: {
        sendTest: function () {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        renderCloud: function () {
            zingchart.render({
                id: 'cloud',
                data: {
                    type: 'wordcloud',
                    options: {
                        text: vue.cloudText,
                    }
                },
                height: 400,
                width: '100%'

            });
        },
        socketIO: function () {
            socket.on('connect', () => {
                console.log("Connected to server!");
                vue.sessionId = document.getElementById("presenterId").innerHTML;
                console.log(`Attach myself as Presenter for Session with id ${vue.sessionId}`)
                socket.emit("attachPresenter", vue.sessionId);
                window.addEventListener('beforeunload', function (e) {
                    //Cancel the event
                    e.preventDefault();
                    // Chrome requires returnValue to be set
                    e.returnValue = 'HALLO';

                });
            });

            socket.on("game", function (data) {
                console.log(data);
                vue.session = data.session;
                switch (vue.session.type) {
                    case "brainstorming":
                        vue.renderBS = true;
                        break;
                    case "quizzing":
                        
                        break;
                
                    default:
                        break;
                }
            });

            socket.on('disconnect', () => {
                Swal.fire({
                    title: 'Error!',
                    text: 'Verbindung verloren!',
                    type: 'error',
                    confirmButtonText: 'OK'
                })
            });

            socket.on('appError', function (error) {

                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: error.errorMsg,
                    footer: 'Bitte an den Support wenden!'
                })

                if (error.fatalError) {
                    //  vue.sessionActive = false;
                }

            })
        }
    },
    filters: {
        capitalize: function (value) {
          if (!value) return ''
          value = value.toString()
          return value.charAt(0).toUpperCase() + value.slice(1)
        }
      }
});










