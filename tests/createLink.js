
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        originPortalGuid: '1e77fae0e9ea49bab0753c40f98dc7d6.12',
        destinationPortalGuid: '1e77fae0e9ea49bab0753c40f98dc7d6.12',
        linkKeyGuid: 'abcabcabc.4',
        location: '033129b8,0098b39b'
    };

    api.api('gameplay/createLink', params, function(err, data) {
        if (err) {
            console.log('error:', err);
            return;
        }

        console.log('got data:', data);
    });


});
