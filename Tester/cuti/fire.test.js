
const cuti = require("cuti");
var puttu = require("puttu-redis");
puttu.connect();
const http = require('http');
const _ = require("lodash");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });
var KeepAliveAgent = require('agentkeepalive');

var myagent = new KeepAliveAgent({
    maxSockets: 1,
    maxKeepAliveRequests: 0,
    maxKeepAliveTime: 500
});


let path = `/WMF4/stockdetBySerialOrBarcode?serial=barcode&barcode=HAIR&performaId=PR379587&select=productId&pids=PR11053&options=${encodeURIComponent(JSON.stringify({"isSkWarehouse":false,"productIds":["PR11053"],"grnIds":["GRN721"],"stockMovementIds":[]}))}`;

/* 
cuti.request.fireHttpRequest('wh', path, 'GET', null, null).then(result => {
    console.log(chalker.blue.bold(`[fireHttpRequest - ${new Date().toString()}] - Firing HTTP using fireHttpRequest method ..............`));
    console.log("RESULT ", result);
}).catch(e => {
    console.error(chalker.red.bold(`[fireHttpRequest - ${new Date().toString()}] - ERROR from  fireHttpRequest : `, e));
}) ;
 */

cuti.request.getUrlandMagicKey('wh').then(options => {
    console.log(`[CUTI - ${new Date().toString()}] - Firing Http request using cuti.............`);
    options.method = "GET";
    options.path += `/WMF4/stockdetBySerialOrBarcode?serial=barcode&barcode=HAIR&performaId=PR379587&select=productId&pids=PR11053&options=${encodeURIComponent(JSON.stringify({"isSkWarehouse":false,"productIds":["PR11053"],"grnIds":["GRN721"],"stockMovementIds":[]}))}`;

    var request = http.request(options, response => {
        var data = "";
        response.on("data", _data => data += _data.toString());
        response.on("end", () => {
            if (response.statusCode === 200) {
                try {
                    data = JSON.parse(data);
                    console.log("RESULT ", data);
                } catch (e) {
                    reject(e);
                }
            } else {
                console.error("[CUTI] - ERROR from cuti ", e);
            }
        });
    });
    //request.emit('error', createHangUpError());
    //request.setTimeout(1);
})



function createHangUpError() {
    var error = new Error('socket hang up');
    error.code = 'ECONNRESET';
    return error;
  }





  
/*
https://stackoverflow.com/questions/16995184/nodejs-what-does-socket-hang-up-actually-mean
https://stackoverflow.com/questions/16995184/nodejs-what-does-socket-hang-up-actually-mean

req.emit('error', createHangUpError());

...

function createHangUpError() {
  var error = new Error('socket hang up');
  error.code = 'ECONNRESET';
  return error;
}


var KeepAliveAgent = require('agentkeepalive');

var myagent = new KeepAliveAgent({
    maxSockets: 10,
    maxKeepAliveRequests: 0,
    maxKeepAliveTime: 240000
});

nano = new Nano({
    url : uri,
    requestDefaults : {
        agent : myagent
    }
});

*/