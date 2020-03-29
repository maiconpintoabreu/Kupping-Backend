const PDFDocument = require('pdfkit');
const fs = require('fs');
var qr = require('qr-image');
exports.generateTicket = (user,danceClass,student)=>{
    return new Promise(function(resolve, reject){      
        const path = "/var/tickets/"+user._id+"/"+danceClass._id+"/"+student._id;
        fs.stat(path, function(err, stats) {
            if(!stats || !stats.isDirectory()){
                fs.mkdir(path, { recursive: true }, (err) => {
                    if (err){
                        reject(err);
                    }else{
                        generatePdf(path,user,danceClass,student).then(pdf=>{
                            resolve(pdf);
                        }).catch(errGeneratePdf=>{
                            reject(errGeneratePdf);
                        })
                    }
                });
            }else{
                generatePdf(path,user,danceClass,student).then(pdf=>{
                    resolve(pdf);
                }).catch(errGeneratePdf=>{
                    reject(errGeneratePdf);
                })
            }
        });
    })
}
exports.generateTicketQR = (user,danceClass,student)=>{
    return new Promise(function(resolve, reject){   
        var qrcode = qr.imageSync(student._id.toString(), { type: 'png' });
        if(qrcode){
            resolve(qrcode);
        }else{
            reject("ERROR");
        }
    })
}

function generatePdf(path, user,danceClass,student){
    return new Promise(function(resolve, reject){      
        const doc = new PDFDocument();
        const stream = doc.pipe(fs.createWriteStream(path+'/ticket.pdf'));
        var qrcode = qr.imageSync(student._id.toString(), { type: 'png' });
        
        doc
        .fontSize(25)
        .text(danceClass.name, 100, 100);
        doc
        .fontSize(16)
        .text(danceClass.about);
        
        doc.image(qrcode, {
        align: 'right',
        valign: 'right'
        });
        
        doc.end();
        stream.on('finish', function() {
            resolve(fs.readFileSync(path+"/ticket.pdf"));
        });
        stream.on("error",function(){
            reject("ERROR");
        })
    })
}