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

/* Mongo URL */
//const url = "mongodb://skaman:QdEN96NQMspbGDtXrHRWDQ@35.154.220.245:27017/skstaging";
const url = "mongodb://skaman:QdEN96NQMspbGDtXrHRWDQ@localhost:6161/skstaging"; // SSH TUNNEL TO LIVE


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


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


/* -----------------------------------------------------------------[ SCRIPT ]----------------------------------------------------------------------------- */

function runScript() {
    console.log(chalker.blue.bold("#. Invoiced Reference Snapshots Update script started ........................................................................."));

    var params = {};

    async.waterfall([
        _findMissingInvoices(params),
        _findLedgersAndUpdate
    ], function (err, result) {
        if (err) {
            console.log(chalker.red.bold(`#.SCRIPT TERMINATED : ------------------------------- `, err.message));
            process.exit();
        } else {
            console.log(chalker.green.bold(`#.SCRIPT Completed : -------------------------------`, result));
            process.exit();
        }
    });
}

function _findMissingInvoices(params) {
    return function (callback) {

        var startRange = new Date(2018, 02, 01, 23, 59, 59, 999)

        console.log(chalker.green(`Finding snapshots...................`, startRange));

        db.collection("omsinvoices").aggregate([{
            $match: {
                status: { $nin: ["Cancelled"] },
                "createdAt": { $gte: startRange },
                deals: {
                    $elemMatch: {
                        invoicedsnapshotReference: { $size: 0 }
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                orderId: 1,
                batchId: 1,
                performaInvoiceNo: 1,
                status: 1,
                whId: 1,
                createdAt: 1,
                "deals.id": 1,
                "deals._id": 1,
                "deals.invoicedsnapshotReference": 1
            }
        },
        {
            $lookup: {
                from: "omsmasters",
                localField: "orderId",
                foreignField: "_id",
                as: "order"
            }
        },
        {
            $match: {
                "order.0.typeOfOrder": { $eq: "SK" }
            }
        },
        {
            $unwind: "$deals"
        },
        {
            $match: {
                "deals.invoicedsnapshotReference": { $size: 0 }
            }
        }
            , {
            $project: {
                _id: 1,
                orderId: 1,
                batchId: 1,
                performaInvoiceNo: 1,
                status: 1,
                createdAt: 1,
                whId: 1,
                "deals.id": 1,
                "deals._id": 1,
                "deals.invoicedsnapshotReference": 1,
                "typeOfOrder": { $arrayElemAt: ["$order.typeOfOrder", 0] }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
        ], { allowDiskUse: true }).toArray(function (err, invoices) {
            if (err) {
                callback(err);
            } else if (invoices && invoices.length) {
                params.invoices = invoices;
                params.totalInvoices = invoices.length;
                console.log(chalker.yellow.bold(`Total Invoices found : ${invoices.length}`));
                callback(null, params);
            } else {
                callback(new Error(`No Invoices found ...`));
            }
        });

    }
}

function _findLedgersAndUpdate(params, callback) {

    var counter = params.totalInvoices;

    var bulk = db.collection("omsinvoices").initializeUnorderedBulkOp();

    var queue = async.queue(function (invoice, queueCB) {

        console.log(chalker.blue.bold(`Iterating  --- `, counter));
        counter -= 1;

        db.collection("stockledgers").find({
            "referenceType": "Release",
            "reference.subOrderId": invoice.deals._id,
            "reference.performaId": invoice.performaInvoiceNo,
            "reference.invoiceNo": invoice._id
        }).toArray(function (err, ledgers) {
            if (err) {
                console.log("Error For invoice : - ", invoice._id);
                queueCB(err);
            } else if (ledgers && ledgers.length) {

                var invoicedsnapshotReference = [];

                ledgers.map(_ledger => {
                    var entry = {
                        "ledgerId": _ledger._id,
                        "snapShotId": _ledger.snapShotId,
                        "whId": _ledger.warehouseId,
                        "productId": _ledger.productId,
                        "quantity": _ledger.requestQty,
                        "mrp": _ledger.mrp,
                        "serialNo": _ledger.serialNo ? _ledger.serialNo : [],
                        "barcode": _ledger.barcode ? _ledger.barcode : [],
                        "location": _ledger.location,
                        "area": _ledger.area,
                        "rackId": _ledger.rackId,
                        "binId": _ledger.binId
                    }

                    invoicedsnapshotReference.push(entry);
                });

                bulk.find({ _id: invoice._id, 'deals._id': invoice.deals._id }).update({ $set: { [`deals.$.invoicedsnapshotReference`]: invoicedsnapshotReference } });

                queueCB(null);

            } else {
                console.log(chalker.red.bold(`Stock Ledger not found for invoice  --- ${invoice._id}`));
                queueCB(null);
            }
        });

    });

    queue.push(params.invoices, function (err, result) {
        if (err) {
            console.log("Error in queue : ", err)
        }
    });

    queue.drain = function () {
        bulk.execute(function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }
        });
    }

}

/*



*/