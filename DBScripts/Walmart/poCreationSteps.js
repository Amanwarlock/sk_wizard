/* 
- This script is for walmart orders , for which walmart order got placed , but API PO , Manual PO and Split dint happend due to some reason;
- Accepts walmart order Id, and finds all sk orders having this wm order Id and po not created;
*/
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



function _runScript(callback) {
    console.log(chalker.blue.bold("#. Walmart script started ........................................................................."));
    var params = {};
    async.waterfall([
        _askWalmartOrderId(params),
        invokeConsolidatedFlow,
    ], function (err, result) {
        if (err) {
            callback(err);
        } else {
            console.log("Consolidated distribution result -----------------", JSON.stringify(result));
            callback(null);
        }
    });
}

function _askWalmartOrderId(params) {
    return function (callback) {
        rl.question(chalker.green.bold(
            `#. Enter Walmart Order Id =  `
        ), answer => {
            if (answer) {
                params.partnerOrderId = answer.toString();
                console.log(chalker.yellow(`Entered walmart order Id is ----- ${params.partnerOrderId}`));
                callback(null, params);
                rl.close();
            } else {
                callback(new Error(`Invalid walmart order Id entered`));
                return;
            }

        });
    }
}

function invokeConsolidatedFlow(params, callback) {
    console.log("Invoking distribution logic for walmart order Id ", typeof params.partnerOrderId, params.partnerOrderId);
    consolidatedDistribution(params.partnerOrderId, true, false, function (err, result) {
        if (err) {
            callback(err);
        } else {
            callback(null, result);
        }
    });
}


var logger = {
    trace: function (msg) {
        console.log(chalker.green.bold(msg));
    },
    error: function (msg) {
        console.log(chalker.red.bold(msg));
    }
}


