const moduleModel = require("../models/module.model");
const StyleModel = moduleModel.getStyleModel();
exports.getPrivateStyles = function (req, res) {
    StyleModel.find({}, function(err, style) {
        res.status(200).send(style || []);
     });
};
exports.getStyles = function (req, res) {
    StyleModel.find({}, function(err, style) {
        res.status(200).send(style || []);
     });
};
exports.start = function(){
    StyleModel.find({},function(err,styles){
        if(styles.length < 1){
            const style = new StyleModel({name : "Forro"});

            style.save(function (err, results) {
                if(err) {
                    console.error(err);
                }else{
                    console.log("Forro - Started");
                }
            });
        }
        if(styles.length < 2){
            const danceStyle = new StyleModel({name : "Kizomba"});

            danceStyle.save(function (err, results) {
                if(err) {
                    console.error(err);
                }else{
                    console.log("Kizomba - Started");
                }
            });
        }
    });
}