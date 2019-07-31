
var moment = require("moment");


let dt = "2018-04-05T18:30:00.000Z";

var currentDate = new Date(dt);

console.log("Test 1 : " , new Date(dt));


console.log("Test 2 : " ,currentDate instanceof Date);


console.log("Test 3 : " ,dt instanceof Date);