/**
 * @author Aman Kareem<aman.kareem@storeking.in>;
 * @since March 10 2018;
 */
"use strict;"
var Mongoose = require("mongoose");
Mongoose.Promise = global.Promise;
var http = require("http");
var cuti = require("cuti");
var log4js = cuti.logger.getLogger;
var logger = log4js.getLogger("oms");
var async = require("async");
var _ = require("lodash");
var crudder = null;

/* Import necessary files here; */
var heuristic = require("./order.heuristic");
var invoiceCommissionCtrl = require("./invoice.commission.js");
var batchController = require("./batch.controller");
var invoiceController = require("./invoice.controller");
var paymentHelper = require("../helpers/payment.helper.js");
var orderMgmtCtrl = null; //require("./order.mgmt.controller");

function init(_crud, _orderMgmtCtrl) {
	crudder = _crud;
	orderMgmtCtrl = _orderMgmtCtrl;
}
/* ----------------------------------------------------REDIS QUEUE WORKER-------------------------------------------------------------------------------------------- */
var redisSMQ = require("rsmq");
var host = process.env.REDIS_CON.split(":")[0];
var port = process.env.REDIS_CON.split(":")[1];
var RSMQWorker = require("rsmq-worker");
/*------------------------------------------------ Create Worker;---------------------------------------- */
var worker = new RSMQWorker("reservation_change", {
	"host": host,
	"port": port,
	"autostart": true,
	"maxReceiveCount": 1,
	"defaultDelay": 0,
	"interval": 0.1,
	"timeout": 180000 //0 0r 180000ms (3min) 
});
// For move to suspense batch creation
var onMoveToSuspenseWorkerQueue = new RSMQWorker("on_moveToSuspense_batch_insert", {
	"host": host,
	"port": port,
	"autostart": true,
	"maxReceiveCount": 1,
	"defaultDelay": 0,
	"interval": 0.1,
	"timeout": 180000 //0 0r 180000ms (3min) 
});
/* ------------------------------------------------------------------------------------------------------------------------------------------------ */

/* This is invoked from GRN module on stock intake */
/**
 * @author Aman Kareem;
 * @description Post GRN stock reservation function block;
 * @param {*} req 
 * @param {*} res 
 */
function onGrnReservation(req, res) {
	logger.trace("Invoking post GRN reservation function..");
	var grnSnapShotList = req.swagger.params['data'].value;
	var grnId = grnSnapShotList && grnSnapShotList.length ? grnSnapShotList[0].grnId : null;
	var whId = grnSnapShotList && grnSnapShotList.length ? grnSnapShotList[0].whId : null;;
	var reference = { "ref": { "grn": grnId }, "whId": whId, "type": "GRN Reservation", "byPassHeuristics": true };
	async.waterfall([
		_validateSnapShotArr(grnSnapShotList, reference),
		_prepareProductIdList,
		_pipelineBuilder,
		_executePipeline,
		_orderSelection,
		_extractSolutionAndReserve
	], function (err, result) {
		if (err)
			res.status(400).send({ message: err.message, code: "ERROR" });
		else
			res.status(200).send(result);
	});
}

/* 
	- This makes reservation for open orders against given product ids;
	- This is either productId driven or ledger Id driven
	- When productIds are given it uses them against reservation for open orders
	- When ledger ids given it will find those ledgers and extract productIds from them and makes reservation for those productIds
	- types are: ledgerBased , productIdBased
	- req = ?productIds=["PR1000"] , body = { reference : {}}
*/
function onStockIntakeReservation(req, res) {
	logger.trace("Invoking on stock intake reservation....");
	var params = req.swagger.params;
	params.user = { _id: req.user._id, name: req.user.username };
	var body = params['data'].value;
	var productIdList = params['productIds'].value;//From query;
	var reference = body.reference;//From body;
	reference = Object.assign(reference, { "byPassHeuristics": true });
	pendingOrderReservation(productIdList, reference, function (err, result) {
		if (err)
			res.status(400).send({ "message": err.message });
		else
			res.status(200).send(result);
	});
}

/*
	- This makes reservation for open orders ;
	- THis can be used for internal purpose;
	- While reservation , additional data will be appended to ledger reference, apart from this any additional reference is needed , then append here;
	- reference = { ref: {}, type: "Stock Reservation", "byPassHeuristics": true }
 */
function pendingOrderReservation(productIdList, reference, callback) {
	logger.trace("Running open order reservations on stock intake....");
	if (!reference || !reference.whId) {
		callback(new Error(`Warehouse Id is required for reservation on stock intake.`));
		return;
	}
	async.waterfall([
		_validationOfParams(productIdList, reference),
		_pipelineBuilder,
		_executePipeline,
		_orderSelection,
		_extractSolutionAndReserve
	], function (err, result) {
		if (err)
			callback(err);
		else
			callback(null, result);
	});
}

function _validationOfParams(productIdList, reference) {
	return function (callback) {
		productIdList = _.uniq(productIdList);
		if (!productIdList || !productIdList.length) {
			callback(new Error(`Product Id list is empty, cannot proceed with reservation.`));
			return;
		}
		if (!reference || _.isEmpty(reference)) {
			callback(new Error(`Reference is empty, cannot proceed with reservation.`));
			return;
		}
		if (!reference.type) {
			callback(new Error(`Reference type is not defined, cannot proceed with reservation.`));
			return;
		}

		callback(null, productIdList, reference);
	}
}

 /*STAGE-1 : Function block to validate parameters; should have array of snapshots */;
/**
 * @param {*} _productList 
 * @description This snapshot list from GRN is an array of object which contains : snapShotId , productId , quantity , grnId
 */
function _validateSnapShotArr(_productList, reference) {
	return function (callback) {
		if (_productList && _productList.length && !_.isEmpty(reference.type))
			callback(null, _productList, reference);
		else
			callback(new Error(`Snapshot list is empty , cannot proceed with order reservation.`));
	};
}

/*STAGE-2: Function block to prepare array of Product ids; */
function _prepareProductIdList(_productList, reference, callback) {
	var productIdList = _productList.map(el => el.productId);
	productIdList = _.uniqBy(productIdList);
	if (productIdList && productIdList.length)
		callback(null, productIdList, reference);
	else
		callback(new Error(`Product list is empty , cannot proceed with order reservation.`));
}

/*STAGE-3: Aggregation pipeline to find all open orders against the matching productIds;
	- Reference can take exculsion list, that is the list of orders to exclude for reservation;
 */
