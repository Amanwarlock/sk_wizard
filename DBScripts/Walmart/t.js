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

let url = `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`;

var options = { "useNewUrlParser": true };

Mongoose.connect(url, options);

var db = Mongoose.connection;

db.on('error', function () {
    callback(new Error(`Connection error ........`));
});

db.once('open', function () {


    var queue = async.queue(function(data , queueCB){


        var q = async.queue(function(p,cb){


            var sQ = async.queue(function(s,sCB){

                let orderId = s.split("_")[0];
                var splitOrdData = _.find(splitDataList, { orderId: orderId });
        
                splitOrdData = splitOrdData ? splitOrdData : { subOrderList: [] };
        
                let splitData = _.find(splitOrdData.subOrderList, { subOrderId: s });


                if (splitData) {
                    db.collection('omsmasters').findOneAndUpdate({ "subOrders.parentSubOrderId": s }, { $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } }, { new: true }, function (err, doc) {
                        if (err) console.error("Update error ------------", err);
                        else if(doc){
                            sCB();
                        }
                    });
                } else {
                    db.collection('omsmasters').findOneAndUpdate({ "subOrders._id": s }, { $set: { "subOrders.$.isPoCreated": true, "subOrders.$.isManualPo": true, "subOrders.$.poId": data.poId, "subOrders.$.isPartnerOrderIdUpdated": false, vendorId: data.vendor } }, { new: true }, function (err, doc) {
                        if (err) console.error("Update error ------------", err);
                        else if(doc){
                            sCB();
                        }
                    })
                }


            });


            sQ.push(p.subOrderIds);

            sQ.drain = function(){
                cb();
            }

        });

        q.push(data.products);

        q.drain = function(){
            queueCB(null);
        }

    });


    queue.push(manualPoData);

    queue.drain = function(){
        console.log("------------------------------DONE-------------------------------");
    }


});


