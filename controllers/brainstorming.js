/**
 * Brainstorm Session Controller
 * @author Jannes Brunner
 * @version 1.0
 * @copyright 2019
 */

 const BsSession = require('../models/brainstorming');

 // GET => /teacher/sessions/brainstorming/new 
 exports.getNew = (req, res, next) => {
   
        res.render('teacher/edusessions/brainstorming/new', 
        {
            docTitle: "Neue Brainstromsession | Node ICT",
            isLoggedIn: req.session.isLoggedIn,
            loggedUser: req.session.user,
        });
}

exports.postNew = async (req, res) => {
    try {
        const session = await BsSession.new({
            name: req.body.name,
            topic: req.body.topic,
            ownerId: req.session.user.id
        });
        
        
       
    } catch (error) {
        return res.render('error', { error: error })
    }
    return res.redirect('/teacher/sessions');
   
}
