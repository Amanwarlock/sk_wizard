"use strict;"
const Mongoose = require("mongoose");
const http = require("http");
const readline = require('readline');
var chalk = require("chalk");
var chalker = new chalk.constructor({ enabled: true, level: 1 });
var async = require("async");
var _ = require("lodash");

const token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjM0NzVlNmRkNDMxOTUyMTRjZDg2MzMiLCJ1c2VybmFtZSI6IjkxMTMwMzMyOTgiLCJsbERhdGUiOiIyMDE5LTA2LTEyVDA4OjE1OjAyLjk4OVoiLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNTZWxsZXIiOmZhbHNlLCJlbXBsb3llZSI6IkVNUDc2OSIsIndhcmVob3VzZXMiOlsiV01GMCJdLCJub3RpZmljYXRpb24iOnsiQWNjb3VudCBDcmVhdGlvbiI6ZmFsc2UsIlJlc2V0IFBhc3N3b3JkIjpmYWxzZX0sImltYWdlIjpbXSwidXNlclR5cGUiOiJFbXBsb3llZSIsInJlc2V0UGFzc3dvcmQiOmZhbHNlLCJjcmVhdGVkQXQiOnRydWUsImxhc3RVcGRhdGVkIjoiMjAxOS0wNi0wOVQwNjo1ODowNi43ODlaIiwicmVmSWQiOiJFTVA3NjkiLCJuYW1lIjoiQW1hbiIsImVuYWJsZU90cCI6dHJ1ZSwicGxhdGZvcm0iOiJXZWIiLCJ3aERldGFpbHMiOnsid2hJZHMiOlsiV01GMyIsIldNRjQiLCJXTUYyIiwiV01GMSIsIldNRjAiLCJXTUY1IiwiV01GNiIsIldNRjciXSwiZGVmYXVsdFdoSWQiOiJXTUY1In0sInJvbGVJZCI6IlJPTEUxIiwiaWF0IjoxNTYwNDA5NDY0LCJleHAiOjE1NjA0OTU4NjR9.oCdBnEfOVSdMNOX_a2zGS5L8WPoKzWdGs7S5S4BFSMU";

var logger = {
    trace: function (msg) {
        console.log(chalker.green.bold(msg));
    },
    error: function (msg) {
        console.log(chalker.red.bold(msg));
    }
}


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


(function init() {

    console.log(chalker.green.bold(`#. Script Started ................................................................................`));

    var params = {};

    async.waterfall([
        _askConnectionOptions(params),
        _askWhId,
        _askPoId,
        _askWalmartOrderId,
        _confirmation,
        _runScript,
        _hitPartnerOrderAPI
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


function _askConnectionOptions(params) {
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
                    callback(null, params);
                });

            } else {
                callback(new Error(`Invalid option entered `, answer));
            }
        });

    }
}

function _askWhId(params, callback) {
    rl.question(`Enter WHID : `, answer => {
        params.whId = answer.toLocaleUpperCase();
        callback(null, params);
    })
}

function _askPoId(params, callback) {
    rl.question(`Enter POID : `, answer => {
        params.poId = answer;
        callback(null, params);
    });
}

function _askWalmartOrderId(params, callback) {
    rl.question(`Enter Walmart Order Id : `, answer => {
        params.partnerOrderId = answer;
        callback(null, params);
    });
}

function _confirmation(params, callback) {
    rl.question(`
    Confirm following : WHId = ${params.whId} | POID = ${params.poId} | Walmart Order Id = ${params.partnerOrderId}
    YES - [1]
    NO  - [2]
    `, answer => {
            if (parseInt(answer) === 1) {
                callback(null, params);
            } else {
                callback(new Error(`Terminated`));
            }
        });
}

function _runScript(params, callback) {

    var whId = params.whId;
    var poId = params.poId;
    var partnerOrderId = params.partnerOrderId;

    db.collection('omsmasters').aggregate([{
        $match: {
            "source": whId,
            "subOrders.poId": { $in: [poId] }
        }
    },
    {
        $project: {
            _id: 1,
            partnerOrderIds: 1,
            status: 1,
            source: 1,
            "subOrders._id": 1,
            "subOrders.partnerOrderId": 1,
            "subOrders.poId": 1,
            "subOrders.isManualPo": 1,
            "subOrders.isPoCreated": 1,
            "partnerWhId": 1
        }
    },
    { $unwind: "$subOrders" },
    {
        $match: {
            "subOrders.poId": { $in: [poId] }
        }
    }, {
        $group: {
            _id: { whId: "$source", poId: "$subOrders.poId" },
            data: { $push: "$$ROOT" }
        }
    }, {
        $project: {
            _id: 1,
            data: 1,
            total: { $size: "$data" }
        }
    }
    ]).toArray(function (err, orders) {
        if (err) {
            callback(err);
        }
        else if (orders && orders.length) {
            params.orders = orders;
            var bulk = db.collection("omsmasters").initializeUnorderedBulkOp();
            orders.map(o => {
                o.data.map(d => {
                    bulk.find({ _id: d._id, "subOrders._id": d.subOrders._id }).update({ $set: { "partnerWmfInfo.orderId": partnerOrderId, "subOrders.$.partnerOrderId": partnerOrderId, partnerOrderIds: [partnerOrderId] } });
                })
            });

            bulk.execute(function (err, result) {
                if (err) {
                    console.error("Error occured - ---------", JSON.stringify(err));
                    callback(err);
                } else {
                    console.log("Updated ---------------------------", JSON.stringify(result));
                    callback(null, params);
                }
            })

        } else {
            callback(new Error(`Orders not found`));
        }
    });

}

function _hitPartnerOrderAPI(params, callback) {
    var queue = async.queue(function (o, queueCB) {

        _fire(`/api/oms/v1/partnerOrder/${o._id}`, 'GET', null).then(order => {
            logger.trace(`SK Order and walmart order successfully mapped....`);
            queueCB();
        }).catch(e => {
            logger.error(`Error while fetching and updating walmart order to sk order via API`);
            queueCB();
        })

    });

    params.orders.map(o => {
        queue.push(o.data, function (err, result) {

        });
    })

    queue.drain = function () {
        callback(null, params);
    }
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
