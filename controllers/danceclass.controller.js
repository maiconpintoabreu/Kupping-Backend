const moduleModel = require("../models/module.model");
const citiesbycountry = require("../models/citiesbycountry").cities;
const DanceClass = moduleModel.getDanceClassModel();
const DanceClassPast = moduleModel.getDanceClassPastModel();
const Student = moduleModel.getStudentModel();
const moment = require('moment');

//TODO:Create a external service for it
const CRON_INTERVAL = 3600000; // 1hour
week_of_month = (date) => {

    prefixes = [1,2,3,4,5];

return prefixes[0 | moment(date).date() / 7] 

}
cronDanceClassRepeat = ()=>{
    console.info("Cron:","Checking for events with repeat");
    DanceClass.find({toDate:{$lt:moment().valueOf()},$or:[{"repeat":"monthly"},{"repeat":"weekly"}]}).then(resDanceClass=>{
        resDanceClass.forEach(element => {
            pastObject = element.toObject();
            pastObject.idRef = pastObject._id;
            pastObject._id = undefined;
            let past = new DanceClassPast(pastObject);
            const countWeeksToDate = week_of_month(moment(element.toDate).endOf("month"));
            const countWeeksFromDate = week_of_month(moment(element.fromDate).endOf("month"));

            if(element.repeat === "monthly"){
                element.toDate = moment(element.toDate).add(countWeeksToDate,"weeks").valueOf();
                element.fromDate = moment(element.fromDate).add(countWeeksFromDate,"weeks").valueOf();
            }else if(element.repeat === "weekly"){
                element.toDate = moment(element.toDate).add(1,"weeks").valueOf();
                element.fromDate = moment(element.fromDate).add(1,"weeks").valueOf();
            }
            element.students = [];
            DanceClassPast.create(past).then(resPast=>{
                element.save(err=>{
                    if(err) console.error("Error current:",err);  
                })
            }).catch(errpast=>{    
                if(errpast) 
                if(errpast.code != 11000 ){
                    console.error("Error past:",errpast);
                }else{
                    element.save(err=>{
                        if(err) console.error("Error current:",err);  
                    })
                }
            })
        });
        console.log("Test:",resDanceClass.length);
    }).catch(errDanceClass=>{
        console.error("Error:",errDanceClass);
    });
    setTimeout(() => {
        cronDanceClassRepeat();
    }, CRON_INTERVAL);
};
cronDanceClassRepeat();
exports.booking = (req,res)=>{
    // TODO: add isPublic
    DanceClass.findOne({_id:req.params.danceclassid}).then(danceClass=>{
        if(danceClass){
            Student.findOne({email:req.body.email,user:danceClass.user}).then(resStudent=>{
                let studentToSave;
                if(resStudent)
                    studentToSave = danceClass.students.find(x=>x == ""+resStudent._id);
                if(studentToSave){
                    res.status(302).send("Email already Saved");
                }else{
                    studentToSave = new Student(req.body);
                    studentToSave.user = danceClass.user;
                    if(!resStudent){
                        studentToSave.save(errSaveStudent=>{
                            if(errSaveStudent){
                                console.error("Error errSaveStudent",errSaveStudent.message);
                                res.status(500).send("Booking Error");
                            }else{
                                danceClass.students.push(studentToSave._id);
                                danceClass.save(errSaveDanceClass=>{
                                    if(errSaveDanceClass){
                                        console.error("Error errSaveDanceClass",errSaveDanceClass.message);
                                        res.status(500).send("Booking Error");
                                    }else{
                                        res.status(200).send({result:"Success"});
                                    }
                                });
                            }
                        });
                    }else{
                        danceClass.students.push(resStudent._id);
                        danceClass.save(errSaveDanceClass=>{
                            if(errSaveDanceClass){
                                console.error("Error errSaveDanceClass",errSaveDanceClass.message);
                                res.status(500).send("Booking Error");
                            }else{
                                res.status(200).send({result:"Success",recurrent:true});
                            }
                        });
                    }
                }
                    
            })
        }else{
            res.status(400).send("Dance Class not found");
        }
     }).catch(errDanceClass=>{
        console.error("Error errDanceClass",errDanceClass.message);
        res.status(500).send("Booking Error");
     });
};
exports.autoCompleteCountry = (req,res)=>{
    res.status(200).send(Object.keys(citiesbycountry).filter(x=>x.toLowerCase().startsWith(req.query.country.toLowerCase())));
}
exports.autoCompleteCity = (req,res)=>{
    const cities = citiesbycountry[req.query.country];
    if(cities){
        res.status(200).send(cities.filter(x=>x.toLowerCase().startsWith(req.query.city.toLowerCase())));
    }else{
        res.status(200).send([]);
    }
}
exports.getDanceClasses = function (req, res) {
    // TODO: add isPublic
    DanceClass.find({}, function(err, danceClasses) {
        res.status(200).send(danceClasses || []);
     }).populate("danceStyle");
};
exports.getDanceClass = function (req, res) {
    DanceClass.findOne({_id:req.params.id}, function(err, danceClass) {
        //filter by public fields
        danceClass.students = null;
        res.status(200).send(danceClass || {});
     }).populate("danceStyle");
};
exports.getPrivateDanceClasses = function (req, res) {
    DanceClass.find({user: req.client.id}, function(err, danceClasses) {
        res.status(200).send(danceClasses || []);
     }).populate("danceStyle");
};
exports.getPrivateDanceClassesByStudent = function (req, res) {
    Student.find({email:req.client.email}, function(errStudent,students){
        let studentParams = [];
        students.forEach(element=>{
            studentParams.push({"students":element._id});
        })
        DanceClass.find({$or:studentParams}, function(err, danceClasses) {
            if(danceClasses) danceClasses.students = [];
            res.status(200).send(danceClasses || []);
        }).populate("danceStyle");
    })
}
exports.getPrivateDanceClass = function (req, res) {
    DanceClass.findOne({_id:req.params.id,user:req.client.id}, function(err, danceClass) {
        res.status(200).send(danceClass || {});
     }).populate("danceStyle").populate("students");
};
exports.insertDanceClass = function (req, res) {
    req.body.user = req.client.id;
    delete(req.body.students);
    if(!req.body.repeat || req.body.repeat === "" || req.body.repeat === "monthly" || req.body.repeat === "weekly" ){
        const danceClass = new DanceClass(req.body);
        danceClass.save(function (err, results) {
            if(err) {
                console.error(err);
                res.status(500).send(err);
            }
            res.status(200).send(results);
        });
    }else{
        res.status(400).send({text:"Invalid Repeat expected '' or monthly or weekly"});
    }
};
exports.deleteDanceClass = function (req, res) {
    DanceClass.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.status(500).send(err.message);
        }else{
            res.status(200).send(JSON.stringify({"text":"DanceClass Deleted"}));
        }
    });
};
exports.updateDanceClass = function (req, res) {
    DanceClass.findOne({_id:req.params.id,user:req.client.id}, function(err, danceClass) {
        if(err){
            res.status(500).send(err.message);
        }else{
            if(!danceClass){
                res.status(404).send(JSON.stringify({"text":"DanceClass Not Found"}));
            }else{
                if(!req.body.repeat || req.body.repeat === "" || req.body.repeat === "monthly" || req.body.repeat === "weekly" ){
                    req.body.students = danceClass.students;
                    danceClass = new DanceClass(req.body);
                    DanceClass.updateOne({"_id":req.params.id},danceClass,function(err2){
                        if(err2){
                            res.status(404).send(JSON.stringify({"text":"DanceClass Not Found"}));
                        }else{
                            res.status(200).send(JSON.stringify({"text":"DanceClass Updated"}));
                        }
                    });
                }else{
                    res.status(400).send({text:"Invalid Repeat expected '' or monthly or weekly"});
                }
            }
        }
     });
};