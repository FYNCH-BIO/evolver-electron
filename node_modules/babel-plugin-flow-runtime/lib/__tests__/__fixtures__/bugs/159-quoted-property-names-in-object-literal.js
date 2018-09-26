"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type A = {\"a\": string, \"b\": string};\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const A = t.type(\"A\", t.object(t.property(\"a\", t.string()), t.property(\"b\", t.string())));\n";