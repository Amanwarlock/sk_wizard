db.fulfillmentcenters.find({}).forEach(fc => {

    printjson({ whId: fc.whId });

    let franchise = db.franchises.findOne({ "sk_franchise_details.franchise_type": "WMF", _id: fc.whId });

    printjson({'msg' : 'Franchise',  _id: franchise._id});

    fc.isSkWarehouse = true;

    franchise.is_skWarehouse = true;

    var newConfig = [];

    fc.fcConfig.forEach(c => {

        if (!c.state) c.state = "All States";

        if (!c.town) c.town = "All Towns";

        if (!c.district) c.district = "All Districts";

        newConfig.push({
            "level": "sdt",
            "state": c.state,
            "town": c.town,
            "district": c.district,
            "franchise": "All RF"
        }, {
                "level": "sdt",
                "state": c.state,
                "town": c.town,
                "district": c.district,
                "franchise": "All RMF"
            })
    });

    printjson({ newConfig: newConfig });

    fc.fcConfig = newConfig;

    franchise.serviceArea = newConfig;

    db.fulfillmentcenters.save(fc);

    db.franchises.save(franchise);
})



/*

mongodump --db skstaging --collection fulfillmentcenters -u skaman -p Am@N@sk$2019 -h 35.154.220.245 -o /home/aman/Desktop/wm_db_backup

mongodump --db skstaging --collection franchises --query '{"sk_franchise_details.franchise_type" : "WMF" }' -u skaman -p Am@N@sk$2019 -h 35.154.220.245 -o /home/aman/Desktop/wm_db_backup

--------------------------------
mongodump --db skstaging --collection fulfillmentcenters -u skaman -p Am@N@sk$2019 -h localhost --port 6161  -o /home/aman/Desktop/wm_db_backup


*/



/*
FRANCHISE SCHEMA:
serviceArea: [{
        level: { type: String, enum: ["sdt", "RMF", "RF", "category"] },
        subType: { type: String },
        state: { type: String },
        district: { type: String },
        town: { type: String },
        franchise: { type: String }, // All RMF , All RF
        categoryIds: [{
            type: String
        }],
    }],


fcConfig: [
        {
            level: { type: String, enum: ["sdt", "RMF", "RF", "category"] },
            subType: {type: String},
            state: { type: String },
            district: { type: String, default: "All Districts" },
            town: { type: String, default: "All Towns" },
            franchise: {type : String}, // All RMF  , All RF
            categoryIds: [{ type: String, default: "All Categories" }],

        }
    ],


 * /