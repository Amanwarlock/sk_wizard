"use strict;"
const Mongoose = require("mongoose");
const http = require("http");
const readline = require('readline');
var chalk = require("chalk");
var chalker = new chalk.constructor({ enabled: true, level: 1 });
var async = require("async");
var _ = require("lodash");
/* 
var cuti = require("cuti");
var puttu = require("puttu-redis");
puttu.connect();
 */

var data = require("./data");

const token = "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YjM0NzVlNmRkNDMxOTUyMTRjZDg2MzMiLCJ1c2VybmFtZSI6IjkxMTMwMzMyOTgiLCJsbERhdGUiOiIyMDE5LTA2LTA3VDA5OjI5OjQwLjIxMVoiLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNTZWxsZXIiOmZhbHNlLCJlbXBsb3llZSI6IkVNUDc2OSIsIndhcmVob3VzZXMiOlsiV01GMCJdLCJub3RpZmljYXRpb24iOnsiQWNjb3VudCBDcmVhdGlvbiI6ZmFsc2UsIlJlc2V0IFBhc3N3b3JkIjpmYWxzZX0sImltYWdlIjpbXSwidXNlclR5cGUiOiJFbXBsb3llZSIsInJlc2V0UGFzc3dvcmQiOmZhbHNlLCJjcmVhdGVkQXQiOnRydWUsImxhc3RVcGRhdGVkIjoiMjAxOS0wMy0wNFQwNzowNDowOS42NzZaIiwicmVmSWQiOiJFTVA3NjkiLCJuYW1lIjoiQW1hbiIsImVuYWJsZU90cCI6dHJ1ZSwicGxhdGZvcm0iOiJXZWIiLCJ3aERldGFpbHMiOnsid2hJZHMiOlsiV01GMyIsIldNRjQiLCJXTUYyIiwiV01GMSIsIldNRjAiLCJXTUY1IiwiV01GNiIsIldNRjciXSwiZGVmYXVsdFdoSWQiOiJXTUYwIn0sInJvbGVJZCI6IlJPTEUxIiwiaWF0IjoxNTYwMDEwNTI2LCJleHAiOjE1NjAwOTY5MjZ9.lumAz5GCKqRXoz-4oyuxYNhF8E8-fVEazLQZgDeyTIw";

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

/* 
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
} */


function _runScript() {
    placeConsolidatedOrder(data, false);
}

placeConsolidatedOrder(data, false);


