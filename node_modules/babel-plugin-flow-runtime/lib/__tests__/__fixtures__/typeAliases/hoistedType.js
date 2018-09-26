"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type B = A;\n  type A = string;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const B = t.type(\"B\", t.tdz(() => A, \"A\"));\n  const A = t.type(\"A\", t.string());\n";