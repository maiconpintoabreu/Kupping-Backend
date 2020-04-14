var jwt = require('jsonwebtoken');
const router = require("express").Router();
const userController = require('./controllers/user.controller');
const studentController = require('./controllers/student.controller');
const eventController = require('./controllers/event.controller');
const styleController = require('./controllers/style.controller');
const ticketController = require('./controllers/ticket.controller');

router.get('/public/event', eventController.getEvents);
router.get('/public/event/:id', eventController.getEvent);
router.post('/public/event/:eventid/booking', eventController.booking);
router.get('/public/style', styleController.getStyles);
router.post('/public/user', checkLogin, userController.insertUser);

router.delete('/private/event/:eventid/booking/:bookingid', checkLogin,checkOrganizerAccess, eventController.removeBooking);
router.get('/private/event', checkLogin,checkOrganizerAccess, eventController.getPrivateEvents);
router.get('/private/eventbystudent', checkLogin,checkOrganizerAccess, eventController.getPrivateEventsByStudent);
router.get('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.getPrivateEvent);
router.put('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.updateEvent);
router.delete('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.deleteEvent);
router.get('/private/style', checkLogin,checkOrganizerAccess, styleController.getPrivateStyles);
router.post('/private/event', checkLogin,checkOrganizerAccess, eventController.insertEvent);
router.post('/private/event/:id/checkin/:studentId', checkLogin,checkOrganizerAccess, eventController.checkin);


router.post('/private/student', checkLogin,checkOrganizerAccess, studentController.insertStudent);
router.post('/private/event/:id/ticket/send', checkLogin,checkOrganizerAccess, ticketController.send);
router.get('/private/event/:id/ticket/qrcode/:studentid', checkLogin,checkOrganizerAccess, ticketController.getQRCode);
router.get('/private/student', checkLogin,checkOrganizerAccess, studentController.getStudentes);
router.get('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.getStudent);
router.put('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.updateStudent);
router.delete('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.deleteStudent);

router.get("/private/countries", checkLogin,checkOrganizerAccess, eventController.autoCompleteCountry);
router.get("/private/cities", checkLogin,checkOrganizerAccess, eventController.autoCompleteCity);
styleController.start();

module.exports = router;
const jwtSecret = process.env.JWT_SECRET || "maiconSantanaKupping";
function checkLogin(req,res,next) {
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization.replace("Bearer ",""), jwtSecret, function(err, decoded) {
            if(err){
                res.status(401).send(err);
            }else{
                if(decoded.data.id){
                    userController.getUserById(decoded.data.id).then(resUser=>{
                        if(resUser){
                            req.client = resUser;
                            return next();
                        }else{
                            res.status(401).send("Token not valid");



                            
                        }
                    }).catch(errUser=>{
                        res.status(401).send("Token not valid");
                    });
                }else{
                    res.status(401).send("Token not valid");
                }
            }
        });
    }else{
        res.status(400).send("Token Required");
    }
}
function checkOrganizerAccess(req,res,next) {
    if(req.client){
        // if(req.client.organizer){
            return next();
        // }else{
        //     res.status(403).send("Only for Organizer account");
        // }
    }else{
        res.status(401).send("Token not valid");
    }
}