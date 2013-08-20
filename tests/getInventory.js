
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    api.api('playerUndecorated/getInventory', {}, function(err, data) {
        if (err) console.log(err);
        else {
            console.log(data);
        }
    });


});
