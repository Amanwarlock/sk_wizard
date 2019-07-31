const _ = require("lodash");
const moment = require("moment");

/* Policies reference */
const policiesReference = [
    "FIFO", // Created At
    "LILO", // Created At
    "Expiry First", // shelfLife
    "Expiry Last", // shelfLife
    "Expiry date",
    "Highest MRP", // Mrp
    "Lowest MRP", // Mrp
    "Highest Cost", // Purchase Price
    "Lowest Cost", // Purchase Price
    "Offer First",
    "Offer Last"
];

var snapShot_one = [
    {
        "_id": "WH400",
        "productId": "PR10960",
        "shelfLife": "2019-04-04T18:30:00.000Z", // same
        "mrp": 101,
        "purchasePrice": 81,
        "offer": "",
        "createdAt": "2019-03-05T06:01:08.481Z",//new Date("2018-03-05T06:01:08.481Z"), // 1st
    },
    {
        "_id": "WH401",
        "productId": "PR10960",
        "shelfLife": "2019-04-04T18:30:00.000Z", // same
        "mrp": 101,
        "purchasePrice": 80,
        "offer": "",
        "createdAt": "2019-03-06T05:29:16.908Z",//new Date("2018-03-06T05:29:16.908Z"), // 2nd
    },
    {
        "_id": "WH402",
        "productId": "PR10960",
        "shelfLife": "2019-04-15T18:30:00.000Z", // Different
        "mrp": 100,
        "purchasePrice": 85,
        "offer": "",
        "createdAt": "2018-03-09T05:29:16.908Z",//new Date("2018-03-06T05:29:16.908Z"), // 2nd
    }
];


function sortCustomizer(policyList) {
    var sort = {};
    policyList = policyList && policyList.length ? policyList : [];
    policyList.map(policy => {
        switch (policy) {
            case "FIFO": sort["createdAt"] = 1; break;
            case "LILO": sort["createdAt"] = -1; break;
            case "Expiry First": sort["shelfLife"] = 1; break;
            case "Expiry Last": sort["shelfLife"] = -1; break;
            case "Expiry date": sort["shelfLife"] = 1; break;
            case "Highest MRP": sort["mrp"] = -1; break;
            case "Lowest MRP": sort["mrp"] = 1; break;
            case "Highest Cost": sort["purchasePrice"] = -1; break;
            case "Lowest Cost": sort["purchasePrice"] = 1; break;
            case "Offer First": sort["offer"] = 1; break;
            case "Offer Last": sort["offer"] = -1; break;
            default: break;
        }
    });
    return sort;
}

//var policy = ["Expiry Last", "Lowest MRP", "Lowest Cost"];

var policy = ["Expiry Last"];

run(policy);

function run(policyList) {

    let dateFields = ['createdAt', 'shelfLife'];

    var sort = sortCustomizer(policyList);
    console.log("Sort data", sort);

    let groupResult = null;

    Object.keys(sort).map((policyName, index) => {
        let sortOrder = sort[policyName];
        let sortedList = [];

        if (sortOrder === 1) {
            sortedList = _.sortBy(snapShot_one, el => dateFields.indexOf(policyName) > 0 ? new moment(el[policyName]) : el[policyName]);
        } else if (sortOrder === -1) { // reverse
            sortedList = _.sortBy(snapShot_one, el => dateFields.indexOf(policyName) > 0 ? new moment(el[policyName]) : el[policyName]).reverse();
        }

        groupResult = _.groupBy(sortedList, `${policyName}`);

    });

    console.log("Grouped : ", groupResult);
}






//var result = _.orderBy(snapShot_one,sort);
//console.log("Result : ", result);
/*

var ascendingSort = _.sortBy(snapShot_one , "purchasePrice"); // ascending
console.log("Result Ascending : ", ascendingSort);


var descendingSort = _.sortBy(snapShot_one , "-purchasePrice"); //
console.log("Result Descending -------: ", descendingSort); *



var ascendingDateSort = _.sortBy(snapShot_one , "createdAt"); // ascending
console.log("Result Ascending Date: ", ascendingDateSort);


var descendingDateSort = _.sortBy(snapShot_one, function(o) { return new moment(o.createdAt); }).reverse();
console.log("Result Descending Date: ", descendingDateSort);

*/
