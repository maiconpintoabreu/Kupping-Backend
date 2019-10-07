const mongoose = require('mongoose');
const Place = require('./place.model');
var Slack = require('slack-node');
webhookUri = 'https://hooks.slack.com/services/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';

let slack = new Slack();
slack.setWebhook(webhookUri);

const Schema = mongoose.Schema;
let EventSchema = new Schema({
    name: {type: String, required: true,index: true},
    about: {type: String,index: true},
    fromDate: {type: Number, required: true},
    fromDateMonth: {type: Number, required: false},
    fromDateWeek: {type: Number, required: false},
    fromDateDay: {type: Number, required: false},
    toDate: {type: Number, required: true},
    toDateMonth: {type: Number, required: false},
    toDateWeek: {type: Number, required: false},
    toDateDay: {type: Number, required: false},
    place: { type: Place, ref: 'Place' },
    repeat: { type:String,index:true},
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    danceStyle: { type: mongoose.Schema.Types.ObjectId, ref: 'DanceStyle' },
    dateCreated: {type: Date, required: true, default:new Date()},
    dateModified: {type: Date, required: true, default:new Date()},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
EventSchema.index({user: 1, name: 1}, {unique: true});
EventSchema.post("save",(doc)=>{
    slack.webhook({
      channel: "#kupping-events",
      username: "kuppingbot",
      text: JSON.stringify(doc)
    }, function(err, response) {
      //console.log(response);
    });
    if(doc.repeat === "monthly" || doc.repeat === "weekly"){
      //TODO: add document in some service to renew after "toDate"
    }
});
module.exports =  mongoose.model("Event",EventSchema);