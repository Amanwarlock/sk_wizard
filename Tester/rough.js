var moment = require("moment");
var _ = require("lodash");


var shippedOn = '13/7/19';


var convertToDateData = (data) => {
    let inputDate = data;
    if (!_.isEmpty(data)) {
        data = new Date(data.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
        data = moment(data).format();
      
        if(data === 'Invalid date'){
            console.log("Is valid : ",  data,isNaN(data) , data);
            var d = inputDate.split("/");
            d = `${d[1]}/${d[0]}/${d[2]}`;
            console.log('Converted ', d);
            data = new Date(d.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"));
            data = moment(data).format();
        }

    }
    return new Date(data);
};

console.log('Date : ' , convertToDateData(shippedOn));