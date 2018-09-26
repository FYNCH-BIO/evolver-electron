"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\nfunction* oneTwoThree (): Iterable<number> {\n  yield 1;\n}\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nfunction* oneTwoThree() {\n  const _yieldType = t.number();\n  yield _yieldType.assert(1);\n}\n\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nfunction* oneTwoThree() {\n  yield 1;\n}\n\nt.annotate(oneTwoThree, t.function(t.return(t.ref(\"Iterable\", t.number()))));\n";