const mongoose = require('mongoose');
var Slack = require('slack-node');
webhookUri = 'https://hooks.slack.com/services/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';
let slack = new Slack();
slack.setWebhook(webhookUri);

const Schema = mongoose.Schema;
let StudentSchema = new Schema({
    name: {type: String, required: true,index: true},
    email: {type: String, required: true,index: true},
    dateOfBirth: {type: String, required: false},
    dateCreated: {type: Date, required: true, default:new Date()},
    dateModified: {type: Date, required: true,default:new Date()},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
StudentSchema.index({user: 1, email: 1}, {unique: true});
StudentSchema.post("save",(doc)=>{
    slack.webhook({
      channel: "#kupping-events",
      username: "kuppingbot",
      text: JSON.stringify(doc)
    }, function(err, response) {
      //console.log(response);
    });
});
module.exports =  mongoose.model("Student",StudentSchema);