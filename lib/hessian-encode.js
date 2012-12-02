/**
 * Hessian Binary Web Service Protocol Encoder
 * by Andrew Brampton (bramp.net)
 *
 * Specification:
 *  http://hessian.caucho.com/doc/hessian-1.0-spec.xtp
 *
 */
var assert = require('assert');
var BufferBuilder = require('buffer-builder');

BufferBuilder.prototype.appendUInt64BE = function(i) {
	var buf = new Buffer(8);
	buf.writeUInt64BE(i);
	this.appendBuffer(buf);
}

function encode(buf, obj) {
	var t = typeof obj;
	if (t == 'object') {
		if (obj == null) {
			encode_null(buf);
		} else if (obj instanceof Date) {
			encode_date(buf, obj);
		} else if (Buffer.isBuffer(obj)) {
			encode_binary(buf, obj);
		} else if ('map' in obj) {
			encode_map(buf, obj);
		} else if ('list' in obj) {
			encode_list(buf, obj);
		} else {
			console.log(obj);
			assert(false, 'Encoding unsupported object');
		}
	} else if (t == 'number') {
		encode_number(buf, obj);

	} else if (t == 'string') {
		encode_string(buf, obj);

	} else if (t == 'boolean') {
		encode_boolean(buf, obj);

	} else {
		assert(false, 'Encoding unsupported type ' + typeof obj);
	}
}

function encode_date(buf, obj) {
	assert(obj instanceof Date);
	buf.appendString('d');
	buf.appendUInt64BE(obj.getTime())
}


function encode_boolean(buf, obj) {
	buf.appendString(obj ? 'T' : 'F');
}

function encode_null(buf) {
	buf.appendString('N');
}

function encode_binary(buf, obj) {
	assert(Buffer.isBuffer(obj));
	assert(obj.length < 65536); // TODO Encode multiple chunks

	buf.appendString('B');
	buf.appendUInt16BE(obj.length);
	buf.appendBuffer(obj);
}

function encode_raw_string(buf, string, encoding) {
	assert(string.length < 65536);
	buf.appendUInt16BE(string.length);
	buf.appendString(string, encoding || 'utf8');
}

function encode_string(buf, string, encoding) {
	// TODO Encode multiple chunks
	buf.appendString('S');
	encode_raw_string(buf, string, 'utf8');
}

function encode_number(buf, number) {
	// TODO Encode different types
	if (number >= -2147483648 || number <= 2147483647) {
		buf.appendString('I');
		buf.appendInt32BE(number);
	} else {
		assert(false, "Unsupported number " + number);
	}

}

function encode_type(buf, type) {
	buf.appendString('t');
	encode_raw_string(buf, type);
}

function encode_map(buf, obj) {
	buf.appendString('M');

	if ('type' in obj) {
		encode_type(buf, obj.type);
	}

	var map = obj.map;
	for (key in map) {
		encode(buf, key);
		encode(buf, map[key]);
	}

	buf.appendString('z');
}

function encode_list(buf, obj) {
	assert('list' in obj);

	buf.appendString('V');

	if ('type' in obj) {
		encode_type(buf, obj.type);
	}
	
	var list = obj.list;
	assert(Array.isArray(list));

	buf.appendString('l');
	buf.appendUInt32BE(list.length);

	for (var i = 0; i < list.length; i++) {
		encode(buf, list[i]);
	}

	buf.appendString('z');
}


exports.encode = function(obj) {
	var buf = new BufferBuilder();
	encode(buf, obj);
	return buf.get();
};
