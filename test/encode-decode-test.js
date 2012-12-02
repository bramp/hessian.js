var fs   = require('fs');
var hessian = require('../lib/hessian.js');

function test(assert, obj) {
	var e = hessian.encode(obj);
	var d = hessian.decode(e);
	assert.eql(obj, d);
}

module.exports = {
	'test Number#small' : function(beforeExit, assert) {
		test(assert, 1);
	},
	'test Number#zero' : function(beforeExit, assert) {
		test(assert, 0);
	},
	'test Number#neg' : function(beforeExit, assert) {
		test(assert, -1);
	},
};


//