const EventModel = require('./event.model');
const PastEventModel = require('./pastevent.model');
const StudentModel = require('./student.model');
const StyleModel = require('./style.model');
const CheckinModel = require('./checkin.model');
const UserModel = require('./user.model');

exports.getEventModel = ()=>{ return EventModel };
exports.getPastEventModel = ()=>{ return PastEventModel };
exports.getStudentModel =  ()=>{ return StudentModel };
exports.getStyleModel =  ()=>{ return StyleModel };
exports.getUserModel =  ()=>{ return UserModel };
exports.getCheckinModel =  ()=>{ return CheckinModel };