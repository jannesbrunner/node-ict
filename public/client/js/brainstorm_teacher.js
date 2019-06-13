/* eslint-disable no-undef */
socket.on('connect', () => {
   
});


const vue = new Vue({
    el: '#teacher',
    data: {
        sessionName: "",
        sessionType: "",
        sessionActive: true,
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
        }
    }
});



socket.on('session', function(data) {
    console.log(data, "Session");
    vue.sessionName = data.name;
    vue.sessionType = data.type;
})

socket.on('endSession', function(data) {
    if(data) {
        vue.sessionActive = false;
    }
})

