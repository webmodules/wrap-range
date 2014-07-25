
var assert = require('assert');
var wrap = require('../');


describe('wrap-range', function () {
  var div;

  afterEach(function () {
    if (div) {
      // clean up...
      document.body.removeChild(div);
      div = null;
    }
  });

  it('should work with a Range that is `collapsed`', function () {
    div = document.createElement('div');
    div.innerHTML = 'Hello World!';
    document.body.appendChild(div);

    // set up "collapsed" Range
    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.firstChild, 1);
    range.collapse();

    // sanity check, ensure Range is properly set up
    assert(range.collapsed);

    var b = wrap(range, 'b');
    assert.equal(b.nodeName, 'B');
    assert.equal(b.innerHTML, '\u200B');

    // test that the inner TextNode is selected in the `Range`
    assert.equal(b.parentNode, div);
    assert.equal(range.startContainer.parentNode, b);
    assert.equal(range.startOffset, 0);
    assert.equal(range.endContainer.parentNode, b);
    assert.equal(range.endOffset, 1);
  });

  it('should work with a Range that crosses DOM boundaries', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>Hel<i>lo World</i>!</b>';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.setStart(b.firstChild, 1);
    range.setEnd(b.childNodes[1].firstChild, 2);

    // sanity check, ensure Range is properly set up
    assert.equal('ello', range.toString());
    assert(!range.collapsed);

    var u = wrap(range, 'u');
    assert.equal(u.nodeName, 'U');
    assert.equal(u.innerHTML, 'el<i>lo</i>');

    // test that the `U` DOM element is selected
    assert.equal(u.parentNode, b);
    assert.equal(range.startContainer, u);
    assert.equal(range.endContainer, u);
    assert.equal(range.commonAncestorContainer, u);
  });

});
