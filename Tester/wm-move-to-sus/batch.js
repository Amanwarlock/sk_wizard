var Mongoose = require("mongoose");
var SMCrud = require("swagger-mongoose-crud");
var definition = require("../helpers/batch.model");
var cuti = require("cuti");
var log4js = cuti.logger.getLogger;
var logger = log4js.getLogger("oms");
var hooks = require("../helpers/batch.hooks");
var schema = new Mongoose.Schema(definition);

schema.pre("save", hooks.generateId);
schema.pre("save", hooks.batchStatusChange);
schema.post("save", hooks.nonSkShortShipmentNotification);
var crud = new SMCrud(schema, "omsBatch", logger);
var orderController = require("./order.controller.js");
var async = require("async");
var _ = require("lodash");
var http = require("http");
var Batch = require("./batch");

hooks.init(crud, logger);

/**
 * Depricated
 * This function is no longer required as warehouse has been rewritten
 * Sending status 200 and not processing as it will conflict
 * Robin <robin.samuel@storeking.in>
 * 09 MAY 2018
 */
function allotStocktoBatch(req, res) {
    return res.sendStatus(200);
    // var orderId = crud.swagMapper(req)["orderId"];
    // async.waterfall([
    //     _getProductIds(orderId),
    //     _getAvailableWarehouseIds,
    //     _allotStockstoOrder
    // ], function (err, success) {
    //     if (err)
    //         res.status(400).json(err);
    //     else if (success) {
    //         res.status(200).json(success);
    //     }

    // });
}

function _getProductIds(orderId) {
    return function (callback) {
        orderController.crud.model.findOne({
            "_id": orderId
        }).exec()
            .then((doc) => {
                if (doc.stockAllocation != "Allocated") {
                    var productIds = [];
                    var subOrderIds = [];

                    async.each(doc.subOrders, function (sOrd, callbacksOrd) {
                        if (sOrd.readyForBatching == false) {
                            subOrderIds.push(sOrd._id);
                            sOrd.products.forEach(prd => {
                                productIds.push(prd.id);
                            });
                            callbacksOrd(null, productIds, subOrderIds);
                        } else
                            callbacksOrd(null, productIds, subOrderIds);
                    }, function (err, success) {
                        if (productIds.length == 0) {
                            callback("No Orders Found");
                        } else {
                            callback(null, productIds, subOrderIds);
                        }
                    });
                } else
                    callback("Invalid Order");
            });
    };

}

function _getAvailableWarehouseIds(productIds, subOrderIds, callback) {
    //return function(callback)
    //{
    var whids = [];
    var whQueue = async.queue(function (productId, callbackprd) {
        var inputParams = "filter={\"productId\":{\"$in\":[\"" + productId + "\"]},\"quantity\":{\"$gt\":0},\"isGoodStock\":true}";

        orderController._requestHttp("wh", "snapshot", "GET", inputParams, function (err, whdata) {
            if (whdata && whdata.length > 0) {
                async.each(whdata, function (wh, callbackwh) {
                    whids.push(wh);
                    callbackwh(null, whids, subOrderIds);
                }, function (err, success) {
                    if (whids.length == 0)
                        callbackprd("Something went wrong");
                    else
                        callbackprd(null, whids, subOrderIds);
                });
            } else {
                var err = "No Stock Found";
                callbackprd(err);
            }
        });
    }, 1);

    whQueue.drain = function () {
        if (whids.length == 0)
            callback("No Stock Found");
        else
            callback(null, whids, subOrderIds);
    };

    _.each(productIds, function (productId) {
        whQueue.push(productId, function (err) {
            if (err) logger.error(err);
        });
    });
    // }
}

function _allotStockstoOrder(snapshots, subOrderIds, callback) {
    //console.log("snapshots",snapshots);
    var whQueue = async.queue(function (snapshot, callbackwhid) {
        orderController.HoldQuantitiesfromInvoice(snapshot._id, subOrderIds, function (err, resp) {
            if (resp) {
                callbackwhid(null, snapshot);
            } else
                callbackwhid(null, snapshot);
        });
    }, 1);

    whQueue.drain = function () {
        callback(null, snapshots);
    };

    _.each(snapshots, function (snapshot) {
        whQueue.push(snapshot, function (err) {
            if (err) logger.error(err);
        });
    });
}

/**
 * Function to Allot Stocks for Confirmed orders
 */
function reserveStockConfirmedOrders(req, res) {
    return orderController.crud.model.aggregate([{
        $match: {
            "subOrders.status": {
                "$in": ["Confirmed"]
            }
        }
    },
    {
        $unwind: "$subOrders"
    },
    {
        $match: {
            "subOrders.status": {
                "$in": ["Confirmed"]
            }
        }
    },
    {
        $project: {
            "subOrders.blockedProducts.productId": 1,
            "subOrders.requestedProducts.productId": 1,
            "subOrders.blockedProducts.quantity": 1,
            "subOrders.requestedProducts.quantity": 1,
            "res": {
                "$cond": {
                    "if": {
                        "$gt": ["$subOrders.requestedProducts.quantity", "$subOrders.blockedProducts.quantity"]
                    },
                    "then": true,
                    "else": false
                }
            }
        }
    },
    {
        $match: {
            "res": true
        }
    }, {
        $project: {
            _id: 1
        }
    }
    ]).then(orders => {
        var orderIds = [];
        orders.forEach(o => orderIds.push(o._id));

        async.forEach(orderIds, processAllotStock, function () { });
    }).catch(err => {
        return err;
    });
}

function processAllotStock(orderId, cb) {
    async.waterfall([
        _getProductIds(orderId),
        _getAvailableWarehouseIds,
        _allotStockstoOrder
    ], function (err, resp) {
        if (err)
            cb(err, orderId, null);
        else if (resp)
            cb(null, orderId, resp);
    });
}

function createBatch(req, res) {

    logger.trace("Creating batch........");

    var params = crud.swagMapper(req);
    var data = params["data"];
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;
    var whId = data.whId;
    var isSkWarehouse = data.isSkWarehouse;
    var states = data.states;
    var levels = data.levels;
    var tillDate = data.tillDate ? new Date(data.tillDate) : new Date();
    var count = data.count ? data.count : 5;
    var orderType = data.orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var remarks = data.remarks;
    var franchiseId = data.franchiseId;
    data.categoryIds = [];
    var orderId = data.orderId && !Array.isArray(data.orderId) ? data.orderId.split(",") : data.orderId;
    data.count = count;
    var batchCond = "";
    batchCond["isSkWarehouse"] = isSkWarehouse;
    var ispartialbatchcond = "";
    if (data.isPartial == false)
        ispartialbatchcond = "Allocated";
    else
        ispartialbatchcond = {
            $nin: ["NotAllocated"]
        };

    if (data.category && data.category.length) {
        categoryWiseBatching(req, res);
        return;
    } else if (states && states.length) {
        stateWiseBatching(req, res);
        return;
    } else if (data.lmfId) {
        lmfWiseBatching(req, res);
        return;
    } else if (data.rmfId) {
        rmfWiseBatching(req, res);
        return;
    } else if (data.courierId) {
        courierWiseBatching(req, res);
        return;
    } else if (data.asnNo || data.partnerAsnNo || (data.location && data.area)) {
        asnWiseBatching(req, res);
        return;
    } else if (data.orderId)
        batchCond = {
            _id: {
                $in: orderId
            },
            "paymentStatus": "Paid",
            orderType: data.orderType,
            "source": whId,
            "subOrders.status": "Confirmed",
            "subOrders.processed": false,
            "subOrders.readyForBatching": true,
            "subOrders.batchId": "",
            stockAllocation: ispartialbatchcond,
            "batchEnabled": true,
            "subOrders.invoiced": false,
        }; //"subOrders.batchingTime":{$exists:false},,
    else if (data.franchiseId)
        batchCond = {
            "franchise.id": data.franchiseId,
            "source": whId,
            "paymentStatus": "Paid",
            orderType: data.orderType,
            "subOrders.status": "Confirmed",
            "subOrders.processed": false,
            "subOrders.readyForBatching": true,
            "subOrders.batchId": "",
            stockAllocation: ispartialbatchcond,
            "batchEnabled": true,
            "subOrders.invoiced": false,
        }; //"subOrders.batchingTime":{$exists:false}
    else if (data.isExclusiveType)
        batchCond = {
            "isExclusiveType": data.isExclusiveType,
            "source": whId,
            "paymentStatus": "Paid",
            orderType: data.orderType,
            "subOrders.status": "Confirmed",
            "subOrders.processed": false,
            "subOrders.readyForBatching": true,
            "subOrders.batchId": "",
            stockAllocation: ispartialbatchcond,
            "batchEnabled": true,
            "subOrders.invoiced": false,
        };
    else if (tillDate) {
        tillDate = new Date(tillDate);
        tillDate.setHours(23, 59, 59, 999);
        batchCond = {
            date: {
                $lte: tillDate
            },
            "source": whId,
            "paymentStatus": "Paid",
            orderType: data.orderType,
            "subOrders.status": "Confirmed",
            "subOrders.processed": false,
            "subOrders.readyForBatching": true,
            "subOrders.batchId": "",
            stockAllocation: ispartialbatchcond,
            "batchEnabled": true,
            "subOrders.invoiced": false,
        };
    } else {
        res.status(400).send({ "message": "Invalid batch creation request" });
        return;
    }
    if (data.withRetailerPriority) {
        //Lower Bound - For franchise date of creation; one month (30 days) prior to current day;
        var lowerBound = new Date();
        lowerBound.setDate(lowerBound.getDate() - 1);
        lowerBound.setMonth(lowerBound.getMonth() - 1);
        lowerBound.setHours(23, 59, 59, 999);

        //Upper bound = One day after current day (exclusive of today);
        var upperBound = new Date();
        upperBound.setDate(upperBound.getDate() + 1);

        // Order lower bound; Hard coded to year 2012
        var orderLowerBound = new Date();
        orderLowerBound.setFullYear(2012);

        var _pipeline = [
            {
                $match: batchCond
            },
            {
                $unwind: "$subOrders"
            },
            {
                $match: batchCond
            },
            {
                "$project": {
                    "_id": 1,
                    "subOrderId": "$subOrders._id",
                    "createdAt": 1,
                    "franchise.id": 1,
                    "franchise.createdAt": 1,

                }
            },
            {
                $facet: {
                    "franchiseWiseBucket": [{
                        $bucket: {
                            groupBy: "$franchise.createdAt",
                            boundaries: [lowerBound, upperBound],//[0, 200, 400],
                            default: "default",
                            output: {
                                "count": { $sum: 1 },
                                "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": orderLowerBound } }
                            }
                        }
                    }],
                    "orderWiseBucket": [
                        {
                            $bucket: {
                                groupBy: "$createdAt",
                                boundaries: [orderLowerBound, upperBound],//[0, 200, 400],
                                default: "default",
                                output: {
                                    "count": { $sum: 1 },
                                    "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": "$createdAt" } }
                                }
                            }
                        }]
                }
            },
            {
                "$project": {
                    "orderList": {
                        "$reduce": {
                            "input": "$franchiseWiseBucket",
                            "initialValue": [],
                            "in": {
                                "$concatArrays": ["$$value", {
                                    "$cond": {
                                        "if": { "$ne": ["$$this._id", "default"] },
                                        "then": "$$this.orderList",
                                        "else": []
                                    }
                                }]
                            }
                        }
                    },
                    "orderWiseBucket": 1
                }
            },
            {
                "$project": {
                    "orderList": {
                        "$concatArrays": ["$orderList", {
                            "$reduce": {
                                "input": "$orderWiseBucket",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": ["$$value", {
                                        "$cond": {
                                            "if": { "$ne": ["$$this._id", "default"] },
                                            "then": "$$this.orderList",
                                            "else": []
                                        }
                                    }]
                                }
                            }
                        }]
                    }
                }
            },
            { "$unwind": "$orderList" },
            {
                "$group": {
                    "_id": "$orderList._id",
                    "subOrders": {
                        "$push": "$orderList.subOrderId"
                    },
                    "priorityDate": { "$first": "$orderList.priorityDate" },
                    "createdAt": { "$first": "$orderList.createdAt" },
                    "franchiseCreatedAt": { "$first": "$orderList.franchiseCreatedAt" },
                }
            },
            { $sort: { "priorityDate": 1 } }

        ];
    } else {
        var _pipeline = [
            {
                $match: batchCond
            },
            {
                $unwind: "$subOrders"
            },
            {
                $match: batchCond
            },
            { "$sort": { createdAt: 1 } },
            {
                $project: {
                    "distinct": 1,
                    "subOrders._id": 1,
                    "createdAt": 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    subOrders: {
                        $push: "$subOrders._id"
                    },
                    createdAt: { "$first": "$createdAt" }
                }
            },
            { "$sort": { createdAt: 1 } },

        ];
    }

    if (data.count && data.count > 0) {
        _pipeline.push({ $limit: data.count })
    }

    logger.trace("Batch creation query - ", JSON.stringify(_pipeline));
    return orderController.crud.model.aggregate(_pipeline) //
        .then((subdocs) => {
            var subDocsArray = [];
            subdocs.forEach(el => {
                el.subOrders.forEach(sel => {
                    subDocsArray.push(sel);
                });
            });

            let _finder = orderController.crud.model.find({
                "subOrders._id": {
                    "$in": subDocsArray
                }
            });

            if (data.count && data.count > 0) {
                _finder.limit(data.count);
            }

            _finder.exec()
                .then((docs) => {
                    return new Promise(() => {
                        if (docs.length === 0) {
                            res.status(400).json({
                                message: "No order found."
                            });
                        } else {
                            orderToBatch(subDocsArray, docs, remarks, req.user.username, params["type"])
                                .then(batch => {
                                    docs.forEach(function (element) {
                                        var logObject = {
                                            "operation": "Batch Created",
                                            "user": req.user ? req.user.username : req.headers["masterName"],
                                            "_id": element._id,
                                            "timestamp": new Date()
                                        };
                                        orderController.crud.logger.audit(JSON.stringify(logObject));
                                    });
                                    res.status(200).json(batch);
                                }).catch(err => {
                                    res.status(400).json({
                                        message: err
                                    });
                                });
                        }
                    });
                });
            return _finder;
        }) //.then((doc1)=>{return new Promise(resolve => resolve(doc1) )})
        .catch((err) => {
            return new Promise((resolve, reject) => reject(err));
        });
}

