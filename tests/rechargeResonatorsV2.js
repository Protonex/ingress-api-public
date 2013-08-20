
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        "location": "033122a3,00988184",
        "portalGuid": "55215c0dc42249ce894d2b5af3654807.12",
        "resonatorSlots": [0, 1, 2, 3, 4, 5, 6, 7]
    };

    api.api('gameplay/rechargeResonatorsV2', params, function(err, data) {
        if (err) console.log(err);
        else {
            console.log(data);
            console.log(JSON.stringify(data));
        }
    });


});
