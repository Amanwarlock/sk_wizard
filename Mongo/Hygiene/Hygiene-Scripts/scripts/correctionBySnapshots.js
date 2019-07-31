/* 
- Used to mark stocks 0 for a given snapshot:
- USE CASE: If grn failed and stock is in DOCk. Can be corrected using this script;

*/

"use strict;"
var Mongoose = require("mongoose");
var http = require("http");
const readline = require('readline');
var cuti = require("cuti");
var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsonexport = require('jsonexport');
var moment = require("moment");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var token = `JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjM0NzVlNmRkNDMxOTUyMTRjZDg2MzMiLCJ1c2VybmFtZSI6IjkxMTMwMzMyOTgiLCJsbERhdGUiOiIyMDE5LTA3LTI1VDEyOjI1OjQyLjA4M1oiLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNTZWxsZXIiOmZhbHNlLCJlbXBsb3llZSI6IkVNUDc2OSIsIndhcmVob3VzZXMiOlsiV01GMCJdLCJub3RpZmljYXRpb24iOnsiQWNjb3VudCBDcmVhdGlvbiI6ZmFsc2UsIlJlc2V0IFBhc3N3b3JkIjpmYWxzZX0sImltYWdlIjpbXSwidXNlclR5cGUiOiJFbXBsb3llZSIsInJlc2V0UGFzc3dvcmQiOmZhbHNlLCJjcmVhdGVkQXQiOnRydWUsImxhc3RVcGRhdGVkIjoiMjAxOS0wNy0xMlQxMDo1OTozOS44MjhaIiwicmVmSWQiOiJFTVA3NjkiLCJuYW1lIjoiQW1hbiIsImVuYWJsZU90cCI6dHJ1ZSwicGxhdGZvcm0iOiJXZWIiLCJ3aERldGFpbHMiOnsid2hJZHMiOlsiV01GMyIsIldNRjQiLCJXTUYyIiwiV01GMSIsIldNRjAiLCJXTUY1IiwiV01GNiIsIldNRjciLCJXTUY5Il0sImRlZmF1bHRXaElkIjoiV01GOSJ9LCJyb2xlSWQiOiJST0xFMSIsImlhdCI6MTU2NDEyMTE4MSwiZXhwIjoxNTY0MjA3NTgxfQ.707cPT4WwKLCrh24NNhWglJMIb6va0jDSjiK-VOHrOA`;

var dbURLs = [
    // 0 - LIVE 
    `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`,
    // 1 - STAGING 
    `mongodb://10.0.1.102:27017/skstaging`,
    // 2 - DEV
    `mongodb://devUser:${encodeURIComponent('xMsUHM8C29cMXuVT')}@52.66.151.182:27017/skDev`,
    // 3 - QA
    `mongodb://skQAUser:${encodeURIComponent('g6PELBMenXazvyWP')}@13.126.75.175:27017/skDev`,
    // 4 - LOCAL 
    `mongodb://localhost:27017/multiWh`,
];

var httpOptions = [
    // 0 - LIVE
    {
        hostName: `newerp.storeking.in`,
        port: '8080',
        headers: {
            "content-type": "application/json",
            "authorization": token
        }
    }
]

var db = null;

var httpOption = null;

var options = { "useNewUrlParser": true };


const sourceFileName = `/Physical.csv`;

/*  INIT  */
(function () {
    console.log(chalker.yellow.bold(`Initializing Database Connection .............`));

    rl.question(
        `\n
        #. Choose option to connect to database : 

        |---------------------------------------------------------------------------------------------|

            [1] LIVE
            [2] STAGING
            [3] DEV
            [4] QA
            [5] LOCAL

        |---------------------------------------------------------------------------------------------|
         \n
        `,
        answer => {
            var answer = parseInt(answer);

            if (answer >= 1 && answer <= 5) {
                const url = dbURLs[answer - 1];
                if (url) {
                    Mongoose.connect(url, options);
                    db = Mongoose.connection;

                    db.on('error', function (e) {
                        console.log(chalker.red.bold(`Error occured while connecting to database `, e));
                        process.exit(1);
                    });

                    db.once('open', function () {
                        console.log(chalker.blue.bold(`Connection Established to Database : ${url}`));
                        httpOption = httpOptions[answer - 1];
                        run();
                    });

                } else {
                    console.log(chalker.red.bold(`Invalid option entered .............`));
                    process.exit(1);
                }
            } else {
                console.log(chalker.red.bold(`Invalid option entered .............`));
                process.exit(1);
            }
        }
    );

})();


/* MAIN ENTRY POINT - WRITE BUSINESS LOGIC HERE */
function run() {
    console.log(chalker.blue.bold(`SCRIPT STARTED : ---------------------------------------------------------------`));

    var params = {};

    async.waterfall([
        _enterSnapShotIds(params),
        _enterRemarks,
        _fetchInventories,
        _executeCorrection
    ], function (err, result) {
        if (err) {
            console.log(chalker.red.bold(`Error Occured , Terminating Script ------------------------------------------ `, err));
            process.exit(1);
        } else {
            console.log(chalker.green.bold(`Script Completed Successfully -----------------------------------------------`));
            process.exit();
        }
    });
}

