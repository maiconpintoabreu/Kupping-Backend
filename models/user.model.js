const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;
var Slack = require('slack-node');
webhookUri = 'https://hooks.slack.com/services/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';

let slack = new Slack();
slack.setWebhook(webhookUri); 
let UserSchema = new Schema({
    email: {type: String, required: true,unique: true,index: true},
    username: {type: String, required: true,unique: true,index: true},
    password: {type: String, required: true},
    company: {type: String, required: true},
    student: {type: Boolean, required: true},
    organizer: {type: Boolean, required: true},
    students: [{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}],
    danceClass: [{type: mongoose.Schema.Types.ObjectId, ref: 'DanceClass', index: true}],
    dateCreated: {type: Date, required: true, default:new Date()},
    dateModified: {type: Date, required: true, default:new Date()},
});


UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// UserSchema.post("save",(doc)=>{
//     let docWithoutPassword = {password:""};
//     docWithoutPassword = Object.assign(doc,docWithoutPassword);
//     // slack.webhook({
//     //   channel: "#kupping-events",
//     //   username: "kuppingbot",
//     //   text: JSON.stringify(docWithoutPassword)
//     // }, function(err, response) {
//     //   //console.log(response);
//     // });
// });
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
module.exports =  mongoose.model("User",UserSchema);