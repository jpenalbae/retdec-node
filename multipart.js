var fs = require('fs');



/**
 * Adds a parameter to the request
 * 
 * @param  {string} key      Parameter name
 * @param  {string} value    Parameter value
 * @param  {string} boundary Boundary used to separate parameters
 * @return {Buffer}          Buffer containing the data
 */
function addParameter(key, value, boundary)
{
    var data;

    data = '--' + boundary + "\r\n";
    data += 'Content-Disposition: form-data; name="' + key + '"\r\n\r\n';
    data += value + '\r\n'

    return new Buffer(data);
}


/**
 * Adds a file into the request
 * 
 * @param  {string} key      Parameter name
 * @param  {string} file     Filename path
 * @param  {string} boundary Boundary used to separate parameters
 * @return {Buffer}          Buffer containing the data
 */
function addFile(key, file, boundary)
{
    var data;
    var chunks = [];

    var tmp = file.split('/');
    var filename = tmp[tmp.length-1];

    data = '--' + boundary + "\r\n";
    data += 'Content-Disposition: form-data; name="' + key + '"; ';
    data += 'filename="' + filename + '"\r\n';
    data += 'Content-Type: application/octet-stream\r\n\r\n'
    chunks.push(new Buffer(data));

    /* Read the file */
    var fileData = fs.readFileSync(file);
    if (Buffer.isBuffer(fileData))
        chunks.push(new Buffer(fileData));
    else
        return -1;

    chunks.push(new Buffer('\r\n'));

    return Buffer.concat(chunks);
}


/**
 * Adds closing boundary
 * 
 * @param  {string} boundary Boundary used to separate parameters
 * @return {Buffer}          Buffer containing the data
 */
function end(boundary)
{
    return new Buffer('--' + boundary + '--\r\n');
}


module.exports.addParameter = addParameter;
module.exports.addFile = addFile;
module.exports.end = end;
