var util = require('util');
var ref  = require('ref');
var events = require('events');

////
// I wrote a simple wrapper around the Buffer object
// This allows it to keep track of the offset
//
var MyBuffer = function(buf) {
	this.buf = buf;
  this.offset = 0;
};

MyBuffer.prototype.eof = function() {
  return this.offset >= this.buf.length;
};


MyBuffer.prototype.readChar = function(encoding) {
	var ret = this.buf.toString(encoding || 'ascii', this.offset, this.offset + 1);
  this.offset++;
  return ret;
};

/**
 * length is in character
 */
MyBuffer.prototype.toString = function(encoding, length) {
  var ret = this.buf.toString(encoding || 'ascii', this.offset, this.offset + length);
  this.offset += length;
  return ret;
};

MyBuffer.prototype.readUInt8 = function(noAssert) {
  var ret = this.buf.readUInt8(this.offset, noAssert);
  this.offset++;
  return ret;
};

MyBuffer.prototype.readUInt16BE = function(noAssert) {
  var ret = this.buf.readUInt16BE(this.offset, noAssert);
  this.offset += 2;
  return ret;
};

MyBuffer.prototype.readUInt32BE = function(noAssert) {
  var ret = this.buf.readUInt32BE(this.offset, noAssert);
  this.offset += 4;
  return ret;
};

MyBuffer.prototype.readInt32BE = function(noAssert) {
  var ret = this.buf.readInt32BE(this.offset, noAssert);
  this.offset += 4;
  return ret;
};


/**
 * This 64 bit method is supported by the ref library
 */
MyBuffer.prototype.readInt64BE = function(noAssert) {
  var ret = this.buf.readInt64BE(this.offset, noAssert);
  this.offset += 8;
  return ret;
};

MyBuffer.prototype.readUInt64BE = function(noAssert) {
  var ret = this.buf.readUInt64BE(this.offset, noAssert);
  this.offset += 8;
  return ret;
};

MyBuffer.prototype.undo = function(bytes) {
  this.offset -= bytes;
}

////
// Simple Assertion Exception

function AssertException(message) {
  this.name    = "AssertException";
  this.message = message;
};

util.inherits(AssertException, Error);
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
};

function assert(exp, message) {
  if (!exp) {
    throw new AssertException(message);
  }
}

function expect(actual, expected) {
  if (actual !== expected) {
   throw new Error("Expected " + expected + " got " + actual);
  }
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

  // TODO assert lenght is right
  assert(len == -1 || len == list.length, 'List is the wrong length');

  return {'type' : type, 'list' : list};
}

function read_object(buf) {
    var c = buf.readChar();
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
      case 'S' :
        var s = "";
        for(;;) {
          s += read_raw_string(buf, 'utf8');
          if (c == 'S')
            return s;
          c = buf.readChar();
        }

      case 'x' :
      case 'X' : assert(false, 'TODO XML');

      case 'b' :
      case 'B' : assert(false, 'TODO binary');

      case 'V' : return read_list(buf);

      case 'M' : return read_map(buf);

      case 'R' : assert(false, 'TODO ref');
      case 'r' : assert(false, 'TODO remote');

      default:
        assert(false, 'Unhandled object type');
    }  
}

function read_call(buf) {
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
  //expect(buf.readChar(), 'z');

  return {method : method, arguments: arguments};
}

/*
while (! buf.eof() ) {

  console.log ( hessian )

  var c = buf.readChar();
  switch (c) {
    case 'c' : // Call
      var call = read_call(buf);

      console.log( call );
      console.log( call.arguments )
      break;
    default:
      assert(false, 'unhandled type ' + c);
  }
}
*/

exports.parse = function(buf) {
  buf = new MyBuffer(buf);

  var c = buf.readChar();
  switch (c) {
    case 'c' : // Call
      return read_call(buf);

    default:
      assert(false, 'unhandled type ' + c);
  }

}

Eventer = function(){
  events.EventEmitter.call(this);
  //this.emit('call', call);
 };
util.inherits(Eventer, events.EventEmitter);

var eventer = new Eventer();

eventer.on('call', function(data) {
  console.log( data.method );
  console.log( data.arguments )
});

eventer.on('reply', function(data) {

});

eventer.on('fault', function(data) {

});
