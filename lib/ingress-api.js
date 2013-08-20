
var https = require('https'),
    fs = require('fs'),
    util = require('util'),
    Auth = require('./auth');

var methodParams = {}; // will be filled from contents in api/methods/*/*.json

var httpsOptions = {
    path: '/rpc',
    hostname: 'm-dot-betaspike.appspot.com',
    port: 443,
    headers: {
        'User-Agent': 'Nemesis (gzip)',
        'Host': 'm-dot-betaspike.appspot.com',
        'Connection': 'Keep-Alive',
    }
};

https.globalAgent.maxSockets = 1000;

var Api = function(options) {
    this.loggedIn = false;
	this.httpsOptions = httpsOptions;
	this.readMethods();
}
module.exports = Api;

Api.prototype.login = function(email, password, callback) {
    var auth = new Auth(email, password);
    auth.on('authSuccess', function(data) {
        this.httpsOptions['headers']['Cookie'] = 'SACSID='+ data.sacsid;
        this.httpsOptions['headers']['X-XsrfToken'] = data.handshake.result.xsrfToken;
        this.loggedIn = true;
        callback(null, data);
    }.bind(this));
    auth.on('error', function(err) {
        callback(err, null);
    });
}

Api.prototype.readMethods = function() {
	var base = __dirname + '/methods';
	fs.readdirSync(base).forEach(function(path) {
		var entry = base +'/'+ path;
		if (! fs.statSync(entry).isDirectory()) return;

		fs.readdirSync(entry).forEach(function(method) {
			if (method.match(/\.json$/)) {
				methodParams[path+'/'+(method.split('.'))[0]] = JSON.parse(fs.readFileSync(entry +'/'+ method));
			}
		});
	});
};

Api.prototype.request = function(method, params, callback) {
	var callOptions = JSON.parse(JSON.stringify(this.httpsOptions)); // deep object copy - todo: beautify this.

	callOptions['path'] += '/' + method;
	callOptions['method'] = methodParams[method].httpMethod;

	var request = https.request(callOptions, function(response) {
		var buffer = '';
		response.setEncoding('utf8');
		if (typeof response.headers["set-cookie"] !== "undefined") {
			this.setCookie(response.headers["set-cookie"][0].split(";")[0]);
		}
		response.on('data', function(chunk) { buffer += chunk });
		response.on('end', function(chunk) {
			var data = null;
			if (chunk) buffer += chunk;
			try {
				data = JSON.parse(buffer);
			} catch (e) {
				callback(e, buffer);
				return;
			}
			callback(null, data);
		});
	}.bind(this));

	request.on('error', function(err) {
		callback(err);
	});

	var sendBuffer = JSON.stringify({params:params});

	request.write(sendBuffer);
	request.end();
}

Api.prototype.setProxy = function (proxy) {
	// todo beautify this.
	if (!proxy.https) {
		https = require('http');
	}
	httpsOptions.path = "https://" + httpsOptions.hostname + ":" + httpsOptions.port + httpsOptions.path;
	httpsOptions.hostname = proxy.host;
	httpsOptions.port = proxy.port;
};

Api.prototype.setCookie = function (cookie) {
	this.httpsOptions['headers']['Cookie'] = cookie;
};

Api.prototype.api = function(method, params, callback) {
	if (null === this.auth) {
		callback('not authenticated.');
		return;
	}

	if (typeof methodParams[method] !== 'object') {
		callback('method not found.');
		return;
	}

	try {
		params = this.parseParams(method, params);
	} catch (e) {
		callback(e);
		return;
	}

	this.request(method, params, callback);
}

Api.prototype.parseParams = function(method, params) {
	var newParams = JSON.parse(JSON.stringify(methodParams[method].default));

	// for some methods, "params" is an array, where we only check
	// "allowEmptyParams" for (true|false), and take the whole params passed
	// to this function as the value for "params", ...
	if (util.isArray(methodParams[method].default)) {
		if (! util.isArray(params)) {
			throw new Error('params must be an array.');
		}

		if (methodParams[method].allowEmptyParams !== true) {
			if (params.length < 1) {
				throw new Error('params cannot be empty.');
			}
		}

		params.forEach(function(value) {
			newParams.push(value);
		});
	}

	// ... for other methods, params is an object, where we check
	// if all mandatory values are set.
	else {

		methodParams[method].required.forEach(function(param) {
			if (typeof params[param] === 'undefined') {
				throw new Error('param "'+ param +'" is required.');
			}
		});

		Object.keys(params).forEach(function (param) {
			newParams[param] = params[param];
		});
	}

	return newParams;
}

// 1;
