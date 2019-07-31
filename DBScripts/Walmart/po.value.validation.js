
var _ = require("lodash");

function priceValidation(po, next) {
    if (po.products && po.products.length > 0) {
        var res = po.products.map(getUnitPrice)
            .reduce(getTotalPrice, 0);
        if (res > 0) {
            console.log("Res --------", res, "PO Value:  ", po.poValue, _.sumBy(po.products, 'total'));
            var total = po.products.map(p => p.quantity.requested * p.unitPrice).reduce((acc, curr) => acc + curr, 0);
            console.log("New Total " ,total );
            var priceDiff = parseFloat(po.poValue - res);
            if (priceDiff < -1 || priceDiff > 1) {
                next(new Error("PO values didn't match"));
            } else {
                next();
            }
        } else { next(new Error("Inavalid Total PO Value")); }

    } else if (po._id) {
        next();
    } else {
        next(new Error("Can't create a PO without products field"));
    }

}

var getTotalPrice = (prev, curr) => prev + curr;

var getUnitPrice = function (product) {
    var mrp = product.priceToCompute;
    var unitPrice = mrp * (1 - (product.margins.bMargin / 100));
    unitPrice = (product.margins.sMarginType == "Rs") ?
        unitPrice - product.margins.sMargin : unitPrice * (1 - (product.margins.sMargin / 100));
    var unitPriceDiff = unitPrice - product.unitPrice;
    unitPriceDiff = unitPriceDiff < 0 ? unitPriceDiff * -1 : unitPriceDiff;
    var totalPrice = unitPrice * product.quantity.requested;
    var totalPriceDiff = totalPrice - product.total;
    totalPriceDiff = totalPriceDiff < 0 ? totalPriceDiff * -1 : totalPriceDiff;
    return product.unitPrice * product.quantity.requested;

};

