Hessian.js
==========

This is an implementation of the Hessian protocol written in JavaScript for Node  
by Andrew Brampton [http://bramp.net](bramp.net)  
Copyright 2012

Protocol reference:
-------------------
[http://hessian.caucho.com/doc/hessian-serialization.html](http://hessian.caucho.com/doc/hessian-serialization.html)

Intro
-----

Currently only reading hessian is supported, writing is not.
All valid hessian can be parsed, except for XML, Ref and Remote elements.

Install
-------

```bash
npm install hessian
```

Example
-------

```javascript
var parser = new hessian.HessianParser();

parser.on('call', function(call, offset) {
	// Will be called once for each call
});

parser.on('reply', function(reply, offset) {
	// Will be called once for each reply
});

parser.on('object', function(obj, offset) {
	// May be called multiple times
});

parser.on('error', function(err) {
	// Will only be called once on first error
});

// Now begin the parsing
parser.parse(buf);

```

TODO
----

* Finish supporting all elements
* Adding writing support
* Add reply/fault support
* Find a good set of unit tests