function stateWiseBatching(req, res) {
    logger.trace("Executing state wise batching....");
    var params = req.swagger.params;
    var data = req.swagger.params['data'].value;
    var whId = data["whId"];
    var orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var isPartial = data.isPartial;
    var isExclusiveType = data.isExclusiveType === undefined ? false : data.isExclusiveType;
    var states = data.states;
    var levels = data.levels;
    var districts = data.districts;
    var count = data.count;
    var withRetailerPriority = data.withRetailerPriority;
    var remarks = data.remarks;
    var user = req.user.username;
    data.username = user;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    var batchCriteria = {
        "source": whId,
        "paymentStatus": "Paid",
        "batchEnabled": true,
        "orderType": orderType,
        "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
        "isExclusiveType": isExclusiveType,
    };

    var subOrderCriteria = {
        "subOrders": {
            "$elemMatch": {
                'status': 'Confirmed',
                'processed': false,
                'invoiced': false,
                'readyForBatching': true,
                'batchId': "",
                "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }]
            }
        }
    };

    if (!states || !levels) {
        res.status(400).send({ "message": "States / levels cannot be empty" });
        return;
    }
    /* "All States","All Levels","RMF", "RF","WMF", "LMF" */

    if (states && states.length && !_.includes(states, "All States")) {
        states = states.concat(states.map(s => s.toLocaleUpperCase()));
        states = _.uniq(states);
        batchCriteria = Object.assign({}, batchCriteria, { "franchise.state": { "$in": states } });
    }

    if (districts && districts.length && !_.includes(districts, "All Districts")) {
        //districts = districts.concat(districts.map(d => d.toLocaleUpperCase()));
        districts = districts.concat(districts.map(d => new RegExp(d, "i")));
        districts = _.uniq(districts);
        batchCriteria = Object.assign({}, batchCriteria, { "franchise.district": { "$in": districts } });
    }

    if (levels && levels.length && !_.includes(levels, "All Levels")) {
        batchCriteria = Object.assign({}, batchCriteria, { "franchise.type": { "$in": levels } });
    }

    batchCriteria = Object.assign(batchCriteria, subOrderCriteria);

    async.waterfall([
        _stateWiseBatchPipeline(data, batchCriteria),
        _findSubOrderIds,
        _findOrders,
        _generateBatch,
        _assignPerforma,
        _batchAndOrderUpdate], function (err, result) {
            if (err)
                res.status(400).send({
                    "message": err.message
                });
            else
                res.status(200).send(result);
        });
}

function _stateWiseBatchPipeline(data, batchCriteria) {
    return function (callback) {
        if (data.withRetailerPriority) {
            //Lower Bound - For franchise date of creation; one month (30 days) prior to current day;
            var lowerBound = new Date();
            lowerBound.setDate(lowerBound.getDate() - 1);
            lowerBound.setMonth(lowerBound.getMonth() - 1);
            lowerBound.setHours(23, 59, 59, 999);

            //Upper bound = One day after current day (exclusive of today);
            var upperBound = new Date();
            upperBound.setDate(upperBound.getDate() + 1);

            // Order lower bound; Hard coded to year 2012
            var orderLowerBound = new Date();
            orderLowerBound.setFullYear(2012);

            var _pipeline = [
                {
                    "$match": batchCriteria
                },
                { "$sort": { "createdAt": 1 } },
                { "$unwind": "$subOrders" },
                {
                    "$match": {
                        "subOrders.status": "Confirmed",
                        'subOrders.processed': false,
                        'subOrders.invoiced': false,
                        'subOrders.readyForBatching': true,
                        'subOrders.batchId': "",
                        "$or": [{ "subOrders.performaInvoiceNo": { $exists: false } }, { "subOrders.performaInvoiceNo": { $eq: "" } }]
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "subOrderId": "$subOrders._id",
                        "createdAt": 1,
                        "franchise.id": 1,
                        "franchise.createdAt": 1,

                    }
                },
                {
                    $facet: {
                        "franchiseWiseBucket": [{
                            $bucket: {
                                groupBy: "$franchise.createdAt",
                                boundaries: [lowerBound, upperBound],//[0, 200, 400],
                                default: "default",
                                output: {
                                    "count": { $sum: 1 },
                                    "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": orderLowerBound } }
                                }
                            }
                        }],
                        "orderWiseBucket": [
                            {
                                $bucket: {
                                    groupBy: "$createdAt",
                                    boundaries: [orderLowerBound, upperBound],//[0, 200, 400],
                                    default: "default",
                                    output: {
                                        "count": { $sum: 1 },
                                        "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": "$createdAt" } }
                                    }
                                }
                            }]
                    }
                },
                {
                    "$project": {
                        "orderList": {
                            "$reduce": {
                                "input": "$franchiseWiseBucket",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": ["$$value", {
                                        "$cond": {
                                            "if": { "$ne": ["$$this._id", "default"] },
                                            "then": "$$this.orderList",
                                            "else": []
                                        }
                                    }]
                                }
                            }
                        },
                        "orderWiseBucket": 1
                    }
                },
                {
                    "$project": {
                        "orderList": {
                            "$concatArrays": ["$orderList", {
                                "$reduce": {
                                    "input": "$orderWiseBucket",
                                    "initialValue": [],
                                    "in": {
                                        "$concatArrays": ["$$value", {
                                            "$cond": {
                                                "if": { "$ne": ["$$this._id", "default"] },
                                                "then": "$$this.orderList",
                                                "else": []
                                            }
                                        }]
                                    }
                                }
                            }]
                        }
                    }
                },
                { "$unwind": "$orderList" },
                {
                    "$group": {
                        "_id": "$orderList._id",
                        "subOrders": {
                            "$push": "$orderList.subOrderId"
                        },
                        "priorityDate": { "$first": "$orderList.priorityDate" },
                        "createdAt": { "$first": "$orderList.createdAt" },
                        "franchiseCreatedAt": { "$first": "$orderList.franchiseCreatedAt" },
                    }
                },
                { $sort: { "priorityDate": 1 } },
                { "$limit": data.count }
            ];
            // console.log("PipeLine : \n", JSON.stringify(_pipeline));
            callback(null, data, _pipeline);
        } else {
            var _pipeline = [
                {
                    "$match": batchCriteria
                },
                { "$sort": { "createdAt": 1 } },
                {
                    "$limit": data.count
                },
                { "$unwind": "$subOrders" },
                {
                    "$match": {
                        "subOrders.status": "Confirmed",
                        'subOrders.processed': false,
                        'subOrders.invoiced': false,
                        'subOrders.readyForBatching': true,
                        'subOrders.batchId': "",
                        "$or": [{ "subOrders.performaInvoiceNo": { $exists: false } }, { "subOrders.performaInvoiceNo": { $eq: "" } }]
                    }
                },
                {
                    "$project": {
                        "distinct": 1,
                        "subOrders._id": 1
                    }
                },
                {
                    "$group": {
                        "_id": "$_id",
                        "subOrders": {
                            "$push": "$subOrders._id"
                        }
                    }
                },
            ];
            callback(null, data, _pipeline);
        }
    };
}