var po = {
    "isConsolidatedPo": true,
    "isSkWarehouse": false,
    "contact": {
        "isOwner": "true",
        "name": "Storeking",
        "email": "aman@storeking.in",
        "mobile": 1234567654,
        "_id": "5cf17839b33ffd71e80f9b46",
        "vendorName": "Walmart Vendor",
        "vendorId": "V1262",
        "address": "Plot 14-F1,, KIADB Industrial Area, Kumbalg​u​ du 2nd phase​,​  Bangalore, , Kumbalgodu, Bangalore Rural Karnataka, undefined",
        "state": "Karnataka"
    },
    "products": [
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR25214",
            "subOrderIds": [
                "OR20190604417970_1"
            ],
            "name": "W Surf Excel Detergent Bar 4U X 200 g each",
            "mrp": 92,
            "availableStock": 0,
            "dealerPrice": 81,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 10
            },
            "unitPrice": 81,
            "total": 810,
            "skuCode": "59083",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 11.96,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4100",
            "brandId": "BR19491",
            "delivery_chalan": false,
            "priceToCompute": 92,
            "totMargin": 11.96,
            "mapping": {
                "productId": "243086",
                "categoryId": "CK00006661",
                "sku": "59083"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR25950",
            "subOrderIds": [
                "OR20190604418077_1",
                "OR20190604418081_1",
                "OR20190604418086_2",
                "OR20190604418088_2",
                "OR20190604418089_1",
                "OR20190604418090_2",
                "OR20190604418093_3",
                "OR20190604418101_2",
                "OR20190604418118_1"
            ],
            "name": "W Parle-G Biscuits , 24 N (70 g Each)",
            "mrp": 120,
            "availableStock": 0,
            "dealerPrice": 106.92,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 50
            },
            "unitPrice": 106.92,
            "total": 5346,
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
            "priceToCompute": 120,
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
            "productId": "PR25946",
            "subOrderIds": [
                "OR20190604418077_2",
                "OR20190604418081_2",
                "OR20190604418086_1",
                "OR20190604418088_3",
                "OR20190604418093_2",
                "OR20190604418101_3",
                "OR20190604418114_1",
                "OR20190604418125_2",
                "OR20190604418139_1",
                "OR20190604418145_1"
            ],
            "name": "W Parle-G Biscuits 140 g",
            "mrp": 10,
            "availableStock": 0,
            "dealerPrice": 8.81,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 600
            },
            "unitPrice": 8.81,
            "total": 5286.000000000001,
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
            "priceToCompute": 10,
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
            "productId": "PR24362",
            "subOrderIds": [
                "OR20190604418087_1"
            ],
            "name": "W Clinic Plus Shampoo Strong & Long, 16N ( 6 ml Each)",
            "mrp": 16,
            "availableStock": 0,
            "dealerPrice": 12.4,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 60
            },
            "unitPrice": 12.4,
            "total": 744,
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
            "priceToCompute": 16,
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
            "productId": "PR24707",
            "subOrderIds": [
                "OR20190604418088_1",
                "OR20190604418090_1",
                "OR20190604418093_1",
                "OR20190604418101_1"
            ],
            "name": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
            "mrp": 60,
            "availableStock": 0,
            "dealerPrice": 52.77,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 48
            },
            "unitPrice": 52.77,
            "total": 2532.96,
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
            "priceToCompute": 60,
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
            "productId": "PR25947",
            "subOrderIds": [
                "OR20190604418090_3",
                "OR20190604418217_1"
            ],
            "name": "W Parle-G Biscuits , 30 N ( 25 g Each)",
            "mrp": 60,
            "availableStock": 0,
            "dealerPrice": 53.47,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 24
            },
            "unitPrice": 53.47,
            "total": 1283.28,
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
            "priceToCompute": 60,
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
            "productId": "PR25024",
            "subOrderIds": [
                "OR20190604418092_2"
            ],
            "name": "W Parle Orange Bite Toffee 100 N ( Rs.0.50 Each)",
            "mrp": 50,
            "availableStock": 0,
            "dealerPrice": 42,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 6
            },
            "unitPrice": 42,
            "total": 252,
            "skuCode": "645011",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 16,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C6101",
            "brandId": "BR15376",
            "delivery_chalan": false,
            "priceToCompute": 50,
            "totMargin": 16,
            "mapping": {
                "productId": "276238",
                "categoryId": "CK00002520",
                "sku": "645011"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR24995",
            "subOrderIds": [
                "OR20190604418092_3"
            ],
            "name": "W Parle Mango Bite Candy 50 N ( Rs. 0.50 Each)",
            "mrp": 50,
            "availableStock": 0,
            "dealerPrice": 40,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 6
            },
            "unitPrice": 40,
            "total": 240,
            "skuCode": "430258",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 20,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C6101",
            "brandId": "BR15376",
            "delivery_chalan": false,
            "priceToCompute": 50,
            "totMargin": 20,
            "mapping": {
                "productId": "212862",
                "categoryId": "CK00002520",
                "sku": "430258"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR23892",
            "subOrderIds": [
                "OR20190604418149_1",
                "OR20190605418380_1",
                "OR20190605418391_2",
                "OR20190605418398_1",
                "OR20190605418430_1",
                "OR20190605418478_2",
                "OR20190605418491_2",
                "OR20190605418515_2",
                "OR20190605418559_1"
            ],
            "name": "W Lifebuoy Soap Total, 56 g",
            "mrp": 10,
            "availableStock": 0,
            "dealerPrice": 8.98,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 1296
            },
            "unitPrice": 8.98,
            "total": 11419.2,
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
            "priceToCompute": 10,
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
            "productId": "PR25205",
            "subOrderIds": [
                "OR20190604418224_1"
            ],
            "name": "W Surf Excel Detergent Bar 250 g",
            "mrp": 25,
            "availableStock": 0,
            "dealerPrice": 24.4,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 60
            },
            "unitPrice": 24.4,
            "total": 1464,
            "skuCode": "458776",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 2.4,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4100",
            "brandId": "BR19491",
            "delivery_chalan": false,
            "priceToCompute": 25,
            "totMargin": 2.4,
            "mapping": {
                "productId": "211012",
                "categoryId": "CK00006661",
                "sku": "458776"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR30185",
            "subOrderIds": [
                "OR20190605418276_1"
            ],
            "name": "W Lizol & Harpic Toilet & Floor Cleaner Combi Pack, 500 ml & 500 ml",
            "mrp": 149,
            "availableStock": 0,
            "dealerPrice": 122.38,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 6
            },
            "unitPrice": 122.38,
            "total": 734.28,
            "skuCode": "980011540",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 17.87,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4145",
            "brandId": "BR19741",
            "delivery_chalan": false,
            "priceToCompute": 149,
            "totMargin": 17.87,
            "mapping": {
                "productId": "395360",
                "categoryId": "CK00006667",
                "sku": "980011540"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR26197",
            "subOrderIds": [
                "OR20190605418351_1",
                "OR20190605418352_1",
                "OR20190605418355_1",
                "OR20190605418356_1",
                "OR20190605418357_1",
                "OR20190605418359_1",
                "OR20190605418360_2",
                "OR20190605418369_1"
            ],
            "name": "W Parle Monaco Salt Biscuits Salted, 75.4 g",
            "mrp": 10,
            "availableStock": 0,
            "dealerPrice": 8.45,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 480
            },
            "unitPrice": 8.45,
            "total": 4056,
            "skuCode": "55975",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 15.5,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C5224",
            "brandId": "BR15376",
            "delivery_chalan": false,
            "priceToCompute": 10,
            "totMargin": 15.5,
            "mapping": {
                "productId": "212929",
                "categoryId": "CK00002546",
                "sku": "55975"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR23711",
            "subOrderIds": [
                "OR20190605418352_2",
                "OR20190605418355_2",
                "OR20190605418356_2",
                "OR20190605418357_2",
                "OR20190605418359_2",
                "OR20190605418360_1",
                "OR20190605418369_2",
                "OR20190605418380_2",
                "OR20190605418391_1",
                "OR20190605418398_2"
            ],
            "name": "W Surf Excel Detergent Powder Easy Wash , 1 kg",
            "mrp": 116,
            "availableStock": 0,
            "dealerPrice": 103.44,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 120
            },
            "unitPrice": 103.44,
            "total": 12412.800000000001,
            "skuCode": "677988",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 10.83,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4118",
            "brandId": "BR19491",
            "delivery_chalan": false,
            "priceToCompute": 116,
            "totMargin": 10.83,
            "mapping": {
                "productId": "300918",
                "categoryId": "CK00006659",
                "sku": "677988"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR23878",
            "subOrderIds": [
                "OR20190605418401_1"
            ],
            "name": "W Pears Soap Pure & Gentle, 75 g",
            "mrp": 41,
            "availableStock": 0,
            "dealerPrice": 36.64,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 24
            },
            "unitPrice": 36.64,
            "total": 879.36,
            "skuCode": "462360",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 10.63,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4788",
            "brandId": "BR10848",
            "delivery_chalan": false,
            "priceToCompute": 41,
            "totMargin": 10.63,
            "mapping": {
                "productId": "216994",
                "categoryId": "CK00005911",
                "sku": "462360"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR23889",
            "subOrderIds": [
                "OR20190605418430_2",
                "OR20190605418478_1",
                "OR20190605418491_1",
                "OR20190605418515_1",
                "OR20190605418559_2"
            ],
            "name": "W Dettol Original Soap 45 g",
            "mrp": 10,
            "availableStock": 0,
            "dealerPrice": 9.22,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 150
            },
            "unitPrice": 9.22,
            "total": 1383,
            "skuCode": "568473",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 7.8,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4788",
            "brandId": "BR12172",
            "delivery_chalan": false,
            "priceToCompute": 10,
            "totMargin": 7.8,
            "mapping": {
                "productId": "244498",
                "categoryId": "CK00005911",
                "sku": "568473"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR27408",
            "subOrderIds": [
                "OR20190605418557_1"
            ],
            "name": "W Axe Ticket Deo Champion, 17 ml",
            "mrp": 65,
            "availableStock": 0,
            "dealerPrice": 47.33,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 24
            },
            "unitPrice": 47.33,
            "total": 1135.92,
            "skuCode": "980013322",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 27.18,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4186",
            "brandId": "BR17877",
            "delivery_chalan": false,
            "priceToCompute": 65,
            "totMargin": 27.18,
            "mapping": {
                "productId": "412422",
                "categoryId": "CK00003281",
                "sku": "980013322"
            }
        },
        {
            "whId": "WMF5",
            "locationId": "262",
            "productId": "PR27412",
            "subOrderIds": [
                "OR20190605418557_2"
            ],
            "name": "W Axe Deodorant Dark Temptation, 150 ml",
            "mrp": 200,
            "availableStock": 0,
            "dealerPrice": 152.33,
            "openPoQty": 0,
            "quantity": {
                "suggested": 0,
                "requested": 9
            },
            "unitPrice": 152.33,
            "total": 1370.97,
            "skuCode": "76485",
            "dealCount": 1,
            "pendingOrderProductQty": 0,
            "marginDealerPrice": false,
            "margins": {
                "bMargin": 23.83,
                "sMargin": 0,
                "sMarginType": "%"
            },
            "orderQty": 0,
            "order30": 0,
            "categoryId": "C4186",
            "brandId": "BR17877",
            "delivery_chalan": false,
            "priceToCompute": 200,
            "totMargin": 23.83,
            "mapping": {
                "productId": "217034",
                "categoryId": "CK00003281",
                "sku": "76485"
            }
        }
    ],
    "expectedAt": "1560096877024",
    "remarks": "Auto Po Creation - System",
    "whId": "WMF5",
    "poValue": 51349.77,
    "partnerOrderIds": [
        "3218483"
    ],
    "status": "Draft",
    "createdAt": "2019-06-06T16:14:37.025Z"
}

priceValidation(po, function (err, result) {
    if (err) {
        console.log("Error ", err);
    }
})