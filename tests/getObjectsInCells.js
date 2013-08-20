
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        "cellsAsHex": ["47b8cbce10000000", "47b8cbcf10000000", "47b8cbcc10000000", "47b8cbced0000000", "47b8cbcfd0000000", "47b8cbcdd0000000", "47b8cbce90000000", "47b8cbcf90000000", "47b8cbcd90000000", "47b8cbd1d0000000", "47b8cbce50000000", "47b8cbcf50000000", "47b8cbcc50000000", "47b8cbd210000000", "47b8cbce30000000", "47b8cbcf30000000", "47b8cbcc30000000", "47b8cbcef0000000", "47b8cbcff0000000", "47b8cbcdf0000000", "47b8cbd1f0000000", "47b8cbceb0000000", "47b8cbcfb0000000", "47b8cbcdb0000000", "47b8cbd030000000", "47b8cbce70000000", "47b8cbcf70000000", "47b8cbcc70000000"],
        "dates": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        "playerLocation": "030d8ebc,0067eb1e"
    };

    api.api('gameplay/getObjectsInCells', params, function(err, data) {
        if (err) {
            console.log('error:', err);
            return;
        }

        data.gameBasket.gameEntities.forEach(function(item) {
            if (! item[0].match(/\.12$/)) return;

            console.log(item[0]);
            console.log(item[2].portalV2.descriptiveText.TITLE);
            console.log(item[2].locationE6);
        });

    });


});