function consolidatedDistribution(partnerOrderId, isOrderFlow, retryFailed, callback) {
    logger.trace(`Consolidated distribution logic is invoked for Non-Sk orders...${partnerOrderId}`);
    /* 
        1. Find Pending non-sk orders - isSkWarehouse = false, isScheduledPlacement = true, payment = confirmed, stockAllocation = ['PartiallyAllocated , Not Allocated] ,partnerWmfInfo.isOrderPlaced = false; group by partnerWhId;   
        2. gather consolidated products and requried quantites;
        3. Query stock from partner inventory;
        4. Prepare stock matrix;
        5. Distribute to orders - prepare orderPlacementData , split Data , API PO data , manual PO data if any;
        6. Return stock matrix of partner and all list of step 5.
    */

    var params = {
        partnerOrderId: partnerOrderId,
        whIds: [],
        currentOrder: null,
        pendingOrders: [],
        partnerProducts: [], // [{locationId: '248' ,productIds: [] , skus: [],  products: [] , partnerInventory: [] }]
        splitData: [],
        poData: [],
        manualPoData: [],
        isOrderFlow: isOrderFlow,
        retryFailed: retryFailed
    };

    async.waterfall([
        _fetchOrders(params),
        _gatherPartnerProducts,
        _fetchPartnerInventory,
        _stockDistribution
    ], function (err, result) {
        if (err) {
            logger.error(err);
            callback(err);
        }
        else
            callback(null, result);
    });



    function _fetchOrders(params) {
        return function (callback) {
            logger.trace("Finding sk orders -------------------");
            var partnerOrderId = params.partnerOrderId;

            db.collection('omsmasters').aggregate([
                {
                    $match: {
                        status: { $nin: ['Cancelled', 'Created', 'Payment Initiated'] },
                        paymentStatus: 'Paid',
                        stockAllocation: { "$in": ["NotAllocated", "PartialAllocated"] },
                        isSkWarehouse: false,
                        isScheduledPlacement: true,
                        "partnerWmfInfo.isOrderPlaced": true,
                        "partnerWmfInfo.orderId": partnerOrderId,
                        subOrders: {
                            "$elemMatch": {
                                status: { $in: ["Confirmed"] },
                                invoiced: false,
                                readyForBatching: false,
                                partnerOrderId: partnerOrderId,
                                isPoCreated: false,
                                isPartnerOrderIdUpdated: true
                            }
                        }
                    }
                },
                {
                    $project: {
                        status: 1,
                        //paymentStatus: 1,
                        //stockAllocation: 1,
                        source: 1,
                        partnerWhId: 1,
                        isSkWarehouse: 1,
                        //isScheduledPlacement: 1,
                        // "partnerWmfInfo.isOrderPlaced": 1,
                        createdAt: 1,
                        orderAmount: 1,
                        logistics: 1,
                        "partnerWmfInfo.attempts": 1,
                        "partnerWmfInfo.status": 1,
                        "partnerWmfInfo.isOrderPlaced": 1,
                        "subOrders": {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$subOrders",
                                        cond: {
                                            $and: [{ $eq: ["$$this.status", "Confirmed"] }, { $eq: ["$$this.readyForBatching", false] }]
                                        }
                                    }
                                },
                                in: {
                                    _id: "$$this._id",
                                    quantity: "$$this.quantity",
                                    status: "$$this.status",
                                    readyForBatching: "$$this.readyForBatching",
                                    poId: "$$this.poId",
                                    isPoCreated: "$$this.isPoCreated",
                                    partnerOrderId: "$$this.partnerOrderId",
                                    isPartnerOrderIdUpdated: "$$this.isPartnerOrderIdUpdated",
                                    products: {
                                        $map: {
                                            input: "$$this.products",
                                            as: "p",
                                            in: {
                                                id: "$$p.id",
                                                name: "$$p.name",
                                                quantity: "$$p.quantity",
                                                skuCode: "$$p.skuCode",
                                                mapping: "$$p.mapping",
                                                mrp: "$$p.mrp",
                                                transferPrice: "$$p.transferPrice",
                                                category: "$$p.category",
                                                brand: "$$p.brand"
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                },
                {
                    $group: {
                        _id: "$source",
                        locationId: { $first: "$partnerWhId" },
                        orderList: { $push: "$$ROOT" }
                    }
                }
            ]).toArray(function (err, pendingOrders) {
                if (err) {
                    callback(err);
                } else if (pendingOrders && pendingOrders.length) {
                    params.pendingOrders = pendingOrders;
                    params.pendingOrders.map(group => {
                        group.isOrderPlaced = true;
                        group.partnerOrderId = partnerOrderId;
                    })
                    console.log("Pedning orders count ------------------", pendingOrders[0].orderList.length);
                    callback(null, params);
                } else {
                    callback(new Error(`No Sk Orders found for given walmart order id - ${params.partnerOrderId}`));
                }
            });
        }
    }

    function _gatherPartnerProducts(params, callback) {

        params.pendingOrders = params.pendingOrders && params.pendingOrders.length ? params.pendingOrders : [];
        params.pendingOrders.map(orderGroup => {
            // orders are grouped by partner location Id and all skOrders with same location Id are mapped to field 'data' , where _id is partner location Id;
            orderGroup.orderList = orderGroup.orderList && orderGroup.orderList.length ? orderGroup.orderList : [];

            params.whIds.push(orderGroup._id);

            orderGroup.totalOrders = orderGroup.orderList.length;
            orderGroup.skOrderAmount = 0;
            orderGroup.partnerOrderAmount = 0;

            orderGroup.orderList.map(skOrder => {

                orderGroup.skOrderAmount += skOrder.orderAmount;

                skOrder.subOrders.map(s => _.each(s.products, p => {

                    orderGroup.partnerOrderAmount += p.transferPrice * p.quantity;

                    p.keeper = {
                        requiredQty: p.quantity,
                        availableQty: 0,
                        remainingQty: p.quantity
                    };

                    p.subOrderId = s._id;
                    p.orderId = skOrder._id;
                    p.whId = skOrder.source;
                    p.locationId = skOrder.partnerWhId;
                    p.poId = s.poId;
                    p.isPoCreated = s.isPoCreated;

                    s.whId = skOrder.source;
                    s.locationId = skOrder.partnerWhId;

                    let existingLocationGroup = _.find(params.partnerProducts, { locationId: p.locationId });

                    if (existingLocationGroup) {

                        let existingProduct = _.find(existingLocationGroup.products, el => p.mapping.productId === el.mapping.productId || p.mapping.sku === el.mapping.sku ? true : false);

                        if (!existingProduct) {
                            existingLocationGroup.products.push({
                                skProductId: p.id,
                                subOrderIds: [s._id],
                                quantity: p.quantity,
                                mapping: p.mapping,
                                keeper: {
                                    requiredQty: p.quantity,
                                    availableQty: 0,
                                    remainingQty: p.quantity
                                }
                            });
                            existingLocationGroup.productIds.push(p.mapping.productId);
                            existingLocationGroup.skus.push(p.mapping.sku);

                            existingLocationGroup.productIds = _.uniq(existingLocationGroup.productIds);
                            existingLocationGroup.skus = _.uniq(existingLocationGroup.skus);

                        } else {
                            existingProduct.quantity += p.quantity;
                            existingProduct.subOrderIds.push(s._id);
                            existingProduct.keeper.requiredQty += p.quantity;
                            existingProduct.keeper.remainingQty += p.quantity;
                        }

                    } else {
                        params.partnerProducts.push({
                            locationId: p.locationId,
                            productIds: [p.mapping.productId],
                            skus: [p.mapping.sku],
                            products: [{
                                skProductId: p.id,
                                subOrderIds: [s._id],
                                quantity: p.quantity,
                                mapping: p.mapping,
                                keeper: {
                                    requiredQty: p.quantity,
                                    availableQty: 0,
                                    remainingQty: p.quantity
                                }
                            }]
                        });
                    }

                }));
            });

        });

        params.whIds = _.uniq(params.whIds);

        callback(null, params);
    }

    /* function _fetchPartnerInventory(params, callback) {
       
        logger.trace("Fetching walmart products inventory----------");
        var queue = async.queue(function (locationGroup, queueCB) {

            let fc = { partner: { integrationKey: 'walmart', locationId: locationGroup.locationId } };

            let options = {
                isVolumetric: false,
                productIdList: locationGroup.productIds,
                select: ['StoreID', 'ID', 'MRP', 'Title', 'WebPrice', 'Inventory', 'Sku', 'MinimumOrderQuantity', 'MaximumOrderQuantity']
            };

            console.log("Fc and options ", fc, options);

            wmfIntergration.productSearch(fc, options).then(result => {
                console.log("Inventory Result -----------", result);
                locationGroup.partnerInventory = result && result.length ? result : [];
                locationGroup.partnerInventory.map(inv => {
                    inv.keeper = {
                        availableQty: inv.Inventory,
                        usedQty: 0
                    }
                })
                queueCB(null);
            }).catch(e => {
                logger.error("Walmartt inventory error --------", e);
                queueCB(e);
            });
        });

        queue.push(params.partnerProducts, function (err, result) {
            if (err) {
                logger.error(`Error while fetching partner Inventory for consolidated placement...`, err);
            }
        });

        queue.drain = function () {
            console.log("\n \n \n -------------Partner Inventory ---------------------- \n \n \n ", JSON.stringify(params.partnerProducts));
            callback(null, params);
        }
    } */

    function _fetchPartnerInventory(params, callback) {

        var locationGroup = params.partnerProducts[0];
        var locationId = locationGroup.locationId;
        var partnerOrderId = params.partnerOrderId;

        let fc = { partner: { integrationKey: 'walmart', locationId: locationGroup.locationId } };

        locationGroup.partnerInventory = [];

        wmfIntergration.getOrder(fc, partnerOrderId).then(wmOrder => {
            if (wmOrder) {
                wmOrder.Orders.map(o => o.OrderLineId.map(item => {
                    locationGroup.partnerInventory.push({
                        "StoreID": item.LocationId,
                        "ID": item.ProductId,
                        "MRP": 0,
                        "Title": item.ProductTitle,
                        "WebPrice": item.ProductPrice,
                        "Inventory": item.Quantity,
                        "Sku": item.SKU,
                        "MinimumOrderQuantity": 1,
                        "MaximumOrderQuantity": 0,
                        "keeper": {
                            "availableQty": item.Quantity,
                            "usedQty": 0
                        }
                    });
                }));
                callback(null,params);
            } else {
                logger.error("WM order not found ");
            }
        }).catch(e => callback(e));

    }

    function _stockDistribution(params, callback) {
        logger.trace("Runnning stock distribution----------------");
        // Orders are grouped by whId- each FC is mapped to single locationId and one locationId can be mapped against multiple FC's
        params.pendingOrders.map(orderGroup => {

            orderGroup.orderPlacementData = [];

            orderGroup.orderList.map(skOrder => {

                let splitList = [];
                let remainingQty = 0;

                skOrder.subOrders.map(s => _.each(s.products, p => {

                    let partnerInventory = null;
                    let partnerProduct = null;

                    let locationGroup = _.find(params.partnerProducts, { locationId: p.locationId });

                    if (locationGroup) {
                        partnerProduct = _.find(locationGroup.products, { skProductId: p.id });
                        partnerInventory = _.find(locationGroup.partnerInventory, el => el.ID === p.mapping.productId || el.Sku === p.mapping.sku ? true : false);
                    }

                    if (partnerInventory && partnerProduct) {
                        let count = _getCount(p.quantity, partnerInventory.keeper.availableQty);
                        updateKeepers(count, p, partnerInventory, partnerProduct, params);
                        remainingQty += p.keeper.remainingQty;
                        //#.1 Check if split required;
                        if (p.shouldSplit && params.isOrderFlow === true) {
                            p.splitBy = p.keeper.availableQty;
                            p.differentialQty = p.keeper.remainingQty;
                            splitList.push({
                                productId: p.id,
                                subOrderId: s._id,
                                splitQty: p.splitBy,
                                whId: p.whId,
                                setters: {
                                    partnerOrderId: null,
                                    partnerSubOrderId: null,
                                    poId: null,
                                    shortShipmentRefId: null,
                                    isPartnerOrderIdUpdated: false,
                                },
                                remarks: `Consolidated Order Placement Flow Split`
                            });
                        }
                        //#.2 Add to API PO;
                        if (p.keeper.availableQty > 0 && params.isOrderFlow === true && !p.isPoCreated) {
                            let poProduct = makePoProductData(p, p.keeper.availableQty);
                            addToApiPoList(poProduct, params);
                        }
                        //#.3 Add to Manual PO;
                        if (p.hasShortage && params.isOrderFlow === true && !p.isPoCreated) {
                            let poProduct = makePoProductData(p, p.keeper.remainingQty);
                            addToManualPoList(poProduct, params);
                        }


                    }

                }));

                if (remainingQty > 0) {
                    skOrder.hasStock = false;
                } else {
                    skOrder.hasStock = true;
                }

                if (splitList && splitList.length) {
                    params.splitData.push({
                        orderId: skOrder._id,
                        whId: skOrder.source,
                        subOrderList: splitList
                    });
                }

            });

            if (params.isOrderFlow === true) {
                orderGroup.orderList.map(skOrder => {
                    skOrder.subOrders.map(s => _.each(s.products, p => {
                        let existing = _.find(orderGroup.orderPlacementData, el => el.mapping.productId === p.mapping.productId || el.mapping.sku === p.mapping.sku ? true : false);
                        if (!existing && p.keeper.availableQty > 0) {
                            orderGroup.orderPlacementData.push({
                                productId: p.id,
                                productName: p.name,
                                quantity: p.keeper.availableQty,
                                subOrderIds: [p.subOrderId],
                                mapping: p.mapping,
                            });
                        } else if (existing && p.keeper.availableQty > 0) {
                            existing.quantity += p.keeper.availableQty;
                            existing.subOrderIds.push(p.subOrderId);
                        }
                    }));
                })
            }

        });


        callback(null, params);
    }

    function updateKeepers(count, sOProduct, partnerInventory, partnerProduct, params) {

        if (partnerInventory) {
            partnerInventory.keeper.availableQty -= count;
            partnerInventory.keeper.usedQty += count;
        }

        if (partnerProduct) {
            partnerProduct.keeper.availableQty += count;
            partnerProduct.keeper.remainingQty -= count;
        }

        if (sOProduct) {
            sOProduct.keeper.availableQty += count;
            sOProduct.keeper.remainingQty -= count;
            // check if split required
            if (sOProduct.keeper.availableQty < sOProduct.keeper.requiredQty && sOProduct.keeper.remainingQty && sOProduct.keeper.availableQty > 0) sOProduct.shouldSplit = true;
            if (sOProduct.keeper.availableQty < sOProduct.keeper.requiredQty && sOProduct.keeper.remainingQty) sOProduct.hasShortage = true;
            if (sOProduct.keeper.availableQty === sOProduct.keeper.requiredQty) sOProduct.fulfilled = true;
        }

    }


    function addToApiPoList(poProduct, params) {

        let existingWhGroup = _.find(params.poData, { whId: poProduct.whId });

        if (existingWhGroup) {

            existingWhGroup.products = existingWhGroup.products && existingWhGroup.products.length ? existingWhGroup.products : [];
            let existingProduct = _.find(existingWhGroup.products, { productId: poProduct.productId });

            if (!existingProduct) {
                existingWhGroup.products.push(poProduct);
            } else {
                existingProduct.quantity.requested += poProduct.quantity.requested;
                existingProduct.total += poProduct.total;
                existingProduct.subOrderIds = existingProduct.subOrderIds.concat(poProduct.subOrderIds);
                existingProduct.subOrderIds = _.uniq(existingProduct.subOrderIds);
            }

        } else {
            params.poData.push({
                whId: poProduct.whId,
                products: [poProduct]
            });
        }
    }

    function addToManualPoList(poProduct, params) {
        let existingWhGroup = _.find(params.manualPoData, { whId: poProduct.whId });

        if (existingWhGroup) {

            existingWhGroup.products = existingWhGroup.products && existingWhGroup.products.length ? existingWhGroup.products : [];
            let existingProduct = _.find(existingWhGroup.products, { productId: poProduct.productId });

            if (!existingProduct) {
                existingWhGroup.products.push(poProduct);
            } else {
                existingProduct.quantity.requested += poProduct.quantity.requested;
                existingProduct.total += poProduct.total;
                existingProduct.subOrderIds = existingProduct.subOrderIds.concat(poProduct.subOrderIds);
                existingProduct.subOrderIds = _.uniq(existingProduct.subOrderIds);
            }

        } else {
            params.manualPoData.push({
                whId: poProduct.whId,
                products: [poProduct]
            });
        }
    }
}// Consolidate distribution method ends here;



function makePoProductData(p, qty) {
    p = Object.assign({}, p);
    p.quantity = qty;
    let data = null;
    if (p) {
        // p.transferPrice = orderProduct.transferPrice;
        p.priceToCompute = p.mrp;
        p.unitPrice = p.transferPrice;
        var bMargin = parseFloat(((p.mrp - p.transferPrice) / p.mrp * 100).toFixed(2));
        p.margins = {
            bMargin: bMargin, //(p.mrp - p.transferPrice),
            sMargin: 0,
            sMarginType: '%'
        }
        p.totMargin = parseFloat(((p.mrp - p.transferPrice) / p.mrp * 100).toFixed(2));
        p.total = parseFloat((p.quantity * p.unitPrice).toFixed(2));

        data = {
            "whId": p.whId,
            "locationId": p.locationId,
            "productId": p.id,
            "subOrderIds": [p.subOrderId],
            "name": p.name,
            "mrp": p.mrp,
            "availableStock": 0,
            "dealerPrice": p.transferPrice,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": p.quantity
            },
            "unitPrice": p.unitPrice,
            "total": p.total,
            "skuCode": p.skuCode,
            "dealCount": 1, // Find - No of deals having this product id - query= {product:  {$elemMatch : {id: productId}}}.count();
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": p.margins,
            "orderQty": 0,
            "order30": 0,
            "categoryId": p.category,
            "brandId": p.brand,
            "delivery_chalan": false,
            "priceToCompute": p.priceToCompute,
            "totMargin": p.totMargin,
            "lastRequiredQtyValue": p.quanity,
            "mapping": p.mapping
        };
    }

    return data;
}


function _getCount(required, available) {
    return required <= available ? required : required > available && available > 0 ? available : 0;
}