function categoryWiseBatching(req, res) {
    logger.trace("Creating category wise batches...");
    var params = crud.swagMapper(req);
    var data = params["data"];
    data.username = req.user ? req.user.username : req.headers["masterName"];
    data.type = params["type"];
    data.orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    data.count = data.count ? data.count : 5;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    async.waterfall([
        _categoryValidation(data),
        _pipelineBuilder,
        _findSubOrderIds,
        _findOrders,
        _generateBatch,
        _assignPerforma,
        _batchAndOrderUpdate
    ], function (err, result) {
        if (err)
            res.status(400).send({
                message: err.message
            });
        else
            res.status(200).send(result);
    });
}

function _categoryValidation(data, callback) {
    return function (callback) {
        if (data.category && data.category.length)
            callback(null, data);
        else
            callback(new Error("Invalid for category wise batching"));
    };
}

function _pipelineBuilder(data, callback) {
    var whId = data.whId;
    var partialBatchCondition = data.isPartial ? {
        $nin: ["NotAllocated"]
    } : "Allocated";
    var condition = {
        "source": whId,
        "paymentStatus": "Paid",
        "orderType": data.orderType,
        "stockAllocation": partialBatchCondition,
        "batchEnabled": true,
        "subOrders": {
            '$elemMatch': {
                'status': 'Confirmed',
                'processed': false,
                'invoiced': false,
                'readyForBatching': true,
                'batchId': "",
                "category.id": {
                    "$in": data.category
                }
            }
        },
    };

    if (data.withRetailerPriority) {
        //Lower Bound - For franchise date of creation; one month (30 days) prior to current day;
        var lowerBound = new Date();
        lowerBound.setDate(lowerBound.getDate() - 1);
        lowerBound.setMonth(lowerBound.getMonth() - 1);
        lowerBound.setHours(23, 59, 59, 999);

        //Upper bound = One day after current day (exclusive of today);
        var upperBound = new Date();
        upperBound.setDate(upperBound.getDate() + 1);

        // Order lower bound; Hard coded to year 2012
        var orderLowerBound = new Date();
        orderLowerBound.setFullYear(2012);

        var _pipeline = [
            {
                $match: condition
            },
            {
                $unwind: "$subOrders"
            },
            {
                $match: {
                    "subOrders.category.id": { '$in': data.category },
                    "subOrders.invoiced": false,
                    "subOrders.status": "Confirmed",
                    "subOrders.processed": false,
                    "subOrders.batchId": "",
                    "subOrders.readyForBatching": true,
                }
            },
            {
                $match: { $or: [{ "subOrders.performaInvoiceNo": { $exists: false } }, { "subOrders.performaInvoiceNo": { $eq: "" } }] }
            },
            { "$sort": { "createdAt": -1 } },
            {
                "$project": {
                    "_id": 1,
                    "subOrderId": "$subOrders._id",
                    "createdAt": 1,
                    "franchise.id": 1,
                    "franchise.createdAt": 1,

                }
            },
            {
                $facet: {
                    "franchiseWiseBucket": [{
                        $bucket: {
                            groupBy: "$franchise.createdAt",
                            boundaries: [lowerBound, upperBound],//[0, 200, 400],
                            default: "default",
                            output: {
                                "count": { $sum: 1 },
                                "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": orderLowerBound } }
                            }
                        }
                    }],
                    "orderWiseBucket": [
                        {
                            $bucket: {
                                groupBy: "$createdAt",
                                boundaries: [orderLowerBound, upperBound],//[0, 200, 400],
                                default: "default",
                                output: {
                                    "count": { $sum: 1 },
                                    "orderList": { $push: { "_id": "$_id", "createdAt": "$createdAt", "subOrderId": "$subOrderId", "franchise": "$franchise.id", "franchiseCreatedAt": "$franchise.createdAt", "priorityDate": "$createdAt" } }
                                }
                            }
                        }]
                }
            },
            {
                "$project": {
                    "orderList": {
                        "$reduce": {
                            "input": "$franchiseWiseBucket",
                            "initialValue": [],
                            "in": {
                                "$concatArrays": ["$$value", {
                                    "$cond": {
                                        "if": { "$ne": ["$$this._id", "default"] },
                                        "then": "$$this.orderList",
                                        "else": []
                                    }
                                }]
                            }
                        }
                    },
                    "orderWiseBucket": 1
                }
            },
            {
                "$project": {
                    "orderList": {
                        "$concatArrays": ["$orderList", {
                            "$reduce": {
                                "input": "$orderWiseBucket",
                                "initialValue": [],
                                "in": {
                                    "$concatArrays": ["$$value", {
                                        "$cond": {
                                            "if": { "$ne": ["$$this._id", "default"] },
                                            "then": "$$this.orderList",
                                            "else": []
                                        }
                                    }]
                                }
                            }
                        }]
                    }
                }
            },
            { "$unwind": "$orderList" },
            {
                "$group": {
                    "_id": "$orderList._id",
                    "subOrders": {
                        "$push": "$orderList.subOrderId"
                    },
                    "priorityDate": { "$first": "$orderList.priorityDate" },
                    "createdAt": { "$first": "$orderList.createdAt" },
                    "franchiseCreatedAt": { "$first": "$orderList.franchiseCreatedAt" },
                }
            },
            { $sort: { "priorityDate": 1 } },
            { "$limit": data.count }
        ];
        callback(null, data, _pipeline);
    } else {
        var _pipeline = [
            {
                $match: condition
            },
            {
                $unwind: "$subOrders"
            },
            {
                $match: {
                    "subOrders.category.id": { '$in': data.category },
                    "subOrders.invoiced": false,
                    "subOrders.status": "Confirmed",
                    "subOrders.processed": false,
                    "subOrders.batchId": "",
                    "subOrders.readyForBatching": true,
                }
            },
            {
                $match: { $or: [{ "subOrders.performaInvoiceNo": { $exists: false } }, { "subOrders.performaInvoiceNo": { $eq: "" } }] }
            },
            { "$sort": { "createdAt": -1 } },
            {
                $project: {
                    "distinct": 1,
                    "subOrders._id": 1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    subOrders: {
                        $push: "$subOrders._id"
                    }
                }
            },
            {
                $limit: data.count
            }
        ];

        callback(null, data, _pipeline);
    }
}

function lmfWiseBatching(req, res) {
    logger.trace("Creating LMF wise batch....");
    var params = req.swagger.params;
    var data = req.swagger.params['data'].value;
    var whId = data["whId"];
    var lmfId = data["lmfId"];
    var orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var isPartial = data.isPartial;
    var isExclusiveType = data.isExclusiveType === undefined ? false : data.isExclusiveType;
    var count = data.count;
    var withRetailerPriority = data.withRetailerPriority;
    var remarks = data.remarks;
    var user = req.user.username;
    data.username = user;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    var batch = new Batch();
    batch.network('franchise', whId, lmfId).then(network => {
        var batchCriteria = {
            "source": whId,
            "paymentStatus": "Paid",
            "batchEnabled": true,
            "orderType": orderType,
            "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
            "isExclusiveType": isExclusiveType,
            "franchise.id": { $in: network },
            "subOrders": {
                "$elemMatch": {
                    'status': 'Confirmed',
                    'processed': false,
                    'invoiced': false,
                    'readyForBatching': true,
                    'batchId': "",
                    "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }]
                }
            }
        };

        async.waterfall([
            _buildPipeline(data, batchCriteria),
            _findSubOrderIds,
            _findOrders,
            _generateBatch,
            _assignPerforma,
            _batchAndOrderUpdate], function (err, result) {
                if (err)
                    res.status(400).send({ "message": err.message });
                else
                    res.status(200).send(result);
            });

    }).catch(e => res.status(400).send({ "message": e.message }));
}

function rmfWiseBatching(req, res) {
    logger.trace("Creating RMF wise batch....");
    var params = req.swagger.params;
    var data = req.swagger.params['data'].value;
    var whId = data["whId"];
    var rmfId = data["rmfId"];
    var orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var isPartial = data.isPartial;
    var isExclusiveType = data.isExclusiveType === undefined ? false : data.isExclusiveType;
    var count = data.count;
    var withRetailerPriority = data.withRetailerPriority;
    var remarks = data.remarks;
    var user = req.user.username;
    data.username = user;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    var batch = new Batch();
    batch.network('franchise', whId, rmfId).then(network => {
        var batchCriteria = {
            "source": whId,
            "paymentStatus": "Paid",
            "batchEnabled": true,
            "orderType": orderType,
            "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
            "isExclusiveType": isExclusiveType,
            "franchise.id": { $in: network },
            "subOrders": {
                "$elemMatch": {
                    'status': 'Confirmed',
                    'processed': false,
                    'invoiced': false,
                    'readyForBatching': true,
                    'batchId': "",
                    "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }]
                }
            }
        };

        async.waterfall([
            _buildPipeline(data, batchCriteria),
            _findSubOrderIds,
            _findOrders,
            _generateBatch,
            _assignPerforma,
            _batchAndOrderUpdate], function (err, result) {
                if (err)
                    res.status(400).send({ "message": err.message });
                else
                    res.status(200).send(result);
            });

    }).catch(e => res.status(400).send({ "message": e.message }));
}

