const _ = require("lodash");

var mrp = 500;
var fixedPrice = 250; // 50%


function compute(curr_mrp, fixedPrice) {
    let fixedPriceMargin = parseFloat((fixedPrice / mrp * 100).toFixed(4));

    let newFixedPrice = parseFloat((fixedPriceMargin/100 * curr_mrp).toFixed(3));

    console.log(`Fixed Price margin - ${fixedPriceMargin} | New Fixed Price - ${newFixedPrice}`);
}


compute(1000,fixedPrice);


/* 

MRP = 105 , disc = 10% , fixedPrice = 94.5;

MRP = 110 , disc = 10% , fixedPrice = 99;

*/