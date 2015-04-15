var retdec = require('./../').apiKey('YOUR_KEY_HERE');


var testing = {
    hola: 'ojete',
    dos: 2
};


retdec.test(testing, function(err, res) {
    if (err) {
        console.log('Error test: ' + res);
        return;
    }

    console.log('test');
    console.log(res);
});


retdec.fileInfo('/bin/ls', { verbose: true } , function(err, res) {
    if (err) {
        console.log('Error (' + err + '): ' + res);
        return;
    }

    console.log('File info');
    console.log(res);
});
