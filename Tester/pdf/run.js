var _ = require("lodash");
var async = require("async");
var path = require("path");
var fs = require("fs");
var jsonexport = require('jsonexport');
var csvToJson = require('csvjson');
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });

const parser = require("./parser");

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/* 
(function init() {
    rl.question(chalker.green.bold(`Enter File Path  : `, answer => {
        parser.pdfToJson(answer);
    }));
})();
 */

function init() {
    console.log("Running---------------------");
    /* rl.question(chalker.green.bold(`Enter File Path  : `, answer => {
        parser.pdfToJson(answer);
    })); */

    rl.question('Enter File Path  : ', (answer) => {
        // TODO: Log the answer in a database
        console.log(`Thank you ....: ${answer}`);
        parser.pdfToJson(answer);
    });
}

init();