function courierWiseBatching(req, res) {
    logger.trace("Creating Courier wise batch....");
    var params = req.swagger.params;
    var data = req.swagger.params['data'].value;
    var whId = data["whId"];
    var courierId = data["courierId"];
    var orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var isPartial = data.isPartial;
    var isExclusiveType = data.isExclusiveType === undefined ? false : data.isExclusiveType;
    var count = data.count;
    var withRetailerPriority = data.withRetailerPriority;
    var remarks = data.remarks;
    var user = req.user.username;
    data.username = user;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    var batch = new Batch();
    batch.network('courier', whId, courierId).then(network => {
        var batchCriteria = {
            "source": whId,
            "paymentStatus": "Paid",
            "batchEnabled": true,
            "orderType": orderType,
            "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
            "isExclusiveType": isExclusiveType,
            "franchise.id": { $in: network },
            "subOrders": {
                "$elemMatch": {
                    'status': 'Confirmed',
                    'processed': false,
                    'invoiced': false,
                    'readyForBatching': true,
                    'batchId': "",
                    "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }]
                }
            }
        };

        async.waterfall([
            _buildPipeline(data, batchCriteria),
            _findSubOrderIds,
            _findOrders,
            _generateBatch,
            _assignPerforma,
            _batchAndOrderUpdate], function (err, result) {
                if (err)
                    res.status(400).send({ "message": err.message });
                else
                    res.status(200).send(result);
            });

    }).catch(e => res.status(400).send({ "message": e.message }));
}

// ASN and location wise batching
function asnWiseBatching(req, res) {

    var params = req.swagger.params;
    var data = req.swagger.params['data'].value;
    var whId = data["whId"];
    var asnNo = data["asnNo"];
    var location = data["location"];
    var area = data["area"];
    var partnerAsnNo = data["partnerAsnNo"];
    var orderType = params["type"] == "b2c" ? "Retail" : "Wholesale";
    var isPartial = data.isPartial;
    var isExclusiveType = data.isExclusiveType === undefined ? false : data.isExclusiveType;
    var count = data.count;
    var withRetailerPriority = data.withRetailerPriority;
    var remarks = data.remarks;
    var user = req.user.username;
    data.username = user;
    data.withRetailerPriority = data.withRetailerPriority === undefined ? true : data.withRetailerPriority;

    let orCondition = [];
    let asnCondition = [];

    if (asnNo) {
        orCondition.push({ 'partnerWmfInfo.asnNo': { $in: [asnNo] } });
        asnCondition.push(asnNo);
    }

    if (partnerAsnNo) {
        orCondition.push({ 'partnerWmfInfo.partnerAsn': { $in: [partnerAsnNo] } });
        asnCondition.push(partnerAsnNo);
    }

    var batchCriteria = null;

    if (asnNo || partnerAsnNo) {
        logger.trace("Creating ASN wise batch....");
        batchCriteria = {
            "source": whId,
            "paymentStatus": "Paid",
            "batchEnabled": true,
            "orderType": orderType,
            "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
            "isExclusiveType": isExclusiveType,
            "isSkWarehouse": false,
            //"$or": orCondition,
            "subOrders": {
                "$elemMatch": {
                    'status': 'Confirmed',
                    'processed': false,
                    'invoiced': false,
                    'readyForBatching': true,
                    'batchId': "",
                    "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }],
                    "asnIds": { $in: asnCondition }
                }
            }
        };
    } else if (location && area) {
        logger.trace("Creating Location/Area wise batch....");
        batchCriteria = {
            "source": whId,
            "paymentStatus": "Paid",
            "batchEnabled": true,
            "orderType": orderType,
            "stockAllocation": isPartial ? { "$nin": ["NotAllocated"] } : { "$in": ["Allocated"] },
            "isExclusiveType": isExclusiveType,
            "isSkWarehouse": false,
            "subOrders": {
                "$elemMatch": {
                    'status': 'Confirmed',
                    'processed': false,
                    'invoiced': false,
                    'readyForBatching': true,
                    'batchId': "",
                    "$or": [{ "performaInvoiceNo": { $exists: false } }, { "performaInvoiceNo": { $eq: "" } }],
                    "snapshots": {
                        "$elemMatch": {
                            "location": location,
                            "area": area
                        }
                    }
                }
            }
        };
    } else {
        res.status(400).send({ message: 'Either ASN No or location details is required for batching ...' });
        return;
    }

    async.waterfall([
        _buildPipeline(data, batchCriteria),
        _findSubOrderIds,
        _findOrders,
        _generateBatch,
        _assignPerforma,
        _batchAndOrderUpdate], function (err, result) {
            if (err)
                res.status(400).send({ "message": err.message });
            else {
                const db = Mongoose.connection;
                db.collection('asns').findOneAndUpdate({ $or: [{ _id: { $in: [asnNo] } }, { partnerASN: { $in: [partnerAsnNo] } }] }, { $set: { batchId: result._id, batchedOn: new Date(), batchedBy: req.user._id } });
                res.status(200).send(result);
            }
        });
}

/*
    - Generic pipeline builder;
 */
function _buildPipeline(_data, _batchCriteria) {
    return function (callback) {
        var batch = new Batch();
        batch.pipeline(_batchCriteria, _data.count, _data.withRetailerPriority).then(_pipeline => {
            callback(null, _data, _pipeline);
        }).catch(e => callback(e));
    };
}

function _findSubOrderIds(data, _pipeline, callback) {
    logger.trace("Option wise Bulk batch creation aggregation pipeline : \n", JSON.stringify(_pipeline));
    orderController.crud.model.aggregate(_pipeline).allowDiskUse(true)
        .then(subOrderData => {
            var subOrderIds = [];
            subOrderData.forEach(el => {
                el.subOrders.forEach(id => subOrderIds.push(id));
            });
            callback(null, data, subOrderIds)
        })
        .catch(e => callback(e))
}

function _findOrders(data, subOrderIds, callback) {
    if (subOrderIds && subOrderIds.length > 0) {
        orderController.crud.model.find({
            "subOrders._id": {
                "$in": subOrderIds
            }
        }).limit(data.count).exec()
            .then((orderDocs) => {
                if (orderDocs && orderDocs.length)
                    callback(null, data, subOrderIds, orderDocs);
                else
                    callback(new Error("Orders not found"));

            }).catch(e => callback(e));
    } else {
        callback(new Error("Orders not found"));
    }
}

function _generateBatch(data, subOrderIds, orderDocs, callback) {
    logger.trace("Generating batch....");
    var batch = {};
    batch.whId = orderDocs[0].source;
    batch.createdBy = data.username;
    batch.type = data.type;
    batch.remarks = data.remarks;
    batch.orderId = [];
    batch.subOrderId = subOrderIds;
    batch.performa = [];
    if (data["partnerAsnNo"]) {
        batch["partnerAsnNo"] = data["partnerAsnNo"];
    }
    batch.noInvoices = 0;
    batch.warehouseAddress = orderDocs[0].warehouseAddress;
    crud.model.create(batch, function (err, batchDoc) {
        if (err)
            callback(err);
        else
            callback(null, data, subOrderIds, orderDocs, batchDoc);
    }).catch(e => callback(e));
}

