const moduleModel = require("../models/module.model");
const Attendee = moduleModel.getAttendeeModel();
exports.getAttendeees = function (req, res) {
    Attendee.find({user:req.client.id}, function(err, attendeees) {
        if(err){
            res.status(500).send(err.message);
        }else{
            res.status(200).send(attendeees || []);
        }
     });
};
exports.getAttendee = function (req, res) {
    Attendee.findOne({_id:req.params.id,user:req.client.id}, function(err, attendee) {
        if(err){
            res.status(500).send(err.message);
        }else{
            res.status(200).send(attendee || {});
        }
     });
};
exports.insertAttendee = function (req, res) {
    const attendee = new Attendee({
        name: req.body.name,
        email: req.body.email,
        user: req.client.id,
    });
    attendee.save(function (err, results) {
        if(err) {
            console.error("Error",err);
            res.status(500).send(err);
        }
        res.status(200).send(results);
      });
};
exports.deleteAttendee = function (req, res) {
    Attendee.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.status(500).send(err.message);
        }else{
            res.status(200).send(JSON.stringify({"text":"Attendee Deleted"}));
        }
    });
};
exports.updateAttendee = function (req, res) {
    Attendee.findById(req.params.id, function(err, attendee) {
        if(err){
            res.status(500).send(err.message);
        }else{
            if(!attendee){
                res.status(404).send(JSON.stringify({"text":"Attendee Not Found"}));
            }else{
                attendee.name = req.body.name;
                Attendee.updateOne({"_id":req.params.id},attendee,function(err2){
                    if(err2){
                        res.status(404).send(JSON.stringify({"text":"Attendee Not Found"}));
                    }else{
                        res.status(200).send(JSON.stringify({"text":"Attendee Updated"}));
                    }
                });
            }
        }
     });
};