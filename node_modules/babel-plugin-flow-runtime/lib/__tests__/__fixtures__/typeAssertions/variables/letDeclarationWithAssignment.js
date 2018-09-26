"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  let demo: string;\n  demo = \"foo bar\";\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  let _demoType = t.string(), demo;\n  demo = _demoType.assert(\"foo bar\");\n";