function _assignPerforma(data, subOrderIds, orders, batch, callback) {
    var performaIds = [];
    //Iteratre orders list;
    Promise.all(orders.map(order => {
        return new Promise((resolve, reject) => {
            var performaGroup = _.groupBy(order.subOrders, "invoice_seperately");
            async.waterfall([
                _commonPerformaSuborders(performaIds, performaGroup, order, subOrderIds, batch),
                _differentPerformaSubOrders
            ], function (err, performaIds, performaGroup, order, batch) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    })).then(result => {
        callback(null, data, subOrderIds, orders, batch, performaIds);
    }).catch(e => callback(e));
}

function _commonPerformaSuborders(performaIds, performaGroup, order, subOrderIds, batch) {
    return function (callback) {

        var commonPerformaSubOrders = performaGroup['false'];//all suborders with invoice_separately = false ; i,e same performa;

        if (commonPerformaSubOrders && commonPerformaSubOrders.length) {
            commonPerformaSubOrders = commonPerformaSubOrders.filter(subOrder => subOrderIds.indexOf(subOrder._id) > -1 ? true : false);
            getPerformaInvoiceNumber()
                .then(performaId => {
                    _.each(commonPerformaSubOrders, subOrder => {
                        order.status = "Processing";
                        subOrder.internalStatus = "BatchEnabled";
                        subOrder.processed = true;
                        subOrder.status = "Processing";
                        subOrder.batchId = batch._id;
                        subOrder.performaInvoiceNo = performaId;
                        performaIds.push(performaId);
                    });
                    callback(null, performaIds, performaGroup, order, subOrderIds, batch);
                })
                .catch(e => callback(e));
        } else {
            callback(null, performaIds, performaGroup, order, subOrderIds, batch);
        }
    }
}

function _differentPerformaSubOrders(performaIds, performaGroup, order, subOrderIds, batch, callback) {
    var differentPerformaSuborders = performaGroup['true'];//all suborders with invoice_separately = true ; i,e different performa's;
    if (differentPerformaSuborders && differentPerformaSuborders.length) {
        differentPerformaSuborders = differentPerformaSuborders.filter(subOrder => subOrderIds.indexOf(subOrder._id) > -1 ? true : false);

        var queue = async.queue(function (subOrder, queueCB) {
            getPerformaInvoiceNumber().then(performaId => {
                order.status = "Processing";
                subOrder.internalStatus = "BatchEnabled";
                subOrder.processed = true;
                subOrder.status = "Processing";
                subOrder.batchId = batch._id;
                subOrder.performaInvoiceNo = performaId;
                performaIds.push(performaId);
                queueCB(null);
            }).catch(e => queueCB(e));
        });

        queue.drain = function () {
            callback(null, performaIds, performaGroup, order, batch);
        }

        queue.push(differentPerformaSuborders, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
        });

    } else {
        callback(null, performaIds, performaGroup, batch);
    }
}

function _batchAndOrderUpdate(data, subOrderIds, orders, batch, performaIds, callback) {
    performaIds = _.uniq(performaIds);
    var performaList = [];
    batch.orderId = [];
    batch.noInvoices = 0;
    //construct performa list for batch and update the batch;
    performaIds.map(performId => {
        var performa = {
            subOrderId: [],
            reserved: []
        };
        orders.map(order => {
            var flag = false;
            order.subOrders.map(subOrder => {
                if (subOrder.performaInvoiceNo == performId) {
                    flag = true;
                    performa.performaId = performId;
                    performa.orderId = order._id;
                    performa.status = "Pending";
                    var reserved = {
                        id: subOrder._id,
                        snapshots: subOrder.snapshots
                    }
                    performa.reserved.push(reserved);
                    performa.subOrderId.push(subOrder._id);
                }
            });
            if (flag) batch.orderId.push(order._id);
        });
        performaList.push(performa);
    });
    //Update all orders one-by-one;
    Promise.all(orders.map(order => {
        return new Promise((resolve, reject) => {
            order.save(function (err, doc) {
                if (err)
                    reject(err);
                else
                    resolve(doc);
            });
        });
    })).then(() => {
        batch.performa = performaList;
        batch.noInvoices = performaList.length;
        batch.save(function (err, doc) {
            if (err)
                callback(err);
            else
                callback(null, doc)
        });
    }).catch(e => callback(e));
}

function cancelBatch(req, res) {
    var params = crud.swagMapper(req)["data"];
    var batchId = params["batchId"];
    var status = params.status;

    crud.model.aggregate([{
        $match: {
            _id: batchId,
            "status": {
                "$nin": ["Completed", "Cancelled"]
            }
        }
    },
    {
        $unwind: "$performa"
    },
    {
        $match: {
            "performa.status": {
                "$in": ["Pending", "Created"]
            }
        }
    }
    ]).allowDiskUse(true)
        .then((doc) => {
            if (doc.length > 0) {
                var index = 0;
                async.whilst(function () {
                    return doc[index];
                }, function (callback) {
                    var elem = doc[index];

                    orderController.crud.model.aggregate([{
                        $match: {
                            "subOrders.performaInvoiceNo": elem.performa.performaId,
                            "subOrders.batchId": batchId,
                            "subOrders.status": "Processing"
                        }
                    },
                    {
                        $unwind: "$subOrders"
                    },
                    {
                        $match: {
                            "subOrders.performaInvoiceNo": elem.performa.performaId
                        }
                    }
                    ]).allowDiskUse(true)
                        .then(d => {
                            if (d.length > 0) {
                                var i = 0;
                                async.whilst(function () {
                                    return d[i];
                                }, function (cb) {
                                    var el = d[i];

                                    orderController.crud.model.update({
                                        "subOrders.id": el.subOrders.id,
                                        "subOrders.performaInvoiceNo": elem.performa.performaId
                                    }, {
                                            $set: {
                                                "subOrders.$.batchId": "",
                                                "subOrders.$.internalStatus": "Confirmed",
                                                "subOrders.$.processed": false,
                                                "subOrders.$.status": "Confirmed",
                                                "subOrders.$.batchingTime": null,
                                            }
                                        }).exec().then(d => {
                                            orderController.crud.model.update({
                                                "subOrders.id": el.subOrders.id,
                                                "subOrders.performaInvoiceNo": elem.performa.performaId
                                            }, {
                                                    $unset: {
                                                        "subOrders.$.performaInvoiceNo": 1
                                                    }
                                                }).exec().then(data => {
                                                    i++;
                                                    cb();
                                                })
                                        })

                                }, function (e) {
                                    crud.model.update({
                                        "performa.performaId": elem.performa.performaId
                                    }, {
                                            $set: {
                                                "performa.$.status": "Cancelled"
                                            }
                                        }).exec().then(batchData => {
                                            index++;
                                            callback();
                                        })
                                })
                            }
                        })
                }, function (err) {

                    crud.model.findOne({ "_id": batchId }).exec().then(doc => {
                        doc.save(function (err, response) {
                            if (!err) {
                                res.status(200).json({
                                    "message": "Batch Cancelled."
                                });
                            } else {
                                res.status(500).json(err);
                            }
                        })
                    })

                })
            } else {
                res.status(400).json({
                    "message": "Cancellation failed"
                });
            }
        }).catch((err) => {
            res.status(500).json({
                "message": err
            });
        });
}

function cancelPerforma(req, res) {
    var performaInvoiceNo = crud.swagMapper(req)["performaInvoiceNo"];
    async.waterfall([
        _getBatchByPerforma(performaInvoiceNo),
        _onCancelPerformaValidation,
        _findOrdersByPerforma,
        _cancelPerforma
    ], function (err, result) {
        if (err)
            res.status(400).send({ message: err.message });
        else
            res.status(200).send({ "message": `Performa with Id ${performaInvoiceNo} cancelled successfully.` });
    });
}

function _getBatchByPerforma(_performaNo) {
    return function (callback) {
        crud.model.findOne({ "performa.performaId": _performaNo, "performa.status": { "$in": ["Pending"] }, "status": { "$in": ["Pending", "Created", "Processing"] } })
            .then(_batch => callback(null, _performaNo, _batch)).catch(e => callback(e));
    }
}

function _onCancelPerformaValidation(_performaNo, _batch, callback) {
    if (_batch && _batch.performa.length)
        callback(null, _performaNo, _batch);
    else
        callback(new Error(`No performa found for ${_performaNo}`));
}

function _findOrdersByPerforma(_performaNo, _batch, callback) {
    orderController.crud.model.findOne({ "subOrders.performaInvoiceNo": _performaNo, "subOrders.status": "Processing" }).exec()
        .then(order => {
            if (order)
                callback(null, _performaNo, _batch, order);
            else
                callback(new Error(`No order found for the perfoma No. ${_performaNo}`));
        }).catch(e => callback(e));
}

function _cancelPerforma(_performaNo, _batch, _order, callback) {

    var setPerformaLevelFlags = function (performa) {
        performa.status = 'Cancelled';
        _batch.noInvoices = _batch.noInvoices - 1;
    };

    var setsubOrderLevelFlags = function (subOrderList) {
        subOrderList.map(subOrder => {
            subOrder.performaInvoiceNo = "";
            subOrder.batchingTime = null;
            subOrder.batchId = "";
            subOrder.internalStatus = "Confirmed";
            subOrder.processed = false;
            subOrder.status = "Confirmed";
        });
    };
    //find suborder with performa;
    //var subOrder = _.find(_order.subOrders, { 'performaInvoiceNo': _performaNo });
    var subOrderList = _order.subOrders.filter(sOrd => sOrd.performaInvoiceNo === _performaNo);

    if (!subOrderList && !subOrderList.length)
        callback(new Error(`No suborder found with performa No. ${_performaNo}`));

    //find performa from batch with performaNo.
    var performa = _.find(_batch.performa, { 'performaId': _performaNo });

    if (!performa)
        callback(new Error(`Invalid Performa invoice no.`));

    //update suborders;
    setsubOrderLevelFlags(subOrderList);
    //update performa;
    setPerformaLevelFlags(performa);

    //save  batch;
    var batchPromise = new Promise((resolve, reject) => {
        _batch.save(function (err, doc) {
            if (err)
                reject(err);
            else
                resolve(doc);
        });
    }).catch(e => callback(e));
    //save order
    var orderPromise = new Promise((resolve, reject) => {
        var statusCount = _.countBy(_order.subOrders, { status: "Processing" });
        _order.status = statusCount && statusCount.true ? "Processing" : "Confirmed";
        _order.save(function (err, doc) {
            if (err)
                reject(err);
            else
                resolve(doc);
        }).catch(e => callback(e));
    });

    Promise.all([batchPromise, orderPromise]).then(result => callback(null, result)).catch(e => callback(e));
}

/*
    - This function is used to cancel performa internally , that is within this service it self and not by HTTP request;
    - The use case is as follows: On invoice cancellation , we also need to cancel the invoiced performa ;
 */
function internalPerformaCancellation(performaInvoiceNo) {
    return new Promise((resolve, reject) => {

        if (!performaInvoiceNo) {
            reject(new Error("Cannot cancel performa , performa No cannot be empty."));
            return;
        }

        async.waterfall([
            _getBatchByPerforma(performaInvoiceNo),
            _onCancelPerformaValidation,
            _findOrdersByPerforma,
            _cancelPerforma
        ], function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        });

    });
}

function orderToBatch(subOrderIds, orders, remarks, user, type) {
    var batch = {};
    batch.whId = orders[0].source;
    batch.createdBy = user;
    batch.type = type;
    batch.remarks = remarks;
    batch.orderId = [];
    batch.subOrderId = [];
    batch.performa = [];
    batch.noInvoices = 0;
    batch.warehouseAddress = orders[0].warehouseAddress;
    return new Promise(resolve => crud.model.create(batch, (err, _batch) => { //
        orders.forEach(order => {
            order.subOrders.forEach(_suborder => {
                if (subOrderIds.indexOf(_suborder._id) > -1 && _suborder.readyForBatching == true && _suborder.invoiced == false) {
                    _batch.subOrderId.push(_suborder._id);
                    _suborder.batchId = _batch._id;
                    batch = _batch;
                }
            });
            if (_batch.subOrderId.length)
                batch.orderId.push(order._id);
        });
        _batch.save();
        batch = _batch;
        resolve();
    })).then(() => orders.map(el => generatePerformaInvoiceNumber(el, subOrderIds)))
        .then(_orders => {
            return new Promise(resolvePromise => {
                Promise.all(_orders).then(function (_d) {
                    batch.noInvoices = _d.reduce((a, b) => a + b, 0);
                    var performaIds = [];
                    orders.forEach(order => {
                        order.subOrders.forEach(_suborder => {
                            if (_suborder.batchId == batch._id)
                                performaIds.push(_suborder.performaInvoiceNo);
                        });
                    });
                    if (performaIds.length > 0) {
                        return new Promise(resolve => {
                            performaIds = _.uniqBy(performaIds, function (e) {
                                return e;
                            });
                            var batchPromise = performaIds.map(el => {
                                var prfma = {};
                                prfma.performaId = el;
                                prfma.subOrderId = [];
                                prfma.reserved = [];
                                return new Promise(resolve1 => {
                                    orders.forEach(order => {
                                        var orderPromise = order.subOrders.map(_suborder => {
                                            var prdSnapshot = {};
                                            if (_suborder.performaInvoiceNo == el) {
                                                prfma.subOrderId.push(_suborder._id);
                                                prfma.delivery_chalan = (_suborder.delivery_chalan) ? _suborder.delivery_chalan : false;
                                                prfma.orderId = order._id;
                                                prdSnapshot.id = _suborder._id;
                                                prdSnapshot.snapshots = _suborder.snapshots;
                                                prfma.reserved.push(prdSnapshot);
                                                resolve1(prfma);
                                            }
                                        });
                                    });
                                    Promise.all(orderPromise).then((pfinstance) => {
                                        resolve(pfinstance);
                                    });
                                });
                            });
                            Promise.all(batchPromise)
                                .then((bdata) => {
                                    batch.performa = bdata;
                                    batch.save();
                                    resolvePromise(batch);
                                });
                        });
                    }
                });
            });
        })
        //.then(() => batch)
        .catch(err => logger.error(err));
}

function generatePerformaInvoiceNumber(order, subOrderIds) {
    var proformaCount = 1;
    return new Promise(resolve => {
        order.processed = true;
        order.status = "Processing";

        var PerformaOders = order.subOrders.filter(el => subOrderIds.indexOf(el._id) > -1 ? true : false);
        if (PerformaOders.length == 1) {
            getPerformaInvoiceNumber()
                .then(invoiceTogether => {
                    return new Promise(_resolve => {
                        var promise = PerformaOders.map(subOrder => {
                            if (subOrder.readyForBatching == true) {
                                subOrder.internalStatus = "BatchEnabled";
                                subOrder.processed = true;
                                subOrder.status = "Processing";
                                subOrder.performaInvoiceNo = invoiceTogether;
                                _resolve();
                            }
                        });

                        Promise.all(promise)
                            .then(() => order.save())
                            .then(() => resolve(proformaCount));
                    });
                });
        } else if (PerformaOders.length > 1) {
            getPerformaInvoiceNumber()
                .then(invoiceTogether => {
                    return new Promise(_resolve => {
                        var promise = PerformaOders.map(subOrder => {
                            if (subOrder.readyForBatching == true) {
                                subOrder.internalStatus = "BatchEnabled";
                                subOrder.processed = true;
                                subOrder.status = "Processing";
                                //subOrder.invoice_seperately = false;
                                if (subOrder.invoice_seperately) {
                                    proformaCount += 1;
                                    return getPerformaInvoiceNumber()
                                        .then(invoiceSeperately => {
                                            subOrder.performaInvoiceNo = invoiceSeperately;
                                        })
                                        .then(() => _resolve());
                                } else {
                                    subOrder.performaInvoiceNo = invoiceTogether;
                                    _resolve();
                                }
                            } else {
                                delete subOrder;
                                _resolve();
                            }
                        });
                        Promise.all(promise).then(() => order.save()).then(() => resolve(proformaCount));
                    });
                });
        } else {
            _resolve();
        }
    });
}

function getPerformaInvoiceNumber() {
    return new Promise(resolve => {
        cuti.counter.getCount("perfromaInvoice", null, (err, doc) => {
            resolve("PR" + doc.next);
        });
    });
}

function getBatchList(req, res) {
    crud.find({}).limit(10).sort({
        status: -1
    })
        .exec()
        .then(function (batchData) {
            if (batchData.length > 0) {
                res.status(200).send(batchData);
            } else {
                res.status(200).json({
                    message: "No data found."
                });
            }
        })
        .catch(function (err) {
            logger.error(err);
        });
}

/*
    - This function serves the view Batch API endPoint;
    - Renders product wise and order wise procurement list;
 */
function viewBatch(req, res) {

    var batchId = req.swagger.params['batchId'].value;
    var user = { "username": req.user.username, "name": req.user.name };
    /* TODO:
        - Get batch by batch Id;
        - Get subOrders by subOrderIds list from batch doc;
        - Prepare product procurement list for pending performas;
        - prepare order Procurement list for pending performas;
     */
    async.waterfall([
        _fetchBatch(batchId, user),
        _fetchSubOrders,
        _productProcurementList,
        _orderProcurementList
    ], function (err, result) {
        if (err)
            res.status(400).send({ "message": err.message });
        else
            res.status(200).send(result);
    });

    /* Get Batch By Id */
    function _fetchBatch(batchId, user) {
        return function (callback) {
            crud.model.findOne({ "_id": batchId }).lean().exec()
                .then(batch => {
                    if (batch) {
                        batch.loggedInUser = user;
                        callback(null, batch);
                    }
                    else
                        callback(new Error(`Batch not found with Id : ${batchId}`));
                }).catch(e => callback(e));
        }
    }

    /* Extract all suborders for this batch */
    function _fetchSubOrders(batch, callback) {
        var subOrderIds = batch.subOrderId;
        Mongoose.models['omsMaster'].aggregate([{
            "$match": {
                "subOrders": {
                    "$elemMatch": {
                        "_id": { "$in": subOrderIds },
                    }
                }
            },
        },
        { "$unwind": "$subOrders" },
        {
            "$match": {
                "subOrders._id": { "$in": subOrderIds },
            }
        },
        {
            "$project": {
                "subOrders": 1,
                "franchise": 1,
                "date": 1,
                "transactionId": 1
            }
        }
        ]).exec().then(orders => {
            if (orders && orders.length) {
                batch.performa.map(_performa => {
                    _performa.subOrders = [];
                    _.each(orders, order => {
                        if (order.subOrders.performaInvoiceNo === _performa.performaId) {
                            _performa.franchise = order.franchise;
                            _performa.OrderedOn = order.date;
                            _performa.transactionId = order.transactionId;
                            _performa.subOrders.push(order.subOrders);
                        } else if (_performa.status === "Cancelled" && _performa.subOrderId.indexOf(order.subOrders._id) > -1) {
                            _performa.franchise = order.franchise;
                            _performa.OrderedOn = order.date;
                            _performa.transactionId = order.transactionId;
                            _performa.subOrders.push(order.subOrders);
                        }
                    })
                });
                callback(null, batch);
            } else {
                callback(new Error(`Could not get batched orders`));
            }
        }).catch(e => callback(e));
    }

    /*TODO:
        - Product Name = product name + offer text; 
        - Group by - ProductId + Mrp + Location + Area + Rack + Bin
        - Get location details by Id and display names;
        - Always pick profucts of performas which are in pending state , as completed performa products need not be procured as they are already invoiced;
     */
    function _productProcurementList(batch, callback) {
        //Get performa's in pending state to prepare procurement list
        var performaList = batch.performa.filter(_performa => _performa.status === "Pending" ? true : false);

        if (!performaList || !performaList.length) {
            // All performa's are completed ; skip generation of procurement list;
            callback(null, batch, null, null);
            return;
        }

        var areaIds = [];
        var snapShotList = [];
        var productProcurementList = [];

        performaList.map(performa => _.each(performa.subOrders, subOrder => {

            subOrder.snapshots.map(snapShot => {
                if (snapShot.quantity > 0) {
                    // productId + Mrp + location + AreaId + RackId + BinId;
                    var product = _.find(subOrder.products, { "id": snapShot.productId });
                    snapShot.name = product ? (product.offer && product.offer != '') ? (product.name + " ( " + product.offer + ")") : product.name : null;
                    snapShot.orderId = performa.orderId;
                    snapShot.performa = performa.performaId;
                    snapShot.key = `${snapShot.productId}_${snapShot.mrp}_${snapShot.location}_${snapShot.area}_${snapShot.rackId}_${snapShot.binId}`;
                    snapShot.signature = `${performa.orderId}_${performa.performaId}`;
                    snapShotList.push(snapShot);
                    areaIds.push(snapShot.area);
                }
            });

        }));

        var procurementGroup = _.groupBy(snapShotList, "key");

        areaIds = _.uniq(areaIds);
        var path = `/${batch.whId}/area?filter=${encodeURIComponent(JSON.stringify({ "_id": { "$in": areaIds } }))}&count=${areaIds.length}`;
        _fireHttpRequest("wh", path, "GET", null).then(areaList => {
            Object.keys(procurementGroup).map(key => {
                var list = procurementGroup[key];
                if (list && list.length) {
                    var entity = list[0];
                    var _location = extractInventoryLocation(areaList, entity.location, entity.area, entity.rackId, entity.binId);
                    var totalQty = _.sumBy(list, "quantity");
                    var entry = {
                        id: entity.productId,
                        name: entity.name,
                        orderId: entity.orderId,
                        quantity: entity.quantity,
                        perfoma: entity.performa,
                        mrp: entity.mrp,
                        quantity: totalQty,
                        location: _location,
                        key: key
                    }
                    productProcurementList.push(entry)
                }

            });
            batch.productProcurementList = productProcurementList;
            callback(null, batch, snapShotList, areaList);
        }).catch(e => callback(e));
    }

    /* TODO:
     */
    function _orderProcurementList(batch, snapShotList, areaList, callback) {

        if (!batch.productProcurementList || !batch.productProcurementList.length || !snapShotList || !snapShotList.length) {
            callback(null, batch);
            return;
        }

        var orderProcurementList = [];
        var orderProcurementGroup = _.groupBy(snapShotList, "signature");

        Object.keys(orderProcurementGroup).map(key => {
            var orderList = orderProcurementGroup[key];
            if (orderList && orderList.length) {
                var orderPickEntry = {
                    "orderId": orderList[0].orderId,
                    "performaId": orderList[0].performa,
                    "pickList": [],
                    "quantity": 0
                }

                var productWiseGroup = _.groupBy(orderList, "key");

                Object.keys(productWiseGroup).map(key => {
                    var list = productWiseGroup[key];
                    var entity = list[0];
                    var _location = extractInventoryLocation(areaList, entity.location, entity.area, entity.rackId, entity.binId);
                    var totalQty = _.sumBy(list, "quantity");
                    var entry = {
                        id: entity.productId,
                        name: entity.name,
                        orderId: entity.orderId,
                        quantity: entity.quantity,
                        perfoma: entity.performa,
                        mrp: entity.mrp,
                        quantity: totalQty,
                        location: _location,
                        key: key
                    }
                    orderPickEntry.pickList.push(entry);
                });
                orderPickEntry.quantity = _.sumBy(orderPickEntry.pickList, "quantity");
                orderProcurementList.push(orderPickEntry);
            }

        });

        batch.orderProcurementList = orderProcurementList;
        callback(null, batch);
    }
}

function extractInventoryLocation(areaList, location, areaId, rackId, binId) {
    if (!areaList || !areaList.length) {
        return null;
    }

    var _area = _.find(areaList, { "_id": areaId });

    if (!_area) {
        return null;
    }

    var _rack = _.find(_area.racks, { "_id": rackId });

    if (!_rack) {
        return null;
    }

    var _bin = _.find(_rack.bins, { "_id": binId });

    if (!_bin) {
        return null;
    }

    var _location = `${location}/${_area.name}/${_rack.name}/${_bin.name}`;

    return _location;
}

function viewBatchDet(req, res) {
    var batchId = crud.swagMapper(req)["batchId"];
    // logger.error("batchId=> ", batchId);
    // var batchId = 'BR201711093'; for testing 
    async.waterfall([
        _getbatchDetails(batchId),
        _getProductDetails
    ], function (err, success) {
        if (err) {
            // logger.error("err",err);
            res.status(404).json(err);
        } else if (success) {
            // logger.info("resp",success);
            res.status(200).json(success);
        }

    });
}

function _getbatchDetails(batchId) {
    return function (callback) {
        crud.model.findOne({
            "_id": batchId
        }).exec()
            .then(batchData => {
                if (batchData)
                    callback(null, batchData);
                else
                    callback("Invalid BatchId", "");
            });
    };
}

function _getProductDetails(batchData, callback) {
    var batchData = batchData.toObject();
    var batchQueue = async.queue(function (performa, callbackbatch) {
        getPerformaDetails(performa, function (error, response) {
            performa = response;
            callbackbatch(null, performa);
        });
    }, 1);

    batchQueue.drain = function () {
        callback(null, batchData);
    };

    _.each(batchData.performa, function (performa) {
        batchQueue.push(performa, function (err) {
            if (err) logger.error(err);
        });
    });

}

function getPerformaDetails(performa, cb) {
    performa.subOrders = [];
    performa.totalQty = 0;
    var performaQueue = async.queue(function (reserved, callbackprfrma) {
        // orderController.crud.model.findOne({"subOrders._id":reserved.id}).exec() // original query

        orderController.crud.model.aggregate([{
            $match: {
                "subOrders._id": reserved.id
            }
        },
        {
            $unwind: "$subOrders"
        },
        {
            $match: {
                "subOrders._id": reserved.id
            }
        },
        {
            $project: {
                "distinct": 1,
                "subOrders": 1,
                "franchise": 1,
                "date": 1,
                "transactionId": 1
            }
        }
        ]).allowDiskUse(true)
            .then((subOrderData) => {
                var subOrderData = subOrderData[0];
                performa.franchise = subOrderData.franchise;
                performa.OrderedOn = subOrderData.date;
                performa.transactionId = subOrderData.transactionId;

                // async.each(subOrderData[0].subOrders, function(_so, callbackso){
                //         //logger.error("_so=? ", _so);
                //         console.log("subOrder cb=====out==>", _so, reserved.id);                
                //         if(_so && _so == reserved.id)
                //         {
                //             //console.log("subOrder cb======in==>", _so==reserved.id);
                //             performa.subOrders.push(_so);
                //             performa.totalQty += _so.quantity;
                //             //console.log("performa==> ", performa);
                //             callbackso(null,performa);
                //         } else {
                //             console.log("==> in else");
                //             callbackso(null, performa);
                //         }

                //     }, function(err, successP) {
                //         //console.log("err, sucP=> ", err, successP);
                //         /* if(successP) {
                //             console.log("suc=> ", successP);
                //             callbackprfrma(null,successP);
                //         } else {
                //             console.log("err=> ", err);
                //             callbackprfrma(null,successP);
                //         } */
                //         console.log("succ=> ", successP);
                //         callbackprfrma(null, successP);

                //     }
                // );
                if (subOrderData.subOrders._id == reserved.id) {
                    performa.subOrders.push(subOrderData.subOrders);
                    performa.totalQty += subOrderData.subOrders.quantity;
                    callbackprfrma(null, performa);
                } else {
                    callbackprfrma(null, performa);
                }
            });
    }, 1);

    performaQueue.drain = function () {
        cb(null, performa);
    };

    _.each(performa.reserved, function (reserved) {
        performaQueue.push(reserved, function (err) {
            if (err) logger.error(err);
        });
    });
}

function cancelNonOrderLinkedPerforma(req, res) {

    crud.model.find({}).exec().then(
        d => {
            if (d.length > 0) {
                var index = 0;
                async.whilst(function () {
                    return d[index];
                }, function (callback) {
                    var elem = d[index];

                    if (elem.performa.length > 0) {
                        var performa = elem.performa;
                        var i = 0;
                        async.whilst(function () {
                            return performa[i];
                        }, function (cb) {
                            var el = performa[i];
                            orderController.crud.model.find({
                                "subOrders.performaInvoiceNo": el.performaId
                            }).exec().then(pData => {
                                if (pData.length > 0) {
                                    i++;
                                    cb();
                                } else {

                                    crud.model.update({
                                        "performa.performaId": el.performaId
                                    }, {
                                            $set: {
                                                "performa.$.status": "Cancelled"
                                            }
                                        }).exec()
                                        .then(data => {
                                            i++;
                                            cb();
                                        })
                                }
                            })

                        }, function (err) {
                            index++;
                            callback();

                        })
                    } else {
                        index++;
                        callback();
                    }

                }, function (e) {
                    res.status(200).json({
                        "message": "Updated successfully"
                    });
                })

            } else {
                res.status(404).json({
                    "message": "No Batches found"
                });
            }
        }
    )
}

/**
 * Updating Counter of Pick List Print
 * @param {*} req 
 * @param {*} res 
 */
function updatePickListPrintCount(req, res) {

    var batchId = crud.swagMapper(req)["batchId"];
    crud.model.findOneAndUpdate({ "_id": batchId }, { $inc: { pickListPrintCount: 1 } }, { new: true })
        .exec().then(result => {
            res.status(200).send(result);
        }).catch(e => res.status(400).send({ message: e.message }));


}

function internalBatchCreation(whId, orderId, orderType, isPartial, remarks, count, user) {
    logger.trace("BATCH: Executing internal batch creation for order -", orderId);
    return new Promise((resolve, reject) => {
        if (!orderId) {
            reject(new Error(`Order Id is required to create batch.`));
            return;
        }
        if (!orderType) {
            reject(new Error(`Order type is required to create batch.`));
            return;
        }
        if (!whId) {
            reject(new Error(`Warehouse Id is required for batch creation.`));
            return;
        }

        count = count ? count : 1;

        var data = {
            "username": user,
            "type": orderType,
            "remarks": remarks,
            "orderType": orderType,
            "count": count
        };

        var _stockAllocation = null;

        if (!isPartial) {
            _stockAllocation = "Allocated";
        }
        else {
            _stockAllocation = { $nin: ["NotAllocated"] };
        }

        var _pipeLine = [{
            $match: {
                "_id": orderId,
                "paymentStatus": "Paid",
                "source": whId,
                "orderType": orderType,
                "subOrders.status": "Confirmed",
                "subOrders.processed": false,
                "subOrders.readyForBatching": true,
                "subOrders.batchId": "",
                "stockAllocation": _stockAllocation,
                "batchEnabled": true,
                "subOrders.invoiced": false,
            }
        },
        {
            $unwind: "$subOrders"
        },
        {
            $match: {
                "_id": orderId,
                "paymentStatus": "Paid",
                "orderType": orderType,
                "subOrders.status": "Confirmed",
                "subOrders.processed": false,
                "subOrders.readyForBatching": true,
                "subOrders.batchId": "",
                "stockAllocation": _stockAllocation,
                "batchEnabled": true,
                "subOrders.invoiced": false,
            }
        },
        {
            $project: {
                "distinct": 1,
                "subOrders._id": 1
            }
        },
        {
            $group: {
                _id: "$_id",
                subOrders: {
                    $push: "$subOrders._id"
                }
            }
        },
        {
            $limit: count
        }
        ]

        async.waterfall([
            _internalBatchParams(data, _pipeLine),
            _findSubOrderIds,
            _findOrders,
            _generateBatch,
            _assignPerforma,
            _batchAndOrderUpdate
        ], function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        });

    });
}

