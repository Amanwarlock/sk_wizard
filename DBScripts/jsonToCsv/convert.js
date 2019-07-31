var fs = require("fs");
var jsonexport = require('jsonexport');
var moment = require("moment");
var path = require("path");
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });
var data = require("./data");

//moment(new Date()).format("DD/MM/YYYY hh:mm:ss A")

function generateFile(data) {
    let payload = [];
    data.map(d => payload.push(d));
    jsonexport(payload, function (err, csv) {
        if (csv) {
            _path = path.join(__dirname, `parsed.csv`);
            console.log(chalker.yellow("CSV created successfully...", _path));
            fs.writeFileSync(_path, csv);
        }
    });
}


generateFile(data);