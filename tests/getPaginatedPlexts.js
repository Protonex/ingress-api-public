
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        'cellsAsHex': ["47b17c0000000000", "47b1900000000000", "47b1eb5500000000", "47b1ed0000000000", "47b1f40000000000", "47b21fc000000000", "47b2240000000000", "47b22c0000000000"],
    };

    api.api('playerUndecorated/getPaginatedPlexts', params, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            data.result.forEach(function(row) {
                console.log(row[2].plext);
            });
        }
    });


});
