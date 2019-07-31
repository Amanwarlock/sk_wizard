

var moment = require("moment");


var cachedTimestamp = new Date("2019-06-28T22:05:43.251+05:30");



console.log(`Time stamp to query - `,cachedTimestamp,  moment(cachedTimestamp).format('YYYYMMDDhhmmssSSS'));

console.log(`UNIX Time stamp to query - `,moment(cachedTimestamp).unix() ,moment().unix(cachedTimestamp));


console.log(`Get Time stamp to query - `,cachedTimestamp.getTime());


console.log(`ASP .Net Json Date ...` , moment("/Date(1561742630000+0530)/") , new Date(-1), Date.now());