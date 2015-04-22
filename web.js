var http = require('http');
var https = require('https');


function request(opts, protocol, data, callback)
{
    var proto = (protocol === 'https') ? https : http;

    /* Make the request */
    var req = proto.request(opts, function (response) {
        var chunks = [];

        response.on('data', function (chunk) {
            chunks.push(chunk);
        });

        response.on('end', function () {
            var buf = Buffer.concat(chunks);
            callback(0, buf, response.statusCode);
        });
    });

    req.on('error', function (e) {
        callback(-1, 'Error requesting: ' + e);
    });

    if (data !== null)
        req.write(data);

    req.end();

}

module.exports.request = request;