wrap-range
==========
### Wraps a DOM Range instance with the specified DOM node name

[![Sauce Test Status](https://saucelabs.com/browser-matrix/wrap-range.svg)](https://saucelabs.com/u/wrap-range)

[![Build Status](https://travis-ci.org/webmodules/wrap-range.svg?branch=master)](https://travis-ci.org/webmodules/wrap-range)


Installation
------------

``` bash
$ npm install wrap-range
```


Example
-------

``` js
var wrapRange = require('wrap-range');

// create a DIV with some content
var div = document.createElement('div');
div.innerHTML = 'hello world';

// append it to the page
document.body.appendChild(div);

// create a Range instance pointing to some of the text
var range = document.createRange();
range.setStart(div.firstChild, 1);
range.setEnd(div.firstChild, 8);

// now we can "wrap" the Range with an element node type,
// say U to underline in this case:
var u = wrap(range, 'u');
assert.equal(u.nodeName, 'U');
assert.equal(u.innerHTML, 'ello wo');

assert.equal(div.innerHTML, 'h<u>ello wo</u>rld');
```
