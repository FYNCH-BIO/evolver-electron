"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  let demo: string = \"qux\";\n  demo = \"foo bar\";\n  demo = \"hello world\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let _demoType = t.string(), demo = _demoType.assert(\"qux\");\n  demo = _demoType.assert(\"foo bar\");\n  demo = _demoType.assert(\"hello world\");\n";