var manualPoData = [
    {
        "whId": "WMF5",
        "products": [
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25948",
                "subOrderIds": [
                    "OR20190603416077_2",
                    "OR20190604416590_2"
                ],
                "name": "W Parle-G Biscuits 250 g",
                "mrp": 20,
                "availableStock": 0,
                "dealerPrice": 18,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 29
                },
                "unitPrice": 18,
                "total": 522,
                "skuCode": "55919",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 10,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 18,
                "totMargin": 10,
                "mapping": {
                    "productId": "212933",
                    "categoryId": "CK00002549",
                    "sku": "55919"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24707",
                "subOrderIds": [
                    "OR20190603416105_2",
                    "OR20190604416546_1",
                    "OR20190604416552_1",
                    "OR20190604416557_1",
                    "OR20190604416561_1",
                    "OR20190604416565_2",
                    "OR20190604416569_1",
                    "OR20190604416573_1",
                    "OR20190604416688_11"
                ],
                "name": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                "mrp": 60,
                "availableStock": 0,
                "dealerPrice": 52.77,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 91
                },
                "unitPrice": 52.77,
                "total": 4802.07,
                "skuCode": "455353",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 12.05,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 52.77,
                "totMargin": 12.05,
                "mapping": {
                    "productId": "365436",
                    "categoryId": "CK00002545",
                    "sku": "455353"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25950",
                "subOrderIds": [
                    "OR20190603416107_1",
                    "OR20190604416546_2",
                    "OR20190604416552_2",
                    "OR20190604416556_3",
                    "OR20190604416557_2",
                    "OR20190604416561_2",
                    "OR20190604416565_1",
                    "OR20190604416569_2",
                    "OR20190604416573_2",
                    "OR20190604416607_1"
                ],
                "name": "W Parle-G Biscuits , 24 N (70 g Each)",
                "mrp": 120,
                "availableStock": 0,
                "dealerPrice": 106.92,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 55
                },
                "unitPrice": 106.92,
                "total": 5880.6,
                "skuCode": "405996",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 10.9,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 106.92,
                "totMargin": 10.9,
                "mapping": {
                    "productId": "212935",
                    "categoryId": "CK00002549",
                    "sku": "405996"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24153",
                "subOrderIds": [
                    "OR20190603416178_1"
                ],
                "name": "W Colgate Dental Cream Toothpaste 12N (19 g Each)",
                "mrp": 120,
                "availableStock": 0,
                "dealerPrice": 102.54,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 1
                },
                "unitPrice": 102.54,
                "total": 102.54,
                "skuCode": "282250",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 14.55,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4779",
                "brandId": "BR11931",
                "delivery_chalan": false,
                "priceToCompute": 102.54,
                "totMargin": 14.55,
                "mapping": {
                    "productId": "215061",
                    "categoryId": "CK00002633",
                    "sku": "282250"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24533",
                "subOrderIds": [
                    "OR20190603416189_1"
                ],
                "name": "W Pond's Talcum Powder Dream Flower Fragrant, 100 g",
                "mrp": 80,
                "availableStock": 0,
                "dealerPrice": 72.72,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 2
                },
                "unitPrice": 72.72,
                "total": 145.44,
                "skuCode": "105640",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 9.1,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5191",
                "brandId": "BR11537",
                "delivery_chalan": false,
                "priceToCompute": 72.72,
                "totMargin": 9.1,
                "mapping": {
                    "productId": "364584",
                    "categoryId": "CK00006621",
                    "sku": "105640"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25826",
                "subOrderIds": [
                    "OR20190604416247_1",
                    "OR20190604416572_2"
                ],
                "name": "W Happydent Gum Wave Strawberry Jar, 176 N",
                "mrp": 176,
                "availableStock": 0,
                "dealerPrice": 154,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 8
                },
                "unitPrice": 154,
                "total": 1232,
                "skuCode": "687249",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 12.5,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C6104",
                "brandId": "BR19914",
                "delivery_chalan": false,
                "priceToCompute": 154,
                "totMargin": 12.5,
                "mapping": {
                    "productId": "302880",
                    "categoryId": "CK00002524",
                    "sku": "687249"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR26277",
                "subOrderIds": [
                    "OR20190604416540_1"
                ],
                "name": "W Britannia Krunch Biscuits Chocolate, Pack Of 12 X 40 g",
                "mrp": 60,
                "availableStock": 0,
                "dealerPrice": 53.01,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 7
                },
                "unitPrice": 53.01,
                "total": 371.07,
                "skuCode": "274662",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 11.65,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR17375",
                "delivery_chalan": false,
                "priceToCompute": 53.01,
                "totMargin": 11.65,
                "mapping": {
                    "productId": "212499",
                    "categoryId": "CK00002547",
                    "sku": "274662"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24706",
                "subOrderIds": [
                    "OR20190604416540_2"
                ],
                "name": "W Britannia Good Day Biscuits\tButter, 12 N (Rs. 5 Each)",
                "mrp": 60,
                "availableStock": 0,
                "dealerPrice": 53.19,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 2
                },
                "unitPrice": 53.19,
                "total": 106.38,
                "skuCode": "203836",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 11.35,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR17375",
                "delivery_chalan": false,
                "priceToCompute": 53.19,
                "totMargin": 11.35,
                "mapping": {
                    "productId": "365412",
                    "categoryId": "CK00002545",
                    "sku": "203836"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25946",
                "subOrderIds": [
                    "OR20190604416544_1",
                    "OR20190604416547_1",
                    "OR20190604416548_1",
                    "OR20190604416550_1",
                    "OR20190604416564_1",
                    "OR20190604416568_1",
                    "OR20190604416571_1",
                    "OR20190604416592_1",
                    "OR20190604416597_1",
                    "OR20190604416622_1",
                    "OR20190604416688_10"
                ],
                "name": "W Parle-G Biscuits 140 g",
                "mrp": 10,
                "availableStock": 0,
                "dealerPrice": 8.81,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 608
                },
                "unitPrice": 8.81,
                "total": 5356.4800000000005,
                "skuCode": "55926",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 11.9,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 8.81,
                "totMargin": 11.9,
                "mapping": {
                    "productId": "212931",
                    "categoryId": "CK00002549",
                    "sku": "55926"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25947",
                "subOrderIds": [
                    "OR20190604416546_3",
                    "OR20190604416552_3",
                    "OR20190604416557_3",
                    "OR20190604416561_3",
                    "OR20190604416565_3",
                    "OR20190604416607_2"
                ],
                "name": "W Parle-G Biscuits , 30 N ( 25 g Each)",
                "mrp": 60,
                "availableStock": 0,
                "dealerPrice": 53.47,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 62
                },
                "unitPrice": 53.47,
                "total": 3315.1399999999994,
                "skuCode": "406017",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 10.88,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 53.47,
                "totMargin": 10.88,
                "mapping": {
                    "productId": "212932",
                    "categoryId": "CK00002549",
                    "sku": "406017"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR25809",
                "subOrderIds": [
                    "OR20190604416549_1",
                    "OR20190604416614_1",
                    "OR20190604416620_1"
                ],
                "name": "W Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                "mrp": 186,
                "availableStock": 0,
                "dealerPrice": 165.33,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 15
                },
                "unitPrice": 165.33,
                "total": 2479.95,
                "skuCode": "100950",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 11.11,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C6104",
                "brandId": "BR19876",
                "delivery_chalan": false,
                "priceToCompute": 165.33,
                "totMargin": 11.11,
                "mapping": {
                    "productId": "212558",
                    "categoryId": "CK00002524",
                    "sku": "100950"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR23820",
                "subOrderIds": [
                    "OR20190604416553_1",
                    "OR20190604416559_1",
                    "OR20190604416587_1",
                    "OR20190604416598_1",
                    "OR20190604416604_1",
                    "OR20190604416618_1",
                    "OR20190604416627_1",
                    "OR20190604416648_1",
                    "OR20190604416678_1"
                ],
                "name": "W Ghari Detergent Powder 500 g",
                "mrp": 28,
                "availableStock": 0,
                "dealerPrice": 24.9,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 316
                },
                "unitPrice": 24.9,
                "total": 7868.4000000000015,
                "skuCode": "266829",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 11.07,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4118",
                "brandId": "BR19921",
                "delivery_chalan": false,
                "priceToCompute": 24.9,
                "totMargin": 11.07,
                "mapping": {
                    "productId": "214934",
                    "categoryId": "CK00006659",
                    "sku": "266829"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24860",
                "subOrderIds": [
                    "OR20190604416556_4"
                ],
                "name": "W Parachute Hair Oil Coconut, 24N (25 ml Each)",
                "mrp": 240,
                "availableStock": 0,
                "dealerPrice": 210,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 6
                },
                "unitPrice": 210,
                "total": 1260,
                "skuCode": "980004459",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 12.5,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4590",
                "brandId": "BR10036",
                "delivery_chalan": false,
                "priceToCompute": 210,
                "totMargin": 12.5,
                "mapping": {
                    "productId": "319788",
                    "categoryId": "CK00002624",
                    "sku": "980004459"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR23854",
                "subOrderIds": [
                    "OR20190604416556_8",
                    "OR20190604416558_1",
                    "OR20190604416688_6"
                ],
                "name": "W Dove Soap Moisturizing Cream, 50 g",
                "mrp": 25,
                "availableStock": 0,
                "dealerPrice": 22.8,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 97
                },
                "unitPrice": 22.8,
                "total": 2211.6,
                "skuCode": "101384",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 8.8,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4788",
                "brandId": "BR13094",
                "delivery_chalan": false,
                "priceToCompute": 22.8,
                "totMargin": 8.8,
                "mapping": {
                    "productId": "216896",
                    "categoryId": "CK00005911",
                    "sku": "101384"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR23857",
                "subOrderIds": [
                    "OR20190604416556_9",
                    "OR20190604416572_7"
                ],
                "name": "W Godrej No.1 Soap Lime & Aloe Vera, 4N (63 g Each)",
                "mrp": 40,
                "availableStock": 0,
                "dealerPrice": 35.64,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 23
                },
                "unitPrice": 35.64,
                "total": 819.7199999999999,
                "skuCode": "109539",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 10.9,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4788",
                "brandId": "BR10189",
                "delivery_chalan": false,
                "priceToCompute": 35.64,
                "totMargin": 10.9,
                "mapping": {
                    "productId": "216904",
                    "categoryId": "CK00005911",
                    "sku": "109539"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR23892",
                "subOrderIds": [
                    "OR20190604416570_1",
                    "OR20190604416577_3"
                ],
                "name": "W Lifebuoy Soap Total, 56 g",
                "mrp": 10,
                "availableStock": 0,
                "dealerPrice": 8.98,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 78
                },
                "unitPrice": 8.98,
                "total": 700.44,
                "skuCode": "462283",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 10.2,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4788",
                "brandId": "BR13037",
                "delivery_chalan": false,
                "priceToCompute": 8.98,
                "totMargin": 10.2,
                "mapping": {
                    "productId": "248340",
                    "categoryId": "CK00005911",
                    "sku": "462283"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24312",
                "subOrderIds": [
                    "OR20190604416572_4",
                    "OR20190604416577_1"
                ],
                "name": "W Clinic Plus Shampoo Strong & Long, 80 ml",
                "mrp": 45,
                "availableStock": 0,
                "dealerPrice": 37.71,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 6
                },
                "unitPrice": 37.71,
                "total": 226.26,
                "skuCode": "461422",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 16.2,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4585",
                "brandId": "BR17869",
                "delivery_chalan": false,
                "priceToCompute": 37.71,
                "totMargin": 16.2,
                "mapping": {
                    "productId": "216774",
                    "categoryId": "CK00002961",
                    "sku": "461422"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR23819",
                "subOrderIds": [
                    "OR20190604416575_1",
                    "OR20190604416588_1",
                    "OR20190604416594_1"
                ],
                "name": "W Ghari Detergent Powder 1 kg",
                "mrp": 55,
                "availableStock": 0,
                "dealerPrice": 49.95,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 60
                },
                "unitPrice": 49.95,
                "total": 2997,
                "skuCode": "266822",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 9.18,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4118",
                "brandId": "BR19921",
                "delivery_chalan": false,
                "priceToCompute": 49.95,
                "totMargin": 9.18,
                "mapping": {
                    "productId": "214933",
                    "categoryId": "CK00006659",
                    "sku": "266822"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR24362",
                "subOrderIds": [
                    "OR20190604416577_2"
                ],
                "name": "W Clinic Plus Shampoo Strong & Long, 16N ( 6 ml Each)",
                "mrp": 16,
                "availableStock": 0,
                "dealerPrice": 12.4,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 2
                },
                "unitPrice": 12.4,
                "total": 24.8,
                "skuCode": "709621",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 22.5,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4585",
                "brandId": "BR17869",
                "delivery_chalan": false,
                "priceToCompute": 12.4,
                "totMargin": 22.5,
                "mapping": {
                    "productId": "306394",
                    "categoryId": "CK00002961",
                    "sku": "709621"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR26824",
                "subOrderIds": [
                    "OR20190604416577_6",
                    "OR20190604416688_1"
                ],
                "name": "W Vim Dishwash Bar 125 g",
                "mrp": 10,
                "availableStock": 0,
                "dealerPrice": 8.56,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 23
                },
                "unitPrice": 8.56,
                "total": 196.88,
                "skuCode": "461359",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 14.4,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C4113",
                "brandId": "BR14976",
                "delivery_chalan": false,
                "priceToCompute": 8.56,
                "totMargin": 14.4,
                "mapping": {
                    "productId": "252950",
                    "categoryId": "CK00002809",
                    "sku": "461359"
                }
            },
            {
                "whId": "WMF5",
                "locationId": "262",
                "productId": "PR26198",
                "subOrderIds": [
                    "OR20190604416590_1"
                ],
                "name": "W Parle Monaco Salt Biscuits Salted, 200 g",
                "mrp": 30,
                "availableStock": 0,
                "dealerPrice": 25.31,
                "openPoQty": 0,
                "quantity": {
                    "suggested": 0,
                    "requested": 7
                },
                "unitPrice": 25.31,
                "total": 177.17,
                "skuCode": "55954",
                "dealCount": 1,
                "pendingOrderProductQty": 0,
                "marginDealerPrice": false,
                "margins": {
                    "bMargin": 15.63,
                    "sMargin": 0,
                    "sMarginType": "%"
                },
                "orderQty": 0,
                "order30": 0,
                "categoryId": "C5224",
                "brandId": "BR15376",
                "delivery_chalan": false,
                "priceToCompute": 25.31,
                "totMargin": 15.63,
                "mapping": {
                    "productId": "212930",
                    "categoryId": "CK00002546",
                    "sku": "55954"
                }
            }
        ]
    }
];


