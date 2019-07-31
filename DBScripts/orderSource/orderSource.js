"use strict;"
var Mongoose = require("mongoose");
const readline = require('readline');
var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var jsonexport = require('jsonexport');
var moment = require("moment");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* Mongo URL */
//const url = "mongodb://skaman:QdEN96NQMspbGDtXrHRWDQ@35.154.220.245:27017/skstaging";
const url = "mongodb://skaman:QdEN96NQMspbGDtXrHRWDQ@localhost:6161/skstaging"; // SSH TUNNEL TO LIVE
//const url = "mongodb://localhost:27017/multiWh"; // local server
var path = "/home/aman/Desktop/Hygiene_reports";//__dirname + "/csv_reports";
const folder = "output";


/* --------MONGO CONNECT------ */
var options = { "useNewUrlParser": true };
Mongoose.connect(url, options);
var db = Mongoose.connection;

/* -----LISTENERS------ */
db.on('error', function () {
    console.log("Connection Error....");
    process.exit();
});

db.once('open', function callback() {
    console.log("Connection established to : ", url);
    runScript();
});



//var orderIds = ["OR2018071124736" , "OR2018071124744" , "OR2018071124753" , "OR2018071124761" , "OR2018071124816" , "OR2018071124832"];

var orderIds = ["OR20190222249749"];

function runScript() {

    var params = {};

    async.waterfall([
        _askOrderId(params),
        _askSource,
        _findAndUpdate
    ], function (err, result) {
        if (err) {
            console.log(err);
            process.exit();
        } else {
            console.log("Order source change payload : \n"), JSON.stringify(result);
            process.exit();
        }
    });

}


function _askOrderId(params) {
    return function (callback) {
        rl.question(`Enter Order Id : `, answer => {
            params.orderId = answer;
            callback(null, params);
        })
    }
}

function _askSource(params, callback) {
    rl.question(`Enter Source warehouse Id to be updated : `, answer => {
        params.newWhId = answer.toLocaleUpperCase();
        console.log("Entered whId: ", params.newWhId);
        callback(null, params);
    })
}

function _findAndUpdate(params, callback) {

    var orderPromise = new Promise((resolve, reject) => {
        resolve();
    });

    var sampleOrder = new Promise((resolve, reject) => {
        var select = { _id: 1, source: 1, createdAt: 1, warehouseDetails: 1, warehouseAddress: 1 }//"_id source createdAt warehouseDetails warehouseAddress"
        db.collection("omsmasters").find({ source: params.newWhId }).sort({ createdAt: -1 }).project(select).limit(1).toArray(function (err, order) {
            if (err) {
                callback(err);
            }
            else if (order && order.length) {
                resolve(order[0]);
            } else {
                callback(new Error(`Could get sample order for warehouse address and other details..`));
            }
        });
    });


    Promise.all([orderPromise, sampleOrder]).then(result => {
        var orderToBeUpdated = result[0];
        var sampleOrder = result[1];

        db.collection("omsmasters").update({ "_id": { "$in": [params.orderId] } }, { "$set": { "source": params.newWhId, "warehouseDetails": sampleOrder.warehouseDetails, "warehouseAddress": sampleOrder.warehouseAddress } }, { "multi": true }, function (err, result) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, result)
            }

        })

    }).catch(e => callback(e));

}