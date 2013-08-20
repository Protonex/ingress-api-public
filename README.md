# ingress-api

## disclaimer

this code is for educational purposes only. using it on production services will probably be against the service's ToS and get you banned.

## wtf?

ingress-api aims to provide a wrapper for the ingress "API".

## usage

    var Api = require('ingress-api');
    var api = new Api();

    api.login('username', 'password', function(err, handshake) {
        if (err) {
            console.log('error logging in:', err);
            process.exit(1);
        }

        console.log('logged in. result:', handshake);

        api.api('playerUndecorated/getInventory', {}, function(err, data) {
            if (err) {
                console.log('error getting inventory:', err);
                return;
            }
            console.log(data);
        });
    });

