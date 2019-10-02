const express = require('express');
const cors = require('cors');
//const http = require('http');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var helmet = require('helmet');
const authRouter = require("./auth-route");
const router = require("./router");
var morgan = require('morgan')


const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan(':date[format] :remote-addr :method :url :status :res[content-length] - :response-time ms'))
const port = process.env.PORT || 8082;
const portSSL = process.env.PORTSSL || 8083;
const mongoUrl = process.env.MONGO || "localhost";
const MONGO_PORT = process.env.MONGO_PORT || "";
const MONGO_PREFIX = process.env.MONGO_PREFIX || "mongodb://";
const MONGO_USER = process.env.MONGO_USER || "kuppinguserusuario";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "123asd123z";
const MONGO_DATABASE = process.env.MONGO_DATABASE || "kupping";
const MONGO_PARAMS = process.env.MONGO_PARAMS || "";
const authValue = MONGO_USER+":"+MONGO_PASSWORD+"@"

function connect () {
    return mongoose.connect(MONGO_PREFIX+authValue+mongoUrl+MONGO_PORT+'/'+MONGO_DATABASE+MONGO_PARAMS,{
    //return mongoose.connect('mongodb://localhost:27017/kupping',{
        useNewUrlParser: true, 
        authSource:"admin" ,
        keepAlive: 1 
        });
}
function reconnect (){
    setTimeout(
        function() {
            connect();
        },10000);
}

connect();

mongoose.connection.on('error', console.error)
    .on('disconnected', reconnect)
    .once('open', listen);

const options = {
    key: fs.readFileSync("certs/privkey.pem"),
    cert: fs.readFileSync("certs/fullchain.pem")
};
      
function listen(){
    app.use(authRouter);
    app.use(router);
    // http.createServer(app).listen(port);
    https.createServer(options,app).listen(portSSL);
    // console.log("Listening port: "+port);
    console.log("Listening port: "+portSSL);
}