/**
 * SocketIO Client for connected students
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 * WARNING: You need to run "npm run buildClients" to 
 * trigger Browserify generation in order to see 
 * changes in production!
 */
const socketIO = require('socket.io-client');
const Vue = require("vue");
const Swal = require('sweetalert2');

// connect to student client namespace
const socket = socketIO('/sclient');


function initialState() {
    return {
        session: null,
        isRunning: false,
        isActive: true,
        isError: false,
        errorText: "",
        // Student Client
        newUser: true,
        sessionBrowser: true,
        sessions: null,
        studentId: null,
        username: localStorage.username ? localStorage.username : "",
        // Brainstorming
        bsAnswer: "",
        bsAnwers: [],
        // Quizzing
        quizzing: {},
        currentQuestionId: 0,
        givenAnswers: [],
        questionIsAnswered: false,
        questionIsAnsweredWith: 0,
        endQuiz: false,
        quizConclusion: [], 
        quizRight: 0, 
        quizWrong: 0
    }
}

const vue = new Vue({
    el: '#student',
    data: function () {
        return initialState();
    },
    mounted() {
        if (localStorage.username) {
            this.username = localStorage.username;
        }
        socketListen();
    },
    computed: {

    },
    watch: {
        sessions: (newV) => {
            this.sessions = newV;
        },
        isRunning: (newV) => {
            if (newV == false) {
                this.session = null;
                Swal.fire({
                    type: 'warning',
                    title: 'Session Beendet',
                    text: 'Der Lehrende hat diese Session beendet',
                    footer: 'Vielen Dank für das Nutzen von Node ICT!'
                })
            } else {
                Swal.fire({
                    type: 'info',
                    title: 'Gestartet!',
                    text: 'Der Lehrende hat die Session gestartet!',
                    timer: 2000
                })
            }
        }
    },
    methods: {
        resetClient: function (){
            Object.assign(this.$data, initialState());
        },
        signup: function () {
            if (this.username != "") {
                localStorage.username = this.username;
                if (!localStorage.userToken) {
                    socket.emit("registerUser", {
                        name: this.username
                    })
                }
                this.newUser = false;
                if (!localStorage.sessionToken) {
                    this.reqRunningSessions()
                } else {
                    this.getSessionForUser()
                }
            } else {
                Swal.fire({
                    title: 'Spieler Name',
                    text: 'Bitte einen gültigen Spieler Name eingeben',
                    type: 'warning'
                })
            }
        },
        reqRunningSessions: function () {
            socket.emit("getSessions", {})
        },

        joinSession: function (teacherId) {
            console.log("Try to join session of teacher id: " + teacherId);
            socket.emit('joinSession', { clientName: this.username, teacherId: teacherId })
        },

        leaveSession: function () {
            Swal.fire({
                title: 'Wirklich verlassen?',
                text: "Du bist dann kein Teilnehmer dieser Lehreinheit mehr.",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ja, verlassen'
            }).then((result) => {
                if (result.value) {
                    socket.emit("sessionLeft", { clientName: this.username, teacherId: this.session.userId, studentId: this.studentId });
                    this.resetClient();
                    Swal.fire(
                        'Erfolg',
                        'Du hast die Lehreinheit verlassen!',
                        'success'
                    )
                }
            })
            window.removeEventListener('beforeunload', beforeUnload);
        },

        // Brainstorming 
        studentAnswer: function () {
            if (this.bsAnswer.length > 0) {
                socket.emit("newBSAnswer", { answer: this.bsAnswer, id: this.studentId, clientName: this.username });
                this.bsAnswer = "";
                let timerInterval;
                Swal.fire({
                    title: 'Deine Antwort wurde übermittelt!',
                    timer: 2000,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                        timerInterval = setInterval(() => {
                            Swal.getContent().querySelector('strong')
                                .textContent = Swal.getTimerLeft()
                        }, 100)
                    },
                    onClose: () => {
                        clearInterval(timerInterval)
                    }
                }).then((result) => {
                    if (
                        // Read more about handling dismissals
                        result.dismiss === Swal.DismissReason.timer
                    ) {
                        console.log('Dialog closed by timer')
                    }
                })
            }
        },
        // QUIZZING
        quizAnswer: function (answerId) {
            if (!this.questionIsAnswered) {
                Swal.fire({
                    title: 'Bist du sicher?',
                    text: `Frage: ${this.session.lecture.questions[this.currentQuestionId].question}\nDeine Antwort: ${this.session.lecture.questions[this.currentQuestionId]["answer" + answerId]}`,
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Ja! Antwort abgeben.'
                }).then((result) => {
                    if (result.value) {
                        this.questionIsAnswered = true;
                        this.questionIsAnsweredWith = answerId;
                        const answer = {
                            quizzingId: this.session.lecture.questions[this.currentQuestionId].quizzingId,
                            questionId: this.session.lecture.questions[this.currentQuestionId].id,
                            answerId: answerId,
                            studentId: this.studentId,
                            studentName: this.username
                        }
                        this.givenAnswers.push(answer);
                        socket.emit("newAnswer", answer);
                        Swal.fire({
                            timer: 2000,
                            title: 'OK',
                            text: 'Deine Antwort wurde übermittelt',
                            showCancelButton: false,
                            type: 'success'
                        }
                           
                           
                           
                        )
                    }
                })
            } else {
                Swal.fire({
                    title: 'Achtung!',
                    text: 'Du hast diese Frage schon beantwortet!\nWarte auf die nächste Frage!',
                    type: 'warning'
                })
            }
        },
       
    },
    filters: {
        capitalize: (value) => {
          if (!value) return ''
          value = value.toString()
          return value.charAt(0).toUpperCase() + value.slice(1)
        }
      },

});


