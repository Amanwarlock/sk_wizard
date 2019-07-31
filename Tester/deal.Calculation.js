


function b2bDiscount(mrp , b2bPrice){
    return parseFloat(((b2bPrice / mrp) * 100).toFixed(2));
}

function b2bPrice(b2bDiscount , mrp){
    return parseFloat(((b2bDiscount * mrp)/100).toFixed(2));
}


var b2bDiscount = b2bDiscount(35,34.91);
console.log("B2B Discount : ----------" ,b2bDiscount );


var b2bPrice = b2bPrice(99.74,35);
console.log("B2B Price : ----------" ,b2bPrice );