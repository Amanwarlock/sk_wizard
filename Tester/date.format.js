
var _ = require("lodash");
var moment = require("moment");

var convertToDateData = (data) => {
    if (!_.isEmpty(data)) {
        data = new Date(data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        data = moment(data).format();
    }
    return data;
};



console.log('DATE: ' , new Date(convertToDateData('22/05/2015')));