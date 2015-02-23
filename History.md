
1.1.1 / 2015-02-23
==================

  * index: collect the Ranges into an Array, and process them after the RangeIterator
  * index: make debug() calls better in case of a custom `createElement()` function
  * test: add a `createElement()` custom function test
  * package: allow any "zuul" v1
  * remove "void-elements" usage

1.1.0 / 2015-01-26
==================

  * index: add support for "void elements"
  * index: add support for passing in a function instead of a string `nodeName`
  * index: use "range-iterator" instead of "dom-iterator"
  * package: allow any "debug" v2
  * package: update "get-document" to v1
  * package: add "void-elements" dependency
  * package: update "zuul" to v1.16.3
  * package: update "range-normalize" to v1.0.1
  * test: better test case names

1.0.2 / 2014-12-09
==================

  * treat LI elements as block-level elements

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
