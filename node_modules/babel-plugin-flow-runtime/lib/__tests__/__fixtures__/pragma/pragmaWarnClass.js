"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n/* @flow-runtime warn */\n\nclass A {\n  x: boolean = false;\n}\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n/* @flow-runtime warn */\n\nclass A {\n  @t.decorate(t.boolean(), false)\n  x = false;\n}\n";