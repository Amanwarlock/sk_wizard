
var _ = require("lodash");
var async = require("async");

var params = {
    "whIds": [
        "WMF9",
        "WMF5",
        "WMF7"
    ],
    "fcList": [{
        whId: "WMF9",
        "partner": {"vendor": 123}
    },{
        whId: "WMF5",
        "partner": {"vendor": 123}
    },{
        whId: "WMF7",
        "partner": {"vendor": 123}
    }],
    vendorList: [{_id: 123 , contact: []}],
    "currentOrder": null,
    "pendingOrders": [
        {
            "_id": "WMF9",
            "locationId": "313",
            "orderList": [
                {
                    "_id": "OR20190626452050",
                    "logistics": 2.85,
                    "isSkWarehouse": false,
                    "orderAmount": 526.41,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-26T15:52:38.816Z",
                    "source": "WMF9",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190626452050_1",
                            "quantity": 12,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR30720",
                                    "name": "W Close Up Toothpaste Red, 80 g",
                                    "quantity": 12,
                                    "skuCode": "13412",
                                    "mapping": {
                                        "sku": "10925",
                                        "productId": "396568",
                                        "categoryId": "CK00002633"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10925",
                                        "productId": "396568",
                                        "categoryId": "CK00002633"
                                    },
                                    "mrp": 48,
                                    "transferPrice": 40.99,
                                    "category": "C4779",
                                    "brand": "BR17111",
                                    "keeper": {
                                        "requiredQty": 12,
                                        "availableQty": 12,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190626452050_1",
                                    "orderId": "OR20190626452050",
                                    "whId": "WMF9",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF9",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                }
            ],
            "totalOrders": 1,
            "skOrderAmount": 526.41,
            "partnerOrderAmount": 491.88,
            "orderPlacementData": [
                {
                    "productId": "PR30720",
                    "productName": "W Close Up Toothpaste Red, 80 g",
                    "quantity": 12,
                    "subOrderIds": [
                        "OR20190626452050_1"
                    ],
                    "mapping": {
                        "sku": "10925",
                        "productId": "396568",
                        "categoryId": "CK00002633"
                    }
                }
            ]
        },
        {
            "_id": "WMF5",
            "locationId": "262",
            "orderList": [
                {
                    "_id": "OR20190628455861",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 1060.72,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-28T11:02:42.029Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455861_1",
                            "quantity": 24,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23861",
                                    "name": "W Lifebuoy Soap Total, 3N (100 g Each)",
                                    "quantity": 24,
                                    "skuCode": "203045",
                                    "mapping": {
                                        "productId": "216912",
                                        "categoryId": "CK00005911",
                                        "sku": "203045"
                                    },
                                    "mrp": 52,
                                    "transferPrice": 46.56,
                                    "category": "C4788",
                                    "brand": "BR13037",
                                    "keeper": {
                                        "requiredQty": 24,
                                        "availableQty": 24,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455861_1",
                                    "orderId": "OR20190628455861",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455861_2",
                            "quantity": 12,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23942",
                                    "name": "W Dettol Soap Pack Of 4 X 45 g",
                                    "quantity": 12,
                                    "skuCode": "675636",
                                    "mapping": {
                                        "productId": "300594",
                                        "categoryId": "CK00005911",
                                        "sku": "675636"
                                    },
                                    "mrp": 40,
                                    "transferPrice": 35.82,
                                    "category": "C4788",
                                    "brand": "BR12172",
                                    "keeper": {
                                        "requiredQty": 12,
                                        "availableQty": 12,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455861_2",
                                    "orderId": "OR20190628455861",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190628455862",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 1441,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-28T11:03:28.807Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455862_1",
                            "quantity": 12,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24707",
                                    "name": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                                    "quantity": 12,
                                    "skuCode": "455353",
                                    "mapping": {
                                        "productId": "365436",
                                        "categoryId": "CK00002545",
                                        "sku": "455353"
                                    },
                                    "mrp": 60,
                                    "transferPrice": 52.77,
                                    "category": "C5224",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 12,
                                        "availableQty": 12,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455862_1",
                                    "orderId": "OR20190628455862",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455862_2",
                            "quantity": 9,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24997",
                                    "name": "W Parle Melody Toffee 100 N (Rs. 1 Each)",
                                    "quantity": 9,
                                    "skuCode": "56213",
                                    "mapping": {
                                        "productId": "212927",
                                        "categoryId": "CK00002520",
                                        "sku": "56213"
                                    },
                                    "mrp": 100,
                                    "transferPrice": 81.6,
                                    "category": "C6101",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 9,
                                        "availableQty": 9,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455862_2",
                                    "orderId": "OR20190628455862",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190628455953",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 1315,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-28T11:36:19.377Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455953_1",
                            "quantity": 24,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25024",
                                    "name": "W Parle Orange Bite Toffee 100 N ( Rs.0.50 Each)",
                                    "quantity": 24,
                                    "skuCode": "645011",
                                    "mapping": {
                                        "productId": "276238",
                                        "categoryId": "CK00002520",
                                        "sku": "645011"
                                    },
                                    "mrp": 50,
                                    "transferPrice": 42,
                                    "category": "C6101",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 24,
                                        "availableQty": 24,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455953_1",
                                    "orderId": "OR20190628455953",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455953_2",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24995",
                                    "name": "W Parle Mango Bite Candy 50 N ( Rs. 0.50 Each)",
                                    "quantity": 6,
                                    "skuCode": "430258",
                                    "mapping": {
                                        "productId": "212862",
                                        "categoryId": "CK00002520",
                                        "sku": "430258"
                                    },
                                    "mrp": 50,
                                    "transferPrice": 41.75,
                                    "category": "C6101",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 6,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455953_2",
                                    "orderId": "OR20190628455953",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190628455984",
                    "logistics": 0.14,
                    "isSkWarehouse": false,
                    "orderAmount": 53.18,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "pickSAPSKU": false,
                    "createdAt": "2019-06-28T11:44:59.649Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455984_1",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23680",
                                    "name": "W Surf Excel Detergent Powder Quick Wash, 60 g",
                                    "quantity": 6,
                                    "skuCode": "555390",
                                    "mapping": {
                                        "productId": "222330",
                                        "categoryId": "CK00006659",
                                        "sku": "555390"
                                    },
                                    "mrp": 10,
                                    "transferPrice": 8.3,
                                    "category": "C4118",
                                    "brand": "BR19491",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 6,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455984_1",
                                    "orderId": "OR20190628455984",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190628455992",
                    "logistics": 10.08,
                    "isSkWarehouse": false,
                    "orderAmount": 3305.64,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "pickSAPSKU": false,
                    "createdAt": "2019-06-28T11:51:02.539Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455992_1",
                            "quantity": 12,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24707",
                                    "name": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                                    "quantity": 12,
                                    "skuCode": "455353",
                                    "mapping": {
                                        "productId": "365436",
                                        "categoryId": "CK00002545",
                                        "sku": "455353"
                                    },
                                    "mrp": 60,
                                    "transferPrice": 52.77,
                                    "category": "C5224",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 12,
                                        "availableQty": 12,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455992_1",
                                    "orderId": "OR20190628455992",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455992_2",
                            "quantity": 20,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24996",
                                    "name": "W Parle Kaccha Mango Bite Candy 100 N (Rs. 0.50 Each)",
                                    "quantity": 20,
                                    "skuCode": "56136",
                                    "mapping": {
                                        "productId": "212924",
                                        "categoryId": "CK00002520",
                                        "sku": "56136"
                                    },
                                    "mrp": 50,
                                    "transferPrice": 41.75,
                                    "category": "C6101",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 20,
                                        "availableQty": 20,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455992_2",
                                    "orderId": "OR20190628455992",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455992_3",
                            "quantity": 3,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24997",
                                    "name": "W Parle Melody Toffee 100 N (Rs. 1 Each)",
                                    "quantity": 3,
                                    "skuCode": "56213",
                                    "mapping": {
                                        "productId": "212927",
                                        "categoryId": "CK00002520",
                                        "sku": "56213"
                                    },
                                    "mrp": 100,
                                    "transferPrice": 81.6,
                                    "category": "C6101",
                                    "brand": "BR15376",
                                    "keeper": {
                                        "requiredQty": 3,
                                        "availableQty": 3,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455992_3",
                                    "orderId": "OR20190628455992",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        },
                        {
                            "_id": "OR20190628455992_4",
                            "quantity": 24,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23624",
                                    "name": "W Rin Detergent Powder Refresh,1 Kg",
                                    "quantity": 24,
                                    "skuCode": "58964",
                                    "mapping": {
                                        "productId": "210974",
                                        "categoryId": "CK00006659",
                                        "sku": "58964"
                                    },
                                    "mrp": 79,
                                    "transferPrice": 73.15,
                                    "category": "C4118",
                                    "brand": "BR15841",
                                    "keeper": {
                                        "requiredQty": 24,
                                        "availableQty": 24,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455992_4",
                                    "orderId": "OR20190628455992",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190628455997",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 4065.04,
                    "partnerWhId": "262",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "pickSAPSKU": false,
                    "createdAt": "2019-06-28T11:55:05.002Z",
                    "source": "WMF5",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190628455997_1",
                            "quantity": 48,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR28647",
                                    "name": "W Nescafe Sunrise Coffee 48N (2 g Each)",
                                    "quantity": 48,
                                    "skuCode": "980001545",
                                    "mapping": {
                                        "productId": "313538",
                                        "categoryId": "CK00002514",
                                        "sku": "980001545"
                                    },
                                    "mrp": 96,
                                    "transferPrice": 87.28,
                                    "category": "C6209",
                                    "brand": "BR13205",
                                    "keeper": {
                                        "requiredQty": 48,
                                        "availableQty": 48,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190628455997_1",
                                    "orderId": "OR20190628455997",
                                    "whId": "WMF5",
                                    "locationId": "262",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF5",
                            "locationId": "262"
                        }
                    ],
                    "hasStock": true
                }
            ],
            "totalOrders": 6,
            "skOrderAmount": 11240.58,
            "partnerOrderAmount": 11881.300000000001,
            "orderPlacementData": [
                {
                    "productId": "PR23861",
                    "productName": "W Lifebuoy Soap Total, 3N (100 g Each)",
                    "quantity": 24,
                    "subOrderIds": [
                        "OR20190628455861_1"
                    ],
                    "mapping": {
                        "productId": "216912",
                        "categoryId": "CK00005911",
                        "sku": "203045"
                    }
                },
                {
                    "productId": "PR23942",
                    "productName": "W Dettol Soap Pack Of 4 X 45 g",
                    "quantity": 12,
                    "subOrderIds": [
                        "OR20190628455861_2"
                    ],
                    "mapping": {
                        "productId": "300594",
                        "categoryId": "CK00005911",
                        "sku": "675636"
                    }
                },
                {
                    "productId": "PR24707",
                    "productName": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                    "quantity": 24,
                    "subOrderIds": [
                        "OR20190628455862_1",
                        "OR20190628455992_1"
                    ],
                    "mapping": {
                        "productId": "365436",
                        "categoryId": "CK00002545",
                        "sku": "455353"
                    }
                },
                {
                    "productId": "PR24997",
                    "productName": "W Parle Melody Toffee 100 N (Rs. 1 Each)",
                    "quantity": 12,
                    "subOrderIds": [
                        "OR20190628455862_2",
                        "OR20190628455992_3"
                    ],
                    "mapping": {
                        "productId": "212927",
                        "categoryId": "CK00002520",
                        "sku": "56213"
                    }
                },
                {
                    "productId": "PR25024",
                    "productName": "W Parle Orange Bite Toffee 100 N ( Rs.0.50 Each)",
                    "quantity": 24,
                    "subOrderIds": [
                        "OR20190628455953_1"
                    ],
                    "mapping": {
                        "productId": "276238",
                        "categoryId": "CK00002520",
                        "sku": "645011"
                    }
                },
                {
                    "productId": "PR24995",
                    "productName": "W Parle Mango Bite Candy 50 N ( Rs. 0.50 Each)",
                    "quantity": 6,
                    "subOrderIds": [
                        "OR20190628455953_2"
                    ],
                    "mapping": {
                        "productId": "212862",
                        "categoryId": "CK00002520",
                        "sku": "430258"
                    }
                },
                {
                    "productId": "PR23680",
                    "productName": "W Surf Excel Detergent Powder Quick Wash, 60 g",
                    "quantity": 6,
                    "subOrderIds": [
                        "OR20190628455984_1"
                    ],
                    "mapping": {
                        "productId": "222330",
                        "categoryId": "CK00006659",
                        "sku": "555390"
                    }
                },
                {
                    "productId": "PR24996",
                    "productName": "W Parle Kaccha Mango Bite Candy 100 N (Rs. 0.50 Each)",
                    "quantity": 20,
                    "subOrderIds": [
                        "OR20190628455992_2"
                    ],
                    "mapping": {
                        "productId": "212924",
                        "categoryId": "CK00002520",
                        "sku": "56136"
                    }
                },
                {
                    "productId": "PR23624",
                    "productName": "W Rin Detergent Powder Refresh,1 Kg",
                    "quantity": 24,
                    "subOrderIds": [
                        "OR20190628455992_4"
                    ],
                    "mapping": {
                        "productId": "210974",
                        "categoryId": "CK00006659",
                        "sku": "58964"
                    }
                },
                {
                    "productId": "PR28647",
                    "productName": "W Nescafe Sunrise Coffee 48N (2 g Each)",
                    "quantity": 48,
                    "subOrderIds": [
                        "OR20190628455997_1"
                    ],
                    "mapping": {
                        "productId": "313538",
                        "categoryId": "CK00002514",
                        "sku": "980001545"
                    }
                }
            ]
        },
        {
            "_id": "WMF7",
            "locationId": "313",
            "orderList": [
                {
                    "_id": "OR20190622445198",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 2678.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T10:54:08.184Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190622445198_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25809",
                                    "name": "W Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "100950",
                                    "mapping": {
                                        "productId": "212558",
                                        "categoryId": "CK00002524",
                                        "sku": "100950"
                                    },
                                    "mrp": 186,
                                    "transferPrice": 161.25,
                                    "category": "C6104",
                                    "brand": "BR19876",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 0,
                                        "remainingQty": 16
                                    },
                                    "subOrderId": "OR20190622445198_1",
                                    "orderId": "OR20190622445198",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445202",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 1932.09,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T10:54:58.488Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445202_1",
                            "quantity": 12,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23861",
                                    "name": "W Lifebuoy Soap Total, 3N (100 g Each)",
                                    "quantity": 12,
                                    "skuCode": "203045",
                                    "mapping": {
                                        "sku": "11508",
                                        "productId": "400814",
                                        "categoryId": "CK00005911"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11508",
                                        "productId": "400814",
                                        "categoryId": "CK00005911"
                                    },
                                    "mrp": 66,
                                    "transferPrice": 60.2,
                                    "category": "C4788",
                                    "brand": "BR13037",
                                    "keeper": {
                                        "requiredQty": 12,
                                        "availableQty": 12,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445202_1",
                                    "orderId": "OR20190622445202",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445202_2",
                            "quantity": 15,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR30618",
                                    "name": "W Lux Soap Strawberry & Cream, 3N (100 g Each)",
                                    "quantity": 15,
                                    "skuCode": "260375",
                                    "mapping": {
                                        "sku": "11850",
                                        "productId": "406679",
                                        "categoryId": "CK00005911"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11850",
                                        "productId": "406679",
                                        "categoryId": "CK00005911"
                                    },
                                    "mrp": 73,
                                    "transferPrice": 65.27,
                                    "category": "C4788",
                                    "brand": "BR14057",
                                    "keeper": {
                                        "requiredQty": 15,
                                        "availableQty": 15,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445202_2",
                                    "orderId": "OR20190622445202",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445202_3",
                            "quantity": 60,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23892",
                                    "name": "W Lifebuoy Soap Total, 56 g",
                                    "quantity": 60,
                                    "skuCode": "462283",
                                    "mapping": {
                                        "sku": "13418",
                                        "productId": "400840",
                                        "categoryId": "CK00005911"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "13418",
                                        "productId": "400840",
                                        "categoryId": "CK00005911"
                                    },
                                    "mrp": 10,
                                    "transferPrice": 8.98,
                                    "category": "C4788",
                                    "brand": "BR13037",
                                    "keeper": {
                                        "requiredQty": 60,
                                        "availableQty": 60,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445202_3",
                                    "orderId": "OR20190622445202",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445210",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 2678.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T10:57:13.839Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190622445210_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25809",
                                    "name": "W Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "100950",
                                    "mapping": {
                                        "productId": "212558",
                                        "categoryId": "CK00002524",
                                        "sku": "100950"
                                    },
                                    "mrp": 186,
                                    "transferPrice": 161.25,
                                    "category": "C6104",
                                    "brand": "BR19876",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 0,
                                        "remainingQty": 16
                                    },
                                    "subOrderId": "OR20190622445210_1",
                                    "orderId": "OR20190622445210",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445222",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 2678.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T11:02:09.567Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190622445222_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25809",
                                    "name": "W Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "100950",
                                    "mapping": {
                                        "productId": "212558",
                                        "categoryId": "CK00002524",
                                        "sku": "100950"
                                    },
                                    "mrp": 186,
                                    "transferPrice": 161.25,
                                    "category": "C6104",
                                    "brand": "BR19876",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 0,
                                        "remainingQty": 16
                                    },
                                    "subOrderId": "OR20190622445222_1",
                                    "orderId": "OR20190622445222",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445227",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 1674,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T11:04:25.920Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "subOrders": [
                        {
                            "_id": "OR20190622445227_1",
                            "quantity": 10,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25809",
                                    "name": "W Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                                    "quantity": 10,
                                    "skuCode": "100950",
                                    "mapping": {
                                        "productId": "212558",
                                        "categoryId": "CK00002524",
                                        "sku": "100950"
                                    },
                                    "mrp": 186,
                                    "transferPrice": 161.25,
                                    "category": "C6104",
                                    "brand": "BR19876",
                                    "keeper": {
                                        "requiredQty": 10,
                                        "availableQty": 0,
                                        "remainingQty": 10
                                    },
                                    "subOrderId": "OR20190622445227_1",
                                    "orderId": "OR20190622445227",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445283",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 1502.68,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T11:38:41.348Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445283_1",
                            "quantity": 21,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25163",
                                    "name": "W Harpic Toilet Cleaner 500 ml",
                                    "quantity": 21,
                                    "skuCode": "50711",
                                    "mapping": {
                                        "sku": "10270",
                                        "productId": "400668",
                                        "categoryId": "CK00005185"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10270",
                                        "productId": "400668",
                                        "categoryId": "CK00005185"
                                    },
                                    "mrp": 82,
                                    "transferPrice": 73.05,
                                    "category": "C4145",
                                    "brand": "BR15121",
                                    "keeper": {
                                        "requiredQty": 21,
                                        "availableQty": 21,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445283_1",
                                    "orderId": "OR20190622445283",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445320",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 479.08,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:04:11.469Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445320_1",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24817",
                                    "name": "W Parachute Coconut Hair Oil 200 ml",
                                    "quantity": 6,
                                    "skuCode": "249308",
                                    "mapping": {
                                        "sku": "11746",
                                        "productId": "397564",
                                        "categoryId": "CK00002624"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11746",
                                        "productId": "397564",
                                        "categoryId": "CK00002624"
                                    },
                                    "mrp": 86,
                                    "transferPrice": 73.2,
                                    "category": "C4590",
                                    "brand": "BR10036",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 6,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445320_1",
                                    "orderId": "OR20190622445320",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445328",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 2544.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:12:58.067Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445328_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25801",
                                    "name": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "49402",
                                    "mapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19877",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 16,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445328_1",
                                    "orderId": "OR20190622445328",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445330",
                    "logistics": 15,
                    "isSkWarehouse": false,
                    "orderAmount": 2426.28,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:14:00.962Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445330_1",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR29294",
                                    "name": "W Surf Excel Detergent Liquid Front Load, 1.02 L",
                                    "quantity": 6,
                                    "skuCode": "693122",
                                    "mapping": {
                                        "sku": "18497",
                                        "productId": "402258",
                                        "categoryId": "CK00006663"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "18497",
                                        "productId": "402258",
                                        "categoryId": "CK00006663"
                                    },
                                    "mrp": 225,
                                    "transferPrice": 190.35,
                                    "category": "C5788",
                                    "brand": "BR19491",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 6,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445330_1",
                                    "orderId": "OR20190622445330",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445330_2",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR29293",
                                    "name": "W Surf Excel Detergent Liquid Top Load, 1.02 L",
                                    "quantity": 6,
                                    "skuCode": "693115",
                                    "mapping": {
                                        "sku": "18496",
                                        "productId": "402254",
                                        "categoryId": "CK00006663"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "18496",
                                        "productId": "402254",
                                        "categoryId": "CK00006663"
                                    },
                                    "mrp": 209,
                                    "transferPrice": 176.81,
                                    "category": "C5788",
                                    "brand": "BR19491",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 6,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445330_2",
                                    "orderId": "OR20190622445330",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445331",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 2544.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:15:15.626Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445331_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25801",
                                    "name": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "49402",
                                    "mapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19877",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 16,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445331_1",
                                    "orderId": "OR20190622445331",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445333",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 2544.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:19:12.896Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445333_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25801",
                                    "name": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                                    "quantity": 16,
                                    "skuCode": "49402",
                                    "mapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19877",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 16,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445333_1",
                                    "orderId": "OR20190622445333",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445340",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 475.2,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T12:31:16.278Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445340_1",
                            "quantity": 3,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25801",
                                    "name": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                                    "quantity": 3,
                                    "skuCode": "49402",
                                    "mapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10236",
                                        "productId": "416777",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19877",
                                    "keeper": {
                                        "requiredQty": 3,
                                        "availableQty": 3,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445340_1",
                                    "orderId": "OR20190622445340",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445372",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 1790.38,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T13:08:22.346Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445372_1",
                            "quantity": 24,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23852",
                                    "name": "W Godrej No.1 Soap Sandal & Turmeric, 4N (63 g Each)",
                                    "quantity": 24,
                                    "skuCode": "60861",
                                    "mapping": {
                                        "sku": "10602",
                                        "productId": "405222",
                                        "categoryId": "CK00005911"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "10602",
                                        "productId": "405222",
                                        "categoryId": "CK00005911"
                                    },
                                    "mrp": 40,
                                    "transferPrice": 34.9,
                                    "category": "C4788",
                                    "brand": "BR10189",
                                    "keeper": {
                                        "requiredQty": 24,
                                        "availableQty": 24,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445372_1",
                                    "orderId": "OR20190622445372",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445372_2",
                            "quantity": 6,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25941",
                                    "name": "W Britannia Milk Bikis 85 g",
                                    "quantity": 6,
                                    "skuCode": "324936",
                                    "mapping": {
                                        "sku": "12359",
                                        "productId": "417009",
                                        "categoryId": "CK00002549"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "12359",
                                        "productId": "417009",
                                        "categoryId": "CK00002549"
                                    },
                                    "mrp": 10,
                                    "transferPrice": 8.84,
                                    "category": "C5224",
                                    "brand": "BR17375",
                                    "keeper": {
                                        "requiredQty": 6,
                                        "availableQty": 0,
                                        "remainingQty": 6
                                    },
                                    "subOrderId": "OR20190622445372_2",
                                    "orderId": "OR20190622445372",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445372_3",
                            "quantity": 9,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25580",
                                    "name": "W Boost Health Drink Refill, 200 g",
                                    "quantity": 9,
                                    "skuCode": "279989",
                                    "mapping": {
                                        "sku": "11977",
                                        "productId": "419791",
                                        "categoryId": "CK00006937"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11977",
                                        "productId": "419791",
                                        "categoryId": "CK00006937"
                                    },
                                    "mrp": 102,
                                    "transferPrice": 94.45,
                                    "category": "C4204",
                                    "brand": "BR13716",
                                    "keeper": {
                                        "requiredQty": 9,
                                        "availableQty": 9,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445372_3",
                                    "orderId": "OR20190622445372",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445401",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 2544.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T13:27:50.115Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445401_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25827",
                                    "name": "W Happydent Gum White Mint Jar, 1 N",
                                    "quantity": 16,
                                    "skuCode": "687256",
                                    "mapping": {
                                        "sku": "18201",
                                        "productId": "416787",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "18201",
                                        "productId": "416787",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19914",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 16,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445401_1",
                                    "orderId": "OR20190622445401",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445410",
                    "logistics": 10,
                    "isSkWarehouse": false,
                    "orderAmount": 2544.4,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T13:33:22.465Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445410_1",
                            "quantity": 16,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR25827",
                                    "name": "W Happydent Gum White Mint Jar, 1 N",
                                    "quantity": 16,
                                    "skuCode": "687256",
                                    "mapping": {
                                        "sku": "18201",
                                        "productId": "416787",
                                        "categoryId": "CK00002524"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "18201",
                                        "productId": "416787",
                                        "categoryId": "CK00002524"
                                    },
                                    "mrp": 176,
                                    "transferPrice": 152,
                                    "category": "C6104",
                                    "brand": "BR19914",
                                    "keeper": {
                                        "requiredQty": 16,
                                        "availableQty": 16,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445410_1",
                                    "orderId": "OR20190622445410",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                },
                {
                    "_id": "OR20190622445467",
                    "logistics": 0,
                    "isSkWarehouse": false,
                    "orderAmount": 1493.46,
                    "partnerWhId": "313",
                    "partnerWmfInfo": {
                        "attempts": {
                            "maxAuthoriseRetry": 4,
                            "maxOrderRetry": 3,
                            "placeOrder": 0,
                            "authorise": 0
                        },
                        "isOrderPlaced": false
                    },
                    "createdAt": "2019-06-22T14:16:00.199Z",
                    "source": "WMF7",
                    "status": "Confirmed",
                    "pickSAPSKU": true,
                    "subOrders": [
                        {
                            "_id": "OR20190622445467_1",
                            "quantity": 18,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR23861",
                                    "name": "W Lifebuoy Soap Total, 3N (100 g Each)",
                                    "quantity": 18,
                                    "skuCode": "203045",
                                    "mapping": {
                                        "sku": "11508",
                                        "productId": "400814",
                                        "categoryId": "CK00005911"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11508",
                                        "productId": "400814",
                                        "categoryId": "CK00005911"
                                    },
                                    "mrp": 66,
                                    "transferPrice": 60.2,
                                    "category": "C4788",
                                    "brand": "BR13037",
                                    "keeper": {
                                        "requiredQty": 18,
                                        "availableQty": 18,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445467_1",
                                    "orderId": "OR20190622445467",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        },
                        {
                            "_id": "OR20190622445467_2",
                            "quantity": 14,
                            "status": "Confirmed",
                            "readyForBatching": false,
                            "isPoCreated": false,
                            "products": [
                                {
                                    "id": "PR24706",
                                    "name": "W Britannia Good Day Biscuits\tButter, 12 N (Rs. 5 Each)",
                                    "quantity": 14,
                                    "skuCode": "203836",
                                    "mapping": {
                                        "sku": "11525",
                                        "productId": "396950",
                                        "categoryId": "CK00002545"
                                    },
                                    "wmSAPMapping": {
                                        "sku": "11525",
                                        "productId": "396950",
                                        "categoryId": "CK00002545"
                                    },
                                    "mrp": 60,
                                    "transferPrice": 54.27,
                                    "category": "C5224",
                                    "brand": "BR17375",
                                    "keeper": {
                                        "requiredQty": 14,
                                        "availableQty": 14,
                                        "remainingQty": 0
                                    },
                                    "subOrderId": "OR20190622445467_2",
                                    "orderId": "OR20190622445467",
                                    "whId": "WMF7",
                                    "locationId": "313",
                                    "isPoCreated": false,
                                    "fulfilled": true
                                }
                            ],
                            "whId": "WMF7",
                            "locationId": "313"
                        }
                    ],
                    "hasStock": true
                }
            ],
            "totalOrders": 16,
            "skOrderAmount": 32530.370000000006,
            "partnerOrderAmount": 31969.029999999995,
            "orderPlacementData": [
                {
                    "productId": "PR23861",
                    "productName": "W Lifebuoy Soap Total, 3N (100 g Each)",
                    "quantity": 30,
                    "subOrderIds": [
                        "OR20190622445202_1",
                        "OR20190622445467_1"
                    ],
                    "mapping": {
                        "sku": "11508",
                        "productId": "400814",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "productId": "PR30618",
                    "productName": "W Lux Soap Strawberry & Cream, 3N (100 g Each)",
                    "quantity": 15,
                    "subOrderIds": [
                        "OR20190622445202_2"
                    ],
                    "mapping": {
                        "sku": "11850",
                        "productId": "406679",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "productId": "PR23892",
                    "productName": "W Lifebuoy Soap Total, 56 g",
                    "quantity": 60,
                    "subOrderIds": [
                        "OR20190622445202_3"
                    ],
                    "mapping": {
                        "sku": "13418",
                        "productId": "400840",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "productId": "PR25163",
                    "productName": "W Harpic Toilet Cleaner 500 ml",
                    "quantity": 21,
                    "subOrderIds": [
                        "OR20190622445283_1"
                    ],
                    "mapping": {
                        "sku": "10270",
                        "productId": "400668",
                        "categoryId": "CK00005185"
                    }
                },
                {
                    "productId": "PR24817",
                    "productName": "W Parachute Coconut Hair Oil 200 ml",
                    "quantity": 6,
                    "subOrderIds": [
                        "OR20190622445320_1"
                    ],
                    "mapping": {
                        "sku": "11746",
                        "productId": "397564",
                        "categoryId": "CK00002624"
                    }
                },
                {
                    "productId": "PR25801",
                    "productName": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                    "quantity": 51,
                    "subOrderIds": [
                        "OR20190622445328_1",
                        "OR20190622445331_1",
                        "OR20190622445333_1",
                        "OR20190622445340_1"
                    ],
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    }
                },
                {
                    "productId": "PR29294",
                    "productName": "W Surf Excel Detergent Liquid Front Load, 1.02 L",
                    "quantity": 6,
                    "subOrderIds": [
                        "OR20190622445330_1"
                    ],
                    "mapping": {
                        "sku": "18497",
                        "productId": "402258",
                        "categoryId": "CK00006663"
                    }
                },
                {
                    "productId": "PR29293",
                    "productName": "W Surf Excel Detergent Liquid Top Load, 1.02 L",
                    "quantity": 6,
                    "subOrderIds": [
                        "OR20190622445330_2"
                    ],
                    "mapping": {
                        "sku": "18496",
                        "productId": "402254",
                        "categoryId": "CK00006663"
                    }
                },
                {
                    "productId": "PR23852",
                    "productName": "W Godrej No.1 Soap Sandal & Turmeric, 4N (63 g Each)",
                    "quantity": 24,
                    "subOrderIds": [
                        "OR20190622445372_1"
                    ],
                    "mapping": {
                        "sku": "10602",
                        "productId": "405222",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "productId": "PR25580",
                    "productName": "W Boost Health Drink Refill, 200 g",
                    "quantity": 9,
                    "subOrderIds": [
                        "OR20190622445372_3"
                    ],
                    "mapping": {
                        "sku": "11977",
                        "productId": "419791",
                        "categoryId": "CK00006937"
                    }
                },
                {
                    "productId": "PR25827",
                    "productName": "W Happydent Gum White Mint Jar, 1 N",
                    "quantity": 32,
                    "subOrderIds": [
                        "OR20190622445401_1",
                        "OR20190622445410_1"
                    ],
                    "mapping": {
                        "sku": "18201",
                        "productId": "416787",
                        "categoryId": "CK00002524"
                    }
                },
                {
                    "productId": "PR24706",
                    "productName": "W Britannia Good Day Biscuits\tButter, 12 N (Rs. 5 Each)",
                    "quantity": 14,
                    "subOrderIds": [
                        "OR20190622445467_2"
                    ],
                    "mapping": {
                        "sku": "11525",
                        "productId": "396950",
                        "categoryId": "CK00002545"
                    }
                }
            ]
        }
    ],
    "partnerProducts": [
        {
            "locationId": "313",
            "productIds": [
                "396568",
                "212558",
                "400814",
                "406679",
                "400840",
                "400668",
                "397564",
                "416777",
                "402258",
                "402254",
                "405222",
                "417009",
                "419791",
                "416787",
                "396950"
            ],
            "skus": [
                "10925",
                "100950",
                "11508",
                "11850",
                "13418",
                "10270",
                "11746",
                "10236",
                "18497",
                "18496",
                "10602",
                "12359",
                "11977",
                "18201",
                "11525"
            ],
            "products": [
                {
                    "skProductId": "PR30720",
                    "subOrderIds": [
                        "OR20190626452050_1"
                    ],
                    "quantity": 12,
                    "mapping": {
                        "sku": "10925",
                        "productId": "396568",
                        "categoryId": "CK00002633"
                    },
                    "keeper": {
                        "requiredQty": 12,
                        "availableQty": 12,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25809",
                    "subOrderIds": [
                        "OR20190622445198_1",
                        "OR20190622445210_1",
                        "OR20190622445222_1",
                        "OR20190622445227_1"
                    ],
                    "quantity": 58,
                    "mapping": {
                        "productId": "212558",
                        "categoryId": "CK00002524",
                        "sku": "100950"
                    },
                    "keeper": {
                        "requiredQty": 58,
                        "availableQty": 0,
                        "remainingQty": 58
                    }
                },
                {
                    "skProductId": "PR23861",
                    "subOrderIds": [
                        "OR20190622445202_1"
                    ],
                    "quantity": 12,
                    "mapping": {
                        "sku": "11508",
                        "productId": "400814",
                        "categoryId": "CK00005911"
                    },
                    "keeper": {
                        "requiredQty": 12,
                        "availableQty": 30,
                        "remainingQty": -18
                    }
                },
                {
                    "skProductId": "PR30618",
                    "subOrderIds": [
                        "OR20190622445202_2"
                    ],
                    "quantity": 15,
                    "mapping": {
                        "sku": "11850",
                        "productId": "406679",
                        "categoryId": "CK00005911"
                    },
                    "keeper": {
                        "requiredQty": 15,
                        "availableQty": 15,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR23892",
                    "subOrderIds": [
                        "OR20190622445202_3"
                    ],
                    "quantity": 60,
                    "mapping": {
                        "sku": "13418",
                        "productId": "400840",
                        "categoryId": "CK00005911"
                    },
                    "keeper": {
                        "requiredQty": 60,
                        "availableQty": 60,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25163",
                    "subOrderIds": [
                        "OR20190622445283_1"
                    ],
                    "quantity": 21,
                    "mapping": {
                        "sku": "10270",
                        "productId": "400668",
                        "categoryId": "CK00005185"
                    },
                    "keeper": {
                        "requiredQty": 21,
                        "availableQty": 21,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR24817",
                    "subOrderIds": [
                        "OR20190622445320_1"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "sku": "11746",
                        "productId": "397564",
                        "categoryId": "CK00002624"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 6,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25801",
                    "subOrderIds": [
                        "OR20190622445328_1"
                    ],
                    "quantity": 16,
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 16,
                        "availableQty": 51,
                        "remainingQty": -35
                    }
                },
                {
                    "skProductId": "PR29294",
                    "subOrderIds": [
                        "OR20190622445330_1"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "sku": "18497",
                        "productId": "402258",
                        "categoryId": "CK00006663"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 6,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR29293",
                    "subOrderIds": [
                        "OR20190622445330_2"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "sku": "18496",
                        "productId": "402254",
                        "categoryId": "CK00006663"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 6,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25801",
                    "subOrderIds": [
                        "OR20190622445331_1"
                    ],
                    "quantity": 16,
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 16,
                        "availableQty": 0,
                        "remainingQty": 16
                    }
                },
                {
                    "skProductId": "PR25801",
                    "subOrderIds": [
                        "OR20190622445333_1"
                    ],
                    "quantity": 16,
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 16,
                        "availableQty": 0,
                        "remainingQty": 16
                    }
                },
                {
                    "skProductId": "PR25801",
                    "subOrderIds": [
                        "OR20190622445340_1"
                    ],
                    "quantity": 3,
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 3,
                        "availableQty": 0,
                        "remainingQty": 3
                    }
                },
                {
                    "skProductId": "PR23852",
                    "subOrderIds": [
                        "OR20190622445372_1"
                    ],
                    "quantity": 24,
                    "mapping": {
                        "sku": "10602",
                        "productId": "405222",
                        "categoryId": "CK00005911"
                    },
                    "keeper": {
                        "requiredQty": 24,
                        "availableQty": 24,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25941",
                    "subOrderIds": [
                        "OR20190622445372_2"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "sku": "12359",
                        "productId": "417009",
                        "categoryId": "CK00002549"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 0,
                        "remainingQty": 6
                    }
                },
                {
                    "skProductId": "PR25580",
                    "subOrderIds": [
                        "OR20190622445372_3"
                    ],
                    "quantity": 9,
                    "mapping": {
                        "sku": "11977",
                        "productId": "419791",
                        "categoryId": "CK00006937"
                    },
                    "keeper": {
                        "requiredQty": 9,
                        "availableQty": 9,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25827",
                    "subOrderIds": [
                        "OR20190622445401_1"
                    ],
                    "quantity": 16,
                    "mapping": {
                        "sku": "18201",
                        "productId": "416787",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 16,
                        "availableQty": 32,
                        "remainingQty": -16
                    }
                },
                {
                    "skProductId": "PR25827",
                    "subOrderIds": [
                        "OR20190622445410_1"
                    ],
                    "quantity": 16,
                    "mapping": {
                        "sku": "18201",
                        "productId": "416787",
                        "categoryId": "CK00002524"
                    },
                    "keeper": {
                        "requiredQty": 16,
                        "availableQty": 0,
                        "remainingQty": 16
                    }
                },
                {
                    "skProductId": "PR23861",
                    "subOrderIds": [
                        "OR20190622445467_1"
                    ],
                    "quantity": 18,
                    "mapping": {
                        "sku": "11508",
                        "productId": "400814",
                        "categoryId": "CK00005911"
                    },
                    "keeper": {
                        "requiredQty": 18,
                        "availableQty": 0,
                        "remainingQty": 18
                    }
                },
                {
                    "skProductId": "PR24706",
                    "subOrderIds": [
                        "OR20190622445467_2"
                    ],
                    "quantity": 14,
                    "mapping": {
                        "sku": "11525",
                        "productId": "396950",
                        "categoryId": "CK00002545"
                    },
                    "keeper": {
                        "requiredQty": 14,
                        "availableQty": 14,
                        "remainingQty": 0
                    }
                }
            ],
            "partnerInventory": [
                {
                    "StoreID": 313,
                    "ID": 397564,
                    "MRP": 86,
                    "Title": "Parachute Coconut Hair Oil 200 ml",
                    "WebPrice": 73.2,
                    "Inventory": 50,
                    "Sku": "11746",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 44,
                        "usedQty": 6
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 406679,
                    "MRP": 73,
                    "Title": "Lux Soap Strawberry & Cream, 3N (100 g Each)",
                    "WebPrice": 65.27,
                    "Inventory": 181,
                    "Sku": "11850",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 166,
                        "usedQty": 15
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 400840,
                    "MRP": 10,
                    "Title": "Lifebuoy Soap Total, 56 g",
                    "WebPrice": 8.98,
                    "Inventory": 1422,
                    "Sku": "13418",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 1362,
                        "usedQty": 60
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 400668,
                    "MRP": 82,
                    "Title": "Harpic Toilet Cleaner 500 ml",
                    "WebPrice": 73.05,
                    "Inventory": 132,
                    "Sku": "10270",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 111,
                        "usedQty": 21
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 416777,
                    "MRP": 176,
                    "Title": "Big Babol Chewing Gum Fruit, 150N (Rs. 1 Each)",
                    "WebPrice": 152,
                    "Inventory": 64,
                    "Sku": "10236",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 13,
                        "usedQty": 51
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 402258,
                    "MRP": 225,
                    "Title": "Surf Excel Detergent Liquid Front Load, 1.02 L",
                    "WebPrice": 190.35,
                    "Inventory": 16,
                    "Sku": "18497",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 10,
                        "usedQty": 6
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 402254,
                    "MRP": 209,
                    "Title": "Surf Excel Detergent Liquid Top Load, 1.02 L",
                    "WebPrice": 176.81,
                    "Inventory": 85,
                    "Sku": "18496",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 79,
                        "usedQty": 6
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 400814,
                    "MRP": 66,
                    "Title": "Lifebuoy Soap Total, 3N (100 g Each)",
                    "WebPrice": 60.2,
                    "Inventory": 595,
                    "Sku": "11508",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 565,
                        "usedQty": 30
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 396568,
                    "MRP": 186,
                    "Title": "Center Fruit Chewing Gum Watermelon, 170 N (Rs. 1 Each)",
                    "WebPrice": 161.25,
                    "Inventory": 58,
                    "Sku": "10925",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 46,
                        "usedQty": 12
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 405222,
                    "MRP": 40,
                    "Title": "Godrej No.1 Soap Sandal & Turmeric, 4N (63 g Each)",
                    "WebPrice": 34.9,
                    "Inventory": 45,
                    "Sku": "10602",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 21,
                        "usedQty": 24
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 419791,
                    "MRP": 102,
                    "Title": "Boost Health Drink Refill, 200 g",
                    "WebPrice": 94.45,
                    "Inventory": 240,
                    "Sku": "11977",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 231,
                        "usedQty": 9
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 416787,
                    "MRP": 176,
                    "Title": "Happydent Gum White Mint  Jar, 176 N",
                    "WebPrice": 152,
                    "Inventory": 96,
                    "Sku": "18201",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 64,
                        "usedQty": 32
                    }
                },
                {
                    "StoreID": 313,
                    "ID": 396950,
                    "MRP": 60,
                    "Title": "Britannia Good Day Biscuits Butter, 12 N (Rs. 5 Each)",
                    "WebPrice": 54.27,
                    "Inventory": 176,
                    "Sku": "11525",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 162,
                        "usedQty": 14
                    }
                }
            ]
        },
        {
            "locationId": "262",
            "productIds": [
                "216912",
                "300594",
                "365436",
                "212927",
                "276238",
                "212862",
                "222330",
                "212924",
                "210974",
                "313538"
            ],
            "skus": [
                "203045",
                "675636",
                "455353",
                "56213",
                "645011",
                "430258",
                "555390",
                "56136",
                "58964",
                "980001545"
            ],
            "products": [
                {
                    "skProductId": "PR23861",
                    "subOrderIds": [
                        "OR20190628455861_1"
                    ],
                    "quantity": 24,
                    "mapping": {
                        "productId": "216912",
                        "categoryId": "CK00005911",
                        "sku": "203045"
                    },
                    "keeper": {
                        "requiredQty": 24,
                        "availableQty": 24,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR23942",
                    "subOrderIds": [
                        "OR20190628455861_2"
                    ],
                    "quantity": 12,
                    "mapping": {
                        "productId": "300594",
                        "categoryId": "CK00005911",
                        "sku": "675636"
                    },
                    "keeper": {
                        "requiredQty": 12,
                        "availableQty": 12,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR24707",
                    "subOrderIds": [
                        "OR20190628455862_1",
                        "OR20190628455992_1"
                    ],
                    "quantity": 24,
                    "mapping": {
                        "productId": "365436",
                        "categoryId": "CK00002545",
                        "sku": "455353"
                    },
                    "keeper": {
                        "requiredQty": 24,
                        "availableQty": 24,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR24997",
                    "subOrderIds": [
                        "OR20190628455862_2",
                        "OR20190628455992_3"
                    ],
                    "quantity": 12,
                    "mapping": {
                        "productId": "212927",
                        "categoryId": "CK00002520",
                        "sku": "56213"
                    },
                    "keeper": {
                        "requiredQty": 12,
                        "availableQty": 12,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR25024",
                    "subOrderIds": [
                        "OR20190628455953_1"
                    ],
                    "quantity": 24,
                    "mapping": {
                        "productId": "276238",
                        "categoryId": "CK00002520",
                        "sku": "645011"
                    },
                    "keeper": {
                        "requiredQty": 24,
                        "availableQty": 24,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR24995",
                    "subOrderIds": [
                        "OR20190628455953_2"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "productId": "212862",
                        "categoryId": "CK00002520",
                        "sku": "430258"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 6,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR23680",
                    "subOrderIds": [
                        "OR20190628455984_1"
                    ],
                    "quantity": 6,
                    "mapping": {
                        "productId": "222330",
                        "categoryId": "CK00006659",
                        "sku": "555390"
                    },
                    "keeper": {
                        "requiredQty": 6,
                        "availableQty": 6,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR24996",
                    "subOrderIds": [
                        "OR20190628455992_2"
                    ],
                    "quantity": 20,
                    "mapping": {
                        "productId": "212924",
                        "categoryId": "CK00002520",
                        "sku": "56136"
                    },
                    "keeper": {
                        "requiredQty": 20,
                        "availableQty": 20,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR23624",
                    "subOrderIds": [
                        "OR20190628455992_4"
                    ],
                    "quantity": 24,
                    "mapping": {
                        "productId": "210974",
                        "categoryId": "CK00006659",
                        "sku": "58964"
                    },
                    "keeper": {
                        "requiredQty": 24,
                        "availableQty": 24,
                        "remainingQty": 0
                    }
                },
                {
                    "skProductId": "PR28647",
                    "subOrderIds": [
                        "OR20190628455997_1"
                    ],
                    "quantity": 48,
                    "mapping": {
                        "productId": "313538",
                        "categoryId": "CK00002514",
                        "sku": "980001545"
                    },
                    "keeper": {
                        "requiredQty": 48,
                        "availableQty": 48,
                        "remainingQty": 0
                    }
                }
            ],
            "partnerInventory": [
                {
                    "StoreID": 262,
                    "ID": 300594,
                    "MRP": 40,
                    "Title": "Dettol Soap Pack Of 4 X 45 g",
                    "WebPrice": 35.82,
                    "Inventory": 44,
                    "Sku": "675636",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 32,
                        "usedQty": 12
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 210974,
                    "MRP": 79,
                    "Title": "Rin Detergent Powder Refresh,1 Kg",
                    "WebPrice": 73.15,
                    "Inventory": 186,
                    "Sku": "58964",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 162,
                        "usedQty": 24
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 212924,
                    "MRP": 50,
                    "Title": "Parle Kaccha Mango Bite Candy 100 N (Rs. 0.50 Each)",
                    "WebPrice": 41.75,
                    "Inventory": 63,
                    "Sku": "56136",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 43,
                        "usedQty": 20
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 276238,
                    "MRP": 50,
                    "Title": "Parle Orange Bite Toffee 100 N ( Rs.0.50 Each)",
                    "WebPrice": 42,
                    "Inventory": 24,
                    "Sku": "645011",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 0,
                        "usedQty": 24
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 365436,
                    "MRP": 60,
                    "Title": "Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                    "WebPrice": 52.77,
                    "Inventory": 34,
                    "Sku": "455353",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 10,
                        "usedQty": 24
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 212927,
                    "MRP": 100,
                    "Title": "Parle Melody Toffee 100 N (Rs. 1 Each)",
                    "WebPrice": 81.6,
                    "Inventory": 12,
                    "Sku": "56213",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 0,
                        "usedQty": 12
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 212862,
                    "MRP": 50,
                    "Title": "Parle Mango Bite Candy 50 N ( Rs. 0.50 Each)",
                    "WebPrice": 41.75,
                    "Inventory": 22,
                    "Sku": "430258",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 16,
                        "usedQty": 6
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 313538,
                    "MRP": 96,
                    "Title": "Nescafe Sunrise Coffee 48N (2 g Each)",
                    "WebPrice": 87.28,
                    "Inventory": 48,
                    "Sku": "980001545",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 0,
                        "usedQty": 48
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 216912,
                    "MRP": 52,
                    "Title": "Lifebuoy Soap Total, 3N (100 g Each)",
                    "WebPrice": 46.56,
                    "Inventory": 57,
                    "Sku": "203045",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 33,
                        "usedQty": 24
                    }
                },
                {
                    "StoreID": 262,
                    "ID": 222330,
                    "MRP": 10,
                    "Title": "Surf Excel Detergent Powder Quick Wash, 60 g",
                    "WebPrice": 8.3,
                    "Inventory": 10,
                    "Sku": "555390",
                    "MinimumOrderQuantity": 1,
                    "MaximumOrderQuantity": 0,
                    "keeper": {
                        "availableQty": 4,
                        "usedQty": 6
                    }
                }
            ]
        }
    ],
    "splitData": [],
    "poData": [
        {
            "whId": "WMF9",
            "products": [
                {
                    "whId": "WMF9",
                    "locationId": "313",
                    "productId": "PR30720",
                    "subOrderIds": [
                        "OR20190626452050_1"
                    ],
                    "name": "W Close Up Toothpaste Red, 80 g",
                    "mrp": 48,
                    "availableStock": 0,
                    "dealerPrice": 40.99,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 12
                    },
                    "unitPrice": 40.99,
                    "total": 491.88,
                    "skuCode": "13412",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 14.6,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4779",
                    "brandId": "BR17111",
                    "delivery_chalan": false,
                    "priceToCompute": 48,
                    "totMargin": 14.6,
                    "mapping": {
                        "sku": "10925",
                        "productId": "396568",
                        "categoryId": "CK00002633"
                    }
                }
            ],
            "totalProducts": 1,
            "totalAmount": 491.88
        },
        {
            "whId": "WMF5",
            "products": [
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR23861",
                    "subOrderIds": [
                        "OR20190628455861_1"
                    ],
                    "name": "W Lifebuoy Soap Total, 3N (100 g Each)",
                    "mrp": 52,
                    "availableStock": 0,
                    "dealerPrice": 46.56,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 24
                    },
                    "unitPrice": 46.56,
                    "total": 1117.44,
                    "skuCode": "203045",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 10.46,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4788",
                    "brandId": "BR13037",
                    "delivery_chalan": false,
                    "priceToCompute": 52,
                    "totMargin": 10.46,
                    "mapping": {
                        "productId": "216912",
                        "categoryId": "CK00005911",
                        "sku": "203045"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR23942",
                    "subOrderIds": [
                        "OR20190628455861_2"
                    ],
                    "name": "W Dettol Soap Pack Of 4 X 45 g",
                    "mrp": 40,
                    "availableStock": 0,
                    "dealerPrice": 35.82,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 12
                    },
                    "unitPrice": 35.82,
                    "total": 429.84,
                    "skuCode": "675636",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 10.45,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4788",
                    "brandId": "BR12172",
                    "delivery_chalan": false,
                    "priceToCompute": 40,
                    "totMargin": 10.45,
                    "mapping": {
                        "productId": "300594",
                        "categoryId": "CK00005911",
                        "sku": "675636"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR24707",
                    "subOrderIds": [
                        "OR20190628455862_1",
                        "OR20190628455992_1"
                    ],
                    "name": "W Parle 20-20 Biscuits Cashew Cookies, 12 N (45 g Each)",
                    "mrp": 60,
                    "availableStock": 0,
                    "dealerPrice": 52.77,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 24
                    },
                    "unitPrice": 52.77,
                    "total": 1266.48,
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
                    "productId": "PR24997",
                    "subOrderIds": [
                        "OR20190628455862_2",
                        "OR20190628455992_3"
                    ],
                    "name": "W Parle Melody Toffee 100 N (Rs. 1 Each)",
                    "mrp": 100,
                    "availableStock": 0,
                    "dealerPrice": 81.6,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 12
                    },
                    "unitPrice": 81.6,
                    "total": 979.2,
                    "skuCode": "56213",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 18.4,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6101",
                    "brandId": "BR15376",
                    "delivery_chalan": false,
                    "priceToCompute": 100,
                    "totMargin": 18.4,
                    "mapping": {
                        "productId": "212927",
                        "categoryId": "CK00002520",
                        "sku": "56213"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR25024",
                    "subOrderIds": [
                        "OR20190628455953_1"
                    ],
                    "name": "W Parle Orange Bite Toffee 100 N ( Rs.0.50 Each)",
                    "mrp": 50,
                    "availableStock": 0,
                    "dealerPrice": 42,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 24
                    },
                    "unitPrice": 42,
                    "total": 1008,
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
                        "OR20190628455953_2"
                    ],
                    "name": "W Parle Mango Bite Candy 50 N ( Rs. 0.50 Each)",
                    "mrp": 50,
                    "availableStock": 0,
                    "dealerPrice": 41.75,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 6
                    },
                    "unitPrice": 41.75,
                    "total": 250.5,
                    "skuCode": "430258",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 16.5,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6101",
                    "brandId": "BR15376",
                    "delivery_chalan": false,
                    "priceToCompute": 50,
                    "totMargin": 16.5,
                    "mapping": {
                        "productId": "212862",
                        "categoryId": "CK00002520",
                        "sku": "430258"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR23680",
                    "subOrderIds": [
                        "OR20190628455984_1"
                    ],
                    "name": "W Surf Excel Detergent Powder Quick Wash, 60 g",
                    "mrp": 10,
                    "availableStock": 0,
                    "dealerPrice": 8.3,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 6
                    },
                    "unitPrice": 8.3,
                    "total": 49.8,
                    "skuCode": "555390",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 17,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4118",
                    "brandId": "BR19491",
                    "delivery_chalan": false,
                    "priceToCompute": 10,
                    "totMargin": 17,
                    "mapping": {
                        "productId": "222330",
                        "categoryId": "CK00006659",
                        "sku": "555390"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR24996",
                    "subOrderIds": [
                        "OR20190628455992_2"
                    ],
                    "name": "W Parle Kaccha Mango Bite Candy 100 N (Rs. 0.50 Each)",
                    "mrp": 50,
                    "availableStock": 0,
                    "dealerPrice": 41.75,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 20
                    },
                    "unitPrice": 41.75,
                    "total": 835,
                    "skuCode": "56136",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 16.5,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6101",
                    "brandId": "BR15376",
                    "delivery_chalan": false,
                    "priceToCompute": 50,
                    "totMargin": 16.5,
                    "mapping": {
                        "productId": "212924",
                        "categoryId": "CK00002520",
                        "sku": "56136"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR23624",
                    "subOrderIds": [
                        "OR20190628455992_4"
                    ],
                    "name": "W Rin Detergent Powder Refresh,1 Kg",
                    "mrp": 79,
                    "availableStock": 0,
                    "dealerPrice": 73.15,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 24
                    },
                    "unitPrice": 73.15,
                    "total": 1755.6,
                    "skuCode": "58964",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 7.41,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4118",
                    "brandId": "BR15841",
                    "delivery_chalan": false,
                    "priceToCompute": 79,
                    "totMargin": 7.41,
                    "mapping": {
                        "productId": "210974",
                        "categoryId": "CK00006659",
                        "sku": "58964"
                    }
                },
                {
                    "whId": "WMF5",
                    "locationId": "262",
                    "productId": "PR28647",
                    "subOrderIds": [
                        "OR20190628455997_1"
                    ],
                    "name": "W Nescafe Sunrise Coffee 48N (2 g Each)",
                    "mrp": 96,
                    "availableStock": 0,
                    "dealerPrice": 87.28,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 48
                    },
                    "unitPrice": 87.28,
                    "total": 4189.44,
                    "skuCode": "980001545",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 9.08,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6209",
                    "brandId": "BR13205",
                    "delivery_chalan": false,
                    "priceToCompute": 96,
                    "totMargin": 9.08,
                    "mapping": {
                        "productId": "313538",
                        "categoryId": "CK00002514",
                        "sku": "980001545"
                    }
                }
            ],
            "totalProducts": 10,
            "totalAmount": 11881.300000000001
        },
        {
            "whId": "WMF7",
            "products": [
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR23861",
                    "subOrderIds": [
                        "OR20190622445202_1",
                        "OR20190622445467_1"
                    ],
                    "name": "W Lifebuoy Soap Total, 3N (100 g Each)",
                    "mrp": 66,
                    "availableStock": 0,
                    "dealerPrice": 60.2,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 30
                    },
                    "unitPrice": 60.2,
                    "total": 1806,
                    "skuCode": "203045",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 8.79,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4788",
                    "brandId": "BR13037",
                    "delivery_chalan": false,
                    "priceToCompute": 66,
                    "totMargin": 8.79,
                    "mapping": {
                        "sku": "11508",
                        "productId": "400814",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR30618",
                    "subOrderIds": [
                        "OR20190622445202_2"
                    ],
                    "name": "W Lux Soap Strawberry & Cream, 3N (100 g Each)",
                    "mrp": 73,
                    "availableStock": 0,
                    "dealerPrice": 65.27,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 15
                    },
                    "unitPrice": 65.27,
                    "total": 979.05,
                    "skuCode": "260375",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 10.59,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4788",
                    "brandId": "BR14057",
                    "delivery_chalan": false,
                    "priceToCompute": 73,
                    "totMargin": 10.59,
                    "mapping": {
                        "sku": "11850",
                        "productId": "406679",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR23892",
                    "subOrderIds": [
                        "OR20190622445202_3"
                    ],
                    "name": "W Lifebuoy Soap Total, 56 g",
                    "mrp": 10,
                    "availableStock": 0,
                    "dealerPrice": 8.98,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 60
                    },
                    "unitPrice": 8.98,
                    "total": 538.8,
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
                        "sku": "13418",
                        "productId": "400840",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR25163",
                    "subOrderIds": [
                        "OR20190622445283_1"
                    ],
                    "name": "W Harpic Toilet Cleaner 500 ml",
                    "mrp": 82,
                    "availableStock": 0,
                    "dealerPrice": 73.05,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 21
                    },
                    "unitPrice": 73.05,
                    "total": 1534.05,
                    "skuCode": "50711",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 10.91,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4145",
                    "brandId": "BR15121",
                    "delivery_chalan": false,
                    "priceToCompute": 82,
                    "totMargin": 10.91,
                    "mapping": {
                        "sku": "10270",
                        "productId": "400668",
                        "categoryId": "CK00005185"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR24817",
                    "subOrderIds": [
                        "OR20190622445320_1"
                    ],
                    "name": "W Parachute Coconut Hair Oil 200 ml",
                    "mrp": 86,
                    "availableStock": 0,
                    "dealerPrice": 73.2,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 6
                    },
                    "unitPrice": 73.2,
                    "total": 439.2,
                    "skuCode": "249308",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 14.88,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4590",
                    "brandId": "BR10036",
                    "delivery_chalan": false,
                    "priceToCompute": 86,
                    "totMargin": 14.88,
                    "mapping": {
                        "sku": "11746",
                        "productId": "397564",
                        "categoryId": "CK00002624"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR25801",
                    "subOrderIds": [
                        "OR20190622445328_1",
                        "OR20190622445331_1",
                        "OR20190622445333_1",
                        "OR20190622445340_1"
                    ],
                    "name": "W Big Babol Chewing Gum Fruit, 150N ( Rs. 1 Each)",
                    "mrp": 176,
                    "availableStock": 0,
                    "dealerPrice": 152,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 51
                    },
                    "unitPrice": 152,
                    "total": 7752,
                    "skuCode": "49402",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 13.64,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6104",
                    "brandId": "BR19877",
                    "delivery_chalan": false,
                    "priceToCompute": 176,
                    "totMargin": 13.64,
                    "mapping": {
                        "sku": "10236",
                        "productId": "416777",
                        "categoryId": "CK00002524"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR29294",
                    "subOrderIds": [
                        "OR20190622445330_1"
                    ],
                    "name": "W Surf Excel Detergent Liquid Front Load, 1.02 L",
                    "mrp": 225,
                    "availableStock": 0,
                    "dealerPrice": 190.35,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 6
                    },
                    "unitPrice": 190.35,
                    "total": 1142.1,
                    "skuCode": "693122",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 15.4,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C5788",
                    "brandId": "BR19491",
                    "delivery_chalan": false,
                    "priceToCompute": 225,
                    "totMargin": 15.4,
                    "mapping": {
                        "sku": "18497",
                        "productId": "402258",
                        "categoryId": "CK00006663"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR29293",
                    "subOrderIds": [
                        "OR20190622445330_2"
                    ],
                    "name": "W Surf Excel Detergent Liquid Top Load, 1.02 L",
                    "mrp": 209,
                    "availableStock": 0,
                    "dealerPrice": 176.81,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 6
                    },
                    "unitPrice": 176.81,
                    "total": 1060.86,
                    "skuCode": "693115",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 15.4,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C5788",
                    "brandId": "BR19491",
                    "delivery_chalan": false,
                    "priceToCompute": 209,
                    "totMargin": 15.4,
                    "mapping": {
                        "sku": "18496",
                        "productId": "402254",
                        "categoryId": "CK00006663"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR23852",
                    "subOrderIds": [
                        "OR20190622445372_1"
                    ],
                    "name": "W Godrej No.1 Soap Sandal & Turmeric, 4N (63 g Each)",
                    "mrp": 40,
                    "availableStock": 0,
                    "dealerPrice": 34.9,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 24
                    },
                    "unitPrice": 34.9,
                    "total": 837.6,
                    "skuCode": "60861",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 12.75,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4788",
                    "brandId": "BR10189",
                    "delivery_chalan": false,
                    "priceToCompute": 40,
                    "totMargin": 12.75,
                    "mapping": {
                        "sku": "10602",
                        "productId": "405222",
                        "categoryId": "CK00005911"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR25580",
                    "subOrderIds": [
                        "OR20190622445372_3"
                    ],
                    "name": "W Boost Health Drink Refill, 200 g",
                    "mrp": 102,
                    "availableStock": 0,
                    "dealerPrice": 94.45,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 9
                    },
                    "unitPrice": 94.45,
                    "total": 850.05,
                    "skuCode": "279989",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 7.4,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C4204",
                    "brandId": "BR13716",
                    "delivery_chalan": false,
                    "priceToCompute": 102,
                    "totMargin": 7.4,
                    "mapping": {
                        "sku": "11977",
                        "productId": "419791",
                        "categoryId": "CK00006937"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR25827",
                    "subOrderIds": [
                        "OR20190622445401_1",
                        "OR20190622445410_1"
                    ],
                    "name": "W Happydent Gum White Mint Jar, 1 N",
                    "mrp": 176,
                    "availableStock": 0,
                    "dealerPrice": 152,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 32
                    },
                    "unitPrice": 152,
                    "total": 4864,
                    "skuCode": "687256",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 13.64,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C6104",
                    "brandId": "BR19914",
                    "delivery_chalan": false,
                    "priceToCompute": 176,
                    "totMargin": 13.64,
                    "mapping": {
                        "sku": "18201",
                        "productId": "416787",
                        "categoryId": "CK00002524"
                    }
                },
                {
                    "whId": "WMF7",
                    "locationId": "313",
                    "productId": "PR24706",
                    "subOrderIds": [
                        "OR20190622445467_2"
                    ],
                    "name": "W Britannia Good Day Biscuits\tButter, 12 N (Rs. 5 Each)",
                    "mrp": 60,
                    "availableStock": 0,
                    "dealerPrice": 54.27,
                    "openPoQty": 0,
                    "quantity": {
                        "suggested": 0,
                        "requested": 14
                    },
                    "unitPrice": 54.27,
                    "total": 759.78,
                    "skuCode": "203836",
                    "dealCount": 1,
                    "pendingOrderProductQty": 0,
                    "marginDealerPrice": false,
                    "margins": {
                        "bMargin": 9.55,
                        "sMargin": 0,
                        "sMarginType": "%"
                    },
                    "orderQty": 0,
                    "order30": 0,
                    "categoryId": "C5224",
                    "brandId": "BR17375",
                    "delivery_chalan": false,
                    "priceToCompute": 60,
                    "totMargin": 9.55,
                    "mapping": {
                        "sku": "11525",
                        "productId": "396950",
                        "categoryId": "CK00002545"
                    }
                }
            ],
            "totalProducts": 12,
            "totalAmount": 22563.49
        }
    ],
    "manualPoData": [],
    "isOrderFlow": true,
    "retryFailed": false
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
                    params.poCreated = true;
                    data.poId = updatedPo._id;
                    data.poStatus = updatedPo.status;
                    data.poCreated = true;
                    data.isOrderPlaced = orderGroup.isOrderPlaced;
                    data.orderStatus = orderGroup.status;
                    data.partnerOrderIds = po.partnerOrderIds && po.partnerOrderIds.length ? po.partnerOrderIds : [];
                    orderGroup.isApiPoCreated = true;
                    orderGroup.apiPoId = updatedPo._id;
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

function _createPo(po) {
    return po;
}



_createAPIPo(params,function(err,result){
    if(err) console.error("Error: " , err);
})