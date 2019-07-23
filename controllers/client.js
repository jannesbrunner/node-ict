/**
 * Client Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 * Will deliver client HTML and JS to requester
 */

// imports
const ip = require('ip');

// GET => /client/student
exports.getStudent = (req, res) => {
    
        return res.render('client/student',
            {
                docTitle: 'Student | Node ICT',
                ipAdd: ip.address(),
            });
};

// GET => /client/presenter/:sessionId
exports.getPresenter = (req, res) => {
    return res.render('client/presenter', 
        {
            docTitle: 'Presenter | Node ICT',
            presenterId: req.params.sessionId,
            ipAdd: ip.address(),
        }
    );
}

// GET => /client/teacher
exports.getTeacher = (req, res) => {
    return res.render('client/teacher', 
        {
            docTitle: 'Teacher | Node ICT'
        }
    );
}



