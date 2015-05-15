var http = require('https');
var url = require('url');

var web = require('./web');
var multipart = require('./multipart');


var _cfg = {
    apiKey: '',
    host: 'retdec.com',
    decompiler: [
        'https://retdec.com/service/api/decompiler/decompilations/',
        '/outputs/hll'
    ],
    boundary: '------------------------b6e7313f78e3d875'
};


/**
 * Wait till result is complete
 * 
 * @param  {object}   info     object containing api response
 * @param  {Function} callback(err, result)
 */
function waitForCompletion(info, callback)
{
    var status = info.links.status;
    var parsed = url.parse(status);

    var reqopts = {
        host: parsed.hostname,
        path: parsed.path,
        auth: _cfg.apiKey + ':',
    };

    /* Check status till finised */
    web.request(reqopts, 'https', null, function(err, body, code) {
        var json;

        if (err) {
            callback(err, body);
            return;
        }

        try {
            json = JSON.parse(body);
        } catch (e) {
            callback(-12, 'Error parsing response (' + e + ')');
            return;
        }

        if (json.finished) {
            if (json.failed) {
                callback(-13, json.error);
                return;
            }

            callback(0, 'done');
            return;
        }

        /* Wait one second and check again */
        setTimeout(function() {
            waitForCompletion(info, callback);
        }, 1000);
    });
}


/**
 * API simple echo test, mostly to verify API key
 * 
 * @param  {object}   echoargs object containing parameters
 * @param  {Function} callback(err, res)
 */
function test(echoargs, callback)
{
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

    web.request(reqopts, 'https', null, function(err, body, code) {
        var json;

        if (err) {
            callback(err, body);
            return;
        }

        if (code !== 200) {
            callback(-2, 'Bad HTTP response: ' + code);
        } else {
            try {
                json = JSON.parse(body);
            } catch (e) {
                callback(-3, 'Error parsing JSON: ' + e);
                return;
            }
            callback(0, json);
        }
    });
}


function fetchOutputs(info, callback)
{
    var results = {};
    var pending = 0;

    var keys = Object.keys(info);
    keys.forEach(function(key) {

        if (typeof info[key] === 'object') {

            /* Check for empty objects */
            if (Object.keys(info[key]).length <= 0)
                return;

            pending++;
            fetchOutputs(info[key], function(res) {
                pending--;
                results[key] = res;

                if (pending === 0)
                    callback(results);
            });

        } else if (info[key].indexOf('https://') !== -1) {
            pending++;

            var newUrl = url.parse(info[key]);
            var newReq = {
                host: newUrl.hostname,
                path: newUrl.path,
                auth: _cfg.apiKey + ':',
            };

            web.request(newReq, 'https', null, function(err, body, code) {
                pending--;
                results[key] = body;

                if (pending === 0)
                    callback(results);
            });
        }
    });
}


function fetchDecompilationResults(info, callback)
{
    var output = info.links.outputs;
    var parsed = url.parse(output);

    var reqopts = {
        host: parsed.hostname,
        path: parsed.path,
        auth: _cfg.apiKey + ':',
    };

    web.request(reqopts, 'https', null, function(err, body, code) {
        var json;

        if (err) {
            callback(err, body);
            return;
        }

        try {
            json = JSON.parse(body);
        } catch (e) {
            callback(-5, 'Error parsing JSON: ' + e);
            return;
        }

        /* Get every output */
        fetchOutputs(json.links, function(result) {
            callback(0, result);
        });

    });

}



function decompile(file, mode, options, callback)
{
    var reqopts = {
        host: _cfg.host,
        path: '/service/api/decompiler/decompilations',
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


    /* Set decompilation mode */
    buf = multipart.addParameter('mode', mode, _cfg.boundary);
    parameters.push(buf);

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
    web.request(reqopts, 'https', buf, function(err, body, code) {
        var json;

        if (err) {
            callback(err, body);
            return;
        }

        try {
            json = JSON.parse(body);
        } catch (e) {
            callback(-3, 'Error parsing response: ' + e);
            return;
        }

        if (json.description) {
            callback(-2, json.description);
            return;
        }

        /* Wait for completion */
        waitForCompletion(json, function(err, message) {
            if (err) {
                callback(-61, message);
                return;
            }

            fetchDecompilationResults(json, callback);
        });
    });
}


/**
 * API get fileInfo
 * 
 * @param  {path}     file     path to the file to be analysed
 * @param  {object}   options  object containing parameters
 * @param  {Function} callback(err, res)
 */
function fileInfo(file, options, callback)
{
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


    web.request(reqopts, 'https', buf, function(err, body, code) {
        var json;

        if (err) {
            callback(err, body);
            return;
        }

        try {
            json = JSON.parse(body);
        } catch (e) {
            callback(-3, 'Error parsing response: ' + e);
            return;
        }

        if (json.description)
            callback(-2, json.description);

        /* Wait for completion & fetch output */
        waitForCompletion(json, function(err, message) {
            if (err) {
                callback(-61, message);
                return;
            }

            /* Fetch output */
            var newUrl = url.parse(json.links.output);
            var newReq = {
                    host: newUrl.hostname,
                    path: newUrl.path,
                    auth: _cfg.apiKey + ':',
                };

            web.request(newReq, 'https', null, callback);
        });
    });
}



/* Initial function */
function apiKey(key)
{
    _cfg.apiKey = key;

    var api = {
        test: test,
        decompile: decompile,
        fileInfo: fileInfo
    };

    return api;
}


module.exports.apiKey = apiKey;