function _internalBatchParams(data, _pipeLine) {
    return function (callback) {
        callback(null, data, _pipeLine);
    };
}

/**
 * Get all the batches related to an order
 * @author Robin C Samuel <robin.samuel@storeking.in>
 * @since 4 MAY 2018
 * 
 */
function batchesForOrder(req, res) {
    var params = crud.swagMapper(req);
    var orderId = params.orderId;

    crud.model.aggregate(
        { $match: { 'performa': { "$elemMatch": { 'orderId': orderId } } } },
        { $unwind: "$performa" },
        { $match: { 'performa.orderId': orderId } },
        { $unwind: "$performa.subOrderId" },
        { $project: { perfomaId: '$performa.performaId', type: 1, suberOrderId: "$performa.subOrderId", orderId: "$performa.orderId", createdAt: 1, lastUpdated: 1, createdBy: 1, remarks: 1, modifiedBy: 1, status: "$performa.status" } }
    ).then(_batches => {
        res.send(_batches);
    }).catch(_er => {
        logger.error(_er);
        res.status(500).send({ message: "Something went wrong" });
    })

}

/** */
function cancelAndInsertNewPerforma(orderId, batchId, performId, subOrderId) {
    return new Promise((resolve, reject) => {

        var orderPromise = new Promise((resolve, reject) => {
            Mongoose.models['omsMaster'].findOne({ _id: orderId, status: { $nin: ['Cancelled'] } }).exec().then(order => {
                if (order) {
                    resolve(order);
                } else {
                    reject(new Error(`Order not found with Id ${orderId} for performa udpate..`));
                }
            }).catch(e => reject(e));
        });

        var batchPromise = new Promise((resolve, reject) => {
            crud.model.findOne({ _id: batchId }).exec().then(batch => {
                if (batch) {
                    resolve(batch);
                } else {
                    reject(new Error(`Batch not found with Id ${batchId} for performa udpate ${performId}..`));
                }
            }).catch(e => reject(e));
        });

        Promise.all([orderPromise, batchPromise]).then(result => {
            var order = result && result.length ? result[0] : null;
            var batch = result && result.length ? result[1] : null;

            console.log(`BATCH INSERT ----------------------[Batch ID: ${batchId} |performa Id ${performId} | suborderId ${subOrderId}]`);

            var subOrderIds = order.subOrders.filter(s => s.batchId === batchId && s.performaInvoiceNo === performId && s.status === 'Processing' && s.readyForBatching).map(s => s._id);
            var performa = _.find(batch.performa, { performaId: performId });

            var existingNewPerforma = _.find(batch.performa, el => {
                let isSubOrderIdsExist = false;
                if (el.status === 'Pending' && el.performaId !== performId && el.orderId === orderId && el.subOrderId.indexOf(subOrderId) < 0) {
                    return true;
                } else {
                    return false;
                }
            });

            if (performa && performa.status === 'Pending' && !existingNewPerforma) {
                getPerformaInvoiceNumber().then(newPerformaId => {

                    var subOrder = _.find(order.subOrders, s => {
                        if (s._id === subOrderId && s.batchId === batchId && s.performaInvoiceNo === performId && s.status === 'Processing' /* && s.readyForBatching */) {
                            return true;
                        }
                    });

                    performa.status = 'Cancelled';
                    let newPerforma = _.cloneDeep(performa.toObject());
                    newPerforma.status = 'Pending';
                    newPerforma.performaId = newPerformaId;
                    newPerforma.reserved = [];
                    newPerforma.subOrderId = [subOrderId];

                    if (!subOrder) {
                        logger.error(`Suborder not found---------`, JSON.stringify(order.subOrders));
                    }

                    subOrder.performaInvoiceNo = newPerformaId;
                    let reservedSnapShots = [];
                    subOrder.snapshots.map(_snapshot => {
                        if (_snapshot.quantity > 0) {
                            reservedSnapShots.push(_snapshot);
                        }
                    });

                    newPerforma.reserved.push({
                        id: subOrder._id,
                        snapshots: reservedSnapShots
                    });

                    batch.performa.push(newPerforma);

                    /*  batch.save(function (err, updatedBatch) {
                         if (err) {
                             reject(err);
                         } else {
                             order.save(function (err, updatedOrder) {
                                 if (err) {
                                     reject(err);
                                 } else {
                                     resolve(updatedOrder);
                                 }
                             });
                         }
                     }); */

                    /*   var payload = { data: batch };
                      var headers = { masterName: 'oms' };
  
                      var internalizer = cuti.request.httpInternalizer(headers, payload, batch, function (err, result) {
                          if (err) {
                              logger.error("batch internalizer update error ----------------", err);
                              reject(err);
                          } else {
                             
                              console.log("Batch data on update-------------", JSON.stringify(result));
  
                              var orderPayload = { data: order };
                              var headers = { masterName: 'oms' };
  
                              var orderInternalizer = cuti.request.httpInternalizer(headers, orderPayload, order, function (err, result) {
                                  if (err) {
                                      logger.error("order internalizer update error ----------------", err);
                                      reject(err);
                                  } else {
                                      resolve(result);
                                  }
                              });
  
                              orderController.crudder.update(orderInternalizer.req, orderInternalizer.res);
                          }
                      });
  
                      crud.update(internalizer.req, internalizer.res); */

                    updateOrderAndBatch(batch, order);

                }).catch(e => reject(e));

            } else if (existingNewPerforma && performa && performa.status === 'Cancelled') {

                var subOrder = _.find(order.subOrders, s => {
                    if (s._id === subOrderId && s.batchId === batchId && s.performaInvoiceNo === performId && s.status === 'Processing' /* && s.readyForBatching */) {
                        return true;
                    }
                });

                if (!subOrder) {
                    logger.error(`Suborder not found---------`, JSON.stringify(order.subOrders));
                }


                subOrder.performaInvoiceNo = existingNewPerforma.performaId;
                existingNewPerforma.subOrderId.push(subOrderId);
                let reservedSnapShots = [];
                subOrder.snapshots.map(_snapshot => {
                    if (_snapshot.quantity > 0) {
                        reservedSnapShots.push(_snapshot);
                    }
                });

                let exisitngReserveRef = _.find(existingNewPerforma.reserved, { id: subOrderId });
                if (!exisitngReserveRef) {
                    existingNewPerforma.reserved.push({
                        id: subOrderId,
                        snapshots: reservedSnapShots
                    });
                } else {
                    exisitngReserveRef.snapshots = exisitngReserveRef.snapshots.concat(reservedSnapShots);
                }

                /*  batch.save(function (err, updatedBatch) {
                     if (err) {
                         reject(err);
                     } else {
                         order.save(function (err, updatedOrder) {
                             if (err) {
                                 reject(err);
                             } else {
                                 resolve(updatedOrder);
                             }
                         });
                     }
                 }); */

                /*   var payload = { data: batch };
                  var headers = { masterName: 'oms' };
  
                  var internalizer = cuti.request.httpInternalizer(headers, payload, batch, function (err, result) {
                      if (err) {
                          logger.error("batch internalizer update error ----------------", err);
                          reject(err);
                      } else {
                          var orderPayload = { data: order };
                          var headers = { masterName: 'oms' };
  
                          console.log("Batch data on update-------------", JSON.stringify(result));
  
                          var orderInternalizer = cuti.request.httpInternalizer(headers, orderPayload, order, function (err, result) {
                              if (err) {
                                  logger.error("order internalizer update error ----------------", err);
                                  reject(err);
                              } else {
                                  resolve(result);
                              }
                          });
  
                          orderController.crudder.update(orderInternalizer.req, orderInternalizer.res);
                      }
                  });
  
                  crud.update(internalizer.req, internalizer.res); */

                updateOrderAndBatch(batch, order);

            } else {
                reject(new Error(`Error occured while finding performa ${performId} in batch ${batchId}..`));
            }
        }).catch(e => reject(e));
    });

    function updateOrderAndBatch(batch, order) {
        return new Promise((resolve, reject) => {
            Mongoose.models['omsBatch'].findOne({ _id: batch._id }).exec().then(newBatch => {
                var oldValues = newBatch.toObject();
                var updated = _.mergeWith(newBatch, batch, cutomizer);
                updated = new crud.model(updated);
                updated.save(function (err, newBatchDoc) {
                    if (!err) {
                        console.log(`New updated batch---------------------------`, JSON.stringify(newBatchDoc));
                        Mongoose.models['omsMaster'].findOne({ _id: order._id }).exec().then(newOrder => {
                            var oldValues = newOrder.toObject();
                            var updatedOrder = _.mergeWith(newOrder, order, cutomizer);
                            updatedOrder = new crud.model(updatedOrder);

                            updatedOrder.save(function (err, updatedOrder) {
                                if (err) reject(err)
                                else resolve();
                            })

                        }).catch(e => reject(e));

                    }
                })
            }).catch(e => reject(e));
        });
    }

    function cutomizer(objValue, srcValue) {
        if (_.isArray(objValue)) {
            return srcValue;
        }
    }
}

