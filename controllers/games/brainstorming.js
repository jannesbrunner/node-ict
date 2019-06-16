module.exports = class Brainstorming {
    constructor(teacherSocket, session) {
        this.teacherSocket = teacherSocket;
        this.students = []
        this.presenters = []
        this.session = session;
        this.init();
    }

    init() {
        console.log("...");
        this.teacherSocket.emit("session", this.session);
    }

    addPresenter(psocket) {
        console.log("New presenter attached!");
        this.presenters.push(psocket);
    }

    end() {
        this.teacher.emit("endSession", true);   
    }
    save() {
        console.log("Saving game...");
    }
}

