"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n/* @flow */\n\ntype Demo = false;\n\n// $FlowFixMe\nif (true) {\n  console.log((false: true));\n}\nelse {\n  console.log((true: Demo));\n}\n";

var expected = exports.expected = "\nimport t from \"flow-runtime\";\n/* @flow */\n\nconst Demo = t.type(\"Demo\", t.boolean(false));\n\n// $FlowFixMe\nif (true) {\n  console.log(false);\n}\nelse {\n  console.log(true);\n}\n";