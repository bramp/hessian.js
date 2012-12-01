var fs   = require('fs');
var hessian = require('../lib/hessian.js');

var testFile = 'testdata/MOs';
fs.readFile(testFile, function (err, buf) {
	if (err) throw err;
	console.log(buf);

	hessian.parse( buf, function(obj, offset) {
		console.log (obj);
	} ); /* .on('error', ...) */


});
