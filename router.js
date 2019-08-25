var jwt = require('jsonwebtoken');
const router = require("express").Router();
const userController = require('./controllers/user.controller');
const studentController = require('./controllers/student.controller');
const danceClassController = require('./controllers/danceclass.controller');
const danceStyleController = require('./controllers/dancestyle.controller');
const ticketController = require('./controllers/ticket.controller');

router.get('/public/danceclass', danceClassController.getDanceClasses);
router.get('/public/danceclass/:id', danceClassController.getDanceClass);
router.post('/public/danceclass/:danceclassid/booking', danceClassController.booking);
router.get('/public/dancestyle', danceStyleController.getDanceStyles);
router.post('/public/user', checkLogin, userController.insertUser);

router.get('/private/danceclass', checkLogin,checkOrganizerAccess, danceClassController.getPrivateDanceClasses);
router.get('/private/danceclassbystudent', checkLogin,checkOrganizerAccess, danceClassController.getPrivateDanceClassesByStudent);
router.get('/private/danceclass/:id', checkLogin,checkOrganizerAccess, danceClassController.getPrivateDanceClass);
router.put('/private/danceclass/:id', checkLogin,checkOrganizerAccess, danceClassController.updateDanceClass);
router.delete('/private/danceclass/:id', checkLogin,checkOrganizerAccess, danceClassController.deleteDanceClass);
router.get('/private/dancestyle', checkLogin,checkOrganizerAccess, danceStyleController.getPrivateDanceStyles);
router.post('/private/danceclass', checkLogin,checkOrganizerAccess, danceClassController.insertDanceClass);
router.post('/private/danceclass/:id/checkin/:studentId', checkLogin,checkOrganizerAccess, danceClassController.checkin);


router.post('/private/student', checkLogin,checkOrganizerAccess, studentController.insertStudent);
router.post('/private/danceclass/:id/ticket/send', checkLogin,checkOrganizerAccess, ticketController.send);
router.get('/private/student', checkLogin,checkOrganizerAccess, studentController.getStudentes);
router.get('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.getStudent);
router.put('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.updateStudent);
router.delete('/private/student/:id', checkLogin,checkOrganizerAccess, studentController.deleteStudent);

router.get("/private/countries", checkLogin,checkOrganizerAccess, danceClassController.autoCompleteCountry)
router.get("/private/cities", checkLogin,checkOrganizerAccess, danceClassController.autoCompleteCity)
danceStyleController.start();

module.exports = router;

function checkLogin(req,res,next) {
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization.replace("Bearer ",""), 'maicon££santanaABwinfqubw123££££££€!!!', function(err, decoded) {
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
        if(req.client.organizer){
            return next();
        }else{
            res.status(403).send("Only for Organizer account");
        }
    }else{
        res.status(401).send("Token not valid");
    }
}