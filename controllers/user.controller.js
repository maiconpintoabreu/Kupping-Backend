const moduleModel = require("../models/module.model");
const User = moduleModel.getUserModel();
var jwt = require('jsonwebtoken');
exports.getUsers = function (req, res) {
    User.find({}, function(err, Users) {
        res.status(200).send(Users || []);
     });
};
exports.login = function (req, res) {
    console.log("Login...",req.body.username);
    User.findOne({"username":req.body.username}, function(err, user) {
        if(err)
        {
            res.status(500).send(err);
        }else if(!user){
            res.status(400).send("Username or Password Invalid");
        }else{

            user.comparePassword(req.body.password, function(err, isMatch) {
                if (err || !isMatch){ res.status(400).send("Username or Password Invalid");}else{
                const token = jwt.sign({
                    data: {id:user._id,organizer:user.organizer,student:user.student}
                }, 'maicon££santanaABwinfqubw123££££££€!!!', { expiresIn: '24h' });
                res.status(200).json({token:token});
            }
        });
        }
     });
};
exports.getUserById = function(id) {
    return User.findOne({_id:id});
}
exports.insertUser = function (req, res) {
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        company: req.body.company,
        student: req.body.student || false,
        organizer: req.body.organizer || false,
        dateCreated: new Date(),
        dateModified: new Date(),
    });
    User.findOne({$or:[{email:user.email},{username:user.username}]}).then(resUser=>{
        if(!resUser){
            user.save(function (err, results) {
                if(err) {
                    console.error("Error",err);
                    res.status(500).send(err);
                }else{
                    const token = jwt.sign({
                        data: {id:results._id,organizer:results.organizer,student:results.student}
                    }, 'maicon££santanaABwinfqubw123££££££€!!!', { expiresIn: '24h' });
                    res.status(200).json({token:token});
                }
            });
        }else{
            if(resUser.email == user.email && resUser.username == user.username){
                res.status(403).send("Email and Username already exists");
            }else if(resUser.email == user.email){
                res.status(403).send("Email already exists");
            }else if(resUser.username == user.username){
                res.status(403).send("Username already exists");
            }
        }
    }).catch(errUser=>{
        res.status(500).json({error:errUser.message});
    });
};