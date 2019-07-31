var moment = require("moment");

function getDifferenceInHours(date1, date2) {

    console.log(`Date 1 : ${date1} | Date 2 : ${date2}`);

    date1 = new Date(date1);

    date2 = new Date(date2);

    var diff1 = Math.abs(date1.getTime() - date2.getTime()) / 3600000;


    var diff2 = (date1 - date2) / 3600000;

    console.log(`result 1 : ${diff1}  | result 2 : ${diff2}`);
}



var dt1 = new Date().toISOString();

var dt2 = parseInt("-1")//new Date(2019, 5, 27, 21, 0, 0);

getDifferenceInHours(dt1, dt2);



//console.log(moment("20190628120947097").format("DD/MM/YYYY hh:mm:ss A"));

console.log(moment("/Date(20190628120947097)/"));