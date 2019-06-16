/* eslint-disable no-undef */
socket.on('connect', () => {
   
});


const vue = new Vue({
    el: '#teacher',
    data: {
        sessionName: "",
        sessionType: "",
        sessionActive: true,
        sessionId: "",
        presenterUrl: "http://null"
        
    }, 
    computed: {  
        
    },
    watch: {
    },
    methods: { 
        endSession: function() {
           let wantsToEnd = confirm("Möchten Sie die Lehrsession wirklich beenden?");
            if(wantsToEnd) {
                socket.emit("endSession", true);         
            }
        },
        sendTest: function() {
            socket.emit("test", {
                message: "Hello World!"
            });
        }
    }
});



socket.on('session', function(data) {
    console.log(data, "Session");
    vue.sessionName = data.name;
    vue.sessionType = data.type;
    vue.sessionId = data.id;
    vue.presenterUrl = `http://${socket.io.engine.hostname}:${socket.io.engine.port}/client/presenter/${data.id}`;
    console.log(socket)
})

socket.on('endSession', function(data) {
    if(data) {
        vue.sessionActive = false;
    }
})

socket.on('test', (data) => {
    console.log("Received data from Server: ", data.message)
});

