const DanceClass = require('./danceclass.model');
const DanceClassPast = require('./danceclasspast.model');
const Student = require('./student.model');
const DanceStyle = require('./dancestyle.model');
const User = require('./user.model');

exports.getDanceClassModel = ()=>{ return DanceClass };
exports.getDanceClassPastModel = ()=>{ return DanceClassPast };
exports.getStudentModel =  ()=>{ return Student };
exports.getDanceStyleModel =  ()=>{ return DanceStyle };
exports.getUserModel =  ()=>{ return User };