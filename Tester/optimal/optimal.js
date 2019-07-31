
var _ = require("lodash");

var orderGroup = [{
    "_id": {
        "whId": "WMF3",
        "partnerOrderId": "3196413"
    },
    "data": [
        {
            "_id": "OR20190531533",
            "partnerWhId": "248",
            "isSkWarehouse": false,
            "isScheduledPlacement": true,
            "createdAt": "2019-05-31T12:17:31.983Z",
            "stockAllocation": "PartialAllocated",
            "subOrders": {
                "id": "D6279789726",
                "quantity": 9,
                "_id": "OR20190531533_1",
                "invoiced": false,
                "readyForBatching": false,
                "blockedProducts": [],
                "requestedProducts": [
                    {
                        "productId": "PR13212",
                        "quantity": 9,
                        "_id": "5cf11b5d4de4ab77d4a26e17"
                    }
                ],
                "status": "Confirmed",
                "products": [
                    {
                        "quantity": 9,
                        "id": "PR13212",
                        "mapping": {
                            "productId": "342682",
                            "categoryId": "CK00003957",
                            "sku": "12732"
                        }
                    }
                ],
                "partnerOrderId": "3196413",
                "poId": "2019053131"
            },
            "source": "WMF3",
            "vendorId": "V1013",
            "data": [
                {
                    "_id": "OR20190531533_1",
                    "blockedProducts": [],
                    "requestedProducts": [
                        {
                            "productId": "PR13212",
                            "quantity": 9,
                            "_id": "5cf11b5d4de4ab77d4a26e17"
                        }
                    ]
                },
                {
                    "_id": "OR20190531533_2",
                    "blockedProducts": [],
                    "requestedProducts": [
                        {
                            "productId": "PR13201",
                            "quantity": 10,
                            "_id": "5cf11b5d4de4ab77d4a26e18"
                        }
                    ]
                },
                {
                    "_id": "OR20190531533_3",
                    "blockedProducts": [],
                    "requestedProducts": [
                        {
                            "productId": "PR13186",
                            "quantity": 7,
                            "_id": "5cf11b5d4de4ab77d4a26e19"
                        }
                    ]
                },
                {
                    "_id": "OR20190531533_4",
                    "blockedProducts": [
                        {
                            "quantity": 10,
                            "productId": "PR13183",
                            "_id": "5cf25a77f1b332454a638e0f"
                        }
                    ],
                    "requestedProducts": [
                        {
                            "productId": "PR13183",
                            "quantity": 10,
                            "_id": "5cf11b5d4de4ab77d4a26e1a"
                        }
                    ]
                },
                {
                    "_id": "OR20190531533_5",
                    "blockedProducts": [],
                    "requestedProducts": [
                        {
                            "productId": "PR13184",
                            "quantity": 20,
                            "_id": "5cf11b5d4de4ab77d4a26e1b"
                        }
                    ]
                }
            ]
        }]
}]//require("./data.orders");

var inwardedData = require("./data.inwarded");

function asnInwardOrders() {
    let solutionList = [];
    let error = null;
    orderGroup.map(group => {
        let whId = group._id.whId;
        let partnerOrderId = group._id.partnerOrderId;
        let inwardList = inwardedData.filter(el => el.orderId === partnerOrderId ? true : false);
        group.data = group.data && group.data.length ? group.data : [];
        try {
            let result = optimalMatch(group.data, inwardList);
            solutionList.push({ whId: whId, partnerOrderId: partnerOrderId, data: result.solution, shortageList: result.shortageList });
        } catch (e) {
            error = e;
            return;
        }
    });

    if (error) {
        console.log({ message: error.message });
    } else {
        console.log("Result:--------------------------------\n", JSON.stringify(solutionList));
    }
}


