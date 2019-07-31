"use strict;"
var Mongoose = require("mongoose");
const readline = require('readline');
var cuti = require("cuti");
var async = require("async");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsonexport = require('jsonexport');
var csvToJson = require('csvjson');
var moment = require("moment");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var dbURLs = [
    // 0 - LIVE 
    `mongodb://skaman:${encodeURIComponent('Am@N@sk$2019')}@localhost:6161/skstaging`,
    // 1 - STAGING 
    `mongodb://10.0.1.102:27017/skstaging`,
    // 2 - DEV
    `mongodb://devUser:${encodeURIComponent('xMsUHM8C29cMXuVT')}@52.66.151.182:27017/skDev`,
    // 3 - QA
    `mongodb://skQAUser:${encodeURIComponent('g6PELBMenXazvyWP')}@13.126.75.175:27017/skDev`,
    // 4 - LOCAL 
    `mongodb://localhost:27017/multiWh`,
];

var db = null;

var options = { "useNewUrlParser": true };


const sourceFileName = `/Digital.csv`;

/*  INIT  */
(function () {
    console.log(chalker.yellow.bold(`Initializing Database Connection .............`));

    rl.question(
        `\n
        #. Choose option to connect to database : 

        |---------------------------------------------------------------------------------------------|

            [1] LIVE
            [2] STAGING
            [3] DEV
            [4] QA
            [5] LOCAL

        |---------------------------------------------------------------------------------------------|
         \n
        `,
        answer => {
            var answer = parseInt(answer);

            if (answer >= 1 && answer <= 5) {
                const url = dbURLs[answer - 1];
                if (url) {
                    Mongoose.connect(url, options);
                    db = Mongoose.connection;

                    db.on('error', function (e) {
                        console.log(chalker.red.bold(`Error occured while connecting to database `, e));
                        process.exit(1);
                    });

                    db.once('open', function () {
                        console.log(chalker.blue.bold(`Connection Established to Database : ${url}`));
                        run();
                    });

                } else {
                    console.log(chalker.red.bold(`Invalid option entered .............`));
                    process.exit(1);
                }
            } else {
                console.log(chalker.red.bold(`Invalid option entered .............`));
                process.exit(1);
            }
        }
    );

})();


/* MAIN ENTRY POINT - WRITE BUSINESS LOGIC HERE */
function run() {
    console.log(chalker.blue.bold(`SCRIPT STARTED : ---------------------------------------------------------------`));

    var params = {};

    async.waterfall([
        _readFile(params),
        _getFranchises,
        _populateData,
        _iterate
    ], function (err, result) {
        if (err) {
            console.log(chalker.red.bold(`Error Occured , Terminating Script ------------------------------------------ `, err));
            process.exit(1);
        } else {
            console.log(chalker.green.bold(`Script Completed Successfully -----------------------------------------------`));
            process.exit();
        }
    });
}

function _readFile(params) {
    return function (callback) {
        console.log(chalker.yellow(`Reading data from file : ${sourceFileName}`));
        var isExist = fs.existsSync(path.join(__dirname, sourceFileName));
        if (isExist) {
            let options = { delimiter: ',', quote: '"' };
            var data = fs.readFileSync(path.join(__dirname, sourceFileName), { encoding: 'utf8' });
            var json = csvToJson.toObject(data, options);
            params.fileData = json && json.length ? json : [];
            params.franchiseIds = json.map(d => d.franchiseId);
            params.franchiseIds = _.uniq(params.franchiseIds);
            callback(null, params);
        } else {
            callback(new Error(`File does not exists.............`));
        }
    }
}

function _getFranchises(params, callback) {
    console.log(chalker.yellow(`Getting franchise details ........ [${params.franchiseIds.length}]`));
    db.collection('franchises').find({ _id: { $in: params.franchiseIds } }).project({ _id: 1, name: 1, state: 1, district: 1, pincode: 1, town: 1, locality: 1, 'sk_franchise_details.franchise_type': 1, 'sk_franchise_details.franchise_sub_type': 1, 'sk_franchise_details.code': 1 }).limit(params.franchiseIds.length).toArray(function (err, franchiseList) {
        if (err) {
            callback(err);
        } else if (franchiseList && franchiseList.length) {
            params.franchiseList = franchiseList;
            callback(null, params);
        } else {
            callback(new Error(`Error,franchise details not found .........`))
        }
    });
}

