
1.0.1 / 2014-10-01
==================

 * index: use "range-extract-contents" module
 * add `.gitignore` file

1.0.0 / 2014-10-01
==================

 * README++
 * package: add "browser" as a keyword
 * update "description"
 * refactor to iterate over TextNode elements within the Range
 * now returns an Array of HTMLElements, instead of a single HTMLElement

0.0.3 / 2014-09-11
==================

 * add README.md
 * add Travis-CI + Saucelabs testing
 * package: use `make test` for `npm test`
 * index: add support and test for Range that spans across multiple block-level elements
 * index: add basic handling for Ranges that cross block-level boundaries
 * index: add debug() calls
 * index: use "range-insert-node" module
 * test: attempt to fix Opera/IE

0.0.2 / 2014-07-25
==================

 * index: insert a 0-width space char when Range is collapsed
 * index: select node contents when not collapsed

0.0.1 / 2014-07-25
==================

 * index: add explicit `range.collapsed` support
 * test: add test.js file
 * initial commit