function _enterSnapShotIds(params) {
    return function (callback) {
        rl.question(chalker.green.bold(`Enter Snapshot Ids [coma separated or space separated ] : \n`), answer => {
            var inventoryIds = parseInventoryIds(answer.toString());
            console.log("Inventory Ids length : ", inventoryIds ? inventoryIds.length : NaN);
            console.log(chalker.blue.bold(`Inventory Ids : `, inventoryIds));

            params.totalIterations = inventoryIds ? inventoryIds.length : 0;
            params.remainingIterations = 0;

            rl.question(chalker.green.bold(`Confirm Inventory Ids ? [Y/N] `), (answer) => {
                answer = answer.toString();
                answer = answer.toLocaleUpperCase();
                if (answer === 'Y') {
                    params.inventoryIds = inventoryIds;
                    callback(null, params);
                } else {
                    callback(new Error(`Terminated`));
                }
            });

        });
    }
}


function _enterRemarks(params, callback) {
    rl.question(chalker.green.bold(`Enter Remarks : `), answer => {
        params.remarks = answer;
        callback(null, params);
    });
}


function _fetchInventories(params, callback) {
    db.collection('warehouses').find({ _id: { $in: params.inventoryIds } }).limit(params.inventoryIds.length).toArray(function (err, inventoryList) {
        if (err) {
            callback(err);
        } else {
            console.log("Ids ---------------" , params.inventoryIds);
            if (!inventoryList || !inventoryList.length) {
                callback(new Error(`Inventories not found`));
                return;
            }
            params.inventoryList = inventoryList;
            callback(null, params);
        }
    });
}


function _executeCorrection(params, callback) {
    var correctionList = [];
    params.inventoryList.map(d => {
        let entry = {
            "whId": d.whId,
            "serialNo": d.serialNo ? d.serialNo : [],
            "productId": d.productId,
            "barcode": d.barcode[0],
            "name": d.productName,
            "mrp": d.mrp,
            "snapshot": d._id,
            "quantity": d.quantity,
            "location": d.location,
            "oldLocation": d.location,
            "area": d.area,
            "oldArea": d.area,
            "rackId": d.rackId,
            "oldRackId": d.rackId,
            "binId": d.binId,
            "oldBinId": dbURLs.binId,
            "changeQtyBy": -1 * d.quantity,
            "shelfLife": decodeURI.shelfLife,
            "autoApprove": true,
            "reason": `GRN Duplicate`,
            "remarks": `${params.remarks}`,
        }

        correctionList.push(entry);
    });

    var queue = async.queue(function (data, queueCB) {

        var path = `/api/wh/v1/stockAdjustment`;

        _fire(path, 'POST', data).then(result => {
            queueCB(null, result);
        }).catch(e => queueCB(e));

    });

    queue.push(correctionList, function (err, result) {
        if(err){
            queue.tasks = [];
            queue.kill();
            callback(err);
            return;
        }
    });

    queue.drain = function () {
        callback(null, params);
    }

}



function parseInventoryIds(input) {

    if (Array.isArray(input)) {
        input = input.join(",");
    }

    input = input.split(",");
    // Split by coma first
    input.map((el, index) => {
        el = el.trim();
        if (el) {
            var elem = el.split(" ");
            if (elem.length > 1) {
                input.splice(index, 1);
                input = input.concat(elem);
            }
        }
    });
    // Eliminate white spaces (empty spaces ) and unrecognized input;
    input.map((el, index) => {
        if (!el.trim() || !(el.match(new RegExp("WH", "g")) || []).length) {
            input.splice(index, 1);
        }

    });

    input.map((el, index) => {
        // Eliminate white spaces;
        var el = el.replace(/\s/g, '');
        input.splice(index, 1, el);
        // Check for multilpe occurences of 'O' and then split those as they are separate order ids joined together;
        if ((el.match(new RegExp("WH", "g")) || []).length > 1) {
            var positions = []; // Positions of multiple occurences;
            var elem = "";
            for (var i = 0; i < el.length; i++) {
                if (el[i] === 'W') {
                    positions.push(i);
                }

                if (el[i].trim()) {
                    if (i != 0 && el[i] === 'W') {
                        elem += `,${el[i]}`
                    } else {
                        elem += el[i];
                    }
                }
            }
            elem = elem.split(",").filter(Boolean);
            input.splice(index, 1);
            input = input.concat(elem);
        }
    });

    input = _.uniq(input);
    input = input.filter(Boolean)

    return input;
}


/*
    "/api/wh/v1" + _path;
 */
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

        options.hostname = httpOption.hostName;
        options.port = httpOption.port;
        options.headers = httpOption.headers


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