var splitDataList = [
    {
      "orderId": "OR20190603416077",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR25948",
          "subOrderId": "OR20190603416077_2",
          "splitQty": 25,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190603416105",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24707",
          "subOrderId": "OR20190603416105_2",
          "splitQty": 11,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190603416107",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR25950",
          "subOrderId": "OR20190603416107_1",
          "splitQty": 5,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190603416178",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24153",
          "subOrderId": "OR20190603416178_1",
          "splitQty": 2,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190603416189",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24533",
          "subOrderId": "OR20190603416189_1",
          "splitQty": 49,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416247",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR25826",
          "subOrderId": "OR20190604416247_1",
          "splitQty": 7,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416540",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24706",
          "subOrderId": "OR20190604416540_2",
          "splitQty": 1,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416544",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR25946",
          "subOrderId": "OR20190604416544_1",
          "splitQty": 52,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416546",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR25947",
          "subOrderId": "OR20190604416546_3",
          "splitQty": 10,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416553",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR23820",
          "subOrderId": "OR20190604416553_1",
          "splitQty": 35,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416556",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24860",
          "subOrderId": "OR20190604416556_4",
          "splitQty": 6,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        },
        {
          "productId": "PR23854",
          "subOrderId": "OR20190604416556_8",
          "splitQty": 17,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        },
        {
          "productId": "PR23857",
          "subOrderId": "OR20190604416556_9",
          "splitQty": 1,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416570",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR23892",
          "subOrderId": "OR20190604416570_1",
          "splitQty": 90,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416575",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR23819",
          "subOrderId": "OR20190604416575_1",
          "splitQty": 9,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416577",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR24362",
          "subOrderId": "OR20190604416577_2",
          "splitQty": 18,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        },
        {
          "productId": "PR26824",
          "subOrderId": "OR20190604416577_6",
          "splitQty": 1,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    },
    {
      "orderId": "OR20190604416590",
      "whId": "WMF5",
      "subOrderList": [
        {
          "productId": "PR26198",
          "subOrderId": "OR20190604416590_1",
          "splitQty": 35,
          "whId": "WMF5",
          "setters": {
            "partnerOrderId": null,
            "partnerSubOrderId": null,
            "poId": null,
            "shortShipmentRefId": null,
            "isPartnerOrderIdUpdated": false
          },
          "remarks": "Consolidated Order Placement Flow Split"
        }
      ]
    }
  ];


