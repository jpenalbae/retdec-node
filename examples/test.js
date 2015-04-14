var retdec = require('./../').apiKey('asdasdasdasd');


var testing = {
    hola: 'ojete',
    dos: 2
};

retdec.test(testing, function(err, res) {
    if (err) {
        console.log('Error: ' + res);
        return;
    }

    console.log(res);
});
