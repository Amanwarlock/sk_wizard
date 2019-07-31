var _ = require("lodash");
var moment = require("moment");


let list = ["sku",null,null];


console.log("Result : ---------" , list.filter(Boolean));

var dt = new Date();

var d = moment(new Date())

console.log("Time and Date : ", `Day : ${dt.getDay()} month: ${dt.getMonth()} year: ${dt.getFullYear()}` );


console.log("Time and Date  Moment: ", `Day : ${d.date()} month: ${d.month()} year: ${d.year()}` ,  dt.constructor.name );


