"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  declare type Demo = string;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n\n  t.declare(t.type(\"Demo\", t.string()));\n";