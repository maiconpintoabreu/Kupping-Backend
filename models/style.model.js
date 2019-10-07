const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let StyleSchema = new Schema({
    name: {type: String, required: true,index: true}
});
module.exports =  mongoose.model("Style",StyleSchema);