function socketListen() {
    socket.on('connect', () => {
        console.log("Connected to server!");
    });

    socket.on('disconnect', () => {
        Swal.fire({
            title: 'Error!',
            text: 'Verbindung verloren!',
            type: 'error',
            confirmButtonText: 'OK'
        })
    });

    socket.on('updateSessionsList', function (sessions) {
        console.log(sessions);
        vue.sessions = sessions;
    })

    socket.on('kicked', function (studentId) {
        if (vue.studentId == studentId) {
            Object.assign(vue.$data, initialState());
            Swal.fire(
                'Achtung!',
                'Sie wurden aus der Sitzung geworfen!',
                'warning'
            )
            window.removeEventListener('beforeunload', beforeUnload);
        }

    })

    socket.on('sessionJoined', function (data) {
        if (data) {
            vue.session = data.session;
            vue.studentId = data.studentId;
            window.addEventListener('beforeunload', beforeUnload);

            window.onunload = (e) => {
                socket.emit("sessionLeft", { clientName: vue.username, teacherId: data.session.teacherId, studentId: vue.studentId });
            }

            // START THE GAME
            switch (vue.session.type) {
                case "brainstorming":
                    vue.sessionBrowser = false;

                    break;
                case "quizzing":
                    vue.sessionBrowser = false;
                    vue.quizzing = data.quizzing;
                    break;
                default:
                    // ERROR ?
                    break;
            }
        }
    });
    // Sever tells client to update the session object
    socket.on("updateSession", function (newSession) {
        console.log("getting fresh session from server...", newSession)
        if (newSession && newSession.id == vue.session.id) {
            vue.session = newSession;
        }
    });
    socket.on("updateQuizzing", function (newQuizzing) {
        console.log("Quiz got updated!", newQuizzing);
        vue.quizzing = newQuizzing;
    });


    socket.on("nextQuestion", (data) => {
        vue.currentQuestionId = data.currentQuestionId;
        vue.questionIsAnswered = false;
    });

    socket.on("endQuiz", () => {
            let conclusion = [];
            let rightAnswers = 0;
            let wrongAnswers = 0;
    
                // Right and Wrong answers 
            for(let answer of vue.givenAnswers) {
                for( let question of vue.session.lecture.questions) {
                    if(answer.questionId == question.id && question.validAnswer == answer.answerId) {
                        conclusion.push({
                            question: question.question,
                            validAnswer: question["answer"+question.validAnswer],
                            playerAnswer: question["answer"+answer.answerId],
                            answerCorrect: true
                        })
                        rightAnswers += 1;
                       
                    } else if(answer.questionId == question.id && question.validAnswer != answer.answerId){
                        conclusion.push({
                            question: question.question,
                            validAnswer: question["answer"+question.validAnswer],
                            playerAnswer: question["answer"+answer.answerId],
                            answerCorrect: false
                        })
                        wrongAnswers += 1;
                       
                    }
                }
            }
    
        vue.quizConclusion = conclusion;
        vue.quizRight = rightAnswers;
        vue.quizWrong = wrongAnswers;
        vue.endQuiz = true;

    });
    // teacher ends session
    socket.on("endSession", function (data) {
        if (data == true && vue.session) {
            Object.assign(vue.$data, initialState());
            Swal.fire({
                type: 'warning',
                title: 'Ende',
                text: "Der Lehrende hat die Lehreinheit beendet!",
                footer: 'Danke für das Nutzen von Node ICT!'
            })
            window.removeEventListener('beforeunload', beforeUnload);
        }
    });

    // Server tells the student client that the session was started
    socket.on("startSession", function (data) {
        if (data) {
            vue.isRunning = true;
        }
    })

    socket.on('appError', function (error) {

        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: error.errorMsg,
            footer: 'Bitte an den Support wenden!'
        })

        if (error.fatalError) {
            vue.session = null;
            vue.studentId = null;
            vue.sessionBrowser = false;
            vue.errorText = error.errorMsg;
            vue.isError = true;
            window.removeEventListener('beforeunload', beforeUnload);
        }
    })
}

// Prevent user from accidently closing the browser window
function beforeUnload(e) {
    // Cancel the event
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = '';

    Swal.fire({
        type: 'warning',
        title: 'Ende?',
        text: "Wenn sie das Fenster schließen, gehen möglicherweise Daten verloren!",
        footer: 'Bitte warten bis der Dozierende die Session beendet hat.'
    })

}








