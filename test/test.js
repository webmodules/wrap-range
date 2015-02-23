
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

  it('should wrap a Range that is `collapsed`', function () {
    div = document.createElement('div');
    div.innerHTML = 'Hello World!';
    document.body.appendChild(div);

    // set up "collapsed" Range
    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.firstChild, 1);

    // sanity check, ensure Range is properly set up
    assert(range.collapsed);

    var bNodes = wrap(range, 'b');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, 'H<b>\u200B</b>ello World!');

    // test the return value
    assert.equal(bNodes.length, 1);
    var b = bNodes[0];
    assert.equal(b.nodeName, 'B');
    assert.equal(b.innerHTML, '\u200B');

    // test that the inner TextNode is selected in the `Range`
    assert.equal(b.parentNode, div);
    assert.equal(range.startContainer.parentNode, b);
    assert.equal(range.startOffset, 0);
    assert.equal(range.endContainer.parentNode, b);
    assert.equal(range.endOffset, 1);
  });

  it('should wrap a Range that crosses DOM boundaries', function () {
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

    var uNodes = wrap(range, 'u');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<b>H<u>el<i>lo</i></u><i> World</i>!</b>');

    // test the return value
    assert.equal(uNodes.length, 1);
    var u = uNodes[0];
    assert.equal(u.innerHTML, 'el<i>lo</i>');

    // test that the `U` DOM element is selected in the `Range`
    assert.equal(u.parentNode, b);
    assert.equal('ello', range.toString());
  });

  it('should wrap a Range that crosses block-level elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>hello</p><p><i>world</i></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 3);
    range.setEnd(div.lastChild.firstChild.firstChild, 2);

    // sanity check, ensure Range is properly set up
    assert(!range.collapsed);
    assert.equal(range.toString(), 'lowo');

    var strongNodes = wrap(range, 'strong');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<p>hel<strong>lo</strong></p><p><i><strong>wo</strong>rld</i></p>');

    // test the return value
    assert.equal(strongNodes.length, 2);

    // test that the `STRONG` DOM elements are selected in the `Range`
    assert.equal(range.toString(), 'lowo');
  });

  it('should wrap a Range that crosses multiple block-level elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><u>foo</u></p><p><strong>b</strong>ar</p><p>baz</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 2);
    range.setEnd(div.lastChild.firstChild, 2);
    assert.equal(range.toString(), 'obarba');

    var emNodes = wrap(range, 'em');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<p><u>fo<em>o</em></u></p><p><em><strong>b</strong>ar</em></p><p><em>ba</em>z</p>');

    // test the return value
    assert.equal(emNodes.length, 3);

    // test that the `EM` DOM elements are selected in the `Range`
    assert.equal(range.toString(), 'obarba');
  });

  it('should wrap a Range that crosses multiple LI elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<ol><li>one</li><li>two</li></ol>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 2);
    range.setEnd(div.firstChild.lastChild.firstChild, 2);
    assert.equal(range.toString(), 'etw');

    var strongNodes = wrap(range, 'strong');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<ol><li>on<strong>e</strong></li><li><strong>tw</strong>o</li></ol>');

    // test the return value
    assert.equal(strongNodes.length, 2);

    // test that the `STRONG` DOM elements are selected in the `Range`
    assert.equal(range.toString(), 'etw');
  });

  it('should wrap a Range that crosses multiple "void" elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>foo</p><p><img src="#"></p><p><br></p><p>bar</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 2);
    range.setEnd(div.lastChild.firstChild, 2);
    assert.equal(range.toString(), 'oba');

    var delNodes = wrap(range, 'del');

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<p>fo<del>o</del></p><p><del><img src="#"></del></p><p><del><br></del></p><p><del>ba</del>r</p>');

    // test the return value
    assert.equal(delNodes.length, 4);

    // test that the `DEL` DOM elements are selected in the `Range`
    assert.equal(range.toString(), 'oba');
  });

  it('should allow a custom `createElement` function', function () {
    var count = 0;

    function createElement () {
      count++;

      var a = document.createElement('a');
      a.href = 'http://n8.io';
      return a;
    }

    div = document.createElement('div');
    div.innerHTML = '<p>foo</p><p>bar</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 2);
    range.setEnd(div.lastChild.firstChild, 2);
    assert.equal(range.toString(), 'oba');

    var nodes = wrap(range, createElement, document);

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, '<p>fo<a href="http://n8.io">o</a></p>' +
                                '<p><a href="http://n8.io">ba</a>r</p>');

    // test the return value
    assert.equal(nodes.length, 2);

    // test that the `A` DOM elements are selected in the `Range`
    assert.equal(range.toString(), 'oba');

    assert.equal(2, count);
  });

});
