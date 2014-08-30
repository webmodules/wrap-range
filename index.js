
/**
 * Module dependencies.
 */

var query = require('component-query');
var getDocument = require('get-document');
var prependChild = require('prepend-child');
var insertNode = require('range-insert-node');
var blockSel = require('block-elements').join(', ');
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
 * @return {DOMElement} returns the newly created DOM element
 * @public
 */

function wrap (range, nodeName, doc) {
  if (!doc) doc = getDocument(range) || document;

  debug('creating new %o element', nodeName);
  var node = doc.createElement(nodeName);

  if (range.collapsed) {
    // for a collapsed Range, we must create a new TextNode with a 0-width space
    // character inside of it, so that we can manually select it as the contents
    // of the Range afterwards. The 0-width space char is required otherwise the
    // browser will simply skip over the newly created `node` when the user is
    // typing. Selecting the empty space char forces the browser type inside of
    // `node`.
    debug('appending 0-width space TextNode to new %o element', nodeName);
    var text = doc.createTextNode('\u200B');
    node.appendChild(text);

    insertNode(range, node);

    range.setStart(text, 0);
    range.setEnd(text, text.nodeValue.length);
  } else {
    // if there is some selected contents inside the Range, then we must
    // "extract" the contents of the Range followed by inserting the wrapper
    // into the Range (which subsequently inserts into the DOM).
    var fragment = range.extractContents();
    var blocks = query.all(blockSel, fragment);

    if (blocks.length) {
      debug('Range contains %o block-level elements, transferring contents to new %o elements', blocks.length, nodeName);
      var b;
      for (var i = 0; i < blocks.length; i++) {
        b = blocks[i];
        while (b.firstChild) {
          node.appendChild(b.firstChild);
        }
        b.appendChild(node);

        node = doc.createElement(nodeName);
      }

      // append left-most block children into *before* block node
      var before = range.startContainer.childNodes[range.startOffset - 1];
      b = blocks[0];
      while (b.firstChild) {
        before.appendChild(b.firstChild);
      }

      // prepend right-most block children into *after* block node
      var after = range.endContainer.childNodes[range.endOffset];
      b = blocks[blocks.length - 1];
      while (b.lastChild) {
        prependChild(after, b.lastChild);
      }

    } else {
      debug('appending Range selected contents to new %o element', nodeName);
      node.appendChild(fragment);
      insertNode(range, node);
      range.selectNodeContents(node);
    }
  }

  return node;
}
