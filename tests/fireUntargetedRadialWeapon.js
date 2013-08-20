
var API = require('../lib/ingress-api'),
    fs = require('fs'),
    credentials = fs.readFileSync(".credentials.txt").toString("utf8").split(" "),
    api = new API();



api.login(credentials[0], credentials[1], function (err, data) {


    var params = {
        playerLocation: '033129b8,0098b39b',
        itemGuid: 'abcabcabc.4'
    };

    api.api('gameplay/fireUntargetedRadialWeapon', params, function(err, data) {
        if (err) console.log('error firing burster '+ item[0] +'. (', err, ')');
        else {
            var resonatorsDamaged = data.result.damages.length,
                damageTotal = 0;

            data.result.damages.forEach(function(item) {
                damageTotal += Number(item.damageAmount);
            });

            console.log('BÄMS!!! '+ guid +' made '+ damageTotal +' on '+ resonatorsDamaged +' resonators.');
        }
    });


});
