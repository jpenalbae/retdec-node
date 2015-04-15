var http = require('https');
var url = require('url');
var multipart = require('./multipart');


var _cfg = {
    apiKey: '',
    host: 'retdec.com',
    boundary: '------------------------b6e7313f78e3d875'
}


/**
 * Get the output result
 * 
 * @param  {object}   info     object containing api response
 * @param  {Function} callback(err, result)
 */
function getOutput(info, callback)
{
    var output = info.links.output;
    var parsed = url.parse(output);

    var reqopts = {
        host: parsed.hostname,
        path: parsed.path,
        auth: _cfg.apiKey + ':',
    };

    var req = http.get(reqopts, function(res) {

        var body = "";

        res.on('data', function(data) {
            body += data;
        });

        res.on('end', function() {
            callback(0, body);            
        });
    });

    req.on('error', function(e) {
        clearInterval(interval);
        callback(-21, "Error on request");
    });

}


/**
 * Wait till result is complete
 * 
 * @param  {object}   info     object containing api response
 * @param  {Function} callback(err, result)
 */
function getResult(info, callback)
{
    var status = info.links.status;
    var parsed = url.parse(status);

    var reqopts = {
        host: parsed.hostname,
        path: parsed.path,
        auth: _cfg.apiKey + ':',
    };

    /* Check status till finised */
    var interval = setInterval(function() {

        var req = http.get(reqopts, function(res) {

            var body = "";

            res.on('data', function(data) {
                body += data;
            });

            res.on('end', function() {

                try {
                    var json = JSON.parse(body);

                    if (json.finished) {
                        clearInterval(interval);

                        if (json.failed) {
                            callback(-13, json.error);
                            return;
                        }

                        getOutput(info, callback);
                    }

                } catch (e) {
                    clearInterval(interval);
                    callback(-12, "Error parsing response");
                }
                
            });
        });

        req.on('error', function(e) {
            clearInterval(interval);
            callback(-11, "Error on request");
        });

    }, 2000);
}


/**
 * API simple echo test, mostly to verify API key
 * 
 * @param  {object}   echoargs object containing parameters
 * @param  {Function} callback(err, res)
 */
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


/**
 * API get fileInfo
 * 
 * @param  {path}     file     path to the file to be analysed
 * @param  {object}   options  object containing parameters
 * @param  {Function} callback(err, res)
 */
function fileInfo(file, options, callback) {

    var reqopts = {
      host: _cfg.host,
      path: '/service/api/fileinfo/analyses',
      auth: _cfg.apiKey + ':',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + _cfg.boundary,
        'Content-Length': 0
      }
    };
    
    var buf;
    var parameters = [];


    /* Parse parameters */
    if (options !== null) {
        var keys = Object.keys(options);
        keys.forEach(function(key) {
            buf = multipart.addParameter(key, options[key], _cfg.boundary);
            parameters.push(buf);
        });
    }

    /* Add file */
    buf = multipart.addFile('input', file, _cfg.boundary);
    parameters.push(buf);
    if (!Buffer.isBuffer(buf)) {
        callback(-2, 'Error reading input file');
        return;
    }

    /* Add final boundary */
    parameters.push(multipart.end(_cfg.boundary));

    /* Join all the buffers and set content-length */
    buf = Buffer.concat(parameters);
    reqopts.headers['content-length'] = buf.length;


    
    /* Make the request */
    var req = http.request(reqopts, function (response) {
        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            try {
                var json = JSON.parse(body);

                if (json.description)
                    callback(-2, json.description);

                /* Wait for completion */
                getResult(json, callback);
            } catch (e) {
                console.log(body);
                callback(-3, 'Error parsing response: ' + e);
            }
        });
    });

    req.on('error', function (e) {
        callback(-1, 'Error requesting');
    });

    req.write(buf);
    req.end();
}



/* Initial function */
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