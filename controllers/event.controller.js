const moduleModel = require("../models/module.model");
const citiesbycountry = require("../models/citiesbycountry").cities;
const EventModel = moduleModel.getEventModel();
const PastEventModel = moduleModel.getPastEventModel();
const AttendeeModel = moduleModel.getAttendeeModel();
const CheckinModel = moduleModel.getCheckinModel();
const moment = require('moment');

//TODO:Create a external service for it
const CRON_INTERVAL = 3600000; // 1hour
week_of_month = (date) => {
    prefixes = [1,2,3,4,5];
    return prefixes[0 | moment(date).date() / 7] 
}
// cronEventRepeat = ()=>{
//     console.info("Cron:","Checking for events with repeat");
//     EventModel.find({toDate:{$lt:moment().valueOf()},$or:[{"repeat":"monthly"},{"repeat":"weekly"}]}).then(resEvent=>{
//         resEvent.forEach(element => {
//             pastObject = element.toObject();
//             pastObject.idRef = pastObject._id;
//             pastObject._id = undefined;
//             let past = new PastEventModel(pastObject);
//             const countWeeksToDate = week_of_month(moment(element.toDate).endOf("month"));
//             const countWeeksFromDate = week_of_month(moment(element.fromDate).endOf("month"));

//             if(element.repeat === "monthly"){
//                 element.toDate = moment(element.toDate).add(countWeeksToDate,"weeks").valueOf();
//                 element.fromDate = moment(element.fromDate).add(countWeeksFromDate,"weeks").valueOf();
//             }else if(element.repeat === "weekly"){
//                 element.toDate = moment(element.toDate).add(1,"weeks").valueOf();
//                 element.fromDate = moment(element.fromDate).add(1,"weeks").valueOf();
//             }
//             element.attendees = [];
//             PastEventModel.create(past).then(resPast=>{
//                 element.save(err=>{
//                     if(err) console.error("Error current:",err);  
//                 })
//             }).catch(errpast=>{    
//                 if(errpast) 
//                 if(errpast.code != 11000 ){
//                     console.error("Error past:",errpast);
//                 }else{
//                     element.save(err=>{
//                         if(err) console.error("Error current:",err);  
//                     })
//                 }
//             })
//         });
//         console.log("Test:",resEvent.length);
//     }).catch(errEvent=>{
//         console.error("Error:",errEvent);
//     });
//     setTimeout(() => {
//         cronEventRepeat();
//     }, CRON_INTERVAL);
// };
// cronEventRepeat();
exports.removeBooking = (req, res)=>{
    EventModel.findOne({_id:req.params.eventid}, function(err, event) {
        if(err){
            console.error("Error errEvent",errEvent.message);
            res.status(500).send("Booking Error");
            return;
        }
        if(event){
            for( var i = 0; i < event.attendees.length; i++){ 
                if ( event.attendees[i]+"" === req.params.bookingid) { 
                    console.log(event.attendees[i]);
                    event.attendees.splice(i, 1); 
                }
            }
            event.save(errSaveEvent=>{
                if(errSaveEvent){
                    console.error("Error errSaveEvent",errSaveEvent.message);
                    res.status(500).send("Booking Error");
                }else{
                    res.status(200).send({result:"Success",message:req.params.bookingid+" Removed"});
                }
            });
        }else{
            res.status(400).send("Event not found");
        }
    });

}
exports.booking = (req,res)=>{
    // TODO: add isPublic
    EventModel.findOne({_id:req.params.eventid}, function(err, event) {
        if(err){
            console.error("Error errEvent",errEvent.message);
            res.status(500).send("Booking Error");
            return;
        }
        if(event){
            if(!req.body.email) {
                req.body.email = new Date().getTime()+"";
            }
            AttendeeModel.findOne({email:req.body.email,user:event.user}).then(resAttendee=>{
                let attendeeToSave;
                if(resAttendee)
                    attendeeToSave = event.attendees.find(x=>x == ""+resAttendee._id);
                if(attendeeToSave){
                    res.status(302).send("Email already Saved");
                }else{
                    attendeeToSave = new AttendeeModel(req.body);
                    attendeeToSave.user = event.user;
                    if(!resAttendee){
                        attendeeToSave.save(errSaveAttendee=>{
                            if(errSaveAttendee){
                                console.error("Error errSaveAttendee",errSaveAttendee.message);
                                res.status(500).send("Booking Error");
                            }else{
                                event.attendees.push(attendeeToSave._id);
                                event.save(errSaveEvent=>{
                                    if(errSaveEvent){
                                        console.error("Error errSaveEvent",errSaveEvent.message);
                                        res.status(500).send("Booking Error");
                                    }else{
                                        res.status(200).send({result:"Success"});
                                    }
                                });
                            }
                        });
                    }else{
                        event.attendees.push(resAttendee._id);
                        event.save(errSaveEvent=>{
                            if(errSaveEvent){
                                console.error("Error errSaveEvent",errSaveEvent.message);
                                res.status(500).send("Booking Error");
                            }else{
                                res.status(200).send({result:"Success",recurrent:true});
                            }
                        });
                    }
                }
                    
            })
        }else{
            res.status(400).send("Event not found");
        }
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
exports.getEvents = function (req, res) {
    // TODO: add isPublic
    EventModel.find({}, function(err, events) {
        res.status(200).send(events || []);
     }).populate("style");
};
exports.getEvent = function (req, res) {
    EventModel.findOne({_id:req.params.id}, function(err, event) {
        //filter by public fields
        event.attendees = null;
        res.status(200).send(event || {});
     }).populate("style");
};
exports.getPrivateEvents = function (req, res) {
    EventModel.find({user: req.client.id}, function(err, events) {
        res.status(200).send(events || []);
     }).populate("style");
};
exports.getPrivateEventsByAttendee = function (req, res) {
    AttendeeModel.find({email:req.client.email}, function(errAttendee,attendees){
        let attendeeParams = [];
        attendees.forEach(element=>{
            attendeeParams.push({"attendees":element._id});
        })
        EventModel.find({$or:attendeeParams}, function(err, event) {
            if(event) event.attendees = [];
            res.status(200).send(event || []);
        }).populate("style");
    })
}
exports.getPrivateEvent = function (req, res) {
    EventModel.findOne({_id:req.params.id,user:req.client.id}, function(err, event) {
        res.status(200).send(event || {});
     }).populate("style").populate("attendees");
};
//TODO: make all response send be only 1 method
exports.checkin = function (req, res) {
    console.log("id",req.params.id,"attendeeId",req.params.attendeeId)
    EventModel.findOne({_id:req.params.id,user:req.client.id}, function(err, event) {
        if(event){
            const attendee = event.attendees.find(s=>s._id = req.params.attendeeId);
            if(attendee){
                CheckinModel.findOne({attendee:req.params.attendeeId,event:req.params.id}).then(resCheckinSearch=>{
                    if(resCheckinSearch){
                        res.status(400).send({status:false,message:"Attendee Already Checkedin "+resCheckinSearch.dateCreated});    
                    }else{
                        let checkin = new CheckinModel({attendee:req.params.attendeeId,event:req.params.id});
                        checkin.save(err=>{
                            if(!err){
                                res.status(200).send({status:true,message:"Attendee Checkin Success"});    
                            }else{
                                res.status(500).send({status:false,message:"Error on Checking Checkin"});
                            }
                        })
                    }
                }).catch(errCheckinSearch=>{
                    console.error(errCheckinSearch);
                    res.status(500).send({status:false,message:"Error on Checking Checkin"});    
                })
            }else{
                res.status(404).send({status:true,message:"Attendee Not Found"})    
            }
        }else{
            if(err){
                res.status(500).send(err)    
            }else
            res.status(404).send({status:true,message:"Event Not Found"})   
        }
     }).populate("style").populate("attendees").catch(err=>{
         res.status(404).send(false)
     });
}
exports.insertEvent = function (req, res) {
    req.body.user = req.client.id;
    delete(req.body.attendees);
    if(!req.body.fromDateDay){
        const fromDateMoment = moment(req.body.fromDate);
        req.body.fromDateDay = fromDateMoment.startOf('day');
        req.body.fromDateWeek = fromDateMoment.startOf('week');
        req.body.fromDateMonth = fromDateMoment.startOf('month');
    }
    if(!req.body.toDateDay){
        const toDateMoment = moment(req.body.toDate);
        req.body.toDateDay = toDateMoment.startOf('day');
        req.body.toDateWeek = toDateMoment.startOf('week');
        req.body.toDateMonth = toDateMoment.startOf('month');
    }
    if(!req.body.repeat || req.body.repeat === "" || req.body.repeat === "monthly" || req.body.repeat === "weekly" ){
        const event = new EventModel(req.body);
        event.save(function (err, results) {
            if(err) {
                console.error(err);
                res.status(500).send({status:false,message:err})
            }else{
                res.status(200).send({status:true,message:"Event Created"});
            }
        });
    }else{
        res.status(400).send({status:false,message:"Invalid Repeat expected '' or monthly or weekly"})
    }
};
exports.deleteEvent = function (req, res) {
    EventModel.deleteOne({_id:req.params.id}, function(err){
        if(err){
            res.status(500).send({status:false,message:message})
        }else{
            res.status(200).send({status:true,message:"Event Deleted"})
        }
    });
};
exports.updateEvent = function (req, res) {
    EventModel.findOne({_id:req.params.id,user:req.client.id}, function(err, event) {
        if(err){
            res.status(500).send(err.message);
        }else{
            if(!event){
                res.status(404).send({status:true,message:"Event Not Found"})
            }else{
                if(!req.body.repeat || req.body.repeat === "" || req.body.repeat === "monthly" || req.body.repeat === "weekly" ){
                    req.body.attendees = event.attendees;
                    event = new EventModel(req.body);
                    EventModel.updateOne({"_id":req.params.id},event,function(err2){
                        if(err2){
                            res.status(404).send({status:false,message:"Event Not Found"})
                        }else{
                            res.status(200).send({status:true,message:"Event Updated"})
                        }
                    });
                }else{
                    res.status(400).send({status:false,message:"Invalid Repeat expected '' or monthly or weekly"})
                }
            }
        }
     });
};