/**
 * @description Common Http request making function block;
 * @param {*String} _magickey //Redis-Key;
 * @param {*String} _path //API Path;
 * @param {*String} _method // Http method - POST , PUT , GET;
 * @param {*Object} _payload //Requset body;
 */
function _fireHttpRequest(_magickey, _path, _method, _payload) {
    return new Promise((resolve, reject) => {
        if (!_magickey) {
            reject(new Error(`Magic Key cannot be empty for HTTP request.`));
            return;
        }
        if (!_path) {
            reject(`Path cannot be empty for HTTP request.`);
            return;
        }
        if (!_method) {
            reject(`Http Method cannot be empty for HTTP request.`);
            return;
        }
        cuti.request.getUrlandMagicKey(_magickey)
            .then(options => {
                options.path += _path;
                options.method = _method;
                var request = http.request(options, response => {
                    var data = "";
                    response.on('data', _data => data += _data.toString());
                    response.on('end', () => {
                        if (response.statusCode === 200) {
                            try {
                                data = JSON.parse(data);
                                resolve(data);
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error(data));
                        }
                    });
                });
                //Request error handling;
                request.on('error', function (err) {
                    reject(err);
                });
                //Close HTTP port;
                if ((_method === 'POST' || _method === 'PUT') && !_.isEmpty(_payload))
                    request.end(JSON.stringify(_payload));
                else
                    request.end();

            }).catch(e => reject(e));
    });
}


