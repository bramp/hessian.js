var fs   = require('fs');
var hessian = require('../lib/hessian.js');

var parser = new hessian.HessianParser();

parser.on('object', function(obj, offset) {
	console.log (obj);
});

parser.on('call', function(call, offset) {
	console.log (call);
});

parser.on('reply', function(reply, offset) {
	console.log (reply);
});

parser.on('error', function(err) {
	console.log (err);
});

var testFile = 'testdata/subscribe-server';
fs.readFile(testFile, function (err, buf) {
	if (err) throw err;

	// Split up the buffer into lots of small buffers
	// Terrible performance, but absolutely worst case!
	for (var i = 0; i < buf.length; i++) {
		parser.decode(buf.slice(i, i+1));
	}

});
