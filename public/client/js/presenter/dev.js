var cloud = require("vue-d3-cloud");

/* eslint-disable no-undef */


const vue = new Vue({
    el: '#presenter',
    data: {
        sessionId: "",
        type: "",
        teacherId: null,
        isRunning: false,
        words: [['Das', 19], ['Ist', 3], ['ein', 7], ['Test', 3]],
        enterAnimation: {
            opacity: 0,
            transform: 'scale3d(0.3,0.3,0.3)'},
        
        
    },
   
    mount() {
        
    }, 
    computed: {  
        
    },
    watch: {
    },
    methods: { 
        sendTest: function() {
            socket.emit("test", {
                message: "Hello World!"
            });
        },
        onWordClick: function(word) {
            alert(word);
        }
    }
});




// Listen for Events
socket.on("game", function(data) {
    console.log(data);
    vue.sessionId = data.id;
    vue.type = data.type;
    vue.teacherId = data.teacherId;
    vue.isRunning = data.isRunning; 
});

socket.on('disconnect', () => {
    Swal.fire({
        title: 'Error!',
        text: 'Verbindung verloren!',
        type: 'error',
        confirmButtonText: 'OK'
      })
 });

// Emit Events
window.addEventListener('unload', function(event) {
    event.preventDefault();
    socket.emit("presenterLeft", true);
})

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

 alert("hallo");
 



