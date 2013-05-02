Hessian.js
==========

This is an implementation of the Hessian protocol written in JavaScript for Node  
by Andrew Brampton [http://bramp.net](bramp.net)  
Copyright 2012-2013

Protocol reference:
-------------------
[http://hessian.caucho.com/doc/hessian-serialization.html](http://hessian.caucho.com/doc/hessian-serialization.html)

Intro
-----

Reading and writing hessian is supported
All valid hessian can be parsed, except for XML, Ref and Remote elements.

Install
-------

```bash
npm install hessian
```

Example
-------

Decoding

```javascript
var parser = new hessian.HessianParser();

parser.on('call', function(call, offset) {
	// Will be called once for each call
});

parser.on('reply', function(reply, offset) {
	// Will be called once for each reply
});

parser.on('object', function(obj, offset) {
	// Will be called once for each object
});

parser.on('error', function(err) {
	// Will only be called once on first error
});

// Now begin the parsing
parser.decode(buf);

```

Encoding

```javascript
var map = { 'map' : {key: value, key2: value2} };
var list = { 'list' : [1, 2, 3] [, type: 'int'] };
var string = "string";
var int = 123;
var bool = true;
var null = null;

var buf = hessian.encode(obj);
```

TODO
----

* Finish supporting all elements
* Add reply/fault support
* Find a good set of unit tests
