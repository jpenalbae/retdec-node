# retdec-node
Node.js npm module providing easy access to the retdec.com decompilation service through their REST API.

Retdec is decompiler that can be utilized for source code recovery, static malware analysis, etc. The decompiler is supposed to be not bounded to any particular target architecture, operating system, or executable file format.

######Features

* Handles all the commonly used file formats (ELF, PE).
* Currently supports the Intel x86, ARM, MIPS, PIC32, and PowerPC architectures.
* Can decompile to two output high-level languages: C and a Python-like language.
* Compiler and packer detection.
* Extraction and utilization of debugging information (DWARF, PDB).
* Signature-based removal of statically linked library code.
* Reconstruction of functions, high-level constructs, types, etc.
* Generation of call graphs, control-flow graphs, and various statistics.
* It is actively developed.



* * *

## Getting Started

You may install this plugin using this command:
```
$ npm install retdec
```

If you don't have a retdec API key, register here https://retdec.com/registration/ to get one

Once the plugin has been installed you must initilizate it with your API key.
```js
var rdec = require('retdect');
var retdec = rdec.apiKey('YOUR_API_KEY_HERE');
```

or

```js
var retdec = require('retdect').apiKey('YOUR_API_KEY_HERE');
```

A basic decompilation example:

```js
var retdec = require('retdect').apiKey('YOUR_API_KEY_HERE');

retdec.decompile(process.argv[2], 'bin', null, function(err, res) {
    if (err) {
        console.log('Error (' + err + '): ' + res);
        return;
    }

    console.log(res.hll.toString());
});
```

**Note** that this plugin relies on retdec official API, so outputs and arguments are defined by their API instead of by this module. For a better understanding of the API, please visit https://retdec.com/api/docs/index.html

* * *

## API


####test(echoargs, callback)

This is a simple echo test to be able to check your API key. It will return the echoargs argument in the response.

Detailed doc at: https://retdec.com/api/docs/test.html

######echoargs
Any object with any key/values is valid for echo test.

######callback
The callback to be called once the response is ready

**Sample**

```js
var retdec = require('retdect').apiKey('YOUR_API_KEY_HERE'); 	

var testing = {
    hola: 'adios',
    dos: 2
};

retdec.test(testing, function(err, res) {
    if (err) {
        console.log('Error test: ' + res);
        return;
    }

    console.log(res);
});
```

**Sample output**

```
$ node test-mine.js 
{ dos: '2', hola: 'adios' }
```

