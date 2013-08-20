var url          = require('url'),
    util         = require('util'),
    http         = require('http'),
    https        = require('https'),
    Stream       = require('stream'),
    querystring  = require('querystring'),
    EventEmitter = require('events').EventEmitter;


const clientLoginURL    = 'https://www.google.com:443/accounts/ClientLogin';
const betaspikeURL      = 'https://m-dot-betaspike.appspot.com:443';
const appEngineAuthURL  = betaspikeURL + '/_ah/login?auth=';
const handshakeURL      = betaspikeURL + '/handshake?json=';
const source            = 'm-dot-betaspike';
const service           = 'ah';
const defNemesisVersion = '2013-06-07T16:49:41Z 63e36378f5e8 opt';
const defAndroidVersion = '4.2.2';


function Auth(email, password, nemesisVersion, androidVersion) {
    Stream.Stream.call(this);

    this.nemesisVersion = nemesisVersion || defNemesisVersion;
    this.androidVersion = androidVersion || defAndroidVersion;

    this.data = {
        Email: email,
        Passwd: password,
        accountType: this.determineAccountType(email),
        source: source,
        service: service
    };

    this.getAuthToken();
}

util.inherits(Auth, Stream.Stream);
module.exports = Auth;



Auth.prototype.determineAccountType = function (email) {
    var domain  = email.match(/@([^.]*)/)[1];
    var isGmail = domain === 'gmail' ||
                  domain === 'googlemail';
    return isGmail ? 'GOOGLE' : 'HOSTED';
};

Auth.prototype.getAuthToken = function () {
    var urldata = url.parse(clientLoginURL);
    var options = {
        data: this.data,
        hostname: urldata.hostname,
        port: urldata.port,
        path: urldata.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    this._request(options, this.handleClientLogin.bind(this));
};

Auth.prototype.getSACSID = function () {
    var urldata = url.parse(appEngineAuthURL),
        options = {
            hostname: urldata.hostname,
            port: urldata.port,
            path: urldata.path + this.auth,
            method: 'GET'
        };
    this._request(options, this.handleSACSID.bind(this));
};

Auth.prototype.doHandshake = function () {
    var urldata = url.parse(handshakeURL),
        handshake = {
            nemesisSoftwareVersion: this.nemesisVersion,
            deviceSoftwareVersion: this.androidVersion
        },
        options = {
            hostname: urldata.hostname,
            port: urldata.port,
            path: urldata.path + JSON.stringify(handshake),
            method: 'GET',
            headers: {
                'Cookie': 'SACSID=' + this.sacsid
            }
        };
    this._request(options, this.handleHandshake.bind(this));
};

Auth.prototype.handleClientLogin = function (error, headers, data) {
    if (error !== null) {
        this.emit('error', error);
        return;
    }
    var auth = data.match(/Auth=([^\n]+)/);
    if (typeof auth[1] === 'string') {
        this.auth = auth[1];
        this.getSACSID();
    }
};

Auth.prototype.handleSACSID = function (error, headers, data) {
    if (error !== null) {
        this.emit('error', error);
        return;
    }
    var cookie = headers['set-cookie'];
    if (typeof cookie[0] === 'string') {
        this.sacsid = cookie[0].match(/SACSID=([^;]+)/)[1];
        if (typeof this.sacsid === 'string') {
            this.doHandshake();
        }
    }
};

Auth.prototype.handleHandshake = function (error, headers, data) {
    if (error !== null) {
        this.emit('error', error);
        return;
    }
    if (data.substr(0, 9) === 'while(1);') {
        this.handshake = JSON.parse(data.substr(9));
        this.emit('authSuccess', {
            sacsid: this.sacsid,
            handshake: this.handshake
        });
    }
};

Auth.prototype._request = function (options, callback) {
    var proto = options.protocol === 'http:' ? http : https,
        data  = querystring.stringify(options.data),
        req   = null,
        body  = '',
        opts  = {
            method:   options.method || 'GET',
            hostname: options.hostname,
            path:     options.path || '/'
        };

    if (options.port)    {
        opts.port = options.port;
    }
    if (options.headers) {
        opts.headers = options.headers;
        if (options.data) {
            opts.headers['Content-Length'] = data.length;
        }
    }

    req = proto.request(opts, function (res) {
        res.setEncoding('utf-8');
        res.on('data', function (data) { body += data; });
        res.on('end', function () { callback(null, res.headers, body); });
    });
    req.on('error', function (error) { callback(error, null, null); })

    if (options.data) {
        req.write(data);
    }
    req.end();
};
