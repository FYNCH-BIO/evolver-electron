"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n/* @flow-runtime warn */\n\ntype Demo = 123;\n\n(\"nope\": Demo);\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n/* @flow-runtime warn */\n\nconst Demo = t.type(\"Demo\", t.number(123));\n\nt.warn(Demo, \"nope\");\n";