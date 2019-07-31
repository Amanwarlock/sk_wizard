var _ = require("lodash");
var async = require("async");
var path = require("path");
var fs = require("fs");
var jsonexport = require('jsonexport');
var csvToJson = require('csvjson');
var chalk = require('chalk');
var chalker = new chalk.constructor({ enabled: true, level: 1 });

// 1#.
const PDFParser = require("pdf2json");
const pdfParser = new PDFParser();

//2#.
const pdfreader = require("pdfreader");


function pdfToJson(filePath) {

    console.log("Started----------------")

    let isAbsolute = isAbsolutePath(filePath);
    var sourcePath = !isAbsolute ? path.join(__dirname, filePath) : filePath;

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log(JSON.stringify(pdfData));
        // fs.writeFile("./F1040EZ.json", JSON.stringify(pdfData));
        // jsonToCSV(pdfData,'pgi_parsed.csv');
    });

   // pdfParser.loadPDF(sourcePath); //"./pdf2json/test/pdf/fd/form/F1040EZ.pdf";


    new pdfreader.PdfReader().parseFileItems(sourcePath, function(err, item) {
        if (err)  console.log(err);
        else if (!item) console.log("Item not found");
        else if (item.text) console.log("Item ----------------",JSON.stringify(item.text));
      });


}


//pdfToJson("./");


function fromCSVToJson(filepath) {
    return function (callback) {

        var options = {
            delimiter: ',', // optional
            quote: '"' // optional
        };

        //product
        var data = fs.readFileSync(path.join(__dirname, filepath), { encoding: 'utf8' });
        var json = csvToJson.toObject(data, options);

        callback(null, json);
    }
}


function jsonToCSV(payload, fileName) {
    jsonexport(payload, function (err, csv) {
        if (csv) {
            let _path = path.join(__dirname, fileName)
            console.log(chalker.yellow("CSV created successfully...", _path));
            fs.writeFileSync(_path, csv);
        }
    });
}


function checkFolder(path) {
    //var path = `${__dirname}/${folder}`;
    var isExist = fs.existsSync(path)
    if (!isExist) {
        console.log("Creating folder");
        fs.mkdirSync(path);
    } else {
        //console.log("Folder already there ..skipping..");
    }
}


function isAbsolutePath(sourcePath) {

    var dirPathArr = __dirname.split("/").filter(Boolean);
    var sourcePathArr = sourcePath.split("/").filter(Boolean);

    var difference = _.difference(dirPathArr, sourcePathArr);
    var common = _.intersection(sourcePathArr, dirPathArr);

    var dirPath = common.concat(_.intersection(difference, dirPathArr));

    return difference && difference.length === dirPathArr.length ? false : true;
}


/*
try {
        var isAbsolute = isAbsolutePath(filePath);
        var sourcePath = !isAbsolute ? path.join(__dirname, filePath) : filePath;
        var file = filePath ? fs.readFileSync(sourcePath) : data;
        var json = jsyaml.safeLoad(file, { encoding: 'utf-8' });
        json = strict ? JSON.parse(json) : json;
        return json;
    } catch (e) {
        logger.error("Error occured while parsing yaml to json ", e.message);
    }

*/

module.exports = {
    pdfToJson: pdfToJson,
}