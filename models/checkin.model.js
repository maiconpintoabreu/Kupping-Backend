const mongoose = require('mongoose');
// var Slack = require('slack-node');
// webhookUri = 'https://hooks.slack.com/services/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';
// let slack = new Slack();
// slack.setWebhook(webhookUri);

const Schema = mongoose.Schema;
let CheckinSchema = new Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event',index:true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee',index:true },
    dateCreated: {type: Date, required: true, default:new Date()},
    dateModified: {type: Date, required: true,default:new Date()}
});
CheckinSchema.index({event: 1, attendee: 1}, {unique: true});
// CheckinSchema.post("save",(doc)=>{
//     slack.webhook({
//       channel: "#kupping-events",
//       username: "kuppingbot",
//       text: JSON.stringify(doc)
//     }, function(err, response) {
//       //console.log(response);
//     });
// });
module.exports =  mongoose.model("Checkin",CheckinSchema);