var http = require('https');

var _cfg = {
    apiKey: "",
    host: "retdec.com"
}


function test(echoargs, callback) {

    var reqopts = {
      host: _cfg.host,
      path: '/service/api/test/echo?',
      auth: _cfg.apiKey + ':',
      method: 'GET'
    };

    /* Parse echoargs */
    var keys = Object.keys(echoargs);
    keys.forEach(function(key) {
        reqopts.path += key + '=' + echoargs[key] + '&';
    });
    
    /* Do the request */
    var req = http.request(reqopts, function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            if (response.statusCode !== 200) {
                callback(-2, 'Bad HTTP response: ' + response.statusCode);
            } else {
                try {
                    var json = JSON.parse(body);
                    callback(0, json);
                } catch (e) {
                    callback(-3, 'Error parsing JSON: ' + e);
                }
            }
        });
    });
    
    req.on('error', function (e) {
        callback(-1, 'Error requesting');
    });
    
    req.end();
}


function decompile() {

}

function fileInfo() {

}


function apiKey(key) {
    _cfg.apiKey = key;

    var api = {
        test: test,
        decompile: decompile,
        fileInfo: fileInfo
    };

    return api;
}


module.exports.apiKey = apiKey;