
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        message: 'test',
        factionOnly: true
    };

    api.api('player/say', params, function(err, data) {
        if (err) {
            console.log('error:', err);
            return;
        }

        console.log('got data:', data);
    });


});
