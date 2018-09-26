"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n/* @flow-runtime */\n\nconst Demo = 123;\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n/* @flow-runtime */\n\nconst Demo = 123;\n";