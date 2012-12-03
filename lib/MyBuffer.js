////
// Simple wrapper around the Buffer object
// This allows it to keep track of the offset
// By Andrew Brampton (bramp.net) 2012
//
var ref  = require('ref'); // Support 64bit ints
var util = require('util');

var MyBuffer = function(buf) {
	this.buf = buf;
  this.offset = 0;
};

function OutOfBytesError(missing) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.missing = missing;
}
util.inherits(OutOfBytesError, Error);

MyBuffer.prototype.eof = function() {
  return this.offset >= this.buf.length;
};

MyBuffer.prototype.checkLength = function(need) {
  var remaining = this.buf.length - this.offset;
  if (remaining < need) {
    throw new OutOfBytesError(need - remaining);
  }
}

MyBuffer.prototype.readChar = function(encoding) {
  this.checkLength(1);
	var ret = this.buf.toString(encoding || 'ascii', this.offset, this.offset + 1);
  this.offset++;
  return ret;
};

/**
 * length is in character
 */
MyBuffer.prototype.toString = function(encoding, length) {
  this.checkLength(length); // TODO chars vs bytes!
  var ret = this.buf.toString(encoding || 'ascii', this.offset, this.offset + length);
  this.offset += length;
  return ret;
};

MyBuffer.prototype.readUInt8 = function(noAssert) {
  this.checkLength(1);
  var ret = this.buf.readUInt8(this.offset, noAssert);
  this.offset++;
  return ret;
};

MyBuffer.prototype.readUInt16BE = function(noAssert) {
  this.checkLength(2);
  var ret = this.buf.readUInt16BE(this.offset, noAssert);
  this.offset += 2;
  return ret;
};

MyBuffer.prototype.readUInt32BE = function(noAssert) {
  this.checkLength(4);
  var ret = this.buf.readUInt32BE(this.offset, noAssert);
  this.offset += 4;
  return ret;
};

MyBuffer.prototype.readInt32BE = function(noAssert) {
  this.checkLength(4);
  var ret = this.buf.readInt32BE(this.offset, noAssert);
  this.offset += 4;
  return ret;
};


/**
 * This 64 bit method is supported by the ref library
 */
MyBuffer.prototype.readInt64BE = function(noAssert) {
  this.checkLength(8);
  var ret = this.buf.readInt64BE(this.offset, noAssert);
  this.offset += 8;
  return ret;
};

MyBuffer.prototype.readUInt64BE = function(noAssert) {
  this.checkLength(8);
  var ret = this.buf.readUInt64BE(this.offset, noAssert);
  this.offset += 8;
  return ret;
};

MyBuffer.prototype.slice = function(length) {
  this.checkLength(length);
  var ret = this.buf.slice(this.offset, this.offset + length);
  this.offset += length;
  return ret;
}

MyBuffer.prototype.undo = function(bytes) {
  this.offset -= bytes;
}

MyBuffer.prototype.seek = function(offset) {
  this.offset = offset;
}

MyBuffer.prototype.append = function(buf) {
  this.buf = Buffer.concat([this.buf, buf]);
}


exports.MyBuffer = MyBuffer;
exports.OutOfBytesError = OutOfBytesError;