function optimalMatch(selectedOrders, inwardedData) {

    try {
        var orderMatrixList = prepareOrderMatrix(selectedOrders);
        var transformedMatrix = transformMatrix(orderMatrixList);
        var inwardedMatrix = initInwardedMatrix(inwardedData, selectedOrders);
        var sortedMatrixList = remainderStage(transformedMatrix, inwardedMatrix);
        var determination = _determineSolution(sortedMatrixList, inwardedMatrix);

        var solutionList = [];
        var shortageList = [];

        determination.map(_order => {
            if (_order.solution && _order.solution.length) {
                solutionList = solutionList.concat(_order.solution);
            }
            if (_order.shortageList && _order.shortageList.length) {
                shortageList = shortageList.concat(_order.shortageList);
            }
        });

        return { solution: solutionList, shortageList: shortageList };

    } catch (e) {
        throw e;
    }


    function prepareOrderMatrix(_orderList) {
        var orderMatrixList = [];
        _orderList.map(_order => {
            // check if the order is in matrix , if not push;
            var exisitingOrderMatrix = _.find(orderMatrixList, { "_id": _order._id });
            if (!exisitingOrderMatrix) {
                //compute order total required qty , blocked qty , remaining qty;
                var newMatrix = {
                    "_id": _order._id,
                    "productSummary": [],
                    "orderSummary": {},
                    "orderkeeper": {},
                    "solution": [],
                    "shortageList": [],
                    "partnerWhId": _order.partnerWhId,
                    "vendorId": _order.vendorId,
                    "whId": _order.source
                };
                _order.subOrders.products.map(product => {
                    var productMatrix = getProductMatrix(_order, product, product.id);
                    newMatrix["productSummary"].push(productMatrix);//no need to check if prod matrix has an element with that soId and Prod id;
                });
                //Get total order req , blocked and remaining;
                var orderLevelCount = getOrderLevelCount(_order);
                newMatrix['orderSummary'] = orderLevelCount;
                newMatrix['orderkeeper'] = orderLevelCount;
                orderMatrixList.push(newMatrix);
            } else {
                //If exists then its orders another suborder record ; convert it to product matrix and insert into exisiting;
                //Extract all the products from this suborder matching with our productId list;
                _order.subOrders.products.map(product => {
                    var productMatrix = getProductMatrix(_order, product, product.id);
                    exisitingOrderMatrix["productSummary"].push(productMatrix);
                });
            }
        });

        return orderMatrixList;
    }

    function getProductMatrix(_order, product, _productId) {
        var requestedProduct = _.find(_order.subOrders.requestedProducts, { "productId": _productId });
        var blockedProduct = _.find(_order.subOrders.blockedProducts, { "productId": _productId });
        var requestedQty = requestedProduct ? requestedProduct.quantity : 0;
        var blockedQty = blockedProduct ? blockedProduct.quantity : 0;
        var sOlevelCount = getSubOrderLevelCount(_order.subOrders);
        var productMatrix = {
            "productId": product.id,
            "subOrderId": _order.subOrders._id,
            "poId": _order.subOrders.poId,
            "whId": _order.source,
            "vendorId": _order.vendorId,
            "partnerOrderId": _order.subOrders.partnerOrderId,
            "productHash": product._id,
            "mrp": product.mrp,
            "requestedQty": product.quantity,
            "blockedQty": blockedQty,
            "requiredQty": requestedQty - blockedQty,
            "subOrderSummary": sOlevelCount,
            "mapping": product.mapping,
            "productkeeper": {
                "requiredQty": requestedQty - blockedQty,//on reset counters/keepers use this qty;
                "remainingQty": requestedQty - blockedQty,//this will be same initially;
                "usedQty": 0,
                "snapShots": []
            }
        };
        return productMatrix;
    }

    function getSubOrderLevelCount(_subOrder) {
        var blockedCount = _.sumBy(_subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
        var requestedCount = _.sumBy(_subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
        return {
            totalRequestedQty: requestedCount,
            totalBlockedQty: blockedCount,
            totalRemainingQty: requestedCount - blockedCount
        };
    }

    function getOrderLevelCount(_order) {
        var totalBlockedQty = 0;
        var totalRequestedQty = 0;
        _order.data.map(_subOrder => {
            var blockedCount = _.sumBy(_subOrder.blockedProducts, el => (el && el.quantity) ? el.quantity : 0);
            var requestedCount = _.sumBy(_subOrder.requestedProducts, el => (el && el.quantity) ? el.quantity : 0);
            totalBlockedQty += blockedCount;
            totalRequestedQty += requestedCount;
        });
        return {
            totalRequestedQty: totalRequestedQty,
            totalBlockedQty: totalBlockedQty,
            totalRequiredQty: totalRequestedQty - totalBlockedQty,
            totalRemainingQty: totalRequestedQty - totalBlockedQty
        };
    }

    function transformMatrix(_orderMatrixList) {
        _orderMatrixList.map(_orderMatrix => {
            _orderMatrix["prodRatioMatrix"] = [];
            var ratioList = [];//ProdRatioMatrixList;
            _orderMatrix["productSummary"].map(_productMatrix => {
                var entity = _.find(ratioList, { "productId": _productMatrix.productId });
                if (!entity) {
                    //create new;
                    var obj = {
                        "productId": _productMatrix.productId,
                        "totalQtyRequired": _productMatrix.requiredQty,
                        "remainingQty": _productMatrix.requiredQty,
                        "usedQty": 0,
                        "trace": [{ "sOid": _productMatrix.subOrderId, "productId": _productMatrix.productId, "mrp": _productMatrix.mrp, "hash": _productMatrix.productHash, "requiredQty": _productMatrix.requiredQty }]
                    };
                    ratioList.push(obj);
                } else {
                    //update to exisiting;
                    entity.totalQtyRequired += _productMatrix.requiredQty;
                    entity.remainingQty += _productMatrix.requiredQty;
                    entity.trace.push({ "sOid": _productMatrix.subOrderId, "productId": _productMatrix.productId, "mrp": _productMatrix.mrp, "hash": _productMatrix.productHash, "requiredQty": _productMatrix.requiredQty });
                }
            });
            ratioList = ratioList.filter(el => el.totalQtyRequired > 0);//even if the product is in GRN product id list , ignore if totalQtyRequired is less than zero;
            _orderMatrix["prodRatioMatrix"] = ratioList;
        });
        return _orderMatrixList;
    }

    function getCount(required, available) {
        return required <= available ? required : required > available ? available : 0;
    }

    function initInwardedMatrix(inwardedData, selectedOrders) {
        //Set keepers for each snapshot in a group
        inwardedData.map(data => {

            data.found = false;

            data.mapping = {
                productId: data.productId,
                sku: data.productSku
            }

            delete data.productId;
            delete data.productSku;

            data.keeper = {
                totalQty: data.inwardedQty,
                remainingQty: data.inwardedQty,
                usedQty: 0,
                trace: []
            }

            outer:
            for (let i = 0; i < selectedOrders.length; i++) {
                let o = selectedOrders[i];
                inner:
                for (j = 0; j < o.subOrders.products.length; j++) {
                    let p = o.subOrders.products[j];
                    if (p && (p.mapping.productId === data.mapping.productId || p.mapping.sku === data.mapping.sku)) {
                        data.id = p.id;
                        data.productId = p.id;
                        data.mapping = p.mapping;
                        data.found = true;
                        break outer;
                    } else if (p && p.mapping.productId === data.mapping.sku) {
                        throw new Error(`Invalid Partner SKU ${data.mapping.sku} for sk product ${p.id}. Given value is Partner Product Id & actual Parnter SKU is ${p.mapping.sku}`);
                    } else if (p && p.mapping.sku === data.mapping.productId) {
                        throw new Error(`Invalid Partner ProductId ${data.mapping.productId} for sk product ${p.id}. Given value is Parnter SKU  & actual Partner ProductId is ${p.mapping.productId}`);
                    }
                }
            }
        });

        let notFoundList = inwardedData.filter(l => l.found === false ? true : false);

        if (notFoundList && notFoundList.length) {
            let productIds = notFoundList.map(l => l.mapping.productId);
            let skus = notFoundList.map(l => l.mapping.sku);

            productIds = productIds.filter(Boolean);
            skus = skus.filter(Boolean);

            productIds = _.uniq(productIds);
            skus = _.uniq(skus);

            let ids = productIds && productIds.length ? productIds.join(",") : skus && skus.length ? skus.join(",") : "";

            throw new Error(`Products with following references ${ids} doesnot exist in any of the partner orders inwarded`);
        }

        return inwardedData;
    }



    function remainderStage(transformedMatrix, inwardedMatrix) {
        transformedMatrix.map(_order => {
            _order.orderkeeper.remainder = _order.orderSummary.totalRemainingQty;//Initially set remainder to orders total remainging count;
            _order.prodRatioMatrix.map(el => {
                //var inwardData = _.find(inwardedMatrix, { "id": el.productId });
                var inwardQty = _.sumBy(inwardedMatrix, d => d.id === el.productId ? d.inwardedQty : 0);
                var count = getCount(el.totalQtyRequired, inwardQty);
                _order.orderkeeper.remainder -= count;//Deduct in remainder to isolate that products contribution;
            });
        });
        var sortedMatrixList = _.sortBy(transformedMatrix, ["orderkeeper.remainder"]);
        return sortedMatrixList;
    }

    function _determineSolution(sortedMatrixList, inwardedMatrix) {
        sortedMatrixList.map(_order => {
            //iterate per element of ratio matrix;
            _order.prodRatioMatrix.map(_ratioMatrix => {
                for (let k = 0; k < inwardedMatrix.length; k++) {
                    var inwardData = inwardedMatrix[k];
                    if (inwardData && inwardData.id === _ratioMatrix.productId && inwardData.keeper.remainingQty > 0 && _ratioMatrix.remainingQty > 0) {
                        /**
                            -  Iterate ratio matrix trace;
                            -  THIS ratioMatrix.trace loop should break on its length criteria or when the pointed snapSHot qty becomes zero;
                         */
                        top:
                        for (var i = 0; i < _ratioMatrix.trace.length; i++) {
                            var trace = _ratioMatrix.trace[i];//one trace obj from list of traces;
                            //find product from trace keys;
                            var product = _.find(_order.productSummary, { "subOrderId": trace.sOid, "productHash": trace.hash, "productId": _ratioMatrix.productId });

                            if (!product || product.productkeeper.remainingQty < 0) {
                                continue top;
                            }

                            var count = getCount(product.productkeeper.remainingQty, inwardData.keeper.remainingQty);
                            updateOrderKeepers(count, _order, _ratioMatrix, product, inwardData);
                            updateInventoryKeepers(count, inwardData, product);

                            if (inwardData.keeper.remainingQty <= 0) {
                                break top;
                            }
                        }
                    }
                }
            });//prodRatioMatrix loop ends here;
        });

        sortedMatrixList.map(_order => {
            shortageKeeper(_order, inwardedMatrix);
        });

        return sortedMatrixList;
    }

    function updateOrderKeepers(count, orderMatrix, ratioMatrix, productMatrix, inwardData) {
        //update order level keeper;
        orderMatrix.orderkeeper.totalRemainingQty -= count;
        orderMatrix.orderkeeper.usedQty = orderMatrix.orderkeeper.usedQty ? orderMatrix.orderkeeper.usedQty : 0;
        orderMatrix.orderkeeper.usedQty += count;

        orderMatrix.solution.push({ //Add solution to send to stock ledger;
            partnerASN: inwardData.partnerASN,
            productName: inwardData.productName,
            productSku: inwardData.mapping.sku,
            productId: inwardData.mapping.productId,
            orderId: inwardData.orderId,
            quantity: count,
            mrp: inwardData.mrp,
            sellingPrice: inwardData.sellingPrice,
            barcode: inwardData.barcode,
            ref: {
                skSubOrderId: productMatrix.subOrderId,
                partnerSku: inwardData.mapping.sku,
                partnerProductId: inwardData.mapping.productId,
                skProductId: inwardData.id,
                vendorId: orderMatrix.vendorId,
                poId: productMatrix.poId,
                whId: orderMatrix.whId,
                skOrderId: orderMatrix._id,
                productQty: productMatrix.requestedQty,
                mappedPartnerOrderId: productMatrix.partnerOrderId,
                inwardedQty: inwardData.inwardedQty,
            },
            invoiceNo: inwardData.invoiceNo,
            totalInvoicePrice: inwardData.totalInvoicePrice,
            shippedOn: inwardData.shippedOn,
            vehicleNo: inwardData.vehicleNo,
            courierNo: inwardData.courierNo,
        });
        //update ration matrix instance;
        ratioMatrix.remainingQty -= count;
        ratioMatrix.usedQty += count;
        // update productMatrix instance;
        productMatrix.productkeeper.remainingQty -= count;//This should become to zero;
        productMatrix.productkeeper.usedQty += count;//increase the used count ; this should be equal to the total requiredQty;
    }

    function updateInventoryKeepers(count, inwardData, productMatrix) {
        //Update inventory;
        inwardData.keeper.remainingQty -= count;
        inwardData.keeper.usedQty += count;
    }

    function shortageKeeper(orderMatrix, inwardData) {
        orderMatrix.productSummary.map(productMatrix => {
            if (productMatrix.productkeeper.remainingQty > 0) {
                orderMatrix.shortageList.push({
                    orderQty: productMatrix.productkeeper.requiredQty ? productMatrix.productkeeper.requiredQty : 0,
                    availableQty: productMatrix.productkeeper.usedQty ? productMatrix.productkeeper.usedQty : 0,
                    shortageQty: productMatrix.productkeeper.remainingQty ? productMatrix.productkeeper.remainingQty : 0,
                    damageQty: 0,
                    type: 'SHORTAGE',
                    asnIds: [],
                    whId: productMatrix.whId,
                    poId: productMatrix.poId,
                    vendor: productMatrix.vendorId,
                    skProductId: productMatrix.productId,
                    skOrderId: orderMatrix._id,
                    skSubOrderId: productMatrix.subOrderId,
                    partnerOrderId: productMatrix.partnerOrderId.toString(),
                    partnerProductId: productMatrix.mapping ? productMatrix.mapping.productId : "",
                    partnerSku: productMatrix.mapping ? productMatrix.mapping.sku : "",
                    remarks: "",
                    log: "Shortage while ASN Inward",
                    createdBy: ""
                });
            }

        });
    }
}


asnInwardOrders();