function _populateData(params, callback) {
    console.log(chalker.yellow(`Cooking data , .....................`));
    params.insertionList = [];
    const queue = async.queue(function (data, queueCB) {

        let franchise = _.find(params.franchiseList, { _id: data.franchiseId });
        let disbursedMonth = data['Month'].split("-");
        let disbursedYear = parseInt(disbursedMonth[1]);
        disbursedYear = disbursedYear === 18 ? 2018 : disbursedYear === 19 ? 2019 : disbursedYear;
        let mappedMonth = getMonthFromMap(disbursedMonth[0]);
        let endDate = getEndingDateOfMonth(mappedMonth, disbursedYear);

        let salesType = data.Type === 'PHYSICAL' ? 'Physical' : data.Type === 'DIGITAL' ? 'Digital' : "";

        if (franchise) {
            data.totalSales = data.totalSales.split(",").reduce((acc, curr) => acc += curr, "");
            data.totalEarnings = data.totalEarnings.split(",").reduce((acc, curr) => acc += curr, "");
            // Get counter _id;
            var record = {
                "_id": "",
                "refHash": "",
                "retailerId": data.franchiseId,
                "schemesId": "DUMMY",
                "createdBy": "System",
                "isActive": true,
                "createdAt": endDate,
                "loyaltyPoints": {
                    "remarks": [],
                    "isretailerRedeemed": false,
                    "iscustomerRedeemed": false,
                    "isretailerCancelled": false,
                    "isretailerRewarded": false,
                    "iscustomerCancelled": false,
                    "iscustomerRewarded": false,
                    "isChecked": false
                },
                "remarks": [],
                "salesType": salesType,
                "status": "Closed",
                "isDisbursed": true,
                "DisburseStatus": "Approved",
                "isReadyToDisburse": true,
                "achievedSlab": 0,
                "achievedAmount": !isNaN(Number(data.totalEarnings)) ? Number(data.totalEarnings) : 0,
                "ttlOrderQty": 1,
                "ttlSales": !isNaN(Number(data.totalSales)) ? Number(data.totalSales) : 0,
                "ttlNewCustomerCount": 1,
                "ttlOrderCount": 1,
                "franchiseDetail": {
                    "id": data.franchiseId,
                    "name": franchise ? franchise.name : "",
                    "state": franchise ? franchise.state : "",
                    "district": franchise ? franchise.district : "",
                    "pincode": franchise ? franchise.pincode.toString() : "",
                    "parent": "",
                    "type": franchise && franchise.sk_franchise_details ? franchise.sk_franchise_details.franchise_type : "",
                    "subType": franchise && franchise.sk_franchise_details ? franchise.sk_franchise_details.franchise_sub_type : "",
                    "city": franchise ? franchise.town : "",
                    "locality": franchise ? franchise.locality : "",
                    "code": franchise && franchise.sk_franchise_details ? franchise.sk_franchise_details.code : "",
                },
                "isRMFSchemes": franchise && franchise.sk_franchise_details && franchise.sk_franchise_details.franchise_type === 'RMF' ? true : false,
                "isRmf": franchise && franchise.sk_franchise_details && franchise.sk_franchise_details.franchise_type === 'RMF' ? true : false,
                "isHistoricRecord": true,
            }
            params.insertionList.push(record);
            queueCB(null);
        } else {
            queueCB(null);
        }
    });

    queue.push(params.fileData, function (err, result) {

    });

    queue.drain = function () {
        callback(null, params);
    }
}

function _iterate(params, callback) {
    for (let i = 0; i < 9; i++) {
        console.log(`Acheivements ---------------`, params.insertionList[i]);
    }
}

function getMonthFromMap(monthAbbrevation) {
    var mapper = {
        'JAN': 1,
        'FEB': 2,
        'MAR': 3,
        'APR': 4,
        'MAY': 5,
        'JUN': 6,
        'JUL': 7,
        'AUG': 8,
        'SEP': 9,
        'OCT': 10,
        'NOV': 11,
        'DEC': 12
    }
    monthAbbrevation = monthAbbrevation.toLocaleUpperCase();
    return mapper[monthAbbrevation];
}


function getEndingDateOfMonth(month, year) {
    var dt = new Date();
    dt.setFullYear(year);
    dt.setMonth(month);

    return new Date(dt.getFullYear(), dt.getMonth(), 0);
}


function getEndOfDay(year, month, day) {
    return new Date(year, month, day, 23, 59, 59, 999);
}


function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}


function getEndOfDay(year, month, day) {
    return new Date(year, month, day, 23, 59, 59, 999);
}

var getCount = function (sequenceName, expire, callback) {
    var options = {};
    if (!expire) {
        expire = new Date("3000-12-31");
    }
    options.new = true;
    options.upsert = true;
    options.setDefaultsOnInsert = true;
    db.collection('counters').findByIdAndUpdate(sequenceName, { $inc: { next: 1 }, $set: { expiresAt: expire } }, options, callback);
};

function getIdGenerator(prefix, counterName) {
    return new Promise((resolve, reject) => {
        getCount(counterName, null, function (err, doc) {
            let _id = prefix + doc.next;
            resolve(_id);
        });
    });
}