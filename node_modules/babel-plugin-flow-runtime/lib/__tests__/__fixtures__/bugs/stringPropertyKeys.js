"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n\nclass Demo {\n  'test': boolean;\n}\n\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nclass Demo {\n  @t.decorate(t.boolean())\n  'test';\n}\n\n";

var annotated = exports.annotated = "\nimport t from \"flow-runtime\";\n/* @flow */\n\n@t.annotate(t.class(\"Demo\", t.property(\"test\", t.boolean())))\nclass Demo {\n  'test';\n}\n\n";