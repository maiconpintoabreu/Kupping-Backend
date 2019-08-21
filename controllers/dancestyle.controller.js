const moduleModel = require("../models/module.model");
const DanceStyle = moduleModel.getDanceStyleModel();
exports.getPrivateDanceStyles = function (req, res) {
    DanceStyle.find({}, function(err, danceStyle) {
        res.status(200).send(danceStyle || []);
     });
};
exports.getDanceStyles = function (req, res) {
    DanceStyle.find({}, function(err, danceStyle) {
        res.status(200).send(danceStyle || []);
     });
};
exports.start = function(){
    DanceStyle.find({},function(err,danceStyles){
        if(danceStyles.length < 1){
            const danceStyle = new DanceStyle({name : "Forro"});

            danceStyle.save(function (err, results) {
                if(err) {
                    console.error(err);
                }else{
                    console.log("Forro - Started");
                }
            });
        }
        if(danceStyles.length < 2){
            const danceStyle = new DanceStyle({name : "Kizomba"});

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
// exports.insertDanceStyle = function (req, res) {
//     const danceStyle = new DanceStyle({
//         id: req.body.id
//     });
//     danceStyle.save(function (err, results) {
//         if(err) {
//             console.error("Error:",err);
//             res.status(500).send(err);
//         }
//         res.status(200).send(results);
//       });
// };