"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var input = exports.input = "\n const a = {b: 123} ;\n const c: typeof a.b = 456;\n";

var expected = exports.expected = "\n  import t from \"flow-runtime\";\n  const a = { b: 123 };\n  const c = t.typeOf(a.b).assert(456);\n";