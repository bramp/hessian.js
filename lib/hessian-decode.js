/**
 * Hessian Binary Web Service Protocol Parser
 * by Andrew Brampton (bramp.net)
 *
 * Specification:
 *  http://hessian.caucho.com/doc/hessian-1.0-spec.xtp
 *
 */

var util = require('util');
var ref  = require('ref');
var events = require('events');
var assert = require('assert');
var MyBuffer = require('./MyBuffer');


// Simple helper function
function expect(actual, expected) {
  assert(actual === expected, "Expected " + expected + " got " + actual);
}

////
// Hessian stuff starts !
//

function read_raw_string(buf, encoding) {
  var len = buf.readUInt16BE();
  return buf.toString(encoding || 'utf8', len);
}

function read_type(buf) {
  var t = buf.readChar();
  if (t !== 't') {
    buf.undo(1);
    return undefined;
  }

  return read_raw_string(buf);
}

function read_map(buf) {
  var type = read_type(buf);

  var map = {};
  var key;
  while ((key = read_object(buf)) !== undefined) {
    map[key] = read_object(buf);
  }

  return {'type' : type, 'map' : map};
}

function read_list(buf) {
  var type = read_type(buf);

  var len;
  var c = buf.readChar();
  if (c == 'l') {
    len = buf.readInt32BE(buf);
  } else {
    buf.undo(1);
  }

  var list = [];
  while ((obj = read_object(buf)) !== undefined) {
    list.push(obj);
  }

  assert(len == -1 || len == list.length, 'List is the wrong length');

  return {'type' : type, 'list' : list};
}

function read_string(buf, c, encoding) {
  c = c || buf.readChar();
  assert(c == 'S' || c == 's');

  var s = "";
  for(;;) {
    s += read_raw_string(buf, encoding || 'utf8');
    if (c == 'S')
      return s;
    c = buf.readChar();
  }
}

function read_binary(buf, c) {
  c = c || buf.readChar();
  assert(c == 'B' || c == 'b');

  var slices   = [];
  var totalLen = 0;
  for(;;) {
    var len = buf.readUInt16BE();
    totalLen += len;
    slices.push ( buf.slice(len) );
    if (c == 'B')
      return Buffer.concat(slices, totalLen);
    c = buf.readChar();
  }
}

function read_object(buf, c) {
    c = c || buf.readChar();
    switch (c) {
      case 'z' : return;
      case 'N' : return null;
      case 'T' : return true;
      case 'F' : return false;
      case 'I' : return buf.readInt32BE();
      case 'L' : return buf.readInt64BE();
      case 'D' : return buf.readDoubleBE();
      case 'd' : return new Date(buf.readUInt64BE());

      case 's' :
      case 'S' : return read_string(buf, c);

      case 'b' :
      case 'B' : return read_binary(buf, c);

      case 'V' : return read_list(buf);

      case 'M' : return read_map(buf);

      case 'x' : // TODO Add support for additional objects
      case 'X' : assert(false, 'TODO XML');

      case 'R' : assert(false, 'TODO ref');
      case 'r' : assert(false, 'TODO remote');

      default:
        assert(false, "Decoding unsupported object type '" + c + "'");
    }  
}

function read_call(buf, c) {
  c = c || buf.readChar();

  expect(c, 'c');

  expect(buf.readUInt8(), 0x00);
  expect(buf.readUInt8(), 0x01);

  // TODO headers*

  expect(buf.readChar(), 'm');

  var method = read_raw_string(buf);

  var arguments = []
  var object;
  while (object = read_object(buf)) {
    arguments.push(object);
  }

  // The last call to read_object shallows the 'z'
  expect(object, undefined);

  return {method : method, arguments: arguments};
}

function decode(buf) {
  buf = new MyBuffer.MyBuffer(buf);
  var c = buf.readChar();
  switch (c) {
    case 'c' : // Call
      return read_call(buf, c);

    case 'r' : // Reply
      assert(false, "TODO Implement reply");
      return read_reply(buf);

    default:
      return read_object(buf, c);
  }
}

// New EventEmitter Hessian Parser
var HessianParser = function(buf) {}
util.inherits(HessianParser, events.EventEmitter);

HessianParser.prototype.decode = function(buf) {
  assert(Buffer.isBuffer(buf));

  
  if (!this.buf) {
    // No buf, lets create a new one
    this.buf = new MyBuffer.MyBuffer(buf);
  } else {
    // We already have a buf, lets append
    this.buf.append(buf);
  }

  var buf = this.buf;
  
  try {

    while (!buf.eof()) {
      var start = buf.offset;
      var c = buf.readChar();
      switch (c) {
        case 'c' : // Call
          var obj = read_call(buf, c);
          this.emit('call', obj, buf.offset );
          break;

        case 'r' : // Reply
          assert(false, "TODO Implement reply");
          var obj = read_reply(buf);
          this.emit('reply', obj, buf.offset );
          break;

        default:
          // Non-standard, but sometimes we just want to decode data, not a method call
          var obj = read_object(buf, c);
          this.emit('object', obj, buf.offset );
      }
    }
    this.buf = undefined;

  } catch (err) {
    if (err instanceof MyBuffer.OutOfBytesError) {
      // This is ok, it just means we tried to parse a unfinished object
      // lets rollback
      buf.seek(start);
    } else {
      this.emit('error', err );
    }
  }
}

exports.HessianParser = HessianParser;
exports.decode = decode;
