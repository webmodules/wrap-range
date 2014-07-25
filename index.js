
/**
 * Module dependencies.
 */

var getDocument = require('get-document');

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
  var node = doc.createElement(nodeName);

  if (range.collapsed) {
    // for a collapsed Range, we must create a new empty TextNode, so that
    // we can manually select it as the contents of the Range afterwards
    node.appendChild(doc.createTextNode(''));
    range.insertNode(node);
    range.setStart(node.firstChild, 0);
    range.setEnd(node.firstChild, 0);
  } else {
    // if there is some selected contents inside the Range, then we must
    // "extract" the contents of the Range followed by inserting the wrapper
    // into the Range (which subsequently inserts into the DOM).
    node.appendChild(range.extractContents());
    range.insertNode(node);
  }

  return node;
}
