module.exports = {
    topic: "",
    users: [],
    answers: [],
    addUser(userName) {
        if(!this.users.includes(userName)) {
            this.users.push(userName)
            return true;
        } else return false;
    },
    removeUser(userName) {
        if(this.users.includes(userName)) {
            for( let i = 0; i < this.users.length; i++){ 
                if ( this.users[i] === 5) {
                    this.users.splice(i, 1); 
                  i--;
                }
            }
            return true;
        } else return false;
    }
}
