
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        modResourceGuid: 'abcabcabc.4',
        modableGuid: '1e77fae0e9ea49bab0753c40f98dc7d6.12',
        index: 0,
        location: '033129b8,0098b39b'
    };

    api.api('gameplay/addMod', params, function(err, data) {
        if (err) {
            console.log('error:', err);
            return;
        }

        console.log('got data:', data);
    });


});
