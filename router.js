var jwt = require('jsonwebtoken');
const router = require("express").Router();
const userController = require('./controllers/user.controller');
const attendeeController = require('./controllers/attendee.controller');
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
router.get('/private/eventbystudent', checkLogin,checkOrganizerAccess, eventController.getPrivateEventsByAttendee); // TODO: Remove
router.get('/private/eventbyattendee', checkLogin,checkOrganizerAccess, eventController.getPrivateEventsByAttendee);
router.get('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.getPrivateEvent);
router.put('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.updateEvent);
router.delete('/private/event/:id', checkLogin,checkOrganizerAccess, eventController.deleteEvent);
router.get('/private/style', checkLogin,checkOrganizerAccess, styleController.getPrivateStyles);
router.post('/private/event', checkLogin,checkOrganizerAccess, eventController.insertEvent);
router.post('/private/event/:id/checkin/:attendeeId', checkLogin,checkOrganizerAccess, eventController.checkin);


router.post('/private/student', checkLogin,checkOrganizerAccess, attendeeController.insertAttendee); // TODO: Remove
router.post('/private/attendee', checkLogin,checkOrganizerAccess, attendeeController.insertAttendee);
router.post('/private/event/:id/ticket/send', checkLogin,checkOrganizerAccess, ticketController.send);
router.get('/private/event/:id/ticket/qrcode/:attendeeid', checkLogin,checkOrganizerAccess, ticketController.getQRCode);
router.get('/private/student', checkLogin,checkOrganizerAccess, attendeeController.getAttendeees); // TODO: Remove
router.get('/private/student/:id', checkLogin,checkOrganizerAccess, attendeeController.getAttendee); // TODO: Remove
router.put('/private/student/:id', checkLogin,checkOrganizerAccess, attendeeController.updateAttendee); // TODO: Remove
router.delete('/private/student/:id', checkLogin,checkOrganizerAccess, attendeeController.deleteAttendee); // TODO: Remove
router.get('/private/attendee', checkLogin,checkOrganizerAccess, attendeeController.getAttendeees);
router.get('/private/attendee/:id', checkLogin,checkOrganizerAccess, attendeeController.getAttendee);
router.put('/private/attendee/:id', checkLogin,checkOrganizerAccess, attendeeController.updateAttendee);
router.delete('/private/attendee/:id', checkLogin,checkOrganizerAccess, attendeeController.deleteAttendee);

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