//----------------franchise onboard changes---------------
/**
 * function enable franchise if franchise updated to approve status
 */
function enableBatchByFranchise(req, res) {
    let franchiseid = req.swagger.params.id.value;

    //check franchise data exists
    if (franchiseid.length == 0) {
        res.status(400).json({ "message": "All the inputs required" });
        return false;
    }

    let cond = { "franchise.id": franchiseid, "batchEnabled": false, "isApprovedRetailer": false, "status": { $in: ["Created", "Received", "Payment Initiated", "Confirmed"] } };

    orderController.crud.model.update(cond, { $set: { batchEnabled: true, isApprovedRetailer: true } }, { multi: true }).exec()
        .then(updateRes => {
            res.status(200).json({ "message": "Updated successfully" });
        })
        .catch(updateError => {
            logger.error("OMS - BATCH - enableBatchByFranchise -ERROR - ", updateError);
            res.status(400).json({ "message": "Updated unsuccessfully" });
        });
}
//----------------franchise onboard changes end-----------

module.exports.updatePickListPrintCount = updatePickListPrintCount;
module.exports.createBatch = createBatch;
module.exports.cancelBatch = cancelBatch;
module.exports.cancelPerformaInvoice = cancelPerforma;
module.exports.get = getBatchList;
module.exports.viewBatch = viewBatch;//viewBatchDet;
module.exports.index = crud.index;
module.exports.count = crud.count;
module.exports.crud = crud;
module.exports.allotStocktoBatch = allotStocktoBatch;
module.exports.reserveStockConfirmedOrders = reserveStockConfirmedOrders;
module.exports.cancelNonOrderLinkedPerforma = cancelNonOrderLinkedPerforma;
module.exports.internalBatchCreation = internalBatchCreation;
module.exports.internalPerformaCancellation = internalPerformaCancellation;
module.exports.getPerformaInvoiceNumber = getPerformaInvoiceNumber;
module.exports.batchesForOrder = batchesForOrder;
module.exports.cancelAndInsertNewPerforma = cancelAndInsertNewPerforma;
module.exports.enableBatchByFranchise = enableBatchByFranchise;