function placeConsolidatedOrder(result, retryFailed = false) {
    return new Promise((resolve, reject) => {
        /* 
       1. Call consolidatedDistribution;
       2. Create PO from data obtained in step 1 and update PO in related subOrders;
       3. Place orders at partner cart;
       4. Execute split logic if any;
       5. Create Manual PO if any from data obtained in step 1 and trigger email;
   */
        result.retryFailed = retryFailed;
        async.waterfall([
            _getFcs(result),
            _ValidateMinCartValue,
            _getVendors,
            /*  _createAPIPo,
             _createManualPo,
             _splitSubOrders, */
            _mapAPIPoToOrders,
            _mapManualPoIdsToOrder,
            _sendManualPO
        ], function (err, data) {
            if (err) {
                logger.error("Error on placemenet-------------", err);
            } else {
                console.log("Result of place -------------- ", JSON.stringify(data));
            }
        });

    });

    function _getFcs(params) {
        return function (callback) {

            params.whIds = params.whIds && params.whIds.length ? _.uniq(params.whIds) : [];

            var select = ["_id", "whId", "isSkWarehouse", "partner", "ccEmailIds", "toEmailIds"];
            var _path = `/api/wh/v1/fulfillmentcenter?filter=${encodeURIComponent(JSON.stringify({ whId: { $in: params.whIds } }))}&count=${params.whIds.length}`;
            _path += `&select=${select}`;
            logger.trace("Getting FC's-------------");
            _fire(_path, "GET", null).then(fcs => {
                if (fcs && fcs.length) {
                    params.fcList = fcs;
                    params.vendorIds = fcs.map(f => f.partner.vendor);
                    params.vendorIds = _.uniq(params.vendorIds);
                    callback(null, params);
                } else {
                    callback(new Error(`Could not find FC....`));
                }
            }).catch(e => {
                callback(e);
            });
        }
    }

    //Validating Minimum Cart Value For Placing Parner Order
    function _ValidateMinCartValue(params, callback) {

        let newPendingOrders = [];
        params.pendingOrders.map((pendingOrder, index) => {

            if (pendingOrder._id) {
                let fc = _.find(params.fcList, { "whId": pendingOrder._id });
                let totalOrderValue = 0;
                pendingOrder.orderList.forEach(order => {
                    totalOrderValue += order.orderAmount;
                });
                if (totalOrderValue < fc.partner.minOrder) {
                    params.pendingOrders.splice(index, 1);
                }
            }
        });
        if (params.pendingOrders.length) {
            callback(null, params);
        } else {
            callback(new Error(`Minimum Cart Value not reached....`));
        }
    }

    function _getVendors(params, callback) {
        let select = ['contact', 'name', 'address', 'state', 'district', 'city'];
        var path = `/api/vendor/v1?filter=${encodeURIComponent(JSON.stringify({ _id: { $in: params.vendorIds } }))}&select=${select}&count=${params.vendorIds.length}`;
        _fire(path, "GET", null, { "defaultWhId": 'WMF0' }).then(vendors => {
            if (vendors && vendors.length) {
                params.vendorList = vendors;
                callback(null, params);
            } else {
                callback(new Error(`Could not find vendors....`));
            }
        }).catch(e => callback(e));
    }

    function _createAPIPo(params, callback) {
        var poDataList = params.poData;
        if (poDataList && poDataList.length) {
            var queue = async.queue(function (data, queueCB) {

                if (!data.products || !data.products.length) {
                    queueCB(new Error(`PO Products are empty, cannot place consolidated orders`));
                    return;
                }

                let fc = _.find(params.fcList, { whId: data.whId });

                if (!fc) {
                    queueCB(new Error(`Could not find FC by Id ${data.whId} in obtained FC list`));
                    return;
                }

                let vendor = _.find(params.vendorList, { _id: fc.partner.vendor });

                if (!vendor) {
                    queueCB(new Error(`Could not find Vendor by Id ${fc.partner.vendor} in obtained Vendors list`));
                    return;
                }

                var vendorContact = _.find(vendor.contact, { "isOwner": "true" });
                vendorContact = !vendorContact ? vendor.contact[0] : vendorContact;

                let orderGroup = _.find(params.pendingOrders, { _id: data.whId });

                if (orderGroup && orderGroup.isOrderPlaced && orderGroup.partnerOrderId) {
                    var po = {
                        //orderId: order._id,
                        isConsolidatedPo: true,
                        isSkWarehouse: false,
                        contact: {
                            isOwner: vendorContact.isOwner,
                            name: vendorContact.name,
                            designation: vendorContact.designation,
                            email: vendorContact.email,
                            mobile: vendorContact.mobile,
                            _id: vendorContact._id,
                            vendorName: vendor.name,
                            vendorId: vendor._id,
                            address: `${vendor.address.line1 ? vendor.address.line1 : ""}, ${vendor.address.line2 ? vendor.address.line2 : ""}, ${vendor.address.landmark ? vendor.address.landmark : ""}, ${vendor.city ? vendor.city : ""}, ${vendor.district} ${vendor.state}, ${vendor.pincode}`,//"#174,10th cross , 10th Main,Indiranagar, Bangalore, Karnataka, 560031",
                            state: vendor.state
                        },
                        products: data.products,
                        expectedAt: new Date().setDate(new Date().getDate() + 3).toString(),
                        remarks: "Auto Po Creation - System",
                        whId: data.whId,
                        poValue: 0,
                        partnerOrderIds: orderGroup && orderGroup.isOrderPlaced && orderGroup.partnerOrderId ? [orderGroup.partnerOrderId] : [],
                        status: "Draft",
                        createdAt: new Date()
                    }
                    let totalPoValue = po.products.map(p => p.quantity.requested * p.unitPrice).reduce((acc, curr) => acc + curr, 0);
                    po.poValue = parseFloat(totalPoValue.toFixed(2));
                    data.vendor = vendor._id;
                    _createPo(po).then(updatedPo => {
                        logger.trace(`API PO Created successfully - ${updatedPo._id} ---------------------------`);
                        params.poCreated = true;
                        data.poId = updatedPo._id;
                        data.poStatus = updatedPo.status;
                        data.poCreated = true;
                        data.isOrderPlaced = orderGroup.isOrderPlaced;
                        data.orderStatus = orderGroup.status;
                        queueCB(null);
                    }).catch(e => queueCB(e));
                } else {
                    data.poCreated = false;
                    data.isOrderPlaced = orderGroup.isOrderPlaced;
                    data.orderStatus = orderGroup.status;
                    queueCB(null);
                }

            });

            queue.push(poDataList, function (err, result) {
                if (err) {
                    queue.tasks = [];
                    queue.kill();
                    callback(err);
                }
            });

            queue.drain = function () {
                callback(null, params);
            }

        } else {
            //callback(new Error(`PO data not found for consolidated orders....`));
            logger.trace(`Skipping API PO creation for consolidated order flow .....`);
            callback(null, params);
        }
    }

    function _createManualPo(params, callback) {
        let manualPoList = params.manualPoData && params.manualPoData.length ? params.manualPoData : [];
        if (manualPoList && manualPoList.length) {
            var queue = async.queue(function (data, queueCB) {

                if (!data.products || !data.products.length) {
                    queueCB(new Error(`PO Products are empty, cannot place consolidated orders`));
                    return;
                }

                let fc = _.find(params.fcList, { whId: data.whId });

                if (!fc) {
                    queueCB(new Error(`Could not find FC by Id ${data.whId} in obtained FC list`));
                    return;
                }

                let vendor = _.find(params.vendorList, { _id: fc.partner.vendor });

                if (!vendor) {
                    queueCB(new Error(`Could not find Vendor by Id ${fc.partner.vendor} in obtained Vendors list`));
                    return;
                }

                var vendorContact = _.find(vendor.contact, { "isOwner": "true" });
                vendorContact = !vendorContact ? vendor.contact[0] : vendorContact;

                let orderGroup = _.find(params.pendingOrders, { _id: data.whId });

                if (orderGroup && orderGroup.status !== 'Failed') {
                    var po = {
                        //orderId: order._id,
                        isConsolidatedPo: true,
                        isSkWarehouse: false,
                        isManualPo: true,
                        contact: {
                            isOwner: vendorContact.isOwner,
                            name: vendorContact.name,
                            designation: vendorContact.designation,
                            email: vendorContact.email,
                            mobile: vendorContact.mobile,
                            _id: vendorContact._id,
                            vendorName: vendor.name,
                            vendorId: vendor._id,
                            address: `${vendor.address.line1 ? vendor.address.line1 : ""}, ${vendor.address.line2 ? vendor.address.line2 : ""}, ${vendor.address.landmark ? vendor.address.landmark : ""}, ${vendor.city ? vendor.city : ""}, ${vendor.district} ${vendor.state}, ${vendor.pincode}`,//"#174,10th cross , 10th Main,Indiranagar, Bangalore, Karnataka, 560031",
                            state: vendor.state
                        },
                        products: data.products,
                        expectedAt: new Date().setDate(new Date().getDate() + 3).toString(),
                        remarks: "Auto Po Creation - System",
                        whId: data.whId,
                        poValue: 0,
                        status: "Draft",
                        createdAt: new Date()
                    }
                    let totalPoValue = po.products.map(p => p.quantity.requested * p.unitPrice).reduce((acc, curr) => acc + curr, 0);
                    po.poValue = parseFloat(totalPoValue.toFixed(2));
                    data.vendor = vendor._id;
                    logger.trace(`Creating MANUAL PO---------------------------`);
                    _createPo(po).then(updatedPo => {
                        logger.trace(`Manual PO Created successfully- ${updatedPo._id} --------------------------`);
                        params.manualPoCreated = true;
                        data.poId = updatedPo._id;
                        data.poStatus = updatedPo.status;
                        data.manualPoCreated = true;
                        data.isOrderPlaced = orderGroup.isOrderPlaced;
                        data.orderStatus = orderGroup.status;
                        queueCB(null);
                    }).catch(e => queueCB(e));
                } else {
                    data.manualPoCreated = false;
                    data.isOrderPlaced = orderGroup.isOrderPlaced;
                    data.orderStatus = orderGroup.status;
                    queueCB(null);
                }

            });

            queue.push(manualPoList, function (err, result) {
                if (err) {
                    queue.tasks = [];
                    queue.kill();
                    callback(err);
                }
            });

            queue.drain = function () {
                callback(null, params);
            }

        } else {
            logger.trace(`Skipping manual PO creation for consolidated order placement flow.....`);
            callback(null, params);
        }
    }


    function _splitSubOrders(params, callback) {

        let splitData = [];

        params.splitData = params.splitData && params.splitData.length ? params.splitData : [];

        params.splitData.map(d => {
            let orderGroup = _.find(params.pendingOrders, { _id: d.whId });
            if (orderGroup && orderGroup.isOrderPlaced === true) {
                splitData.push(d);
            }
        })

        if (splitData && splitData.length) {
            logger.trace("Splitting suborders---------------");
            _fire(`/api/oms/v1/bulkSplit`, 'PUT', splitData).then(result => {
                logger.trace("Splitting successfull---------------");
                params.splitResult = result;
                callback(null, params);
            }).catch(e => callback(e));
        } else {
            callback(null, params);
        }
    }

    function _mapAPIPoToOrders(params, callback) {

        console.log("--------------------------PARAMS------------------------------------------- \n", JSON.stringify(params), "\n");

        let canUpdate = false;

        let url = `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`;

        var options = { "useNewUrlParser": true };

        Mongoose.connect(url, options);

        var db = Mongoose.connection;

        db.on('error', function () {
            callback(new Error(`Connection error ........`));
        });

        db.once('open', function () {
            console.log("Connection established to : ", url);

            console.log("Mapping API PO Ids to orders ----------------------------");

            const bulk = db.collection('omsmasters').initializeUnorderedBulkOp();

            if (params.poCreated === true && params.poData && params.poData.length) {
                params.poData.map(data => _.each(data.products, p => _.each(p.subOrderIds, s => {
                    if (data.isOrderPlaced === true && data.poCreated === true) {
                        canUpdate = true;
                        bulk.find({ "subOrders._id": s }).update({ $set: { poId: data.poId, "subOrders.$.isPoCreated": true, "subOrders.$.poId": data.poId, vendorId: data.vendor } });
                    }
                })))
            }

            if (canUpdate) {
                logger.trace("Running bulk update for API PO-----------------");
                bulk.execute(function (err, result) {
                    if (err) {
                        logger.error(`Error occured while updating and mapping orders with PO ids during consolidated order placement flow.`, JSON.stringify(err));
                        callback(err);
                    } else {
                        console.log("Bulk Upate result : ---------------------------", JSON.stringify(result));
                        callback(null, params);
                    }
                });
            } else {
                callback(null, params);
            }

        });

    }

    function _mapManualPoIdsToOrder(params, callback) {
        let canUpdate = false;

        let url = `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`;

        var options = { "useNewUrlParser": true };

        Mongoose.connect(url, options);

        var db = Mongoose.connection;

        db.on('error', function () {
            callback(new Error(`Connection error ........`));
        });

        db.once('open', function () {

            console.log("Mapping MANUAL PO Ids to orders ----------------------------");

            const bulk = db.collection('omsmasters').initializeUnorderedBulkOp();

            if (params.manualPoCreated === true && params.manualPoData && params.manualPoData.length) {

                params.manualPoData.map(data => _.each(data.products, p => _.each(p.subOrderIds, s => {
                    if (data.manualPoCreated === true) {

                        canUpdate = true;

                        let orderId = s.split("_")[0];
                        let splitOrdData = _.find(params.splitData, { orderId: orderId });

                        splitOrdData = splitOrdData ? splitOrdData : { subOrderList: [] };

                        let splitData = _.find(splitOrdData.subOrderList, { subOrderId: s });

                        if (splitData) {
                            /*  db.collection('omsmasters').findOneAndUpdate({ "subOrders.parentSubOrderId": s }, { $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } }, { new: true }, function (err, doc) {
                                 if (err) logger.error("Update error ------------", err);
                             }); */
                            console.log("Manual Po Mapping For split =------------------", `${JSON.stringify({ "subOrders.parentSubOrderId": s })} - ${JSON.stringify({ $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } })}`)
                            bulk.find({ "subOrders.parentSubOrderId": s }).update({ $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } });
                        } else {
                            /*  db.collection('omsmasters').findOneAndUpdate({ "subOrders._id": s }, { $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } }, { new: true }, function (err, doc) {
                                 if (err) logger.error("Update error ------------", err);
                             }) */
                            console.log("Manual PO Id mapping ------------", `${JSON.stringify({ "subOrders._id": s })}_${JSON.stringify({ $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } })}`);
                            bulk.find({ "subOrders._id": s }).update({ $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } });
                        }

                    }
                })))
            }

            if (canUpdate) {
                logger.trace("Running bulk update for Manual PO-----------------");
                bulk.execute(function (err, result) {
                    if (err) {
                        logger.error(`Error occured while updating and mapping orders with PO ids during consolidated order placement flow.`, JSON.stringify(err));
                        callback(err);
                    } else {
                        console.log("Bulk Upate result : ---------------------------", JSON.stringify(result));
                        callback(null, params);
                    }
                });
            } else {
                callback(null, params);
            }

        });
    }

    function _sendManualPO(params, callback) {

        let manualPoList = params.manualPoData && params.manualPoData.length ? params.manualPoData : [];

        let payload = [];

        let toEmailIds = [];
        let ccEmailIds = [];

        manualPoList.map(data => {
            logger.trace(`Sending manual PO over email - ${data._id} - ${data.whId}`);

            let fc = _.find(params.fcList, { whId: data.whId });
            let orderGroup = _.find(params.pendingOrders, { _id: data.whId });

            if (data.manualPoCreated === true && fc && orderGroup && orderGroup.status !== 'Failed') {

                data.products.map(p => {
                    payload.push({
                        poId: data.poId,
                        whId: data.whId,
                        locationId: fc.partner.locationId,
                        productName: p.name,
                        skProductId: p.productId,
                        partnerProductId: p.mapping.productId,
                        partnerSku: p.mapping.sku,
                        quanity: p.quantity.requested
                    });
                });

                toEmailIds = toEmailIds.concat(fc.toEmailIds);
                ccEmailIds = ccEmailIds.concat(fc.ccEmailIds);

            }
        });

        if (payload && payload.length && toEmailIds.length) {
            let options = {
                subject: 'Manual PO',
                toEmailIds: toEmailIds,
                ccEmailIds: ccEmailIds,
                data: payload
            }
            logger.trace("Sending Manual PO--------------");
            _fire(`/api/oms/v1/manualPOMail`, 'POST', options).then(d => {
                callback(null, params);
            }).catch(e => {
                callback(e);
            });

        } else {
            callback(null, params);
        }
    }

    function _createPo(po) {
        return new Promise((resolve, reject) => {
            var poUrl = "/api/po/v1";
            _fire(poUrl, "POST", po, { "defaultWhId": po.whId }).then(_po => {

                _fire(`${poUrl}/${_po._id}/state`, "POST", { "status": "Submitted", "message": "System - Auto submitted" }).then(submittedPo => {

                    _fire(`${poUrl}/${_po._id}/state`, "POST", { "status": "Open", "message": "System - Auto Approved" })
                        .then(updatedPo => {
                            logger.trace(` PO created for non-sk consolidated orders with POId : ${updatedPo._id}`);
                            resolve(updatedPo);

                        }).catch(e => reject(e));

                }).then().catch(e => reject(e));

            }).catch(e => reject(e));

        });
    }

};




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
