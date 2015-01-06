
/**
 * Module dependencies.
 */

var closest = require('component-closest');
var normalize = require('range-normalize');
var getDocument = require('get-document');
var insertNode = require('range-insert-node');
var extractContents = require('range-extract-contents');
var RangeIterator = require('range-iterator');

// create a CSS selector string from the "block elements" array
var blockSel = ['li'].concat(require('block-elements')).join(', ');

var debug = require('debug')('wrap-range');

/**
 * Module exports.
 */

module.exports = wrap;

/**
 * Wraps the given `range` object with a new `nodeName` DOM element.
 *
 * Based off of: http://stackoverflow.com/a/10785093/376773
 *
 * @param {Range} range - DOM Range instance to "wrap"
 * @param {String} nodeName - Name of node to create. i.e. "a" to create an <a> node
 * @param {Document} [doc] - Optional `document` object to use when creating the new DOM element
 * @return {Array<HTMLElement>} returns an array of the newly created DOM elements
 * @public
 */

function wrap (range, nodeName, doc) {
  if (!doc) doc = getDocument(range) || document;
  var createElement = typeof nodeName === 'function' ? nodeName : function () {
    return doc.createElement(nodeName);
  };

  var nodes = [];

  if (range.collapsed) {
    // for a collapsed Range, we must create a new TextNode with a 0-width space
    // character inside of it, so that we can manually select it as the contents
    // of the Range afterwards. The 0-width space char is required otherwise the
    // browser will simply skip over the newly created `node` when the user is
    // typing. Selecting the empty space char forces the browser type inside of
    // `node`.
    debug('creating new %o element', nodeName);
    var node = createElement();
    nodes.push(node);

    debug('appending 0-width space TextNode to new %o element', nodeName);
    var text = doc.createTextNode('\u200B');
    node.appendChild(text);

    insertNode(range, node);

    range.setStart(text, 0);
    range.setEnd(text, text.nodeValue.length);
  } else {
    // For a Range with any selection within it, we must iterate over the
    // TextNode instances within the Range, and figure out the parent
    // "block element" boundaries.
    // Each time a new "block" is encountered within the Range, we create a new
    // "sub-range" and wrap it with a new `nodeName` element.
    var next;
    var prevBlock;
    var first = true;
    var originalRange = range.cloneRange();
    var workingRange = range.cloneRange();
    var iterator = new RangeIterator(range)
      .revisit(false)
      .select(3 /* TEXT_NODE */);

    function doRange () {
      normalize(workingRange);
      debug('wrapping Range %o with new %o node', workingRange.toString(), nodeName);

      var node = createElement();
      nodes.push(node);

      node.appendChild(extractContents(workingRange));
      insertNode(workingRange, node);

      if (first) {
        // the first Range that we process, we must re-set the
        // "start boundary" on the passed in Range instance
        range.setStartBefore(node);
        first = false;
      }

      range.setEndAfter(node);
    }

    while (next = iterator.next()) {
      var block = closest(next, blockSel, true);

      if (prevBlock && prevBlock !== block) {
        debug('found block boundary point for %o!', prevBlock);
        workingRange.setEndAfter(prevBlock);

        doRange();

        // now we clone the original range again, since it has the
        // "end boundary" set up the way to need it still. But reset the
        // "start boundary" to point to the beginning of this new block
        workingRange = originalRange.cloneRange();
        workingRange.setStartBefore(block);
      }

      prevBlock = block;
    }

    doRange();

    // finally, normalize the passed in Range, since we've been setting
    // it on block-level boundaries so far most likely, rather then text ones
    normalize(range);
  }

  return nodes;
}
