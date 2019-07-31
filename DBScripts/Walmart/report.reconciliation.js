"use strict;"
var Mongoose = require("mongoose");
const readline = require('readline');
var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsonexport = require('jsonexport');
var moment = require("moment");
const http = require("http");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });


var wmfIntergration = require("wmfintegration");
wmfIntergration = new wmfIntergration();
wmfIntergration.init({ 'PROD_ENV': true }, null);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


// #. Mongo URL's
var dbURLs = [
    // 0 - LIVE
    `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`,// SSH TUNNEL TO LIVE,
    // 1 - STAGING
    "mongodb://10.0.1.102:27017/skstaging", // STAGING - 2
    // 2 - LOCAL
    "mongodb://localhost:27017/multiWh", // LOCAL -3
]

var db = null;

var options = { "useNewUrlParser": true };

const token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjM0NzVlNmRkNDMxOTUyMTRjZDg2MzMiLCJ1c2VybmFtZSI6IjkxMTMwMzMyOTgiLCJsbERhdGUiOiIyMDE5LTA2LTE5VDA2OjE3OjU1LjQ0OVoiLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNTZWxsZXIiOmZhbHNlLCJlbXBsb3llZSI6IkVNUDc2OSIsIndhcmVob3VzZXMiOlsiV01GMCJdLCJub3RpZmljYXRpb24iOnsiQWNjb3VudCBDcmVhdGlvbiI6ZmFsc2UsIlJlc2V0IFBhc3N3b3JkIjpmYWxzZX0sImltYWdlIjpbXSwidXNlclR5cGUiOiJFbXBsb3llZSIsInJlc2V0UGFzc3dvcmQiOmZhbHNlLCJjcmVhdGVkQXQiOnRydWUsImxhc3RVcGRhdGVkIjoiMjAxOS0wNi0xM1QxMzoyNDo0OS40NzNaIiwicmVmSWQiOiJFTVA3NjkiLCJuYW1lIjoiQW1hbiIsImVuYWJsZU90cCI6dHJ1ZSwicGxhdGZvcm0iOiJXZWIiLCJ3aERldGFpbHMiOnsid2hJZHMiOlsiV01GMyIsIldNRjQiLCJXTUYyIiwiV01GMSIsIldNRjAiLCJXTUY1IiwiV01GNiIsIldNRjciLCJXTUY5Il0sImRlZmF1bHRXaElkIjoiV01GNSJ9LCJyb2xlSWQiOiJST0xFMSIsImlhdCI6MTU2MTAzMDAyNSwiZXhwIjoxNTYxMTE2NDI1fQ.iAdY7XhGuIqi-A3_X70A8_cNwXqxlf55pMroTqxdI5Q";

(function init() {

    console.log(chalker.green.bold(`#. Script Started ................................................................................`));

    async.waterfall([
        _askConnectionOptions(),
        _runScript
    ], function (err, result) {
        if (err) {
            console.log(chalker.red.bold(`#.SCRIPT TERMINATED : ------------------------------- `, err.message));
            process.exit();
        } else {
            console.log(chalker.green.bold(`#.SCRIPT Completed : -------------------------------`, result));
            process.exit();
        }
    });

})();



function _askConnectionOptions() {
    return function (callback) {
        console.log(chalker.yellow.bold(`\n Choose Mongo connection : \n`));

        rl.question(chalker.green.bold(
            `
                [1] Live 
                [2] Staging 
                [3] Local 
            `
        ), answer => {
            console.log("Option entered is : ", parseInt(answer));
            var url = dbURLs[parseInt(answer - 1)];

            if (url) {
                Mongoose.connect(url, options);
                db = Mongoose.connection;

                db.on('error', function () {
                    callback(new Error(`Connection error ........`));
                });

                db.once('open', function () {
                    console.log("Connection established to : ", url);
                    callback(null);
                });

            } else {
                callback(new Error(`Invalid option entered `, answer));
            }
        });

    }
}

function _runScript(params, callback) {
    var path = `/api/oms/v1/walmart/report`;
    _fire(path,'GET',null).then().catch(e => {
        callback(e);
    })
}


function generateFile(payload) {
    jsonexport(payload, function (err, csv) {
        if (csv) {
            let _path = path.join(__dirname, `report-${moment(new Date()).format("DD/MM/YYYY hh:mm:ss")}`);
            console.log(chalker.yellow("CSV created successfully...", _path));
            fs.writeFileSync(_path, csv);
        }
    });
}



function _fire(_path, _method, _payload) {
    return new Promise((resolve, reject) => {
        if (!_path) {
            reject(`Path cannot be empty for HTTP request.`);
            return;
        }
        if (!_method) {
            reject(`Http Method cannot be empty for HTTP request.`);
            return;
        }
        var options = {};

        options.hostname = "newerp.storeking.in";
        options.port = '8080';
        options.headers = {
            "content-type": "application/json",
            "authorization": token
        };
        options.path = _path//"/api/wh/v1" + _path;
        options.method = _method;


        var request = http.request(options, response => {
            var data = "";
            response.on('data', _data => data += _data.toString());
            response.on('end', () => {
                if (response.statusCode == 200) {
                    try {
                        if (data) {
                            resolve(JSON.parse(data));
                        } else {
                            resolve();
                        }
                    } catch (e) {
                        console.log("Fire http error ----------------", JSON.parse(e));
                        console.log("Fire http error --------", e);
                        reject(JSON.parse(e));
                    }
                } else {
                    console.log("Invalid response code of  --------", response.statusCode, data);
                    reject(new Error(JSON.parse(data)));
                }

            });
        });
        if ((_method === 'POST' || _method === 'PUT') && !_.isEmpty(_payload))
            request.end(JSON.stringify(_payload));
        else
            request.end();

        request.on('error', (e) => {
            console.log("Request error : ", e);
        })
    });
}
