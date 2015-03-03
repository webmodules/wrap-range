
/**
 * Module dependencies.
 */

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
    assert.equal(bNodes.length, 1);

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, 'H<b><span class="zwsp">\u200B</span></b>ello World!');

    // test the return value
    var b = bNodes[0];
    assert.equal(b.nodeName, 'B');
    assert.equal(b.innerHTML, '<span class="zwsp">\u200B</span>');

    // test that the inner TextNode is selected in the `Range`
    assert(range.collapsed);
    assert.equal(b.parentNode, div);
    assert.equal(range.startContainer.parentNode.parentNode, b, 'startContainer parent parent is not B node');
    assert.equal(range.startOffset, 1);
    assert.equal(range.endContainer.parentNode.parentNode, b, 'endContainer parent parent is not B node');
    assert.equal(range.endOffset, 1);
  });

  it('should wrap a Range that is `collapsed` twice', function () {
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
    assert.equal(bNodes.length, 1);

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, 'H<b><span class="zwsp">\u200B</span></b>ello World!');

    var iNodes = wrap(range, 'i');
    assert.equal(iNodes.length, 1);

    // test that we have the expected HTML at this point
    assert.equal(div.innerHTML, 'H<b><i><span class="zwsp">\u200B</span></i></b>ello World!');

    // test that the inner TextNode is selected in the `Range`
    assert(range.collapsed);
    assert.equal(range.startContainer.parentNode.nodeName, 'SPAN');
    assert.equal(range.startContainer.parentNode.className, 'zwsp');
    assert.equal(range.startContainer.parentNode.parentNode.nodeName, 'I');
    assert.equal(range.startContainer.parentNode.parentNode.parentNode.nodeName, 'B');
    assert.equal(range.startOffset, 1);
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

  it('should wrap a Range that crosses 4 P elements', function () {
    div = document.createElement('div');
    document.body.appendChild(div);

    for (var i = 0; i < 100; i++) {
      div.innerHTML = '<p>1</p>' +
                      '<p>2</p>' +
                      '<p>3</p>' +
                      '<p>4</p>';

      var range = document.createRange();
      range.setStart(div.firstChild.firstChild, 0);
      range.setEnd(div.lastChild.firstChild, 1);
      assert.equal(range.toString(), '1234');

      var strongNodes = wrap(range, 'strong');

      // test that we have the expected HTML at this point
      assert.equal(div.innerHTML, '<p><strong>1</strong></p>' +
                                  '<p><strong>2</strong></p>' +
                                  '<p><strong>3</strong></p>' +
                                  '<p><strong>4</strong></p>');

      // test the return value
      assert.equal(strongNodes.length, 4);

      // test that the `STRONG` DOM elements are selected in the `Range`
      assert.equal(range.toString(), '1234');
    }
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
