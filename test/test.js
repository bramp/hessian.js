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

var testFile = 'testdata/MOs';
fs.readFile(testFile, function (err, buf) {
	if (err) throw err;

	parser.parse(buf);

});
