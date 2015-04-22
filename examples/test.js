var retdec = require('./../').apiKey('YOUR_API_KEY_HERE');
var fs = require('fs');


var testing = {
    hola: 'adios',
    dos: 2
};



/*
retdec.test(testing, function(err, res) {
    if (err) {
        console.log('Error test: ' + res);
        return;
    }

    console.log('test');
    console.log(res);
});*/



retdec.fileInfo('/bin/ls', { verbose: true } , function(err, res) {
    if (err) {
        console.log('Error (' + err + '): ' + res);
        return;
    }

    console.log('File info: ' + res);
});


/*
var options = {
    generate_cg: 'yes',
    generate_cfgs: 'yes',
    generate_archive: 'yes'
}

retdec.decompile(process.argv[2], 'bin', options, function(err, res) {
    if (err) {
        console.log('Error (' + err + '): ' + res);
        return;
    }

    console.log(res);

    fs.writeFileSync('/tmp/cg.png', res.cg);
    fs.writeFileSync('/tmp/cg.zip', res.archive);

    //console.log(JSON.stringify(res, null, ' '));
});
*/
