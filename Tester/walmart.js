var wmfIntergration = require("wmfintegration");
wmfIntergration = new wmfIntergration();
wmfIntergration.init({ 'PROD_ENV': true }, null);


/* 
USER ID
11734100015569049 - gova
11734100017575556 - vijay

*/

const fc = {
    "_id": "FC3",
    "whId": "WMF4",
    "name": "Walmart Consolidated",
    "state": "Karnataka",
    "district": "Bangalore",
    "pincode": 560036,
    "partner": {
        "locationId": "248",
        "integrationKey": "walmart",
        "locationCode": "4342",
        "billStateCode": "UP",
        "billCityCode": "1",
        "billZip": "282007",
        "vendor": "V0",
        "partnerName": "Walmart",
        "bankName": "Kotak",
        "bankInstrumentNumber": "2689666",
        "paymentType": "Credit",
        "paymentOption": "BankGuarantee",
        "gatewayId": 44,
        "shipmentType": "Door Step Delievery",
        "shipmentMode": 362,
        "autoAuthorize": true
    }
}

// #.LOGIN
wmfIntergration.login(fc).then(token => {
    console.log("Login : \n", token , "\n");
}).catch(e => console.error("Error Occured on Login: \n", e , "\n"));

// #.START SESSION
wmfIntergration.startSession(fc).then(token => {
    console.log("Start Session : \n", token , "\n");
}).catch(e => console.error("Error Occured on Start Session : \n", e , "\n"));

// #.ACCESS TOKEN
wmfIntergration.accessToken(fc).then(token => {
    console.log("Access Token : \n", token , "\n");
}).catch(e => console.error("Error Occured  Access Token : \n", e , "\n"));