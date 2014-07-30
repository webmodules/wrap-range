
/**
 * Module dependencies.
 */

var getDocument = require('get-document');
var insertNode = require('range-insert-node');
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
    debug('appending Range selected contents to new %o element', nodeName);
    node.appendChild(range.extractContents());

    insertNode(range, node);

    range.selectNodeContents(node);
  }

  return node;
}