function _pipelineBuilder(productIdList, reference, callback) {
	if (!reference || !reference.whId) {
		callback(new Error("Warehouse Id is required for reservation on stock intake"));
		return;
	}
	var exculsionList = reference.exculsionList && reference.exculsionList.length ? reference.exculsionList : [];//orderList to be excluded
	exculsionList = _.uniq(exculsionList);
	var pipeLine = [
		{
			"$match": {
				_id: { "$nin": exculsionList },
				status: { "$in": ["Processing", "Confirmed", "Partially Shipped", "Partially Delivered"] },
				paymentStatus: { "$nin": ["Reverted"] },
				stockAllocation: { "$in": ["NotAllocated", "PartialAllocated"] },
				source: reference.whId,
				subOrders: {
					"$elemMatch": {
						invoiced: false,
						readyForBatching: false,
						status: { $in: ["Confirmed"] },
						products: { "$elemMatch": { id: { $in: productIdList } } }
					}
				}
			}
		},
		{
			"$addFields": {
				data: {
					"$map": {
						input: "$subOrders",
						in: {
							_id: "$$this._id",
							blockedProducts: "$$this.blockedProducts",
							requestedProducts: "$$this.requestedProducts"
						}
					}
				}
			}
		},
		{ $unwind: "$subOrders" },
		{
			"$match": {
				"subOrders.invoiced": false,
				"subOrders.readyForBatching": false,
				"subOrders.status": { $in: ["Confirmed"] },
				"subOrders.products": { "$elemMatch": { id: { $in: productIdList } } }
			}
		},
		{ "$sort": { "createdAt": 1 } },
		{
			"$project": {
				"paymentStatus": 1,
				"orderType": 1,
				"batchEnabled": 1,
				"stockAllocation": 1,
				"createdAt": { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				"typeOfOrder": 1,
				"subOrders.id": 1,
				"subOrders._id": 1,
				"subOrders.invoiced": 1,
				"subOrders.readyForBatching": 1,
				"subOrders.snapshots": 1,
				"subOrders.blockedProducts": 1,
				"subOrders.requestedProducts": 1,
				"subOrders.status": 1,
				"subOrders.quantity": 1,
				"subOrders.brand.id": 1,
				"subOrders.category.id": 1,
				"subOrders.products.id": 1,
				"subOrders.products._id": 1,
				"subOrders.products.name": 1,
				"subOrders.products.quantity": 1,
				"subOrders.products.mrp": 1,
				"data": 1
			}
		}
	]
	callback(null, pipeLine, productIdList, reference);
}

/*STAGE-4: Execute Pipeline */
function _executePipeline(_pipeLine, productIdList, reference, callback) {
	logger.info("Open orders for reservation post GRN : ", JSON.stringify(_pipeLine));
	Mongoose.models['omsMaster'].aggregate(_pipeLine)
		.exec()
		.then(orderList => {
			if (orderList && orderList.length)
				callback(null, orderList, productIdList, reference);
			else
				callback(new Error(`No orders found for post stock intake reservation.`));
		})
		.catch(e => callback(e));
}

/* STAGE-5: _runHeuristics : Discover optimal solution and order matrix formation; */
function _orderSelection(orderList, productIdList, reference, callback) {
	heuristic.runHeuristics(orderList, productIdList, reference, function (err, orderSolutionList, inventoryMatrixList) {
		if (err)
			callback(err);
		else
			callback(null, orderSolutionList, orderList, reference);
	});
}

/* STAGE-6 */
/* THis api send the obtained snapshot ids and qty as solution , to the stockLedger api in warehouse;
	Stock ledger will inturn invoke the webhook api end point send to it in the payload;
 */
function _extractSolutionAndReserve(selectedOrders, orderList, reference, callback) {
	var ledgerList = [];
	selectedOrders.map(_order => {
		ledgerList = ledgerList.concat(_order.solution);
	});

	if (!ledgerList || !ledgerList.length) {
		callback(new Error(`ledger list is empty , cannot do reservation post stock intake.`));
		return;
	}
	//Payload for stock ledger;
	var payload = {
		"list": ledgerList,
		"webhook": {
			"magicKey": "oms",
			"path": "/webhook/updateOrders"
		}
	};
	var path = "/stockledger/bulkStockVariation";//stock ledger api endpoint;
	_fireHttpRequest("wh", path, "PUT", payload)
		.then(result => {
			callback(null, result);
		}).
		catch(e => callback(e));
}

/**
 * @fileOverview - PURPOSE : Order placement , GRN reservation(stock intake);
 * @description StockLedger webhook handling function;
 * @param {*} req 
 * @param {*} res 
 * Invoked on Following occasions - GRN Reservation , Order Reservation
 * This function is called from stockledger in warehouse;
 * This function is invoked once requested reservation is successfull for the requested stocks;
 * This function on invoking will hold all respective stockledger ids;
 * On invoking this we update the order status as per the stock ledger refernce;
 */
function updateOrdersWebhook(req, res) {
	//sample webhook payload = { list: insertedIds, webhook: _webhook };
	logger.trace("WEBHOOK : Invoked updateOrdersWebhook");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	async.waterfall([
		_fetchStockLedgers(ledgerIdList),
		_findOrders,
		_setOrderLevelFlags,
		_bulkUpdateOrders
	], function (err, orderList, ledgerList, updateResult) {
		if (err)
			logger.error(err.message);
		else {
			logger.trace(JSON.stringify(updateResult));
			res.status(200).send({ message: "success" });//Resolve the webhook instantly; Resolve it regardless of your operation end result;
		}
	});
}

/* Fetch stock ledgers with those acquired Ids and also with status = Committed only */
function _fetchStockLedgers(ledgerIdList) {
	return function (callback) {
		var count = ledgerIdList.length ? ledgerIdList.length : 1;
		var path = "/stockledger?filter=" + encodeURIComponent(JSON.stringify({ "_id": { "$in": ledgerIdList }, "status": "Committed" }));
		path += "&count=" + count;
		_fireHttpRequest("wh", path, "GET", null)
			.then(stockLedgers => {
				if (!stockLedgers || !stockLedgers.length)
					callback(new Error(`Counld not find any stock ledgers.`));
				else
					callback(null, stockLedgers);
			})
			.catch(e => callback(e));
	}
}

function findStockLedgers(ledgerIdList) {
	return new Promise((resolve, reject) => {
		var count = ledgerIdList.length ? ledgerIdList.length : 1;
		var path = "/stockledger?filter=" + encodeURIComponent(JSON.stringify({ "_id": { "$in": ledgerIdList }, "status": "Committed" }));
		path += "&count=" + count;
		_fireHttpRequest("wh", path, "GET", null)
			.then(stockLedgers => {
				if (!stockLedgers || !stockLedgers.length)
					reject(new Error(`Counld not find any stock ledgers.`));
				else
					resolve(stockLedgers);
			})
			.catch(e => reject(e));
	});
}

/**
 * 
 * @param {*Array} stockLedgers 
 * @param {*} callback 
 * This function block find all orders with respect to the references stored in stockledgers;
 */
function _findOrders(stockLedgers, callback) {
	if (!stockLedgers && !stockLedgers.length) {
		callback(new Error(`Counld not find any stock ledgers.`));
		return;
	}
	var subOrderIds = stockLedgers.map(_ledger => _ledger.reference.subOrderId);//Extract all suborderIds from stock ledgers;
	subOrderIds = _.uniqBy(subOrderIds);//Make this list unique;

	var productIds = stockLedgers.map(_ledger => _ledger.productId);//Extract all product ids from stock ledgers;
	productIds = _.uniq(productIds);//Make this list unique;

	//Get match Condition based on reference type;
	var _matcher = getMatchCondition(stockLedgers[0].referenceType, subOrderIds, productIds);

	Mongoose.models['omsMaster'].aggregate([
		{
			"$match": _matcher
		},
		{
			"$project": {
				"_id": 1,
				"paymentStatus": 1,
				"stockAllocation": 1,
				"status": 1,
				"gotRequestedProducts": 1,
				"createdAt": 1,
				"subOrders": 1,
			}
		}
	]).exec()
		.then(orderList => {
			if (orderList && orderList.length) {
				callback(null, stockLedgers, orderList);
			} else {
				callback(new Error(`Orders not found for the stock ledger references`));
			}
		}).catch(e => callback(e));
}

function getMatchCondition(referenceType, subOrderIds, productIds) {
	var matcher = {};
	//By pass order placement scenario with this match condition; as when order is placed , paymentStatus i,e payment confirmation is executed separately as in a different thread and hence both events are independent wrt to time and wrt to each other;
	if (referenceType === "Order Reservation") {
		matcher = {
			"paymentStatus": { "$nin": ["Reverted"] },
			"subOrders": {
				"$elemMatch": {
					"_id": { "$in": subOrderIds },
					"products": { "$elemMatch": { id: { "$in": productIds } } }
				}
			}
		}
	} else {
		matcher = {
			"status": { "$in": ["Processing", "Confirmed", "Partially Shipped", "Partially Delivered"] },
			"paymentStatus": { "$nin": ["Reverted"] },
			"stockAllocation": { "$in": ["NotAllocated", "PartialAllocated"] },
			"subOrders": {
				"$elemMatch": {
					"_id": { "$in": subOrderIds },
					"invoiced": false,
					"readyForBatching": false,
					"status": { "$in": ["Confirmed"] },
					"products": { "$elemMatch": { id: { "$in": productIds } } }
				}
			}
		}
	}

	return matcher;
}

/**
 * 
 * @param {*} stockLedgers 
 * @param {*} orderList 
 * @param {*} callback 
 * @description This function blocks responsibility is to update all order flags post reservation  - GRN , order placement;
 * After reservation impact are on the following fields : 1.stockAllocation 2.gotRequestedProducts 3."suborders.blockedRequests" 4."subOrders.snapShots" , 5."subOrders.readyForBatching"
 *  
 */
function _setOrderLevelFlags(stockLedgers, orderList, callback) {
	logger.trace("Setting order level flags.....");
	stockLedgers.map(_ledger => {
		if (!_ledger.stockTransaction && !_ledger.stockTransaction.length > 1) {
			callback(new Error(`Invalid StockLedger , The stock ledger doesnot have transaction details.`));
			return;
		}
		var subOrderId = _ledger.reference.subOrderId;
		var orderId = subOrderId ? subOrderId.split("_")[0] : null;
		//var order = _.find(orderList, { "_id": orderId});
		var order = _.find(orderList, _.flow(
			_.property('subOrders'),
			_.partialRight(_.some, { _id: subOrderId })
		));
		//Find particular suborder from the current order;
		var subOrder = _.find(order.subOrders, { _id: subOrderId });
		if (!order || !subOrder) {
			callback(new Error(`Cannot find order/suborder from stockledger reference.`));
			return;
		}
		subOrder.status = "Confirmed";
		//var transaction = _ledger.stockTransaction[1];
		var transactionQty = _ledger.stockTransaction[0].quantity - _ledger.stockTransaction[1].quantity;
		/**
		 * Suborder : insert or update blockedRequests array list;
		 *  - If not found insert new record or update the exisiting;
		 */
		var blockedInstance = _.find(subOrder.blockedProducts, { productId: _ledger.productId });
		if (!blockedInstance) {
			//if not found then insert one;
			subOrder.blockedProducts = subOrder.blockedProducts && subOrder.blockedProducts.length ? subOrder.blockedProducts : [];
			subOrder.blockedProducts.push({ "productId": _ledger.productId, "quantity": transactionQty });
		} else {
			//if already exists then update it;
			blockedInstance.quantity += transactionQty;
		}
		/* 
		 * Add the new snapshot data to the snapshots array of suborders;
		 *  - If already exisits update it else insert new record;
		 */
		var snapShot = _.find(subOrder.snapshots, { snapShotId: _ledger.snapShotId, productId: _ledger.productId });
		if (!snapShot) {
			//If snapshot not found then insert new entry;
			subOrder.snapshots = subOrder.snapshots && subOrder.snapshots.length ? subOrder.snapshots : [];
			subOrder.snapshots.push({
				"ledgerId": _ledger._id,
				"snapShotId": _ledger.snapShotId,
				"whId": _ledger.warehouseId,
				"productId": _ledger.productId,
				"quantity": transactionQty,
				"mrp": _ledger.mrp,
				"location": _ledger.position ? _ledger.position.location : null,
				"area": _ledger.position ? _ledger.position.area : null,
				"rackId": _ledger.position ? _ledger.position.rackId : null,
				"binId": _ledger.position ? _ledger.position.binId : null,
				"type": "Reserved",
				"createdAt": new Date()
			});
		} else {
			//If already exists then update the record;
			snapShot.quantity += transactionQty;
		}
		/*
		 * Suborder level flags - readyForBatching;
			- Update suborder level flags :  readyForBatching : true/false;
		 */
		var totalBlockedQty = _.sumBy(subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
		var totalRequestedQty = _.sumBy(subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
		if (totalBlockedQty === totalRequestedQty) {
			subOrder.readyForBatching = true;
		} else {
			subOrder.readyForBatching = false;
		}
	});
	/* 
		- Order level status flags update here;
		- Iterate and update order level flags - stockAllocation  , gotRequestedProducts;
	 */
	orderList.map(_order => {
		var totalBlockedQty = 0;
		var totalRequestedQty = 0;
		_.each(_order.subOrders, subOrder => {
			totalBlockedQty += _.sumBy(subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
			totalRequestedQty += _.sumBy(subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
		});
		if (totalBlockedQty === totalRequestedQty) {
			_order.stockAllocation = "Allocated";
			_order.gotRequestedProducts = true;
		} else if (totalBlockedQty > 0 && totalBlockedQty < totalRequestedQty) {
			_order.stockAllocation = "PartialAllocated";
			_order.gotRequestedProducts = false;
		} else {
			_order.stockAllocation = "NotAllocated";
			_order.gotRequestedProducts = false;
		}
	});
	callback(null, orderList, stockLedgers);// callback for updating orders;
}

/**
 * 
 * @param {*} orderList 
 * @param {*} stockLedgers 
 * @param {*} callback 
 * @description Function to bulk update all orders , updates only the set fields;
 * This function updates orders which are not in Allocated state;
 * This bulk update happens only on webhook invocation i,e once we have a success reservation;
 */
function _bulkUpdateOrders(orderList, stockLedgers, callback) {
	var model = new crudder.model(orderList[0]);
	var bulk = model.collection.initializeUnorderedBulkOp();
	orderList.map(_order => {
		//_order = _order.toObject();
		//console.log("---object type--" , _order.constructor.name  , typeof _order);
		bulk.find({ "_id": _order._id, "stockAllocation": { "$nin": ["Allocated"] } }).update({ "$set": { "stockAllocation": _order.stockAllocation, "gotRequestedProducts": _order.gotRequestedProducts, "subOrders": _order.subOrders } });
	});
	bulk.execute(function (err, result) {
		if (err)
			callback(err);
		else
			callback(null, orderList, stockLedgers, result);
	});
}

/* THis webhook is triggered from warehouse; Upon invoicing;
	- This is triggered when stock alloted to the orders have changed:
	- Alloted stocks to the order can change on Invoicing-Release and Hold logic or etc;
	- Webhook is passed from invoice.js for now;
 */
/**
 * @fileOverview - Invoked on - Invoicing , Order stock transfer ;
 * @description -PURPOSE : This webhooks purpose is to update order upon changes in already reserved stocks;
 * @param {*} req 
 * @param {*} res 
 */
function onReservationChangeWebhook(req, res) {
	logger.trace("WEBHOOK : Invoking webhook for order reservation change.....");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	ledgerIdList = JSON.stringify(ledgerIdList);
	logger.trace("Ledger ids :", ledgerIdList);
	//Push to redis queue;
	worker.send(ledgerIdList, function (err, message) {
		if (err) {
			logger.error(err);
			res.status(400).send({ "message": err.message });
		}
		else {
			logger.info("QUEDED: Reservation change Request is queued....");
			res.status(200).send({ "message": "Success" });
		}
	});
}

worker.on("message", function (message, next, msgId) {
	logger.trace("QUEUE: Processing rsmq queue..", message);
	worker.size(false, (err, count) => logger.info("PENDING IN QUEUE : ", count));
	try {
		var ledgerIdList = JSON.parse(message);
		processReservationChanges(ledgerIdList, next).then(() => {
			next();
		}).catch(e => next());
	} catch (e) {
		logger.error(e.message);
	}
});

function processReservationChanges(ledgerIdList) {
	logger.trace("RESERVATION CHANGES: Processing and updating reservation changes");
	return new Promise((resolve, reject) => {
		async.waterfall([
			_fetchStockLedgers(ledgerIdList),
			_changeOrderLevelFlags,
		], function (err, orderList, ledgerList) {
			if (err) {
				logger.error(err.message);
				resolve();
			}
			else {
				logger.trace("successfully updated orders on reservation change...");
				resolve();
			}
		});
	});
}

/* Here orders effected can be batched i,e with status processing but not invoiced;
	- Two things can happen to this order;(consider Release and Hold scenario of invoice)
		1. Reservation
		2. unReservation
	1.Reservation: In case of reservation either already alloted stocks qty can rise or a new snapshot entry can be inserted - This can happen when alloted stock to order was different and scanned data is different; 
	2. Unreservation : Here alloted stock may get reverted as its not required and its contribution is fullfiled by some other inventory ; or if borrowed for some other order then its qty will be decreased and decreased qty shall be settled with some other inventory;
 */
function _changeOrderLevelFlags(stockLedgers, callback) {
	logger.trace("changing/resetting order level flags on stocks change.....");
	var updatedOrderList = [];
	var errorList = [];
	// Async Queue operation;
	var queue = async.queue(function (_ledger, queueCB) {
		_findEffectedOrder(_ledger).then(order => {
			//Find order from ledger reference and proceed;
			var subOrderId = _ledger.reference.subOrderId;
			var subOrder = _.find(order.subOrders, { _id: subOrderId });

			if (!order || !subOrder) {
				queueCB(new Error(`Cannot find order/suborder from stockledger reference.`));
				return;
			}
			var _setter = {};
			var _pusher = {};
			var _updateBuilder = {};

			var transactionQty = _ledger.stockTransaction[0].quantity - _ledger.stockTransaction[1].quantity;
			/**
			 * Suborder : insert or update blockedRequests array list;
			 *  - If not found insert new record or update the exisiting;
			 */
			var blockedInstance = _.find(subOrder.blockedProducts, { productId: _ledger.productId });
			if (!blockedInstance) {
				//if not found then insert one;
				subOrder.blockedProducts = subOrder.blockedProducts && subOrder.blockedProducts.length ? subOrder.blockedProducts : [];
				var newProduct = { "productId": _ledger.productId, "quantity": transactionQty };
				subOrder.blockedProducts.push(newProduct);
				_pusher = Object.assign(_pusher, { "subOrders.$.blockedProducts": newProduct });
			} else {
				//if already exists then update it;
				blockedInstance.quantity += transactionQty;
				var index = _.findIndex(subOrder.blockedProducts, function (o) { return o.productId == _ledger.productId; });
				_setter = Object.assign(_setter, { [`subOrders.$.blockedProducts.${index}.quantity`]: blockedInstance.quantity });
			}
			/* 
			 * Add the new snapshot data to the snapshots array of suborders;
			 *  - If already exisits update it else insert new record;
			 */
			var snapShot = _.find(subOrder.snapshots, { snapShotId: _ledger.snapShotId, productId: _ledger.productId });
			if (!snapShot) {
				//If snapshot not found then insert new entry;
				subOrder.snapshots = subOrder.snapshots && subOrder.snapshots.length ? subOrder.snapshots : [];
				var newSnapShot = {
					"ledgerId": _ledger._id,
					"snapShotId": _ledger.snapShotId,
					"whId": _ledger.warehouseId,
					"productId": _ledger.productId,
					"quantity": transactionQty,
					"mrp": _ledger.mrp,
					"location": _ledger.position ? _ledger.position.location : null,
					"area": _ledger.position ? _ledger.position.area : null,
					"rackId": _ledger.position ? _ledger.position.rackId : null,
					"binId": _ledger.position ? _ledger.position.binId : null,
					"type": "Reserved",
					"createdAt": new Date()
				}
				subOrder.snapshots.push(newSnapShot);
				//_setter = Object.assign(_setter, { "$push": { "subOrders.$.snapshots": newSnapShot } });
				_pusher = Object.assign(_pusher, { "subOrders.$.snapshots": newSnapShot });
			} else {
				//If already exists then update the record;
				snapShot.quantity += transactionQty;
				//find snapshot index;
				var index = _.findIndex(subOrder.snapshots, function (o) { return o.snapShotId == snapShot.snapShotId; });
				_setter = Object.assign(_setter, { [`subOrders.$.snapshots.${index}.quantity`]: snapShot.quantity });
			}
			/*
			 * Suborder level flags - readyForBatching;
				- Update suborder level flags :  readyForBatching : true/false;
			 */
			var totalBlockedQty = _.sumBy(subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
			var totalRequestedQty = _.sumBy(subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
			//Set readyForBatching Flag;
			if (totalRequestedQty > 0 && totalBlockedQty === totalRequestedQty) {
				subOrder.readyForBatching = true;
			} else {
				subOrder.readyForBatching = false;
			}

			_setter = Object.assign(_setter, { "subOrders.$.readyForBatching": subOrder.readyForBatching });
			/* 
				- Order level status flags update here;
				 - Iterate and update order level flags - stockAllocation  , gotRequestedProducts;
			  */

			var overAllTotalBlockedQty = 0;
			var overAllTotalRequestedQty = 0;

			_.each(order.subOrders, subOrder => {
				overAllTotalBlockedQty += _.sumBy(subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
				overAllTotalRequestedQty += _.sumBy(subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
			});

			if (overAllTotalRequestedQty > 0 && overAllTotalBlockedQty === overAllTotalRequestedQty) {
				order.stockAllocation = "Allocated";
				order.gotRequestedProducts = true;
			} else if (overAllTotalBlockedQty > 0 && overAllTotalBlockedQty < overAllTotalRequestedQty) {
				order.stockAllocation = "PartialAllocated";
				order.gotRequestedProducts = false;
			} else {
				order.stockAllocation = "NotAllocated";
				order.gotRequestedProducts = false;
			}

			_setter = Object.assign(_setter, { "stockAllocation": order.stockAllocation, "gotRequestedProducts": order.gotRequestedProducts });

			if (_pusher && !_.isEmpty(_pusher)) {
				_updateBuilder = Object.assign({}, { "$set": _setter }, { "$push": _pusher });
			} else {
				_updateBuilder = Object.assign({}, { "$set": _setter });
			}

			/* Update the order; */
			Mongoose.models['omsMaster'].findOneAndUpdate({ "_id": order._id, "subOrders._id": subOrderId }, _updateBuilder, { new: true }).exec()
				.then(updatedOrder => {
					logger.trace("Updated order on reservation change....");
					queueCB(null, updatedOrder);
				});
			//.catch(e => queueCB(e));
		}).catch(e => queueCB(e));
	});

	queue.drain = function () {
		if (errorList && errorList.length) {
			callback(new Error(JSON.stringify(errorList)));
		} else {
			callback(null, updatedOrderList, stockLedgers);
		}
	}

	_.each(stockLedgers, _ledger => {
		queue.push(_ledger, function (err, order) {
			if (err) {
				logger.error("Error on updating order..", err.message);
				errorList.push(err.message);
			}
			else if (order)
				updatedOrderList.push(order);
		});
	});
}

/* Here orders effected can be batched i,e with status processing but not invoiced;
	- Two things can happen to this order;(consider Release and Hold scenario of invoice)
		1. Reservation
		2. unReservation
	1.Reservation: In case of reservation either already alloted stocks qty can rise or a new snapshot entry can be inserted - This can happen when alloted stock to order was different and scanned data is different; 
	2. Unreservation : Here alloted stock may get reverted as its not required and its contribution is fullfiled by some other inventory ; or if borrowed for some other order then its qty will be decreased and decreased qty shall be settled with some other inventory;
 */
function _findEffectedOrder(_ledger) {
	return new Promise((resolve, reject) => {
		logger.trace("finding effected orders upon reservation change...");
		var subOrderId = _ledger.reference.subOrderId; //Extract all suborderId from stock ledgers;
		var productId = _ledger.productId; //Extract all product id from stock ledgers;
		Mongoose.models['omsMaster'].aggregate([{
			"$match": {
				"fulfilledBy": "MPS0",
				"orderType": "Wholesale",
				"subOrders": {
					"$elemMatch": {
						"_id": {
							"$in": [subOrderId]
						},
						"products": {
							"$elemMatch": {
								id: {
									"$in": [productId]
								}
							}
						},
					}
				}
			}
		},
		{
			"$project": {
				"_id": 1,
				"paymentStatus": 1,
				"stockAllocation": 1,
				"status": 1,
				"gotRequestedProducts": 1,
				"createdAt": 1,
				"subOrders": 1,
			}
		}
		]).exec()
			.then(orderList => {
				if (orderList && orderList.length) {
					resolve(orderList[0]);
				} else {
					reject(new Error(`Orders not found for the stock ledger references`));
				}
			}).catch(e => reject(e));
	});
}

/**
 * 
 * @param {*} orderList 
 * @param {*} stockLedgers 
 * @param {*Array} findQuery - array of fields to query on; 
 * @param {*} callback 
 */
function _genericBulkUpdate(orderList, stockLedgers, callback) {
	logger.trace("updating orders after reservation change.....");
	var model = new crudder.model(orderList[0]);
	var bulk = model.collection.initializeUnorderedBulkOp();
	orderList.map(_order => {
		//_order = _order.toObject();
		/* 	//console.log("---object type--" , _order.constructor.name  , typeof _order);
			if (!findQueryList || !findQueryList.length) {
				callback(new Error(`Query list is empty, cannot execute bulk update`));
			}
			var query = {};
			_.each(findQueryList, field => {
				query[field] = _order[field]
			}); */
		//{ "_id": _order._id, "stockAllocation": { "$nin": ["Allocated"] } }
		bulk.find({ "_id": _order._id }).update({ "$set": { "stockAllocation": _order.stockAllocation, "gotRequestedProducts": _order.gotRequestedProducts, "subOrders": _order.subOrders } });
	});
	bulk.execute(function (err, result) {
		if (err)
			callback(err);
		else
			callback(null, orderList, stockLedgers, result);
	});
}

/*
	- Here we will call onReservation change related functions, But
	- Here we will not face any concurrency issue , as we are taking stocks from one order and not replacing that order with any other stocks, 
	- So at one point stocks are only taken one order and alloted to a different order, so wrt to any one order both stock inc and dec not happening;
	- Hence no need for queue;
 */
function onForceBatchWebhook(req, res) {
	logger.trace("BATCH WEBHOOK : Invoking webhook for force batch creation.....");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	logger.trace("Ledger ids :", ledgerIdList);
	var whId = req.swagger.params['whId'].value
	var orderId = req.swagger.params['orderId'].value;
	var orderType = req.swagger.params['orderType'].value;
	var isPartial = req.swagger.params['isPartial'].value;
	var remarks = req.swagger.params['remarks'].value;
	var user = req.swagger.params['user'].value;

	async.waterfall([
		_fetchStockLedgers(ledgerIdList),
		_changeOrderLevelFlags,
	], function (err, orderList, ledgerList) {
		if (err)
			res.status(400).send({ "message": err.message });
		else {
			logger.trace("successfully updated orders on force batch...");
			//_createBatch orderId, orderType, isPartial, remarks, count, user
			batchController.internalBatchCreation(whId, orderId, orderType, isPartial, remarks, 1, user)
				.then(batch => {
					res.status(200).send({ "message": "success" });
				})
				.catch(e => {
					logger.error("Error While Force batch creation: ", e.message);
					res.status(400).send({ "message": e.message })
				});
		}
	});
}

/*
	- This is invoked as there was stock transfer from an order to the inventory
	- This is similar to stock intake scenario;
	- Hence update order;
	- Then reserve open orders;
 */
function onInventoryTransferWebhook(req, res) {
	logger.trace("INVENTORY TRANSFER WEBHOOK : Invoking webhook on transfer of stock to inventory.....");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	var productIdList = req.swagger.params["productIds"].value;
	var whId = req.swagger.params["whId"].value;
	logger.trace("Ledger ids :", ledgerIdList);

	async.waterfall([
		_fetchStockLedgers(ledgerIdList),
		_changeOrderLevelFlags,
	], function (err, result) {
		if (err) {
			res.status(400).send({ "message": err.message });
		} else {
			var reference = { ref: {}, whId: whId, type: "Stock Reservation", "byPassHeuristics": true, exculsionList: [result[0]._id] };
			pendingOrderReservation(productIdList, reference, function (err, result) {
				if (err)
					res.status(400).send({ "message": err.message });
				else
					res.status(200).send(result);
			});
		}
	});
}

/**
 * @description This webhook is called from stock ledger ; This endpoint is assigned from invoice.js class and once this is invoked we need to insert all the released snapshots to batch and invoice collections;
 * @param {*} req 
 * @param {*} res 
 */
//At a time this webhook will be invoked only for one order and only for subOrders having common performa invoice number as it is queued process;
function onReleaseWebhook(req, res) {
	logger.trace("WEBHOOK : Invoking webhook on stock release");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	async.waterfall([
		_fetchStockLedgers(ledgerIdList),
		_findBatchAndInvoice,
		_batchUpdateOnRelease,
		_invoiceUpdateOnRelease
	], function (err, stockLedgers, _batch, _invoice) {
		if (err)
			logger.error(err.message);
		else {
			// invoiceCommissionCtrl.releaseIMEICommission(_invoice);
			logger.trace("On Release webhook: Update successfull.....");
			/**
			 * Releasing IMEI Commission after Invoiced but Should Release the Commission Only After IMEI Activation
			 */
			//invoiceCommissionCtrl.releaseIMEICommission(_invoice);
		}
	});
	res.status(200).send({ message: "success" });//Resolve the webhook instantly; Resolve it regardless of your operation end result;
}

function _findBatchAndInvoice(stockLedgers, callback) {
	/* At a time release will happen only for one order and only for those subOrders having common performaId and batch Id; so use findOne; */
	/* Next time remaingin subOrders may come if left out with same batch Id but different suborderIds and performa Id; */
	var subOrderIds = stockLedgers.map(_ledger => _ledger.reference.subOrderId);//Extract all suborderIds from stock ledgers;
	subOrderIds = _.uniqBy(subOrderIds);//Make this list unique;
	var productIds = stockLedgers.map(_ledger => _ledger.productId);//Extract all product ids from stock ledgers;
	productIds = _.uniq(productIds);//Make this list unique;
	var performaIds = stockLedgers.map(_ledger => _ledger.reference.performaId);
	performaIds = _.uniq(performaIds);//At a time performaIds list can never be more than once; since at a time only subOrders under one performa can be invoiced;
	//Find Batch;
	var batchPromise = new Promise((resolve, reject) => {
		Mongoose.models['omsBatch'].findOne({
			"performa":
			{
				"$elemMatch":
				{
					"performaId": performaIds,
					"subOrderId": { "$in": subOrderIds }
				}//Note: At one particular time , performaId list can never be more than one , as its a queued process and also only subOrders under one performa can be invoiced at a time;
			}
		}).exec()
			.then(_batch => resolve(_batch))
			.catch(e => reject(e));
	});
	//Find Invoice;
	var invoicePromise = new Promise((resolve, reject) => {
		Mongoose.models['omsInvoice'].findOne({ "performaInvoiceNo": { "$in": performaIds } }).exec()//This can never be more than one;
			.then(_invoice => resolve(_invoice))
			.catch(e => reject(e));
	});

	Promise.all([batchPromise, invoicePromise]).then(resultArr => {
		callback(null, stockLedgers, resultArr[0], resultArr[1]);//null,stockLedgers,order,batch,invoice;
	}).catch(e => callback(e));
}

/*PURPOSE:- The update here is just to add invoiced snapshots from order to the batch as reference */
function _batchUpdateOnRelease(stockLedgers, _batch, _invoice, callback) {
	if (!_batch) {
		callback(new Error(`Cannot find batch doc to update upon post invoice`));
		return;
	}
	stockLedgers.map(_ledger => {
		var subOrderId = _ledger.reference.subOrderId;
		var performaId = _ledger.reference.performaId;

		var _snapShot = {
			"ledgerId": _ledger._id,
			"snapShotId": _ledger.snapShotId,
			"whId": _ledger.warehouseId,
			"productId": _ledger.productId,
			"quantity": _ledger.requestQty,
			"serialNo": _ledger.serialNo ? _ledger.serialNo : []
		};
		// from batch performa list , find performa by performaId,
		var performa = _.find(_batch.performa, { "performaId": performaId });
		// Then into this performa append all subOrder snapshots with qty greater than zero;
		if (performa) {
			/* Performa invoiced snapshots */
			performa.status = "Completed";
			performa.invoicedSnpshot = performa.invoicedSnpshot && performa.invoicedSnpshot.length ? performa.invoicedSnpshot : [];
			var invoicedSnpshot = _.find(performa.invoicedSnpshot, { "id": subOrderId });//invoicedSnpshot is a list , from here check if alreadt record with suborderId exists;
			if (!invoicedSnpshot) {
				//insert new;
				var invoiceReference = { "id": subOrderId, "snapshots": [_snapShot] };
				performa.invoicedSnpshot.push(invoiceReference);
			} else {
				invoicedSnpshot.snapshots = invoicedSnpshot.snapshots && invoicedSnpshot.snapshots.length ? invoicedSnpshot.snapshots : [];
				// If exists then check if in snapShots that particular inventory exists , if not create new else update;
				var exisitingSnapShots = _.find(invoicedSnpshot.snapshots, { "snapShotId": _ledger.snapShotId });
				if (!exisitingSnapShots) {
					// insert new;
					invoicedSnpshot.snapshots.push(_snapShot);
				} else {
					//update the existin one;
					exisitingSnapShots.quantity += _ledger.requestQty;
					exisitingSnapShots.serialNo = exisitingSnapShots.serialNo.concat(_ledger.serialNo);
				}

			}
		}
	});
	//update here;
	Mongoose.models['omsBatch'].findOneAndUpdate({ "_id": _batch._id }, { "$set": { "performa": _batch.performa } }, { new: true }).exec()
		.then(doc => callback(null, stockLedgers, doc, _invoice))
		.catch(e => callback(e));
}

function _invoiceUpdateOnRelease(stockLedgers, _batch, _invoice, callback) {
	if (!_invoice) {
		callback(new Error(`Cannot find invoice doc to update upon post invoice`));
		return;
	}
	stockLedgers.map(_ledger => {//Iterate ledgers;
		var subOrderId = _ledger.reference.subOrderId;
		var performaId = _ledger.reference.performaId;
		var _snapShot = {
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
		};
		//Find deal from invoice;
		var deal = _.find(_invoice.deals, { "_id": subOrderId });

		if (deal) {
			deal.invoicedsnapshotReference = deal.invoicedsnapshotReference && deal.invoicedsnapshotReference.length ? deal.invoicedsnapshotReference : [];
			deal.invoicedsnapshotReference.push(_snapShot);
		}
	});
	//Update;
	Mongoose.models['omsInvoice'].findOneAndUpdate({ "_id": _invoice._id }, { "$set": { "deals": _invoice.deals } }, { new: true }).exec()
		.then(doc => callback(null, stockLedgers, _batch, doc))
		.catch(e => {
			logger.error("_invoiceUpdateOnRelease : Error on invoice update - ", e);
			callback(e);
		});
}

/* 
	- THis is invoked on stock correction
	- This takes effect only if any onHold qty is decreased while stock correction;
	- Well in this case first find order which is reserved and not batched and unreserve the stock;
	- Incase un-batched order is not found then , find any batched order and un-reserve the stock;
 */
function onStockCorrectionWebhook(req, res) {
	logger.trace("CORRECTION WEBHOOK : Invoking webhook on stock correction ....");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	/*
		- correction is of two types:
			1. Stock increase / decrease
			2. Stock movement 
	 */
	var path = "/stockledger?filter=" + encodeURIComponent(JSON.stringify({ "_id": { "$in": ledgerIdList }, "status": "Committed" }));
	_fireHttpRequest("wh", path, "GET", null)
		.then(stockLedgers => {
			if (!stockLedgers || !stockLedgers.length)
				res.status(400).send({ "message": `Counld not find any stock ledgers.` });
			else {
				orderMgmtCtrl.orderCorrection(stockLedgers[0]).then(result => res.status(200).send(result)).catch(e => res.status(400).send({ "message": e.message }));
			}
		})
		.catch(e => res.status(400).send({ "message": e.message }));
	//res.status(200).send({});
}

/*
	- on move to suspense for walmart orders; 
 */
function onMoveToSuspenseReservationWebhook(req, res) {
	logger.trace("MOVE TO SUSPENSE RESERVATION WEBHOOK : Invoking webhook for move to suspense reservation.....");
	var params = req.swagger.params['data'].value;
	var ledgerIdList = params.list;
	logger.trace("Ledger ids :", ledgerIdList);
	var orderId = req.swagger.params['orderId'].value;
	var batchId = req.swagger.params['batchId'].value;
	var performaNo = req.swagger.params['performaNo'].value;
	var subOrderId = req.swagger.params['subOrderId'].value;
	var onlyCancelAndInsert = req.swagger.params['onlyCancelAndInsert'].value;
	onlyCancelAndInsert = onlyCancelAndInsert ? onlyCancelAndInsert : false;

	if (onlyCancelAndInsert) {
		batchController.cancelAndInsertNewPerforma(orderId, batchId, performaNo, subOrderId)
			.then(result => {
				res.status(200).send({ "message": "success" });
			})
			.catch(e => {
				logger.error("Error While cancelling and inserting new performa on move to suspense : ", e.message);
				Mongoose.models['omsMaster'].findOneAndUpdate({ "subOrders._id": subOrderId }, { $addToSet: { "subOrders.$.errorLogs": JSON.stringify(e) } });
				res.status(400).send({ "message": e.message })
			});
	} else {
		async.waterfall([
			_fetchStockLedgers(ledgerIdList),
			_changeOrderLevelFlags,
		], function (err, orderList, ledgerList) {
			if (err)
				res.status(400).send({ "message": err.message });
			else {
				let data = {
					orderId: orderId,
					batchId: batchId,
					performaNo: performaNo,
					subOrderId: subOrderId
				}
				onMoveToSuspenseWorkerQueue.send(JSON.stringify(data), function (err, message) {
					if (err) {
						logger.error(err);
						res.status(400).send({ "message": err.message })
					}
					else {
						logger.info("QUEDED: On Move to suspense batch insertion queue logged....");
						res.status(200).send({ "message": "Success" });
					}
				});
			}
		});
	}
}


onMoveToSuspenseWorkerQueue.on("message", function (message, next, msgId) {
	logger.trace("ON MOVE TO SUSPENSE BATCH INSERT QUEUE: Processing rsmq queue..", message);
	worker.size(false, (err, count) => logger.info("PENDING IN QUEUE : ", count));
	try {
		var data = JSON.parse(message);
		batchController.cancelAndInsertNewPerforma(data.orderId, data.batchId, data.performaNo, data.subOrderId)
			.then(result => {
				next();
			})
			.catch(e => {
				logger.error("Error While cancelling and inserting new performa on move to suspense : ", e);
				Mongoose.models['omsMaster'].findOneAndUpdate({ "subOrders._id": data.subOrderId }, { $addToSet: { "subOrders.$.errorLogs": { error: e } } });
				next();
			});
	} catch (e) {
		logger.error(e.message);
		next();
	}
});

/* THis will kick in in case  where order update fails or excess stock for an order is requested etc */
function revertStocks() {

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
						try {
							data = JSON.parse(data);
							resolve(data);
						} catch (e) {
							reject(e);
						}
					});
				});
				if ((_method === 'POST' || _method === 'PUT') && !_.isEmpty(_payload))
					request.end(JSON.stringify(_payload));
				else
					request.end();

			}).catch(e => reject(e));
	});
}


/* function _bulkUpdate(docs){
    return  new Promise((resolve , reject)=>{
        var model = new crudder.model(docs[0]);
        var bulk = model.collection.initializeUnorderedBulkOp();  
        docs.map(_doc =>{
            _doc = _doc.toObject();
            bulk.find({_id : _doc._id}).update({'$set' : {'services' : _doc.services}});
        });
        bulk.execute(function(err , result){
            if(err)
                reject(err);
            else
                resolve(result);
        });
    });

} */

/**
 * This function will reserve only contest order 
 * @param {*} req 
 * @param {*} res 
 */
function reserveContestOrder(req, res) {
	var orderId = req.swagger.params.id.value;
	var suborderId = req.swagger.params.suborderId.value;
	var productId = req.swagger.params.productId.value;
	var data = req.swagger.params['data'].value;
	let newSnap = data.newInventory;
	if (!orderId) {
		res.status(400).send({
			"message": "Order Id Required"
		});
	} else {
		let ledger = {
			"snapShotId": newSnap._id,
			"warehouseId": newSnap.whId,
			"productId": productId,
			"requestQty": newSnap.quantity,
			"referenceType": "Stock Reservation",
			"reference": {
				"subOrderId": suborderId
			},
			"mrp": newSnap.mrp,
		}

		var payload = {
			"list": [ledger],
			"webhook": {
				"magicKey": "oms",
				"path": "/webhook/onReservationChange"
			}
		};
		var path = "/stockledger/bulkStockVariation";//stock ledger api endpoint;
		_fireHttpRequest("wh", path, "PUT", payload)
			.then(result => {
				res.status(200).send(result);
			}).catch(e => res.status(400).send(e));

	}
}

/**
 * @description This function wraps the function dependent parameteres into http req and res format; 
 *              USAGE: Use this function to invoke another function which takes req and res as params, with in the same module , 
 *              Instead of actually making HTTP call, you use this to invoke any function which accepts req and res; 
 *              Pass the parameters as in you pass it wrt to swagger definition to any api endpoint within the same service;
 *              This function wraps your params into HTTP req and res mocker;
 *              
 * @param {*} headers 
 * @param {*} payload 
 * @param {*} httpBody 
 * @param {*} interceptor 
 */
function httpInternalizer(headers, payload, httpBody, interceptor) {
	var req = {
		"swagger": { "params": {} },
		"headers": headers ? headers : {}
	};

	Object.keys(payload).map(k => {
		req.swagger.params[k] = { value: payload[k] };
	});

	if (httpBody) {
		req.body = httpBody;
	}

	var res = {
		"status": function (statusCode) {
			return {
				"statusCode": statusCode,
				"send": function (data) {
					if (statusCode === 200) {

						if (data.constructor.name === 'model') {
							data = data.toObject();
						}

						interceptor(null, data);
					}
					else {
						interceptor(data); //Error
					}
				},
				"json": function (data) {
					if (statusCode === 200) {

						if (data.constructor.name === 'model') {
							data = data.toObject();
						}

						interceptor(null, data);
					}
					else {
						interceptor(data); //Error
					}
				}
			}
		}
	};

	return { req: req, res: res }
}


(function testEnv() {
	if (process.env.TEST_ENV) {
		module.exports = {
			_setOrderLevelFlags: _setOrderLevelFlags,
			_bulkUpdateOrders: _bulkUpdateOrders,
			//_findOrders: _findOrders
		}
	}
}());

module.exports = {
	init: init,
	onGrnReservation: onGrnReservation,//Called post grn to reserve stock against open orders;
	pendingOrderReservation: pendingOrderReservation,//Incase when an order is cancelled or reverted; do reservation again;
	updateOrdersWebhook: updateOrdersWebhook,//This is to update order on occassions like : Order placement , Grn reservation;
	onReservationChangeWebhook: onReservationChangeWebhook,//This is on occassion where invoicing release and hold happens or a situation where reserved stock is altered;
	onReleaseWebhook: onReleaseWebhook,//Only on Invoicing;
	onForceBatchWebhook: onForceBatchWebhook,
	onStockCorrectionWebhook: onStockCorrectionWebhook,
	onStockIntakeReservation: onStockIntakeReservation,
	onInventoryTransferWebhook: onInventoryTransferWebhook,
	onMoveToSuspenseReservationWebhook: onMoveToSuspenseReservationWebhook,
	reserveContestOrder: reserveContestOrder,
};