var fs   = require('fs');
var hessian = require('./hessian');


fs.readFile('routeMessageMt', function (err, buf) {
	if (err) throw err;
	console.log(buf);

	var obj = hessian.parse( buf );
	console.log (obj);

});
