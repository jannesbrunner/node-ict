/* eslint-disable no-undef */
const vue = new Vue({
    el: '#presenter',
    data: {
        sessionName: "",
        sessionType: "",
        sessionActive: true,
        sessionId: "",
        
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
        }
    }
});




// Listen for Events

// Emit Events

socket.on('connect', () => {
    console.log("Connected to server!");
    socket.emit("attachPresenter", document.getElementById("presenterId").innerHTML);
 });
 



