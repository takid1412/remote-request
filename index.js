const log = console.log;

console.log = function () {
    let first_parameter = arguments[0];
    let other_parameters = Array.prototype.slice.call(arguments, 1);

    function formatConsoleDate (date) {
        let hour = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let milliseconds = date.getMilliseconds();

        return '[' +
            ((hour < 10) ? '0' + hour: hour) +
            ':' +
            ((minutes < 10) ? '0' + minutes: minutes) +
            ':' +
            ((seconds < 10) ? '0' + seconds: seconds) +
            '.' +
            ('00' + milliseconds).slice(-3) +
            '] ';
    }

    log.apply(console, [formatConsoleDate(new Date()) + first_parameter].concat(other_parameters));
};

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const {rimrafSync} = require('rimraf');
const svn = require('svn-spawn');

// create new express app and save it as "app"
const app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// create a route for the app
app.get('/ping', (req, res) => {
    res.send('Hello World')
});

// create a route for the app
app.get('/purgeCache', (req, res) => {
    if(!verifiedSignal(req.query.sig)){
        res.status(403).send("Forbidden")
    }else{
        const config = loadConfig('./config/cache_config.json')
        if(!config[req.query.sys]){
            res.status(403).send("Sys not supported");
            return;
        }
        console.log(`removing ${config[req.query.sys]}`)
        const stt = rimrafSync(config[req.query.sys], {
            glob: true
        });
        res.send(buildMessage({error: stt}))
    }
});

// create a route for the app
app.get('/updateSvn', (req, res) => {
    if(!verifiedSignal(req.query.sig)){
        res.status(403).send("Forbiden")
    }else{
        const config = loadConfig('./config/svn_config.json')
        let svn_path = req.query.path;
        if(config[req.query.type]) svn_path = config[req.query.type];

        if(!svn_path){
            res.status(403).send('Invalid svn path');
        }else{
            updateSvn(svn_path, function(err, data){
                res.send(buildMessage({
                    error: err,
                    data: data
                }))
            });
        }

    }
});

const PORT = process.env.PORT || 3000;
// make the server listen to requests
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}/`);
});

const verifiedSignal = sig => sig === process.env.SIGNATURE;

const buildMessage = obj => JSON.stringify(obj);

const updateSvn = (path, callback) => {
    let svn_client = new svn({
        cwd: path,
    });
    svn_client.update(callback);
};

const loadConfig = file => JSON.parse(fs.readFileSync(file, 'utf8'))??{};
