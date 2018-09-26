"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n  type A = {a: number};\n  type B = {b: string};\n\n  type C = {...A, ...B};\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const A = t.type(\"A\", t.object(t.property(\"a\", t.number())));\n  const B = t.type(\"B\", t.object(t.property(\"b\", t.string())));\n  const C = t.type(\"C\", t.object(...A.properties, ...B.properties));\n";