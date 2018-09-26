"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  let demo: string = \"hello world\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let _demoType = t.string(), demo = _demoType.assert(\"hello world\");\n";